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
                    window.location.href = CStudioAuthoringContext.authoringAppBaseUri;

                },

                failure: function() {
                    window.location.href = CStudioAuthoringContext.authoringAppBaseUri;
                }
            };

            YConnect.setDefaultPostHeader(false);
            YConnect.initHeader("Content-Type", "application/json; charset=utf-8");
            YConnect.asyncRequest('POST', CStudioAuthoring.Service.createServiceUri(serviceUri), serviceCallback);

        };

        var accountDropdown = YDom.get("account-dropdown");

        accountDropdown.onclick = function () {
            var className = ' ' + this.parentElement.className + ' ';

            if ( ~className.indexOf(' open ') ) {
                this.parentElement.className = className.replace(' open ', ' ');
            } else {
                this.parentElement.className += ' open';
            }

            document.body.addEventListener('click', dropdownCloser, false);

            function dropdownCloser(e){
                if(e.target.id != 'account-dropdown'){
                    document.body.removeEventListener('click', dropdownCloser, false);
                    accountDropdown.parentElement.className = className.replace(' open ', ' ');
                }
            }
        };

	}
};

CStudioAuthoring.Module.moduleLoaded("logout", CStudioAuthoring.ContextualNav.WcmLogoutMod);
