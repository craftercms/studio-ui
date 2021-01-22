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

(function() {
  const i18n = CrafterCMSNext.i18n,
    formatMessage = i18n.intl.formatMessage,
    adminConfigurationMessages = i18n.messages.adminConfigurationMessages;

  const XML_HEADER = `<?xml version="1.0" encoding="UTF-8"?>
<!--
~ Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
~
~ This program is free software: you can redistribute it and/or modify
~ it under the terms of the GNU General Public License version 3 as published by
~ the Free Software Foundation.
~
~ This program is distributed in the hope that it will be useful,
~ but WITHOUT ANY WARRANTY; without even the implied warranty of
~ MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
~ GNU General Public License for more details.
~
~ You should have received a copy of the GNU General Public License
~ along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->
`;

  CStudioAuthoring.Module.requireModule('ace', '/static-assets/libs/ace/ace.js', {}, { moduleLoaded });

  function moduleLoaded() {
    CStudioAuthoring.Utils.addCss('/static-assets/themes/cstudioTheme/css/template-editor.css');
    CStudioAuthoring.Utils.addJavascript('/static-assets/libs/ace/ext-language_tools.js');

    CStudioAuthoring.Utils.addCss('/static-assets/components/cstudio-admin/mods/admin-configurations.css');
    CStudioAdminConsole.Tool.AdminConfig =
      CStudioAdminConsole.Tool.AdminConfig ||
      function(config, el) {
        this.containerEl = el;
        this.config = config;
        this.types = [];
        return this;
      };

    /**
     * Overarching class that drives the content type tools
     */
    YAHOO.extend(CStudioAdminConsole.Tool.AdminConfig, CStudioAdminConsole.Tool, {
      height: 600,

      renderWorkarea: function() {
        var workareaEl = document.getElementById('cstudio-admin-console-workarea'),
          self = this;

        workareaEl.innerHTML = '<div id="config-area"></div>';
        var actions = [];

        CrafterCMSNext.services.environment.fetchActiveEnvironment().subscribe(
          (environment) => {
            self.environment = environment;
            CStudioAuthoring.ContextualNav.AdminConsoleNav &&
              CStudioAuthoring.ContextualNav.AdminConsoleNav.initActions(actions);
            self.renderJobsList();

            var historyEl = document.createElement('li');
            historyEl.className = 'acn-link';
            historyEl.id = 'historyEl';

            document.getElementById('activeContentActions').appendChild(historyEl);
          },
          () => {
            console.log(data.response.message);
          }
        );
      },

      renderJobsList: function() {
        var self = this,
          containerEl = document.getElementById('config-area');

        containerEl.innerHTML =
          '<div class="configuration-window">' +
          /**/ '<p id="activeEnvironment" class="hide"><strong>Active Environment:</strong> <span id="active-environment-value">' +
          this.environment +
          '</span></p>' +
          /**/ '<select id="config-list">' +
          /****/ '<option value="" >' +
          CMgs.format(langBundle, 'confTabSelectConf') +
          '</option>' +
          /**/ '</select>' +
          /**/ '<div id="edit-area">' +
          /****/ '<div id="menu-area">' +
          /******/ '<div id="config-description">' +
          /******/ '</div>' +
          /******/ '<div id="config-buttons">' +
          /******/ '</div>' +
          /****/ '</div>' +
          /****/ '<div id="content-area">' +
          /******/ '<div id="edit-window">' +
          /******/ '</div>' +
          /******/ '<div id="sample-window">' +
          /******/ '</div>' +
          /****/ '</div>' +
          /**/ '</div>' +
          /**/ '<div id="encryptHintText" style="display: none;">' +
          /****/ this.renderEncryptionHint() +
          /**/ '</div>' +
          '</div>';
        // set editor for configuration file
        var editorContainerEl = document.getElementById('edit-window');
        var editorEl = this.setEditor(editorContainerEl, false);
        // set editor for sample configuration file
        var sampleEditorContainerEl = document.getElementById('sample-window');
        var sampleEditorEl = this.setEditor(sampleEditorContainerEl, true);

        // set active environment
        var activeEnvironmentElt = document.getElementById('active-environment-value');
        this.loadActiveEnv(activeEnvironmentElt);

        var itemSelectEl = document.getElementById('config-list');
        // add action buttons
        var buttonAreaEl = document.getElementById('config-buttons');
        this.addButtons(buttonAreaEl, itemSelectEl, editorEl);
        // set configuration dropdown
        var editAreaEl = document.getElementById('edit-area');

        this.configInfo = {
          itemSelectEl,
          editAreaEl,
          editor: editorEl,
          sampleEditor: sampleEditorEl
        };

        this.loadConfigFiles();

        const cb = () => {
          self.loadSelectedConfig();
        };

        const handler = () => {
          amplify.unsubscribe('HISTORY_REVERT', cb);
          amplify.unsubscribe('TOOL_SELECTED', handler);
        };

        amplify.subscribe('TOOL_SELECTED', handler);

        amplify.subscribe('HISTORY_REVERT', cb);

        // hide display area by default
        editAreaEl.style.display = 'none';
      },

      renderEncryptionHint: function() {
        const bold = { bold: (msg) => `<strong class="bold">${msg}</strong>` };
        const tags = { lt: '&lt;', gt: '&gt;' };
        const tagsAndCurls = Object.assign({ lc: '{', rc: '}' }, tags);
        return (
          '<i class="hint-text--icon fa fa-info" aria-hidden="true"></i>' +
          '<div class="hint">' +
          /**/ `<h2 class="hint--title">${formatMessage(adminConfigurationMessages.encryptMarked)}</h2>` +
          /**/ `<p>${formatMessage(adminConfigurationMessages.encryptHintPt1)}</p>` +
          /**/ `<p>` +
          /**/ formatMessage(adminConfigurationMessages.encryptHintPt2, bold).join('') +
          /**/ '</br>' +
          /**/ formatMessage(adminConfigurationMessages.encryptHintPt3, tags) +
          /**/ `</p>` +
          /**/ `<p>` +
          /**/ formatMessage(adminConfigurationMessages.encryptHintPt4, bold).join('') +
          /**/ '</br>' +
          /**/ formatMessage(adminConfigurationMessages.encryptHintPt5, tagsAndCurls) +
          /**/ `</p>` +
          /**/ `<p>${formatMessage(adminConfigurationMessages.encryptHintPt6)}</p>` +
          /**/ `<ul>` +
          /****/ `<li>${formatMessage(adminConfigurationMessages.encryptHintPt7)}</li>` +
          /****/ `<li>${formatMessage(adminConfigurationMessages.encryptHintPt8)}</li>` +
          /****/ `<li>${formatMessage(adminConfigurationMessages.encryptHintPt9)}</li>` +
          /**/ `</ul>` +
          '</div>'
        );
      },

      /*
       * populate the list of configuration files
       */
      loadActiveEnv: function(elt) {
        if (this.environment) {
          elt.parentElement.classList.remove('hide');
        }
      },

      /*
       * populate the list of configuration files
       */
      loadConfigFiles: function() {
        var self = this,
          itemSelectEl = this.configInfo.itemSelectEl;
        // load configuration to get the configuration files list
        CStudioAuthoring.Service.lookupConfigurtion(CStudioAuthoringContext.site, '/administration/config-list.xml', {
          success: function(config) {
            if (config.files.file && config.files.file.length) {
              var index = 1;
              for (var fileIndex in config.files.file) {
                var fileConfig = config.files.file[fileIndex];
                var option = new Option(CMgs.format(langBundle, fileConfig.title), fileConfig.path, false, false);
                option.setAttribute('description', CMgs.format(langBundle, fileConfig.description));
                option.setAttribute('sample', fileConfig.samplePath);
                option.setAttribute('module', fileConfig.module);
                itemSelectEl.options[index++] = option;
              }
            } else if (config.files.file) {
              var fileConfig = config.files.file;
              var option = new Option(CMgs.format(langBundle, fileConfig.title), fileConfig.path, false, false);
              option.setAttribute('description', CMgs.format(langBundle, fileConfig.description));
              option.setAttribute('sample', fileConfig.samplePath);
              option.setAttribute('module', fileConfig.module);
              itemSelectEl.options[1] = option;
            }
          },
          failure: function() {
            CStudioAuthoring.Operations.showSimpleDialog(
              'errorDialog-dialog',
              CStudioAuthoring.Operations.simpleDialogTypeINFO,
              CMgs.format(langBundle, 'notification'),
              CMgs.format(langBundle, 'failConfig'),
              null, // use default button
              YAHOO.widget.SimpleDialog.ICON_BLOCK,
              'studioDialog'
            );
          }
        });

        // add onchange behavior to display selected
        this.configInfo.itemSelectEl.onchange = function() {
          self.loadSelectedConfig();
        }; // end of change
      },

      loadSelectedConfig: function() {
        const self = this,
          itemSelectEl = this.configInfo.itemSelectEl,
          editAreaEl = this.configInfo.editAreaEl,
          editor = this.configInfo.editor,
          sampleEditor = this.configInfo.sampleEditor;

        var configFilesPath = CStudioAuthoring.Constants.CONFIG_FILES_PATH_ADMIN,
          configSampleFilesPath = CStudioAuthoring.Constants.CONFIG_SAMPLE_FILES_PATH_ADMIN,
          selectedIndex = itemSelectEl.selectedIndex,
          contentArea = document.getElementById('content-area'),
          environment = self.environment ? self.environment : '';

        $('#historyEl').empty();

        if (selectedIndex != 0) {
          editAreaEl.style.display = 'block';
          var descriptionEl = document.getElementById('config-description');
          descriptionEl.innerHTML = itemSelectEl[selectedIndex].getAttribute('description');

          const site = CStudioAuthoringContext.site;
          const path = itemSelectEl[selectedIndex].value;
          const module = itemSelectEl[selectedIndex].getAttribute('module');
          CrafterCMSNext.services.configuration.getRawConfiguration(site, path, module).subscribe(
            (content) => {
              if (content) {
                editor.setValue(content);
              } else {
                editor.setValue('');
              }
              editor.clearSelection(); // This will remove the highlight over the text
              CStudioAdminConsole.Tool.AdminConfig.prototype.expandEditorParent(contentArea);

              //add history

              var siteDropdownLangBundle = CMgs.getBundle('siteDropdown', CStudioAuthoringContext.lang);

              var historyLink = document.createElement('a');
              historyLink.className = 'cursor';
              var textnode = document.createTextNode(CMgs.format(siteDropdownLangBundle, 'history')); // Create a text node
              historyLink.appendChild(textnode);

              historyLink.onclick = function() {
                var content = {
                  module: itemSelectEl[selectedIndex].getAttribute('module'),
                  path: itemSelectEl[selectedIndex].value,
                  environment: environment,
                  uri: `${configFilesPath}/${itemSelectEl[selectedIndex].getAttribute('module')}/${
                    itemSelectEl[selectedIndex].value
                  }`,
                  escaped: true
                };
                CStudioAuthoring.Operations.viewConfigurationHistory(content, true);
              };

              const historyEl = document.getElementById('historyEl');
              historyEl && historyEl.append(historyLink);
            },
            () => {
              editor.setValue('');
              CStudioAdminConsole.Tool.AdminConfig.prototype.expandEditor(editor);
            }
          );

          //sample
          var sampleTextEl = document.getElementById('sample-text');
          // load sample configuration into view sample area
          var samplePath = `${configSampleFilesPath}/${itemSelectEl[selectedIndex].getAttribute('sample')}`;
          var viewSampleButtonEl = document.getElementById('view-sample-button');

          if (samplePath != 'undefined' && samplePath != '') {
            CrafterCMSNext.services.configuration.getRawConfiguration('studio_root', samplePath, 'studio').subscribe(
              (sampleConfig) => {
                var sampleAreaEl = document.getElementById('sample-window');
                sampleAreaEl.style.display = 'inline';
                sampleEditor.setValue(sampleConfig);
                sampleEditor.clearSelection(); // This will remove the highlight over the text
                CStudioAdminConsole.Tool.AdminConfig.prototype.shrinkEditor(sampleEditor);
                CStudioAdminConsole.Tool.AdminConfig.prototype.shrinkEditor(editor);
                viewSampleButtonEl.style.display = 'inline';
                var hideSampleButtonEl = document.getElementById('hide-sample-button');
                hideSampleButtonEl.style.display = 'none';
                sampleAreaEl.style.display = 'none';
              },
              () => {
                viewSampleButtonEl.style.display = 'none';
              }
            );
          } else {
            viewSampleButtonEl.style.display = 'none';
          }

          CStudioAdminConsole.CommandBar.commandBarEl.classList.remove('content-types-command-bar');
          CStudioAdminConsole.CommandBar.show();
          $('#encryptHintText').show();
        } else {
          editAreaEl.style.display = 'none';
          CStudioAdminConsole.CommandBar.hide();
          $('#encryptHintText').hide();
        }
      },

      /*
       * create editor
       */
      setEditor: function(editorContainerEl, readOnly) {
        var editorEl = document.createElement('pre');
        editorEl.id = readOnly ? 'sample-text' : 'text-editor';
        editorEl.className += 'editor-text';
        editorContainerEl.appendChild(editorEl);

        var mode = 'ace/mode/xml';

        var langTools = ace.require('ace/ext/language_tools');
        var aceEditor = ace.edit(editorEl.id);
        aceEditor.session.setMode(mode);
        aceEditor.setOptions({
          showPrintMargin: false,
          fontSize: '12px'
        });

        if (readOnly) {
          aceEditor.setReadOnly(true);
          aceEditor.container.style.background = '#EEEEEE';
        } else {
          aceEditor.container.style.background = 'white';
        }

        return aceEditor;
      },

      /*
       * add save, view sample and hide sample buttons
       */
      addButtons: function(containerEl, itemSelectEl, editor) {
        containerEl.innerHTML =
          '<a href="#" id="encryptHint" class="hint-btn"><i class="hint-btn--icon fa fa-question-circle-o" aria-hidden="true"></i></a>' +
          '<button id="encryptButton" class="btn btn-default">' +
          formatMessage(adminConfigurationMessages.encryptMarked) +
          '</button> ' +
          `<button type="submit" id="view-sample-button" class="btn btn-primary">${CMgs.format(
            formsLangBundle,
            'viewSample'
          )}</button>` +
          `<button type="submit" id="hide-sample-button" class="btn btn-primary">${CMgs.format(
            formsLangBundle,
            'hideSample'
          )}</button>`;

        CStudioAdminConsole.CommandBar.render([
          {
            label: CMgs.format(langBundle, 'cancel'),
            class: 'btn-default',
            fn: function() {
              me.renderWorkarea();
              CStudioAdminConsole.CommandBar.hide();
            }
          },
          {
            label: CMgs.format(langBundle, 'save'),
            class: 'btn-primary',
            fn: function() {
              saveFn();
            }
          }
        ]);

        CStudioAdminConsole.CommandBar.hide();

        var viewSampleButtonEl = document.getElementById('view-sample-button');
        var hideSampleButtonEl = document.getElementById('hide-sample-button');
        var sampleAreaEl = document.getElementById('sample-window');
        var contentArea = document.getElementById('content-area');
        var me = this;
        hideSampleButtonEl.style.display = 'none';

        function saveFn() {
          var selectedIndex = itemSelectEl.selectedIndex,
            environment = me.environment ? me.environment : '';

          var xml = editor.getValue();
          var savePath = itemSelectEl[selectedIndex].value;
          if (savePath != 'undefined' && savePath != '') {
            var defPath = itemSelectEl[selectedIndex].value;

            var url = '/api/2/configuration/write_configuration';

            try {
              const doc = parseValidateDocument(xml).documentElement;
              const tags = doc.querySelectorAll('[encrypted]');
              const unencryptedItems = findPendingEncryption(tags);

              if (unencryptedItems.length === 0) {
                const reqObj = {
                  siteId: CStudioAuthoringContext.site,
                  module: itemSelectEl[selectedIndex].getAttribute('module'),
                  path: defPath,
                  environment: environment,
                  content: xml
                };

                var requestAsString = JSON.stringify(reqObj);

                const site = CStudioAuthoringContext.site;
                const module = itemSelectEl[selectedIndex].getAttribute('module');
                CrafterCMSNext.services.configuration.writeConfiguration(site, defPath, module, xml).subscribe(
                  () => {
                    CStudioAuthoring.Utils.showNotification(
                      CMgs.format(langBundle, 'saved'),
                      'top',
                      'left',
                      'success',
                      48,
                      197,
                      'saveConf'
                    );
                    me.clearCache();
                  },
                  () => {
                    CStudioAuthoring.Operations.showSimpleDialog(
                      'errorDialog-dialog',
                      CStudioAuthoring.Operations.simpleDialogTypeINFO,
                      CMgs.format(langBundle, 'notification'),
                      CMgs.format(langBundle, 'saveFailed'),
                      null, // use default button
                      YAHOO.widget.SimpleDialog.ICON_BLOCK,
                      'studioDialog'
                    );
                  }
                );
              } else {
                let tags;
                if (unencryptedItems.length > 1) {
                  tags =
                    unencryptedItems
                      .map((item) => {
                        return `</br>&emsp;• ${formatMessage(adminConfigurationMessages.encryptionDetail, {
                          name: item.tag.tagName,
                          value: item.text
                        })}`;
                      })
                      .join('') + '</br>';
                } else {
                  tags = formatMessage(adminConfigurationMessages.encryptionDetail, {
                    name: unencryptedItems[0].tag.tagName,
                    value: unencryptedItems[0].text
                  });
                }

                showErrorDialog(
                  formatMessage(adminConfigurationMessages.pendingEncryptions, {
                    itemCount: unencryptedItems.length,
                    tags
                  })
                );
              }
            } catch (e) {
              showErrorDialog(e);
            }
          } else {
            CStudioAuthoring.Operations.showSimpleDialog(
              'errorDialog-dialog',
              CStudioAuthoring.Operations.simpleDialogTypeINFO,
              CMgs.format(langBundle, 'notification'),
              CMgs.format(langBundle, 'noConfPathError'),
              null, // use default button
              YAHOO.widget.SimpleDialog.ICON_BLOCK,
              'studioDialog'
            );
          }
        }

        viewSampleButtonEl.onclick = function() {
          CStudioAdminConsole.Tool.AdminConfig.prototype.shrinkEditorParent(contentArea, editor);
          hideSampleButtonEl.style.display = 'inline';
          viewSampleButtonEl.style.display = 'none';
          sampleAreaEl.style.display = 'inline';
          me.configInfo.sampleEditor.renderer.updateFull();
        };

        hideSampleButtonEl.onclick = function() {
          CStudioAdminConsole.Tool.AdminConfig.prototype.expandEditorParent(contentArea, editor);
          hideSampleButtonEl.style.display = 'none';
          viewSampleButtonEl.style.display = 'inline';
          sampleAreaEl.style.display = 'none';
        };

        $('#encryptButton').click(() => {
          const editor = this.configInfo.editor;
          const value = editor.getValue();

          try {
            const doc = parseValidateDocument(value).documentElement;
            const tags = doc.querySelectorAll('[encrypted]');
            const items = findPendingEncryption(tags);
            if (items.length) {
              editor.setOption('readOnly', true);
              editor.container.style.opacity = 0.5;
              const {
                rxjs: {
                  forkJoin,
                  operators: { map }
                },
                services: { security },
                util: {
                  auth: { setRequestForgeryToken }
                }
              } = CrafterCMSNext;
              setRequestForgeryToken();
              forkJoin(
                items.map(({ tag, text }) =>
                  security.encrypt(text, CStudioAuthoringContext.site).pipe(map((text) => ({ tag, text })))
                )
              ).subscribe(
                (encrypted) => {
                  encrypted.forEach(({ text, tag }) => {
                    tag.innerHTML = `\${enc:${text}}`;
                    tag.setAttribute('encrypted', 'true');
                  });
                  editor.setValue(
                    // The XML serializer looses some format around the Copyright comment
                    // Once on 2019 branch, we can use the xmlUtil.
                    // new XMLSerializer().serializeToString(xml)
                    `${XML_HEADER}${doc.outerHTML}`
                  );
                  editor.setOption('readOnly', false);
                  editor.container.style.opacity = 1;
                },
                (ajaxError) => {
                  editor.setOption('readOnly', false);
                  editor.container.style.opacity = 1;
                  if (ajaxError.response) {
                    const apiResponse = ajaxError.response.response;
                    showErrorDialog(
                      `Error: ${apiResponse.code}\n` +
                        `${apiResponse.message}. ${apiResponse.remedialAction}.\n` +
                        `${apiResponse.documentationUrl || ''}`
                    );
                  } else {
                    showErrorDialog(formatMessage(adminConfigurationMessages.encryptError));
                  }
                }
              );
            } else {
              const errMessage =
                tags.length === 0
                  ? formatMessage(adminConfigurationMessages.noEncryptItems)
                  : formatMessage(adminConfigurationMessages.allEncrypted);

              showErrorDialog(errMessage);
            }
          } catch (e) {
            showErrorDialog(e.message);
          }
        });

        $('#encryptHint').click((e) => {
          e.preventDefault();
          CStudioAuthoring.Operations.showSimpleDialog(
            'encryptionInfoDialog',
            CStudioAuthoring.Operations.simpleDialogTypeINFO,
            formatMessage(adminConfigurationMessages.encryptMarked),
            `<div class="encrypt-hint">${this.renderEncryptionHint()}</div>`,
            [
              {
                text: CMgs.format(formsLangBundle, 'Ok'),
                handler: function() {
                  this.destroy();
                },
                isDefault: false
              }
            ],
            null,
            'studioDialog'
          );
        });
      },

      expandEditor: function(editor) {
        var editorContainer = editor.container;
        editorContainer.style.width = this.width;
        editorContainer.style.height = this.height;
        editor.resize();
      },

      shrinkEditor: function(editor) {
        var editorContainer = editor.container;
        editorContainer.style.width = this.width / 2;
        editorContainer.style.height = this.height;
        editor.resize();
      },

      expandEditorParent: function(contentArea, editor) {
        contentArea.classList.remove('sample');
        if (editor) {
          var editorContainer = editor.container;
          editorContainer.style.width = '100%';
          editorContainer.style.height = this.height;
          editor.resize();
        }
      },

      shrinkEditorParent: function(contentArea, editor) {
        contentArea.classList.add('sample');
        if (editor) {
          var editorContainer = editor.container;
          editorContainer.style.width = '100%';
          editorContainer.style.height = this.height;
          editor.resize();
        }
      },

      clearCache: function() {
        var serviceUri =
          '/api/1/services/api/1/site/clear-configuration-cache.json?site=' + CStudioAuthoringContext.site;

        CrafterCMSNext.util.ajax
          .get(`/studio/api/1/services/api/1/site/clear-configuration-cache.json?site=${CStudioAuthoringContext.site}`)
          .subscribe(
            () => {},
            () => {
              CStudioAuthoring.Operations.showSimpleDialog(
                'cacheError-dialog',
                CStudioAuthoring.Operations.simpleDialogTypeINFO,
                CMgs.format(langBundle, 'notification'),
                CMgs.format(langBundle, 'clearCacheError'),
                null, // use default button
                YAHOO.widget.SimpleDialog.ICON_BLOCK,
                'studioDialog'
              );
            }
          );
      }
    });

    CStudioAuthoring.Module.moduleLoaded(
      'cstudio-console-tools-admin-configurations',
      CStudioAdminConsole.Tool.AdminConfig
    );
  }

  function parseValidateDocument(editorText) {
    const xml = new DOMParser().parseFromString(editorText, 'application/xml');
    const parseError = xml.querySelector('parsererror');

    if (parseError) {
      throw new Error(
        formatMessage(adminConfigurationMessages.xmlContainsErrors, {
          errors: parseError.querySelector('div').innerText
        })
      );
    }

    return xml;
  }

  function findPendingEncryption(tags) {
    const items = [];
    tags.forEach((tag) => {
      tag.getAttribute('encrypted') === '' && items.push({ tag: tag, text: tag.innerHTML.trim() });
    });
    return items;
  }

  function showErrorDialog(message) {
    CStudioAuthoring.Operations.showSimpleDialog(
      'cacheError-dialog',
      CStudioAuthoring.Operations.simpleDialogTypeINFO,
      CMgs.format(langBundle, 'notification'),
      message,
      null, // use default button
      YAHOO.widget.SimpleDialog.ICON_BLOCK,
      'studioDialog'
    );
  }
})();
