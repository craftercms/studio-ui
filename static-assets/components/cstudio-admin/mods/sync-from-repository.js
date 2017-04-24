CStudioAdminConsole.Tool.SyncFromRepository = CStudioAdminConsole.Tool.SyncFromRepository ||  function(config, el)  {
        this.containerEl = el;
        this.config = config;
        this.types = [];
        this.currMillis = new Date().getTime();
        return this;
    }

/**
 * Overarching class that drives the content type tools
 */
YAHOO.extend(CStudioAdminConsole.Tool.SyncFromRepository, CStudioAdminConsole.Tool, {
    renderWorkarea: function() {
        var workareaEl = document.getElementById("cstudio-admin-console-workarea");
        workareaEl.innerHTML = '';
        CStudioAuthoring.Service.syncFromRepo(CStudioAuthoringContext.site, {
            success: function(result) {
                CStudioAuthoring.Operations.showSimpleDialog(
                    "previewInitiated-dialog",
                    CStudioAuthoring.Operations.simpleDialogTypeINFO,
                    CMgs.format(formsLangBundle, "notification"),
                    CMgs.format(formsLangBundle, "synchronizationRepo"),
                    null, // use default button
                    YAHOO.widget.SimpleDialog.ICON_INFO,
                    "success studioDialog"
                );
            },
            failure: function() {}
        });
    }

});



CStudioAuthoring.Module.moduleLoaded("cstudio-console-tools-sync-from-repository",CStudioAdminConsole.Tool.SyncFromRepository);