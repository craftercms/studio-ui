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

CStudioAuthoring.Module.requireModule(
  'ace',
  '/static-assets/libs/ace/ace.js',
  {},
  {
    moduleLoaded: function() {
      CStudioAuthoring.Utils.addCss('/static-assets/themes/cstudioTheme/css/template-editor.css');
      CStudioAuthoring.Utils.addJavascript('/static-assets/libs/ace/ext-language_tools.js');

      CStudioAuthoring.Module.requireModule(
        'cstudio-forms-engine',
        '/static-assets/components/cstudio-forms/forms-engine.js',
        {},
        {
          moduleLoaded: function() {
            CStudioForms.TemplateEditor =
              CStudioForms.TemplateEditor ||
              function() {
                return this;
              };

            var CMgs = CStudioAuthoring.Messages;
            var contextNavLangBundle = CMgs.getBundle('contextnav', CStudioAuthoringContext.lang);

            const i18n = CrafterCMSNext.i18n,
              formatMessage = i18n.intl.formatMessage,
              messages = i18n.messages.codeEditorMessages,
              words = i18n.messages.words;

            var codeSnippets = {
              freemarker: {
                'content-variable': {
                  label: 'Content variable',
                  value: '${contentModel.VARIABLENAME}'
                },
                'request-parameter': {
                  label: 'Request parameter',
                  value: '${RequestParameters["PARAMNAME"]!"DEFAULT"}'
                },
                'studio-support': {
                  label: 'Studio support',
                  value:
                    '<#import "/templates/system/common/cstudio-support.ftl" as studio />\r\n\t...\r\n\t<@studio.toolSupport />'
                },
                'dynamic-navigation': {
                  label: 'Dynamic navigation',
                  value:
                    '<#include "/templates/web/navigation/navigation.ftl">\r\n\t...\r\n\t<@renderNavigation "/site/website", 1 />'
                },
                'transform-path-to-url': {
                  label: 'Transform PATH to URL',
                  value: "${urlTransformationService.transform('storeUrlToRenderUrl', STOREURL)}"
                },

                'ice-attr': {
                  label: 'Incontext editing attribute (pencil)',
                  value: '<@studio.iceAttr iceGroup="ICEGROUID"/>'
                },
                'component-dropzone-attr': {
                  label: 'Component DropZone attribute',
                  value: '<@studio.componentContainerAttr target="TARGETID" objectId=contentModel.objectId />'
                },
                'component-attr': {
                  label: 'Component attribute',
                  value: '<@studio.componentAttr path=contentModel.storeUrl ice=false />'
                },
                'render-components-list': {
                  label: 'Render list of components',
                  value:
                    '<#list contentModel.VARIABLENAME.item as module>\r\n\t<@renderComponent component=module />\r\n</#list>'
                },
                'iterate-items-list-load-content-item': {
                  label: 'Iterate over a list of items and load content item',
                  value:
                    '<#list contentModel.VARIABLENAME.item as myItem>\r\n\t<#assign myContentItem =  siteItemService.getSiteItem(myItem.key) />\r\n\t${myContentItem.variableName}\r\n</#list>'
                },
                'iterate-repeat-group': {
                  label: 'Iterate over repeat group',
                  value: '<#list contentModel.VARIABLENAME.item as row>\r\n\t${row.VARIABLENAME}\r\n</#list>'
                },

                'freemarker-value-assignment': {
                  label: 'Freemarker value assignment',
                  value: '<#assign imageSource = contentModel.image!"" />'
                },
                'freemarker-if': {
                  label: 'Freemarker value IF',
                  value: '<#if CONDITION>\r\n\t...\r\n</#if>'
                },
                'freemarker-loop': {
                  label: 'Freemarker value LOOP',
                  value: '<#list ARRAY as value>\r\n\t${value_index}: ${value}\r\n</#list>'
                },
                'freemarker-fragment-include': {
                  label: 'Freemarker Fragment include',
                  value: '<#include "/templates/PATH" />'
                },
                'freemarker-library-import': {
                  label: 'Freemarker Library import',
                  value: '<#import "/templates/PATH" as NAMESPACE />'
                },

                'html-page': {
                  label: 'HTML Page',
                  value:
                    '<#import "/templates/system/common/cstudio-support.ftl" as studio />\r\n<html lang="en">\r\n<head>\r\n\t</head>\r\n\t<body>\r\n\t\t<h1>CONTENT HERE</h1>\r\n\t<@studio.toolSupport/>\r\n\t</body>\r\n</html>'
                },
                'html-component': {
                  label: 'HTML Component',
                  value:
                    '<#import "/templates/system/common/cstudio-support.ftl" as studio />\r\n<div <@studio.componentAttr path=contentModel.storeUrl ice=false /> >\r\nCOMPONENT MARKUP</div>'
                }
              },
              groovy: {
                'access-content-model': { label: 'Access Content Model', value: 'contentModel' },
                'access-template-model': { label: 'Access Template Model', value: 'templateModel' },

                'current-site-id': { label: 'Current Site ID', value: 'siteContext.siteName' },
                'request-parameters': { label: 'Request Parameters', value: 'params' },
                cookies: { label: 'Cookies', value: 'cookies' },
                'http-request': { label: 'HTTP Request', value: 'request' },
                'http-response': { label: 'HTTP Response', value: 'response' },
                session: { label: 'Session', value: 'session' },
                'transform-path-to-url': {
                  label: 'Transform PATH to URL',
                  value: "urlTransformationService.transform('storeUrlToRenderUrl', STOREURL)"
                },

                'user-profile': { label: 'User Profile', value: 'profile' },
                'current-authentication': {
                  label: 'Current Authentication',
                  value: 'authentication'
                },

                'log-info': { label: 'Log an INFO', value: "logger.info('MY MESSAGE')" },
                'log-error': { label: 'Log an ERROR', value: "logger.error('MY MESSAGE')" },

                'search-service': { label: 'Search Service', value: 'searchService' },
                'site-item-service': { label: 'Site Item Service', value: 'siteItemService' },
                'profile-service': { label: 'Profile Service', value: 'profileService' },

                'get-spring-bean': {
                  label: 'Get Spring Bean',
                  value: 'applicationContext.get("SPRING_BEAN_NAME")'
                }
              }
            };

            CStudioForms.TemplateEditor.prototype = {
              render: function(templatePath, channel, onSaveCb, contentType, mode) {
                var me = this;

                Promise.all([
                  CrafterCMSNext.services.configuration
                    .getConfigurationDOM(CStudioAuthoringContext.site, '/code-editor-config.xml', 'studio')
                    .toPromise(),
                  new Promise((resolve, reject) => {
                    CStudioAuthoring.Service.getContent(templatePath, true, {
                      success: resolve,
                      failure: reject
                    });
                  })
                ])
                  .then(([xmlDoc, content]) => {
                    CStudioForms.TemplateEditor.config = xmlDoc;
                    if (xmlDoc) {
                      me.addSnippets(xmlDoc);
                    }
                    me.renderTemplateEditor(templatePath, content, onSaveCb, contentType, mode);
                  })
                  .catch((error) => {
                    const errorMsg = error.responseText
                      ? JSON.parse(error.responseText).message
                      : `${error.response.response.message}. ${error.response.response.remedialAction}`;

                    CStudioAuthoring.Operations.showSimpleDialog(
                      'pasteContentFromClipboardError-dialog',
                      CStudioAuthoring.Operations.simpleDialogTypeINFO,
                      CMgs.format(formsLangBundle, 'notification'),
                      errorMsg,
                      [
                        {
                          text: 'OK',
                          handler: function() {
                            this.hide();
                            callback.failure(response);
                          },
                          isDefault: false
                        }
                      ],
                      YAHOO.widget.SimpleDialog.ICON_BLOCK,
                      'studioDialog'
                    );
                  });
              },

              addSnippets: (xmlDoc) => {
                snippets = xmlDoc.querySelectorAll('snippets snippet');

                Array.from(snippets).forEach((snippet) => {
                  const key = snippet.querySelector('key').innerHTML,
                    label = snippet.querySelector('label').innerHTML,
                    content = snippet.querySelector('content').textContent.trim(), // trim to remove empty spaces at beginning and end of the content (added because of CDATA)
                    type = snippet.querySelector('type').innerHTML,
                    entry = {
                      label,
                      value: content
                    };

                  codeSnippets[type][key] = entry;
                });
              },

              renderTemplateEditor: function(templatePath, content, onSaveCb, contentType, mode) {
                const me = this;
                var permsCallback = {
                  success: function(response) {
                    var isWrite = CStudioAuthoring.Service.isWrite(response.permissions);

                    var modalEl = document.createElement('div');
                    modalEl.className = `cstudio-template-editor-container-modal ${onSaveCb.id}`;
                    document.body.appendChild(modalEl);

                    var containerEl = document.createElement('div');
                    containerEl.className = 'cstudio-template-editor-container';
                    modalEl.appendChild(containerEl);
                    var formHTML = '';

                    const isRead = mode === 'read';
                    if (isRead) {
                      formHTML += '<div class="cstudio-form-readonly-banner">READ ONLY</div>';
                    }

                    formHTML +=
                      "<div class='template-editor-toolbar'><div class='template-editor-toolbar-variable'></div>" +
                      '</div>' +
                      "<div class='editor-container'>" +
                      '</div>' +
                      "<div class='template-editor-button-container'>";

                    if (isWrite == true && !isRead) {
                      formHTML +=
                        "<div class='edit-buttons-container'>" +
                        "<select id='themeSelector'>" +
                        "<option value='chrome'>Light Theme</option>" +
                        "<option value='tomorrow_night'>Dark Theme</option>" +
                        '</select>' +
                        "<div class='dropup inline-block relative'>" +
                        "<button data-toggle='dropdown' aria-haspopup='true' aria-expanded='false' class='template-editor-cancel-button'>" +
                        formatMessage(words.cancel) +
                        '</button>' +
                        "<ul class='dropdown-menu dropdown-menu-right' aria-labelledby='template-editor-cancel-button'>" +
                        "<li><a class='cancel' href='#' onclick='return false;'>" +
                        formatMessage(messages.stay) +
                        '</a></li>' +
                        "<li role='separator' class='divider'></li>" +
                        "<li><a class='confirm' href='#'>" +
                        formatMessage(messages.confirm) +
                        '</a></li>' +
                        '</ul>' +
                        '</div>' +
                        "<div class='template-editor-update-button'>" +
                        formatMessage(words.update) +
                        '</div>' +
                        '<div/>';
                    } else {
                      formHTML +=
                        "<div class='edit-buttons-container viewer'>" +
                        "<div class='template-editor-cancel-button btn btn-default cstudio-template-editor-button'>Close</div>";
                      ('<div/>');
                    }

                    formHTML += '</div>';

                    containerEl.innerHTML = formHTML;
                    var editorContainerEl = modalEl.querySelector('.editor-container');
                    var editorEl = document.createElement('pre');
                    editorEl.className = 'editorPreEl';
                    editorEl.textContent = content;
                    editorContainerEl.appendChild(editorEl);

                    // dispatch legacyTemplateEditor.opened
                    var event = new CustomEvent('legacyTemplateEditor.opened');
                    document.dispatchEvent(event);

                    var langTools;

                    var initEditorFn = function() {
                      if (typeof ace === 'undefined') {
                        window.setTimeout(500, initEditorFn);
                      } else {
                        var modePath = 'ace/mode/';
                        var mode = modePath + 'htmlmixed';

                        if (templatePath.indexOf('.css') !== -1) {
                          mode = modePath + 'css';
                        } else if (templatePath.indexOf('.js') !== -1) {
                          mode = modePath + 'javascript';
                        } else if (templatePath.indexOf('.groovy') !== -1) {
                          mode = modePath + 'groovy';
                        } else if (templatePath.indexOf('.ftl') !== -1) {
                          mode = modePath + 'ftl';
                        } else if (templatePath.indexOf('.xml') !== -1) {
                          mode = modePath + 'xml';
                        } else if (templatePath.indexOf('.sh') !== -1) {
                          mode = modePath + 'sh';
                        } else if (templatePath.indexOf('.jsx') !== -1) {
                          mode = modePath + 'jsx';
                        } else if (templatePath.indexOf('.ts') !== -1) {
                          mode = modePath + 'tsx';
                        } else if (templatePath.indexOf('.less') !== -1) {
                          mode = modePath + 'less';
                        } else if (templatePath.indexOf('.sass') !== -1) {
                          mode = modePath + 'sass';
                        } else if (templatePath.indexOf('.scss') !== -1) {
                          mode = modePath + 'scss';
                        } else if (templatePath.indexOf('.tsx') !== -1) {
                          mode = modePath + 'tsx';
                        }

                        langTools = ace.require('ace/ext/language_tools');
                        var aceEditor = ace.edit(modalEl.querySelector('.editorPreEl')),
                          defaultTheme =
                            CStudioForms.TemplateEditor.config &&
                            CStudioForms.TemplateEditor.config.getElementsByTagName('theme')[0] &&
                            CStudioForms.TemplateEditor.config.getElementsByTagName('theme')[0].textContent === 'dark'
                              ? 'tomorrow_night'
                              : 'chrome',
                          theme = localStorage.getItem('templateEditorTheme')
                            ? localStorage.getItem('templateEditorTheme')
                            : defaultTheme,
                          enableBasicAutocompletion =
                            CStudioForms.TemplateEditor.config &&
                            CStudioForms.TemplateEditor.config.getElementsByTagName('enable-basic-autocompletion')[0]
                              ? CStudioForms.TemplateEditor.config.getElementsByTagName(
                                  'enable-basic-autocompletion'
                                )[0].textContent === 'true'
                              : true,
                          enableLiveAutocompletion =
                            CStudioForms.TemplateEditor.config &&
                            CStudioForms.TemplateEditor.config.getElementsByTagName('enable-live-autocompletion')[0]
                              ? CStudioForms.TemplateEditor.config.getElementsByTagName('enable-live-autocompletion')[0]
                                  .textContent === 'true'
                              : true,
                          fontSize =
                            CStudioForms.TemplateEditor.config &&
                            CStudioForms.TemplateEditor.config.getElementsByTagName('font-size')[0]
                              ? CStudioForms.TemplateEditor.config.getElementsByTagName('font-size')[0].textContent
                              : '11pt',
                          tabSize =
                            CStudioForms.TemplateEditor.config &&
                            CStudioForms.TemplateEditor.config.getElementsByTagName('tab-size')[0]
                              ? CStudioForms.TemplateEditor.config.getElementsByTagName('tab-size')[0].textContent
                              : '4';
                        aceEditor.setTheme('ace/theme/' + theme);
                        aceEditor.session.setMode(mode);

                        aceEditor.setOptions({
                          enableBasicAutocompletion: enableBasicAutocompletion,
                          enableLiveAutocompletion: enableLiveAutocompletion,
                          enableSnippets: true,
                          showPrintMargin: false,
                          fontSize: fontSize,
                          tabSize: tabSize,
                          readOnly: isRead
                        });

                        $(modalEl)
                          .find('#themeSelector')
                          .val(theme);

                        $(modalEl)
                          .find('#themeSelector')
                          .on('change', function() {
                            aceEditor.setTheme('ace/theme/' + this.value);
                            localStorage.setItem('templateEditorTheme', this.value);
                          });

                        aceEditor.getSession().on('change', function() {
                          aceEditor.isModified = true;
                        });

                        return aceEditor;
                      }
                    };

                    var aceEditor = initEditorFn();

                    var _getVarsFromSections = function(sections, parent, variables) {
                      var variables = variables ? variables : [],
                        _searchFields = function(section) {
                          if (section.fields.field.length) {
                            $.each(section.fields.field, function() {
                              if (this.id) {
                                var value = this.title ? this.title : this.id,
                                  containsDash = this.id.indexOf('-') > -1,
                                  id = containsDash ? '["' + this.id + '"]' : this.id;

                                if (parent) {
                                  var parentVarContainsDash = sections.id.indexOf('-') > -1,
                                    parentId = parentVarContainsDash ? '["' + sections.id + '"]' : sections.id;
                                  value = parent + ' - ' + value;
                                  id = containsDash ? parentId + '.item[0]' + id : parentId + '.item[0].' + id;
                                }

                                if (this.type == 'node-selector') {
                                  variables.push(
                                    {
                                      value: id + '.item[0].key',
                                      label: value + ' - Key'
                                    },
                                    {
                                      value: +id + '.item[0].value',
                                      label: value + ' - Value'
                                    }
                                  );
                                } else {
                                  variables.push({
                                    value: id,
                                    label: value
                                  });
                                  if (this.type == 'repeat') {
                                    _getVarsFromSections(this, value, variables);
                                  }
                                }
                              }
                            });
                          } else {
                            var field = section.fields.field;
                            if (field.id) {
                              var value = field.title ? field.title : field.id,
                                containsDash = field.id.indexOf('-') > -1,
                                id = containsDash ? '["' + field.id + '"]' : field.id;

                              if (parent) {
                                var parentVarContainsDash = sections.id.indexOf('-') > -1,
                                  parentId = parentVarContainsDash ? '["' + sections.id + '"]' : sections.id;
                                value = parent + ' - ' + value;
                                id = containsDash ? parentId + '.item[0]' + id : parentId + '.item[0].' + id;
                              }

                              if (field.type == 'node-selector') {
                                variables.push(
                                  {
                                    value: id + '.item[0].key',
                                    label: value + ' - Key'
                                  },
                                  {
                                    value: id + '.item[0].value',
                                    label: value + ' - Value'
                                  }
                                );
                              } else {
                                variables.push({
                                  value: id,
                                  label: value
                                });
                                if (field.type == 'repeat') {
                                  _getVarsFromSections(field, value, variables);
                                }
                              }
                            }
                          }
                        };

                      if (sections.length) {
                        $.each(sections, function() {
                          //puede haber solo una seccion
                          _searchFields(this);
                        });
                      } else {
                        _searchFields(sections);
                      }

                      return variables;
                    };

                    var templateEditorToolbarVarElt = modalEl.querySelector('.template-editor-toolbar-variable');
                    var filename = templatePath.substring(templatePath.lastIndexOf('/') + 1);
                    var filenameElement = document.createElement('p');
                    filenameElement.className = 'fileName';
                    filenameElement.textContent = filename;
                    const nameWrapper = document.createElement('div');
                    nameWrapper.className = 'nameWrapper';
                    nameWrapper.appendChild(filenameElement);
                    templateEditorToolbarVarElt.appendChild(nameWrapper);

                    if (templatePath.indexOf('.ftl') != -1 || templatePath.indexOf('.groovy')) {
                      //Create array of options to be added
                      var variableOpts = {};

                      if (templatePath.indexOf('.groovy') != -1) {
                        //Create array of options to be added
                        variableOpts = codeSnippets.groovy;

                        langTools = ace.require('ace/ext/language_tools');
                        var customCompleter = {
                          getCompletions: function(editor, session, pos, prefix, callback) {
                            callback(
                              null,
                              Object.keys(variableOpts).map(function(key, index) {
                                return {
                                  caption: variableOpts[key].label,
                                  value: variableOpts[key].value,
                                  meta: 'Crafter Studio'
                                };
                              })
                            );
                          }
                        };
                        langTools.addCompleter(customCompleter);
                      } else if (templatePath.indexOf('.ftl') != -1) {
                        if (!isRead) {
                          me.addLocales(nameWrapper, aceEditor, templatePath, filename, content);
                        }

                        variableOpts = codeSnippets.freemarker;

                        langTools = ace.require('ace/ext/language_tools');
                        var customCompleter = {
                          getCompletions: function(editor, session, pos, prefix, callback) {
                            callback(
                              null,
                              Object.keys(variableOpts).map(function(key, index) {
                                return {
                                  caption: variableOpts[key].label,
                                  value: variableOpts[key].value,
                                  meta: 'Crafter Studio'
                                };
                              })
                            );
                          }
                        };
                        langTools.addCompleter(customCompleter);
                      }

                      //Create and append select list
                      if (!isRead && Object.entries(variableOpts).length > 0) {
                        var selectList = document.createElement('select');
                        selectList.className = 'variable';
                        templateEditorToolbarVarElt.appendChild(selectList);
                        let option = document.createElement('option');
                        option.value = '';
                        option.text = formatMessage(messages.insertCode);
                        option.disabled = true;
                        option.selected = true;
                        selectList.appendChild(option);

                        //add variablesNames
                        if (contentType && contentType !== '') {
                          var path = '/content-types' + contentType + '/form-definition.xml';
                          CStudioAuthoring.Service.lookupConfigurtion(CStudioAuthoringContext.site, path, {
                            success: (response) => {
                              const variables = _getVarsFromSections(response.sections.section);
                              Object.keys(variableOpts).map(function(key) {
                                if (key === 'content-variable') {
                                  let optgroup = document.createElement('optgroup');
                                  optgroup.label = variableOpts[key].label;
                                  variables.forEach((variable) => {
                                    let subOption = document.createElement('option');
                                    subOption.value = variable.value;
                                    subOption.text = variable.label;
                                    subOption.setAttribute('content-variable', true);
                                    optgroup.appendChild(subOption);
                                    selectList.appendChild(optgroup);
                                  });
                                } else {
                                  let option = document.createElement('option');
                                  option.value = key;
                                  option.text = variableOpts[key].label;
                                  selectList.appendChild(option);
                                }
                              });
                            }
                          });
                        } else {
                          Object.keys(variableOpts).map(function(key) {
                            let option = document.createElement('option');
                            option.value = key;
                            option.text = variableOpts[key].label;
                            selectList.appendChild(option);
                          });
                        }

                        $(selectList).on('change', function(event) {
                          const cursorPosition = aceEditor.getCursorPosition();
                          const itemKey = this.value;
                          let snippet;
                          if (this.options[this.selectedIndex].getAttribute('content-variable')) {
                            snippet = variableOpts['content-variable'].value;
                            if (itemKey.includes('-')) {
                              snippet = snippet.replace('.VARIABLENAME', itemKey);
                            } else {
                              snippet = snippet.replace('VARIABLENAME', itemKey);
                            }
                          } else {
                            snippet = variableOpts[itemKey].value;
                          }

                          // Insert snippet (second argument) in given position
                          aceEditor.session.insert(cursorPosition, snippet);
                          aceEditor.focus();
                          $(selectList).val('');
                        });
                      }
                    }

                    var cancelEdit = function() {
                      var cancelEditCb = {
                        success: function(response) {
                          // dispatch legacyTemplateEditor.opened
                          var event = new CustomEvent('legacyTemplateEditor.closed');
                          document.dispatchEvent(event);
                          modalEl.parentNode.removeChild(modalEl);
                        },
                        failure: function() {}
                      };

                      if (typeof CStudioAuthoring.editDisabled !== 'undefined') {
                        for (var x = 0; x < window.parent.CStudioAuthoring.editDisabled.length; x++) {
                          window.parent.CStudioAuthoring.editDisabled[x].style.pointerEvents = '';
                        }
                        window.parent.CStudioAuthoring.editDisabled = [];
                      }

                      CStudioAuthoring.Service.unlockContentItem(
                        CStudioAuthoringContext.site,
                        templatePath,
                        cancelEditCb
                      );
                    };

                    $(modalEl)
                      .find('.template-editor-cancel-button')
                      .on('click', function(e) {
                        if (!aceEditor.isModified) {
                          e.stopPropagation();
                          cancelEdit();
                          if (onSaveCb.cancelled) {
                            onSaveCb.cancelled();
                          }
                        }
                      });

                    $(modalEl)
                      .find('.template-editor-cancel-button + .dropdown-menu .confirm')
                      .on('click', function(e) {
                        e.preventDefault();
                        cancelEdit();
                        if (onSaveCb.cancelled) {
                          onSaveCb.cancelled();
                        }
                      });

                    if (isWrite == true && !isRead) {
                      var saveEl = modalEl.querySelector('.template-editor-update-button');
                      let unmount;
                      const options = [
                        {
                          label: formatMessage(messages.save),
                          callback: () => {
                            me.save(modalEl, aceEditor, templatePath, onSaveCb, false, 'save');
                          }
                        },
                        {
                          label: formatMessage(messages.saveAndClose),
                          callback: () => {
                            me.save(modalEl, aceEditor, templatePath, onSaveCb, true, 'saveAndClose');
                          }
                        }
                      ];
                      CrafterCMSNext.render(saveEl, 'SplitButton', {
                        options,
                        defaultSelected: 1
                      }).then((done) => (unmount = done.unmount));
                    }
                    if (onSaveCb.renderComplete) {
                      onSaveCb.renderComplete();
                    }
                  },
                  failure: function() {
                    if (onSaveCb.failure) {
                      onSaveCb.failure();
                    }
                  }
                };

                CStudioAuthoring.Service.getUserPermissions(CStudioAuthoringContext.site, templatePath, permsCallback);
              },

              addLocales: (headerEl, aceEditor, templatePath, filename, defaultContent) => {
                CrafterCMSNext.services.translation
                  .getSiteLocales(CStudioAuthoringContext.site)
                  .subscribe(({ localeCodes }) => {
                    if (localeCodes === null) {
                      return;
                    }

                    const $select = $('<select id="locale-selector" class="template-editor-locales-selector" />');
                    const options = [];
                    let defaultLocale = '';

                    localeCodes.forEach((locale) => {
                      const stem = locale.match(/[^_]*/)[0];
                      if (!options.includes(stem)) {
                        options.push(stem);
                      }
                      options.push(locale);
                    });

                    $select.append(`<option value="">${formatMessage(messages.base)}</option>`);

                    //get the baseName
                    $select.data('baseName', filename.replace('.ftl', ''));

                    options.forEach((locale) => {
                      if (filename.replace('.ftl', '').endsWith(locale)) {
                        $select.data('baseName', filename.replace(`_${locale}.ftl`, ''));
                        defaultLocale = locale;
                      }
                      $select.append(`<option value="${locale}">${locale}</option>`);
                    });
                    $select.val(defaultLocale);

                    $(headerEl).append($select);
                    const $helperBtn = $(
                      `<button class="button-without-styles template-editor-locales-helper-button"><i class="fa fa-question-circle-o"></i></button>`
                    );
                    $(headerEl).append($helperBtn);

                    CStudioAuthoring.Utils.addPopover($helperBtn, null, formatMessage(messages.localesHelperText));

                    //set prev value
                    $select.data('prev', $select.val());

                    $select.on('change', function() {
                      const path = templatePath.substring(0, templatePath.lastIndexOf('/'));
                      let localePath = templatePath;

                      if (this.value) {
                        const baseName = $select.data('baseName');
                        localePath = `${path}/${baseName}_${this.value}.ftl`;
                      }

                      CStudioAuthoring.Service.getContent(localePath, true, {
                        success: (content) => {
                          const baseName = $select.data('baseName');
                          if (content) {
                            //updating the filename
                            $(headerEl).find('.fileName')[0].innerText = this.value
                              ? `${baseName}_${this.value}.ftl`
                              : `${baseName}.ftl`;

                            //set prev value
                            $select.data('prev', $select.val());

                            aceEditor.setValue(content, -1);
                          } else {
                            const createTemplateOnOk = 'createTemplateOnOk';
                            const createTemplateOnCancel = 'createTemplateOnCancel';

                            CrafterCMSNext.system.store.dispatch({
                              type: 'SHOW_CONFIRM_DIALOG',
                              payload: {
                                open: true,
                                title: formatMessage(messages.localesConfirmTitle),
                                body: formatMessage(messages.localesConfirmBody),
                                onOk: {
                                  type: 'DISPATCH_DOM_EVENT',
                                  payload: { id: createTemplateOnOk }
                                },
                                onCancel: {
                                  type: 'CONFIRM_DIALOG_CLOSED'
                                },
                                onClosed: {
                                  type: 'BATCH_ACTIONS',
                                  payload: [
                                    {
                                      type: 'DISPATCH_DOM_EVENT',
                                      payload: { id: createTemplateOnCancel }
                                    },
                                    { type: 'CONFIRM_DIALOG_CLOSED' }
                                  ]
                                }
                              }
                            });

                            let unsubscribe, cancelUnsubscribe;

                            unsubscribe = CrafterCMSNext.createLegacyCallbackListener(createTemplateOnOk, () => {
                              $(headerEl).find('.fileName')[0].innerText = this.value
                                ? `${baseName}_${this.value}.ftl`
                                : `${baseName}.ftl`;
                              aceEditor.setValue('');
                              CrafterCMSNext.system.store.dispatch({
                                type: 'CLOSE_CONFIRM_DIALOG'
                              });

                              CStudioAuthoring.Utils.showConfirmNotification(
                                formatMessage(messages.localesSnackBarTitle),
                                formatMessage(messages.copy),
                                () => {
                                  aceEditor.setValue(defaultContent);
                                }
                              );
                              cancelUnsubscribe();
                            });

                            cancelUnsubscribe = CrafterCMSNext.createLegacyCallbackListener(
                              createTemplateOnCancel,
                              () => {
                                $select.val($select.data('prev'));
                                unsubscribe();
                              }
                            );
                          }
                        }
                      });
                    });
                  });
              },
              save: (modalEl, aceEditor, templatePath, onSaveCb, unlock, type) => {
                const value = aceEditor.getValue();
                const path = templatePath.substring(0, templatePath.lastIndexOf('/'));
                let filename = templatePath.substring(templatePath.lastIndexOf('/') + 1);
                const $select = $('#locale-selector');

                if (filename.indexOf('.ftl') !== -1 && $select.length) {
                  const baseName = $select.data('baseName');
                  const localeCode = $select.val();
                  filename = localeCode ? `${baseName}_${localeCode}.ftl` : `${baseName}.ftl`;
                }

                // prettier-ignore
                const writeServiceUrl = `/api/1/services/api/1/content/write-content.json?site=${CStudioAuthoringContext.site}&phase=onSave&path=${encodeURI(path)}&fileName=${encodeURI(filename)}&user=${CStudioAuthoringContext.user}&unlock=${unlock}`;

                CrafterCMSNext.util.ajax
                  .post(CStudioAuthoring.Service.createServiceUri(writeServiceUrl), value)
                  .subscribe(function(response) {
                    const data = response.response;

                    if (data && data.result && data.result.success) {
                      // update pending changes state;
                      aceEditor.isModified = false;
                      CStudioAuthoring.Utils.showNotification(formatMessage(messages.saved));
                      if (type === 'saveAndClose') {
                        const event = new CustomEvent('legacyTemplateEditor.closed');
                        document.dispatchEvent(event);
                        modalEl.parentNode.removeChild(modalEl);
                      }
                      onSaveCb.success && onSaveCb.success(type);
                    }
                  });
              }
            };

            CStudioAuthoring.Module.moduleLoaded('cstudio-forms-template-editor', CStudioForms.TemplateEditor);
          }
        }
      );
    }
  }
);
