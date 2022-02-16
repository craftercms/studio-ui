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

/**
 * WCM Search Plugin
 */
CStudioAuthoring.ContextualNav.WcmSearchMod = CStudioAuthoring.ContextualNav.WcmSearchMod || {
  initialized: false,

  /**
   * initialize module
   */
  initialize: function (config) {
    this.definePlugin();
    CStudioAuthoring.ContextualNav.WcmSearch.init();
  },

  definePlugin: function () {
    var YDom = YAHOO.util.Dom,
      YEvent = YAHOO.util.Event;
    /**
     * WCM Search Contextual Nav Widget
     */
    CStudioAuthoring.register({
      'ContextualNav.WcmSearch': {
        init: function () {
          var e = YDom.get('acn-searchtext');
          YAHOO.util.Event.addListener(e, 'click', this.doSearch);
          this.setDefaultSearchText();
          this.blurSearchText();
        },
        /**
         * user has focused on search text box
         */
        focusSearchText: function (e) {
          var e = YDom.get('acn-searchtext');
          YDom.setStyle(e, 'color', '');
          e.value = '';
          e.select();
        },
        /**
         * handle on blur event
         */
        blurSearchText: function (e) {
          var e = YDom.get('acn-searchtext');
          var searchVal = e.value;
          CStudioAuthoring.ContextualNav.WcmSearch.setDefaultSearchText();
        },
        /**
         * set the search box to it's default search text value
         */
        setDefaultSearchText: function () {
          var CMgs = CStudioAuthoring.Messages;
          var contextNavLangBundle = CMgs.getBundle('contextnav', CStudioAuthoringContext.lang);
        },
        /**
         * perform the search
         */
        doSearch: function () {
          var searchContext = CStudioAuthoring.Service.createSearchContext();
          searchContext.keywords = encodeURIComponent('');
          CStudioAuthoring.Operations.openSearch(searchContext, false, null, null);
        }
      }
    });
  }
};

CStudioAuthoring.Module.moduleLoaded('search', CStudioAuthoring.ContextualNav.WcmSearchMod);
