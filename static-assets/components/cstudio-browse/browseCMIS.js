(function (window, $, Handlebars) {
    'use strict';

    var activePromise;

    var CStudioBrowseCMIS = $.extend(
        {}, window.CStudioBrowse);

    CStudioBrowseCMIS.init = function() {
        // var searchContext = this.determineSearchContextFromUrl();
        // CStudioBrowseCMIS.searchContext = searchContext;
        // CStudioBrowseCMIS.renderSiteFolders(searchContext.site, searchContext.path);

        var CMgs = CStudioAuthoring.Messages,
            browseLangBundle = CMgs.getBundle("browse", CStudioAuthoringContext.lang);
    };


    window.CStudioBrowseCMIS = CStudioBrowseCMIS;

}) (window, jQuery, Handlebars);