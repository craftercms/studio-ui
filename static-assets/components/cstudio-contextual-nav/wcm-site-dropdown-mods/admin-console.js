var YDom = YAHOO.util.Dom;
var YEvent = YAHOO.util.Event;


/**
 * PreviewSync
 */
CStudioAuthoring.ContextualNav.AdminConsole = CStudioAuthoring.ContextualNav.AdminConsole || {

	/**
	 * initialize module
	 */
	initialize: function(config) {

		if(config.name == "admin-console") {

            this.initialized = true;
            var dropdownInnerEl = config.containerEl;

            var parentFolderEl = document.createElement("div");
            var parentFolderLinkEl = document.createElement("a");
            parentFolderEl.appendChild(parentFolderLinkEl);
            YDom.addClass(parentFolderLinkEl, "acn-admin-console");

            parentFolderLinkEl.id = "admin-console";
            parentFolderLinkEl.innerHTML = CMgs.format(siteDropdownLangBundle, "siteConfig");

            if (config.params && config.params.icon){
                parentFolderLinkEl.className += " acn-parent-folder custom-icon " + config.params.icon;
            }

            parentFolderLinkEl.onclick = function() {
            document.location = CStudioAuthoringContext.authoringAppBaseUri +
                "/admin-console?site=" + CStudioAuthoringContext.site;
            };

            dropdownInnerEl.appendChild(parentFolderEl);

		}
	}
}

CStudioAuthoring.Module.moduleLoaded("admin-console", CStudioAuthoring.ContextualNav.AdminConsole);
