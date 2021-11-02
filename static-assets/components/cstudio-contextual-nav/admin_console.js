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
 * PAdminConsoleMod
 */
CStudioAuthoring.ContextualNav.AdminConsoleMod = CStudioAuthoring.ContextualNav.AdminConsoleMod || {
  initialized: false,

  /**
   * initialize module
   */
  initialize: function (config) {
    this.definePlugin();
    CStudioAuthoring.ContextualNav.AdminConsoleNav.init();
  },

  definePlugin: function () {
    var YDom = YAHOO.util.Dom,
      YEvent = YAHOO.util.Event;

    CStudioAuthoring.register({
      'ContextualNav.AdminConsoleNav': {
        init: function () {
          if (CStudioAuthoringContext.isAuthoringConsole == true) {
            this.render();
          }
        },

        render: function () {
          document.getElementById('acn-dropdown').style.display = 'none';
          document.getElementById('acn-search').style.display = 'none';
        },

        clearActions: function () {
          document.getElementById('activeContentActions').innerHTML = '';
        },

        initActions: function (actions) {
          this.clearActions();

          var containerEl = document.getElementById('activeContentActions');
          YDom.addClass(containerEl, 'nav');
          YDom.addClass(containerEl, 'navbar-nav');

          for (var i = 0; i < actions.length; i++) {
            var action = actions[i];
            var linkContainerEl = document.createElement('li');
            var linkEl = document.createElement('a');

            YDom.addClass(linkContainerEl, 'acn-link');

            if (action.icon) {
              YDom.addClass(linkEl, 'fa ' + action.icon);
            } else {
              linkEl.innerHTML = action.name;
            }
            YDom.addClass(linkEl, 'cursor');
            YDom.addClass(linkEl, action.name.replace(/\s+/g, '-').toLowerCase());

            linkEl.style.cursor = 'pointer';

            linkContainerEl.appendChild(linkEl);
            containerEl.appendChild(linkContainerEl);

            YAHOO.util.Event.on(
              linkEl,
              'click',
              function (evt, param) {
                param.method();
              },
              { method: action.method, context: action.context }
            );
          }
        }
      }
    });
  }
};

CStudioAuthoring.Module.moduleLoaded('admin_console', CStudioAuthoring.ContextualNav.AdminConsoleMod);
