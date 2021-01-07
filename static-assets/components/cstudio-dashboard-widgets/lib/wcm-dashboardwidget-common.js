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
var YEvent = YAHOO.util.Event;
var subChildren = null;
var configTimeZone = null;

if (typeof WcmDashboardWidgetCommon == 'undefined' || !WcmDashboardWidgetCommon) {
  var WcmDashboardWidgetCommon = {};
}

WcmDashboardWidgetCommon.dashboards = new Array();

WcmDashboardWidgetCommon.sortClick = function(event, matchedEl, el, params) {
  //var eventId='sorteventDate-component-1-1';
  var eventId = matchedEl.id;
  var sortBy = eventId.substring(4, eventId.indexOf('-'));
  var Widget = WcmDashboardWidgetCommon.dashboards[params.widgetId];
  WcmDashboardWidgetCommon.loadTableData(sortBy, YDom.get(params.widgetId), params.widgetId, null, true);
};

WcmDashboardWidgetCommon.encodePathToNumbers = function(path) {
  var re1 = new RegExp('/', 'g');

  var res = path.replace(re1, '00'); // substitute all forward slash with '00'
  res = res.replace(/\./g, '010'); // substitute all periods with '010'
  return res;
};

WcmDashboardWidgetCommon.insertEditLink = function(item, editLinkId) {
  if (CStudioAuthoring.Utils.isEditableFormAsset(item.mimeType)) {
    CStudioAuthoring.Service.getUserPermissions(CStudioAuthoringContext.site, item.uri, {
      success: function(results) {
        function addEditLink() {
          var editLink = document.getElementById(editLinkId);

          if (editLink) {
            editLink.innerHTML = ''.concat(
              '<a href="javascript:" class="editLink',
              item.deleted || item.inFlight ? ' non-previewable-edit' : '',
              '">' + CMgs.format(langBundle, 'dashboardEdit') + '</a>'
            );
          } else {
            // We cannot assume the DOM will be ready to insert the edit link
            // that's why we'll poll until the element is available in the DOM
            setTimeout(addEditLink, 200);
          }
        }

        var isUserAllowed = CStudioAuthoring.Service.isUserAllowed(results.permissions);

        if (isUserAllowed) {
          // If the user's role is allowed to edit the content then add an edit link
          addEditLink();
        }
      },
      failure: function() {
        throw new Error('Unable to retrieve user permissions');
      }
    });
  }
};

WcmDashboardWidgetCommon.insertViewLink = function(item, viewLinkId) {
  if (CStudioAuthoring.Utils.isEditableFormAsset(item.mimeType)) {
    CStudioAuthoring.Service.getUserPermissions(CStudioAuthoringContext.site, item.uri, {
      success: function(results) {
        function addViewLink() {
          var viewLink = document.getElementById(viewLinkId);

          if (viewLink) {
            viewLink.innerHTML = ''.concat(
              '<a href="javascript:" class="viewLink',
              item.deleted || item.inFlight ? ' non-previewable-edit' : '',
              '">' + CMgs.format(langBundle, 'dashletGoLiveColView') + '</a>'
            );
          } else {
            // We cannot assume the DOM will be ready to insert the edit link
            // that's why we'll poll until the element is available in the DOM
            setTimeout(addViewLink, 200);
          }
        }

        var isUserAllowed = CStudioAuthoring.Service.isUserAllowed(results.permissions);

        if (isUserAllowed) {
          // If the user's role is allowed to edit the content then add an edit link
          addViewLink();
        }
      },
      failure: function() {
        throw new Error('Unable to retrieve user permissions');
      }
    });
  }
};

WcmDashboardWidgetCommon.convertDate = function(dateString) {
  if (!dateString) return 0;
  //our eventDate are passing in the format "YYYY-MM-DDTHH:MM:SS;"
  var dateObj = null;
  var dateArray = dateString.split('T');
  if (dateArray && dateArray.length == 2) {
    var dtArray = dateArray[0].split('-');
    var tmArray = dateArray[1].split(':');
    if (dtArray && dtArray.length == 3 && tmArray && tmArray.length >= 3) {
      dateObj = new Date(
        parseInt(dtArray[0], 10),
        parseInt(dtArray[1], 10),
        parseInt(dtArray[2], 10),
        parseInt(tmArray[0], 10),
        parseInt(tmArray[1], 10),
        parseInt(tmArray[2], 10)
      );
    }
  }

  if (dateObj) return dateObj;
  return 0;
};

WcmDashboardWidgetCommon.sortItems = function(items, currentSortBy, currentSortType) {
  try {
    items.sort(function(firstItem, secondItem) {
      if (currentSortBy == 'userLastName') {
        var firstItemVal = firstItem[currentSortBy];
        var secondItemVal = secondItem[currentSortBy];
        if (!firstItemVal) {
          firstItemVal = firstItem['userFirstName'];
        }
        if (!secondItemVal) {
          secondItemVal = secondItem['userFirstName'];
        }

        if (firstItemVal && secondItemVal) {
          firstItemVal = firstItemVal.toLowerCase();
          secondItemVal = secondItemVal.toLowerCase();

          if (firstItemVal && secondItemVal) {
            if (currentSortType == 'true') {
              return firstItemVal == secondItemVal ? 0 : firstItemVal < secondItemVal ? -1 : 1;
            } else {
              return firstItemVal == secondItemVal ? 0 : secondItemVal < firstItemVal ? -1 : 1;
            }
          }
        }
      } else if (currentSortBy == 'eventDate' || currentSortBy == 'scheduledDate') {
        var firstDate = WcmDashboardWidgetCommon.convertDate(firstItem[currentSortBy]);
        var secondDate =
          WcmDashboardWidgetCommon.convertDate(secondItem[currentSortBy]) != 0
            ? WcmDashboardWidgetCommon.convertDate(secondItem[currentSortBy])
            : new Date(0);
        if (currentSortType == 'true') {
          return firstDate == secondDate ? 0 : firstDate < secondDate ? -1 : 1;
        } else {
          return firstDate == secondDate ? 0 : secondDate < firstDate ? -1 : 1;
        }
      } else if (!isNaN(firstItem[currentSortBy]) && !isNaN(secondItem[currentSortBy])) {
        var firstValue = parseInt(firstItem[currentSortBy], 10);
        var secondValue = parseInt(secondItem[currentSortBy], 10);
        if (currentSortType == 'true') {
          return firstValue == secondValue ? 0 : firstValue < secondValue ? -1 : 1;
        } else {
          return firstValue == secondValue ? 0 : secondValue < firstValue ? -1 : 1;
        }
      } else if (typeof firstItem[currentSortBy] == 'string') {
        var firstString = firstItem[currentSortBy].toLowerCase();
        var secondString = secondItem[currentSortBy].toLowerCase();
        if (currentSortType == 'true') {
          return firstString == secondString ? 0 : firstString < secondString ? -1 : 1;
        } else {
          return firstString == secondString ? 0 : secondString < firstString ? -1 : 1;
        }
      }
      return 0;
    });
  } catch (err) {}
  return items;
};

/*
 * get level 2 and beyond children (becomes a flat stucture)
 */
WcmDashboardWidgetCommon.getChilderenRecursive = function(items) {
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    subChildren.push(item);
    // add further dependencies
    if (item.children && item.children.length > 0) {
      WcmDashboardWidgetCommon.getChilderenRecursive(item.children);
    }
  }
};

/*
 * build level 2 and beyond children (becomes a flat stucture)
 */
WcmDashboardWidgetCommon.getSubSubChilderen = function(table, parentClass, items, widgetId, depth) {
  var rowHtml = '';
  var instance = WcmDashboardWidgetCommon.dashboards[widgetId];

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    //rowHtml += "<tr class='" + parentClass + "'><td colspan='5' class='ttBlankRow3'></td></tr>";

    var itemRowStart = "<tr class='" + parentClass + "'>";

    var itemRowEnd = '</tr>';

    //create table row for this item
    var itemRow = WcmDashboardWidgetCommon.buildItemTableRow(item, instance, false, i, depth);

    rowHtml += itemRowStart + itemRow + itemRowEnd;
  }

  return rowHtml;
};

