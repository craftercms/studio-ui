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

/**
 * Status
 */
CStudioAuthoring.ContextualNav.StatusNavMod = {
  initialized: false,

  /**
   * initialize module
   */
  initialize: function(config) {
    this.definePlugin();
    CStudioAuthoring.ContextualNav.StatusNav.init();
  },

  definePlugin: function() {
    var YDom = YAHOO.util.Dom,
      YEvent = YAHOO.util.Event;
    /**
     * WCM preview tools Contextual Nav Widget
     */
    CStudioAuthoring.register({
      'ContextualNav.StatusNav': {
        init: function() {
          var me = this;
          this.render();

          window.onmessage = function(e) {
            if (e.data == 'status-changed') {
              me.refreshStatus();
            }
          };
        },

        refreshStatus: function() {
          var el,
            iconColor,
            iconClass,
            dialogEl,
            dialogText,
            me = this,
            CMgs = CStudioAuthoring.Messages,
            contextNavLangBundle = CMgs.getBundle('contextnav', CStudioAuthoringContext.lang);

          el = YDom.get('acn-status');

          CrafterCMSNext.services.publishing.status(CStudioAuthoringContext.site).subscribe(
            (response) => {
              dialogEl = YDom.getElementsByClassName('dialog-elt')[0];
              dialogText = YDom.getElementsByClassName('dialog-elt-text')[0];

              switch (response.status.toLowerCase()) {
                case 'busy':
                  iconColor = '#FF8C00';
                  iconClass = 'icon-orange';
                  if (dialogEl && !dialogEl.classList.contains('fa-spin')) dialogEl.classList.add('fa-spin');
                  break;
                case 'stopped':
                  iconColor = '#FF0000';
                  iconClass = 'icon-red';
                  if (dialogEl && dialogEl.classList.contains('fa-spin')) dialogEl.classList.remove('fa-spin');
                  break;
                default:
                  iconColor = 'inherit';
                  iconClass = 'icon-default';
                  if (dialogEl && !dialogEl.classList.contains('fa-spin')) dialogEl.classList.add('fa-spin');
              }

              YDom.setStyle(el.children[0], 'color', iconColor);
              YDom.setStyle(dialogEl, 'color', iconColor);

              // update status message
              if (dialogText) {
                dialogText.innerHTML = me.getStatusMessage(contextNavLangBundle, response.status);
              }
            },
            (response) => {
              el = YDom.get('acn-status');
              YDom.setStyle(el.children[0], 'color', '#777');
            }
          );
        },

        render: function() {
          var el,
            iconColor,
            iconClass,
            dialogEl,
            dialog,
            dialogText,
            me = this,
            CMgs = CStudioAuthoring.Messages,
            contextNavLangBundle = CMgs.getBundle('contextnav', CStudioAuthoringContext.lang);

          el = YDom.get('acn-status');

          function statusLoop(extDelay) {
            var delay = extDelay ? extDelay : 60000;

            CrafterCMSNext.services.publishing.status(CStudioAuthoringContext.site).subscribe(
              (response) => {
                dialogEl = YDom.getElementsByClassName('dialog-elt')[0];
                dialogText = YDom.getElementsByClassName('dialog-elt-text')[0];

                switch (response.status.toLowerCase()) {
                  case 'busy':
                    iconColor = '#FF8C00';
                    iconClass = 'icon-orange';
                    if (dialogEl && !dialogEl.classList.contains('fa-spin')) dialogEl.classList.add('fa-spin');
                    break;
                  case 'stopped':
                    iconColor = '#FF0000';
                    iconClass = 'icon-red';
                    if (dialogEl && dialogEl.classList.contains('fa-spin')) dialogEl.classList.remove('fa-spin');
                    break;
                  default:
                    iconColor = 'inherit';
                    iconClass = 'icon-default';
                    if (dialogEl && !dialogEl.classList.contains('fa-spin')) dialogEl.classList.add('fa-spin');
                }

                YDom.setStyle(el.children[0], 'color', iconColor);
                YDom.setStyle(dialogEl, 'color', iconColor);

                // update status message
                if (dialogText) {
                  dialogText.innerHTML = me.getStatusMessage(contextNavLangBundle, response.status);
                }

                if (extDelay) {
                  if (me.dialogOpen) {
                    setTimeout(function() {
                      statusLoop(delay);
                    }, delay);
                  }
                } else {
                  setTimeout(function() {
                    statusLoop();
                  }, delay);
                }
              },
              (response) => {
                el = YDom.get('acn-status');
                YDom.setStyle(el.children[0], 'color', '#777');

                if (extDelay) {
                  if (me.dialogOpen) {
                    setTimeout(function() {
                      statusLoop(delay);
                    }, delay);
                  }
                } else {
                  setTimeout(function() {
                    statusLoop();
                  }, delay);
                }
              }
            );
          }

          statusLoop();

          el.onclick = function() {
            var dialogOpenDelay = 3000;

            CrafterCMSNext.services.publishing.status(CStudioAuthoringContext.site).subscribe(
              (response) => {
                CStudioAuthoring.Operations.showSimpleDialog(
                  'status-dialog',
                  CStudioAuthoring.Operations.simpleDialogTypeINFO,
                  CMgs.format(contextNavLangBundle, 'publishStatus'),
                  "<span class='dialog-elt-text'>" +
                    me.getStatusMessage(contextNavLangBundle, response.status) +
                    '</span>',
                  [
                    {
                      text: CMgs.format(contextNavLangBundle, 'close'),
                      handler: function() {
                        me.dialogOpen = false;
                        this.hide();
                      },
                      isDefault: false
                    }
                  ], // use default button
                  'dialog-elt fa fa-circle-o-notch fa-spin fa-spin-fix ' + iconClass,
                  'studioDialog'
                );

                dialogEl = YDom.getElementsByClassName('dialog-elt')[0];
                dialog = YDom.get('status-dialog');
                YDom.setStyle(dialog.parentNode, 'z-index', '999');

                switch (response.status.toLowerCase()) {
                  case 'busy':
                    iconColor = '#FF8C00';
                    iconClass = 'icon-orange';
                    if (dialogEl && !dialogEl.classList.contains('fa-spin')) dialogEl.classList.add('fa-spin');
                    break;
                  case 'stopped':
                    iconColor = '#FF0000';
                    iconClass = 'icon-red';
                    if (dialogEl && dialogEl.classList.contains('fa-spin')) dialogEl.classList.remove('fa-spin');
                    break;
                  default:
                    iconColor = 'inherit';
                    iconClass = 'icon-default';
                    if (dialogEl && !dialogEl.classList.contains('fa-spin')) dialogEl.classList.add('fa-spin');
                }

                YDom.setStyle(el.children[0], 'color', iconColor);
                YDom.setStyle(dialogEl, 'color', iconColor);

                me.dialogOpen = true;
                statusLoop(dialogOpenDelay);
              },
              (response) => {
                let message;
                try {
                  message = JSON.parse(response.responseText).message;
                } catch (e) {
                  message = CMgs.format(CMgs.getBundle('contextnav', CStudioAuthoringContext.lang), 'networkError');
                }

                CStudioAuthoring.Operations.showSimpleDialog(
                  'error-dialog',
                  CStudioAuthoring.Operations.simpleDialogTypeINFO,
                  CMgs.format(contextNavLangBundle, 'publishStatus'),
                  "<span class='dialog-elt-text'>" + message + '</span>',
                  [
                    {
                      text: CMgs.format(contextNavLangBundle, 'close'),
                      handler: function() {
                        me.dialogOpen = false;
                        this.hide();
                      },
                      isDefault: false
                    }
                  ], // use default button
                  YAHOO.widget.SimpleDialog.ICON_BLOCK,
                  'studioDialog'
                );

                el = YDom.get('acn-status');
                YDom.setStyle(el.children[0], 'color', '#777');

                me.dialogOpen = true;
                statusLoop(dialogOpenDelay);
              }
            );
          };
        },

        getStatusMessage: function(contextNavLangBundle, status) {
          return CMgs.format(contextNavLangBundle, status.toLowerCase());
        }
      }
    });
  }
};

CStudioAuthoring.Module.moduleLoaded('status', CStudioAuthoring.ContextualNav.StatusNavMod);
