/**
 * Logout Plugin
 */ 
CStudioAuthoring.ContextualNav.WcmLogoutMod = CStudioAuthoring.ContextualNav.WcmLogoutMod || {

	initialized: false,
	
	/**
	 * initialize module
	 */
	initialize: function(config) {
		var CMgs = CStudioAuthoring.Messages;

		var el = YDom.get("acn-logout-link");

        el.onclick = function () {
            var serviceUri = CStudioAuthoring.Service.logoutUrl;

            var serviceCallback = {
                success: function() {
                    CStudioAuthoring.Storage.eliminate("userSession");
                    window.location.href = CStudioAuthoringContext.authoringAppBaseUri;
                },

                failure: function() {
                    window.location.href = CStudioAuthoringContext.authoringAppBaseUri;
                }
            };

            YConnect.setDefaultPostHeader(false);
            YConnect.initHeader("Content-Type", "application/json; charset=utf-8");
            YConnect.initHeader(CStudioAuthoringContext.xsrfHeaderName, CStudioAuthoringContext.xsrfToken);
            YConnect.asyncRequest('POST', CStudioAuthoring.Service.createServiceUri(serviceUri), serviceCallback);

        };

        CStudioAuthoring.Operations.createNavBarDropDown("account");

	}
};

CStudioAuthoring.Module.moduleLoaded("logout", CStudioAuthoring.ContextualNav.WcmLogoutMod);