WcmDashboardWidgetCommon.getDisplayName = function(item) {
  var displayName = '';
  var hasLastName = !CStudioAuthoring.Utils.isEmpty(item.userLastName);
  if (hasLastName) {
    displayName += item.userLastName;
  }

  var hasFirstName = !CStudioAuthoring.Utils.isEmpty(item.userFirstName);
  if (hasFirstName) {
    displayName += hasLastName ? ', ' + item.userFirstName : item.userFirstName;
  }
  return displayName;
};

WcmDashboardWidgetCommon.getFormattedString = function(str, maxLength, isNewFile) {
  var formattedString = '';
  if (str != undefined && str != null) {
    if (str.length > maxLength) {
      formattedString = str.substring(0, maxLength) + '...';
    } else {
      formattedString = str;
    }
  }
  if (isNewFile) formattedString = formattedString + '*';

  return formattedString;
};

WcmDashboardWidgetCommon.Ajax = {
  container: null,
  loadingImage: null,
  disableDashboard: function() {
    if (WcmDashboardWidgetCommon.Ajax.container != null) {
      document.body.removeChild(WcmDashboardWidgetCommon.Ajax.container);
    }
    if (WcmDashboardWidgetCommon.Ajax.loadingImage != null) {
      document.body.removeChild(WcmDashboardWidgetCommon.Ajax.loadingImage);
    }
    var container = YDom.get();
    WcmDashboardWidgetCommon.Ajax.container = document.createElement('div');
    with (WcmDashboardWidgetCommon.Ajax.container.style) {
      backgroundColor = '#FFFFFF';
      opacity = '0';
      position = 'absolute';
      //display = "block";
      width = YDom.getDocumentWidth() + 'px';
      height = YDom.getDocumentHeight() + 'px';
      top = '0';
      right = '0';
      bottom = '0';
      left = '0';
      zIndex = '1000';
    }

    WcmDashboardWidgetCommon.Ajax.loadingImage = document.createElement('i');
    WcmDashboardWidgetCommon.Ajax.loadingImage.className = ' fa fa-spinner fa-spin fa-3x fa-fw';

    document.body.appendChild(WcmDashboardWidgetCommon.Ajax.container);
    document.body.appendChild(WcmDashboardWidgetCommon.Ajax.loadingImage);

    var imagePopUp = new YAHOO.widget.Overlay(WcmDashboardWidgetCommon.Ajax.loadingImage);
    imagePopUp.center();
    imagePopUp.render();
  },
  enableDashboard: function() {
    if (WcmDashboardWidgetCommon.Ajax.container != null) {
      document.body.removeChild(WcmDashboardWidgetCommon.Ajax.container);
      WcmDashboardWidgetCommon.Ajax.container = null;
    }
    if (WcmDashboardWidgetCommon.Ajax.loadingImage != null) {
      document.body.removeChild(WcmDashboardWidgetCommon.Ajax.loadingImage);
      WcmDashboardWidgetCommon.Ajax.loadingImage = null;
    }
  }
};

WcmDashboardWidgetCommon.hideURLCol = function() {
  if ($('.container').width() < 707) {
    $('.urlCol').each(function() {
      $(this).hide();
    });
    $("th[id*='browserUri-']").each(function() {
      $(this).hide();
    });
  } else {
    $('.urlCol').each(function() {
      $(this).show();
    });
    $("th[id*='browserUri-']").each(function() {
      $(this).show();
    });
  }
};

/**
 * init widget
 */
