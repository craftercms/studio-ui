var YDom = YAHOO.util.Dom;
var YEvent = YAHOO.util.Event;

/**
 * Branded Logo Plugin
 */
CStudioAuthoring.ContextualNav.WcmLogo = CStudioAuthoring.ContextualNav.WcmLogo || {

	initialized: false,
	
	/**
	 * initialize module
	 */
	initialize: function(config) {
		YAHOO.util.Event.onAvailable("acn-wcm-logo", function() {
		 	YDom.get("acn-wcm-logo-image").src = CStudioAuthoringContext.baseUri + '/api/1/services/api/1/content/get-content-at-path.bin?path=/cstudio/config/app-logo.png';
			
 			YDom.get("acn-wcm-logo-link").href = CStudioAuthoringContext.authoringAppBaseUri + CStudioAuthoringContext.homeUri;


			CStudioAuthoring.Service.lookupSiteLogo(CStudioAuthoringContext.site, {
				success: function (response) {
					// console.log(response);
					if(response){
						YDom.get('cstudio-logo').src = '/studio/api/1/services/api/1/server/get-ui-resource-override.json?resource=logo.jpg';
					}else{
						YDom.get('cstudio-logo').src = '/studio/static-assets/images/crafter_studio_360.png';
					}
				},
				failure: function() {
					YDom.get('cstudio-logo').src = '/studio/static-assets/images/crafter_studio_360.png';
				}
			});
			
		}, this);
	}
}

CStudioAuthoring.Module.moduleLoaded("wcm_logo", CStudioAuthoring.ContextualNav.WcmLogo);
