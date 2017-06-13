var YDom = YAHOO.util.Dom;

if(typeof CStudioAuthoringWidgets == "undefined" || !CStudioAuthoringWidgets) {
   var CStudioAuthoringWidgets = {};
}

/**
 * Icon Guide
 */
CStudioAuthoringWidgets.IconGuideDashboard = CStudioAuthoringWidgets.IconGuideDashboard || function(widgetId, pageId) {
	
	this.widgetId = widgetId;
	this.pageId = pageId;
	this._self =  this;
	this.showInprogressItems = false;
	this.expanded = true;
	this.hideEmptyRow = false;
	
	WcmDashboardWidgetCommon.init(this);

	this.setStatusIcons = function() {
		var statusIcons = CStudioAuthoring.Constants.WORKFLOWICONS,
            el,
            elClass;

        for (var key in statusIcons) {
            if (statusIcons.hasOwnProperty(key)) {
                elClass = statusIcons[key];
                el = document.getElementById("guide-" + key);
                YDom.addClass(el, elClass);
            }
        }
    };

    YAHOO.util.Event.onDOMReady(this.setStatusIcons);

	/**
	 * get table data
	 */
	this.retrieveTableData = function(sortBy, sortAscDesc, callback) { 
		// never called
	};
	 
	/**
	 * callback to render the table headings
	 */
	this.renderItemsHeading = function() {
		// doesn't get called because we never invoke retrieve table data
		return "";	
	};

	/**
	 * Call back to render each line item of the table
	 */
	this.renderLineItem = function(item) {
		// doesn't get called because we never invoke retrieve table data
		return "";
	};	
};