WcmDashboardWidgetCommon.init = function(instance) {
  var widgetId = instance.widgetId;
  var sortBy = instance.defaultSortBy;
  var pageId = instance.pageId;
  var hideEmptyRow = instance.hideEmptyRow;

  /////////////////////////////////////////////////////
  // added to protect un wanted values in text boxes //
  ////////////////////////////////////////////////////
  if (YDom.get('widget-showitems-' + widgetId) != null) {
    YDom.get('widget-showitems-' + widgetId).value = 10;
    YDom.get('widget-showitems-' + widgetId + '-label').innerHTML = CMgs.format(langBundle, 'showNumItems');
  }

  YEvent.onAvailable(widgetId, function() {
    WcmDashboardWidgetCommon.dashboards[widgetId] = instance;
    dashboardEl = YDom.get(widgetId);
    dashboardEl.style.display = 'none';

    var hasPermsForDashboardFn = function(perms, permission) {
      var hasPerm = false;

      for (var k = 0; k < perms.permissions.length; k++) {
        if (permission == perms.permissions[k]) {
          hasPerm = true;
          break;
        }
      }

      return hasPerm;
    };

    var getPermsCb = {
      widgetId: widgetId,
      dashboardEl: dashboardEl,

      success: function(perms) {
        WcmDashboardWidgetCommon.cachedPerms = perms;
        var dashboardEl = this.dashboardEl;

        var permission = 'none';
        if (
          this.widgetId == 'GoLiveQueue' ||
          this.widgetId == 'recentlyMadeLive' ||
          this.widgetId == 'approvedScheduledItems'
        ) {
          permission = 'publish';
        }

        if (
          this.widgetId == 'icon-guide' ||
          this.widgetId == 'MyRecentActivity' ||
          hasPermsForDashboardFn(perms, permission)
        ) {
          dashboardEl.style.display = 'block';

          dashboardEl.instance = instance;

          var state = WcmDashboardWidgetCommon.getCurrentWidgetTogglePreference(widgetId, pageId);

          WcmDashboardWidgetCommon.toggleWidget(widgetId, pageId, state);

          var checkboxClick = function(event, matchedEl) {
            CStudioAuthoring.Utils.Cookies.createCookie('dashboard-selected', instance.widgetId.trim());
            if (instance.onCheckedClickHandler) {
              instance.onCheckedClickHandler(event, matchedEl);
            } else {
              WcmDashboardWidgetCommon.selectItem(matchedEl, matchedEl.checked);
            }
            isChecked();
          };

          var isChecked = function() {
            var inputsElt = YDom.get(instance.widgetId + '-tbody').getElementsByClassName('dashlet-item-check');
            var checkedElts = false;
            var checkAllElt = YDom.get(instance.widgetId + 'CheckAll');
            for (var i = 0; i < inputsElt.length; i++) {
              if (inputsElt[i].checked == true) {
                checkedElts = true;
              }
            }
            if (checkedElts) {
              checkAllElt.checked = true;
            } else {
              checkAllElt.checked = false;
            }
          };

          var editClick = function(event, matchedEl) {
            WcmDashboardWidgetCommon.editItem(matchedEl, matchedEl.checked);

            matchedEl.style.pointerEvents = 'none';
            if (typeof CStudioAuthoring.editDisabled === 'undefined') {
              CStudioAuthoring.editDisabled = [];
            }
            CStudioAuthoring.editDisabled.push(matchedEl);
          };

          var viewClick = function(event, matchedEl) {
            WcmDashboardWidgetCommon.viewItem(matchedEl, matchedEl.checked);
          };

          var previewClick = function(event, matchedEl) {
            WcmDashboardWidgetCommon.previewItem(matchedEl, matchedEl.checked);
          };

          var dispatchLinkClick = function(event, matchedEl) {
            if (matchedEl.className.indexOf('previewLink') != -1) {
              previewClick(event, matchedEl);
            } else if (matchedEl.className.indexOf('viewLink') != -1) {
              viewClick(event, matchedEl);
            } else if (
              matchedEl.className.indexOf('editLink') != -1 &&
              matchedEl.className.indexOf('non-previewable-edit') == -1
            ) {
              editClick(event, matchedEl);
            }
          };

          YEvent.delegate(widgetId, 'click', checkboxClick, 'input:not(#' + widgetId + 'CheckAll)');
          YEvent.delegate(widgetId, 'click', dispatchLinkClick, 'a');

          var searchLimitInput = YDom.get('widget-showitems-' + widgetId);
          var filterByCount = null;
          if (searchLimitInput) {
            var searchNumber = CStudioAuthoring.Service.getWindowState(
              CStudioAuthoringContext.user,
              pageId,
              widgetId,
              'searchNumber'
            );
            if (searchNumber && !isNaN(searchNumber)) {
              searchLimitInput.value = parseInt(searchNumber, 10);
            } else {
              searchLimitInput.value = instance.defaultSearchNumber;
            }

            filterByCount = isNaN(searchLimitInput.value) ? 10 : parseInt(searchLimitInput.value, 10);
          }

          var widgetFilterBy = CStudioAuthoring.Service.getWindowState(
            CStudioAuthoringContext.user,
            pageId,
            widgetId,
            'widgetFilterBy'
          );
          var filterByEl = YDom.get('widget-filterBy-' + widgetId);
          if (widgetFilterBy && widgetFilterBy != undefined && widgetFilterBy != '') {
            WcmDashboardWidgetCommon.loadFilterTableData(
              sortBy,
              YDom.get(widgetId),
              widgetId,
              filterByCount,
              widgetFilterBy
            );
          } else if (filterByCount != null) {
            WcmDashboardWidgetCommon.loadTableData(sortBy, YDom.get(widgetId), widgetId, filterByCount);
          } else {
            WcmDashboardWidgetCommon.loadTableData(sortBy, YDom.get(widgetId), widgetId);
          }

          var controlsListEl =
            YDom.getElementsByClassName('cstudio-widget-controls', null, dashboardEl)[0] ||
            YDom.getElementsByClassName('widget-controls', null, dashboardEl)[0];

          if (controlsListEl) {
            if (instance.renderAuxControls) {
              instance.renderAuxControls(controlsListEl, widgetId);
            }
          }

          if (state == 'closed') {
            YDom.setStyle(YAHOO.util.Selector.query('#' + widgetId + ' .widget-FilterBy')[0], 'display', 'none');
          }

          //attach keydown event to search limit input
          if (searchLimitInput) {
            var isInt = function(val) {
              var parsedVal = parseInt(val);
              if (isNaN(parsedVal) || val == '0') return false;
              return val == parsedVal && val.toString() == parsedVal.toString();
            };

            var searchLimitInputEvent = function(event) {
              var searchNumber = searchLimitInput.value;

              //added to protect non numeric input.
              if (event.keyCode == '13' || event.type === 'blur') {
                if (!isInt(searchNumber)) {
                  //execute the ajax only if its a number
                  searchLimitInput.value = instance.defaultSearchNumber;
                  searchNumber = searchLimitInput.value;
                }

                //var searchNumber=searchLimitInput.value;
                if (isInt(searchNumber)) {
                  //execute the ajax only if its a integer number.
                  searchNumber = searchNumber.replace(/\+/g, '').replace(/\-/g, '');
                  searchLimitInput.value = searchNumber;
                  CStudioAuthoring.Service.setWindowState(
                    CStudioAuthoringContext.user,
                    pageId,
                    widgetId,
                    'searchNumber',
                    searchNumber
                  );
                  var sortBy = instance.currentSortBy ? instance.currentSortBy : instance.defaultSortBy;
                  var filterByEl = YDom.get('widget-filterBy-' + widgetId);
                  if (filterByEl && filterByEl.value != undefined && filterByEl.value != '') {
                    WcmDashboardWidgetCommon.loadFilterTableData(
                      sortBy,
                      YDom.get(widgetId),
                      widgetId,
                      searchNumber,
                      filterByEl.value
                    );
                  } else {
                    WcmDashboardWidgetCommon.loadTableData(sortBy, YDom.get(widgetId), widgetId, searchNumber);
                  }
                } else {
                  searchLimitInput.value = instance.defaultSearchNumber;
                }
              }
            };

            var validateSearchLimitInputValue = function(event) {
              var searchNum = searchLimitInput.value;
              //insert default value if invalid
              if (!isInt(searchNum)) {
                searchLimitInput.value = instance.defaultSearchNumber;
              } else {
                searchLimitInputEvent(event);
              }
            };

            YEvent.addListener(searchLimitInput, 'keyup', searchLimitInputEvent);
            YEvent.addListener(searchLimitInput, 'blur', validateSearchLimitInputValue);
          }
        }
      },

      failure: function() {}
    };

    if (WcmDashboardWidgetCommon.cachedPerms) {
      getPermsCb.success(WcmDashboardWidgetCommon.cachedPerms);
    } else {
      CStudioAuthoring.Service.getUserPermissions(CStudioAuthoringContext.site, '~DASHBOARD~', getPermsCb);
    }

    $(window).resize(function() {
      WcmDashboardWidgetCommon.hideURLCol();
    });
  });
};

WcmDashboardWidgetCommon.getSimpleRow = function(prefix, widgetId, rowTitle, classes) {
  var row =
    '<th id="' +
    prefix +
    '-' +
    widgetId +
    '" class="' +
    classes +
    '">' +
    '<span>' +
    rowTitle +
    '</span>' +
    '</span>' +
    '</th>';
  return row;
};

WcmDashboardWidgetCommon.getSortableRow = function(prefix, widgetId, rowTitle, classes) {
  var row =
    '<th id="' +
    prefix +
    '-' +
    widgetId +
    '" class="' +
    classes +
    '">' +
    '<span>' +
    '<a href="javascript:void(0);" id="sort' +
    prefix +
    '-' +
    widgetId +
    '">' +
    rowTitle +
    '</a>' +
    '<span class="wcm-widget-margin"/>' +
    '</span>' +
    '<span id="sortIcon-' +
    prefix +
    '-' +
    widgetId +
    '" class="ttSortDesc wcm-go-live-sort-columns-' +
    widgetId +
    '" style="display:none"></span>' +
    '</th>';
  return row;
};
WcmDashboardWidgetCommon.getDefaultSortRow = function(prefix, widgetId, rowTitle, classes) {
  var row =
    '<th id="' +
    prefix +
    '-' +
    widgetId +
    '" class="' +
    classes +
    '">' +
    '<span>' +
    rowTitle +
    '<span class="wcm-widget-margin"/>' +
    '</span>' +
    '<span id="sortIcon-' +
    prefix +
    '-' +
    widgetId +
    '" class="ttSortBlack"></span>' +
    '</th>';
  return row;
};
/**
 * open and close a given dashboard widget
 */
WcmDashboardWidgetCommon.toggleWidget = function(widgetId, pageId, newState) {
  var widgetBodyEl = YDom.get(widgetId + '-body');
  var widgetToggleEl = YDom.get('widget-toggle-' + widgetId) || {};
  var currentState = widgetToggleEl ? (widgetToggleEl.className == 'ttOpen' ? 'closed' : 'open') : 'open';
  var collapseCookie = CStudioAuthoringContext.site + '-' + widgetId + '-panel';
  var link = YDom.get('section-widget-' + widgetId);

  if (YAHOO.lang.isUndefined(newState)) {
    newState = currentState == 'closed' ? 'open' : 'closed';
  }

  if (newState == 'closed') {
    widgetToggleEl.className = 'ttOpen';
    widgetBodyEl.style.display = 'none';
    YDom.addClass(link, 'studio-section-widget-close');
    YDom.setStyle('expand-all-' + widgetId, 'display', 'none');
    YDom.setStyle('widget-expand-state-' + widgetId, 'display', 'none');
    YDom.setStyle(YAHOO.util.Selector.query('#' + widgetId + ' .recently-made-live')[0], 'display', 'none');
    YDom.setStyle(YAHOO.util.Selector.query('#' + widgetId + ' .recently-made-live-right')[0], 'display', 'none');
    YDom.setStyle(YAHOO.util.Selector.query('#' + widgetId + ' .widget-FilterBy')[0], 'display', 'none');
  } else {
    if (!CStudioAuthoring.Utils.Cookies.readCookie(collapseCookie)) {
      widgetBodyEl.style.display = 'block';
    } else {
      YDom.addClass(link, 'studio-section-widget-close');
    }
    widgetToggleEl.className = 'ttClose';
    YDom.setStyle('expand-all-' + widgetId, 'display', 'block');
    YDom.setStyle('widget-expand-state-' + widgetId, 'display', 'block');
    YDom.setStyle(YAHOO.util.Selector.query('#' + widgetId + ' .recently-made-live')[0], 'display', 'block');
    YDom.setStyle(YAHOO.util.Selector.query('#' + widgetId + ' .recently-made-live-right')[0], 'display', 'block');
    YDom.setStyle(YAHOO.util.Selector.query('#' + widgetId + ' .widget-FilterBy')[0], 'display', 'block');
  }

  CStudioAuthoring.Service.setWindowState(CStudioAuthoringContext.user, pageId, widgetId, 'widgetToggle', newState);

  return false;
};

