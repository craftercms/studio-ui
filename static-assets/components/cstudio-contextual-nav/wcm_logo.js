/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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
  initialize: function (config) {
    var LOGO = '/studio/static-assets/images/logo.svg';

    YDom.get('cstudio-logo').src = LOGO;
    YDom.get('acn-wcm-logo-image').src = LOGO;
    YDom.get('acn-wcm-logo-link').href = CStudioAuthoringContext.authoringAppBaseUri + CStudioAuthoringContext.homeUri;
  }
};

CStudioAuthoring.Module.moduleLoaded('wcm_logo', CStudioAuthoring.ContextualNav.WcmLogo);
