/**
 * WCM Search Plugin
 */
CStudioAuthoring.ContextualNav.InContextEditMod = CStudioAuthoring.ContextualNav.InContextEditMod || {
  initialized: false,

  /**
   * initialize module
   */
  initialize: function (config) {
    this.definePlugin();
    CStudioAuthoring.Operations.createNavBarDropDown('in-context-edit');
    CStudioAuthoring.ContextualNav.InContextEditsNav.init();
  },

  definePlugin: function () {
    var YDom = YAHOO.util.Dom,
      YEvent = YAHOO.util.Event;
    /**
     * WCM editor tools Contextual Nav Widget
     */
    CStudioAuthoring.register({
      'ContextualNav.InContextEditsNav': {
        init: function () {
          var _self = this;
          var callback = function (isRev) {
            if (CStudioAuthoringContext.isPreview == true && !isRev) {
              _self.render();

              // TODO: check events that will be used for new ice
              if (CStudioAuthoring.IceTools) {
                //CStudioAuthoring.IceTools) {
                CStudioAuthoring.IceTools.IceToolsOffEvent.subscribe(function () {
                  // var el = YDom.get("acn-ice-tools-container");
                  // YDom.removeClass(el.children[0], "icon-yellow");
                  // YDom.addClass(el.children[0], "icon-default");
                });

                CStudioAuthoring.IceTools.IceToolsOnEvent.subscribe(function () {
                  // var el = YDom.get("acn-ice-tools-container");
                  // YDom.removeClass(el.children[0], "icon-default");
                  // YDom.addClass(el.children[0], "icon-yellow");
                });

                cb = {
                  moduleLoaded: function (moduleName, moduleClass, moduleConfig) {
                    try {
                      CStudioAuthoring.IceTools.initialize(moduleConfig);
                      if (this.self.initialized == false) {
                        this.self.render();
                      }

                      this.self.initialized = true;

                      CStudioAuthoring.IceTools.IceToolsOffEvent.subscribe(function () {
                        // var el = YDom.get("acn-ice-tools-container");
                        // YDom.removeClass(el.children[0], "icon-yellow");
                        // YDom.addClass(el.children[0], "icon-default");
                      });

                      CStudioAuthoring.IceTools.IceToolsOnEvent.subscribe(function () {
                        // var el = YDom.get("acn-ice-tools-container");
                        // YDom.removeClass(el.children[0], "icon-default");
                        // YDom.addClass(el.children[0], "icon-yellow");
                      });
                    } catch (e) {}
                  },

                  self: this
                };

                CStudioAuthoring.Module.requireModule(
                  'ice-tools-controller',
                  '/static-assets/components/cstudio-preview-tools/ice-tools.js',
                  0,
                  cb
                );
              }
            }
          };
          CStudioAuthoring.Utils.isReviewer(callback);
        },

        render: function () {
          var iceToggle = YDom.get('ice-toggle'),
            contentToggle = YDom.get('ice-toggle-content'),
            componentsToggle = YDom.get('ice-toggle-components'),
            pageContentToggle = YDom.get('ice-toggle-pagecontent');

          iceToggle.onclick = function () {
            var iceOn = !!sessionStorage.getItem('ice-on'); // cast string value to a boolean

            if (!iceOn) {
              CStudioAuthoring.IceTools.turnEditOn();
            } else {
              CStudioAuthoring.IceTools.turnEditOff();
            }
          };

          contentToggle.onclick = function () {
            CStudioAuthoring.IceTools.turnEditOn('content');
          };

          componentsToggle.onclick = function () {
            CStudioAuthoring.IceTools.turnEditOn('components');
          };

          pageContentToggle.onclick = function () {
            CStudioAuthoring.IceTools.turnEditOn('pageContent');
          };
        }
      }
    });
  }
};

CStudioAuthoring.Module.moduleLoaded('in_context_edit', CStudioAuthoring.ContextualNav.InContextEditMod);
