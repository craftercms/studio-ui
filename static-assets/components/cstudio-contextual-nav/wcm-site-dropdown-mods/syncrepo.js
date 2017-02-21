var YDom = YAHOO.util.Dom;
var YEvent = YAHOO.util.Event;


/**
 * PreviewSync
 */
CStudioAuthoring.ContextualNav.SyncFromRepo = CStudioAuthoring.ContextualNav.SyncFromRepo || {

        /**
         * initialize module
         */
        initialize: function(config) {
            if(config.name == "syncrepo") {
                this.initialized = true;
                var dropdownInnerEl = config.containerEl;

                var parentFolderEl = document.createElement("div");
                parentFolderEl.style.paddingTop = "8px";
                var parentFolderLinkEl = document.createElement("a");
                parentFolderEl.appendChild(parentFolderLinkEl);
                YDom.addClass(parentFolderLinkEl, "acn-syncrepo");

                parentFolderLinkEl.id = "syncrepo";
                parentFolderLinkEl.innerHTML = CMgs.format(siteDropdownLangBundle, "syncrepo");
                parentFolderLinkEl.onclick = function() {
                    CStudioAuthoring.Service.syncFromRepo(CStudioAuthoringContext.site, {
                        success: function(result) {
                            alert("Synchronization from Repository initiated.");
                        },
                        failure: function() {}
                    });
                };

                dropdownInnerEl.appendChild(parentFolderEl);
            }
        }
    }
CStudioAuthoring.Module.moduleLoaded("syncrepo", CStudioAuthoring.ContextualNav.SyncFromRepo);
