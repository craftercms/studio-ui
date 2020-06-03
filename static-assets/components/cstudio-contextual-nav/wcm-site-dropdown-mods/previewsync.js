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
CStudioAuthoring.ContextualNav.PreviewSync = CStudioAuthoring.ContextualNav.PreviewSync || {
  /**
   * initialize module
   */
  initialize: function (config) {
    if (config.name == 'previewsync') {
      this.initialized = true;
      var dropdownInnerEl = config.containerEl;

      var parentFolderEl = document.createElement('div');
      parentFolderEl.style.paddingTop = '8px';
      var parentFolderLinkEl = document.createElement('a');
      parentFolderEl.appendChild(parentFolderLinkEl);
      YDom.addClass(parentFolderLinkEl, 'acn-previewsync');

      parentFolderLinkEl.id = 'previewsync';
      parentFolderLinkEl.innerHTML = CMgs.format(siteDropdownLangBundle, 'previewSync');
      parentFolderLinkEl.onclick = function () {
        CStudioAuthoring.Service.previewServerSyncAll(CStudioAuthoringContext.site, {
          success: function () {
            CStudioAuthoring.Operations.showSimpleDialog(
              'previewInitiated-dialog',
              CStudioAuthoring.Operations.simpleDialogTypeINFO,
              CMgs.format(siteDropdownLangBundle, 'notification'),
              CMgs.format(siteDropdownLangBundle, 'previewInitiated'),
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
CStudioAuthoring.Module.moduleLoaded('previewsync', CStudioAuthoring.ContextualNav.PreviewSync);
