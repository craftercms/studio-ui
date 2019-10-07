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

CStudioForms.Datasources.ImgRepoUpload = CStudioForms.Datasources.ImgRepoUpload ||
function(id, form, properties, constraints)  {
   	this.id = id;
   	this.form = form;
   	this.properties = properties;
   	this.constraints = constraints;
    this.useSearch = false;

    for(let property of properties)
      if(property.name === "repoPath") {
        this.repoPath = properties[i].value;
      }
      else if(property.name === "useSearch"){
        this.useSearch = properties[i].value === "true";
      }
   	} 
   		
	return this;
}

YAHOO.extend(CStudioForms.Datasources.ImgRepoUpload, CStudioForms.CStudioFormDatasource, {

    getLabel: function() {
        return CMgs.format(langBundle, "imageFromRepository");
    },
    
	/**
	 * action called when user clicks insert image
	 */
	insertImageAction: function(insertCb) {
		var _self = this;

    if (this.useSearch) {
      var searchContext = {
        searchId: null,
        itemsPerPage: 12,
        keywords: "",
        filters:  {"mime-type": ["image/jpeg", "image/png", "image/gif", "image/tiff", "image/bmp"]},
        sortBy: "internalName",      // sortBy has value by default, so numFilters starts at 1
        sortOrder: "asc",
        numFilters: 1,
        filtersShowing: 10,
        currentPage: 1,
        searchInProgress: false,
        view: "grid",
        lastSelectedFilterSelector: "",
        mode: "select"              // open search not in default but in select mode
      };

      CStudioAuthoring.Operations.openSearch(searchContext, true, {
        success: function (searchId, selectedTOs) {
          var imageData = {};
          var path = selectedTOs[0].uri;
          var url = this.context.createPreviewUrl(path);
          imageData.previewUrl = url;
          imageData.relativeUrl = path;
          imageData.fileExtension = path.substring(path.lastIndexOf(".") + 1);

          insertCb.success(imageData, true);
        },
        failure: function () {

        },
        context: _self
      }, null);
    }
    else {
      CStudioAuthoring.Operations.openBrowse("", _self.processPathsForMacros(_self.repoPath), "1", "select", true, {
        success: function(searchId, selectedTOs) {
          var imageData = {};
          var path = selectedTOs[0].uri;
          var url = this.context.createPreviewUrl(path);
          imageData.previewUrl = url;
          imageData.relativeUrl = path;
          imageData.fileExtension = path.substring(path.lastIndexOf(".")+1);

				insertCb.success(imageData, true);
			}, 
			failure: function() {

        },
        context: _self
      });
    }
	},
	
	/**
	 * create preview URL
	 */
	createPreviewUrl: function(imagePath) {
		return CStudioAuthoringContext.previewAppBaseUri + imagePath + "";
	},
	
	/**
	 * clean up preview URL so that URL is canonical
	 */
	cleanPreviewUrl: function(previewUrl) {
		var url = previewUrl;
		
		if(previewUrl.indexOf(CStudioAuthoringContext.previewAppBaseUri) != -1) {
			url =  previewUrl.substring(CStudioAuthoringContext.previewAppBaseUri.length);
			
			if(url.substring(0,1) != "/") {
				url = "/" + url;
			}
		}
		
		return url;	
	},

	deleteImage : function(path) {

	},

   	getInterface: function() {
   		return "image";
   	},

	getName: function() {
		return "img-repository-upload";
	},
	
	getSupportedProperties: function() {
		return [
			{ label: CMgs.format(langBundle, "repositoryPath"), name: "repoPath", type: "string" },
      { label: CMgs.format(langBundle, "useSearch"), name: "useSearch", type: "boolean", defaultValue: "false" }
		];
	},

	getSupportedConstraints: function() {
		return [
			{ label: CMgs.format(langBundle, "required"), name: "required", type: "boolean" },
		];
	}

});


CStudioAuthoring.Module.moduleLoaded("cstudio-forms-controls-img-repository-upload", CStudioForms.Datasources.ImgRepoUpload);