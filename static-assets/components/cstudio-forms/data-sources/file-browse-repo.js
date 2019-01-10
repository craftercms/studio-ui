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

CStudioForms.Datasources.FileBrowseRepo= CStudioForms.Datasources.FileBrowseRepo ||
function(id, form, properties, constraints)  {
   	this.id = id;
   	this.form = form;
   	this.properties = properties;
   	this.constraints = constraints;
   	
   	for(var i=0; i<properties.length; i++) {
   		if(properties[i].name == "repoPath") {
 			this.repoPath = properties[i].value;
   		}
   	} 
	
	return this;
}

YAHOO.extend(CStudioForms.Datasources.FileBrowseRepo, CStudioForms.CStudioFormDatasource, {

	add: function(control) {
		var CMgs = CStudioAuthoring.Messages;
		var langBundle = CMgs.getBundle("contentTypes", CStudioAuthoringContext.lang);

		var _self = this;
		
		var addContainerEl = null;

		if(!control.addContainerEl){
			addContainerEl = document.createElement("div")
			addContainerEl.create = document.createElement("div");
			addContainerEl.browse = document.createElement("div");

			addContainerEl.appendChild(addContainerEl.create);
			addContainerEl.appendChild(addContainerEl.browse);
			control.containerEl.appendChild(addContainerEl);


			YAHOO.util.Dom.addClass(addContainerEl, 'cstudio-form-control-node-selector-add-container');
			YAHOO.util.Dom.addClass(addContainerEl.create, 'cstudio-form-controls-create-element');
			YAHOO.util.Dom.addClass(addContainerEl.browse, 'cstudio-form-controls-browse-element');

			control.addContainerEl = addContainerEl;
			addContainerEl.style.left = control.addButtonEl.offsetLeft + "px";
			addContainerEl.style.top = control.addButtonEl.offsetTop + 22 + "px";
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

			CStudioAuthoring.Operations.uploadAsset(CStudioAuthoringContext.site, _self.processPathsForMacros(_self.repoPath), true, {
				success: function(fileData) {
					var item = _self.processPathsForMacros(_self.repoPath) + "/" + fileData.fileName;
					control.insertItem(item, item, fileData.fileExtension, fileData.size);
					control._renderItems();
				},

				failure: function() {
				},

				context: this });
		}, createEl);

		 var browseEl = document.createElement("div");
		 browseEl.innerHTML = CMgs.format(langBundle, "browseExisting") + " - " + newElTitle;
		 YAHOO.util.Dom.addClass(browseEl, 'cstudio-form-control-node-selector-add-container-item');
		 control.addContainerEl.browse.appendChild(browseEl);

		 var addContainerEl = control.addContainerEl;		 
		 YAHOO.util.Event.on(browseEl, 'click', function() {
			control.addContainerEl = null;
			control.containerEl.removeChild(addContainerEl);

			CStudioAuthoring.Operations.openBrowse("", _self.processPathsForMacros(_self.repoPath), "-1", "select", true, {
				success: function(searchId, selectedTOs) {

					for(var i=0; i<selectedTOs.length; i++) {
						var item = selectedTOs[i];
						var fileName = item.name;
						var fileExtension = fileName.split('.').pop();
						control.insertItem(item.uri, item.uri, fileExtension);
						control._renderItems();
					}
				},
				failure: function() {
				}
			});
		}, browseEl);

	},
	
	edit: function(key) {
		var getContentItemCb = {
			success: function(contentTO) {

				var editCallback = {
					success: function() {
						// update label?
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
	
    getLabel: function() {
        return CMgs.format(langBundle, "fileBrowse");
    },

   	getInterface: function() {
   		return "item";
   	},

	getName: function() {
		return "file-browse-repo";
	},
	
	getSupportedProperties: function() {
		return [
			{ label: CMgs.format(langBundle, "repositoryPath"), name: "repoPath", type: "string" }
		];
	},

	getSupportedConstraints: function() {
		return [
		];
	}

});

CStudioAuthoring.Module.moduleLoaded("cstudio-forms-controls-file-browse-repo", CStudioForms.Datasources.FileBrowseRepo);