/**
 * get user's preference on widget state
 */
WcmDashboardWidgetCommon.getCurrentWidgetTogglePreference = function(widgetId, pageId) {
  var widgetState = '';

  widgetState = CStudioAuthoring.Service.getWindowState(CStudioAuthoringContext.user, pageId, widgetId, 'widgetToggle');

  return widgetState;
};

/**
 * toggle (expand or collapse) a given line item
 */
WcmDashboardWidgetCommon.toggleLineItem = function(id, ignoreParent) {
  var parentId = YDom.get(id),
    childItems = CStudioAuthoring.Utils.getElementsByClassName(id),
    length = childItems.length,
    idx,
    item;

  if (parentId.className == 'ttClose parent-div-widget') {
    for (idx = 0; idx < length; idx++) {
      item = childItems[idx];
      if (item) {
        item.style.display = 'none';
      }
    }
    parentId.className = 'ttOpen parent-div-widget';
  } else {
    for (idx = 0; idx < length; idx++) {
      item = childItems[idx];
      if (item) {
        item.style.display = '';
      }
    }
    parentId.className = 'ttClose parent-div-widget';
  }

  // If all lines are collapsed, then the header link should change to "Expand All" and vice versa.
  var expandAll = false,
    tableEl = YDom.getAncestorByTagName(id, 'table'),
    rows = tableEl.rows,
    arr = [],
    widgetId = tableEl.id.split('-')[0],
    widget = YDom.get(widgetId),
    linkEl = YDom.get('expand-all-' + widgetId);

  for (idx = 0; idx < rows.length; idx++) {
    if (rows[idx].className === 'avoid' || rows[idx].className == '') {
      continue;
    } else {
      arr.push(rows[idx]);
    }
  }

  for (idx = 0; idx < arr.length; idx++) {
    if (arr[idx].style.display === 'none') {
      expandAll = true;
      break;
    }
  }

  if (!ignoreParent) {
    this.toggleHeaderLink(widget, linkEl, expandAll);
  }
};

WcmDashboardWidgetCommon.toggleHeaderLink = function(widget, linkEl, showCollapsed) {
  if (showCollapsed) {
    linkEl.setAttribute('href', 'javascript:void(0);');
    linkEl.innerHTML = CMgs.format(langBundle, 'dashboardExpandAll');
    linkEl.className = 'btn btn-default btn-sm widget-collapse-state';
    widget.instance.expanded = false;
  } else {
    linkEl.setAttribute('href', 'javascript:void(0);');
    linkEl.innerHTML = CMgs.format(langBundle, 'dashboardCollapseAll');
    linkEl.className = 'btn btn-default btn-sm widget-expand-state';
    widget.instance.expanded = true;
  }
};

/**
 * toggle All items
 */
WcmDashboardWidgetCommon.toggleAllItems = function(widgetId) {
  var widget = YDom.get(widgetId),
    instance = widget.instance,
    link = YDom.get('expand-all-' + widgetId),
    items = YDom.getElementsByClassName('parent-div-widget', null, widget),
    item,
    length = items.length;

  for (var count = 0; count < length; count++) {
    item = items[count];
    if (item) {
      item.className = instance.expanded ? 'ttClose parent-div-widget' : 'ttOpen parent-div-widget';
      this.toggleLineItem(item.id, true);
    }
  }

  this.toggleHeaderLink(widget, link, instance.expanded);
};

/**
 * toggle the whole table
 */
WcmDashboardWidgetCommon.toggleTable = function(widgetId) {
  var table = YDom.get(widgetId + '-body'),
    link = YDom.get('section-widget-' + widgetId),
    site = CStudioAuthoringContext.site;

  if (!YDom.hasClass(link, 'studio-section-widget-close')) {
    YDom.setStyle(table, 'display', 'none');
    YDom.addClass(link, 'studio-section-widget-close');
    CStudioAuthoring.Utils.Cookies.createCookie(site + '-' + widgetId + '-panel', 'collapse');
  } else {
    YDom.setStyle(table, 'display', 'block');
    YDom.removeClass(link, 'studio-section-widget-close');
    CStudioAuthoring.Utils.Cookies.eraseCookie(site + '-' + widgetId + '-panel');
  }
};

/**
 * edit an item
 */
WcmDashboardWidgetCommon.editItem = function(matchedElement, isChecked) {
  const path = WcmDashboardWidgetCommon.getItemPathFromMatchedElement(matchedElement);
  const type = CrafterCMSNext.util.content.getSystemTypeFromPath(path);
  const site = CrafterCMSNext.system.store.getState().sites.active;
  const authoringBase = CrafterCMSNext.system.store.getState().env.authoringBase;
  const legacyFormSrc = `${authoringBase}/legacy/form?`;

  if (['page', 'component', 'taxonomy'].includes(type)) {
    const src = `${legacyFormSrc}site=${site}&path=${path}&type=form`;

    CrafterCMSNext.services.content.fetchWorkflowAffectedItems(site, path).subscribe((items) => {
      let eventIdSuccess = 'editDialogSuccess';
      let eventIdDismissed = 'editDialogDismissed';
      let unsubscribe, cancelUnsubscribe;
      if (items && items.length > 0) {
        CrafterCMSNext.system.store.dispatch({
          type: 'SHOW_WORKFLOW_CANCELLATION_DIALOG',
          payload: {
            items,
            onContinue: {
              type: 'SHOW_EDIT_DIALOG',
              payload: {
                src,
                onSaveSuccess: {
                  type: 'BATCH_ACTIONS',
                  payload: [
                    {
                      type: 'DISPATCH_DOM_EVENT',
                      payload: { id: eventIdSuccess }
                    },
                    {
                      type: 'SHOW_EDIT_ITEM_SUCCESS_NOTIFICATION'
                    },
                    {
                      type: 'RELOAD_DETAILED_ITEM',
                      payload: {
                        path
                      }
                    }
                  ]
                },
                onCancel: {
                  type: 'BATCH_ACTIONS',
                  payload: [
                    {
                      type: 'CLOSE_EDIT_DIALOG'
                    },
                    {
                      type: 'DISPATCH_DOM_EVENT',
                      payload: { id: eventIdDismissed }
                    }
                  ]
                }
              }
            },
            onClose: {
              type: 'BATCH_ACTIONS',
              payload: [
                {
                  type: 'CLOSE_WORKFLOW_CANCELLATION_DIALOG'
                },
                {
                  type: 'DISPATCH_DOM_EVENT',
                  payload: { id: eventIdDismissed }
                }
              ]
            }
          }
        });
      } else {
        CrafterCMSNext.system.store.dispatch({
          type: 'SHOW_EDIT_DIALOG',
          payload: {
            src,
            onSaveSuccess: {
              type: 'BATCH_ACTIONS',
              payload: [
                {
                  type: 'DISPATCH_DOM_EVENT',
                  payload: { id: eventIdSuccess }
                },
                {
                  type: 'SHOW_EDIT_ITEM_SUCCESS_NOTIFICATION'
                },
                {
                  type: 'RELOAD_DETAILED_ITEM',
                  payload: {
                    path
                  }
                }
              ]
            },
            onCancel: {
              type: 'BATCH_ACTIONS',
              payload: [
                {
                  type: 'CLOSE_EDIT_DIALOG'
                },
                {
                  type: 'DISPATCH_DOM_EVENT',
                  payload: { id: eventIdDismissed }
                }
              ]
            }
          }
        });
      }

      unsubscribe = CrafterCMSNext.createLegacyCallbackListener(eventIdSuccess, (response) => {
        matchedElement.style.pointerEvents = 'auto';
        const contentTO = response;
        const draft = response.action === 'save';

        if (CStudioAuthoringContext.isPreview) {
          try {
            CStudioAuthoring.Operations.refreshPreview();
          } catch (err) {
            if (!draft) {
              this.callingWindow.location.reload(true);
            }
          }
        }

        if (
          contentTO.updatedModel &&
          contentTO.initialModel &&
          contentTO.updatedModel.orderDefault_f !== contentTO.initialModel.orderDefault_f
        ) {
          if (CStudioAuthoring.ContextualNav.WcmRootFolder) {
            eventYS.data = contentTO.item;
            eventYS.typeAction = 'edit';
            eventYS.draft = draft;
            document.dispatchEvent(eventYS);
          } else {
            eventNS.data = contentTO.item;
            eventNS.typeAction = 'edit';
            eventNS.draft = draft;
            document.dispatchEvent(eventNS);
          }
        } else {
          eventNS.data = contentTO.item;
          eventNS.typeAction = 'edit';
          eventNS.draft = draft;
          document.dispatchEvent(eventNS);
        }

        cancelUnsubscribe();
      });

      cancelUnsubscribe = CrafterCMSNext.createLegacyCallbackListener(eventIdDismissed, () => {
        unsubscribe();
      });
    });
  } else if (['config', 'template', 'asset', 'script'].includes(type)) {
    const src = `${legacyFormSrc}site=${site}&path=${encodeURIComponent(path)}&type=asset`;
    CrafterCMSNext.system.store.dispatch({
      type: 'SHOW_CODE_EDITOR_DIALOG',
      payload: {
        src: src
      }
    });
  } else {
    console.error(`[WcmDashboardWidgetCommon.editItem] Unable to find a edit method for type: ${type}`);
  }
};

