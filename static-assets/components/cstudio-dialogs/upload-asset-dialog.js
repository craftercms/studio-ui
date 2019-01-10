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

var YDom = YAHOO.util.Dom;
// YConnect.setDefaultPostHeader(false);
//                YConnect.initHeader("Content-Type", "application/xml; charset=utf-8");
//                YConnect.
var YEvent = YAHOO.util.Event;

CStudioAuthoring.Dialogs = CStudioAuthoring.Dialogs || {};

/**
 * Submit to go live
 */
CStudioAuthoring.Dialogs.UploadDialog = CStudioAuthoring.Dialogs.UploadDialog || {

	/**
	 * initialize module
	 */
	initialize: function(config) {
	},

	/**
	 * show dialog
	 */
	showDialog: function(site, path, serviceUri, callback, isUploadOverwrite) {
		this._self = this;

		this.dialog = this.createDialog(path, site, serviceUri, isUploadOverwrite);

		this.site = site;
		this.path = path;
		this.asPopup = true;			
		this.serviceUri = serviceUri;
		this.callback = callback;
		this.isUploadOverwrite = isUploadOverwrite;
		this.dialog.show();
		document.getElementById("cstudio-wcm-popup-div_h").style.display = "none";

        if(window.frameElement){
            var id = window.frameElement.getAttribute("id").split("-editor-")[1];
			var getFormSizeVal = typeof getFormSize === 'function' ? getFormSize : parent.getFormSize;
			var setFormSizeVal = typeof setFormSize === 'function' ? setFormSize : parent.setFormSize;
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
	createDialog: function(path, site, serviceUri, isUploadOverwrite) {
		var me = this;
		YDom.removeClass("cstudio-wcm-popup-div", "yui-pe-content");
		
		if (isUploadOverwrite == "overwrite") {
			path = path.substring(0, path.lastIndexOf("/"));	
		}

		var newdiv = YDom.get("cstudio-wcm-popup-div");
		if (newdiv == undefined) {
			newdiv = document.createElement("div");
			document.body.appendChild(newdiv);
		}

		var divIdName = "cstudio-wcm-popup-div";
		newdiv.setAttribute("id",divIdName);
		newdiv.className= "yui-pe-content";
        newdiv.innerHTML = '<div class="contentTypePopupInner" id="upload-popup-inner">' +
                           '<div class="contentTypePopupContent" id="contentTypePopupContent"> ' +
                           '<div class="contentTypePopupHeader">Upload</div> ' +
						   '<div><form id="asset_upload_form">' +
                                '<div class="contentTypeOuter">'+
                                    '<div class="formDesc">Please select a file to upload</div> ' +
                                    '<div><table><tr><td><input type="hidden" name="site" value="' + site + '"/></td>' +
						            '<td><input type="hidden" name="path" value="' + path + '"/></td></tr>' +
						            '<tr><td>File:</td><td><input type="file" name="file" id="uploadFileNameId"/></td></tr>' +
//						            '<tr><td>Title:</td><td><input type="text" name="title" /></td></tr>' +
//						            '<tr><td>Description:</td><td><input type="text" name="desc" /></td></tr>' +
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

		if (isUploadOverwrite == "upload") {
			YAHOO.util.Event.addListener("uploadButton", "click", this.uploadPopupSubmit, eventParams);
		} else {
			YAHOO.util.Event.addListener("uploadButton", "click", this.uploadPopupSubmit, eventParams);
//			YAHOO.util.Event.addListener("uploadButton", "click", this.overwritePopupSubmit, eventParams);
		}
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
			path=basePath+"/"+filename;

		var serviceCallback = {
			path: path,
			basePath: basePath,
			exists: function(jsonResponse) {
				//Get user permissions to get read write operations
				
				var checkPermissionsCb = {
		        	success: function(results) {
						var isWrite = CStudioAuthoring.Service.isWrite(results.permissions);
						if (isWrite == true) {
//							CStudioAuthoring.Dialogs.UploadDialog.overwritePopupSubmit(event, args);
							CStudioAuthoring.Dialogs.UploadDialog.uploadFile(args);
						} else {
							document.getElementById("indicator").innerHTML = "File already exists: User has no overwrite permission";
							YAHOO.util.Dom.setStyle('indicator', 'color', 'red');
						}
					},
					failure: function() { }
	        	};
				
				CStudioAuthoring.Service.getUserPermissions(CStudioAuthoringContext.site, this.basePath, checkPermissionsCb);
			},
			failure: function(response) {		
				CStudioAuthoring.Dialogs.UploadDialog.uploadFile(args);
			}
		};

		YAHOO.util.Dom.setStyle('indicator', 'visibility', 'visible');
		CStudioAuthoring.Service.contentExists(path, serviceCallback);
	},
	
   /**
	 * upload file when upload pressed
	 */
	uploadFile: function(args) {
		var serviceUri = CStudioAuthoring.Service.createServiceUri("/asset-upload");

		var uploadHandler = {
			upload: function(o) {
				//console.log('responseText '+o.responseText);
				YAHOO.util.Dom.setStyle('indicator', 'visibility', 'hidden');
				var r = eval('(' + o.responseText + ')');
				if(r && r.hasError){
					var errorString = '';
					for(var i=0; i < r.errors.length; i++){
						errorString += r.errors[i];
					}
                    CStudioAuthoring.Operations.showSimpleDialog(
                        "error-dialog",
                        CStudioAuthoring.Operations.simpleDialogTypeINFO,
                        "Notification",
                        errorString,
                        null,
                        YAHOO.widget.SimpleDialog.ICON_BLOCK,
                        "studioDialog"
                    );
				}else{
					CStudioAuthoring.Dialogs.UploadDialog.closeDialog();
					if(r.fileExtension) {
						r.fileExtension = r.fileExtension.substring(r.fileExtension.lastIndexOf(".")+1);
					}
					args.self.callback.success(r);
				}
			}
		};
		YAHOO.util.Dom.setStyle('indicator', 'visibility', 'visible');
		//the second argument of setForm is crucial,
		//which tells Connection Manager this is an file upload form
		YAHOO.util.Connect.setForm('asset_upload_form', true);
		serviceUri += "&" + CStudioAuthoringContext.xsrfParameterName + "=" + CStudioAuthoringContext.xsrfToken;		
		YAHOO.util.Connect.asyncRequest('POST', serviceUri, uploadHandler);
	},
	
	/**
	 *
	 */
	 overwritePopupSubmit: function(event, args) {
	 	
        var callback = {
            success: function(response) {
				var serviceUri = CStudioAuthoring.Service.createServiceUri(args.self.serviceUri);
				var uploadHandler = {
					upload: function(o) {
						//console.log(o.responseText);
						YAHOO.util.Dom.setStyle('indicator', 'visibility', 'hidden');
						var r = eval('(' + o.responseText + ')');
						if(r.success){
                            CStudioAuthoring.Operations.showSimpleDialog(
                                "upload-dialog",
                                CStudioAuthoring.Operations.simpleDialogTypeINFO,
                                "Notification",
                                r.message,
                                null,
                                YAHOO.widget.SimpleDialog.ICON_INFO,
                                "success studioDialog"
                            );

						}else{
							CStudioAuthoring.Dialogs.UploadDialog.closeDialog();				
						    args.self.callback.success(r);
						}
					}
				};
				YAHOO.util.Dom.setStyle('indicator', 'visibility', 'visible');
				//the second argument of setForm is crucial,
				//which tells Connection Manager this is an file upload form
				YAHOO.util.Connect.setForm('asset_upload_form', true);
				serviceUri += "&" + CStudioAuthoringContext.xsrfParameterName + "=" + CStudioAuthoringContext.xsrfToken;				
				YAHOO.util.Connect.asyncRequest('POST', serviceUri, uploadHandler);				
            },

            failure: function() {
            }
        };

        CStudioAuthoring.Service.deleteContentForPathService(args.self.site, args.self.path, callback);
	 	
	 },

	/**
	 * event fired when the ok is pressed
	 */
	uploadPopupCancel: function(event) {
		CStudioAuthoring.Dialogs.UploadDialog.closeDialog();
        if(window.frameElement){
            var id = window.frameElement.getAttribute("id").split("-editor-")[1];
            if($('#ice-body').length > 0 && $($(".studio-ice-container-"+id,parent.document)[0]).height() > 212 &&
				$($(".studio-ice-container-"+id,parent.document)[0]).attr('data-decrease')) {

				$($(".studio-ice-container-"+id,parent.document)[0]).height(212);
            }
        }

	}


};

CStudioAuthoring.Module.moduleLoaded("upload-dialog", CStudioAuthoring.Dialogs.UploadDialog);

