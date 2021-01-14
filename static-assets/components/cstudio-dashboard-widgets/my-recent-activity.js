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
var contextPath = location.protocol + '//' + location.hostname + ':' + location.port;

if (typeof CStudioAuthoringWidgets == 'undefined' || !CStudioAuthoringWidgets) {
  var CStudioAuthoringWidgets = {};
}

/**
 * my recent activity
 */
CStudioAuthoringWidgets.MyRecentActivityDashboard = function(widgetId, pageId) {
  this.widgetId = widgetId;
  this.pageId = pageId;
  this._self = this;
  this.excludeLiveItems = false;
  this.expanded = true;
  this.hideEmptyRow = false;
  this.defaultSortBy = 'eventDate';
  this.defaultSearchNumber = 10;
  this.tooltipLabels = null;
  WcmDashboardWidgetCommon.init(this);

  /**
   * get table data
   */
  this.retrieveTableData = function(sortBy, sortAscDesc, callback, retrieveTableData, filterByNumber, filterBy) {
    sortAscDesc = CStudioAuthoring.Utils.sortByAsc.init(sortBy, widgetId);

    CStudioAuthoring.Service.getUserActivitiesServices(
      CStudioAuthoringContext.site,
      CStudioAuthoringContext.user,
      sortBy,
      sortAscDesc,
      filterByNumber,
      filterBy,
      this.excludeLiveItems,
      callback
    );
  };

  /**
   * render widget specific controls
   */
  this.renderAuxControls = function(containerEl) {
    var listItemEl = document.createElement('li');
    var itemFilterEl = document.createElement('a');

    /**
     * adding loading image to go-live0queue widget
     */

    var liLoadingEl = document.createElement('li');
    liLoadingEl.id = 'loading-' + widgetId;
    var imgEl = document.createElement('i');
    imgEl.className += ' fa fa-spinner fa-spin fa-3x fa-fw';
    liLoadingEl.appendChild(imgEl);

    itemFilterEl.innerHTML = CMgs.format(langBundle, 'dashletMyRecentActivityHideLiveItems');
    itemFilterEl.href = 'javascript:void(0);';
    itemFilterEl.id = 'widget-expand-state-' + widgetId;
    listItemEl.appendChild(itemFilterEl);
    YDom.addClass(itemFilterEl, 'widget-expand-state btn btn-default btn-sm');

    var filterBydiv = document.createElement('li');
    // YDom.addClass(filterBydiv, "widget-FilterBy");

    var widgetFilterBy = CStudioAuthoring.Service.getWindowState(
      CStudioAuthoringContext.user,
      pageId,
      widgetId,
      'widgetFilterBy'
    );

    var filterByEl = WcmDashboardWidgetCommon.initFilterToWidget(widgetId, widgetFilterBy);
    filterBydiv.appendChild(filterByEl);

    containerEl.appendChild(liLoadingEl);
    containerEl.appendChild(listItemEl);
    containerEl.appendChild(filterBydiv);

    itemFilterEl._self = this;

    filterByEl._self = this;

    filterByEl.onchange = function() {
      var _self = this._self;
      var selectedItems = filterByEl.selectedIndex;

      filterByEl.options[0] = new Option('Pages', 'page', true, false);
      filterByEl.options[1] = new Option('Components', 'component', true, false);
      filterByEl.options[2] = new Option('Documents', 'document', true, false);
      filterByEl.options[3] = new Option('All', 'all', true, false);
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

    itemFilterEl.onclick = function() {
      var _self = this._self;

      _self.excludeLiveItems = !_self.excludeLiveItems;

      if (!_self.excludeLiveItems) {
        this.innerHTML = CMgs.format(langBundle, 'dashletMyRecentActivityHideLiveItems');
      } else {
        this.innerHTML = CMgs.format(langBundle, 'dashletMyRecentActivityShowLiveItems');
      }
      if (typeof WcmDashboardWidgetCommon != 'undefined') {
        WcmDashboardWidgetCommon.refreshAllDashboards();
      }
    };
  };

  /**
   * callback to render the table headings
   */
  this.renderItemsHeading = function() {
    var widgetId = this._self.widgetId,
      Common = WcmDashboardWidgetCommon;

    var header = [
      Common.getSimpleRow(
        'checkAll',
        widgetId,
        '<input title="Select all" class="dashlet-item-check" id="' +
          widgetId +
          'CheckAll" name="check-all" type="checkbox"/>',
        'minimize'
      ),
      Common.getSimpleRow(
        'internalName',
        widgetId,
        CMgs.format(langBundle, 'dashletMyRecentActivityColPageName'),
        'minimize'
      ),
      Common.getSimpleRow('edit', widgetId, CMgs.format(langBundle, 'dashletMyRecentActivityColEdit'), 'minimize'),
      Common.getSortableRow(
        'browserUri',
        widgetId,
        CMgs.format(langBundle, 'dashletMyRecentActivityColURL'),
        'maximize'
      ),
      '<th id="fullUri" class="hide"></th>',
      Common.getSimpleRow(
        'scheduledDate',
        widgetId,
        CMgs.format(langBundle, 'dashletMyRecentActivityColPublishDate'),
        ''
      ),
      Common.getSimpleRow(
        'userLastName',
        widgetId,
        CMgs.format(langBundle, 'dashletMyRecentActivityColLastEditedBy'),
        'alignRight minimize'
      ),
      Common.getSortableRow(
        'eventDate',
        widgetId,
        CMgs.format(langBundle, 'dashletMyRecentActivityColMyLastEdit'),
        'ttThColLast alignRight minimize'
      )
    ].join('');

    return header;
  };

  /**
   * Call back to render each line item of the table
   */
  this.renderLineItem = function(item) {
    var itemName = item.internalName;
    if (!itemName || itemName == '') {
      itemName = item.title;
    }
    if (!itemName || itemName == '') {
      itemName = item.name;
    }
    var browserUri = CStudioAuthoring.Operations.getPreviewUrl(item, false, true),
      fullUri = CrafterCMSNext.util.string.escapeHTML(item.uri),
      editLinkId = encodeURIComponent(
        'editLink_' + this.widgetId + '_' + WcmDashboardWidgetCommon.encodePathToNumbers(item.uri)
      ),
      fmt = CStudioAuthoring.Utils.formatDateFromString;

    //reducing max character length to support 1024 screen resolution
    var removeCharCount = window.innerWidth <= 1024 ? 5 : 0;
    var displayBrowserUri = WcmDashboardWidgetCommon.getFormattedString(browserUri, 80 - removeCharCount);
    var itemNameForDisplay = CrafterCMSNext.util.string.escapeHTML(
      WcmDashboardWidgetCommon.getFormattedString(itemName, 40 - removeCharCount, item.newFile)
    );
    var ttSpanId = encodeURIComponent('tt_' + this.widgetId + '_' + item.uri + '_' + (this.tooltipLabels.length + 1));
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
    itemNameForDisplay = CStudioAuthoring.Utils.replaceWithASCIICharacter(itemNameForDisplay);

    WcmDashboardWidgetCommon.insertEditLink(item, editLinkId);

    var currentDashboard = CStudioAuthoring.Utils.Cookies.readCookie('dashboard-selected'),
      currentCheckItem = CStudioAuthoring.Utils.Cookies.readCookie('dashboard-checked')
        ? JSON.parse(CStudioAuthoring.Utils.Cookies.readCookie('dashboard-checked'))[0]
        : null,
      currentBrowserUri = browserUri !== '' ? browserUri : '/';

    var itemRow = [
      '<td style="padding-right: 0">',
      '<div class="dashlet-ident">',
      `<input
        type="checkbox"
        class="dashlet-item-check"
        id="${this.widgetId}-${encodeURIComponent(item.uri)}"
        ${
          this.widgetId === currentDashboard &&
          currentCheckItem &&
          CStudioAuthoring.SelectedContent.getSelectedContent().length > 0 &&
          item.internalName.trim() === CStudioAuthoring.SelectedContent.getSelectedContent()[0].internalName.trim()
            ? ' checked'
            : ''
        }
        ${item.deleted || item.inFlight ? ' disabled' : ''}
      />`,
      '</div>',
      '</td>',
      '<td style="padding-left: 0" class="itemNameCol">',
      `<div class="${item.disabled ? 'disabled' : ''}" id="${ttSpanId}" title="${itemTitle}">`,
      /**/ CStudioAuthoring.Utils.getContentItemIcon(item).outerHTML,
      `<a
         class="anchorRow ${item.disabled == true ? ' dashboard-item disabled' : ''} ${
        item.previewable == true ? ' previewLink' : ' non-previewable-link'
      }"
         ${
           item.previewable
             ? `href="/studio/preview/#/?page=${currentBrowserUri}&site=${CStudioAuthoringContext.site}"`
             : ''
         }
       >`,
      /**/ itemNameForDisplay,
      '</a>',
      '</div>',
      '</td>',
      `<td id="${editLinkId}"></td>`,
      `<td class="urlCol" title="${browserUri}">`,
      /**/ displayBrowserUri,
      '</td>',
      '<td title="fullUri" class="width0">',
      /**/ fullUri,
      '</td>',
      '<td class="">',
      /**/ item.published ? CStudioAuthoring.Utils.formatDateFromUTC(item.publishedDate, studioTimeZone) : '',
      '</td>',
      '<td class="alignRight username trim">',
      /**/ WcmDashboardWidgetCommon.getDisplayName(item),
      '</td>',
      '<td class="ttThColLast alignRight">',
      /**/ CStudioAuthoring.Utils.formatDateFromUTC(item.eventDate, studioTimeZone),
      '</td>'
    ];

    var folderRow = [
      '<td style="padding-right:0px">',
      '<div class="dashlet-ident">',
      '</div>',
      '</td>',
      '<td style="padding-left:0px" class="itemNameCol">' + '<div class="',
      item.disabled == true ? ' disabled' : '',
      '" id="' + ttSpanId + '" title="' + itemTitle + '">',
      '<div class="icon-container  cs-item-icon"><span class="status-icon mr9 studio-fa-stack"><span class="fa studio-fa-stack-2x fa-folder-o"></span><span class=""></span></span></div>',
      '<a class="anchorRow',
      item.disabled == true ? ' dashboard-item disabled' : '',
      item.previewable == true ? ' previewLink' : ' non-previewable-link',
      '" ',
      item.previewable == true
        ? 'href="/studio/preview/#/?page=' + currentBrowserUri + '&site=' + CStudioAuthoringContext.site + '"'
        : '',
      '">',
      itemNameForDisplay,
      '</a>',
      '</div>',
      '</td>',
      '<td></td>',
      '<td class="urlCol" title="',
      browserUri,
      '">',
      displayBrowserUri,
      '</td>',
      '<td title="fullUri" class="width0">',
      fullUri,
      '</td>',
      '<td class="">',
      item.published ? CStudioAuthoring.Utils.formatDateFromUTC(item.publishedDate, studioTimeZone) : '',
      '</td>',
      '<td class="alignRight">',
      WcmDashboardWidgetCommon.getDisplayName(item),
      '</td>',
      '<td class="ttThColLast alignRight">',
      CStudioAuthoring.Utils.formatDateFromUTC(item.eventDate, studioTimeZone),
      '</td>'
    ];

    if (currentCheckItem && this.widgetId == currentDashboard) {
      CStudioAuthoring.Utils.Cookies.eraseCookie('dashboard-checked');
    }

    if (!item.folder) {
      return itemRow.join('');
    } else {
      return folderRow.join('');
    }
  };
};
