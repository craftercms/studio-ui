/**
 * WCM Search Plugin
 */
CStudioAuthoring.ContextualNav.IceToolsMod = CStudioAuthoring.ContextualNav.IceToolsMod || {

	initialized: false,
	
	/**
	 * initialize module
	 */
	initialize: function(config) {
		this.definePlugin();
		CStudioAuthoring.ContextualNav.EditorsToolsNav.init();		
	},
	
	definePlugin: function() {
		var YDom = YAHOO.util.Dom,
			YEvent = YAHOO.util.Event;
		/**
		 * WCM editor tools Contextual Nav Widget
		 */
		CStudioAuthoring.register({
			"ContextualNav.EditorsToolsNav": {
				init: function() {
                    var _self = this;
                    var callback = function(isRev) {
                        if (CStudioAuthoringContext.isPreview == true && !isRev) {

                            _self.render();
                            if (CStudioAuthoring.IceTools) { //CStudioAuthoring.IceTools) {
                                CStudioAuthoring.IceTools.IceToolsOffEvent.subscribe(
                                    function () {
                                        var el = YDom.get("acn-ice-tools-container");
                                        YDom.removeClass(el.children[0], "icon-yellow");
                                        YDom.addClass(el.children[0], "icon-default");
                                    });

                                CStudioAuthoring.IceTools.IceToolsOnEvent.subscribe(
                                    function () {
                                        var el = YDom.get("acn-ice-tools-container");
                                        YDom.removeClass(el.children[0], "icon-default");
                                        YDom.addClass(el.children[0], "icon-yellow");
                                    });

//						}
//						else {
                                cb = {
                                    moduleLoaded: function (moduleName, moduleClass, moduleConfig) {
                                        try {

                                            CStudioAuthoring.IceTools.initialize(moduleConfig);
                                            if (this.self.initialized == false) {
                                                this.self.render();
                                            }

                                            this.self.initialized = true;

                                            CStudioAuthoring.IceTools.IceToolsOffEvent.subscribe(
                                                function () {
                                                    var el = YDom.get("acn-ice-tools-container");
                                                    YDom.removeClass(el.children[0], "icon-yellow");
                                                    YDom.addClass(el.children[0], "icon-default");
                                                });

                                            CStudioAuthoring.IceTools.IceToolsOnEvent.subscribe(
                                                function () {
                                                    var el = YDom.get("acn-ice-tools-container");
                                                    YDom.removeClass(el.children[0], "icon-default");
                                                    YDom.addClass(el.children[0], "icon-yellow");
                                                });

                                            CStudioAuthoring.Module.requireModule(
                                                "preview-tools-controller",
                                                '/static-assets/components/cstudio-preview-tools/preview-tools.js',
                                                0,
                                                {
                                                    moduleLoaded: function (moduleName, moduleClass, moduleConfig) {

                                                        CStudioAuthoring.PreviewTools.PreviewToolsOffEvent.subscribe(
                                                            function () {
                                                                CStudioAuthoring.IceTools.turnEditOff();
                                                            });
                                                    }
                                                });
                                        }
                                        catch (e) {
                                        }
                                    },

                                    self: this
                                };

                                CStudioAuthoring.Module.requireModule(
                                    "ice-tools-controller",
                                    '/static-assets/components/cstudio-preview-tools/ice-tools.js',
                                    0,
                                    cb
                                );
                            }
                        }
                    }
                    CStudioAuthoring.Utils.isReviewer(callback);
				},
				
				render: function() {
				    var el, containerEl, pencilIcon, iconLabel, iceOn;

					
					el = YDom.get("acn-ice-tools");
					containerEl = document.createElement("div");
					containerEl.id = "acn-ice-tools-container";
                    YDom.addClass(containerEl, "nav-link nav-container");

					pencilIcon = document.createElement("span");
                    pencilIcon.id = "acn-ice-tools-image";

					iceOn = !!(sessionStorage.getItem('ice-on'));   // cast string value to a boolean

                    YDom.addClass(pencilIcon, "nav-icon fa fa-pencil f18");

                    if(iceOn){
                        YDom.addClass(pencilIcon, "icon-yellow");
                    } else{
                        YDom.addClass(pencilIcon, "icon-default");
                    }

                    iconLabel = document.createElement("span");
                    YDom.addClass(iconLabel, "nav-label");
                    iconLabel.innerHTML = "In-Context Edit";

					containerEl.appendChild(pencilIcon);
                    containerEl.appendChild(iconLabel);
					el.appendChild(containerEl);

					containerEl.onclick = function() {
					    var iceOn = !!(sessionStorage.getItem('ice-on'));   // cast string value to a boolean

						if(!iceOn) {
							CStudioAuthoring.IceTools.turnEditOn();
						}
						else {
							CStudioAuthoring.IceTools.turnEditOff();
						}
					}
				}
			}
		});
	}
}

CStudioAuthoring.Module.moduleLoaded("ice_tools", CStudioAuthoring.ContextualNav.IceToolsMod);
