CStudioAuthoring.Utils.addCss("/static-assets/components/cstudio-admin/mods/bulkoperations.css");
CStudioAdminConsole.Tool.BulkOperations = CStudioAdminConsole.Tool.BulkOperations ||  function(config, el)  {
    this.containerEl = el;
    this.config = config;
    this.types = [];
    return this;
}

/**
 * Overarching class that drives the content type tools
 */
YAHOO.extend(CStudioAdminConsole.Tool.BulkOperations, CStudioAdminConsole.Tool, {
    renderWorkarea: function() {
        var workareaEl = document.getElementById("cstudio-admin-console-workarea");

        workareaEl.innerHTML =
            "<div id='bulk-ops'>" +
            "</div>";

        var actions = [];

        CStudioAuthoring.ContextualNav.AdminConsoleNav.initActions(actions);

        this.renderJobsList();
    },

    renderGoLive: function() {
         CStudioAdminConsole.Tool.BulkOperations.golive = function() {

            var CSA = CStudioAuthoring,
                CSAC = CStudioAuthoringContext,

                fmt = CSA.StringUtils.format;

            var modalBody = YDom.get("cstudio-wcm-popup-div");
            if (modalBody === null) {
                modalBody = document.createElement("div");
                modalBody.setAttribute("id", "cstudio-wcm-popup-div");
                document.body.appendChild(modalBody);
            }

            var continueFn = function continueFn (e) {
                e.preventDefault();
                dialog.destroy();   

                var envSelectEl = document.getElementById("go-pub-channel");
                var environment = envSelectEl[envSelectEl.selectedIndex].value;
                var path = document.getElementById("bulk-golive-path").value;
                if (path) {
                    var serviceUri = "/api/1/services/api/1/deployment/bulk-golive.json?site=" + CStudioAuthoringContext.site
                         + "&path=" + path + "&environment=" + escape(environment);
                    var goLiveOpMessage = document.getElementById("bulk-golive-message");
                    var cb = {
                        success:function() {},
                        failure: function(err) {}
                    }
   
                    YConnect.asyncRequest("POST", CStudioAuthoring.Service.createServiceUri(serviceUri), cb);
                    goLiveOpMessage.innerHTML = CMgs.format(langBundle, "publishStarted");
                }
            } 

            var cancelFn = function cancelFn (e) {
                e.preventDefault();
                dialog.destroy();
            }

            modalBody.innerHTML = "<div class='contentTypePopupInner changeContent-type-dialog' style='width:460px;height:140px;'>" +
                "<div class='contentTypePopupContent'>" +
                    "<form name='contentFromWCM'>" +
                    "<div class='contentTypePopupHeader'>" + CMgs.format(formsLangBundle, "bulkPublishDialogTitle")+ "</div> " +
                    "<div class='contentTypeOuter'>"+
                        "<div>" + CMgs.format(formsLangBundle, "bulkPublishDialogBody")+ "</div>" +                    
                    "</div>" +
                    "<div class='contentTypePopupBtn'>" +
                        "<input type='submit' class='btn btn-primary ok' id='acceptCTChange' value='" +CMgs.format(formsLangBundle, 'yes')+ "' />" +
                        "<input type='submit'class='btn btn-default cancel' id='cancelCTChange' value='" +CMgs.format(formsLangBundle, 'no')+ "' />" +
                    "</div>" +
                    "</form> " +
                "</div>" +
            "</div>";

            var dialog = new YAHOO.widget.Dialog("cstudio-wcm-popup-div",
            { fixedcenter : true,
                effect:{
                effect: YAHOO.widget.ContainerEffect.FADE,
                duration: 0.25
                },
                visible : false,
                modal:true,
                close:false,
                constraintoviewport : true,
                underlay:"none",
                zIndex: 100000
            });

            dialog.render();

            YAHOO.util.Event.addListener("acceptCTChange", "click", continueFn);
            YAHOO.util.Event.addListener("cancelCTChange", "click", cancelFn);

            dialog.show();
         };

        var mainEl = document.getElementById("bulk-ops");

        mainEl.innerHTML =
                "<div id='bulk-golive' class='bulk-op-area'>" +
                    "<p><h2>Bulk Publish</h2></p><p>" +
                    "<div class='bulk-table'>" +
                        "<div class='bulk-table-row'>" +
                            "<div class='bulk-table-cell'>Path to Publish:" +
                            "</div>" +
                            "<div class='bulk-table-cell'><input type='text' size=70 id='bulk-golive-path'/>" +
                            "</div>" +
                        "</div>" +
                        "<div class='bulk-table-row'>" +
                            "<div class='bulk-table-cell'>" +
                            "</div>" +
                            "<div class='bulk-table-cell'>(e.g. /site/website/about/index.xml)" +
                            "</div>" +
                        "</div>" +
                        "<div class='bulk-table-row'>" +
                            "<div class='bulk-table-cell'>Publishing Environment:" +
                            "</div>" +
                            "<div class='bulk-table-cell'><select id='go-pub-channel'></select>" +
                            "</div>" +
                        "</div>" +
                    "</div>" +
                    "</br>" +
                    "<input type='button' class='action-button' value='Publish' onclick='CStudioAdminConsole.Tool.BulkOperations.golive()' /></p>" +
                    "<p id='bulk-golive-message'></p>" +
                "</div>";


        var channelsSelect = document.getElementById("go-pub-channel");
        var publishingOptionsCB = {
            success:function(channels) {
                var publishingOptions = "";
                var channel_index = 0;
                for (idx in channels.availablePublishChannels) {
                    publishingOptions += "<option value='" + channels.availablePublishChannels[idx].name +"'>" + channels.availablePublishChannels[idx].name + "</option>"
                }
                channelsSelect.innerHTML = publishingOptions;
            },
            failure: function() {
            }
        }

        CStudioAuthoring.Service.retrievePublishingChannels(CStudioAuthoringContext.site, publishingOptionsCB)
    },

    renderJobsList: function() {

		var actions = [
				{ name: "Publish", context: this, method: this.renderGoLive }
		];
		CStudioAuthoring.ContextualNav.AdminConsoleNav.initActions(actions);

        this.renderGoLive();
    }
});

CStudioAuthoring.Module.moduleLoaded("cstudio-console-tools-bulkoperations",CStudioAdminConsole.Tool.BulkOperations);
