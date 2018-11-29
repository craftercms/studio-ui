var YDom = YAHOO.util.Dom;
var YEvent = YAHOO.util.Event;

CStudioAuthoring.Dialogs = CStudioAuthoring.Dialogs || {};

/**
 * Submit to go live
 */
CStudioAuthoring.Dialogs.UploadS3Dialog = CStudioAuthoring.Dialogs.UploadS3Dialog || {

	/**
	 * initialize module
	 */
	initialize: function(config) {
	},

	/**
	 * show dialog
	 */
	showDialog: function(site, profileId, serviceUri, callback) {
        this._self = this;
        console.log('dialog');

		this.dialog = this.createDialog(site, profileId, serviceUri);

		this.site = site;
        this.profile = profileId;
		this.asPopup = true;			
		this.serviceUri = serviceUri;
		this.callback = callback;
		this.dialog.show();
		document.getElementById("cstudio-wcm-popup-div_h").style.display = "none";

        if(window.frameElement){
            var id = window.frameElement.getAttribute("id").split("-editor-")[1];
			var getFormSizeVal = getFormSize ? getFormSize : parent.getFormSize;
			var setFormSizeVal = setFormSize ? setFormSize : parent.setFormSize;
            var formSize = getFormSizeVal(id);
            if(formSize < 320){
				setFormSizeVal(320, id);
				$($(".studio-ice-container-"+id,parent.document)[0]).attr('data-decrease', true);
            }
		}
	},
	
	/**
	 * hide dialog
	 */
    closeDialog:function() {
        this.dialog.destroy();
    },

    /**
	 * create dialog
	 */
	createDialog: function(site, profileId, serviceUri) {
		var me = this;
		YDom.removeClass("cstudio-wcm-popup-div", "yui-pe-content");

		var newdiv = YDom.get("cstudio-wcm-popup-div");
		if (newdiv == undefined) {
			newdiv = document.createElement("div");
			document.body.appendChild(newdiv);
		}

		var divIdName = "cstudio-wcm-popup-div";
        var path ='test';
		newdiv.setAttribute("id",divIdName);
		newdiv.className= "yui-pe-content";
        newdiv.innerHTML = '<div class="contentTypePopupInner" id="upload-popup-inner">' +
                           '<div class="contentTypePopupContent" id="contentTypePopupContent"> ' +
                           '<div class="contentTypePopupHeader">Upload</div> ' +
						   '<div><form id="asset_upload_form">' +
                                '<div class="contentTypeOuter">'+
                                    '<div class="formDesc">Please select a file to upload</div> ' +
                                    '<div><table><tr><td><input type="hidden" name="siteId" value="' + site + '"/></td>' +
                                     /*'<td><input type="hidden" name="path" value="' + path + '"/></td></tr>' +*/
                                    '<td><input type="hidden" name="profileId" value="' + profileId + '"/></td></tr>' +
						            '<tr><td>File:</td><td><input type="file" name="file" id="uploadFileNameId"/></td></tr>' +
						            '</table></div>' +
                                '</div>' +
						        '<div class="contentTypePopupBtn"> ' +
						            '<input type="button" class="btn btn-primary cstudio-xform-button ok" id="uploadButton" value="Upload" disabled />' +
                                    '<input type="button" class="btn btn-default cstudio-xform-button" id="uploadCancelButton" value="Cancel"  /></div>' +
						        '</form></div>' +
						   '<div><div  style="visibility:hidden; margin-bottom:1.5em;" id="indicator">Uploading...</div>' + 
                           '</div> ' +
                           '</div>';
		
		document.getElementById("upload-popup-inner").style.width = "350px";
		document.getElementById("upload-popup-inner").style.height = "180px";

		 // Instantiate the Dialog
		upload_dialog = new YAHOO.widget.Dialog("cstudio-wcm-popup-div", 
								{ width : "360px",
								  height : "242px",
                                  effect:{
                                      effect: YAHOO.widget.ContainerEffect.FADE,
                                      duration: 0.25
                                  },
                                  fixedcenter : true,
								  visible : false,
								  modal:true,
								  close:false,
								  constraintoviewport : true,
								  underlay:"none"							  							
								});	
								
		// Render the Dialog
		upload_dialog.render();

        var filenameInput = document.getElementById("uploadFileNameId");
        YAHOO.util.Event.addListener(filenameInput, "change", this.uploadFileEvent);
		
		var eventParams = {
			self: this
		};

        YAHOO.util.Event.addListener("uploadButton", "click", this.uploadPopupSubmit, eventParams);
		YAHOO.util.Event.addListener("uploadCancelButton", "click", this.uploadPopupCancel);
		
		$("body").on("keyup", "#cstudio-wcm-popup-div", function(e) {
            if (e.keyCode === 27) {	// esc
                me.closeDialog();
                $("#cstudio-wcm-popup-div").off("keyup");
            }
        });

		return upload_dialog;
	},

    /**
     * event fired when the uploadFileNameId is changed
     */
    uploadFileEvent: function(event) {
        var uploadButton = document.getElementById("uploadButton");
        if(this.value != ""){
            uploadButton.disabled = false;
        }else{
            uploadButton.disabled = true;
        }

    },
		
	/**
	 * event fired when the ok is pressed - checks if the file already exists and has edit permission or not 
	 * by using the getPermissions Service call
	 */
	uploadPopupSubmit: function(event, args) {
		var path = args.self.path;
		var filename = document.getElementById("uploadFileNameId").value.replace('C:\\fakepath\\',"");
        if(filename.split("\\").length > 1){
            filename = filename.split("\\")[filename.split("\\").length-1];
        }
		var basePath = path;
            path=filename;
            
        CStudioAuthoring.Dialogs.UploadS3Dialog.uploadFile(args);

		YAHOO.util.Dom.setStyle('indicator', 'visibility', 'visible');
	},
	
   /**
	 * upload file when upload pressed
	 */
	uploadFile: function(args) {
       var serviceUri = CStudioAuthoring.Service.createServiceUri(args.self.serviceUri);
       var form = $('#asset_upload_form')[0];
       var data = new FormData(form);

       serviceUri += "&" + CStudioAuthoringContext.xsrfParameterName + "=" + CStudioAuthoringContext.xsrfToken;
       $.ajax({
           enctype: 'multipart/form-data',
           processData: false,  // Important!
           contentType: false,
           cache: false,
           type: "POST",
           url: serviceUri,
           data: data,
           success: function(item)
           {
               var r = item.item;
                   CStudioAuthoring.Dialogs.UploadS3Dialog.closeDialog();
                   if(r.fileExtension) {
                       r.fileExtension = r.fileExtension.substring(r.fileExtension.lastIndexOf(".")+1);
                   }
                   args.self.callback.success(r.url);
           },
           error: function(err){
               CStudioAuthoring.Operations.showSimpleDialog(
                   "error-dialog",
                   CStudioAuthoring.Operations.simpleDialogTypeINFO,
                   "Notification",
                   err.response.message,
                   null,
                   YAHOO.widget.SimpleDialog.ICON_BLOCK,
                   "studioDialog"
               );
           }
       });

	},
	
	/**
	 *
	 */
    overwritePopupSubmit: function (event, args) {
        var callback = {
            success: function (response) {
                var serviceUri = CStudioAuthoring.Service.createServiceUri(args.self.serviceUri);
                var form = $('#asset_upload_form')[0];
                var data = new FormData(form);

                serviceUri += "&" + CStudioAuthoringContext.xsrfParameterName + "=" + CStudioAuthoringContext.xsrfToken;

                $.ajax({
                    enctype: 'multipart/form-data',
                    processData: false,  // Important!
                    contentType: false,
                    cache: false,
                    type: "POST",
                    url: serviceUri,
                    data: data,
                    success: function (item) {
                        CStudioAuthoring.Operations.showSimpleDialog(
                            "upload-dialog",
                            CStudioAuthoring.Operations.simpleDialogTypeINFO,
                            "Notification",
                            item.response.message,
                            null,
                            YAHOO.widget.SimpleDialog.ICON_INFO,
                            "success studioDialog"
                        );
                    },
                    error: function (err) {
                        CStudioAuthoring.Dialogs.UploadS3Dialog.closeDialog();
                        args.self.callback.success(err.item);
                    }
                });

            },

            failure: function () {
            }
        };

        CStudioAuthoring.Service.deleteContentForPathService(args.self.site, args.self.path, callback);

    },

	/**
	 * event fired when the ok is pressed
	 */
	uploadPopupCancel: function(event) {
		CStudioAuthoring.Dialogs.UploadS3Dialog.closeDialog();
        if(window.frameElement){
            var id = window.frameElement.getAttribute("id").split("-editor-")[1];
            if($('#ice-body').length > 0 && $($(".studio-ice-container-"+id,parent.document)[0]).height() > 212 &&
				$($(".studio-ice-container-"+id,parent.document)[0]).attr('data-decrease')) {

				$($(".studio-ice-container-"+id,parent.document)[0]).height(212);
            }
        }

	}


};

CStudioAuthoring.Module.moduleLoaded("upload-S3-dialog", CStudioAuthoring.Dialogs.UploadS3Dialog);

