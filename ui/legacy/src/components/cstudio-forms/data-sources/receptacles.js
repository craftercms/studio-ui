/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function () {

  function Receptacles(id, form, properties, constraints) {
    this.id = id;
    this.form = form;
    this.properties = properties;
    this.constraints = constraints;
    this.type = '';
    this.allowShared = false;
    this.allowEmbedded = false;
    this.enableSearch = false;
    this.enableBrowse = false;
    this.baseRepoPath = '/site/components';
    this.baseBrowsePath = '/site/components';
    //this.countOptions = 0;
    const i18n = CrafterCMSNext.i18n;
    this.formatMessage = i18n.intl.formatMessage;
    this.messages = i18n.messages.receptaclesMessages;

    properties.forEach(prop => {
      if (prop.value) {
        this[prop.name] = prop.value;
      }
    });

    return this;
  }

  Receptacles.prototype = {

    add: function (control) {
      const self = this;
      if (this.contentTypes) {
        this.contentTypes.split(',').forEach(contentType => {
          self._createContentTypesControls(contentType, control);
        });
      }
      if (this.allowShared && this.enableSearch) {
        let message = `${self.formatMessage(self.messages.searchExisting)}`;
        $(control.addContainerEl).append(
          self._createOption(message, () => {
            self._clearAddContainerEl(control);
            self._openSearch(control);
          })
        );
      }
    },

    edit: function (key, control) {
      const self = this;
      if (key.endsWith('.xml')) {
        self._editShared(key, control);
      } else {
        self._editEmbedded(key, control);
      }
    },

    updateItem: function (item, control) {
    },

    getLabel: function () {
      return this.formatMessage(this.messages.receptacles);
    },

    getInterface: function () {
      return 'item';
    },

    getName: function () {
      return 'receptacles';
    },

    getSupportedProperties: function () {
      return [
        {
          label: this.formatMessage(this.messages.allowShared),
          name: 'allowShared',
          type: 'boolean',
          defaultValue: 'true'
        },
        {
          label: this.formatMessage(this.messages.allowEmbedded),
          name: 'allowEmbedded',
          type: 'boolean',
          defaultValue: 'true'
        },
        {
          label: this.formatMessage(this.messages.enableBrowse),
          name: 'enableBrowse',
          type: 'boolean',
          defaultValue: 'false'
        },
        {
          label: this.formatMessage(this.messages.enableSearch),
          name: 'enableSearch',
          type: 'boolean',
          defaultValue: 'false'
        },
        {
          label: this.formatMessage(this.messages.baseRepositoryPath),
          name: 'baseRepositoryPath',
          type: 'string',
          defaultValue: '/site/components'
        },
        {
          label: this.formatMessage(this.messages.baseBrowsePath),
          name: 'baseBrowsePath',
          type: 'string',
          defaultValue: '/site/components'
        },
        { label: this.formatMessage(this.messages.contentTypes), name: 'contentTypes', type: 'contentTypes' },
        { label: this.formatMessage(this.messages.tags), name: 'tags', type: 'string' }
      ];
    },

    getSupportedConstraints: function () {
      return [];
    },

    _openBrowse: function (contentType, control) {
      const path = `${this.baseBrowsePath}/${contentType.replace(/\//g, '_').substr(1)}`;
      CStudioAuthoring.Operations.openBrowse('', path, -1, 'select', true, {
        success: function (searchId, selectedTOs) {
          for (let i = 0; i < selectedTOs.length; i++) {
            let item = selectedTOs[i];
            let value = (item.internalName && item.internalName !== '') ? item.internalName : item.uri;
            control.newInsertItem(item.uri, value, 'shared');
            control._renderItems();
          }
        },
        failure: function () {
        }
      });
    },

    _openSearch: function (control) {
      const searchContext = {
        searchId: null,
        itemsPerPage: 12,
        keywords: '',
        filters: {},
        sortBy: 'internalName',
        sortOrder: 'asc',
        numFilters: 1,
        filtersShowing: 10,
        currentPage: 1,
        searchInProgress: false,
        view: 'grid',
        lastSelectedFilterSelector: '',
        mode: 'select'              // open search not in default but in select mode
      };

      CStudioAuthoring.Operations.openSearch(searchContext, true, {
        success(searchId, selectedTOs) {
          selectedTOs.forEach(function (item) {
            const value = (item.internalName && item.internalName !== '') ? item.internalName : item.uri;
            control.newInsertItem(item.uri, value, 'shared');
            control._renderItems();
          });
        },
        failure: function () {
        }
      }, searchContext.searchId);
    },

    _editShared(key, control) {
      CStudioAuthoring.Service.lookupContentItem(CStudioAuthoringContext.site, key, {
        success: function (contentTO) {
          CStudioAuthoring.Operations.editContent(
            contentTO.item.contentType,
            CStudioAuthoringContext.siteId,
            contentTO.item.uri,
            contentTO.item.nodeRef,
            contentTO.item.uri,
            false,
            {
              success: function (contentTO, editorId, name, value) {
                if (control) {
                  control.updateEditedItem(value);
                  CStudioAuthoring.InContextEdit.unstackDialog(editorId);
                }
              }
            });
        },
        failure: function () {
        }
      });
    },

    _editEmbedded(key, control) {
      CStudioForms.communication.sendAndAwait(key, (message) => {
        const contentType = CStudioForms.communication
          .parseDOM(message.payload)
          .querySelector('content-type')
          .innerHTML;
        CStudioAuthoring.Operations.performSimpleIceEdit(
          { contentType: contentType, uri: key },
          null,
          true,
          {
            success: function (contentTO, editorId, name, value) {
              if (control) {
                control.updateEditedItem(value);
              }
            }
          },
          [],
          true
        );
      });
    },

    _createContentTypesControls(contentType, control) {
      const self = this;
      const $addContainerEl = $(control.addContainerEl);

      if (self.allowEmbedded) {
        let message = `${self.formatMessage(self.messages.createNewEmbedded)} ${contentType}`;
        let type = 'embedded';
        $addContainerEl.append(
          self._createOption(message, callback(type))
        );
      }

      if (self.allowShared) {
        let message = `${self.formatMessage(self.messages.createNewShared)} ${contentType}`;
        let type = 'shared';
        $addContainerEl.append(
          self._createOption(message, callback(type))
        );
      }

      if (self.allowShared && self.enableBrowse) {
        let message = `${self.formatMessage(self.messages.browseExisting)} ${contentType}`;
        $addContainerEl.append(
          self._createOption(message, () => {
            self._clearAddContainerEl(control);
            self._openBrowse(contentType, control);
          })
        );
      }

      function callback(type) {
        return () => {
          self._clearAddContainerEl(control);
          self._openContentTypeForm(contentType, type, control);
        };
      }
    },

    _clearAddContainerEl(control) {
      $(control.addContainerEl).remove();
      control.addContainerEl = null;
    },

    _createOption(message, callback) {
      let $option = $(`
            <div class="cstudio-form-control-node-selector-add-container-item">
              ${message} 
            </div>
          `);
      $option.on('click', function () {
        callback();
      });
      return $option;
    },

    _openContentTypeForm(contentType, type, control) {
      const self = this;
      const path = `${self.baseRepoPath}/${contentType.replace(/\//g, '_').substr(1)}`;
      CStudioAuthoring.Operations.openContentWebForm(
        contentType,
        null,
        null,
        type === 'shared' ? path : '',
        false,
        false,
        {
          success: function (contentTO, editorId, name, value) {
            control.newInsertItem(name, value, type);
            control._renderItems();
            CStudioAuthoring.InContextEdit.unstackDialog(editorId);
          },
          failure: function () {
          }
        },
        [
          { name: 'childForm', value: 'true' }
        ],
        null,
        type === 'embedded' ? true : null
      );
    },

  };

  CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-receptacles', Receptacles);
})();
