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

        var callback = {
            success: function(data) {
                if(data){
                    el.classList.remove("hide");
                    el.onclick = function () {
                        var serviceUri = data.url;

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
                        YConnect.asyncRequest(data.method, serviceUri, serviceCallback);

                    };
                }
            },
            failure: function(response) {
                console.log(response);
            }
        };

        CStudioAuthoring.Service.getLogoutInfo(callback)

        CStudioAuthoring.Operations.createNavBarDropDown("account");

	}
};

CStudioAuthoring.Module.moduleLoaded("logout", CStudioAuthoring.ContextualNav.WcmLogoutMod);
