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

CStudioForms.Datasources.SharedContent = function (id, form, properties, constraints) {
  this.id = id;
  this.form = form;
  this.properties = properties;
  this.constraints = constraints;
  this.selectItemsCount = -1;
  this.type = '';
  this.defaultEnableCreateNew = true;
  this.defaultEnableBrowseExisting = true;
  this.defaultEnableSearchExisting = false;
  this.countOptions = 0;
  const i18n = CrafterCMSNext.i18n;
  (this.formatMessage = i18n.intl.formatMessage),
    (this.sharedContentDSMessages = i18n.messages.sharedContentDSMessages);

  for (var i = 0; i < properties.length; i++) {
    if (properties[i].name == 'repoPath') {
      this.repoPath = properties[i].value;
    }
    if (properties[i].name == 'browsePath') {
      this.browsePath = properties[i].value;
    }

    if (properties[i].name == 'type') {
      this.type = Array.isArray(properties[i].value) ? '' : properties[i].value;
    }

    if (properties[i].name === 'enableCreateNew') {
      this.enableCreateNew = properties[i].value === 'true' ? true : false;
      this.defaultEnableCreateNew = false;
      properties[i].value === 'true' ? this.countOptions++ : null;
    }

    if (properties[i].name === 'enableBrowseExisting') {
      this.enableBrowseExisting = properties[i].value === 'true' ? true : false;
      this.defaultEnableBrowseExisting = false;
      properties[i].value === 'true' ? this.countOptions++ : null;
    }

    if (properties[i].name === 'enableSearchExisting') {
      this.enableSearchExisting = properties[i].value === 'true' ? true : false;
      this.defaultEnableSearchExisting = false;
      properties[i].value === 'true' ? this.countOptions++ : null;
    }
  }

  if (this.defaultEnableCreateNew) {
    this.countOptions++;
  }
  if (this.defaultEnableBrowseExisting) {
    this.countOptions++;
  }
  if (this.defaultEnableSearchExisting) {
    this.countOptions++;
  }

  return this;
};

