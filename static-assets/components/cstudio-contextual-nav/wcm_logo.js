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