WcmDashboardWidgetCommon.viewItem = function(matchedElement, isChecked) {
  const path = WcmDashboardWidgetCommon.getItemPathFromMatchedElement(matchedElement);
  const type = CrafterCMSNext.util.content.getSystemTypeFromPath(path);
  const site = CrafterCMSNext.system.store.getState().sites.active;
  const authoringBase = CrafterCMSNext.system.store.getState().env.authoringBase;
  const legacyFormSrc = `${authoringBase}/legacy/form?`;

  if (['page', 'component', 'taxonomy'].includes(type)) {
    const src = `${legacyFormSrc}site=${site}&path=${path}&type=form`;
    CrafterCMSNext.system.store.dispatch({
      type: 'SHOW_EDIT_DIALOG',
      payload: {
        src: `${src}&readonly=true`
      }
    });
  } else if (['config', 'template', 'asset', 'script'].includes(type)) {
    const src = `${legacyFormSrc}site=${site}&path=${encodeURIComponent(path)}&type=asset`;
    CrafterCMSNext.system.store.dispatch({
      type: 'SHOW_CODE_EDITOR_DIALOG',
      payload: {
        src: `${src}&readonly=true`
      }
    });
  } else {
    console.error(`[WcmDashboardWidgetCommon.viewItem] Unable to find a view method for type: ${type}`);
  }
};

/**
 * User clicked on preview link, open preview
 */
WcmDashboardWidgetCommon.previewItem = function(matchedElement, isChecked) {
  var callback = {
    success: function(contentTO) {
      if (contentTO.name.indexOf('.xml') != -1) {
        CStudioAuthoring.Storage.write(
          CStudioAuthoring.Service.menuParentPathKeyFromItemUrl(contentTO.path),
          contentTO.path
        );
      }

      CStudioAuthoring.Operations.openPreview(contentTO);
    },

    failure: function() {}
  };

  WcmDashboardWidgetCommon.getContentItemForMatchedElement(matchedElement, callback);
};

/**
 * Select an item in the dashboard widget
 */
WcmDashboardWidgetCommon.selectItem = function(matchedElement, isChecked, triggerEvent) {
  if (matchedElement.type == 'checkbox') WcmDashboardWidgetCommon.Ajax.disableDashboard();
  var callback = {
    success: function(contentTO) {
      if (isChecked == true) {
        CStudioAuthoring.SelectedContent.selectContent(contentTO, triggerEvent);
      } else {
        CStudioAuthoring.SelectedContent.unselectContent(contentTO, triggerEvent);
      }
      WcmDashboardWidgetCommon.Ajax.enableDashboard();
    },

    failure: function() {
      WcmDashboardWidgetCommon.Ajax.enableDashboard();
    }
  };

  WcmDashboardWidgetCommon.getContentItemForMatchedElement(matchedElement, callback);
};

/**
 * return the item Path for the matched item
 */

WcmDashboardWidgetCommon.getItemPathFromMatchedElement = function(matchedElement) {
  // walk the DOM to get the path  get parent of current element
  const parentTD = YDom.getAncestorByTagName(matchedElement, 'td');

  // get a sibling, that is <td>, that has attribute of title
  const urlEl = YDom.getNextSiblingBy(parentTD, function(el) {
    return el.getAttribute('title') == 'fullUri';
  });

  return urlEl.innerHTML;
};

/**
 * return the transfer object for the matched item
 */
WcmDashboardWidgetCommon.getContentItemForMatchedElement = function(matchedElement, callback) {
  var itemUrl = '';

  // walk the DOM to get the path  get parent of current element
  var parentTD = YDom.getAncestorByTagName(matchedElement, 'td');

  // get a sibling, that is <td>, that has attribute of title
  var urlEl = YDom.getNextSiblingBy(parentTD, function(el) {
    return el.getAttribute('title') == 'fullUri';
  });

  if (!urlEl) {
    // if url null return
    callback.failure();
    return;
  } else {
    itemUrl = urlEl.innerHTML;
  }

  var getContentItemsCb = {
    success: function(contentTO) {
      callback.success(contentTO.item);
    },

    failure: function() {
      callback.failure();
    }
  };

  CStudioAuthoring.Service.lookupContentItem(CStudioAuthoringContext.site, itemUrl, getContentItemsCb, false, false);
};

/**
 * load and render table data
 */
