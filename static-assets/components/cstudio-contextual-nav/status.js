/**
 * Status
 */
CStudioAuthoring.ContextualNav.StatusNavMod = CStudioAuthoring.ContextualNav.StatusNavMod || {

	initialized: false,
	
	/**
	 * initialize module
	 */
	initialize: function(config) {
		this.definePlugin();
		CStudioAuthoring.ContextualNav.StatusNav.init();
	},
	
	definePlugin: function() {
		var YDom = YAHOO.util.Dom,
			YEvent = YAHOO.util.Event;
		/**
		 * WCM preview tools Contextual Nav Widget
		 */
		CStudioAuthoring.register({
			"ContextualNav.StatusNav": {
				init: function() {
                    var me = this;
                    this.render();
                    
                    window.onmessage = function(e){
                        if (e.data == "status-changed") {
                            me.refreshStatus();                            
                        }
                    };
                },
                
                refreshStatus: function() {
                    var el, iconColor, iconClass, dialogEl,
                        me = this;
                        CMgs = CStudioAuthoring.Messages,
                        contextNavLangBundle = CMgs.getBundle("contextnav", CStudioAuthoringContext.lang);
                    
                    el = YDom.get("acn-status");

                    CStudioAuthoring.Service.getPublishStatus(CStudioAuthoringContext.site, {
                        success: function (response) {
                            dialogEl = YDom.getElementsByClassName("dialog-elt")[0];
                            dialogText = YDom.getElementsByClassName("dialog-elt-text")[0];
                            
                            switch(response.status.toLowerCase()) {
                                case "busy":
                                    iconColor = "#FF8C00";
                                    iconClass = "icon-orange";
                                    if(dialogEl && !dialogEl.classList.contains('fa-spin')) dialogEl.classList.add("fa-spin");
                                    break;
                                case "stopped":
                                    iconColor = "#FF0000";
                                    iconClass = "icon-red";
                                    if(dialogEl && dialogEl.classList.contains('fa-spin')) dialogEl.classList.remove("fa-spin");
                                    break;
                                default:
                                    iconColor = "#7e9dbb";
                                    iconClass = "icon-default";
                                    if(dialogEl && !dialogEl.classList.contains('fa-spin')) dialogEl.classList.add("fa-spin");
                            }      
                            
                            YDom.setStyle(el.children[0], "color", iconColor);
                            YDom.setStyle(dialogEl, "color", iconColor);

                            // upate status message
                            if(dialogText){
                                dialogText.innerHTML = CMgs.format(contextNavLangBundle, response.status.toLowerCase());
                            }                               
                        },
                        failure: function (response) {
                            el = YDom.get("acn-status");
                            YDom.setStyle(el.children[0], "color", "#777");

                            //update status message     -   JSON.parse(response.responseText).message
                            CMgs.format(contextNavLangBundle, JSON.parse(response.responseText).message);
                        }
                    });
                },
				
				render: function() {
                    var el, iconColor, iconClass, dialogEl,
                        me = this;
                        CMgs = CStudioAuthoring.Messages,
                        contextNavLangBundle = CMgs.getBundle("contextnav", CStudioAuthoringContext.lang);
                    
                    el = YDom.get("acn-status");

                    function statusLoop(extDelay) {
                        var delay = extDelay ? extDelay : 60000;

                        CStudioAuthoring.Service.getPublishStatus(CStudioAuthoringContext.site, {
                            success: function (response) {
                                dialogEl = YDom.getElementsByClassName("dialog-elt")[0];
                                dialogText = YDom.getElementsByClassName("dialog-elt-text")[0];
                                
                                switch(response.status.toLowerCase()) {
                                    case "busy":
                                        iconColor = "#FF8C00";
                                        iconClass = "icon-orange";
                                        if(dialogEl && !dialogEl.classList.contains('fa-spin')) dialogEl.classList.add("fa-spin");
                                        break;
                                    case "stopped":
                                        iconColor = "#FF0000";
                                        iconClass = "icon-red";
                                        if(dialogEl && dialogEl.classList.contains('fa-spin')) dialogEl.classList.remove("fa-spin");
                                        break;
                                    default:
                                        iconColor = "#7e9dbb";
                                        iconClass = "icon-default";
                                        if(dialogEl && !dialogEl.classList.contains('fa-spin')) dialogEl.classList.add("fa-spin");
                                }      
                                
                                YDom.setStyle(el.children[0], "color", iconColor);
                                YDom.setStyle(dialogEl, "color", iconColor);

                                // upate status message
                                if(dialogText){
                                    dialogText.innerHTML = CMgs.format(contextNavLangBundle, response.status.toLowerCase());
                                }
                                
                                if(extDelay){
                                    if(me.dialogOpen){
                                        setTimeout(function() { statusLoop(delay); }, delay);
                                    }
                                }else{
                                    setTimeout(function() { statusLoop(); }, delay);
                                }                                
                            },
                            failure: function (response) {
                                el = YDom.get("acn-status");
                                YDom.setStyle(el.children[0], "color", "#777");

                                //update status message     -   JSON.parse(response.responseText).message
                                CMgs.format(contextNavLangBundle, JSON.parse(response.responseText).message)

                                if(extDelay){
                                    if(me.dialogOpen){
                                        setTimeout(function() { statusLoop(delay); }, delay);
                                    }
                                }else{
                                    setTimeout(function() { statusLoop(); }, delay);
                                } 
                            }
                        });

                    }

                    statusLoop();

                    el.onclick = function() {
                        var dialogOpenDelay = 3000;

                        CStudioAuthoring.Service.getPublishStatus(CStudioAuthoringContext.site, {
                            success: function(response) {
                                
                                CStudioAuthoring.Operations.showSimpleDialog(
                                    "error-dialog",
                                    CStudioAuthoring.Operations.simpleDialogTypeINFO,
                                    CMgs.format(contextNavLangBundle, "publishStatus"),
                                    "<span class='dialog-elt-text'>" + CMgs.format(contextNavLangBundle, response.status.toLowerCase()) + "</span>",
                                    [{ text: CMgs.format(contextNavLangBundle, "close"),  handler:function(){
                                        me.dialogOpen = false;
                                        this.hide();
                                    }, isDefault:false }], // use default button
                                    "dialog-elt fa fa-circle-o-notch fa-spin fa-spin-fix " + iconClass,
                                    "studioDialog"
                                );
                                
                                dialogEl = YDom.getElementsByClassName("dialog-elt")[0];

                                switch(response.status.toLowerCase()) {
                                    case "busy":
                                        iconColor = "#FF8C00";
                                        iconClass = "icon-orange";
                                        if(dialogEl && !dialogEl.classList.contains('fa-spin')) dialogEl.classList.add("fa-spin");
                                        break;
                                    case "stopped":
                                        iconColor = "#FF0000";
                                        iconClass = "icon-red";
                                        if(dialogEl && dialogEl.classList.contains('fa-spin')) dialogEl.classList.remove("fa-spin");
                                        break;
                                    default:
                                        iconColor = "#7e9dbb";
                                        iconClass = "icon-default";
                                        if(dialogEl && !dialogEl.classList.contains('fa-spin')) dialogEl.classList.add("fa-spin");
                                }  

                                YDom.setStyle(el.children[0], "color", iconColor);
                                YDom.setStyle(dialogEl, "color", iconColor);

                                me.dialogOpen = true;
                                statusLoop(dialogOpenDelay);

                            },
                            failure: function(response) {
                                CStudioAuthoring.Operations.showSimpleDialog(
                                    "error-dialog",
                                    CStudioAuthoring.Operations.simpleDialogTypeINFO,
                                    CMgs.format(contextNavLangBundle, "publishStatus"),
                                    "<span class='dialog-elt-text'>" + JSON.parse(response.responseText).message + "</span>",
                                    [{ text: CMgs.format(contextNavLangBundle, "close"),  handler:function(){
                                        me.dialogOpen = false;
                                        this.hide();
                                    }, isDefault:false }], // use default button
                                    YAHOO.widget.SimpleDialog.ICON_BLOCK,
                                    "studioDialog"
                                );

                                el = YDom.get("acn-status");
                                YDom.setStyle(el.children[0], "color", "#777");

                                me.dialogOpen = true;
                                statusLoop(dialogOpenDelay);
                            }
                        });
                    }

				}
			}
		});
	}
}

CStudioAuthoring.Module.moduleLoaded("status", CStudioAuthoring.ContextualNav.StatusNavMod);
