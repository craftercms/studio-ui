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

CStudioAuthoring.Utils.addJavascript('/static-assets/modules/editors/tinymce/v2/tiny_mce/tiny_mce.js');
CStudioAuthoring.Utils.addJavascript('/static-assets/components/cstudio-forms/forms-engine.js');

var initRegCookie;
/**
 * editor tools
 */
CStudioAuthoring.IceToolsPanel = CStudioAuthoring.IceToolsPanel || {
  initialized: false,

  /**
   * initialize module
   */
  initialize: function (config) {
    if (this.initialized == false) {
      this.initialized = true;
    }
  },

  render: function (containerEl, config) {
    var container = document.createElement('div'),
      wrapper;

    containerEl.appendChild(container);
    container.className = 'studio-view';

    var buttonEl, pencilIcon, labelEl, iceOn;

    var callback = function (isRev) {
      if (!isRev) {
        wrapper = document.createElement('div');
        buttonEl = document.createElement('button');
        pencilIcon = document.createElement('span');
        labelEl = document.createElement('span');
        YDom.addClass(wrapper, 'form-group ice-toogle');
        YDom.addClass(buttonEl, 'btn btn-default btn-block');
        YDom.addClass(labelEl, 'acn-ptools-ice-label');

        iceOn = !!sessionStorage.getItem('ice-on'); // cast string value to a boolean

        YDom.addClass(pencilIcon, 'fa fa-pencil f18');

        if (iceOn) {
          YDom.addClass(pencilIcon, 'icon-yellow');
          labelEl.innerHTML = CMgs.format(previewLangBundle, 'inContextEditOff');
        } else {
          YDom.addClass(pencilIcon, 'icon-default');
          labelEl.innerHTML = CMgs.format(previewLangBundle, 'inContextEditOn');
        }

        buttonEl.appendChild(pencilIcon);
        buttonEl.appendChild(labelEl);
        wrapper.appendChild(buttonEl);
        container.appendChild(wrapper);

        buttonEl.onclick = function () {
          var iceOn = !!sessionStorage.getItem('ice-on'); // cast string value to a boolean
          if (!iceOn) {
            CStudioAuthoring.IceTools.turnEditOn();
          } else {
            CStudioAuthoring.IceTools.turnEditOff();
          }
        };

        wrapper = document.createElement('div');
        var regionSelectEl = document.createElement('select');

        YDom.addClass(wrapper, 'form-group');
        YDom.addClass(regionSelectEl, 'form-control');

        wrapper.appendChild(regionSelectEl);
        container.appendChild(wrapper);

        initRegCookie = function () {
          try {
            var regions = JSON.parse(sessionStorage.getItem('ice-tools-content')) || [];

            for (i = 0; i < regionSelectEl.length; i++) {
              regionSelectEl.options[i] = null;
            }

            if (regions.length > 0) {
              regionSelectEl.options[0] = new Option(CMgs.format(previewLangBundle, 'jumpToRegion'), '0', true, false);
              for (var i = 0; i < regions.length; i++) {
                var label = regions[i].label ? regions[i].label.replace(/__/g, ' ') : regions[i].id.replace(/__/g, ' ');
                regionSelectEl.options[i + 1] = new Option(label, '' + (i + 1), false, false);
              }

              regionSelectEl.onchange = function () {
                var selectedIndex = this.selectedIndex;
                if (selectedIndex != 0) {
                  var region = regions[selectedIndex - 1];
                  if (region.label) {
                    amplify.publish(cstopic('ICE_TOOLS_REGIONS'), {
                      label: '-label',
                      region: region.label
                    });
                  } else {
                    amplify.publish(cstopic('ICE_TOOLS_REGIONS'), { label: '', region: region.id });
                  }
                }
              };
            } else {
              regionSelectEl.options[0] = new Option('No Regions', '0', true, false);
            }
          } catch (err) {
            if (window.console && window.console.log) {
              console.log(err);
            }
          }
        };
      }

      var checkRenderingTemplates = function (renderingTemplates) {
        var noTemplate = true;
        for (var x = 0; x < renderingTemplates.length; x++) {
          if (renderingTemplates[x].uri != '') {
            noTemplate = false;
          }
        }
        return noTemplate;
      };

      wrapper = document.createElement('div');
      YDom.addClass(wrapper, 'edit-code template');
      var templateButtonEl = document.createElement('button');
      var templateIconEl = document.createElement('i');
      var templateLabelEl = document.createElement('span');

      YDom.addClass(templateIconEl, 'fa fa-code f14');
      templateLabelEl.innerHTML = CMgs.format(previewLangBundle, 'editTemplate');

      // YDom.addClass(wrapper, 'form-group');
      YDom.addClass(templateButtonEl, 'btn btn-default btn-block');
      YDom.addClass(templateLabelEl, 'acn-ptools-ice-label');

      templateButtonEl.appendChild(templateIconEl);
      templateButtonEl.appendChild(templateLabelEl);
      wrapper.style.marginleft = '4px';
      wrapper.appendChild(templateButtonEl);

      container.appendChild(wrapper);

      wrapper = document.createElement('div');
      YDom.addClass(wrapper, 'edit-code');
      var controllerButtonEl = document.createElement('button');
      var controllerIconEl = document.createElement('i');
      var controllerLabelEl = document.createElement('span');

      YDom.addClass(controllerIconEl, 'fa fa-code f14');
      controllerLabelEl.innerHTML = CMgs.format(previewLangBundle, 'editController');

      // YDom.addClass(wrapper, 'form-group');
      YDom.addClass(controllerButtonEl, 'btn btn-default btn-block');
      YDom.addClass(controllerLabelEl, 'acn-ptools-ice-label');

      controllerButtonEl.appendChild(controllerIconEl);
      controllerButtonEl.appendChild(controllerLabelEl);
      wrapper.appendChild(controllerButtonEl);

      container.appendChild(wrapper);

      templateButtonEl.onclick = function () {
        if (!checkRenderingTemplates(CStudioAuthoring.SelectedContent.getSelectedContent()[0].renderingTemplates)) {
          var selectedContent = CStudioAuthoring.SelectedContent.getSelectedContent()[0],
            renderingTemplate = selectedContent.renderingTemplates[0].uri,
            contentType = selectedContent.contentType;

          CStudioAuthoring.Operations.openCodeEditor({
            path: renderingTemplate,
            contentType,
            mode: 'ftl',
            onSuccess: () => {
              CStudioAuthoring.Operations.refreshPreview();
            }
          });
        } else {
          var dialogEl = document.getElementById('errNoTemplAssoc');
          if (!dialogEl) {
            var dialog = new YAHOO.widget.SimpleDialog('errNoTemplAssoc', {
              width: '400px',
              fixedcenter: true,
              visible: false,
              draggable: false,
              close: false,
              modal: true,
              text:
                CMgs.format(formsLangBundle, 'noTemplatesAssoc') +
                ' ' +
                CStudioAuthoring.SelectedContent.getSelectedContent()[0].internalName,
              icon: YAHOO.widget.SimpleDialog.ICON_BLOCK,
              constraintoviewport: true,
              buttons: [
                {
                  text: CMgs.format(formsLangBundle, 'ok'),
                  handler: function () {
                    this.hide();
                  },
                  isDefault: false
                }
              ]
            });
            dialog.setHeader(CMgs.format(formsLangBundle, 'cancelDialogHeader'));
            dialog.render(document.body);
            dialogEl = document.getElementById('errNoTemplAssoc');
            dialogEl.dialog = dialog;
          }
          dialogEl.className += ' studioDialog';
          dialogEl.dialog.show();
        }
      };

      controllerButtonEl.onclick = function () {
        if (CStudioAuthoring.SelectedContent.getSelectedContent()[0].contentType) {
          var contentType = CStudioAuthoring.SelectedContent.getSelectedContent()[0].contentType.split('/');
          var path = '/scripts/pages/' + contentType[contentType.length - 1] + '.groovy';

          (function (controllerName) {
            var getContentItemCb = {
              success: function (contentTO) {
                var flag = true;
                for (var i = 0; i < contentTO.item.children.length; i++) {
                  if (contentTO.item.children[i].name == controllerName) {
                    flag = false;
                  }
                }

                (function (flag) {
                  CStudioAuthoring.Operations.openCodeEditor(path, contentType, 'groovy', () => {
                    if (CStudioAuthoringContext.isPreview) {
                      CStudioAuthoring.Operations.refreshPreview();
                    }
                    if (flag) {
                      var callback = {
                        success: function (contentTOItem) {
                          eventYS.parent = false;
                          eventYS.data = contentTOItem.item;
                          eventYS.typeAction = '';
                          document.dispatchEvent(eventYS);
                        },
                        failure: function () {}
                      };

                      CStudioAuthoring.Service.lookupContentItem(
                        CStudioAuthoringContext.site,
                        '/scripts/pages/',
                        callback,
                        false,
                        false
                      );
                    }
                  });
                })(flag);
              },
              failure: function () {}
            };

            CStudioAuthoring.Service.lookupSiteContent(
              CStudioAuthoringContext.site,
              '/scripts/pages/',
              1,
              'default',
              getContentItemCb
            );
          })(contentType[contentType.length - 1] + '.groovy');
        } else {
          var CMgs = CStudioAuthoring.Messages;
          var langBundle = CMgs.getBundle('forms', CStudioAuthoringContext.lang);
          CStudioAuthoring.Operations.showSimpleDialog(
            'loadModelError-dialog',
            CStudioAuthoring.Operations.simpleDialogTypeINFO,
            CMgs.format(langBundle, 'notification'),
            CMgs.format(langBundle, 'controllerError'),
            null,
            YAHOO.widget.SimpleDialog.ICON_BLOCK,
            'studioDialog'
          );
        }
      };
      var contextNavImg = YDom.get('acn-ice-tools-image');
      var cstopic = crafter.studio.preview.cstopic;

      CStudioAuthoring.Module.requireModule(
        'ice-tools',
        '/static-assets/components/cstudio-preview-tools/ice-tools.js',
        {},
        {
          moduleLoaded: function () {
            CStudioAuthoring.IceTools.IceToolsOffEvent.subscribe(function onIceToolsOffEvent() {
              YDom.removeClass(pencilIcon, 'icon-yellow');
              YDom.addClass(pencilIcon, 'icon-default');
              YDom.removeClass(contextNavImg, 'icon-yellow');
              YDom.addClass(contextNavImg, 'icon-default');
              labelEl.innerHTML = CMgs.format(previewLangBundle, 'inContextEditOn');

              amplify.publish(cstopic('ICE_TOOLS_OFF'));
            });

            CStudioAuthoring.IceTools.IceToolsOnEvent.subscribe(function onIceToolsOnEvent() {
              YDom.removeClass(pencilIcon, 'icon-default');
              YDom.addClass(pencilIcon, 'icon-yellow');
              YDom.removeClass(contextNavImg, 'icon-default');
              YDom.addClass(contextNavImg, 'icon-yellow');
              YDom.replaceClass(containerEl.parentNode, 'contracted', 'expanded');
              labelEl.innerHTML = CMgs.format(previewLangBundle, 'inContextEditOff');

              amplify.publish(cstopic('ICE_TOOLS_ON'));
            });
          }
        }
      );

      if (iceOn) {
        CStudioAuthoring.IceTools.turnEditOn();
      }

      // Create the event
      var event = new CustomEvent('name-of-event', { detail: 'Example of an event' });

      // Dispatch/Trigger/Fire the event
      document.dispatchEvent(event);
    };

    CStudioAuthoring.Utils.isReviewer(callback);
  }
};

CStudioAuthoring.Module.moduleLoaded('ice-tools-panel', CStudioAuthoring.IceToolsPanel);
