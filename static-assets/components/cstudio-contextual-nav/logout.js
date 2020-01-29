/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
        YConnect.initHeader(CStudioAuthoringContext.xsrfHeaderName, CrafterCMSNext.util.auth.getRequestForgeryToken());
        YConnect.asyncRequest('POST', CStudioAuthoring.Service.createServiceUri(serviceUri), serviceCallback);

      };
    }

		var el = YDom.get("acn-logout-link");
        var showLogoutLink = false;
        var url = null;

        var getUserInfoCallback = {
            success: function(response) {
                showLogoutLink = !(
                  response.authenticationType === CStudioAuthoring.Constants.AUTH_HEADERS || 
                  response.authenticationType === CStudioAuthoring.Constants.SAML
                );
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

	}
};

CStudioAuthoring.Module.moduleLoaded("logout", CStudioAuthoring.ContextualNav.WcmLogoutMod);
