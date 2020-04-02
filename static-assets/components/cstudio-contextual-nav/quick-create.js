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
 * Branded Logo Plugin
 */
CStudioAuthoring.ContextualNav.WcmQuickCreate = CStudioAuthoring.ContextualNav.WcmQuickCreate || {
  CMgs: CStudioAuthoring.Messages,
  contextNavLangBundle: CStudioAuthoring.Messages.getBundle(
    'contextnav',
    CStudioAuthoringContext.lang
  ),

  /**
   * initialize module
   */
  initialize: function() {
    const quickCreateWrapper = $('.dropdown.quick-create');
    const container = $('#quick-create-menu')[0];

    if (CStudioAuthoringContext.isPreview || CStudioAuthoringContext.isDashboard) {
      $(quickCreateWrapper).removeClass('hide');
    }

    const success = ({ data }) => {
      const page = CStudioAuthoring.Utils.getQueryParameterURL('page');
      const acnDraftContent = $('.acnDraftContent').get(0);
      eventYS.data = data.item;
      eventYS.typeAction = 'createContent';
      eventYS.oldPath = null;
      eventYS.parent = data.item.path === '/site/website' ? null : false;
      document.dispatchEvent(eventYS);

      if (data.item.isPage) {
        CStudioAuthoring.Operations.refreshPreview(data.item);
        if (page === data.item.browserUri && acnDraftContent) {
          CStudioAuthoring.SelectedContent.setContent(data.item);
        }
      } else {
        CStudioAuthoring.Operations.refreshPreview();
      }
    };

    function renderQuickCreate(anchorEl) {
      let unmount;
      CrafterCMSNext.render(container, 'QuickCreateMenu', {
        onSaveLegacySuccess: success,
        previewItem:
          CStudioAuthoring && CStudioAuthoring.SelectedContent.selectedContent.length
            ? CStudioAuthoring.SelectedContent.selectedContent[0]
            : null,
        anchorEl,
        onMenuClose: () => renderQuickCreate(null)
      }).then((done) => (unmount = done.unmount));
    }

    quickCreateWrapper.click((e) => renderQuickCreate(e.currentTarget));
  }
};

CStudioAuthoring.Module.moduleLoaded('quick-create', CStudioAuthoring.ContextualNav.WcmQuickCreate);