YAHOO.extend(CStudioForms.Datasources.SharedContent, CStudioForms.CStudioFormDatasource, {
  itemsAreContentReferences: true,

  createElementAction: function (control, _self) {
    if (_self.type === '') {
      CStudioAuthoring.Operations.createNewContent(
        CStudioAuthoringContext.site,
        _self.processPathsForMacros(_self.repoPath),
        false,
        {
          success: function (formName, name, value) {
            control.insertItem(value, formName.item.internalName, null, null, _self.id);
            control._renderItems();
          },
          failure: function () {}
        },
        true
      );
    } else {
      CStudioAuthoring.Operations.openContentWebForm(
        _self.type,
        null,
        null,
        _self.processPathsForMacros(_self.repoPath),
        false,
        false,
        {
          success: function (contentTO, editorId, name, value) {
            control.insertItem(name, value, null, null, _self.id);
            control._renderItems();
          },
          failure: function () {}
        },
        [{ name: 'childForm', value: 'true' }]
      );
    }
  },

  browseExistingElementAction: function (control, _self) {
    // if the browsePath property is set, use the property instead of the repoPath property
    // otherwise continue to use the repoPath for both cases for backward compatibility
    var browsePath = _self.repoPath;
    if (_self.browsePath != undefined && _self.browsePath != '') {
      browsePath = _self.browsePath;
    }
    const multiSelect = _self.selectItemsCount === -1 || _self.selectItemsCount > 1;
    CStudioAuthoring.Operations.openBrowseFilesDialog({
      path: _self.processPathsForMacros(browsePath),
      multiSelect,
      allowUpload: false,
      onSuccess: (result) => {
        const items = Array.isArray(result) ? result : [result];
        items.forEach(({ name, path }) => {
          const value = name && name !== '' ? name : path;
          control.newInsertItem(path, value, 'shared');
          control._renderItems();
        });
      }
    });
  },

  searchExistingElementAction: function (control, _self) {
    var searchContext = {
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

    if (this.type) {
      searchContext.filters['content-type'] = [this.type];
    }

    if (this.browsePath) {
      const path = _self.processPathsForMacros(this.browsePath);
      searchContext.path = path.endsWith('/') ? `${path}.+` : `${path}/.+`;
    }

    CStudioAuthoring.Operations.openSearch(
      searchContext,
      true,
      {
        success(searchId, selectedTOs) {
          selectedTOs.forEach(function (item) {
            const value = item.label && item.label !== '' ? item.label : item.path;
            control.insertItem(item.path, value, null, null, _self.id);
            control._renderItems();
          });
        },
        failure: function () {}
      },
      searchContext.searchId
    );
  },

  add: function (control, onlyAppend) {
    var CMgs = CStudioAuthoring.Messages;
    var langBundle = CMgs.getBundle('contentTypes', CStudioAuthoringContext.lang);

    var _self = this;

    var datasourceDef = this.form.definition.datasources,
      newElTitle = '';

    for (var x = 0; x < datasourceDef.length; x++) {
      if (datasourceDef[x].id === this.id) {
        newElTitle = datasourceDef[x].title;
      }
    }

    if (this.enableCreateNew || this.defaultEnableCreateNew) {
      if (this.countOptions > 1 || onlyAppend) {
        const create = $(
          `<li class="cstudio-form-controls-create-element"><a class="cstudio-form-control-node-selector-add-container-item">${CMgs.format(
            langBundle,
            'createNew'
          )} - ${CrafterCMSNext.util.string.escapeHTML(newElTitle)}</a></li>`
        );

        control.$dropdownMenu.append(create);

        YAHOO.util.Event.on(
          create[0],
          'click',
          function () {
            _self.createElementAction(control, _self);
          },
          create[0]
        );
      } else {
        _self.createElementAction(control, _self);
      }
    }

    if (this.enableBrowseExisting || this.defaultEnableBrowseExisting) {
      if (this.countOptions > 1 || onlyAppend) {
        const browse = $(
          `<li class="cstudio-form-controls-browse-element"><a class="cstudio-form-control-node-selector-add-container-item">${CMgs.format(
            langBundle,
            'browseExisting'
          )} - ${CrafterCMSNext.util.string.escapeHTML(newElTitle)}</a></li>`
        );

        control.$dropdownMenu.append(browse);

        YAHOO.util.Event.on(
          browse[0],
          'click',
          function () {
            _self.browseExistingElementAction(control, _self);
          },
          browse[0]
        );
      } else {
        _self.browseExistingElementAction(control, _self);
      }
    }

    if (this.enableSearchExisting || this.defaultEnableSearchExisting) {
      if (this.countOptions > 1 || onlyAppend) {
        const search = $(
          `<li class="cstudio-form-controls-search-element"><a class="cstudio-form-control-node-selector-add-container-item">${CMgs.format(
            langBundle,
            'searchExisting'
          )} - ${CrafterCMSNext.util.string.escapeHTML(newElTitle)}</a></li>`
        );

        control.$dropdownMenu.append(search);

        YAHOO.util.Event.on(
          search[0],
          'click',
          function () {
            _self.searchExistingElementAction(control, _self);
          },
          search[0]
        );
      } else {
        _self.searchExistingElementAction(control, _self);
      }
    }
  },

  edit: function (key, control, index, callback) {
    var _self = this;
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
                  _self.id,
                  index
                );
                CStudioForms.communication.sendMessage({
                  type: 'CHILD_FORM_SUCCESS',
                  payload: {
                    action: action,
                    editorId: editorId
                  }
                });
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

  updateItem: function (item, control) {
    if (item.key && item.key.match(/\.xml$/)) {
      var getContentItemCb = {
        success: function (contentTO) {
          item.value = contentTO.item.internalName || item.value;
          control._renderItems();
        },
        failure: function () {}
      };

      CStudioAuthoring.Service.lookupContentItem(CStudioAuthoringContext.site, item.key, getContentItemCb);
    }
  },

  getLabel: function () {
    return this.formatMessage(this.sharedContentDSMessages.sharedContent);
  },

  getInterface: function () {
    return 'item';
  },

  getName: function () {
    return 'shared-content';
  },

  getSupportedProperties: function () {
    return [
      {
        label: CMgs.format(langBundle, 'enableCreateNew'),
        name: 'enableCreateNew',
        type: 'boolean',
        defaultValue: 'true'
      },
      {
        label: CMgs.format(langBundle, 'enableBrowseExisting'),
        name: 'enableBrowseExisting',
        type: 'boolean',
        defaultValue: 'true'
      },
      {
        label: CMgs.format(langBundle, 'enableSearchExisting'),
        name: 'enableSearchExisting',
        type: 'boolean',
        defaultValue: 'false'
      },
      {
        label: CMgs.format(langBundle, 'repositoryPath'),
        name: 'repoPath',
        type: 'content-path-input',
        defaultValue: '/site/',
        rootPath: '/site',
        validations: {
          regex: /^\/site(\/.*)?$/
        }
      },
      {
        label: CMgs.format(langBundle, 'browsePath'),
        name: 'browsePath',
        type: 'content-path-input',
        defaultValue: '/site/',
        rootPath: '/site',
        validations: {
          regex: /^\/site(\/.*)?$/
        }
      },
      { label: CMgs.format(langBundle, 'defaultType'), name: 'type', type: 'string' }
    ];
  },

  getSupportedConstraints: function () {
    return [];
  }
});

CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-shared-content', CStudioForms.Datasources.SharedContent);
