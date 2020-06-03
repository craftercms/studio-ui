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

var YDom = YAHOO.util.Dom;

if (typeof CStudioAuthoringWidgets == 'undefined' || !CStudioAuthoringWidgets) {
  var CStudioAuthoringWidgets = {};
}

/**
 * Icon Guide
 */
CStudioAuthoringWidgets.IconGuideDashboard =
  CStudioAuthoringWidgets.IconGuideDashboard ||
  function (widgetId, pageId) {
    this.widgetId = widgetId;
    this.pageId = pageId;
    this._self = this;
    this.showInprogressItems = false;
    this.expanded = true;
    this.hideEmptyRow = false;

    WcmDashboardWidgetCommon.init(this);

    this.setStatusIcons = function () {
      var statusIcons = CStudioAuthoring.Constants.WORKFLOWICONS,
        el,
        elClass;

      for (var key in statusIcons) {
        if (statusIcons.hasOwnProperty(key)) {
          elClass = statusIcons[key];
          el = document.getElementById('guide-' + key);
          YDom.addClass(el, elClass);
        }
      }
    };

    YAHOO.util.Event.onDOMReady(this.setStatusIcons);

    /**
     * get table data
     */
    this.retrieveTableData = function (sortBy, sortAscDesc, callback) {
      // never called
    };

    /**
     * callback to render the table headings
     */
    this.renderItemsHeading = function () {
      // doesn't get called because we never invoke retrieve table data
      return '';
    };

    /**
     * Call back to render each line item of the table
     */
    this.renderLineItem = function (item) {
      // doesn't get called because we never invoke retrieve table data
      return '';
    };
  };
