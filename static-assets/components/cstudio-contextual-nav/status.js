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
					this.render();
				},
				
				render: function() {
					var el, iconColor, iconClass, dialogEl;

                    function statusLoop() {
                            var CMgs = CStudioAuthoring.Messages;
                            var contextNavLangBundle = CMgs.getBundle("contextnav", CStudioAuthoringContext.lang);
                            var delay = 60000;

                            CStudioAuthoring.Service.getPublishStatus(CStudioAuthoringContext.site, {
                                success: function (response) {
                                    el = YDom.get("acn-status");
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
                                    el.onclick = function() {
                                        CStudioAuthoring.Operations.showSimpleDialog(
                                            "error-dialog",
                                            CStudioAuthoring.Operations.simpleDialogTypeINFO,
                                            CMgs.format(contextNavLangBundle, "publishStatus"),
                                            response.message,
                                            [{ text: CMgs.format(contextNavLangBundle, "close"),  handler:function(){this.hide();}, isDefault:false }], // use default button
                                            "dialog-elt fa fa-circle-o-notch fa-spin f18 " + iconClass,
                                            "studioDialog"
                                        );
                                    };

                                    setTimeout(function() { statusLoop(); }, delay);

                                },
                                failure: function (response) {
                                    el = YDom.get("acn-status");
                                    YDom.setStyle(el.children[0], "color", "#777");
                                    el.onclick = function() {
                                        CStudioAuthoring.Operations.showSimpleDialog(
                                            "error-dialog",
                                            CStudioAuthoring.Operations.simpleDialogTypeINFO,
                                            CMgs.format(contextNavLangBundle, "publishStatus"),
                                            JSON.parse(response.responseText).message,
                                            null, // use default button
                                            YAHOO.widget.SimpleDialog.ICON_BLOCK,
                                            "studioDialog"
                                        );
                                    };
                                    setTimeout(function() { statusLoop(); }, delay);
                                }
                            });

                        }

                    statusLoop();

				}
			}
		});
	}
}

CStudioAuthoring.Module.moduleLoaded("status", CStudioAuthoring.ContextualNav.StatusNavMod);