WcmDashboardWidgetCommon.loadTableData = function(sortBy, container, widgetId, filterByNumber, sortFromCachedData) {
  var instance = WcmDashboardWidgetCommon.dashboards[widgetId];
  var tableName = widgetId;
  var webscriptName = widgetId + '-table';
  var divTableContainer = widgetId + '-body';
  var currentSortBy = sortBy ? sortBy : null;
  var currentSortType = '';
  var hideEmptyRow = instance.hideEmptyRow;
  var pageId = instance.pageId;

  var callback = {
    success: function(results) {
      if (results.total > 0) {
        YDom.addClass(divTableContainer, 'table-responsive');
      }
      instance.dashBoardData = results;
      var sortDocuments = results.documents;
      instance.tooltipLabels = new Array();
      var newtable = '';
      var blankRow = ''; // "<tr class='avoid'><td class='ttBlankRow' colspan='5'>&nbsp;</td></tr>";
      var count = 0;
      var sortedByValue = results.sortedBy;
      var sortType = results.sortType;
      var previousSortedBy = YDom.get('sortedBy-' + widgetId).innerHTML;
      var previousSortType = YDom.get('sort-type-' + widgetId).innerHTML;

      if (previousSortedBy == currentSortBy) {
        if (previousSortType == 'true') {
          currentSortType = 'false';
        } else {
          currentSortType = 'true';
        }
      } else {
        currentSortType = 'false';
      }

      // update total count
      var totalCountEl = YDom.get(widgetId + '-total-count');
      if (totalCountEl != undefined) {
        totalCountEl.innerHTML = results.total;
      }

      if (sortFromCachedData && sortDocuments.length > 1) {
        if (instance.skipComponentSort) {
          //Don't sort by components
        } else {
          //if skipComponentSort flag not available
          sortDocuments = WcmDashboardWidgetCommon.sortItems(sortDocuments, currentSortBy, currentSortType);
        }
      }

      // update custom header controls
      // create line items
      for (var j = 0; j < sortDocuments.length; j++) {
        var items = sortDocuments[j].children;
        var document = sortDocuments[j];

        count = count + 1;

        var name = sortDocuments[j].internalName != undefined ? sortDocuments[j].internalName : 'error';
        var parentClass = 'wcm-table-parent-' + name + '-' + count;

        if (!hideEmptyRow || sortDocuments[j].numOfChildren > 0) {
          var table = '<tr>';
          table += WcmDashboardWidgetCommon.buildItemTableRow(sortDocuments[j], instance, true, count, 0);
          table += '</tr>';

          if (sortFromCachedData) {
            items = WcmDashboardWidgetCommon.sortItems(items, currentSortBy, currentSortType);
          }

          for (var i = 0; i < items.length; i++) {
            var item = items[i];
            //table = table + "<tr class='" + parentClass + "'><td colspan='5' class='ttBlankRow3'></td></tr>";
            var itemRowStart = "<tr class='" + parentClass + ' ' + items[i].path + "'>";
            var itemRowEnd = '</tr>';

            var subItemRowStart =
              "<tr class='" +
              parentClass +
              "'><td><span class='wcm-widget-margin'></span><span class='ttFirstCol128'><input title='All' class='dashlet-item-check1' id=tableName + 'CheckAll'  type='checkbox' /></span><span class='wcm-widget-margin'></span>";

            //create table row for this item
            var itemRow = WcmDashboardWidgetCommon.buildItemTableRow(item, instance, false, i, 0);
            table += itemRowStart + itemRow + itemRowEnd;

            var subItems = item.children;
            if (subItems && subItems.length > 0) {
              subChildren = new Array();
              WcmDashboardWidgetCommon.getChilderenRecursive(subItems);
              subChildren = WcmDashboardWidgetCommon.sortItems(subChildren, currentSortBy, currentSortType);
              table += WcmDashboardWidgetCommon.getSubSubChilderen(table, parentClass, subChildren, widgetId, 1);
              //table += WcmDashboardWidgetCommon.getSubSubChilderenRecursive(table, parentClass, subItems, widgetId, 1);
            }
          }
          newtable += table;
        }
      }

      newtable = blankRow + newtable + blankRow;

      var tableContentStart = '<table id="' + tableName + '-table" class="table">';
      var theadContent =
        '<thead class="ttThead" id="' +
        tableName +
        '-thead"><tr class="avoid">' +
        instance.renderItemsHeading() +
        '</tr></thead>';
      var tbodyContent = '<tbody id="' + tableName + '-tbody" class="ttTbody">' + newtable + '</tbody>';
      var tableContentEnd = '</table>';

      //Check for already checked items,
      //un-check then to remove those items from selected items list.
      var checkboxArray = YDom.getElementsBy(
        function(el) {
          return el.type === 'checkbox' && el.checked === true;
        },
        'input',
        divTableContainer
      );

      if (checkboxArray && checkboxArray.length >= 1) {
        for (var chkIdx = 0; chkIdx < checkboxArray.length; chkIdx++) {
          checkboxArray[chkIdx].checked = false;
          WcmDashboardWidgetCommon.clearItem(checkboxArray[chkIdx], instance.dashBoardData);
        }
      }

      YDom.get(divTableContainer).innerHTML = tableContentStart + theadContent + tbodyContent + tableContentEnd;
      YEvent.delegate(
        widgetId + '-thead',
        'click',
        WcmDashboardWidgetCommon.sortClick,
        'th a',
        {
          widgetId: widgetId,
          sortBy: currentSortBy
        },
        true
      );
      WcmDashboardWidgetCommon.updateSortIconsInWidget(currentSortBy, currentSortType, widgetId);

      YDom.get('sortedBy-' + widgetId).innerHTML = currentSortBy;
      YDom.get('sort-type-' + widgetId).innerHTML = currentSortType;

      instance.currentSortBy = sortBy;
      instance.searchNumber = filterByNumber;

      /**
       * remove loading image for recent current widget
       */
      YDom.setStyle('loading-' + widgetId, 'display', 'none');
      /**
       * ajax call link in dashboard widget will be showed/hide
       * according to widget state..
       */
      var widgetState = CStudioAuthoring.Service.getWindowState(
        CStudioAuthoringContext.user,
        pageId,
        widgetId,
        'widgetToggle'
      );
      if (widgetState == 'closed') {
        YDom.setStyle('widget-expand-state-' + widgetId, 'display', 'none');
      } else {
        YDom.setStyle('widget-expand-state-' + widgetId, 'display', 'block');
      }

      /*************************************************************
       * registering mouse over and mouse out events for row items.
       ************************************************************/
      var rowMouseover = function(event, matchedEl) {
        YDom.addClass(matchedEl, 'over');
      };

      var rowMouseout = function(event, matchedEl) {
        YDom.removeClass(matchedEl, 'over', '');
      };

      YEvent.delegate(webscriptName, 'mouseover', rowMouseover, 'tr');
      YEvent.delegate(webscriptName, 'mouseout', rowMouseout, 'tr');

      // adding tool tip display
      if (instance.tooltipLabels && instance.tooltipLabels.length >= 1) {
        var oTTContainer = YDom.get('acn-context-tooltip-widgets');
        if (!oTTContainer) {
          var toolTipContainer = window.document.createElement('div');
          toolTipContainer.setAttribute('id', 'acn-context-tooltip-widgets');
          toolTipContainer.className = 'acn-context-tooltip';
          toolTipContainer.innerHTML =
            '<div style="z-index: 2; left: 73px; top: 144px; visibility: hidden;"' +
            ' class="yui-module yui-overlay yui-tt"' +
            'id="acn-context-tooltipWrapper-widgets"><div class="bd"></div>' +
            '<div class="yui-tt-shadow"></div>' +
            '<div class="yui-tt-shadow"></div>' +
            '<div class="yui-tt-shadow"></div>' +
            '</div>';

          window.document.body.appendChild(toolTipContainer);
        }

        new YAHOO.widget.Tooltip('acn-context-tooltipWrapper-widgets', {
          context: instance.tooltipLabels,
          hidedelay: 0,
          showdelay: 500,
          container: 'acn-context-tooltip-widgets'
        });
      }

      if (!instance.expanded) {
        instance.expanded = true;
        WcmDashboardWidgetCommon.toggleAllItems(widgetId);
      }

      YEvent.addListener(
        tableName + 'CheckAll',
        'click',
        function(e) {
          YDom.setStyle('loading-' + widgetId, 'display', '');

          setTimeout(function() {
            var checkAllElt = YDom.get(tableName + 'CheckAll');
            var inputsElt = window.document.querySelectorAll('#' + tableName + ' input:enabled');
            var avoidEvent;

            if (checkAllElt.checked == true) {
              for (var i = 1; i < inputsElt.length; i++) {
                inputsElt[i].checked = true;
                avoidEvent = i == inputsElt.length - 1 ? false : true;
                WcmDashboardWidgetCommon.selectItem(inputsElt[i], inputsElt[i].checked, avoidEvent);
              }
            } else {
              for (var i = 1; i < inputsElt.length; i++) {
                inputsElt[i].checked = false;
                avoidEvent = i == inputsElt.length - 1 ? false : true;
                WcmDashboardWidgetCommon.selectItem(inputsElt[i], inputsElt[i].checked, avoidEvent);
              }
            }

            YDom.setStyle('loading-' + widgetId, 'display', 'none');
          }, 10);
        },
        this,
        true
      );

      WcmDashboardWidgetCommon.hideURLCol();
    },

    failure: function() {
      YDom.setStyle('loading-' + widgetId, 'display', 'none');
    },

    beforeServiceCall: function() {
      YDom.setStyle('loading-' + widgetId, 'display', '');
    }
  };

  if (sortFromCachedData && instance.dashBoardData) {
    callback.success(instance.dashBoardData);
  } else {
    instance.retrieveTableData(currentSortBy, currentSortType, callback, null, filterByNumber);
  }
};

