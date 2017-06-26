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
					var el, iconColor;

                    function statusLoop() {
                            var CMgs = CStudioAuthoring.Messages;
                            var contextNavLangBundle = CMgs.getBundle("contextnav", CStudioAuthoringContext.lang);
                            var delay = 60000;

                            CStudioAuthoring.Service.getPublishStatus(CStudioAuthoringContext.site, {
                                success: function (response) {
                                    el = YDom.get("acn-status");
                                    switch(response.status.toLowerCase()) {
                                        case "busy":
                                            iconColor = "#FF8C00";
                                            break;
                                        case "stopped":
                                            iconColor = "#FF0000";
                                            break;
                                        default:
                                            iconColor = "#7e9dbb";
                                    }
                                    YDom.setStyle(el.children[0], "color", iconColor);
                                    el.onclick = function() {
                                        CStudioAuthoring.Operations.showSimpleDialog(
                                            "error-dialog",
                                            CStudioAuthoring.Operations.simpleDialogTypeINFO,
                                            CMgs.format(contextNavLangBundle, "publishStatus"),
                                            response.message,
                                            null, // use default button
                                            YAHOO.widget.SimpleDialog.ICON_INFO,
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
