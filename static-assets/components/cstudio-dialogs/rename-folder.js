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
var YEvent = YAHOO.util.Event;

CStudioAuthoring.Dialogs = CStudioAuthoring.Dialogs || {};

/**
 * NewContentType
 */
CStudioAuthoring.Dialogs.RenameFolder = CStudioAuthoring.Dialogs.RenameFolder || {

	/**
	 * initialize module
	 */
	initialize: function(config) {
		this.config = config;
	},

	/**
	 * show dialog
	 */
	showDialog: function(cb, path) {
		//this.config = config;
		this._self = this;
		this.cb = cb;
        this.path = path;
        this.dialog = this.createDialog(path);
		this.dialog.show();
		document.getElementById("cstudio-wcm-popup-div_h").style.display = "none";
		
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
	createDialog: function(path) {
		var CMgs = CStudioAuthoring.Messages,
			previewLangBundle = CMgs.getBundle("siteDropdown", CStudioAuthoringContext.lang),
			folderName,
			n = path.lastIndexOf('/');
		folderName = path.substring(n + 1);

		YDom.removeClass("cstudio-wcm-popup-div", "yui-pe-content");

		var newdiv = YDom.get("cstudio-wcm-popup-div");
		if (newdiv == undefined) {
			newdiv = document.createElement("div");
			document.body.appendChild(newdiv);
		}

		var divIdName = "cstudio-wcm-popup-div";
		newdiv.setAttribute("id",divIdName);
		newdiv.className= "yui-pe-content";
        newdiv.innerHTML = "<div class='contentTypePopupInner' id='upload-popup-inner'>" +
                           "<div class='contentTypePopupContent' id='contentTypePopupContent'> " +
                           "<div class='contentTypePopupHeader'>" + CMgs.format(siteDropdownLangBundle, "renameFolder") + "</div> " +
                           "<div class='contentTypeOuter'>"+
                               "<div>"+
                                 "<div class='newTempText'>" + CMgs.format(siteDropdownLangBundle, "folderName") + "</div>"+
                                 "<input type='text' id='folderName' size='50' value='" + folderName + "' autofocus><br/>" +
                               "</div>" +
                           "</div> " +
						   "<div class='contentTypePopupBtn'> " +
						       "<input type='button' class='btn btn-primary cstudio-button ok' id='createButton' value='" + CMgs.format(siteDropdownLangBundle, "rename") + "' />" +
                               "<input type='button' class='btn btn-default cstudio-button' id='createCancelButton' value='" + CMgs.format(siteDropdownLangBundle, "cancel") + "'/>" +
                           "</div>" +

                           "</div> " +
						   "</div>";
						
		
		document.getElementById("upload-popup-inner").style.width = "350px";
		document.getElementById("upload-popup-inner").style.height = "250px";

		 var dialog = new YAHOO.widget.Dialog("cstudio-wcm-popup-div", 
								{ width : "360px",
								  height : "250px",
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
		dialog.render();
		
		var eventParams = {
			self: this,
			nameEl: document.getElementById('folderName'),
            path: path
		},
			me = this;
		
		YAHOO.util.Event.addListener("folderName", "keypress", this.limitInput, eventParams);

		YAHOO.util.Event.addListener("createButton", "click", this.createClick, eventParams);

		YAHOO.util.Event.addListener("createCancelButton", "click", this.popupCancelClick);

		$("body").on("keyup", function(e) {
			if(e.keyCode === 13 || e.keyCode === 10) {
				me.createClick(e, eventParams);
				$("body").off("keyup");
			}
            if (e.keyCode === 27) {	// esc
				me.closeDialog();
				$("body").off("keyup");
			}
        });

		$("#folderName").on("focus", function () {
			$(this).select();
		});

        $("#folderName").on("keyup", function () {
            this.value = this.value.toLocaleLowerCase();
        });

		
		return dialog;
	},

	limitInput: function(event, params) {
		var value = params.nameEl.value;
		value = value.replace(" ", "-");
		value = value.replace(/[^a-zA-Z0-9-\._]/g, '')
		params.nameEl.value = value;
	},

	/** 
	 * create clicked 
	 */
	createClick: function(event, params) {
		var _self = CStudioAuthoring.Dialogs.RenameFolder;
		var name = params.nameEl.value;
		var folderPath;
        params.path ? folderPath = params.path : templatePath = "/templates/web";
		
	    var writeServiceUrl = "/api/1/services/api/1/content/rename-folder.json" +
	            "?site=" + CStudioAuthoringContext.site +
	            "&path=" + folderPath +
	            "&name=" + encodeURI(name);

		var saveSvcCb = {
			success: function() {
				CStudioAuthoring.Dialogs.RenameFolder.closeDialog();
                _self.cb.success();
			},
			failure: function() {
			}
		};	
			
		YAHOO.util.Connect.setDefaultPostHeader(false);
		YAHOO.util.Connect.initHeader("Content-Type", "text/pain; charset=utf-8");
		YAHOO.util.Connect.initHeader(CStudioAuthoringContext.xsrfHeaderName, CStudioAuthoringContext.xsrfToken);
		YAHOO.util.Connect.asyncRequest('POST', CStudioAuthoring.Service.createServiceUri(writeServiceUrl), saveSvcCb, "");
 
	},		
	
	/**
	 * event fired when the ok is pressed
	 */
	popupCancelClick: function(event) {
		CStudioAuthoring.Dialogs.RenameFolder.closeDialog();
	}


};

CStudioAuthoring.Module.moduleLoaded("rename-folder-dialog", CStudioAuthoring.Dialogs.RenameFolder);