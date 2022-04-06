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

var YDom = YAHOO.util.Dom;
var YEvent = YAHOO.util.Event;

/**
 * WCM Site Dropdown Plugin
 */
CStudioAuthoring.ContextualNav.WcmDropDown = CStudioAuthoring.ContextualNav.WcmDropDown || {
  initialized: false,

  /**
   * initialize module
   */
  initialize: function (config) {
    if (!CStudioAuthoring.ContextualNav.WcmSiteDropdown) {
      this.initialized = true;
      this.renderDropdown();
      CStudioAuthoring.ContextualNav.WcmSiteDropdown.init();
    }
  },

  renderDropdown: function () {
    // Local Shortcuts
    var YDom = YAHOO.util.Dom,
      YEvent = YAHOO.util.Event,
      auth = CStudioAuthoring,
      utils = auth.Utils,
      strUtils = auth.StringUtils,
      storage = auth.Storage,
      $ = jQuery;

    var CMgs = CStudioAuthoring.Messages;
    var contextNavLangBundle = CMgs.getBundle('contextnav', CStudioAuthoringContext.lang);
    var mainContainerEl = YDom.get('acn-dropdown-wrapper');

    var navBarSiteNameEl = YDom.get('navbar-site-name');

    CrafterCMSNext.system.getStore().subscribe((store) => {
      let site = store.getState().sites.byId[CStudioAuthoringContext.site];
      const siteName = site.name || site.id;
      navBarSiteNameEl.innerHTML = siteName;
      navBarSiteNameEl.setAttribute('title', siteName);
    });

    if (window.location.pathname.indexOf('browse') > -1 || window.location.pathname.indexOf('site-config') > -1) {
      mainContainerEl.innerHTML = '';
      CrafterCMSNext.render('#acn-dropdown-wrapper', 'CrafterIcon', {
        style: { fontSize: '33px', margin: '9px 5px 5px' }
      });
    } else {
      mainContainerEl.innerHTML = `<div id="acn-dropdown" class="acn-dropdown">
          <div id="acn-dropdown-inner" class="acn-dropdown-inner">
            <div id="acn-dropdown-toggler"></div>
          </div>
          <div
            style="display:none"
            id="acn-dropdown-menu-wrapper"
            class="acn-dropdown-menu-wrapper unselectable"
          >
            <div id="acn-resize" class="acn-resize">
              <div class="acn-data">
                <div id="acn-context-menu" class="acn-context-menu"></div>
                <div id="acn-context-tooltip" class="acn-context-tooltip"></div>
                <div id="acn-dropdown-menu" style="height:100%" class="acn-dropdown-menu">
                  <div id="acn-dropdown-menu-inner" class="acn-dropdown-menu-inner unselectable"></div>
                  <div class="craftercms-entitlement">
                    <img class="craftercms-entitlement-logo craftercms-logo" src="/studio/static-assets/images/logo.svg" alt="CrafterCMS">
                    <img class="craftercms-entitlement-logo craftercms-logo-dark" src="/studio/static-assets/images/logo-dark.svg" alt="CrafterCMS">
                    <p class="craftercms-entitlement-copy">${entitlementValidator}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>`;

      CrafterCMSNext.render('#acn-dropdown-toggler', 'LogoAndMenuBundleButton', {
        style: { margin: '4px 0' }
      });

      /**
       * WCM Site Dropdown Contextual Nav Widget
       */
      auth.register({
        'ContextualNav.WcmSiteDropdown': {
          /**
           * Static Members
           * In the Object oriented implementation this should members should be static
           */
          instanceCount: 0, // Instance Counter
          STORED_CONFIG_KEY_TEMPLATE: 'wcm-site-dropdown-prefs-{0}',
          INSTANCE_ID_TEMPLATE: 'wcm-site-dropdown-{0}',
          /**
           * Provides a unique instance Id to assign to new component instances
           * @return {String} A unique instance Id
           */
          getNextInstanceId: function () {
            var np = auth.ContextualNav.WcmSiteDropdown;
            return strUtils.format(np.INSTANCE_ID_TEMPLATE, np.instanceCount++);
          },
          /**
           * Closes the dropdown when the user clicks outside it
           * @param {MouseEvent} evt The DOM event this method listens to
           */
          windowClickCloseFn: function (evt) {
            /* For some reason YUI's context menu needs the click event propagation
             * further than the top parent element, so here: read the property set to
             ** the event in the dropdown container to see if the click was inside it */
            if (!evt.insidedropdown) {
              /* On windows firefox when right clicking inside the dropdown the dropdown
               * wrapper click fn is not triggered, so check & see if the click was inside
               * the dropdown */
              var parent = YDom.get('acn-dropdown-wrapper'),
                node = evt.target;
              while (node != null && parent != node && node.id != 'cstudio-wcm-popup-div') node = node.parentNode;

              /* when we click on copy/change template pop ups
               * context nav should be in open state	*/
              if (node != null && node.id == 'cstudio-wcm-popup-div') {
                return;
              }
              parent != node && this.setVisible(false);
            } else if (evt.insidedropdown) {
              /**
               * canned searches are under drop-down menu, but when canned searches are
               * clicked drop-down need to be closed.
               */
              if (evt.target.className == 'canned-search-el') {
                this.setVisible(false);
              }
            }
          },
          dropdownWrapperClickFn: function (evt) {
            evt.insidedropdown = true;
            // Stopping the event even at this point caused
            // the contextual menu actions to stop being triggered
            // YEvent.stopPropagation(evt);
          },
          /* * * * * * * * * * * * *
           * Instance Members
           * * * * * * * * * * * */
          handleScroll: false,
          instanceId: null,
          oConfig: {
            persistState: true,
            role: 'default',
            minHeight: 84,
            maxHeight: 600,
            minWidth: 225,
            maxWidth: 1000
          },
          oPreferences: {
            height: '180px',
            width: '265px',
            visible: false,
            scrollX: 0,
            scrollY: 0,
            toString: function () {
              return YAHOO.lang.JSON.stringify(this);
            }
          },
          // list of modules active / loaded
          activeModules: [],
          /**
           * Widget Constructor
           * @param {Object} oConfig Configuration items to override the default ones
           * @param {Object} oPreferences Preferences to override the default & stored ones
           * @see oConfig
           * @see oPreferences
           * @return {CStudioAuthoring.ContextualNav.WcmSiteDropdown} The instance of the object
           */
          init: function (oConfig, oPreferences) {
            this.instanceId = auth.ContextualNav.WcmSiteDropdown.getNextInstanceId();
            this.initializeConfig(oConfig);
            this.initializePreferences(oPreferences);
            this.initializeResizing();
            this.initializeVisibility();

            var cfg = this.oPreferences,
              self = this;
            YEvent.onAvailable('acn-dropdown-menu', function () {
              YEvent.addListener('acn-dropdown-menu', 'scroll', function () {
                cfg.scrollY = this.scrollTop;
                cfg.scrollX = this.scrollLeft;
                self.save();
              });
            });
            CStudioAuthoring.Service.retrieveSiteDropdownConfiguration('default', {
              success: function (config) {
                this.context.buildModules(config);
                this.context.save();
              },

              failure: function () {},

              context: this
            });

            $(window).resize(function () {
              if (window.innerWidth >= 768) {
                $('.site-dropdown-open .studio-preview').css({ left: cfg.width });
                $('.site-dropdown-open .site-dashboard').css({ left: cfg.width });
                $('.site-dropdown-open .cstudio-search').css({ left: cfg.width });
              } else {
                $('.site-dropdown-open .studio-preview').css({ left: 0 });
                $('.site-dropdown-open .site-dashboard').css({ left: 0 });
                $('.site-dropdown-open .cstudio-search').css({ left: 0 });
              }
            });

            return this;
          },
          /**
           * Initializes the widget's configuration
           * @param {Object} oConfig Set of values to override the defaults
           */
          initializeConfig: function (oConfig) {
            oConfig && YAHOO.lang.augmentObject(this.oConfig, oConfig, true);
            return this;
          },
          /**
           * Intializes the widget's user preferences
           * @param {String} oPreferences Set of values to override the defaults and stored
           */
          initializePreferences: function (oPreferences) {
            var storedstr = storage.retrieve(this.getStoredCfgKey()),
              oStored = storedstr && storedstr !== '' ? utils.decode(storedstr) : null;
            oStored && YAHOO.lang.augmentObject(this.oPreferences, oStored, true);
            oPreferences && YAHOO.lang.augmentObject(this.oPreferences, oPreferences, true);
            return this;
          },
          /**
           *
           */
          getStoredCfgKey: function () {
            return strUtils.format(auth.ContextualNav.WcmSiteDropdown.STORED_CONFIG_KEY_TEMPLATE, this.oConfig.role);
          },
          initializeVisibility: function () {
            // Enable the link element to open & close the dropdown
            YEvent.on(
              'acn-dropdown-toggler',
              'click',
              function (evt) {
                YEvent.preventDefault(evt);
                this.toggleDropdown();
              },
              null,
              this
            );
            YEvent.on('acn-dropdown-wrapper', 'click', auth.ContextualNav.WcmSiteDropdown.dropdownWrapperClickFn);
            if (this.oPreferences.visible) {
              // Set config visibility to false so that
              // setVisible method wont bypass the call
              this.oPreferences.visible = false;
              this.setVisible(true);
            }

            return this;
          },
          initializeResizing: function () {
            var cookie_dropdown_heightWidth = 'wcm_site_dropdown_heightWidth',
              dom = YAHOO.util.Dom,
              query = YAHOO.util.Selector.query,
              $ = jQuery;
            var self = this;
            $('#acn-resize').width(self.oPreferences.width);
            $(function () {
              $('#acn-resize').resizable({
                minHeight: 150,
                minWidth: 265,
                start: function (event, ui) {
                  $('#engineWindow').css('pointer-events', 'none');
                },
                stop: function (event, ui) {
                  $('#engineWindow').css('pointer-events', 'auto');
                  self.oPreferences.width = ui.size.width + 'px';
                  self.oPreferences.height = ui.size.height + 'px';
                  self.save();
                },
                resize: function (event, ui) {
                  ui.size.height = ui.originalSize.height;
                  $('.site-dropdown-open .studio-preview').css({ left: ui.size.width });
                  $('.site-dropdown-open .site-dashboard').css({ left: ui.size.width });
                  $('.site-dropdown-open .cstudio-search').css({ left: ui.size.width });
                }
              });
            });
            return this;
          },
          save: function () {
            this.oConfig.persistState && storage.write(this.getStoredCfgKey(), this.oPreferences.toString(), 360);
            return this;
          },
          setVisible: function (visible) {
            var animator = new crafter.studio.Animator('#acn-dropdown-menu-wrapper'),
              setStyle = YDom.setStyle,
              cfg = this.oPreferences;
            if (cfg.visible !== visible) {
              if (visible) {
                $('html').addClass('site-dropdown-open');
                if (window.innerWidth >= 768) {
                  $('.site-dropdown-open .studio-preview').css({ left: cfg.width });
                  $('.site-dropdown-open .site-dashboard').css({ left: cfg.width });
                  $('.site-dropdown-open .cstudio-search').css({ left: cfg.width });
                } else {
                  $('.site-dropdown-open .studio-preview').css({ left: 0 });
                  $('.site-dropdown-open .site-dashboard').css({ left: 0 });
                  $('.site-dropdown-open .cstudio-search').css({ left: 0 });
                }
                YDom.addClass('acn-dropdown-wrapper', 'site-dropdown-open');
                animator.slideIn();
              } else {
                $('html').removeClass('site-dropdown-open');
                $('.studio-preview').css({ left: 0 });
                $('.site-dashboard').css({ left: 0 });
                $('.cstudio-search').css({ left: 0 });
                YDom.removeClass('acn-dropdown-wrapper', 'site-dropdown-open');
                animator.slideOut();
              }
              cfg.visible = visible;
              //YEvent[visible ? "addListener" : "removeListener"](window, 'click', auth.ContextualNav.WcmSiteDropdown.windowClickCloseFn, null, this);
              this.save();
            }

            return this;
          },
          /**
           * toggle visibility on nav element
           * state can be OPEN, CLOSED, TOGGLE
           */
          toggleDropdown: function () {
            return this.setVisible(!this.oPreferences.visible);
          },
          updateScrollPosition: function (visible) {
            if (this.handleScroll) {
              var e = YDom.get('acn-dropdown-menu'),
                cfg = this.oPreferences;
              if (visible) {
                e.scrollTop = cfg.scrollY;
                e.scrollLeft = cfg.scrollX;
              } else {
                cfg.scrollY = e.scrollTop;
                cfg.scrollX = e.scrollLeft;
              }
            }
            return this;
          },

          /**
           * given a dropdown configuration, build the dropdown
           */
          buildModules: function (dropdownConfig) {
            var groups = dropdownConfig.groups,
              j,
              k,
              a,
              b,
              c,
              menuItems,
              modules;

            if (!groups.length) {
              groups = new Array();
              groups = groups.concat(dropdownConfig.groups.group);
            }

            for (var i = 0, a = groups.length; i < a; i++) {
              menuItems = groups[i].menuItems;

              if (!menuItems.length) {
                menuItems = new Array();
                menuItems = menuItems.concat(groups[i].menuItems.menuItem);
              }

              for (j = 0, b = menuItems.length; j < b; j++) {
                modules = menuItems[j].modulehooks;

                if (!modules.length) {
                  modules = new Array();
                  modules = modules.concat(menuItems[j].modulehooks.modulehook);
                }

                CStudioAuthoring.Service.lookupAuthoringRole(
                  CStudioAuthoringContext.site,
                  CStudioAuthoringContext.user,
                  {
                    success: function (userRoles) {
                      // The new "PagesWidget" requires content types to be loaded
                      var fetchContentTypes = false;
                      for (k = 0, c = modules.length; k < c; k++) {
                        this.initDropdownModule(userRoles, modules[k]);
                        fetchContentTypes = fetchContentTypes || modules[k].render === 'PagesWidget';
                      }
                      if (fetchContentTypes) {
                        CrafterCMSNext.system.store.dispatch({ type: 'FETCH_CONTENT_TYPES' });
                      }
                    },
                    failure: function () {},
                    initDropdownModule: this.initDropdownModule
                  }
                );
              }
            }
          },

          /**
           * initialize a dropdown module
           */
          initDropdownModule: function (userRoles, module) {
            var allowed = false;
            if (!module.params || !module.params.roles) {
              allowed = true;
            } else {
              var roles;
              if (module.params.roles.role instanceof Array) {
                roles = module.params.roles.role;
              } else {
                roles = [module.params.roles.role];
              }

              if (roles.length == 0 || roles[0] == undefined) {
                allowed = true;
              } else {
                var allowed = false;
                var userRoles = userRoles.roles;
                allowed = userRoles.some((role) => roles.includes(role));
              }
            }
            if (allowed) {
              var dropdownInnerEl = YDom.get('acn-dropdown-menu-inner');
              var moduleContainerEl = document.createElement('div');

              // Dividers look unwell. Removing support for the old prop and adding a new one.
              // The old class seemed to have been dropped at some point.
              if (module.divider === 'true') {
                YDom.addClass(moduleContainerEl, 'sidebar-module-legacy--with-divider');
              }

              if (dropdownInnerEl) {
                dropdownInnerEl.appendChild(moduleContainerEl);
              }

              module.containerEl = moduleContainerEl;

              var self = this,
                cb = {
                  moduleLoaded: function (moduleName, moduleClass, moduleConfig) {
                    try {
                      moduleClass.initialize(moduleConfig);
                    } catch (e) {
                      // TODO: Address this error properly when it occurs.
                      // This is catching other errors without intention. Address the specific cases properly.
                      console.error(e.message);
                    }
                  }
                };

              module.name === 'wcm-root-folder' &&
                (cb.once = function () {
                  try {
                    CStudioAuthoring.ContextualNav.WcmRootFolder.treePathOpenedEvt.subscribe(function (evtType, aArgs) {
                      if (aArgs[0] == aArgs[1]) {
                        // number of instances == number of times event has fired
                        self.handleScroll = true;
                        self.oPreferences.visible && self.updateScrollPosition(true);
                      }
                    });
                  } catch (ex) {}
                });

              const $el = $(moduleContainerEl);
              if (module.container) {
                const containerProps = module.container;
                containerProps.style && $el.css(containerProps.style);
                containerProps.class && $el.addClass(containerProps.class);
              }

              // render CrafterCMSNext Components
              if (module.render) {
                $el.addClass('sidebar-module-next');
                CrafterCMSNext.render(moduleContainerEl, module.render, module.props);
              } else {
                $(moduleContainerEl).addClass(`sidebar-module-${module.plugin ? 'plugin' : 'legacy'}`);
                CStudioAuthoring.Module.requireModule(
                  module.plugin ? module.plugin.name : module.name,
                  module.plugin
                    ? `/1/plugin/file?siteId=${CStudioAuthoringContext.site}&type=${module.plugin.type}&name=${
                        module.plugin.name || module.name
                      }&filename=${module.plugin.file}${
                        module.plugin.pluginId ? `&pluginId=${module.plugin.pluginId}` : ''
                      }`
                    : `/static-assets/components/cstudio-contextual-nav/wcm-site-dropdown-mods/${module.name}.js`,
                  module,
                  cb
                );
              }
            }
          },

          refreshDropdown: function () {
            // Get the dropdown wrapper
            var container = document.getElementById('acn-dropdown-menu-inner'),
              // Get all the direct decendants of the wrapper
              elems = YAHOO.util.Selector.query('> div', container),
              // Find the parent node of the site selector select
              siteSelectorParent = document.getElementById('acn-site-dropdown').parentNode,
              l = elems.length - 1;
            // Remove all but the site selector parent div
            while (l) {
              if (elems[l] !== siteSelectorParent) {
                container.removeChild(elems[l]);
              }
              l--;
            }
            // Re-initialise the dropdown (refresh)
            CStudioAuthoring.ContextualNav.WcmSiteDropdown.init();
          }
        }
      });
      CStudioAuthoring.Events.widgetScriptLoaded.fire('wcm-site-dropdown');
    }

    window.addEventListener(
      'hashchange',
      function (e) {
        e.preventDefault();
        navBarSiteNameEl.innerHTML = CStudioAuthoringContext.site;
      },
      false
    );
  }
};

CStudioAuthoring.Module.moduleLoaded('wcm_dropdown', CStudioAuthoring.ContextualNav.WcmDropDown);
