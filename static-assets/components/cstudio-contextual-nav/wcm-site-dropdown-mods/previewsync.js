var YDom = YAHOO.util.Dom;
var YEvent = YAHOO.util.Event;


/**
 * PreviewSync
 */
CStudioAuthoring.ContextualNav.PreviewSync = CStudioAuthoring.ContextualNav.PreviewSync || {

	/**
	 * initialize module
	 */
	initialize: function(config) {

		if(config.name == "previewsync") {			
            this.initialized = true;
            var dropdownInnerEl = config.containerEl;

            var parentFolderEl = document.createElement("div");
            parentFolderEl.style.paddingTop = "8px";
            var parentFolderLinkEl = document.createElement("a");
            parentFolderEl.appendChild(parentFolderLinkEl);
            YDom.addClass(parentFolderLinkEl, "acn-previewsync");

            parentFolderLinkEl.id = "previewsync";
            parentFolderLinkEl.innerHTML = CMgs.format(siteDropdownLangBundle, "previewSync");
            parentFolderLinkEl.onclick = function() {
                CStudioAuthoring.Service.previewServerSyncAll(CStudioAuthoringContext.site, {
                   success: function() {
                       CStudioAuthoring.Operations.showSimpleDialog(
                           "previewInitiated-dialog",
                           CStudioAuthoring.Operations.simpleDialogTypeINFO,
                           CMgs.format(siteDropdownLangBundle, "notification"),
                           CMgs.format(siteDropdownLangBundle, "previewInitiated"),
                           null, // use default button
                           YAHOO.widget.SimpleDialog.ICON_INFO,
                           "success studioDialog"
                       );
                   },
                   failure: function() {}
                });
            };

            dropdownInnerEl.appendChild(parentFolderEl);
	    }
    }
}
CStudioAuthoring.Module.moduleLoaded("previewsync", CStudioAuthoring.ContextualNav.PreviewSync);
