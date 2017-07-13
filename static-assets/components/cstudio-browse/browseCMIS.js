(function (window, $, Handlebars) {
    "use strict";

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

    CStudioBrowseCMIS.getContent = function(type) {
        var path = CStudioAuthoring.Utils.getQueryParameterByName("path"),
            repoId = CStudioAuthoring.Utils.getQueryParameterByName("repoId"),
            site = CStudioAuthoring.Utils.getQueryParameterByName("site");
        var serviceCallback = {
            success: function(response) {
                console.log(response); //TODO
            },

            failure: function(response) {
                console.log(response); //TODO
            }
        };
        if(type == "browse"){
            CStudioAuthoring.Service.getCMISContentByBrowser(site, repoId, path, serviceCallback);
        }else{
            CStudioAuthoring.Service.getCMISContentBySearch(site, repoId, path, serviceCallback);
        }


    };


    window.CStudioBrowseCMIS = CStudioBrowseCMIS;

}) (window, jQuery, Handlebars);