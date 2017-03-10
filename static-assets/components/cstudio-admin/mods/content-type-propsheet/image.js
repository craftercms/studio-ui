CStudioAdminConsole.Tool.ContentTypes.PropertyType.Image = CStudioAdminConsole.Tool.ContentTypes.PropertyType.Image ||  function(fieldName, containerEl)  {
	this.fieldName = fieldName;
	this.containerEl = containerEl;
	return this;
}

YAHOO.extend(CStudioAdminConsole.Tool.ContentTypes.PropertyType.Image, CStudioAdminConsole.Tool.ContentTypes.PropertyType, {
	render: function(value, updateFn) {
        var _self = this;
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
            YAHOO.util.Dom.addClass(uploadEl, "upload");

            controlsContainerEl.appendChild(uploadEl);

            this.containerEl.appendChild(controlsContainerEl);

            this.controlsContainerEl = controlsContainerEl;

            uploadEl.onclick = function() {
                var uploadCb = {
                    success: function(to) {
                        var imageData = to;
                        _self.createImageData(imageData,  configFilesPath +"/content-types" + CStudioAdminConsole.contentTypeSelected + "/" + to.fileName);

                        var valid = false,
                            message = "";
                        if (validExtensions.indexOf(to.fileExtension) != -1) {
                            valid = true;
                        } else {
                            message = "The uploaded file is not of type image";
                        }

                        if (valid) {
                            var image = new Image();

                            function imageLoaded(){
                                var originalWidth = this.width,
                                    originalHeight = this.height,
                                    widthConstrains = 775,
                                    heightConstrains = 767;
                                message = "The uploaded file does not meet the specified width & height constraints";

                                valid = _self.isImageValid(widthConstrains, originalWidth, heightConstrains, originalHeight);

                                if(valid){
                                    var itemURL = to.fileName;
                                    _self.valueEl.value = itemURL;
                                    _self.value = itemURL;
                                    _self.updateFn(null, _self.valueEl);
                                }else {

                                    if ((widthConstrains && originalWidth < widthConstrains)
                                        || (heightConstrains && originalHeight < heightConstrains)) {
                                        message = "Image is smaller than the constraint size";
                                        CStudioAuthoring.Operations.showSimpleDialog(
                                            "error-dialog",
                                            CStudioAuthoring.Operations.simpleDialogTypeINFO,
                                            "notification",
                                            message,
                                            null, // use default button
                                            YAHOO.widget.SimpleDialog.ICON_BLOCK,
                                            "studioDialog"
                                        );
                                    } else { //site, Message, imageData, imageWidth, imageHeight, repoImage, callback

                                        var callback =  {
                                            success: function(content) {
                                                var itemURL = content.message.internalName;
                                                _self.valueEl.value = itemURL;
                                                _self.value = itemURL;
                                                _self.updateFn(null, _self.valueEl);
                                            }
                                        }

                                        CStudioAuthoring.Operations.cropperImage(
                                            CStudioAuthoringContext.site,
                                            message,
                                            imageData,
                                            widthConstrains,
                                            heightConstrains,
                                            null,
                                            callback);

                                    }
                                }

                            };
                            image.addEventListener('load', imageLoaded, false);
                            image.addEventListener('error', function () {
                                message = "Unable to load the selected image. Please try again or select another image";
                                CStudioAuthoring.Operations.showSimpleDialog(
                                    "error-dialog",
                                    CStudioAuthoring.Operations.simpleDialogTypeINFO,
                                    "notification",
                                    message,
                                    null, // use default button
                                    YAHOO.widget.SimpleDialog.ICON_BLOCK,
                                    "studioDialog"
                                );
                            });

                            CStudioAuthoring.Operations.getImageRequest({
                                url: imageData.previewUrl,
                                image: image
                            });

                        }else {
                            CStudioAuthoring.Operations.showSimpleDialog(
                                "error-dialog",
                                CStudioAuthoring.Operations.simpleDialogTypeINFO,
                                "notification",
                                message,
                                null, // use default button
                                YAHOO.widget.SimpleDialog.ICON_BLOCK,
                                "studioDialog"
                            );
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
    },

    /**
     * create preview URL
     */
    createPreviewUrl: function(imagePath) {
        return CStudioAuthoringContext.previewAppBaseUri + imagePath + "";
    },

    createImageData: function(imageData, path){
        var url = this.createPreviewUrl(CStudioAuthoringContext.baseUri+'/api/1/services/api/1/content/get-content-at-path.bin?site=' + CStudioAuthoringContext.site +
            '&path=' + path);
        imageData.previewUrl = url;
        imageData.relativeUrl = path;
    },

    isImageValid: function(width, originalWidth, height, originalHeight) {
        var result =  true;

        var checkFn = function(value, srcValue){
            var internalResult =  true;

            if(value){
                internalResult = false;

                var obj =  (typeof value == "string") ? eval("(" + value + ")") : value;

                if(typeof obj == 'number' && obj == srcValue){
                    internalResult = true;
                }else{
                    if(obj.exact != "") {
                        if( obj.exact == srcValue ){
                            internalResult = true;
                        }
                    }else if( ( ( obj.min != "" && obj.min <= srcValue) || obj.min == "" ) &&
                        ( (obj.max != "" && obj.max >= srcValue) || obj.max == "" ) ){
                        internalResult = true;
                    }
                }
            }

            return internalResult;
        }

        result = checkFn(width, originalWidth) && checkFn(height, originalHeight);

        return result;
    }
});

CStudioAuthoring.Module.moduleLoaded("cstudio-console-tools-content-types-proptype-image", CStudioAdminConsole.Tool.ContentTypes.PropertyType.Image);