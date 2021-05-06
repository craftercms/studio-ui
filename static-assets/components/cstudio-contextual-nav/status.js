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
    CrafterCMSNext.system.getStore().subscribe((store) => {
      this.definePlugin(store);
      CStudioAuthoring.ContextualNav.StatusNav.init();
    });
  },

  definePlugin: function(store) {
    var CMgs = CStudioAuthoring.Messages;
    /**
     * WCM preview tools Contextual Nav Widget
     */
    CStudioAuthoring.register({
      'ContextualNav.StatusNav': {
        init: function() {
          this.render();
          window.onmessage = function(e) {
            if (e.data === 'status-changed') {
              store.dispatch({ type: 'FETCH_PUBLISHING_STATUS' });
            }
          };
        },
        render: function() {
          var //
            $el = $('#acn-status'),
            iconClass,
            currentStatus = '';

          store.subscribe(() => {
            let status = store.getState().dialogs.publishingStatus.status || '';
            if (currentStatus !== status) {
              currentStatus = status;
              switch (status.toLowerCase()) {
                case 'stopped':
                  iconClass = 'icon-orange';
                  break;
                case 'error':
                  iconClass = 'icon-red';
                  break;
                default:
                  iconClass = 'icon-default';
              }
              $el.removeClass('icon-default icon-red icon-orange').addClass(iconClass);
            }
          });

          $el.on('click', function() {
            store.dispatch({ type: 'SHOW_PUBLISHING_STATUS_DIALOG', payload: {} });
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
