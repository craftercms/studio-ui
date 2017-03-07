CStudioAdminConsole.Tool.ContentTypes.PropertyType.Image = CStudioAdminConsole.Tool.ContentTypes.PropertyType.Image ||  function(fieldName, containerEl)  {
	this.fieldName = fieldName;
	this.containerEl = containerEl;
	return this;
}

YAHOO.extend(CStudioAdminConsole.Tool.ContentTypes.PropertyType.Image, CStudioAdminConsole.Tool.ContentTypes.PropertyType, {
	render: function(value, updateFn) {
        var _self = this;
		// note THIS IS NOT DONE - CURRENTLY SAME AS STRING BUT
		// SHOULD SHOW LIST OF DATASOURCE THAT CAN PROVIDE TYPE IMAGE
		var containerEl = this.containerEl;
		var valueEl = document.createElement("input");
		YAHOO.util.Dom.addClass(valueEl, "content-type-property-sheet-property-value");		
		containerEl.appendChild(valueEl);
		valueEl.value = value;
		valueEl.fieldName = this.fieldName;
        this.updateFn = updateFn;

        YAHOO.util.Event.on(valueEl, 'keydown', function(evt) { YAHOO.util.Event.stopEvent(evt); }, valueEl);

        YAHOO.util.Event.on(valueEl, 'focus', function(evt) { _self.showIcons(); }, valueEl);

		if(updateFn) {
			var updateFieldFn = function(event, el) {
				updateFn(event, el);
				CStudioAdminConsole.Tool.ContentTypes.visualization.render();
			};
			
			YAHOO.util.Event.on(valueEl, 'change', updateFieldFn, valueEl);
		}
		
		this.valueEl = valueEl;
	},
	
	getValue: function() {
		return this.valueEl.value;	
	},

    showIcons: function() {
        var _self = this;
        var configFilesPath = CStudioAuthoring.Constants.CONFIG_FILES_PATH;
        var validExtensions = CStudioAuthoring.Constants.IMAGE_VALID_EXTENSIONS;
        if(this.controlsContainerEl) {
            this.controlsContainerEl.style.display = "inline";
            this.valueEl.size
        }
        else {
            var controlsContainerEl = document.createElement("div");
            YAHOO.util.Dom.addClass(controlsContainerEl, "options");

            var uploadEl = document.createElement("div");
            YAHOO.util.Dom.addClass(uploadEl, "edit");

            controlsContainerEl.appendChild(uploadEl);

            this.containerEl.appendChild(controlsContainerEl);

            this.controlsContainerEl = controlsContainerEl;

            uploadEl.onclick = function() {
                var imagePath = _self.valueEl.value;
                var uploadCb = {
                    success: function(to) {
                        var valid = false,
                            message = "";
                        if (validExtensions.indexOf(to.fileExtension) != -1) {
                            valid = true;
                        } else {
                            message = "The uploaded file is not of type image";
                        }

                        if (!valid) {
                            CStudioAuthoring.Operations.showSimpleDialog(
                                "error-dialog",
                                CStudioAuthoring.Operations.simpleDialogTypeINFO,
                                "notification",
                                message,
                                null, // use default button
                                YAHOO.widget.SimpleDialog.ICON_BLOCK,
                                "studioDialog"
                            );
                        }else {
                            var itemURL = to.fileName;
                            _self.valueEl.value = itemURL;
                            _self.value = itemURL;
                            _self.updateFn(null, _self.valueEl);
                        }
                    },

                    failure: function() {
                    }
                };

                CStudioAuthoring.Operations.uploadAsset(
                    CStudioAuthoringContext.site,
                    configFilesPath + '/content-types' + CStudioAdminConsole.contentTypeSelected,
                    "upload",
                    uploadCb);
            }
        }
    }
});

CStudioAuthoring.Module.moduleLoaded("cstudio-console-tools-content-types-proptype-image", CStudioAdminConsole.Tool.ContentTypes.PropertyType.Image);