/////For filtering Widgets

WcmDashboardWidgetCommon.loadFilterTableData = function(sortBy, container, widgetId, filterByNumber, filterBy) {
  var instance = WcmDashboardWidgetCommon.dashboards[widgetId];
  var tableName = widgetId;
  var webscriptName = widgetId + '-table';
  var divTableContainer = widgetId + '-body';
  var currentSortBy = sortBy ? sortBy : null;
  var currentSortType = '';
  var hideEmptyRow = instance.hideEmptyRow;
  var pageId = instance.pageId;

  var callback = {
    success: function(results) {
      if (results.total > 0) {
        YDom.addClass(divTableContainer, 'table-responsive');
      }
      instance.dashBoardData = results;
      var sortDocuments = results.documents;
      instance.tooltipLabels = new Array();
      var newtable = '';
      var blankRow = ''; //"<tr class='avoid'><td class='ttBlankRow' colspan='5'>&nbsp;</td></tr>";
      var count = 0;
      var sortedByValue = results.sortedBy;
      var sortType = results.sortType;
      var previousSortedBy = YDom.get('sortedBy-' + widgetId).innerHTML;
      var previousSortType = YDom.get('sort-type-' + widgetId).innerHTML;

      if (previousSortedBy == currentSortBy) {
        if (previousSortType == 'true') {
          currentSortType = 'false';
        } else {
          currentSortType = 'true';
        }
      } else {
        currentSortType = 'false';
      }

      // update total count
      var totalCountEl = YDom.get(widgetId + '-total-count');
      if (totalCountEl != undefined) {
        totalCountEl.innerHTML = results.total;
      }

      // update custom header controls
      // create line items
      for (var j = 0; j < sortDocuments.length; j++) {
        var items = sortDocuments[j].children;
        var document = sortDocuments[j];

        count = count + 1;

        var name = sortDocuments[j].internalName != undefined ? sortDocuments[j].internalName : 'error';
        var parentClass = 'wcm-table-parent-' + name + '-' + count;

        if (!hideEmptyRow || sortDocuments[j].numOfChildren > 0) {
          var table = "<tr class='itemId_" + sortDocuments[j].path + "'>",
            tableRow = WcmDashboardWidgetCommon.buildItemTableRow(sortDocuments[j], instance, true, count, 0);
          table = tableRow ? table + tableRow : table;
          table += '</tr>';

          for (var i = 0; i < items.length; i++) {
            var item = items[i];
            //table = table + "<tr class='" + parentClass + "'><td colspan='5' class='ttBlankRow3'></td></tr>";
            var itemRowStart = "<tr class='" + parentClass + "'>";
            var itemRowEnd = '</tr>';

            var subItemRowStart =
              "<tr class='" +
              parentClass +
              "'><td><span class='wcm-widget-margin'></span><span class='ttFirstCol128'><input type='checkbox'/></span><span class='wcm-widget-margin'></span>";

            //create table row for this item
            var itemRow = WcmDashboardWidgetCommon.buildItemTableRow(item, instance, false, i, 0);
            table += itemRowStart + itemRow + itemRowEnd;

            var subItems = item.children;
            if (subItems && subItems.length > 0) {
              table += WcmDashboardWidgetCommon.getSubSubChilderenRecursive(table, parentClass, subItems, widgetId, 1);
            }
          }
          newtable += table;
        }
      }

      newtable = blankRow + newtable + blankRow;

      var tableContentStart = '<table id="' + tableName + '-table" class="table" border="0">';
      var theadContent =
        '<thead class="ttThead" id="' +
        tableName +
        '-thead"><tr class="avoid">' +
        instance.renderItemsHeading() +
        '</tr></thead>';
      var tbodyContent = '<tbody class="ttTbody" id="' + tableName + '-tbody" class="ttTbody">' + newtable + '</tbody>';
      var tableContentEnd = '</table>';

      //Check for already checked items,
      //un-check then to remove those items from selected items list.
      var checkboxArray = YDom.getElementsBy(
        function(el) {
          return el.type === 'checkbox' && el.checked === true;
        },
        'input',
        divTableContainer
      );
      if (checkboxArray && checkboxArray.length >= 1 && eventNS.typeAction == 'edit' && !eventNS.draft) {
        for (var chkIdx = 0; chkIdx < checkboxArray.length; chkIdx++) {
          checkboxArray[chkIdx].checked = false;
          WcmDashboardWidgetCommon.clearItem(checkboxArray[chkIdx], instance.dashBoardData);
        }
      }

      YDom.get(divTableContainer).innerHTML = tableContentStart + theadContent + tbodyContent + tableContentEnd;
      YEvent.delegate(
        widgetId + '-thead',
        'click',
        WcmDashboardWidgetCommon.sortClick,
        'th a',
        {
          widgetId: widgetId,
          sortBy: currentSortBy
        },
        true
      );
      WcmDashboardWidgetCommon.updateSortIconsInWidget(currentSortBy, currentSortType, widgetId);

      YDom.get('sortedBy-' + widgetId).innerHTML = currentSortBy;
      YDom.get('sort-type-' + widgetId).innerHTML = currentSortType;

      instance.currentSortBy = sortBy;
      instance.searchNumber = filterByNumber;

      /**
       * remove loading image for recent current widget
       */
      YDom.setStyle('loading-' + widgetId, 'display', 'none');
      /**
       * ajax call link in dashboard widget will be showed/hide
       * according to widget state..
       */
      var widgetState = CStudioAuthoring.Service.getWindowState(
        CStudioAuthoringContext.user,
        pageId,
        widgetId,
        'widgetToggle'
      );
      if (widgetState == 'closed') {
        YDom.setStyle('widget-expand-state-' + widgetId, 'display', 'none');
      } else {
        YDom.setStyle('widget-expand-state-' + widgetId, 'display', 'block');
      }

      /*************************************************************
       * registering mouse over and mouse out events for row items.
       ************************************************************/
      var rowMouseover = function(event, matchedEl) {
        YDom.addClass(matchedEl, 'over');
      };

      var rowMouseout = function(event, matchedEl) {
        YDom.removeClass(matchedEl, 'over', '');
      };

      YEvent.delegate(webscriptName, 'mouseover', rowMouseover, 'tr');
      YEvent.delegate(webscriptName, 'mouseout', rowMouseout, 'tr');

      // adding tool tip display
      if (instance.tooltipLabels && instance.tooltipLabels.length >= 1) {
        var oTTContainer = YDom.get('acn-context-tooltip-widgets');
        if (!oTTContainer) {
          var toolTipContainer = window.document.createElement('div');
          toolTipContainer.setAttribute('id', 'acn-context-tooltip-widgets');
          toolTipContainer.className = 'acn-context-tooltip';
          toolTipContainer.innerHTML =
            '<div style="z-index: 2; left: 73px; top: 144px; visibility: hidden;"' +
            ' class="yui-module yui-overlay yui-tt"' +
            'id="acn-context-tooltipWrapper-widgets"><div class="bd"></div>' +
            '<div class="yui-tt-shadow"></div>' +
            '<div class="yui-tt-shadow"></div>' +
            '<div class="yui-tt-shadow"></div>' +
            '</div>';

          window.document.body.appendChild(toolTipContainer);
        }

        new YAHOO.widget.Tooltip('acn-context-tooltipWrapper-widgets', {
          context: instance.tooltipLabels,
          hidedelay: 0,
          showdelay: 500,
          container: 'acn-context-tooltip-widgets'
        });
      }

      if (!instance.expanded) {
        instance.expanded = true;
        WcmDashboardWidgetCommon.toggleAllItems(widgetId);
      }

      YEvent.addListener(
        tableName + 'CheckAll',
        'click',
        function(e) {
          var checkAllElt = YDom.get(tableName + 'CheckAll');
          var inputsElt = window.document.querySelectorAll('#' + tableName + ' input:enabled');

          WcmDashboardWidgetCommon.Ajax.disableDashboard();

          if (checkAllElt.checked == true) {
            for (var i = 1; i < inputsElt.length; i++) {
              inputsElt[i].checked = true;
              WcmDashboardWidgetCommon.selectItem(inputsElt[i], inputsElt[i].checked);
            }
          } else {
            for (var i = 1; i < inputsElt.length; i++) {
              inputsElt[i].checked = false;
              WcmDashboardWidgetCommon.selectItem(inputsElt[i], inputsElt[i].checked);
            }
          }
        },
        this,
        true
      );
    },

    failure: function() {
      YDom.setStyle('loading-' + widgetId, 'display', 'none');
    },

    beforeServiceCall: function() {
      YDom.setStyle('loading-' + widgetId, 'display', 'block');
    }
  };

  instance.retrieveTableData(currentSortBy, currentSortType, callback, null, filterByNumber, filterBy);
};

