(function (window, $, Handlebars) {
    "use strict";

    var activePromise;

    var CStudioBrowseCMIS = $.extend(
        {}, window.CStudioBrowse);

    CStudioBrowseCMIS.init = function() {
        CStudioBrowseCMIS.bindEvents();
        CStudioBrowseCMIS.getContent();
        var CMgs = CStudioAuthoring.Messages,
            browseLangBundle = CMgs.getBundle("browse", CStudioAuthoringContext.lang);
    };

    CStudioBrowseCMIS.bindEvents = function() {
        $(".tabs .tab-links a").on("click", function (e) {
            var currentAttrValue = jQuery(this).attr("href");

            // Show/Hide Tabs
            $(".tabs " + currentAttrValue).show().siblings().hide();

            // Change/remove current tab to active
            $(this).parent("li").addClass("active").siblings().removeClass("active");

            e.preventDefault();
        });
    },

    CStudioBrowseCMIS.getContent = function(type) {
        var path = CStudioAuthoring.Utils.getQueryParameterByName("path"),
            repoId = CStudioAuthoring.Utils.getQueryParameterByName("repoId"),
            site = CStudioAuthoring.Utils.getQueryParameterByName("site");
        var serviceCallback = {
            success: function(response) {
                //console.log(response); //TODO
            },

            failure: function(response) {
                //console.log(response); //TODO
            }
        };
        if(type === "browse"){
            CStudioAuthoring.Service.getCMISContentByBrowser(site, repoId, path, serviceCallback);
        }else{
            CStudioAuthoring.Service.getCMISContentBySearch(site, repoId, path, serviceCallback);
        }


    };


    window.CStudioBrowseCMIS = CStudioBrowseCMIS;

}) (window, jQuery, Handlebars);