/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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
  function formatMessage(id) {
    return CrafterCMSNext.i18n.intl.formatMessage(CrafterCMSNext.i18n.messages.componentsMessages[id]);
  }

  function Components(id, form, properties, constraints) {
    this.id = id;
    this.form = form;
    this.properties = properties;
    this.constraints = constraints;
    this.selectItemsCount = -1;
    this.type = '';
    this.allowShared = false;
    this.allowEmbedded = false;
    this.enableSearch = false;
    this.enableBrowse = false;
    this.defaultBaseRepoPath = '/site/components';
    this.baseRepoPath = null;
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

  Components.prototype = {
    add: function (control) {
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

    edit: function (key, control, index) {
      const self = this;
      if (key.endsWith('.xml')) {
        self._editShared(key, control, self.id, index);
      } else {
        self._editEmbedded(key, control, self.id, index);
      }
    },

    updateItem: function (item, control) {},

    getLabel: function () {
      return formatMessage('components');
    },

    getInterface: function () {
      return 'item';
    },

    getName: function () {
      return 'components';
    },

    getSupportedProperties: function () {
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
          defaultValue: 'false',
          dependsOn: 'allowShared'
        },
        {
          label: formatMessage('enableSearch'),
          name: 'enableSearch',
          type: 'boolean',
          defaultValue: 'false',
          dependsOn: 'allowShared'
        },
        {
          label: formatMessage('baseRepositoryPath'),
          name: 'baseRepoPath',
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

    getSupportedConstraints: function () {
      return [];
    },

    _processPathsForMacros: function (path) {
      const model = this.form.model;
      return CStudioAuthoring.Operations.processPathsForMacros(path, model);
    },

    _openBrowse: function (contentType, control) {
      const path = this._processPathsForMacros(this.baseBrowsePath);
      const multiSelect = this.selectItemsCount === -1 || this.selectItemsCount > 1;
      CStudioAuthoring.Operations.openBrowseFilesDialog({
        path,
        contentTypes: [contentType],
        multiSelect,
        allowUpload: false,
        onSuccess: (result) => {
          (Array.isArray(result) ? result : [result]).forEach(({ name, path }) => {
            const value = name && name !== '' ? name : path;
            control.newInsertItem(path, value, 'shared');
            control._renderItems();
          });
        }
      });
    },

    _openSearch: function (control) {
      const searchPath = craftercms.utils.string.ensureSingleSlash(`${this.baseBrowsePath}/.+`);
      const searchContext = {
        path: searchPath,
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
        if (this.contentTypes === '*') {
          searchContext.filters['content-type'] = Object.keys(
            CrafterCMSNext.system.store.getState().contentTypes.byId
          ).filter((key) => /^\/component(s?)\//.test(key));
        } else {
          searchContext.filters['content-type'] = this.contentTypes.split(',');
        }
      }

      CStudioAuthoring.Operations.openSearch(
        searchContext,
        true,
        {
          success(searchId, selectedTOs) {
            selectedTOs.forEach(function (item) {
              const value = item.label && item.label !== '' ? item.label : item.path;
              control.newInsertItem(item.path, value, 'shared');
              control._renderItems();
            });
          },
          failure: function () {}
        },
        searchContext.searchId
      );
    },

    _openCreateAny: function (control, type) {
      CStudioAuthoring.Operations.createNewContent(
        CStudioAuthoringContext.site,
        'getAllContentType',
        false,
        {
          success: function (contentTO, editorId, name, value) {
            control.newInsertItem(name, value, type);
            control._renderItems();
          },
          failure: function () {}
        },
        true,
        type === 'embedded',
        (item) => item.type === 'component',
        this.baseRepoPath ?? this.defaultBaseRepoPath
      );
    },

    _editShared(key, control, datasource, index, callback) {
      const readonly = control.readonly;
      const action = readonly ? CStudioAuthoring.Operations.viewContent : CStudioAuthoring.Operations.editContent;

      CStudioAuthoring.Service.lookupContentItem(CStudioAuthoringContext.site, key, {
        success: function (contentTO) {
          action(
            contentTO.item.contentType,
            CStudioAuthoringContext.siteId,
            contentTO.item.mimeType,
            contentTO.item.nodeRef,
            contentTO.item.uri,
            false,
            {
              success: function (contentTO, editorId, name, value, draft, action) {
                if (control) {
                  control.updateEditedItem(
                    {
                      ...(name && { key: name, include: name }),
                      value
                    },
                    datasource,
                    index
                  );
                }
              },
              failure: function (error) {
                callback?.failure(error);
              }
            }
          );
        },
        failure: function () {}
      });
    },

    _editEmbedded(key, control, datasource, index) {
      const readonly = control.readonly;
      const self = this;
      CStudioForms.communication.sendAndAwait(key, (message) => {
        const contentType = CStudioForms.communication
          .parseDOM(message.payload)
          .querySelector('content-type').innerHTML;
        // If current component is embedded too, it'll have a parentPath url param (the path of the shared component
        // containing it), so we use that one.
        const parentPathParam = CStudioAuthoring.Utils.getQueryParameterByName('parentPath');
        const parentPath = parentPathParam !== '' ? parentPathParam : self.form.path;
        const auxParams = [
          { name: 'childForm', value: 'true' },
          { name: 'parentPath', value: parentPath }
        ];

        if (readonly) {
          auxParams.push({ name: 'readonly' });
        }
        CStudioAuthoring.Operations.performSimpleIceEdit(
          { contentType: contentType, uri: key },
          null,
          true,
          {
            success: function (contentTO, editorId, name, value) {
              if (control) {
                control.updateEditedItem({ value }, datasource, index);
              }
            }
          },
          auxParams,
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
      $option.on('click', function () {
        callback();
      });
      return $option;
    },

    _openContentTypeForm(contentType, type, control) {
      const self = this;
      const path = this.baseRepoPath ?? craftercms.utils.content.generateComponentBasePath(contentType);

      let parentPath = self.form.path;
      CStudioAuthoring.Operations.openContentWebForm(
        contentType,
        null,
        null,
        type === 'shared' ? path : '',
        false,
        false,
        {
          success: function (contentTO, editorId, name, value, draft, action) {
            control.newInsertItem(name, value, type);
            control._renderItems();
          },
          failure: function () {}
        },
        [
          { name: 'childForm', value: 'true' },
          { name: 'parentPath', value: parentPath }
        ],
        null,
        type === 'embedded' ? true : null
      );
    },

    _getContentTypeName(contentType) {
      return CrafterCMSNext.util.string.capitalize(contentType.replace('/component/', '').replace(/-/g, ' '));
    }
  };

  CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-components', Components);
})();
