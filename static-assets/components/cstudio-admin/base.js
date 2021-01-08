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

(function () {
  const i18n = CrafterCMSNext.i18n,
    formatMessage = i18n.intl.formatMessage,
    contentTypesMessages = i18n.messages.contentTypesMessages;

  CStudioAdminConsole = {
    toolContainerEls: [],

    render: function (containerEl) {
      this.containerEl = containerEl;

      containerEl.innerHTML = `
				<div id="categories-panel" class="categories-panel">
				  <div id="categoriesPanelWrapper"></div>
				</div>
				<div id="cstudio-admin-console-workarea">
          <div class="work-area-empty">
            <img src="/studio/static-assets/images/choose_option.svg" alt="">
            <div>${formatMessage(contentTypesMessages.siteConfigLandingMessage)}</div>
          </div>
        </div>`;

      CStudioAuthoring.Service.lookupConfigurtion(
        CStudioAuthoringContext.site,
        '/administration/site-config-tools.xml',
        {
          success: function (config) {
            var panelEl = YAHOO.util.Selector.query(
              '#admin-console .categories-panel #categoriesPanelWrapper',
              null,
              true
            );
            this.context.toolbar = new CStudioAdminConsole.Toolbar(panelEl);

            this.context.buildModules(config, panelEl);
          },

          failure: function () {},

          context: this
        }
      );
    },

    buildModules: function (config, panelEl) {
      amplify.subscribe('/content-type/loaded', function () {
        var catEl = document.getElementById('admin-console');
        catEl.className = ''; // Clear any classes
        YDom.addClass(catEl, 'work-area-active');
      });

      if (!config.tools.tool.length) {
        config.tools.tool = [config.tools.tool];
      }

      if (config.tools.tool.length) {
        for (var j = 0; j < config.tools.tool.length; j++) {
          try {
            var toolContainerEl = document.createElement('div');
            this.toolContainerEls[this.toolContainerEls.length] = toolContainerEl;
            panelEl.appendChild(toolContainerEl);

            if (j == 0) {
              YDom.addClass(toolContainerEl, 'cstudio-admin-console-item-first');
            }

            var cb = {
              moduleLoaded: function (moduleName, moduleClass, moduleConfig) {
                try {
                  var tool = new moduleClass(moduleConfig, this.toolContainerEl);
                  tool.initialize(moduleConfig.config);
                  this.context.toolbar.addToolbarItem(tool, this.toolContainerEl);
                } catch (e) {
                  // in preview, this function undefined raises error -- unlike dashboard.
                  // I agree, not a good solution!
                }
              },

              context: this,
              toolContainerEl: toolContainerEl
            };

            CStudioAuthoring.Module.requireModule(
              'cstudio-console-tools-' + config.tools.tool[j].name,
              '/static-assets/components/cstudio-admin/mods/' + config.tools.tool[j].name + '.js',
              { config: config.tools.tool[j] },
              cb
            );
          } catch (err) {
            //alert(err);
          }
        }
      }

      var entitlementValidatorP = document.createElement('p');
      YDom.addClass(entitlementValidatorP, 'entitlementValidator');
      entitlementValidatorP.innerHTML = entitlementValidator;
      document.getElementById('categories-panel').appendChild(entitlementValidatorP);
    }
  };

  CStudioAdminConsole.Toolbar = function (containerEl) {
    this.containerEl = containerEl;
    this.tools = [];
    this.toolContainerEls = [];
    return this;
  };

  CStudioAdminConsole.Toolbar.prototype = {
    addToolbarItem: function (tool, toolContainerEl) {
      var label = tool.config.label.toLowerCase();
      label = label.replace(/ /g, '');
      var labelLangBundle = CMgs.format(langBundle, label);
      label = labelLangBundle == label ? tool.config.label : labelLangBundle;

      var span = document.createElement('span');

      if (tool.config.icon && tool.config.icon.class) {
        //custom icon
        span.className = 'mr10 fa ' + tool.config.icon.class;
      } else {
        span.className = 'mr10 fa ' + tool.config.label.toLowerCase().replace(/ /g, '');
      }

      if (tool.config.icon && tool.config.icon.styles) {
        //custom styling
        var styles = tool.config.icon.styles;

        if (styles) {
          for (var key in styles) {
            if (styles.hasOwnProperty(key)) {
              span.style[key] = styles[key];
            }
          }
        }
      }

      const labelSpan = document.createElement('span');
      labelSpan.textContent = label;

      toolContainerEl.appendChild(span);
      toolContainerEl.appendChild(labelSpan);
      YDom.addClass(toolContainerEl, 'cstudio-admin-console-item');

      var elId = label.replace(/\s+/g, '-').toLowerCase();
      toolContainerEl.id = elId;

      var onRenderWorkAreaFn = function (evt, params) {
        var self = this;

        if (CStudioAdminConsole.isDirty) {
          CStudioAuthoring.Operations.showSimpleDialog(
            'error-dialog',
            CStudioAuthoring.Operations.simpleDialogTypeINFO,
            CMgs.format(langBundle, 'notification'),
            CMgs.format(langBundle, 'contentTypeModifiedWarn'),
            [
              {
                text: CMgs.format(formsLangBundle, 'yes'),
                handler: function () {
                  CStudioAdminConsole.isDirty = false;
                  selectedItem();
                  this.hide();
                },
                isDefault: false
              },
              {
                text: CMgs.format(formsLangBundle, 'no'),
                handler: function () {
                  this.hide();
                },
                isDefault: false
              }
            ],
            YAHOO.widget.SimpleDialog.ICON_WARN,
            'studioDialog'
          );
        } else {
          CStudioAdminConsole.isDirty = false;
          selectedItem();
        }

        function selectedItem() {
          if (params.toolbar.selectedEl) {
            YDom.removeClass(params.toolbar.selectedEl, 'cstudio-admin-console-item-selected');
            CStudioAdminConsole.CommandBar.hide();
          }

          amplify.publish('TOOL_SELECTED');

          params.toolbar.selectedEl = self;
          YDom.addClass(self, 'cstudio-admin-console-item-selected');
          params.tool.renderWorkarea();
          var arrowEl = document.getElementById('cstudio-admin-console-item-selected-arrow');

          if (!arrowEl) {
            arrowEl = document.createElement('div');
            arrowEl.id = 'cstudio-admin-console-item-selected-arrow';
          }

          params.toolbar.selectedEl.appendChild(arrowEl);
        }
      };

      onRenderWorkAreaFn.containerEl = toolContainerEl;
      YAHOO.util.Event.on(toolContainerEl, 'click', onRenderWorkAreaFn, {
        tool: tool,
        toolbar: this
      });

      this.tools[this.tools.length] = tool;
    }
  };

  CStudioAdminConsole.Tool = function () {};

  CStudioAdminConsole.Tool.prototype = {
    initialize: function (config) {
      this.config = config;
    },

    renderWorkarea: function () {}
  };

  CStudioAdminConsole.CommandBar = {
    render: function (actions) {
      if (!this.commandBarEl) {
        this.commandBarEl = document.createElement('div');
        this.commandBarEl.id = 'cstudio-admin-console-command-bar';
        YDom.addClass(this.commandBarEl, 'cstudio-form-controls-container');
        YDom.addClass(this.commandBarEl, 'hidden');

        document.body.appendChild(this.commandBarEl);
      }

      this.hide();
      this.addActions(actions);
    },

    hide: function () {
      YDom.addClass(this.commandBarEl, 'hidden');
    },

    show: function () {
      YDom.removeClass(this.commandBarEl, 'hidden');
    },

    addActions: function (actions) {
      this.commandBarEl.innerHTML = '';

      if (actions.length > 0) {
        for (var i = 0; i < actions.length; i++) {
          this.addAction(actions[i]);
        }

        this.show();
      }
    },

    addAction: function (action) {
      var buttonEl = document.createElement('input');
      YDom.addClass(buttonEl, 'btn');
      YDom.addClass(buttonEl, action.class ? action.class : 'btn-primary');
      buttonEl.type = 'button';
      buttonEl.value = action.label;
      if (action.id) {
        buttonEl.id = action.id;
      }
      this.commandBarEl.appendChild(buttonEl);
      buttonEl.onclick = action.fn;
    }
  };

  YAHOO.util.Event.onAvailable('admin-console', function () {
    CStudioAdminConsole.render(document.getElementById('admin-console'));
  });
})();
