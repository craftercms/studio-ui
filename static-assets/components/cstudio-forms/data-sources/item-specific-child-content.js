/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

CStudioForms.Datasources.ItemSpecificChildContent = function (id, form, properties, constraints) {
  this.id = id;
  this.form = form;
  this.properties = properties;
  this.constraints = constraints;
  this.selectItemsCount = -1;
  this.contentType = '';
  this.defaultEnableCreateNew = true;
  this.enableCreateNew = true;
  this.countOptions = 1;

  for (var i = 0; i < properties.length; i++) {
    if (properties[i].name === 'repoPath') {
      this.repoPath = properties[i].value;
    }

    if (properties[i].name === 'contentType') {
      this.contentType = (Array.isArray(properties[i].value)) ? '' : properties[i].value;
    }
  }
  return this;
};

YAHOO.extend(CStudioForms.Datasources.ItemSpecificChildContent, CStudioForms.CStudioFormDatasource, {
  itemsAreContentReferences: true,

  createElementAction:function(control, _self, addContainerEl){
    if(this.countOptions > 1) {
      control.addContainerEl = null;
      control.containerEl.removeChild(addContainerEl);
    }

    console.log(_self.contentType);
    if (_self.contentType === "") {
      CStudioAuthoring.Operations.createNewContent(
        CStudioAuthoringContext.site,
        _self.processPathsForMacros(_self.repoPath),
        false, {
          success: function (formName, name, value) {
            control.insertItem(value, formName.item.internalName);
            control._renderItems();
          },
          failure: function () {
          }
        }, true);
    } else {
      CStudioAuthoring.Operations.openContentWebForm(
        _self.contentType,
        null,
        null,
        _self.processPathsForMacros(_self.repoPath),
        false,
        false,
        {
          success: function (contentTO, editorId, name, value) {
            control.insertItem(name, value);
            control._renderItems();
            CStudioAuthoring.InContextEdit.unstackDialog(editorId);
          },
          failure: function () {
          }
        },
        [
          { name: "childForm", value: "true"}
        ],
        null,
        true);
    }
  },

  add: function(control) {
    var CMgs = CStudioAuthoring.Messages;
    var langBundle = CMgs.getBundle("contentTypes", CStudioAuthoringContext.lang);

    var _self = this;

    var addContainerEl = control.addContainerEl || null;

    var datasourceDef = this.form.definition.datasources,
      newElTitle = '';

    for(var x = 0; x < datasourceDef.length; x++){
      if (datasourceDef[x].id === this.id){
        newElTitle = datasourceDef[x].title;
      }
    }

    if (!addContainerEl && this.countOptions > 1) {
      addContainerEl = document.createElement("div");
      control.containerEl.appendChild(addContainerEl);
      YAHOO.util.Dom.addClass(addContainerEl, 'cstudio-form-control-node-selector-add-container');
      control.addContainerEl = addContainerEl;
      control.addContainerEl.style.left = control.addButtonEl.offsetLeft + "px";
      control.addContainerEl.style.top = control.addButtonEl.offsetTop + 22 + "px";
    }

    if (this.enableCreateNew || this.defaultEnableCreateNew) {
      if(this.countOptions > 1) {
        addContainerEl.create = document.createElement("div");
        addContainerEl.appendChild(addContainerEl.create);
        YAHOO.util.Dom.addClass(addContainerEl.create, 'cstudio-form-controls-create-element');

        var createEl = document.createElement("div");
        YAHOO.util.Dom.addClass(createEl, 'cstudio-form-control-node-selector-add-container-item');
        createEl.innerHTML = CMgs.format(langBundle, "createNew") + " - " + newElTitle;
        control.addContainerEl.create.appendChild(createEl);
        var addContainerEl = control.addContainerEl;
        YAHOO.util.Event.on(createEl, 'click', function () {
          _self.createElementAction(control, _self, addContainerEl);
        }, createEl);
      }else{
        _self.createElementAction(control, _self);
      }

    }
  },

  edit: function(key, control) {
    // editContent
    // => openContentWebForm
    // =>=> openContentWebFormWithPermission
    // =>=>=> performSimpleIceEdit
    // =>=>=>=> viewcontroller-in-context-edit.initializeContent
    // =>=>=>=>=> constructUrlWebFormSimpleEngine
    CStudioAuthoring.Service.lookupContentItem(CStudioAuthoringContext.site, key, {
      success: function(contentTO) {
        CStudioAuthoring.Operations.editContent(
          contentTO.item.contentType,
          CStudioAuthoringContext.siteId,
          contentTO.item.uri,
          contentTO.item.nodeRef,
          contentTO.item.uri,
          false,
          {
            success: function(contentTO, editorId, name, value) {
              if(control){
                control.updateEditedItem(value);
                CStudioAuthoring.InContextEdit.unstackDialog(editorId);
              }
            }
          },
          null ,
          null ,
          true);
      },
      failure: function() {}
    });
  },

  updateItem: function(item, control){
    if(item.key && item.key.match(/\.xml$/)){
      var getContentItemCb = {
        success: function(contentTO) {
          item.value =  contentTO.item.internalName || item.value;
          control._renderItems();
        },
        failure: function() {
        }
      };

      CStudioAuthoring.Service.lookupContentItem(CStudioAuthoringContext.site, item.key, getContentItemCb);
    }
  },

  getLabel: function() {
    return CMgs.format(langBundle, "itemSpecificChildContent");
  },

  getInterface: function() {
    return "item";
  },

  getName: function() {
    return "item-specific-child-content";
  },

  getSupportedProperties: function() {
    return [
      { label: CMgs.format(langBundle, "repositoryPath"), name: "repoPath", type: "string" },
      { label: CMgs.format(langBundle, "contentType"), name: "contentType", type: "string" }
    ];
  },

  getSupportedConstraints: function() {
    return [
    ];
  }

});

CStudioAuthoring.Module.moduleLoaded("cstudio-forms-controls-item-specific-child-content", CStudioForms.Datasources.ItemSpecificChildContent);
