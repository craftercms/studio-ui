/**
 * Preview Tools
 */
CStudioAuthoring.ContextualNav.PersonaNavMod = CStudioAuthoring.ContextualNav.PersonaNavMod || {

	initialized: false,
	
	/**
	 * initialize module
	 */
	initialize: function(config) {
		this.definePlugin();
		CStudioAuthoring.ContextualNav.PersonaNav.init();		
	},
	
	definePlugin: function() {
		var YDom = YAHOO.util.Dom,
			YEvent = YAHOO.util.Event;
		/**
		 * WCM preview tools Contextual Nav Widget
		 */
		CStudioAuthoring.register({
			"ContextualNav.PersonaNav": {
				init: function() {
					if(CStudioAuthoringContext.isPreview == true) {
						this.render();
					}					
				},
				
				render: function() {
					var el, containerEl, iconEl, iconLabel, ptoOn;

					el = YDom.get("acn-persona");
					containerEl = document.createElement("div");
					containerEl.id = "acn-persona-container";
                    YDom.addClass(containerEl, "nav-link nav-container");

                    iconEl = document.createElement("span");
                    iconEl.id = "acn-persona-image";
                    YDom.addClass(iconEl, "nav-icon fa fa-bullseye");

                    iconLabel = document.createElement("span");
                    YDom.addClass(iconLabel, "nav-label");
                    iconLabel.innerHTML = "Targeting";

					containerEl.appendChild(iconEl);
                    containerEl.appendChild(iconLabel);
					el.appendChild(containerEl);

                    containerEl.onclick = function() {
                        var ptoOn = !!(sessionStorage.getItem('pto-on'));
                        if(!ptoOn){
                            CStudioAuthoring.PreviewTools.turnToolsOn();
                        }
                        if(!YDom.getElementsByClassName("persona-container", "div", "cstudioPreviewAnalyticsOverlay")[0]) {
                            YDom.getElementsByClassName("acn-accordion-toggle", "a", "targeting-panel-elem")[0].click();
                        }
                    }

				}
			}
		});
	}
}

CStudioAuthoring.Module.moduleLoaded("persona", CStudioAuthoring.ContextualNav.PersonaNavMod);
