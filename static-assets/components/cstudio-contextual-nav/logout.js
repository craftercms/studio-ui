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
        var showLogoutLink = false;
        var url = null;

        var getUserInfoCallback = {
            success: function(response) {
                showLogoutLink = response.authenticationType == CStudioAuthoring.Constants.AUTH_HEADERS ? false : true;
                if(!showLogoutLink) {
                    var callback = {
                        success: function (data) {
                            if (data) {
                                showLogoutLink = true;
                                url = data;
                            }
                            if(showLogoutLink){
                                el.classList.remove("hide");
                            }
                            onClickFunction(el, url);
                        },
                        failure: function (response) {
                            console.log(response);
                        }
                    };

                    CStudioAuthoring.Service.getSSOLogoutInfo(callback);
                }else{
                    el.classList.remove("hide");
                    onClickFunction(el);
                }
            },

            failure: function(data) {

            }
        }

        CStudioAuthoring.Service.getUserInfo(getUserInfoCallback);

        CStudioAuthoring.Operations.createNavBarDropDown("account");

        var onClickFunction = function(el, url){
            el.onclick = function () {
                var serviceUri = CStudioAuthoring.Service.logoutUrl;

                var serviceCallback = {
                    success: function () {
                        CStudioAuthoring.Storage.eliminate("userSession");
                        if(url){
                            window.location.href = url;
                        }else{
                            window.location.href = CStudioAuthoringContext.authoringAppBaseUri;
                        }
                    },

                    failure: function () {
                        window.location.href = CStudioAuthoringContext.authoringAppBaseUri;
                    }
                };

                YConnect.setDefaultPostHeader(false);
                YConnect.initHeader("Content-Type", "application/json; charset=utf-8");
                YConnect.initHeader(CStudioAuthoringContext.xsrfHeaderName, CStudioAuthoringContext.xsrfToken);
                YConnect.asyncRequest('POST', CStudioAuthoring.Service.createServiceUri(serviceUri), serviceCallback);

            };
        }

	}
};

CStudioAuthoring.Module.moduleLoaded("logout", CStudioAuthoring.ContextualNav.WcmLogoutMod);
