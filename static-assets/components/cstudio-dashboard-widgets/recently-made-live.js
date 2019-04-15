var YDom = YAHOO.util.Dom;
var contextPath = location.protocol+"//"+location.hostname+":"+location.port;

if(typeof CStudioAuthoringWidgets == "undefined" || !CStudioAuthoringWidgets) {
    var CStudioAuthoringWidgets = {};
}

/**
 * recently made live
 */
CStudioAuthoringWidgets.RecentlyMadeLiveDashboard = CStudioAuthoringWidgets.RecentlyMadeLiveDashboard || function(widgetId, pageId) {

    this.widgetId = widgetId;
    this.pageId = pageId;
    this._self =  this;
    this.showInprogressItems = false;
    this.expanded = true;
    this.hideEmptyRow = false;
    this.defaultSortBy='eventDate';
    this.defaultSearchNumber=20;
    this.tooltipLabels=null;
    WcmDashboardWidgetCommon.init(this);

    /**
     * get table data
     */
    this.retrieveTableData = function(sortBy, sortAscDesc, callback, retrieveTableData, filterByNumber,filterBy) {

        sortAscDesc = CStudioAuthoring.Utils.sortByAsc.init(sortBy, widgetId);

        CStudioAuthoring.Service.getDeploymentHistory(
            CStudioAuthoringContext.site,
            sortBy,
            sortAscDesc,
            30, // what should this be
            filterByNumber,
            filterBy,
            callback);
    };

    /**
     * callback to render the table headings
     */
    this.renderItemsHeading = function() {

        var widgetId = this._self.widgetId;

        var header = WcmDashboardWidgetCommon.getSimpleRow("checkAll", widgetId, '<input title="Select all" class="dashlet-item-check" id="' + widgetId + 'CheckAll" name="check-all" type="checkbox"/>', "minimize")+
            WcmDashboardWidgetCommon.getDefaultSortRow("eventDate",widgetId,CMgs.format(langBundle, "dashletRecentDeployColPageName"),"minimize")+
            WcmDashboardWidgetCommon.getSimpleRow("edit",widgetId,CMgs.format(langBundle, "dashletRecentDeployColEdit"),"minimize")+
            WcmDashboardWidgetCommon.getSimpleRow("browserUri",widgetId,CMgs.format(langBundle, "dashletRecentDeployColURL"),"maximize")+
            WcmDashboardWidgetCommon.getSimpleRow("endpoint",widgetId,CMgs.format(langBundle, "dashletRecentDeployColEndpoint"),"minimize")+
            "<th id='fullUri' class='width0'></th>"+
            WcmDashboardWidgetCommon.getSimpleRow("madeliveDate",widgetId,CMgs.format(langBundle, "dashletRecentDeployColMadeLiveDateDate"),"ttThColLast alignRight minimize")+
            WcmDashboardWidgetCommon.getSimpleRow("publisher", widgetId, CMgs.format(langBundle, "dashletRecentDeployColDeployBy"),"minimize");

        return header;
    };

    this.renderAuxControls = function(containerEl) {
        var liLoadingEl = document.createElement("li");
        liLoadingEl.id = "loading-" + widgetId;
        var imgEl = document.createElement("img");
        imgEl.src = contextPath + CStudioAuthoringContext.baseUri + "/static-assets/themes/cstudioTheme/images/treeview-loading.gif";
        liLoadingEl.appendChild(imgEl);
        containerEl.appendChild(liLoadingEl);
        var filterBydiv =  document.createElement("li");
        //YDom.addClass(filterBydiv, "widget-FilterBy");

        var widgetFilterBy = CStudioAuthoring.Service.getWindowState(CStudioAuthoringContext.user,
            pageId,
            widgetId,
            "widgetFilterBy");
        var filterByEl = WcmDashboardWidgetCommon.initFilterToWidget(widgetId, widgetFilterBy);
        containerEl.appendChild(filterBydiv);
        filterBydiv.appendChild(filterByEl);

        filterByEl._self = this;

        filterByEl.onchange = function() {

            var _self = this._self;
            var selectedItems = filterByEl.selectedIndex;
            filterByEl.options[0]=new Option(CMgs.format(langBundle, "dashletFilterPages"), "pages", true, false);
            filterByEl.options[1]=new Option(CMgs.format(langBundle, "dashletFilterComponents"), "components", true, false);
            filterByEl.options[2]=new Option(CMgs.format(langBundle, "dashletFilterDocuments"), "documents", true, false);
            filterByEl.options[3]=new Option(CMgs.format(langBundle, "dashletFilterAll"), "all", true, false);
            filterByEl.options[selectedItems].selected =true;
            var newState = filterByEl.value;

            CStudioAuthoring.Service.setWindowState(
                CStudioAuthoringContext.user,
                pageId,
                widgetId,
                "widgetFilterBy",
                newState);

            if (typeof WcmDashboardWidgetCommon != "undefined") {
                WcmDashboardWidgetCommon.refreshAllDashboards();
            }

        };
    };

    /**
     * Call back to render each line item of the table
     */
    this.renderLineItem = function(item, isFirst, count) {

        var html = [],

            name = item.internalName,
            endpoint = item.endpoint,
            displayEndpoint = item.endpoint,
            displayName = WcmDashboardWidgetCommon.getFormattedString(name, 40),
            editLinkId;

        if (isFirst) {

            html.push('<td colspan="6">');

            if (item.numOfChildren > 0) {
                var parentClass = ['wcm-table-parent-', name, '-', count].join("");
                html = html.concat([
                    '<span id="', parentClass, '"',
                    'class="', item.children.length ? 'ttClose parent-div-widget' : 'ttOpen parent-div-widget', '"',
                    'onclick="WcmDashboardWidgetCommon.toggleLineItem(\'' + parentClass + '\');" >',
                    '</span>'
                ]);
            }

            html = html.concat([
                '<span class="wcm-widget-margin-align" title="', name, '">',
                displayName, ' (', item.numOfChildren, ')',
                '</span>',
                '</td>',
                '<td colspan="1">&nbsp;</td>'
            ]);

        } else {

            var browserUri = CStudioAuthoring.Operations.getPreviewUrl(item, false),
                displayBrowserUri = WcmDashboardWidgetCommon.getFormattedString(browserUri, 80),
                uri = item.uri;

            editLinkId = 'editLink_' + this.widgetId + '_' + WcmDashboardWidgetCommon.encodePathToNumbers(item.uri);

            if (item.component && item.internalName == "crafter-level-descriptor.level.xml") {
                browserUri = "";
                displayBrowserUri = "";
            }

            var ttSpanId =  "tt_" + this.widgetId + "_" + item.uri + "_" + (this.tooltipLabels.length + 1);
            var itemTitle = CStudioAuthoring.Utils.getTooltipContent(item);
            this.tooltipLabels.push(ttSpanId);

            var itemIconStatus = CStudioAuthoring.Utils.getIconFWClasses(item);
            itemIconStatus += ((item.disabled && !item.previewable) ? ' non-previewable-disabled' : '');

            // this API will replace double quotes with ASCII character
            // to resolve page display issue
            displayName = CStudioAuthoring.Utils.replaceWithASCIICharacter(displayName);

            WcmDashboardWidgetCommon.insertEditLink(item, editLinkId);

            var currentDashboard = CStudioAuthoring.Utils.Cookies.readCookie("dashboard-selected"),
                currentCheckItem = CStudioAuthoring.Utils.Cookies.readCookie("dashboard-checked") ?
                    JSON.parse(CStudioAuthoring.Utils.Cookies.readCookie("dashboard-checked"))[0] : null,
                currentBrowserUri = browserUri !== "" ? browserUri : "/";

            html = html.concat([
                '<td style="padding-right:0px">',
                    '<div class="dashlet-ident">',
                            '<input type="checkbox" class="dashlet-item-check" id="', uri, '"',
                ((this.widgetId == currentDashboard && (currentCheckItem && CStudioAuthoring.SelectedContent.getSelectedContent().length>0
                    && item.internalName.trim() == CStudioAuthoring.SelectedContent.getSelectedContent()[0].internalName.trim())) ? ' checked' : ''),
                ((item.deleted || item.inFlight) ? ' disabled' : ''), '  />',
                    '</div>',
                '</td>',
                '<td style="padding-left:0px">'+
                    '<div class="', (item.disabled == true ? ' disabled' : ''), '" id="' + ttSpanId + '" title="' + itemTitle + '">',
                        '<span class="iconRow ', itemIconStatus, '"></span>',
                    '<a class="anchorRow', (item.disabled == true ? ' dashboard-item disabled' : '') , (item.previewable == true ? ' previewLink' : ' non-previewable-link') , '" ', (item.previewable == true) ? 'href="/studio/preview/#/?page='+currentBrowserUri+'&site='+CStudioAuthoringContext.site+'"' : '', '">',
                            displayName, (item.isNew == true) ? ' <span style="font-size:16px;">*</span>' : '',
                        '</a>',
                    '</div>',
                '</td>',
                '<td id="' + editLinkId + '"></td>',
                "<td class='urlCol' title='",browserUri,"'>", displayBrowserUri, "</td>",
                "<td title='fullUri' class='width0'>", uri, "</td>",
                "<td title='",endpoint,"'>", displayEndpoint, "</td>",
                "<td class='alignRight ttThColLast'>", CStudioAuthoring.Utils.formatDateFromString(item.eventDate), "</td>",
                "<td class='alignRight ttThColLast'>", item.user, "</td>"
            ]);
        }

        if(currentCheckItem && this.widgetId == currentDashboard){
            CStudioAuthoring.Utils.Cookies.eraseCookie("dashboard-checked");
        }

        return html.join("");
    };


};
