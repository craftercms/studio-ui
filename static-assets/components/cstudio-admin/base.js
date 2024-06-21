/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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
  document.addEventListener('CrafterCMS.CodebaseBridgeReady', () => {
    const i18n = CrafterCMSNext.i18n,
      formatMessage = i18n.intl.formatMessage,
      contentTypesMessages = i18n.messages.contentTypesMessages;

    CStudioAdminConsole = {
      toolContainerEls: [],

      render: function (containerEl) {
        this.containerEl = containerEl;

        if (!$('body').hasClass('embedded')) {
          containerEl.innerHTML = `
				<div id="categories-panel" class="categories-panel">
				  <div id="categoriesPanelWrapper"></div>
				</div>`;
        }

        $('#admin-console').append('<div id="cstudio-admin-console-workarea"></div>');

        // Need to wait for store to be initialized so auth token is available
        CrafterCMSNext.system.getStore().subscribe(() => {
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
        });
      },

      initRouter(tools) {
        const _self = this;
        const toolsNames = tools.map((tool) => tool.name);

        routie({
          'tool/:name?': function (name) {
            if (toolsNames.includes(name)) {
              _self.currentRoute = name;
              if (_self.toolsModules[name]) {
                CStudioAdminConsole.renderWorkArea(null, {
                  tool: _self.toolsModules[name],
                  toolbar: _self.toolbar
                });
              }
            } else {
              if (name) {
                $('#activeContentActions').empty();
                CStudioAdminConsole.CommandBar.hide();
                const elem = document.createElement('div');
                elem.className = 'work-area-error';
                $('#cstudio-admin-console-workarea').html(elem);
                CrafterCMSNext.render(elem, 'ErrorState', {
                  imageUrl: '/studio/static-assets/images/warning_state.svg',
                  classes: {
                    root: 'craftercms-error-state'
                  },
                  message: formatMessage(contentTypesMessages.toolNotFound, { tool: name })
                });
              } else {
                $('#activeContentActions').empty();
                CStudioAdminConsole.CommandBar.hide();
                _self.renderNothingSelected();
              }
            }
          },
          '*': function () {
            _self.renderNothingSelected();
          }
        });
      },

      buildModules: function (config, panelEl) {
        amplify.subscribe('/content-type/loaded', function () {
          var catEl = document.getElementById('admin-console');
          catEl.className = ''; // Clear any classes
          YDom.addClass(catEl, 'work-area-active');
        });

        const toolsArray = Boolean(config.tools.tool)
          ? Array.isArray(config.tools.tool)
            ? config.tools.tool
            : [config.tools.tool]
          : [];
        if (toolsArray.length) {
          this.toolsModules = {};
          this.initRouter(toolsArray);
          for (var j = 0; j < toolsArray.length; j++) {
            try {
              var toolContainerEl = document.createElement('div');
              this.toolContainerEls[this.toolContainerEls.length] = toolContainerEl;
              panelEl && panelEl.appendChild(toolContainerEl);

              if (j === 0) {
                YDom.addClass(toolContainerEl, 'cstudio-admin-console-item-first');
              }

              var cb = {
                moduleLoaded: function (moduleName, moduleClass, moduleConfig) {
                  try {
                    var tool = new moduleClass(moduleConfig, this.toolContainerEl);
                    this.context.toolsModules[tool.config.config.name] = tool;
                    tool.initialize(moduleConfig.config);
                    this.context.toolbar.addToolbarItem(tool, this.toolContainerEl);

                    if (this.context.currentRoute === tool.config.name) {
                      CStudioAdminConsole.renderWorkArea(null, {
                        tool,
                        toolbar: this.context.toolbar
                      });
                    }
                  } catch (e) {
                    // in preview, this function undefined raises error -- unlike dashboard.
                    // I agree, not a good solution!
                  }
                },

                context: this,
                toolContainerEl: toolContainerEl
              };
              const tool = toolsArray[j];
              CStudioAuthoring.Module.requireModule(
                `cstudio-console-tools-${tool.name}`,
                `/static-assets/components/cstudio-admin/mods/${tool.name}.js`,
                {
                  config: tool,
                  onError: function () {
                    CStudioAuthoring.Utils.showNotification(
                      formatMessage(contentTypesMessages.loadModuleError, { tool: tool.name }),
                      'top',
                      'right',
                      'error',
                      60,
                      0,
                      'tool-not-loaded'
                    );
                  }
                },
                cb
              );
            } catch (err) {
              console.log(err);
            }
          }
        } else {
          config.tools.tool = [config.tools.tool];
        }
      },

      renderWorkArea(evt, params) {
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
                  this.destroy();
                },
                isDefault: false
              },
              {
                text: CMgs.format(formsLangBundle, 'no'),
                handler: function () {
                  this.destroy();
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
          if (params.toolbar?.selectedEl) {
            YDom.removeClass(params.toolbar.selectedEl, 'cstudio-admin-console-item-selected');
            CStudioAdminConsole.CommandBar.hide();
            params.toolbar.selectedEl = params.tool.containerEl;
          }

          amplify.publish('TOOL_SELECTED');
          YDom.addClass(params.tool.containerEl, 'cstudio-admin-console-item-selected');
          params.tool.renderWorkarea();
        }
      },

      renderNothingSelected: function () {
        $('#cstudio-admin-console-workarea').append(`
        <div class="work-area-empty">
          <img src="/studio/static-assets/images/choose_option.svg" alt="">
          <div>${formatMessage(contentTypesMessages.siteConfigLandingMessage)}</div>
        </div>`);
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
          // custom icon
          span.className = 'mr10 fa ' + tool.config.icon.class;
        } else {
          span.className = 'mr10 fa ' + tool.config.label.toLowerCase().replace(/ /g, '');
        }

        if (tool.config.icon && tool.config.icon.styles) {
          // custom styling
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

        $(toolContainerEl).on('click', (e) => {
          window.location.hash = 'tool/' + tool.config.name;
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
        if (!action.multiChoice) {
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
        } else {
          const mountMode = CStudioAuthoring.Utils.getQueryParameterByName('mountMode');
          const options = ['save', 'saveAndClose'];
          if (mountMode === 'dialog') {
            options.push('saveAndMinimize');
          }
          const saveContainer = document.createElement('span');
          CrafterCMSNext.render(saveContainer, 'MultiChoiceSaveButton', {
            disablePortal: false,
            storageKey: 'contentTypeEditor',
            onClick: action.fn,
            options
          }).then((done) => (unmount = done.unmount));
          this.commandBarEl.appendChild(saveContainer);
        }
      }
    };

    YAHOO.util.Event.onAvailable('admin-console', function () {
      CStudioAdminConsole.render(document.getElementById('admin-console'));
    });
  });
})();
