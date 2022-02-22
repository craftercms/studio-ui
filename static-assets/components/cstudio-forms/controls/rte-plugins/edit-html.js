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

/* global CStudioAuthoring, CStudioAuthoringContext, CStudioForms, YAHOO, aceEditor, tinymce2 */

CStudioAuthoring.Module.requireModule(
  'ace',
  '/static-assets/libs/ace/ace.js',
  {},
  {
    moduleLoaded: function () {
      CStudioAuthoring.Utils.addJavascript('/static-assets/libs/ace/ext-language_tools.js');
      CStudioAuthoring.Utils.addCss('/static-assets/themes/cstudioTheme/css/template-editor.css');

      var YDom = YAHOO.util.Dom,
        componentSelector = '.crComponent',
        buttonStateArr;

      CStudioForms.Controls.RTE.EditHTML = CStudioForms.Controls.RTE.EditHTML || {
        init: function (ed, url) {
          var t = this;

          ed.addButton('edithtml', {
            title: 'Edit Code',
            image:
              CStudioAuthoringContext.authoringAppBaseUri +
              '/static-assets/themes/cstudioTheme/images/icons/code-edit.gif',
            onclick: function (e) {
              if (!this.controlManager.get('edithtml').active) {
                // Enable code view
                this.controlManager.setActive('edithtml', true);
                t.enableCodeView(ed);
              } else {
                // Disable code view
                this.controlManager.setActive('edithtml', false);
                t.disableCodeView(ed);
              }
            }
          });
        },

        resizeCodeView: function (editor, defaults) {
          var rteControl = editor.contextControl,
            cmWidth = rteControl.containerEl.clientWidth - rteControl.codeModeXreduction;

          // Reset the inline styles
          defaults.forEach(function (el) {
            for (var style in el.styles) {
              el.element.style[style] = el.styles[style];
            }
          });

          var editorContainer = editor.codeView.container;
          editorContainer.style.width = cmWidth + 'px';
          editorContainer.style.height = 100 + 'px';
          editor.codeView.resize();

          editor.contextControl.resizeCodeView(editor.codeView);
        },

        /*
         * Look for all the components in the editor's content. Detach each component body from the DOM (so it's not visible in code mode)
         * and attach it to the component root element as a DOM attribute. When switching back to text mode, the component body will be
         * re-attached where it was
         *
         * @param editor
         * @param componentSelector : css selector used to look for all components in the editor
         */
        collapseComponents: function collapseComponents(editor, componentSelector) {
          var componentsArr = YAHOO.util.Selector.query(componentSelector, editor.getBody());

          editor['data-components'] = {};

          componentsArr.forEach(function (component) {
            editor['data-components'][component.id] = Array.prototype.slice.call(component.childNodes); // Copy children and store them in an attribute
            component.innerHTML = 'DYNAMIC COMPONENT';
          });
        },

        extendComponents: function extendComponents(editor, componentSelector) {
          var componentsArr = YAHOO.util.Selector.query(componentSelector, editor.getBody());

          componentsArr.forEach(function (component) {
            component.innerHTML = ''; // Replace any existing content with the original component content
            // The user may have changed the component id so test to see if the component ID exists
            if (editor['data-components'][component.id]) {
              editor['data-components'][component.id].forEach(function (child) {
                component.appendChild(child); // restore component children
              });
            }
          });
          delete editor['data-components'];
        },

        getEditorControlsStates: function getEditorControlsStates(editor) {
          var buttonStateArr = [],
            edControls = editor.controlManager.controls,
            buttonObj;
          for (var b in edControls) {
            // Filter out any inherited properties (e.g. prototype) and more complex controls that include controls themselves
            if (edControls.hasOwnProperty(b) && !edControls[b].controls && !/_edithtml/.test(b)) {
              buttonObj = {
                id: b,
                isDisabled: edControls[b].isDisabled()
              };
              buttonStateArr.push(buttonObj);
            }
          }
          return buttonStateArr;
        },

        disableTextControls: function disableTextControls(editor, controlsArr) {
          var edControls = editor.controlManager.controls;
          controlsArr.forEach(function (controlObj) {
            if (!controlObj.isDisabled) {
              edControls[controlObj.id].setDisabled(true);
            }
          });
        },

        enableTextControls: function enableTextControls(editor, controlsArr) {
          var edControls = editor.controlManager.controls;
          controlsArr.forEach(function (controlObj) {
            if (!controlObj.isDisabled) {
              edControls[controlObj.id].setDisabled(false);
            }
          });
        },

        enableCodeView: function enableCodeView(editor) {
          var rteControl = editor.contextControl,
            rteContainer = YAHOO.util.Selector.query(
              '.cstudio-form-control-rte-container',
              rteControl.containerEl,
              true
            );

          // A meta node used to dispatch an artificial event. The reason to use a meta node is because it is VERY unlikely
          // that any buttons will ever respond to changes on a node of this kind.
          var metaNode = document.createElement('meta');

          editor.onDeactivate.dispatch(editor, null); // Fire tinymce2 handlers for onDeactivate

          // Clear any selections on the text editor, then dispatch an artificial event so all buttons go back to their
          // default state before saving their state. Then, when we restore the buttons' state (when we go back to text mode),
          // we'll have their default state again!
          rteControl.clearTextEditorSelection();
          editor.onNodeChange.dispatch(editor, editor.controlManager, metaNode, true, editor);

          buttonStateArr = this.getEditorControlsStates(editor);
          this.disableTextControls(editor, buttonStateArr);
          YDom.replaceClass(rteControl.containerEl, 'text-mode', 'code-mode');
          this.collapseComponents(editor, componentSelector);
          editor.codeTextArea.value = editor.getContent();

          if (!editor.codeView) {
            var mode = 'ace/mode/html';

            editor.codeView = ace.edit(editor.codeTextArea);
            editor.codeView.session.setMode(mode);
            editor.codeView.setOptions({
              showPrintMargin: false,
              fontSize: '14px'
            });

            editor.codeView.on('focus', function () {
              rteControl.form.setFocusedField(rteControl);
            });

            editor.codeView.on('change', function () {
              rteControl.edited = true;
            });
          } else {
            editor.codeView.setValue(editor.codeTextArea.value);
            // Set the cursor to the beginning of the code editor; this will clear any text selection in
            // codeView -if there's any
            editor.codeView.selection.moveTo(0, 0);
            editor.codeView.clearSelection(); // This will remove the highlight over the text
          }
          // We resize codeView each time in case the user has resized the window
          this.resizeCodeView(editor, [
            {
              element: rteContainer,
              styles: {
                maxWidth: 'none',
                width: 'auto',
                marginLeft: 'auto'
              }
            },
            {
              element: YDom.get(editor.id + '_tbl'),
              styles: {
                width: 'auto',
                height: 'auto'
              }
            }
          ]);
          editor.codeView.focus();
          rteControl.scrollToTopOfElement(rteControl.containerEl, 30);
          try {
            editor.codeView.onChange();
          } catch (err) {}
        },

        disableCodeView: function (editor) {
          var rteControl = editor.contextControl,
            rteContainer = YAHOO.util.Selector.query(
              '.cstudio-form-control-rte-container',
              rteControl.containerEl,
              true
            );

          editor.setContent(editor.codeView.getValue());
          this.extendComponents(editor, componentSelector);
          rteControl.resizeTextView(rteControl.containerEl, rteControl.rteWidth, {
            'rte-container': rteContainer,
            'rte-table': YDom.get(editor.id + '_tbl')
          });
          YDom.replaceClass(rteControl.containerEl, 'code-mode', 'text-mode');
          this.enableTextControls(editor, buttonStateArr);
          editor.getWin().scrollTo(0, 0); // Scroll to the top of the editor window

          rteControl.clearTextEditorSelection();

          editor.contentWindow.frameElement.focus();
          tinymce2.activeEditor.getBody().focus();

          // iefix - when an element with focus disappears programatically focus does not work unless another item is focused
          $(editor.codeTextArea).show().focus();
          $('#mce_0_ifr').contents().find('body').focus();
          $(editor.codeTextArea).hide();

          rteControl.scrollToTopOfElement(rteControl.containerEl, 30);
        },

        createControl: function (n, cm) {
          return null;
        },

        getInfo: function () {
          return {
            longname: 'Crafter Studio Edit Code',
            author: 'CrafterCMS',
            authorurl: 'https://craftercms.org',
            infourl: 'https://craftercms.org',
            version: '1.0'
          };
        }
      };

      tinymce2.create('tinymce2.plugins.CStudioEditHTMLPlugin', CStudioForms.Controls.RTE.EditHTML);
      tinymce2.PluginManager.add('edithtml', tinymce2.plugins.CStudioEditHTMLPlugin);

      CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-rte-edit-html', CStudioForms.Controls.RTE.EditHTML);
    }
  }
);
