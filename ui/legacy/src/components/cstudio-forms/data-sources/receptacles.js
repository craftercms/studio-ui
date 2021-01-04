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

(function() {
  function formatMessage(id) {
    return CrafterCMSNext.i18n.intl.formatMessage(CrafterCMSNext.i18n.messages.receptaclesMessages[id]);
  }

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

    properties.forEach((prop) => {
      if (prop.value) {
        if (prop.type === 'boolean') {
          this[prop.name] = prop.value === 'true';
        } else {
          this[prop.name] = prop.value;
        }
      }
    });

    return this;
  }

  Receptacles.prototype = {
    add: function(control) {
      const self = this;
      if (this.contentTypes) {
        this.contentTypes.split(',').forEach((contentType) => {
          if (contentType !== '*') {
            self._createContentTypesControls(contentType, control);
          } else {
            let sharedMessage = formatMessage('createNewShared');
            let embeddedMessage = formatMessage('createNewEmbedded');
            $(control.$dropdownMenu).append(
              self._createOption(sharedMessage, () => {
                self._openCreateAny(control, 'shared');
              })
            );
            $(control.$dropdownMenu).append(
              self._createOption(embeddedMessage, () => {
                self._openCreateAny(control, 'embedded');
              })
            );
          }
        });
      }
      if (this.allowShared && this.enableSearch) {
        let message = formatMessage('searchExisting');
        $(control.$dropdownMenu).append(
          self._createOption(message, () => {
            self._openSearch(control);
          })
        );
      }
    },

    edit: function(key, control) {
      const self = this;
      if (key.endsWith('.xml')) {
        self._editShared(key, control);
      } else {
        self._editEmbedded(key, control);
      }
    },

    updateItem: function(item, control) {},

    getLabel: function() {
      return formatMessage('receptacles');
    },

    getInterface: function() {
      return 'item';
    },

    getName: function() {
      return 'receptacles';
    },

    getSupportedProperties: function() {
      return [
        {
          label: formatMessage('allowShared'),
          name: 'allowShared',
          type: 'boolean',
          defaultValue: 'true'
        },
        {
          label: formatMessage('allowEmbedded'),
          name: 'allowEmbedded',
          type: 'boolean',
          defaultValue: 'true'
        },
        {
          label: formatMessage('enableBrowse'),
          name: 'enableBrowse',
          type: 'boolean',
          defaultValue: 'false'
        },
        {
          label: formatMessage('enableSearch'),
          name: 'enableSearch',
          type: 'boolean',
          defaultValue: 'false'
        },
        {
          label: formatMessage('baseRepositoryPath'),
          name: 'baseRepositoryPath',
          type: 'string',
          defaultValue: '/site/components'
        },
        {
          label: formatMessage('baseBrowsePath'),
          name: 'baseBrowsePath',
          type: 'string',
          defaultValue: '/site/components'
        },
        { label: formatMessage('contentTypes'), name: 'contentTypes', type: 'contentTypes' },
        { label: formatMessage('tags'), name: 'tags', type: 'string' }
      ];
    },

    getSupportedConstraints: function() {
      return [];
    },

    _openBrowse: function(contentType, control) {
      const path = `${this.baseBrowsePath}/${contentType.replace(/\//g, '_').substr(1)}`;
      CStudioAuthoring.Operations.openBrowse('', path, -1, 'select', true, {
        success: function(searchId, selectedTOs) {
          for (let i = 0; i < selectedTOs.length; i++) {
            let item = selectedTOs[i];
            let value = item.internalName && item.internalName !== '' ? item.internalName : item.uri;
            control.newInsertItem(item.uri, value, 'shared');
            control._renderItems();
          }
        },
        failure: function() {}
      });
    },

    _openSearch: function(control) {
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
        mode: 'select' // open search not in default but in select mode
      };

      if (this.contentTypes) {
        searchContext.filters['content-type'] = this.contentTypes.split(',');
      }

      CStudioAuthoring.Operations.openSearch(
        searchContext,
        true,
        {
          success(searchId, selectedTOs) {
            selectedTOs.forEach(function(item) {
              const value = item.label && item.label !== '' ? item.label : item.path;
              control.newInsertItem(item.path, value, 'shared');
              control._renderItems();
            });
          },
          failure: function() {}
        },
        searchContext.searchId
      );
    },

    _openCreateAny: function(control, type) {
      CStudioAuthoring.Operations.createNewContent(
        CStudioAuthoringContext.site,
        'getAllContentType',
        false,
        {
          success: function(contentTO, editorId, name, value) {
            control.newInsertItem(name, value, type);
            control._renderItems();
          },
          failure: function() {}
        },
        true,
        type === 'embedded',
        (item) => item.type === 'component',
        this.baseRepoPath
      );
    },

    _editShared(key, control) {
      CStudioAuthoring.Service.lookupContentItem(CStudioAuthoringContext.site, key, {
        success: function(contentTO) {
          CStudioAuthoring.Operations.editContent(
            contentTO.item.contentType,
            CStudioAuthoringContext.siteId,
            contentTO.item.mimeType,
            contentTO.item.nodeRef,
            contentTO.item.uri,
            false,
            {
              success: function(contentTO, editorId, name, value) {
                if (control) {
                  control.updateEditedItem(value);
                  CStudioAuthoring.InContextEdit.unstackDialog(editorId);
                }
              }
            }
          );
        },
        failure: function() {}
      });
    },

    _editEmbedded(key, control) {
      CStudioForms.communication.sendAndAwait(key, (message) => {
        const contentType = CStudioForms.communication.parseDOM(message.payload).querySelector('content-type')
          .innerHTML;
        CStudioAuthoring.Operations.performSimpleIceEdit(
          { contentType: contentType, uri: key },
          null,
          true,
          {
            success: function(contentTO, editorId, name, value) {
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

      if (self.allowEmbedded) {
        let message = `${formatMessage('createNewEmbedded')} ${self._getContentTypeName(contentType)}`;
        let type = 'embedded';
        control.$dropdownMenu.append(self._createOption(message, callback(type)));
      }

      if (self.allowShared) {
        let message = `${formatMessage('createNewShared')} ${self._getContentTypeName(contentType)}`;
        let type = 'shared';
        control.$dropdownMenu.append(self._createOption(message, callback(type)));
      }

      if (self.allowShared && self.enableBrowse) {
        let message = `${formatMessage('browseExisting')} ${self._getContentTypeName(contentType)}`;
        control.$dropdownMenu.append(
          self._createOption(message, () => {
            self._openBrowse(contentType, control);
          })
        );
      }

      function callback(type) {
        return () => {
          self._openContentTypeForm(contentType, type, control);
        };
      }
    },

    _createOption(message, callback) {
      let $option = $(`
            <li>
              <a class="cstudio-form-control-node-selector-add-container-item">${message}</a>
            </li>
          `);
      $option.on('click', function() {
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
          success: function(contentTO, editorId, name, value) {
            control.newInsertItem(name, value, type);
            control._renderItems();
            CStudioAuthoring.InContextEdit.unstackDialog(editorId);
          },
          failure: function() {}
        },
        [{ name: 'childForm', value: 'true' }],
        null,
        type === 'embedded' ? true : null
      );
    },

    _getContentTypeName(contentType) {
      return CrafterCMSNext.util.string.capitalize(contentType.replace('/component/', '').replace(/-/g, ' '));
    }
  };

  CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-receptacles', Receptacles);
})();
