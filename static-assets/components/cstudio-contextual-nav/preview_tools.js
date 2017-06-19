/**
 * Preview Tools
 */
CStudioAuthoring.ContextualNav.PreviewToolsMod = CStudioAuthoring.ContextualNav.PreviewToolsMod || {

	initialized: false,
	
	/**
	 * initialize module
	 */
	initialize: function(config) {
		this.definePlugin();
		CStudioAuthoring.ContextualNav.PreviewToolsNav.init();		
	},
	
	definePlugin: function() {
		var YDom = YAHOO.util.Dom,
			YEvent = YAHOO.util.Event;
		/**
		 * WCM preview tools Contextual Nav Widget
		 */
		CStudioAuthoring.register({
			"ContextualNav.PreviewToolsNav": {
				init: function() {
					if(CStudioAuthoringContext.isPreview == true) {
						if(CStudioAuthoring.PreviewTools) {
							this.render();
						}
						else {
							cb = {
								moduleLoaded: function(moduleName, moduleClass, moduleConfig) {
							   		try {
						   				if(!this.initialized) {
											CStudioAuthoring.PreviewTools.PreviewToolsOffEvent.subscribe(
									       			function() {
									       				var el = YDom.get("acn-preview-tools-container");
                                                        YDom.removeClass(el.children[0], "icon-light-blue");
                                                        YDom.addClass(el.children[0], "icon-default");
									       			});

											CStudioAuthoring.PreviewTools.PreviewToolsOnEvent.subscribe(
									       			function() {
									       				var el = YDom.get("acn-preview-tools-container");
                                                        YDom.removeClass(el.children[0], "icon-default");
                                                        YDom.addClass(el.children[0], "icon-light-blue");

									       			});

									       	CStudioAuthoring.PreviewTools.initialize(moduleConfig);
									       	this.self.render();
									       	this.self.initialized = true;
						   				}						   				
							   		} 
								   	catch (e) {
									}
								},
								
								self: this
							};
							
							CStudioAuthoring.Module.requireModule(
			                    "preview-tools-controller",
			                    '/static-assets/components/cstudio-preview-tools/preview-tools.js',
			                    0,
			                    cb
			                );
						}
					}					
				},
				
				render: function() {
					var el, containerEl, iconEl, iconLabel, ptoOn;

					el = YDom.get("acn-preview-tools");
					containerEl = document.createElement("div");
					containerEl.id = "acn-preview-tools-container";
                    YDom.addClass(containerEl, "nav-link nav-container");
					
					iconEl = document.createElement("span");
                    iconEl.id = "acn-preview-tools-image";

                    YDom.addClass(iconEl, "nav-icon fa fa-wrench f18");
                    ptoOn = !!(sessionStorage.getItem('pto-on'));   // cast string value to a boolean

                    if(ptoOn){
                        YDom.addClass(iconEl, "icon-light-blue");
                    } else{
                        YDom.addClass(iconEl, "icon-default");
                    }

                    iconLabel = document.createElement("span");
                    YDom.addClass(iconLabel, "nav-label");
                    iconLabel.innerHTML = "Preview Tools";

					containerEl.appendChild(iconEl);
                    containerEl.appendChild(iconLabel);
					el.appendChild(containerEl);

                    var cstopic = crafter.studio.preview.cstopic;

					containerEl.onclick = function() {
					    var ptoOn = !!(sessionStorage.getItem('pto-on')),
                            componentsOn = !!(sessionStorage.getItem('components-on'));

						if(!ptoOn) {
                            if(componentsOn){
                                CStudioAuthoring.Service.lookupConfigurtion(CStudioAuthoringContext.site, '/preview-tools/components-config.xml', {
                                    failure: CStudioAuthoring.Utils.noop,
                                    success: function (config) {
                                        amplify.publish(cstopic('DND_COMPONENTS_PANEL_ON'), {
                                            components: config
                                        });
                                    }
                                });
                            }else{
                                CStudioAuthoring.PreviewTools.turnToolsOn();
                            }


						}
						else {
                            if(componentsOn){
                                amplify.publish(cstopic('DND_COMPONENTS_PANEL_OFF'));
                            }else {
                                CStudioAuthoring.PreviewTools.turnToolsOff();
                            }

						}
					}
					
					containerEl.onClick.containerEl = containerEl;
				}
			}
		});
	}
}

CStudioAuthoring.Module.moduleLoaded("preview_tools", CStudioAuthoring.ContextualNav.PreviewToolsMod);
