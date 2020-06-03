/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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

var YDom = YAHOO.util.Dom;
var YEvent = YAHOO.util.Event;

/**
 * PreviewSync
 */
CStudioAuthoring.ContextualNav.SyncFromRepo = CStudioAuthoring.ContextualNav.SyncFromRepo || {
  /**
   * initialize module
   */
  initialize: function (config) {
    if (config.name == 'syncrepo') {
      this.initialized = true;
      var dropdownInnerEl = config.containerEl;

      var parentFolderEl = document.createElement('div');
      parentFolderEl.style.paddingTop = '8px';
      var parentFolderLinkEl = document.createElement('a');
      parentFolderEl.appendChild(parentFolderLinkEl);
      YDom.addClass(parentFolderLinkEl, 'acn-syncrepo');

      parentFolderLinkEl.id = 'syncrepo';
      parentFolderLinkEl.innerHTML = CMgs.format(siteDropdownLangBundle, 'syncrepo');
      parentFolderLinkEl.onclick = function () {
        CStudioAuthoring.Service.syncFromRepo(CStudioAuthoringContext.site, {
          success: function (result) {
            CStudioAuthoring.Operations.showSimpleDialog(
              'previewInitiated-dialog',
              CStudioAuthoring.Operations.simpleDialogTypeINFO,
              CMgs.format(siteDropdownLangBundle, 'notification'),
              CMgs.format(siteDropdownLangBundle, 'syncfromRepoInitiated'),
              null, // use default button
              YAHOO.widget.SimpleDialog.ICON_INFO,
              'success studioDialog'
            );
          },
          failure: function () {}
        });
      };

      dropdownInnerEl.appendChild(parentFolderEl);
    }
  }
};
CStudioAuthoring.Module.moduleLoaded('syncrepo', CStudioAuthoring.ContextualNav.SyncFromRepo);
