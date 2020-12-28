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

(function(window, $, Handlebars) {
  'use strict';

  if (typeof window.CStudioSearch == 'undefined' || !window.CStudioSearch) {
    var CStudioSearch = {};
    window.CStudioSearch = CStudioSearch;
  }

  /* default search context */
  CStudioSearch.searchContext = {
    searchId: null,
    mode: 'default' // possible mode values: [default|select]
  };

  CStudioSearch.init = function() {
    CStudioAuthoring.OverlayRequiredResources.loadRequiredResources();
    CStudioAuthoring.OverlayRequiredResources.loadContextNavCss();

    this.messages = {
      browseSearchMessages: CrafterCMSNext.i18n.messages.browseSearchMessages,
      words: CrafterCMSNext.i18n.messages.words
    };

    this.searchContext.mode = CStudioAuthoring.Utils.getQueryVariable(document.location.search, 'mode') || 'default';
    this.searchContext.searchId = CStudioAuthoring.Utils.getQueryVariable(document.location.search, 'searchId');

    if (this.searchContext.mode === 'select') {
      this.renderFormControls();
    }
    this.bindEvents();
  };

  CStudioSearch.bindEvents = function() {
    $('#cstudio-command-controls').on('click', '#formSaveButton', function() {
      CStudioSearch.saveContent();
    });
    $('#cstudio-command-controls').on('click', '#formCancelButton', function() {
      window.close();
      $(window.frameElement.parentElement)
        .closest('.studio-ice-dialog')
        .parent()
        .remove(); //TODO: find a better way
    });
  };

  CStudioSearch.renderFormControls = function(result) {
    var $formControlContainer = $('#cstudio-command-controls-container'),
      source = $('#hb-command-controls').html(),
      template = Handlebars.compile(source),
      html;

    html = template(result);
    $(html).appendTo($formControlContainer);
  };

  CStudioSearch.changeSelectStatus = function(path, selected) {
    var callback = {
      success: function(contentTO) {
        if (selected == true) {
          CStudioAuthoring.SelectedContent.selectContent(contentTO.item);
        } else {
          CStudioAuthoring.SelectedContent.unselectContent(contentTO.item);
        }
        if ($('#formSaveButton')) {
          $('#formSaveButton').prop('disabled', CStudioAuthoring.SelectedContent.getSelectedContentCount() === 0);
        }
      },
      failure: function(error) {
        console.error(error);
      }
    };

    CStudioAuthoring.Service.lookupContentItem(CStudioAuthoringContext.site, path, callback, false, false);
  };

  CStudioSearch.saveContent = function() {
    var _self = this;
    var searchId = this.searchContext ? this.searchContext.searchId : '';
    var crossServerAccess = false;
    var opener = window.opener ? window.opener : parent.iframeOpener;

    try {
      // unfortunately we cannot signal a form close across servers
      // our preview is in one server
      // our authoring is in another
      // in this case we just close the window, no way to pass back details which is ok in some cases
      if (opener.CStudioAuthoring) {
      }
    } catch (crossServerAccessErr) {
      crossServerAccess = true;
    }
    if (opener && !crossServerAccess) {
      if (opener.CStudioAuthoring) {
        var openerChildSearchMgr = opener.CStudioAuthoring.ChildSearchManager;

        if (openerChildSearchMgr) {
          var searchConfig = openerChildSearchMgr.searches[searchId];
          if (searchConfig) {
            var callback = searchConfig.saveCallback;
            if (callback) {
              var selectedContentTOs = CStudioAuthoring.SelectedContent.getSelectedContent();
              openerChildSearchMgr.signalSearchClose(searchId, selectedContentTOs);
            } else {
              //TODO PUT THIS BACK
              //alert("no success callback provided for seach: " + searchId);
            }

            window.close();
            $(window.frameElement.parentElement)
              .closest('.studio-ice-dialog')
              .parent()
              .remove(); //TODO: find a better way
          } else {
            CStudioAuthoring.Operations.showSimpleDialog(
              'lookUpChildError-dialog',
              CStudioAuthoring.Operations.simpleDialogTypeINFO,
              CrafterCMSNext.i18n.intl.formatMessage(_self.messages.words.notification),
              CrafterCMSNext.i18n.intl.formatMessage(_self.messages.browseSearchMessages.lookUpChildError, {
                searchId
              }),
              [
                {
                  text: 'OK',
                  handler: function() {
                    this.hide();
                    window.close();
                    $(window.frameElement.parentElement)
                      .closest('.studio-ice-dialog')
                      .parent()
                      .remove(); //TODO: find a better way
                  },
                  isDefault: false
                }
              ],
              YAHOO.widget.SimpleDialog.ICON_BLOCK,
              'studioDialog'
            );
          }
        } else {
          CStudioAuthoring.Operations.showSimpleDialog(
            'lookUpParentError-dialog',
            CStudioAuthoring.Operations.simpleDialogTypeINFO,
            CMgs.format(langBundle, 'notification'),
            CrafterCMSNext.i18n.intl.formatMessage(_self.messages.words.notification),
            CrafterCMSNext.i18n.intl.formatMessage(_self.messages.browseSearchMessages.lookUpParentError, { searchId }),
            [
              {
                text: 'OK',
                handler: function() {
                  this.hide();
                  window.close();
                  $(window.frameElement.parentElement)
                    .closest('.studio-ice-dialog')
                    .parent()
                    .remove(); //TODO: find a better way
                },
                isDefault: false
              }
            ],
            YAHOO.widget.SimpleDialog.ICON_BLOCK,
            'studioDialog'
          );
        }
      }
    } else {
      // no window opening context or cross server call
      // the only thing we can do is close the window
      window.close();
      $(window.frameElement.parentElement)
        .closest('.studio-ice-dialog')
        .parent()
        .remove(); //TODO: find a better way
    }
  };
})(window, jQuery, Handlebars);
