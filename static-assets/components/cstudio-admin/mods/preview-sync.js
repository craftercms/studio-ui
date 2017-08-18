CStudioAdminConsole.Tool.PreviewSync = CStudioAdminConsole.Tool.PreviewSync ||  function(config, el)  {
        return this;
    }

/**
 * Overarching class that drives the content type tools
 */
YAHOO.extend(CStudioAdminConsole.Tool.PreviewSync, CStudioAdminConsole.Tool, {
    renderWorkarea: function() {
        var workareaEl = document.getElementById("cstudio-admin-console-workarea"),
            actions = [];
        workareaEl.innerHTML = '';
        CStudioAuthoring.ContextualNav.AdminConsoleNav.initActions(actions);
        CStudioAuthoring.Service.previewServerSyncAll(CStudioAuthoringContext.site, {
            success: function() {
                CStudioAuthoring.Operations.showSimpleDialog(
                    "previewInitiated-dialog",
                    CStudioAuthoring.Operations.simpleDialogTypeINFO,
                    CMgs.format(formsLangBundle, "notification"),
                    CMgs.format(formsLangBundle, "previewInitiated"),
                    null, // use default button
                    YAHOO.widget.SimpleDialog.ICON_INFO,
                    "success studioDialog"
                );
            },
            failure: function() {}
        });
    }

});



CStudioAuthoring.Module.moduleLoaded("cstudio-console-tools-preview-sync",CStudioAdminConsole.Tool.PreviewSync);