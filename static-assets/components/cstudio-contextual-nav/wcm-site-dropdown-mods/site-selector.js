var YDom = YAHOO.util.Dom;
var YEvent = YAHOO.util.Event;

/**
 * Site selector
 */
CStudioAuthoring.ContextualNav.SiteSelector = CStudioAuthoring.ContextualNav.SiteSelector || {

	initialized: false,
	
	/**
	 * initialize module
	 */
	initialize: function(config) {
	    if(config.name == "site-selector") {
		if(!this.initialized) {
			this.initialized = true;
				
			var dropdownInnerEl = config.containerEl;

			var dashboardLinkEl = document.createElement('a');
			var linkText = document.createTextNode("Dashboard");
			dashboardLinkEl.appendChild(linkText);
			dashboardLinkEl.title = "Dashboard";
			dashboardLinkEl.href = CStudioAuthoringContext.authoringAppBaseUri + "/site-dashboard";
			dashboardLinkEl.id = "acn-sites-link";
			
            YDom.addClass(dropdownInnerEl, 'studio-view');

            dropdownInnerEl.appendChild(dashboardLinkEl);

			this.populateSiteDropdownMenu(siteSelectorEl);
		}
	    }
	},

	/**
	 * populate the sites dropdown menu
	 */
	populateSiteDropdownMenu: function(dropdownInnerEl) {
		var sitesNavSelect = dropdownInnerEl;

		var sites = CStudioAuthoring.Service.retrieveSitesList({
			success: function(sites) {
				sites.push({name: CMgs.format(siteDropdownLangBundle, "allSites"), siteId: "_ALL_SITES_"});

				for (var i=0; i < sites.length; i++) {
					var curSite = sites[i];
					
					if(curSite != undefined) {
						var option = document.createElement("option");
				
						option.text = curSite.name;
						option.value = curSite.siteId;
						sitesNavSelect.options.add(option);
				
						// Find out what dashboard we are on and select based on that.
						if (curSite.siteId == CStudioAuthoringContext.site){
							sitesNavSelect.selectedIndex = i;
						}
					}
				}
				
				sitesNavSelect.onchange = function() {
					var sitesNavSelect = document.getElementById("acn-site-dropdown");
					var selectedIndex = sitesNavSelect.selectedIndex;
					var shortName = sitesNavSelect.options[selectedIndex].value;

					// set the cookie for preview and then redirect
					if(shortName != "_ALL_SITES_") {
						CStudioAuthoring.Utils.Cookies.createCookie("crafterSite", shortName);
						window.location = CStudioAuthoringContext.authoringAppBaseUri + "/preview";
					}
					else {
						CStudioAuthoring.Utils.Cookies.createCookie("crafterSite", shortName);
						window.location = CStudioAuthoringContext.authoringAppBaseUri + "/#/sites";
					}						
				};
			},
			failure: function() {
			}
		});
	}
}

CStudioAuthoring.Module.moduleLoaded("site-selector", CStudioAuthoring.ContextualNav.SiteSelector);
