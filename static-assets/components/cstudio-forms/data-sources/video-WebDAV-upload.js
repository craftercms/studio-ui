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

CStudioForms.Datasources.VideoWebDAVUpload = CStudioForms.Datasources.VideoWebDAVUpload ||
function(id, form, properties, constraints)  {
   	this.id = id;
   	this.form = form;
   	this.properties = properties;
   	this.constraints = constraints;
   	
   	for(var i=0; i<properties.length; i++) {
   		if(properties[i].name == "repoPath") {
			this.repoPath = properties[i].value;
		}
		if(properties[i].name === "profileId") {
			this.profileId = properties[i].value;
		}
   	} 
	
	return this;
}

YAHOO.extend(CStudioForms.Datasources.VideoWebDAVUpload, CStudioForms.CStudioFormDatasource, {
	itemsAreContentReferences: true,

    decreaseFormDialog: function(){
        var id = window.frameElement.getAttribute("id").split("-editor-")[1];
        if($('#ice-body').length > 0 && $($(".studio-ice-container-"+id,parent.document)[0]).height() > 212){
            $($(".studio-ice-container-"+id,parent.document)[0]).height(212);
        }
    },
	/**
	 * action called when user clicks insert file
	 */
    insertVideoAction: function(insertCb) {
		this._self = this,
			me = this;

		var site = CStudioAuthoringContext.site;
		var path = this._self.repoPath;
		var isUploadOverwrite = true;

		for(var i=0; i<this.properties.length; i++) {
			if(this.properties[i].name == "repoPath") {
				path = this.properties[i].value;

				path = this.processPathsForMacros(path);
			}
		}

		var callback = {
			success: function(fileData) {
                var uri = fileData;
                var fileExtension = fileData.split(".").pop();

                var videoData = {
                    previewUrl : uri,
                    relativeUrl : uri,
                    fileExtension : fileExtension
                };

                insertCb.success(videoData);
			},

			failure: function() {
                insertCb.failure("An error occurred while uploading the video.");
			},

			context: this
		};

		CStudioAuthoring.Operations.uploadWebDAVAsset(site, path, me.profileId, callback);
	},

    getLabel: function() {
        return CMgs.format(langBundle, "WebDAVUploadVideo");
    },

   	getInterface: function() {
   		return "video";
   	},

	getName: function() {
		return "video-WebDAV-upload";
	},

	getSupportedProperties: function() {
		return [
			{ label: CMgs.format(langBundle, "repositoryPath"), name: "repoPath", type: "string" },
			{ label: CMgs.format(langBundle, "profileId"), name: "profileId", type: "string" },
		];
	},

	getSupportedConstraints: function() {
		return [
		];
	}
});

CStudioAuthoring.Module.moduleLoaded("cstudio-forms-controls-video-WebDAV-upload", CStudioForms.Datasources.VideoWebDAVUpload);