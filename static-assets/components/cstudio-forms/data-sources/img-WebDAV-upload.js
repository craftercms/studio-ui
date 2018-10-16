CStudioForms.Datasources.ImgWebDAVUpload = CStudioForms.Datasources.ImgWebDAVUpload ||
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

YAHOO.extend(CStudioForms.Datasources.ImgWebDAVUpload, CStudioForms.CStudioFormDatasource, {
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
    insertImageAction: function(insertCb) {
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

                var imageData = {
                    previewUrl : uri,
                    relativeUrl : uri,
                    fileExtension : fileExtension
                };

                insertCb.success(imageData);
			},

			failure: function() {
                insertCb.failure("An error occurred while uploading the image.");
            },

			context: this
		};

		CStudioAuthoring.Operations.uploadWebDAVAsset(site, path, me.profileId, callback);

	},

    getLabel: function() {
        return CMgs.format(langBundle, "WebDAV Upload Image");
    },

   	getInterface: function() {
   		return "image";
   	},

	getName: function() {
		return "img-WebDAV-upload";
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

CStudioAuthoring.Module.moduleLoaded("cstudio-forms-controls-img-WebDAV-upload", CStudioForms.Datasources.ImgWebDAVUpload);