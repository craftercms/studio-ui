CStudioAuthoring.Utils.addCss("/static-assets/components/cstudio-admin/mods/log-view.css");
CStudioAdminConsole.Tool.statusView = CStudioAdminConsole.Tool.statusView ||  function(config, el)  {
    this.containerEl = el;
    this.config = config;
    this.types = [];
    return this;
}

/**
 * Overarching class that drives the content type tools
 */
YAHOO.extend(CStudioAdminConsole.Tool.statusView, CStudioAdminConsole.Tool, {
    renderWorkarea: function() {
        CStudioAdminConsole.Tool.statusView.Self = this;

        var workareaEl = document.getElementById("cstudio-admin-console-workarea");

        workareaEl.innerHTML =
            "<div id='status-view'>" +
                "<div class='content'>" +
                    "<h2 class='page-header'>"+CMgs.format(langBundle, "publishing")+"</h2>" +
                    "<h3 class='mt5'>"+CMgs.format(langBundle, "status")+"</h3>" +
                    "<div class='panel' id='publisherDashboard'>" +
                        "<div class='panel-heading'>"+
                            "<span id='statusText'>&nbsp;</span>"+
                            "<a id='refreshPublish' class='btn btn-primary mr15 fa fa-refresh pull-right'></a>"+
                        "</div>"+
                        "<div class='panel-body'>"+
                            "<span class='fa fa-cloud-upload f18 mr10' id='publishIcon'></span>"+
                            "<span id='publishMessage'>&nbsp;</span>"+
                        "</div>"+
                    "</div>" +
                    "<div class='publish-buttons'>" +
                        "<input id='startPublish' class='btn btn-primary mr10' type='button' value='Start' />"+
                        "<input id='stopPublish' class='btn btn-default' type='button' value='Stop' />"+
                "</div>"+
                "</div>" +
            "</div>";

        this.renderStatusView();

        var refreshPublish = YDom.get("refreshPublish"),
            startPublish = YDom.get("startPublish"),
            stopPublish = YDom.get("stopPublish");

        refreshPublish.onclick = CStudioAdminConsole.Tool.statusView.Self.appendStatus;
        startPublish.onclick = this.startClick;
        stopPublish.onclick = this.stopClick;
    },

    stopClick:function () {
        CStudioAuthoring.Service.stopPublishStatus(CStudioAuthoringContext.site, {
            success: function (response) {
                CStudioAdminConsole.Tool.statusView.Self.appendStatus();
            },
            failure: function (response) {
            }
        });
    },

    startClick: function() {
        CStudioAuthoring.Service.startPublishStatus(CStudioAuthoringContext.site, {
            success: function (response) {
                CStudioAdminConsole.Tool.statusView.Self.appendStatus();
            },
            failure: function (response) {
            }
        });
    },

    renderStatusView: function() {
        this.appendStatus();
        window.setTimeout(function(console) {
            console.renderStatusView();
        }, 3000, this);
    },

    appendStatus: function() {
        var iconEl = YDom.get("publishIcon"),
            messageEl = YDom.get("publishMessage"),
            statusTextEl = YDom.get("statusText"),
            startPublishEl = YDom.get("startPublish"),
            stopPublishEl = YDom.get("stopPublish"),
            iconColor, statusText;

        CStudioAuthoring.Service.getPublishStatus(CStudioAuthoringContext.site, {
            success: function (response) {
                stopPublishEl.disabled = false;
                startPublishEl.disabled = false;
                switch(response.status.toLowerCase()) {
                    case "busy":
                        iconColor = "#FF8C00";
                        statusText = "Busy"
                        break;
                    case "stopped":
                        iconColor = "#FF0000";
                        statusText = "Stopped";
                        stopPublishEl.disabled = true;
                        break;
                    default:
                        iconColor = "#7e9dbb";
                        statusText = "Idle";
                        startPublishEl.disabled = true
                };

                YDom.setStyle(iconEl, "color", iconColor);
                messageEl.textContent = response.message;
                statusTextEl.textContent = statusText;

            },
            failure: function (response) {
            }
        });
    }
});



CStudioAuthoring.Module.moduleLoaded("cstudio-console-tools-status-view",CStudioAdminConsole.Tool.statusView);
