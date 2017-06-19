var YDom = YAHOO.util.Dom;
var YEvent = YAHOO.util.Event;

/**
 * Site selector
 */
CStudioAuthoring.ContextualNav.Dashboard = CStudioAuthoring.ContextualNav.Dashboard || {

	initialized: false,
	
	/**
	 * initialize module
	 */
	initialize: function(config) {
	    if(config.name == "dashboard") {

			var moduleConfig = {
				label: 'dashboard',
				path: '/site-dashboard'
			};

			$.extend( moduleConfig, config.params );

			if(!this.initialized) {
				this.initialized = true;

				var dropdownInnerEl = config.containerEl;

				var dashboardLinkEl = document.createElement('a');

				var confLabel = moduleConfig.label.toLowerCase().replace(/\s/g,'');
				var label = CMgs.format(siteDropdownLangBundle, confLabel) == confLabel ? moduleConfig.label : CMgs.format(siteDropdownLangBundle, confLabel);

				var icon = CStudioAuthoring.Utils.createIcon(moduleConfig, "fa-tasks");
				dashboardLinkEl.appendChild(icon);

				var linkText = document.createTextNode(label);
				dashboardLinkEl.appendChild(linkText);
				dashboardLinkEl.title = "Dashboard";
				dashboardLinkEl.href = CStudioAuthoringContext.authoringAppBaseUri + moduleConfig.path;
				dashboardLinkEl.id = "acn-sites-link";
				
				YDom.addClass(dropdownInnerEl, 'studio-view');

				dropdownInnerEl.appendChild(dashboardLinkEl);

			}
	    }
	}
}

CStudioAuthoring.Module.moduleLoaded("dashboard", CStudioAuthoring.ContextualNav.Dashboard);
