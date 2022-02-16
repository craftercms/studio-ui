/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

CStudioAdminConsole.Tool.SyncFromRepository =
  CStudioAdminConsole.Tool.SyncFromRepository ||
  function (config, el) {
    return this;
  };

/**
 * Overarching class that drives the content type tools
 */
YAHOO.extend(CStudioAdminConsole.Tool.SyncFromRepository, CStudioAdminConsole.Tool, {
  renderWorkarea: function () {
    var workareaEl = document.getElementById('cstudio-admin-console-workarea'),
      actions = [];
    workareaEl.innerHTML = '';
    CStudioAuthoring.ContextualNav.AdminConsoleNav.initActions(actions);
    CStudioAuthoring.Service.syncFromRepo(CStudioAuthoringContext.site, {
      success: function (result) {
        CStudioAuthoring.Operations.showSimpleDialog(
          'previewInitiated-dialog',
          CStudioAuthoring.Operations.simpleDialogTypeINFO,
          CMgs.format(formsLangBundle, 'notification'),
          CMgs.format(formsLangBundle, 'synchronizationRepo'),
          null, // use default button
          YAHOO.widget.SimpleDialog.ICON_INFO,
          'success studioDialog'
        );
      },
      failure: function () {}
    });
  }
});

CStudioAuthoring.Module.moduleLoaded(
  'cstudio-console-tools-sync-from-repository',
  CStudioAdminConsole.Tool.SyncFromRepository
);
