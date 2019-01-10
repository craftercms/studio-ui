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

CStudioForms.Datasources.ChildContent= CStudioForms.Datasources.ChildContent ||
function(id, form, properties, constraints)  {
   	this.id = id;
   	this.form = form;
   	this.properties = properties;
   	this.constraints = constraints;
	this.selectItemsCount = -1;
	this.type = "";
   	
   	for(var i=0; i<properties.length; i++) {
   		if(properties[i].name == "repoPath") {
 			this.repoPath = properties[i].value;
   		}
   		if(properties[i].name == "browsePath") {
 			this.browsePath = properties[i].value;
   		}

		if(properties[i].name == "type"){
			this.type = (Array.isArray(properties[i].value))?"":properties[i].value;
		}
   	} 

	return this;
}

YAHOO.extend(CStudioForms.Datasources.ChildContent, CStudioForms.CStudioFormDatasource, {
	itemsAreContentReferences: true,
	
	add: function(control) {
		var CMgs = CStudioAuthoring.Messages;
		var langBundle = CMgs.getBundle("contentTypes", CStudioAuthoringContext.lang);

		var _self = this;
		
		var addContainerEl = null;

		if(!control.addContainerEl){
			addContainerEl = document.createElement("div");
			addContainerEl.create = document.createElement("div");
			addContainerEl.browse = document.createElement("div");

			addContainerEl.appendChild(addContainerEl.create);
			addContainerEl.appendChild(addContainerEl.browse);
			control.containerEl.appendChild(addContainerEl);

			YAHOO.util.Dom.addClass(addContainerEl, 'cstudio-form-control-node-selector-add-container');
			YAHOO.util.Dom.addClass(addContainerEl.create, 'cstudio-form-controls-create-element');
			YAHOO.util.Dom.addClass(addContainerEl.browse, 'cstudio-form-controls-browse-element');

			control.addContainerEl = addContainerEl;
			control.addContainerEl.style.left = control.addButtonEl.offsetLeft + "px";
			control.addContainerEl.style.top = control.addButtonEl.offsetTop + 22 + "px";
		}

		var datasourceDef = this.form.definition.datasources,
			newElTitle = '';

		for(var x = 0; x < datasourceDef.length; x++){
			if (datasourceDef[x].id == this.id){
				newElTitle = datasourceDef[x].title;
			}
		}

		var createEl = document.createElement("div");
		YAHOO.util.Dom.addClass(createEl, 'cstudio-form-control-node-selector-add-container-item');
		createEl.innerHTML = CMgs.format(langBundle, "createNew") + " - " + newElTitle;
		control.addContainerEl.create.appendChild(createEl);

		var addContainerEl = control.addContainerEl;
		YAHOO.util.Event.on(createEl, 'click', function() {
			control.addContainerEl = null;
			control.containerEl.removeChild(addContainerEl);
			if(_self.type == ""){
				CStudioAuthoring.Operations.createNewContent(
					CStudioAuthoringContext.site,
					_self.processPathsForMacros(_self.repoPath),
					false, {
						success: function(formName, name, value) {
							control.insertItem(value, formName.item.internalName);
							control._renderItems();

							//var editorId = CStudioAuthoring.Utils.getQueryVariable(location.search, 'editorId');
							//CStudioAuthoring.InContextEdit.unstackDialog(editorId);
						},
						failure: function() {
						}
					}, true);
			}else{
				CStudioAuthoring.Operations.openContentWebForm(
					_self.type,
					null,
					null,
					_self.processPathsForMacros(_self.repoPath),
					false,
					false,
					{
						success: function(contentTO, editorId, name, value) {
							control.insertItem(name, value);
							control._renderItems();
							CStudioAuthoring.InContextEdit.unstackDialog(editorId);
						},
						failure: function() {
						}
					},
					[{ name: "childForm", value: "true"}]);
			}
		}, createEl);


		var browseEl = document.createElement("div");
		browseEl.innerHTML = CMgs.format(langBundle, "browseExisting") + " - " + newElTitle;
		YAHOO.util.Dom.addClass(browseEl, 'cstudio-form-control-node-selector-add-container-item');
		control.addContainerEl.browse.appendChild(browseEl);

		var addContainerEl = control.addContainerEl;		
		YAHOO.util.Event.on(browseEl, 'click', function() {
			control.addContainerEl = null;
			control.containerEl.removeChild(addContainerEl);
			// if the browsePath property is set, use the property instead of the repoPath property
			// otherwise continue to use the repoPath for both cases for backward compatibility
			var browsePath = _self.repoPath;
			if (_self.browsePath != undefined && _self.browsePath != '') {
				browsePath = _self.browsePath;
			}
			CStudioAuthoring.Operations.openBrowse("", _self.processPathsForMacros(browsePath), _self.selectItemsCount, "select", true, {
				success: function(searchId, selectedTOs) {

					for(var i=0; i<selectedTOs.length; i++) {
						var item = selectedTOs[i];
						var value = (item.internalName && item.internalName != "")?item.internalName:item.uri;
						control.insertItem(item.uri, value);
						control._renderItems();

						// var editorId = CStudioAuthoring.Utils.getQueryVariable(location.search, 'editorId');
						// CStudioAuthoring.InContextEdit.unstackDialog(editorId);
					}
				},
				failure: function() {
				}
			});
		}, browseEl);

	},
	
	edit: function(key, control) {
		var getContentItemCb = {
			success: function(contentTO) {

				var editCallback = {
					success: function(contentTO, editorId, name, value) {
                        if(control){
                            control.updateEditedItem(value);
							CStudioAuthoring.InContextEdit.unstackDialog(editorId);
                        }

					},
					failure: function() {
					}
				}
				
				CStudioAuthoring.Operations.editContent(
					contentTO.item.contentType,
					CStudioAuthoringContext.siteId,
					contentTO.item.uri,
					contentTO.item.nodeRef,
					contentTO.item.uri,
					false,
					editCallback);	
			},
			failure: function() {
			}
		};
		
		CStudioAuthoring.Service.lookupContentItem(CStudioAuthoringContext.site, key, getContentItemCb);
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
            }

            CStudioAuthoring.Service.lookupContentItem(CStudioAuthoringContext.site, item.key, getContentItemCb);
        }
    },

    getLabel: function() {
        return CMgs.format(langBundle, "childContent");
    },

   	getInterface: function() {
   		return "item";
   	},

	getName: function() {
		return "child-content";
	},
	
	getSupportedProperties: function() {
		return [
			{ label: CMgs.format(langBundle, "repositoryPath"), name: "repoPath", type: "string" },
			{ label: CMgs.format(langBundle, "browsePath"), name: "browsePath", type: "string" },
			{ label: CMgs.format(langBundle, "defaultType"), name: "type", type: "string" }
		];
	},

	getSupportedConstraints: function() {
		return [
		];
	}

});

CStudioAuthoring.Module.moduleLoaded("cstudio-forms-controls-child-content", CStudioForms.Datasources.ChildContent);