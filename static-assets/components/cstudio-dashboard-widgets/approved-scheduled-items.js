var YDom = YAHOO.util.Dom;
var contextPath = location.protocol+"//"+location.hostname+":"+location.port; 

if(typeof CStudioAuthoringWidgets == "undefined" || !CStudioAuthoringWidgets) {
   var CStudioAuthoringWidgets = {};
}

/**
 * approved scheduled items
 */
CStudioAuthoringWidgets.ApprovedScheduledItemsDashboard = CStudioAuthoringWidgets.ApprovedScheduledItemsDashboard  || function(widgetId, pageId) {
	
	this.widgetId = widgetId;
	this.pageId = pageId;
	this._self =  this;
	this.showInprogressItems = false;
	this.expanded = true;
	this.hideEmptyRow = false;
	this.defaultSortBy='eventDate';
	this.tooltipLabels=null;
	WcmDashboardWidgetCommon.init(this);
	
	/**
	 * get table data
	 */
	this.retrieveTableData = function(sortBy, sortAscDesc, callback, retrieveTableData, filterByNumber,filterBy) { 	

		sortAscDesc = CStudioAuthoring.Utils.sortByAsc.init(sortBy, widgetId);        
		CStudioAuthoring.Service.getScheduledItems(
			CStudioAuthoringContext.site, 
			sortBy, 
			sortAscDesc,
			filterBy,
			callback);
	};
	 
	/**
	 * callback to render the table headings
	 */
	this.renderItemsHeading = function() {
	
		var widgetId = this._self.widgetId;
		var header = WcmDashboardWidgetCommon.getSimpleRow("checkAll", widgetId, '<input title="Select all" class="dashlet-item-check" id="' + widgetId + 'CheckAll" name="check-all" type="checkbox"/>', "minimize")+
                     WcmDashboardWidgetCommon.getDefaultSortRow("eventDate",widgetId,CMgs.format(langBundle, "dashletApprovedSchedColGoLiveDate"),"minimize")+
                     WcmDashboardWidgetCommon.getSimpleRow("edit",widgetId,CMgs.format(langBundle, "dashletApprovedSchedColEdit"),"minimize")+
		             WcmDashboardWidgetCommon.getSimpleRow("browserUri",widgetId,CMgs.format(langBundle, "dashletApprovedSchedColURL"),"maximize")+
		             "<th id='fullUri' class='width0'></th>"+
                     WcmDashboardWidgetCommon.getSimpleRow("lastEdit",widgetId,CMgs.format(langBundle, "dashletApprovedSchedColLastEdited"),"ttThColLast alignRight minimize");
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


		var widgetFilterBy = CStudioAuthoring.Service.getWindowState(CStudioAuthoringContext.user,
										pageId,
										widgetId,
										"widgetFilterBy");

        var filterByEl = WcmDashboardWidgetCommon.initFilterToWidget(widgetId, widgetFilterBy);
		containerEl.appendChild(filterBydiv);
		//filterBydiv.innerHTML = CMgs.format(langBundle, "dashletApprovedSchedShow");

		filterBydiv.appendChild(filterByEl);
		
		filterByEl._self = this;
		
		filterByEl.onchange = function() {
			
			var _self = this._self;
			var selectedItems = filterByEl.selectedIndex;
			filterByEl.options[0]=new Option(CMgs.format(langBundle, "dashletApprovedSchedFilterPages"), "pages", true, false);
			filterByEl.options[1]=new Option(CMgs.format(langBundle, "dashletApprovedSchedFilterComponents"), "components", true, false);
			filterByEl.options[2]=new Option(CMgs.format(langBundle, "dashletApprovedSchedFilterDocuments"), "documents", true, false);
			filterByEl.options[3]=new Option(CMgs.format(langBundle, "dashletApprovedSchedFilterAll"), "all", true, false);
			filterByEl.options[selectedItems].selected =true;
			var newState = filterByEl.value;

			CStudioAuthoring.Service.setWindowState(CStudioAuthoringContext.user,
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
            displayName = WcmDashboardWidgetCommon.getFormattedString(name, 40, item.newFile),
            editLinkId;

        if (isFirst) {

            html.push('<td colspan="4">');

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

	    var ttSpanId =  "tt_" + this.widgetId + "_" + item.uri + "_" + (this.tooltipLabels.length + 1);
            var itemTitle = CStudioAuthoring.Utils.getTooltipContent(item);
            this.tooltipLabels.push(ttSpanId);

            if (item.component && item.internalName == "crafter-level-descriptor.level.xml") {
                browserUri = "";
                displayBrowserUri = "";
            }

            var itemIconStatus = CStudioAuthoring.Utils.getIconFWClasses(item);
            itemIconStatus += ((item.disabled && !item.previewable) ? ' non-previewable-disabled' : '');

            // this API will replace double quotes with ASCII character
            // to resolve page display issue
            displayName = CStudioAuthoring.Utils.replaceWithASCIICharacter(displayName);

            var lastEditTime = CStudioAuthoring.Utils.formatDateFromString(item.eventDate);
            if (item.lastEditDateAsString != undefined && item.lastEditDateAsString != "") {
                lastEditTime = CStudioAuthoring.Utils.formatDateFromString(item.lastEditDateAsString);
            }
            
  
            WcmDashboardWidgetCommon.insertEditLink(item, editLinkId);

            var currentDashboard = CStudioAuthoring.Utils.Cookies.readCookie("dashboard-selected"),
                currentCheckItem = CStudioAuthoring.Utils.Cookies.readCookie("dashboard-checked") ?
                    JSON.parse(CStudioAuthoring.Utils.Cookies.readCookie("dashboard-checked"))[0] : null,
                currentBrowserUri = browserUri !== "" ? browserUri : "/";
  
            html = html.concat([
                '<td style="padding-right:0px">',
                    '<div class="dashlet-ident">',
                            '<input type="checkbox" class="dashlet-item-check" id="', uri,
                ((this.widgetId == currentDashboard && (currentCheckItem && CStudioAuthoring.SelectedContent.getSelectedContent().length>0
                    && item.internalName.trim() == CStudioAuthoring.SelectedContent.getSelectedContent()[0].internalName.trim())) ? ' checked' : ''),
                '"', (item.inFlight ? ' disabled' : ''), ' />',
                    '</div>',
                '</td>',
                '<td style="padding-left:0px">'+
                    '<div class="', (item.disabled == true ? ' disabled' : ''), '" id="' + ttSpanId + '" title="' + itemTitle + '">',
                    '<span class="iconRow ', itemIconStatus, '"></span>',
				    '<a class="anchorRow' , (item.disabled == true ? ' dashboard-item disabled' : '') , (item.previewable == true ? ' previewLink' : ' non-previewable-link') , '" ', (item.previewable == true) ? 'href="/studio/preview/#/?page='+currentBrowserUri+'&site='+CStudioAuthoringContext.site+'"' : '', '">',

                            displayName, (item.isNew == true) ? ' <span style="font-size:16px;">*</span>' : '',
                        '</a>',
                    '</div>',
                '</td>',
                '<td id="' + editLinkId + '"></td>',
                "<td class='urlCol' title='",browserUri,"'>", displayBrowserUri, "</td>",
                "<td title='fullUri' class='width0'>", uri, "</td>",                
                "<td class='alignRight ttThColLast'>", lastEditTime, "</td>"
            ]);
        }

        if(currentCheckItem && this.widgetId == currentDashboard){
            CStudioAuthoring.Utils.Cookies.eraseCookie("dashboard-checked");
        }

        return html.join("");
    };
	
	
};
