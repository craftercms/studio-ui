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

// "Approved Scheduled Items" Widget

var YDom = YAHOO.util.Dom;
var contextPath = location.protocol + '//' + location.hostname + ':' + location.port;

if (typeof CStudioAuthoringWidgets == 'undefined' || !CStudioAuthoringWidgets) {
  var CStudioAuthoringWidgets = {};
}

/**
 * approved scheduled items
 */
CStudioAuthoringWidgets.ApprovedScheduledItemsDashboard = function (widgetId, pageId) {
  this.widgetId = widgetId;
  this.pageId = pageId;
  this._self = this;
  this.showInprogressItems = false;
  this.expanded = true;
  this.hideEmptyRow = false;
  this.defaultSortBy = 'eventDate';
  this.tooltipLabels = null;
  this.showEdit = false;
  this.totalItems = 0;
  this.renderedItems = 0;
  WcmDashboardWidgetCommon.init(this);

  this.formatMessage = CrafterCMSNext.i18n.intl.formatMessage;
  this.messages = CrafterCMSNext.i18n.messages.dashboardWidgetsMessages;

  /**
   * get table data
   */
  this.retrieveTableData = function (sortBy, sortAscDesc, callback, retrieveTableData, filterByNumber, filterBy) {
    sortAscDesc = CStudioAuthoring.Utils.sortByAsc.init(sortBy, widgetId);
    CStudioAuthoring.Service.getScheduledItems(CStudioAuthoringContext.site, sortBy, sortAscDesc, filterBy, callback);
  };

  /**
   * callback to render the table headings
   */
  this.renderItemsHeading = function () {
    var widgetId = this._self.widgetId;
    var header =
      WcmDashboardWidgetCommon.getSimpleRow(
        'checkAll',
        widgetId,
        '<input title="Select all" class="dashlet-item-check" id="' +
          widgetId +
          'CheckAll" name="check-all" type="checkbox"/>',
        'minimize'
      ) +
      WcmDashboardWidgetCommon.getDefaultSortRow(
        'eventDate',
        widgetId,
        CMgs.format(langBundle, 'dashletApprovedSchedColGoLiveDate'),
        'minimize'
      ) +
      WcmDashboardWidgetCommon.getSimpleRow(
        'edit',
        widgetId,
        CMgs.format(langBundle, 'dashletApprovedSchedColEdit'),
        'minimize hidden'
      ) +
      WcmDashboardWidgetCommon.getSimpleRow(
        'browserUri',
        widgetId,
        CMgs.format(langBundle, 'dashletApprovedSchedColURL'),
        'maximize'
      ) +
      "<th id='fullUri' class='width0'></th>" +
      WcmDashboardWidgetCommon.getSimpleRow(
        'server',
        widgetId,
        this.formatMessage(this.messages.publishingTarget),
        'maximize'
      ) +
      WcmDashboardWidgetCommon.getSimpleRow(
        'packageId',
        widgetId,
        CMgs.format(langBundle, 'dashletApprovedSchedColPackageId'),
        'maximize'
      ) +
      WcmDashboardWidgetCommon.getSimpleRow(
        'lastEdit',
        widgetId,
        CMgs.format(langBundle, 'dashletApprovedSchedColLastEdited'),
        'ttThColLast alignRight minimize'
      );
    return header;
  };

  this.renderAuxControls = function (containerEl) {
    var liLoadingEl = document.createElement('li');
    liLoadingEl.id = 'loading-' + widgetId;
    var imgEl = document.createElement('i');
    imgEl.className += ' fa fa-spinner fa-spin fa-3x fa-fw';
    liLoadingEl.appendChild(imgEl);
    containerEl.appendChild(liLoadingEl);
    var filterBydiv = document.createElement('li');

    var widgetFilterBy = CStudioAuthoring.Service.getWindowState(
      CStudioAuthoringContext.user,
      pageId,
      widgetId,
      'widgetFilterBy'
    );

    var filterByEl = WcmDashboardWidgetCommon.initFilterToWidget(widgetId, widgetFilterBy);
    containerEl.appendChild(filterBydiv);

    filterBydiv.appendChild(filterByEl);

    filterByEl._self = this;

    filterByEl.onchange = function () {
      var _self = this._self;
      var selectedItems = filterByEl.selectedIndex;
      filterByEl.options[0] = new Option(
        CMgs.format(langBundle, 'dashletApprovedSchedFilterPages'),
        'page',
        true,
        false
      );
      filterByEl.options[1] = new Option(
        CMgs.format(langBundle, 'dashletApprovedSchedFilterComponents'),
        'component',
        true,
        false
      );
      filterByEl.options[2] = new Option(CMgs.format(langBundle, 'dashletApprovedSchedFilterAll'), 'all', true, false);
      filterByEl.options[selectedItems].selected = true;
      var newState = filterByEl.value;

      CStudioAuthoring.Service.setWindowState(
        CStudioAuthoringContext.user,
        pageId,
        widgetId,
        'widgetFilterBy',
        newState
      );

      if (typeof WcmDashboardWidgetCommon != 'undefined') {
        WcmDashboardWidgetCommon.refreshAllDashboards();
      }
    };
  };

  /**
   * Call back to render each line item of the table
   */
  this.renderLineItem = function (item, isFirst, count) {
    if (!item.folder) {
      var html = [],
        name = item.internalName,
        displayName = CrafterCMSNext.util.string.escapeHTML(
          WcmDashboardWidgetCommon.getFormattedString(name, 40, item.newFile)
        ),
        editLinkId;

      if (isFirst) {
        const formattedDate = CStudioAuthoring.Utils.formatDateFromUTC(name, studioTimeZone, 'medium');

        html.push('<td colspan="5">');

        if (item.numOfChildren > 0) {
          var parentClass = ['wcm-table-parent-', name, '-', count].join('');
          html = html.concat([
            '<span id="',
            parentClass,
            '"',
            'class="',
            item.children.length ? 'ttClose parent-div-widget' : 'ttOpen parent-div-widget',
            '"',
            'onclick="WcmDashboardWidgetCommon.toggleLineItem(\'' + parentClass + '\');" >',
            '</span>'
          ]);
        }

        html = html.concat([
          '<span class="wcm-widget-margin-align" title="',
          name,
          '">',
          formattedDate,
          ' (',
          item.numOfChildren,
          ')',
          '</span>',
          '</td>',
          `<td colspan="1" class="edit-${widgetId} hidden">&nbsp;</td>`
        ]);
      } else {
        var browserUri = CStudioAuthoring.Operations.getPreviewUrl(item, false, true),
          displayBrowserUri = WcmDashboardWidgetCommon.getFormattedString(browserUri, 80),
          uri = item.uri,
          environment = item.environment,
          packageId = item.packageId;

        editLinkId = 'editLink_' + this.widgetId + '_' + WcmDashboardWidgetCommon.encodePathToNumbers(item.uri);

        var ttSpanId = 'tt_' + this.widgetId + '_' + item.uri + '_' + (this.tooltipLabels.length + 1);
        var itemTitle = CStudioAuthoring.Utils.getTooltipContent(item);
        this.tooltipLabels.push(ttSpanId);

        if (item.component && item.internalName == 'crafter-level-descriptor.level.xml') {
          browserUri = '';
          displayBrowserUri = '';
        }

        var itemIconStatus = CStudioAuthoring.Utils.getIconFWClasses(item);
        itemIconStatus += item.disabled && !item.previewable ? ' non-previewable-disabled' : '';

        // this API will replace double quotes with ASCII character
        // to resolve page display issue
        displayName = CStudioAuthoring.Utils.replaceWithASCIICharacter(displayName);

        var lastEditTime = CStudioAuthoring.Utils.formatDateFromUTC(item.lastEditDate, studioTimeZone);
        WcmDashboardWidgetCommon.insertEditLink(item, editLinkId, this.widgetId);

        var currentDashboard = CStudioAuthoring.Utils.Cookies.readCookie('dashboard-selected'),
          currentCheckItem = CStudioAuthoring.Utils.Cookies.readCookie('dashboard-checked')
            ? JSON.parse(CStudioAuthoring.Utils.Cookies.readCookie('dashboard-checked'))[0]
            : null,
          currentBrowserUri = browserUri !== '' ? browserUri : '/';

        html = html.concat([
          '<td style="padding-right:0px">',
          '<div class="dashlet-ident">',
          '<input type="checkbox" class="dashlet-item-check" id="',
          uri,
          this.widgetId == currentDashboard &&
          currentCheckItem &&
          CStudioAuthoring.SelectedContent.getSelectedContent().length > 0 &&
          item.internalName.trim() == CStudioAuthoring.SelectedContent.getSelectedContent()[0].internalName.trim()
            ? ' checked'
            : '',
          '"',
          item.inFlight ? ' disabled' : '',
          ' />',
          '</div>',
          '</td>',
          '<td style="padding-left:0px" class="itemNameCol">' + '<div class="',
          item.disabled == true ? ' disabled' : '',
          '" id="' + ttSpanId + '" title="' + itemTitle + '">',
          // '<span class="iconRow ', itemIconStatus, '"></span>',
          CStudioAuthoring.Utils.getContentItemIcon(item).outerHTML,
          '<a class="anchorRow',
          item.disabled == true ? ' dashboard-item disabled' : '',
          item.previewable == true ? ' previewLink' : ' non-previewable-link',
          '" ',
          item.previewable == true
            ? 'href="/studio/preview/#/?page=' + currentBrowserUri + '&site=' + CStudioAuthoringContext.site + '"'
            : '',
          '">',
          displayName,
          '</a>',
          '</div>',
          '</td>',
          `<td id="${editLinkId}" class="edit-${widgetId} hidden"></td>`,
          "<td class='urlCol' title='",
          browserUri,
          "'>",
          displayBrowserUri,
          '</td>',
          "<td title='fullUri' class='width0'>",
          uri,
          '</td>',
          "<td title='server'>",
          environment,
          '</td>',
          "<td title='packageId'>",
          packageId,
          '</td>',
          "<td class='alignRight ttThColLast'>",
          lastEditTime,
          '</td>'
        ]);
      }

      if (currentCheckItem && this.widgetId == currentDashboard) {
        CStudioAuthoring.Utils.Cookies.eraseCookie('dashboard-checked');
      }

      return html.join('');
    }
  };
};
