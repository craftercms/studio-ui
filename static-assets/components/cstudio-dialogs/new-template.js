var YDom = YAHOO.util.Dom;
var YEvent = YAHOO.util.Event;

CStudioAuthoring.Dialogs = CStudioAuthoring.Dialogs || {};

/**
 * NewContentType
 */
CStudioAuthoring.Dialogs.NewTemplate = CStudioAuthoring.Dialogs.NewTemplate || {

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
		var CMgs = CStudioAuthoring.Messages;
        var langBundle = CMgs.getBundle("contentTypes", CStudioAuthoringContext.lang);

		YDom.removeClass("cstudio-wcm-popup-div", "yui-pe-content");

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
                           '<div class="contentTypePopupHeader">' + CMgs.format(langBundle, "createTemplate") + '</div> ' +
                           '<div class="contentTypeOuter">'+
                               '<div>'+
                                 '<div class="newTempText">' + CMgs.format(langBundle, "templateFilename") + '</div>'+
                                 '<input type="text" id="templateName" size="50" autofocus><br/>' +
                               '</div>' +
                           '</div> ' +
						   '<div class="contentTypePopupBtn"> ' +
						       '<input type="button" class="btn btn-primary cstudio-button ok" id="createButton" value="' + CMgs.format(langBundle, "create") + '" />' +
                               '<input type="button" class="btn btn-default cstudio-button" id="createCancelButton" value="' + CMgs.format(langBundle, "cancel") + '"/>' +
                           '</div>' +

                           '</div> ' +
                           '</div>';
		
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
			nameEl: document.getElementById('templateName'),
            path: path
		},
			me = this;
		
		YAHOO.util.Event.addListener("templateName", "keypress", this.limitInput, eventParams);

		YAHOO.util.Event.addListener("createButton", "click", this.createClick, eventParams);

		YAHOO.util.Event.addListener("createCancelButton", "click", this.popupCancelClick);

		YAHOO.util.Event.on(newdiv, 'keyup', function (e) {
			if (e.which === 27) {	// esc
				me.popupCancelClick();
			} else if(e.which === 13 || e.which === 10){
				me.createClick(e, eventParams);
			}
		}, newdiv);

		
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
		var _self = CStudioAuthoring.Dialogs.NewTemplate;
		var name = params.nameEl.value;
		var templatePath
        params.path ? templatePath = params.path : templatePath = "/templates/web";
		
		if(name.indexOf(".ftl") == -1) {
			name = name + ".ftl";
		}

	     var writeServiceUrl = "/api/1/services/api/1/content/write-content.json" +
	            "?site=" + CStudioAuthoringContext.site +
	            "&phase=onSave" +
	            "&path=" + templatePath +
	            "&fileName=" + encodeURI(name) +
	            "&user=" + CStudioAuthoringContext.user +
	            "&unlock=true";

		var saveSvcCb = {
			success: function() {
				CStudioAuthoring.Dialogs.NewTemplate.closeDialog();
				
				CStudioAuthoring.Operations.openTemplateEditor
					(templatePath+"/"+name, "default", { 
						success: function() { 
							if(_self.cb.success){
                                _self.cb.success(templatePath+"/"+name);
                            }else{
                                _self.cb(templatePath+"/"+name);
                            }
						}, 
						failure: function() {
						}
					}, null, null);
			},
			failure: function() {
			}
		};	
			
		YAHOO.util.Connect.setDefaultPostHeader(false);
		YAHOO.util.Connect.initHeader("Content-Type", "text/pain; charset=utf-8");
		YAHOO.util.Connect.asyncRequest('POST', CStudioAuthoring.Service.createServiceUri(writeServiceUrl), saveSvcCb, "");
 
	},		
	
	/**
	 * event fired when the ok is pressed
	 */
	popupCancelClick: function(event) {
		CStudioAuthoring.Dialogs.NewTemplate.closeDialog();
	}


};

CStudioAuthoring.Module.moduleLoaded("new-template-dialog", CStudioAuthoring.Dialogs.NewTemplate);