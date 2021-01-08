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
  contextNavLangBundle: CStudioAuthoring.Messages.getBundle('contextnav', CStudioAuthoringContext.lang),

  /**
   * initialize module
   */
  initialize: function () {
    var dropdown = $('#quick-create .quick-create-elements-container'),
      quickCreateWrapper = $('.dropdown.quick-create'),
      self = this;
    CStudioAuthoring.Service.getQuickCreate({
      success: function (response) {
        if (CStudioAuthoringContext.isPreview || CStudioAuthoringContext.isDashboard) {
          $(quickCreateWrapper).removeClass('hide');
          if (response && response.length > 0) {
            var item = null,
              html = '';
            for (var i = 0; i < response.length; i++) {
              (function (item) {
                html = $(self.rowTemplate(CrafterCMSNext.util.string.escapeHTML(item.label), i));
                html.click(function () {
                  CStudioAuthoring.Operations.openContentWebForm(
                    item.contentTypeId,
                    null,
                    null,
                    CStudioAuthoring.Operations.processPathsForMacros(item.path, null, true),
                    false,
                    false,
                    {
                      success: function (contentTO, editorId, name, value, draft) {
                        var page = CStudioAuthoring.Utils.getQueryParameterURL('page');
                        var acnDraftContent = $('.acnDraftContent').get(0);
                        eventYS.data = contentTO.item;
                        eventYS.typeAction = 'createContent';
                        eventYS.oldPath = null;
                        eventYS.parent = contentTO.item.path === '/site/website' ? null : false;
                        document.dispatchEvent(eventYS);
                        if (contentTO.item.isPage) {
                          CStudioAuthoring.Operations.refreshPreview(contentTO.item);
                          if (page === contentTO.item.browserUri && acnDraftContent) {
                            CStudioAuthoring.SelectedContent.setContent(contentTO.item);
                          }
                        } else {
                          CStudioAuthoring.Operations.refreshPreview();
                        }
                      },
                      failure: function () {},
                      callingWindow: window
                    },
                    null
                  );
                });
                dropdown.append(html);
              })(response[i]);
            }
          } else {
            dropdown.html(self.createEmptyTemplate());
          }
        }
      },
      failure: function () {
        dropdown.html(self.createEmptyTemplate());
      }
    });
  },

  rowTemplate: function (label, i) {
    return '<li class="item' + i + '"><a class="pointer">' + label + '</a></li>';
  },

  createEmptyTemplate: function () {
    return (
      '<li class="quickCreateEmpty"><i class="fa fa-exclamation-circle"></i>' +
      this.CMgs.format(this.contextNavLangBundle, 'quickCreateEmpty') +
      '</li>'
    );
  }
};

CStudioAuthoring.Module.moduleLoaded('quick-create', CStudioAuthoring.ContextualNav.WcmQuickCreate);
