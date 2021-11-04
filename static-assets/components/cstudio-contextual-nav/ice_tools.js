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
 * WCM Search Plugin
 */
CStudioAuthoring.ContextualNav.IceToolsMod = CStudioAuthoring.ContextualNav.IceToolsMod || {
  initialized: false,

  /**
   * initialize module
   */
  initialize: function (config) {
    this.definePlugin();
    CStudioAuthoring.ContextualNav.EditorsToolsNav.init();
  },

  definePlugin: function () {
    var YDom = YAHOO.util.Dom,
      YEvent = YAHOO.util.Event;
    /**
     * WCM editor tools Contextual Nav Widget
     */
    CStudioAuthoring.register({
      'ContextualNav.EditorsToolsNav': {
        init: function () {
          var _self = this;
          var callback = function (isRev) {
            if (CStudioAuthoringContext.isPreview == true && !isRev) {
              _self.render();
              if (CStudioAuthoring.IceTools) {
                //CStudioAuthoring.IceTools) {
                CStudioAuthoring.IceTools.IceToolsOffEvent.subscribe(function () {
                  var el = YDom.get('acn-ice-tools-container');
                  YDom.removeClass(el.children[0], 'icon-yellow');
                  YDom.addClass(el.children[0], 'icon-default');
                });

                CStudioAuthoring.IceTools.IceToolsOnEvent.subscribe(function () {
                  var el = YDom.get('acn-ice-tools-container');
                  YDom.removeClass(el.children[0], 'icon-default');
                  YDom.addClass(el.children[0], 'icon-yellow');
                });

                //						}
                //						else {
                cb = {
                  moduleLoaded: function (moduleName, moduleClass, moduleConfig) {
                    try {
                      CStudioAuthoring.IceTools.initialize(moduleConfig);
                      if (this.self.initialized == false) {
                        this.self.render();
                      }

                      this.self.initialized = true;

                      CStudioAuthoring.IceTools.IceToolsOffEvent.subscribe(function () {
                        var el = YDom.get('acn-ice-tools-container');
                        YDom.removeClass(el.children[0], 'icon-yellow');
                        YDom.addClass(el.children[0], 'icon-default');
                      });

                      CStudioAuthoring.IceTools.IceToolsOnEvent.subscribe(function () {
                        var el = YDom.get('acn-ice-tools-container');
                        YDom.removeClass(el.children[0], 'icon-default');
                        YDom.addClass(el.children[0], 'icon-yellow');
                      });

                      CStudioAuthoring.Module.requireModule(
                        'preview-tools-controller',
                        '/static-assets/components/cstudio-preview-tools/preview-tools.js',
                        0,
                        {
                          moduleLoaded: function (moduleName, moduleClass, moduleConfig) {
                            CStudioAuthoring.PreviewTools.PreviewToolsOffEvent.subscribe(function () {
                              CStudioAuthoring.IceTools.turnEditOff();
                            });
                          }
                        }
                      );
                    } catch (e) {}
                  },

                  self: this
                };

                CStudioAuthoring.Module.requireModule(
                  'ice-tools-controller',
                  '/static-assets/components/cstudio-preview-tools/ice-tools.js',
                  0,
                  cb
                );
              }
            }
          };
          CStudioAuthoring.Utils.isReviewer(callback);
        },

        render: function () {
          var el, containerEl, pencilIcon, iceOn;

          var CMgs = CStudioAuthoring.Messages;
          var previewLangBundle = CMgs.getBundle('forms', CStudioAuthoringContext.lang);

          el = YDom.get('acn-ice-tools');
          containerEl = document.createElement('div');
          containerEl.id = 'acn-ice-tools-container';
          YDom.addClass(containerEl, 'nav-link nav-container');

          pencilIcon = document.createElement('span');
          pencilIcon.id = 'acn-ice-tools-image';

          iceOn = !!sessionStorage.getItem('ice-on'); // cast string value to a boolean

          YDom.addClass(pencilIcon, 'nav-icon fa fa-pencil f18');
          $(pencilIcon).attr('data-title', 'inContextEdit');

          if (iceOn) {
            YDom.addClass(pencilIcon, 'icon-yellow');
          } else {
            YDom.addClass(pencilIcon, 'icon-default');
          }

          containerEl.appendChild(pencilIcon);
          el.appendChild(containerEl);

          el.onclick = function () {
            var iceOn = !!sessionStorage.getItem('ice-on'); // cast string value to a boolean

            if (!iceOn) {
              CStudioAuthoring.IceTools.turnEditOn();
            } else {
              CStudioAuthoring.IceTools.turnEditOff();
            }
          };
        }
      }
    });
  }
};

CStudioAuthoring.Module.moduleLoaded('ice_tools', CStudioAuthoring.ContextualNav.IceToolsMod);
