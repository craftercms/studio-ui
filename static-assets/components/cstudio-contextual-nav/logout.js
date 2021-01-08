/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as published by
 * the Free Software Foundation.
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
CStudioAuthoring.ContextualNav.WcmLogoutMod = {
  initialized: false,

  /**
   * initialize module
   */
  initialize: function (config) {
    var el = YDom.get('acn-logout-link');
    var showLogoutLink = false;
    var url = null;

    CStudioAuthoring.Service.getUserInfo({
      success: function (response) {
        showLogoutLink = !(
          response.authenticationType === CStudioAuthoring.Constants.AUTH_HEADERS ||
          response.authenticationType === CStudioAuthoring.Constants.SAML
        );
        if (!showLogoutLink) {
          CStudioAuthoring.Service.getSSOLogoutInfo({
            success: function (data) {
              if (data) {
                showLogoutLink = true;
                url = data;
              }
              if (showLogoutLink) {
                el.classList.remove('hide');
              }
              onClickFunction(el, url);
            },
            failure: function (response) {
              console.log(response);
            }
          });
        } else {
          el.classList.remove('hide');
          onClickFunction(el);
        }
      },
      failure: function (data) {}
    });

    CStudioAuthoring.Operations.createNavBarDropDown('account');

    function onClickFunction(el, url) {
      el.onclick = function () {
        var serviceUri = CStudioAuthoring.Service.logoutUrl;

        YConnect.setDefaultPostHeader(false);
        YConnect.initHeader('Content-Type', 'application/json; charset=utf-8');
        YConnect.initHeader(CStudioAuthoringContext.xsrfHeaderName, CrafterCMSNext.util.auth.getRequestForgeryToken());
        YConnect.asyncRequest('POST', CStudioAuthoring.Service.createServiceUri(serviceUri), {
          success: function () {
            CStudioAuthoring.Storage.eliminate('userSession');
            if (url) {
              window.location.href = url;
            } else {
              window.location.href = CStudioAuthoringContext.authoringAppBaseUri;
            }
          },
          failure: function () {
            window.location.href = CStudioAuthoringContext.authoringAppBaseUri;
          }
        });
      };
    }
  }
};

CStudioAuthoring.Module.moduleLoaded('logout', CStudioAuthoring.ContextualNav.WcmLogoutMod);
