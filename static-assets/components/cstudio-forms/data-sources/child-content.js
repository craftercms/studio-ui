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

CStudioForms.Datasources.ChildContent = function(id, form, properties, constraints) {
  this.id = id;
  this.form = form;
  this.properties = properties;
  this.constraints = constraints;
  this.selectItemsCount = -1;
  this.type = '';
  this.defaultEnableCreateNew = true;
  this.defaultEnableBrowseExisting = true;
  this.countOptions = 0;
  const i18n = CrafterCMSNext.i18n;
  this.formatMessage = i18n.intl.formatMessage;
  this.childContentDSMessages = i18n.messages.childContentDSMessages;

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
  }

  if (this.defaultEnableCreateNew) {
    this.countOptions++;
  }
  if (this.defaultEnableBrowseExisting) {
    this.countOptions++;
  }

  return this;
};

YAHOO.extend(CStudioForms.Datasources.ChildContent, CStudioForms.CStudioFormDatasource, {
  itemsAreContentReferences: true,

  createElementAction: function(control, _self, addContainerEl) {
    if (this.countOptions > 1) {
      control.addContainerEl = null;
      control.containerEl.removeChild(addContainerEl);
    }
    if (_self.type === '') {
      CStudioAuthoring.Operations.createNewContent(
        CStudioAuthoringContext.site,
        _self.processPathsForMacros(_self.repoPath),
        false,
        {
          success: function(formName, name, value) {
            control.insertItem(value, formName.item.internalName, null, null, _self.id);
            control._renderItems();
          },
          failure: function() {}
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
          success: function(contentTO, editorId, name, value) {
            control.insertItem(name, value, null, null, _self.id);
            control._renderItems();
            CStudioAuthoring.InContextEdit.unstackDialog(editorId);
          },
          failure: function() {}
        },
        [{ name: 'childForm', value: 'true' }]
      );
    }
  },

  browseExistingElementAction: function(control, _self, addContainerEl) {
    if (this.countOptions > 1) {
      control.addContainerEl = null;
      control.containerEl.removeChild(addContainerEl);
    }
    // if the browsePath property is set, use the property instead of the repoPath property
    // otherwise continue to use the repoPath for both cases for backward compatibility
    var browsePath = _self.repoPath;
    if (_self.browsePath != undefined && _self.browsePath != '') {
      browsePath = _self.browsePath;
    }
    CStudioAuthoring.Operations.openBrowse(
      '',
      _self.processPathsForMacros(browsePath),
      _self.selectItemsCount,
      'select',
      true,
      {
        success: function(searchId, selectedTOs) {
          for (var i = 0; i < selectedTOs.length; i++) {
            var item = selectedTOs[i];
            var value = item.internalName && item.internalName != '' ? item.internalName : item.uri;
            control.insertItem(item.uri, value, null, null, _self.id);
            control._renderItems();
          }
        },
        failure: function() {}
      }
    );
  },

  add: function(control, onlyAppend) {
    var CMgs = CStudioAuthoring.Messages;
    var langBundle = CMgs.getBundle('contentTypes', CStudioAuthoringContext.lang);

    var _self = this;

    var addContainerEl = control.addContainerEl ? control.addContainerEl : null;

    var datasourceDef = this.form.definition.datasources,
      newElTitle = '';

    for (var x = 0; x < datasourceDef.length; x++) {
      if (datasourceDef[x].id === this.id) {
        newElTitle = datasourceDef[x].title;
      }
    }

    if (!addContainerEl && (this.countOptions > 1 || onlyAppend)) {
      addContainerEl = document.createElement('div');
      control.containerEl.appendChild(addContainerEl);
      YAHOO.util.Dom.addClass(addContainerEl, 'cstudio-form-control-node-selector-add-container');
      control.addContainerEl = addContainerEl;
      control.addContainerEl.style.left = control.addButtonEl.offsetLeft + 'px';
      control.addContainerEl.style.top = control.addButtonEl.offsetTop + 22 + 'px';
    }

    if (this.enableCreateNew || this.defaultEnableCreateNew) {
      if (this.countOptions > 1 || onlyAppend) {
        addContainerEl.create = document.createElement('div');
        addContainerEl.appendChild(addContainerEl.create);
        YAHOO.util.Dom.addClass(addContainerEl.create, 'cstudio-form-controls-create-element');

        var createEl = document.createElement('div');
        YAHOO.util.Dom.addClass(createEl, 'cstudio-form-control-node-selector-add-container-item');
        createEl.textContent = CMgs.format(langBundle, 'createNew') + ' - ' + newElTitle;
        control.addContainerEl.create.appendChild(createEl);
        var addContainerEl = control.addContainerEl;
        YAHOO.util.Event.on(
          createEl,
          'click',
          function() {
            _self.createElementAction(control, _self, addContainerEl);
          },
          createEl
        );
      } else {
        _self.createElementAction(control, _self);
      }
    }

    if (this.enableBrowseExisting || this.defaultEnableBrowseExisting) {
      if (this.countOptions > 1 || onlyAppend) {
        addContainerEl.browse = document.createElement('div');
        addContainerEl.appendChild(addContainerEl.browse);
        YAHOO.util.Dom.addClass(addContainerEl.browse, 'cstudio-form-controls-browse-element');

        var browseEl = document.createElement('div');
        browseEl.textContent = CMgs.format(langBundle, 'browseExisting') + ' - ' + newElTitle;
        YAHOO.util.Dom.addClass(browseEl, 'cstudio-form-control-node-selector-add-container-item');
        control.addContainerEl.browse.appendChild(browseEl);
        var addContainerEl = control.addContainerEl;
        YAHOO.util.Event.on(
          browseEl,
          'click',
          function() {
            _self.browseExistingElementAction(control, _self, addContainerEl);
          },
          browseEl
        );
      } else {
        _self.browseExistingElementAction(control, _self);
      }
    }
  },

  edit: function(key, control) {
    var _self = this;
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
                control.updateEditedItem(value, _self.id);
                CStudioAuthoring.InContextEdit.unstackDialog(editorId);
              }
            }
          }
        );
      },
      failure: function() {}
    });
  },

  updateItem: function(item, control) {
    if (item.key && item.key.match(/\.xml$/)) {
      var getContentItemCb = {
        success: function(contentTO) {
          item.value = contentTO.item.internalName || item.value;
          control._renderItems();
        },
        failure: function() {}
      };

      CStudioAuthoring.Service.lookupContentItem(CStudioAuthoringContext.site, item.key, getContentItemCb);
    }
  },

  getLabel: function() {
    return this.formatMessage(this.childContentDSMessages.childContent);
  },

  getInterface: function() {
    return 'item';
  },

  getName: function() {
    return 'child-content';
  },

  getSupportedProperties: function() {
    return [
      {
        label: CMgs.format(langBundle, 'Enable Create New'),
        name: 'enableCreateNew',
        type: 'boolean',
        defaultValue: 'true'
      },
      {
        label: CMgs.format(langBundle, 'Enable Browse Existing'),
        name: 'enableBrowseExisting',
        type: 'boolean',
        defaultValue: 'true'
      },
      { label: CMgs.format(langBundle, 'repositoryPath'), name: 'repoPath', type: 'string' },
      { label: CMgs.format(langBundle, 'browsePath'), name: 'browsePath', type: 'string' },
      { label: CMgs.format(langBundle, 'defaultType'), name: 'type', type: 'string' }
    ];
  },

  getSupportedConstraints: function() {
    return [];
  }
});

CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-child-content', CStudioForms.Datasources.ChildContent);
