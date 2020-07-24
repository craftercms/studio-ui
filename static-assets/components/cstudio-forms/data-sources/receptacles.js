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
  function formatMessage(id) {
    return CrafterCMSNext.i18n.intl.formatMessage(CrafterCMSNext.i18n.messages.receptaclesMessages[id]);
  }

  function Receptacles(id, form, properties, constraints) {
    var _this = this;

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
    properties.forEach(function (prop) {
      if (prop.value) {
        _this[prop.name] = prop.value;
      }
    });
    return this;
  }

  Receptacles.prototype = {
    add: function add(control) {
      var self = this;

      if (this.contentTypes) {
        this.contentTypes.split(',').forEach(function (contentType) {
          if (contentType !== '*') {
            self._createContentTypesControls(contentType, control);
          } else {
            var sharedMessage = formatMessage('createNewShared');
            var embeddedMessage = formatMessage('createNewEmbedded');
            $(control.addContainerEl).append(self._createOption(sharedMessage, function () {
              self._clearAddContainerEl(control);

              self._openCreateAny(control, 'shared');
            }));
            $(control.addContainerEl).append(self._createOption(embeddedMessage, function () {
              self._clearAddContainerEl(control);

              self._openCreateAny(control, 'embedded');
            }));
          }
        });
      }

      if (this.allowShared && this.enableSearch) {
        var message = formatMessage('searchExisting');
        $(control.addContainerEl).append(self._createOption(message, function () {
          self._clearAddContainerEl(control);

          self._openSearch(control);
        }));
      }
    },
    edit: function edit(key, control) {
      var self = this;

      if (key.endsWith('.xml')) {
        self._editShared(key, control);
      } else {
        self._editEmbedded(key, control);
      }
    },
    updateItem: function updateItem(item, control) {},
    getLabel: function getLabel() {
      return formatMessage('receptacles');
    },
    getInterface: function getInterface() {
      return 'item';
    },
    getName: function getName() {
      return 'receptacles';
    },
    getSupportedProperties: function getSupportedProperties() {
      return [{
        label: formatMessage('allowShared'),
        name: 'allowShared',
        type: 'boolean',
        defaultValue: 'true'
      }, {
        label: formatMessage('allowEmbedded'),
        name: 'allowEmbedded',
        type: 'boolean',
        defaultValue: 'true'
      }, {
        label: formatMessage('enableBrowse'),
        name: 'enableBrowse',
        type: 'boolean',
        defaultValue: 'false'
      }, {
        label: formatMessage('enableSearch'),
        name: 'enableSearch',
        type: 'boolean',
        defaultValue: 'false'
      }, {
        label: formatMessage('baseRepositoryPath'),
        name: 'baseRepositoryPath',
        type: 'string',
        defaultValue: '/site/components'
      }, {
        label: formatMessage('baseBrowsePath'),
        name: 'baseBrowsePath',
        type: 'string',
        defaultValue: '/site/components'
      }, {
        label: formatMessage('contentTypes'),
        name: 'contentTypes',
        type: 'contentTypes'
      }, {
        label: formatMessage('tags'),
        name: 'tags',
        type: 'string'
      }];
    },
    getSupportedConstraints: function getSupportedConstraints() {
      return [];
    },
    _openBrowse: function _openBrowse(contentType, control) {
      var path = "".concat(this.baseBrowsePath, "/").concat(contentType.replace(/\//g, '_').substr(1));
      CStudioAuthoring.Operations.openBrowse('', path, -1, 'select', true, {
        success: function success(searchId, selectedTOs) {
          for (var i = 0; i < selectedTOs.length; i++) {
            var item = selectedTOs[i];
            var value = item.internalName && item.internalName !== '' ? item.internalName : item.uri;
            control.newInsertItem(item.uri, value, 'shared');

            control._renderItems();
          }
        },
        failure: function failure() {}
      });
    },
    _openSearch: function _openSearch(control) {
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

      if (this.contentTypes) {
        searchContext.filters['content-type'] = this.contentTypes.split(',');
      }

      CStudioAuthoring.Operations.openSearch(searchContext, true, {
        success: function success(searchId, selectedTOs) {
          selectedTOs.forEach(function (item) {
            var value = item.internalName && item.internalName !== '' ? item.internalName : item.uri;
            control.newInsertItem(item.uri, value, 'shared');

            control._renderItems();
          });
        },
        failure: function failure() {}
      }, searchContext.searchId);
    },
    _openCreateAny: function _openCreateAny(control, type) {
      CStudioAuthoring.Operations.createNewContent(CStudioAuthoringContext.site, 'getAllContentType', false, {
        success: function success(contentTO, editorId, name, value) {
          control.newInsertItem(name, value, type);

          control._renderItems();
        },
        failure: function failure() {}
      }, true, type === 'embedded', function (item) {
        return item.type === 'component';
      }, this.baseRepoPath);
    },
    _editShared: function _editShared(key, control) {
      CStudioAuthoring.Service.lookupContentItem(CStudioAuthoringContext.site, key, {
        success: function success(contentTO) {
          CStudioAuthoring.Operations.editContent(contentTO.item.contentType, CStudioAuthoringContext.siteId, contentTO.item.uri, contentTO.item.nodeRef, contentTO.item.uri, false, {
            success: function success(contentTO, editorId, name, value) {
              if (control) {
                control.updateEditedItem(value);
                CStudioAuthoring.InContextEdit.unstackDialog(editorId);
              }
            }
          });
        },
        failure: function failure() {}
      });
    },
    _editEmbedded: function _editEmbedded(key, control) {
      CStudioForms.communication.sendAndAwait(key, function (message) {
        var contentType = CStudioForms.communication.parseDOM(message.payload).querySelector('content-type').innerHTML;
        CStudioAuthoring.Operations.performSimpleIceEdit({
          contentType: contentType,
          uri: key
        }, null, true, {
          success: function success(contentTO, editorId, name, value) {
            if (control) {
              control.updateEditedItem(value);
            }
          }
        }, [], true);
      });
    },
    _createContentTypesControls: function _createContentTypesControls(contentType, control) {
      var self = this;
      var $addContainerEl = $(control.addContainerEl);

      if (self.allowEmbedded) {
        var message = "".concat(formatMessage('createNewEmbedded'), " ").concat(self._getContentTypeName(contentType));
        var type = 'embedded';
        $addContainerEl.append(self._createOption(message, callback(type)));
      }

      if (self.allowShared) {
        var _message = "".concat(formatMessage('createNewShared'), " ").concat(self._getContentTypeName(contentType));

        var _type = 'shared';
        $addContainerEl.append(self._createOption(_message, callback(_type)));
      }

      if (self.allowShared && self.enableBrowse) {
        var _message2 = "".concat(formatMessage('browseExisting'), " ").concat(self._getContentTypeName(contentType));

        $addContainerEl.append(self._createOption(_message2, function () {
          self._clearAddContainerEl(control);

          self._openBrowse(contentType, control);
        }));
      }

      function callback(type) {
        return function () {
          self._clearAddContainerEl(control);

          self._openContentTypeForm(contentType, type, control);
        };
      }
    },
    _clearAddContainerEl: function _clearAddContainerEl(control) {
      $(control.addContainerEl).remove();
      control.addContainerEl = null;
    },
    _createOption: function _createOption(message, callback) {
      var $option = $("\n            <div class=\"cstudio-form-control-node-selector-add-container-item\">\n              ".concat(message, "\n            </div>\n          "));
      $option.on('click', function () {
        callback();
      });
      return $option;
    },
    _openContentTypeForm: function _openContentTypeForm(contentType, type, control) {
      var self = this;
      var path = "".concat(self.baseRepoPath, "/").concat(contentType.replace(/\//g, '_').substr(1));
      CStudioAuthoring.Operations.openContentWebForm(contentType, null, null, type === 'shared' ? path : '', false, false, {
        success: function success(contentTO, editorId, name, value) {
          control.newInsertItem(name, value, type);

          control._renderItems();

          CStudioAuthoring.InContextEdit.unstackDialog(editorId);
        },
        failure: function failure() {}
      }, [{
        name: 'childForm',
        value: 'true'
      }], null, type === 'embedded' ? true : null);
    },
    _getContentTypeName: function _getContentTypeName(contentType) {
      return CrafterCMSNext.util.string.capitalize(contentType.replace('/component/', '').replace(/-/g, ' '));
    }
  };
  CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-receptacles', Receptacles);
})();