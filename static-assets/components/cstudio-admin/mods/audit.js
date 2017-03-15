// CStudioAuthoring.Utils.addCss("/static-assets/components/cstudio-admin/mods/log-view.css");
CStudioAdminConsole.Tool.Audit = CStudioAdminConsole.Tool.Audit ||  function(config, el)  {
        this.containerEl = el;
        this.config = config;
        this.types = [];
        this.currMillis = new Date().getTime();
        return this;
    }

/**
 * Overarching class that drives the content type tools
 */
YAHOO.extend(CStudioAdminConsole.Tool.Audit, CStudioAdminConsole.Tool, {
    renderWorkarea: function() {
        var workareaEl = document.getElementById("cstudio-admin-console-workarea"),
            auditUrl = '/studio/#/audit?iframe=true&site=' + CStudioAuthoringContext.siteId;

        workareaEl.innerHTML =
            '<div class="iframe-container" style="position: relative; left: 200px; top: 50px; width: calc(100% - 200px); height: calc(100vh - 50px);">' +
                '<iframe src="'+ auditUrl +'" style="width: 100%; height: 100%;"></iframe>' +
            '</div>';
    }

});



CStudioAuthoring.Module.moduleLoaded("cstudio-console-tools-audit",CStudioAdminConsole.Tool.Audit);