/**
 * Handle children level 2 and beyond (becomes a flat stucture)
 */
WcmDashboardWidgetCommon.getSubSubChilderenRecursive = function(table, parentClass, items, widgetId, depth) {
  var rowHtml = '';
  var instance = WcmDashboardWidgetCommon.dashboards[widgetId];

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    //rowHtml += "<tr class='" + parentClass + "'><td colspan='5' class='ttBlankRow3'></td></tr>";

    var itemRowStart = "<tr class='" + parentClass + "'>";

    var itemRowEnd = '</tr>';

    //create table row for this item
    var itemRow = WcmDashboardWidgetCommon.buildItemTableRow(item, instance, false, i, depth);

    rowHtml += itemRowStart + itemRow + itemRowEnd;

    // add further dependencies
    if (item.children && item.children.length > 0) {
      rowHtml += WcmDashboardWidgetCommon.getSubSubChilderenRecursive(
        table,
        parentClass,
        item.children,
        widgetId,
        depth + 1
      );
    }
  }

  return rowHtml;
};

/**
 * call render line item for the particular kind of dashboard
 * @param item - content object
 * @param dashboardInstance instance of the dashboard
 */
WcmDashboardWidgetCommon.buildItemTableRow = function(item, dashboardInstance, firstRow, count, depth) {
  return dashboardInstance.renderLineItem(item, firstRow, count, depth);
};

/**
 * update sorting icons
 */
WcmDashboardWidgetCommon.updateSortIconsInWidget = function(currentSortBy, currentSortType, widgetId) {
  if (YAHOO.lang.isNull(currentSortBy)) {
    return;
  }
  //valid for sorting clicks

  var currentSortById = 'sortIcon-' + currentSortBy + '-' + widgetId;

  if (currentSortType == 'true') {
    currentSortType = 'ttSortAsc';
  } else {
    currentSortType = 'ttSortDesc';
  }

  var sortColumns = CStudioAuthoring.Utils.getElementsByClassName('wcm-go-live-sort-columns-' + widgetId);
  var count = 0;
  var length = sortColumns.length;
  while (length > count) {
    var item = sortColumns[count];
    if (item != undefined) {
      if (item.id == currentSortById) {
        item.style.display = 'inline-block';
        item.className = currentSortType + ' wcm-go-live-sort-columns-' + widgetId;
      } else {
        item.style.display = 'none';
      }
    }
    count = count + 1;
  }
};

WcmDashboardWidgetCommon.initFilterToWidget = function(widgetId, widgetFilterBy) {
  var filterByEl = document.createElement('select');
  if (widgetId) {
    filterByEl.setAttribute('id', 'widget-filterBy-' + widgetId);
  }

  filterByEl.className = 'form-control input-sm';

  filterByEl.options[0] = new Option(CMgs.format(langBundle, 'dashletFilterPages'), 'page', true, false);
  filterByEl.options[1] = new Option(CMgs.format(langBundle, 'dashletFilterComponents'), 'component', true, false);
  filterByEl.options[2] = new Option(CMgs.format(langBundle, 'dashletFilterDocuments'), 'document', true, false);
  filterByEl.options[3] = new Option(CMgs.format(langBundle, 'dashletFilterAll'), 'all', true, false);

  //set default value from cookie
  if (widgetFilterBy) {
    for (var optIdx = 0; optIdx < filterByEl.options.length; optIdx++) {
      if (filterByEl.options[optIdx].value == widgetFilterBy) {
        filterByEl.options[optIdx].selected = true;
        break;
      }
    }
  }

  return filterByEl;
};

/**
 * get selected item from cache data
 */
WcmDashboardWidgetCommon.getContentRecursive = function(dashBoardData, itemUrl) {
  var sortDocuments = dashBoardData.documents;
  var result = null;
  for (var j = 0; j < sortDocuments.length; j++) {
    if (sortDocuments[j].uri == itemUrl) {
      return sortDocuments[j];
    }
    if (sortDocuments[j].children && sortDocuments[j].children >= 1) {
      result = WcmDashboardWidgetCommon.getContentRecursive(sortDocuments[j].children, itemUrl);
      if (result) break;
    }
  }
  return result;
};

/**
 * clear selected item in the dashboard widget
 */
WcmDashboardWidgetCommon.clearItem = function(matchedElement, dashBoardData) {
  if (matchedElement.type == 'checkbox') {
    if (dashBoardData) {
      var itemUrl = '';

      // walk the DOM to get the path  get parent of current element
      var parentTD = YDom.getAncestorByTagName(matchedElement, 'td');

      // get a sibling, that is <td>, that has attribute of title
      var urlEl = YDom.getNextSiblingBy(parentTD, function(el) {
        return el.getAttribute('title') == 'fullUri';
      });

      if (!urlEl) {
        // if url null return
        return;
      } else {
        itemUrl = urlEl.innerHTML;
      }

      //check for matched element from cache
      var contentTO = WcmDashboardWidgetCommon.getContentRecursive(dashBoardData, itemUrl);
      if (contentTO) {
        CStudioAuthoring.SelectedContent.unselectContent(contentTO);
        return;
      }
    }
    WcmDashboardWidgetCommon.selectItem(matchedElement, false);
  }
};

/**
 * refresh a specific dashboard
 */
WcmDashboardWidgetCommon.refreshDashboard = function(inst) {
  var instace = WcmDashboardWidgetCommon.dashboards[inst];
  var filterByTypeEl = YDom.get('widget-filterBy-' + instace.widgetId);
  var filterByTypeValue = 'all';
  if (filterByTypeEl && filterByTypeEl.value != '') {
    filterByTypeValue = filterByTypeEl.value;
  }

  var searchNumberEl = YDom.get('widget-showitems-' + instace.widgetId);
  var searchNumberValue = instace.defaultSearchNumber;
  if (searchNumberEl && searchNumberEl.value != '') {
    searchNumberValue = searchNumberEl.value;
  }

  var sortBy = instace.currentSortBy ? instace.currentSortBy : instace.defaultSortBy;
  var searchNumber = instace.searchNumber ? instace.searchNumber : instace.defaultSearchNumber;

  WcmDashboardWidgetCommon.loadFilterTableData(
    sortBy,
    YDom.get(instace.widgetId),
    instace.widgetId,
    searchNumber,
    filterByTypeValue
  );
};

const dashboardsIds = ['MyRecentActivity', 'recentlyMadeLive', 'approvedScheduledItems', 'GoLiveQueue'];

/**
 * refresh all dashboards
 */
WcmDashboardWidgetCommon.refreshAllDashboards = function() {
  if (typeof WcmDashboardWidgetCommon != 'undefined') {
    dashboardsIds.forEach((dashboardId) => {
      WcmDashboardWidgetCommon.refreshDashboard(dashboardId);
    });
    CStudioAuthoring.SelectedContent.clear();
  }
};

WcmDashboardWidgetCommon.clearSelections = function() {
  if (typeof WcmDashboardWidgetCommon != 'undefined') {
    dashboardsIds.forEach((dashboardId) => {
      $(`#${dashboardId}-table`)
        .find('input[type="checkbox"]')
        .prop('checked', false);
    });
    CStudioAuthoring.SelectedContent.clear();
  }
};
