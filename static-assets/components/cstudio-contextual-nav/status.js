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
  initialize: function() {
    this.definePlugin();
    CStudioAuthoring.ContextualNav.StatusNav.init();
  },

  definePlugin: function() {
    var CMgs = CStudioAuthoring.Messages;
    /**
     * WCM preview tools Contextual Nav Widget
     */
    CStudioAuthoring.register({
      'ContextualNav.StatusNav': {
        init: function() {
          var me = this;
          this.render();
          window.onmessage = function(e) {
            if (e.data === 'status-changed') {
              me.refreshStatus();
            }
          };
        },
        refreshStatus: function() {
          console.log('ContextualNav.StatusNav.refreshStatus called.');
        },
        render: function() {
          var //
            $el = $('#acn-status'),
            iconClass,
            currentStatus = '';

          CrafterCMSNext.system.getStore().subscribe((store) => {
            store.subscribe(() => {
              let status = store.getState().dialogs.publishingStatus.status || '';
              if (currentStatus !== status) {
                currentStatus = status;
                switch (status.toLowerCase()) {
                  case 'busy':
                    iconClass = 'icon-orange';
                    break;
                  case 'stopped':
                    iconClass = 'icon-red';
                    break;
                  default:
                    iconClass = 'icon-default';
                }
                $el.removeClass('icon-default icon-red icon-orange').addClass(iconClass);
              }
            });
          });

          $el.on('click', function() {
            CrafterCMSNext.system
              .getStore()
              .subscribe((store) => store.dispatch({ type: 'SHOW_PUBLISHING_STATUS_DIALOG' }));
          });
        },
        getStatusMessage: function(contextNavLangBundle, status) {
          return CMgs.format(contextNavLangBundle, status.toLowerCase());
        }
      }
    });
  }
};

CStudioAuthoring.Module.moduleLoaded('status', CStudioAuthoring.ContextualNav.StatusNavMod);
