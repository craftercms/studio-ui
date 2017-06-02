var YDom = YAHOO.util.Dom;
var YEvent = YAHOO.util.Event;


/**
 * PreviewSync
 */
CStudioAuthoring.ContextualNav.SiteConfig = CStudioAuthoring.ContextualNav.SiteConfig || {

	/**
	 * initialize module
	 */
	initialize: function(config) {

		if(config.name == "site-config") {

            var moduleConfig = {
                label: 'siteConfig',
                path: '/site-config'
            };

            $.extend( moduleConfig, config.params );

            this.initialized = true;
            var dropdownInnerEl = config.containerEl;

            var parentFolderEl = document.createElement("div");
            var parentFolderLinkEl = document.createElement("a");
            parentFolderEl.appendChild(parentFolderLinkEl);
            YDom.addClass(parentFolderLinkEl, "acn-admin-console");

            parentFolderLinkEl.id = "admin-console";

            var confLabel = moduleConfig.label.toLowerCase().replace(/\s/g,'');
            var label = CMgs.format(siteDropdownLangBundle, confLabel) == confLabel ? moduleConfig.label : CMgs.format(siteDropdownLangBundle, confLabel);

            var icon = CStudioAuthoring.Utils.createIcon(moduleConfig, "fa-sliders");
            parentFolderLinkEl.appendChild(icon);

            parentFolderLinkEl.innerHTML += label;

            parentFolderLinkEl.onclick = function() {
            document.location = CStudioAuthoringContext.authoringAppBaseUri +
                moduleConfig.path  + "?site=" + CStudioAuthoringContext.site;
            };

            dropdownInnerEl.appendChild(parentFolderEl);

		}
	}
}

CStudioAuthoring.Module.moduleLoaded("site-config", CStudioAuthoring.ContextualNav.SiteConfig);
