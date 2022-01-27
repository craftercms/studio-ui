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

CStudioForms.Controls.RTETINYMCE5 =
  CStudioForms.Controls.RTETINYMCE5 ||
  function (id, form, owner, properties, constraints, readonly, pencilMode) {
    this.owner = owner;
    this.owner.registerField(this);
    this.errors = [];
    this.properties = properties;
    this.constraints = constraints;
    this.inputEl = null;
    this.required = false;
    this.value = '_not-set';
    this.form = form;
    this.id = id;
    this.readonly = readonly;
    this.rteHeight = 300;
    this.pencilMode = pencilMode;
    this.supportedPostFixes = ['_html'];
    this.enableSpellCheck = true;

    this.formatMessage = CrafterCMSNext.i18n.intl.formatMessage;
    this.words = CrafterCMSNext.i18n.messages.words;
    this.messages = CrafterCMSNext.i18n.messages.rteControlMessages;
    this.contentTypesMessages = CrafterCMSNext.i18n.messages.contentTypesMessages;

    return this;
  };

CStudioForms.Controls.RTETINYMCE5.plugins = CStudioForms.Controls.RTETINYMCE5.plugins || {};

CStudioAuthoring.Module.requireModule(
  'cstudio-forms-rte-config-manager',
  '/static-assets/components/cstudio-forms/controls/rte-config-manager.js',
  {},
  {
    moduleLoaded: function () {
      const YDom = YAHOO.util.Dom;
      YAHOO.extend(CStudioForms.Controls.RTETINYMCE5, CStudioForms.CStudioFormField, {
        getLabel: function () {
          return CMgs.format(langBundle, 'rteTinyMCE5');
        },

        /**
         * render the RTE
         */
        render: function (config, containerEl) {
          var _thisControl = this,
            configuration = 'generic';

          for (var i = 0; i < config.properties.length; i++) {
            var prop = config.properties[i];

            if (prop.name == 'rteConfiguration') {
              if (prop.value && prop.Value != '') {
                configuration = prop.value;
              }

              break;
            }
          }

          CStudioForms.Controls.RTEManager.getRteConfiguration(
            configuration,
            'no-role-support',
            {
              success: function (rteConfig) {
                _thisControl._initializeRte(config, rteConfig, containerEl);
              },
              failure: function () {}
            },
            '/form-control-config/rte/rte-setup-tinymce5.xml'
          );
        },

        /**
         * get the value of this control
         */
        getValue: function () {
          if (this.editor) {
            this.editor.save();
            value = this.inputEl.value;
            this.value = value;
          }

          return this.value;
        },

        /**
         * set the value for the control
         */
        setValue: function (value) {
          this.value = value;

          try {
            tinymce.activeEditor.setContent(value, { format: 'raw' });
          } catch (err) {}

          this.updateModel(value);
          this.edited = false;
        },

        updateModel: function (value) {
          const newValue = this.escapeScripts ? value : CStudioForms.Util.unEscapeXml(value);

          this.form.updateModel(this.id, newValue);
        },

        /**
         * get the widget name
         */
        getName: function () {
          return 'rte-tinymce5';
        },

        /**
         * get supported properties
         */
        getSupportedProperties: function () {
          return [
            {
              label: this.formatMessage(this.contentTypesMessages.width),
              name: 'width',
              type: 'int'
            },
            {
              label: this.formatMessage(this.contentTypesMessages.height),
              name: 'height',
              type: 'int'
            },
            {
              label: this.formatMessage(this.contentTypesMessages.autoGrow),
              name: 'autoGrow',
              type: 'boolean',
              defaultValue: 'false'
            },
            {
              label: this.formatMessage(this.contentTypesMessages.enableSpellCheck),
              name: 'enableSpellCheck',
              type: 'boolean',
              defaultValue: 'true'
            },
            {
              label: this.formatMessage(this.contentTypesMessages.forceRootBlockP),
              name: 'forceRootBlockPTag',
              type: 'boolean',
              defaultValue: 'true'
            },
            {
              label: this.formatMessage(this.contentTypesMessages.forcePNewLines),
              name: 'forcePTags',
              type: 'boolean',
              defaultValue: 'true'
            },
            {
              label: this.formatMessage(this.contentTypesMessages.forceBRNewLines),
              name: 'forceBRTags',
              type: 'boolean',
              defaultValue: 'false'
            },
            {
              label: this.formatMessage(this.contentTypesMessages.supportedChannels),
              name: 'supportedChannels',
              type: 'supportedChannels'
            },
            {
              label: this.formatMessage(this.contentTypesMessages.RTEConfiguration),
              name: 'rteConfiguration',
              type: 'string',
              defaultValue: 'generic'
            },
            {
              label: this.formatMessage(this.contentTypesMessages.imageManager),
              name: 'imageManager',
              type: 'datasource:image'
            },
            {
              label: this.formatMessage(this.contentTypesMessages.videoManager),
              name: 'videoManager',
              type: 'datasource:video'
            },
            {
              label: this.formatMessage(this.contentTypesMessages.fileManager),
              name: 'fileManager',
              type: 'datasource:item'
            }
          ];
        },

        /**
         * get the supported constraints
         */
        getSupportedConstraints: function () {
          return [
            {
              label: CMgs.format(langBundle, 'required'),
              name: 'required',
              type: 'boolean'
            }
          ];
        },

        getSupportedPostFixes: function () {
          return this.supportedPostFixes;
        },

        /**
         * Tinymce extended options from config `extendedOptions` in the config file
         */
        _getTinymceExtendedOptions: function (rteConfig) {
          const rteReadonlyOptions = [
            'target', // Target can't be changed
            'inline', // Not using inline view doesn't behave well on pageBuilder, this setting shouldn't be changed.
            'setup',
            'base_url',
            'encoding',
            'autosave_ask_before_unload', // Autosave options are removed since it is not supported in control.
            'autosave_interval',
            'autosave_prefix',
            'autosave_restore_when_empty',
            'autosave_retention',
            'file_picker_callback', // No file picker is set by default, and functions are not supported in config file.
            'height', // Height is set to the size of content
            'file_picker_callback', // Files/images handlers currently not supported
            'paste_postprocess',
            'images_upload_handler',
            'code_editor_inline'
          ];

          let extendedOptions = {};
          try {
            // extend options
            extendedOptions = rteConfig.extendedOptions ? JSON.parse(rteConfig.extendedOptions) : {};
          } catch (e) {
            // If there are multiple RTEs on the page, when the form loads, it would show N number
            // of dialogs. One is sufficient. Also, in 3.1.x, triggering multiple dialogs causes the
            // backdrop not to get clean out when the dialog is closed.
            if (!CStudioForms.Controls.RTETINYMCE5.extendedOptionsParseErrorShown) {
              CStudioForms.Controls.RTETINYMCE5.extendedOptionsParseErrorShown = true;
              let bundle = CStudioAuthoring.Messages.getBundle('forms', CStudioAuthoringContext.lang);
              CStudioAuthoring.Operations.showSimpleDialog(
                'message-dialog',
                CStudioAuthoring.Operations.simpleDialogTypeINFO,
                CStudioAuthoring.Messages.format(bundle, 'notification'),
                `<div>${CStudioAuthoring.Messages.format(
                  bundle,
                  'rteConfigJSONParseError',
                  'extendedOptions',
                  `<code>${e.message}</code>`
                )}</div><pre>${rteConfig.extendedOptions}</pre>`,
                null,
                YAHOO.widget.SimpleDialog.ICON_BLOCK,
                'studioDialog'
              );
            }

            return {};
          }

          const options = {};
          const keys = Object.keys(extendedOptions);
          for (let i = 0; i < keys.length; i += 1) {
            if (rteReadonlyOptions.indexOf(keys[i]) === -1) {
              options[keys[i]] = extendedOptions[keys[i]];
            }
          }

          return options;
        },

        /**
         * render and initialization of editor
         */
        _initializeRte: function (config, rteConfig, containerEl) {
          var _thisControl = this,
            editor,
            callback,
            rteId = CStudioAuthoring.Utils.generateUUID(),
            inputEl,
            pluginList,
            extendedElements,
            rteStylesheets,
            rteStyleOverride,
            rtePasteWordElements,
            toolbarConfig1,
            toolbarConfig2,
            toolbarConfig3,
            toolbarConfig4,
            styleFormats,
            styleFormatsMerge,
            templates;

          containerEl.id = this.id;
          this.containerEl = containerEl;
          this.fieldConfig = config;
          this.rteConfig = rteConfig;
          this.rteId = rteId;

          inputEl = this._renderInputMarkup(config, rteId);

          // Getting properties from content-type
          for (var i = 0; i < config.properties.length; i++) {
            var prop = config.properties[i];

            switch (prop.name) {
              case 'imageManager':
                this.imageManagerName = prop.value && prop.Value != '' ? prop.value : null;
                break;
              case 'videoManager':
                this.videoManagerName = prop.value && prop.Value != '' ? prop.value : null;
                break;
              case 'width':
                var value = isNaN(parseInt(prop.value)) ? prop.value : parseInt(prop.value);
                this.rteWidth = typeof prop.value == 'string' && prop.value ? value : '100%';
                break;
              case 'fileManager':
                this.fileManagerName = prop.value && prop.Value != '' ? prop.value : null;
                break;
              case 'height':
                this.rteHeight = prop.value === undefined || prop.value === '' ? 300 : parseInt(prop.value, 10);
                break;
              case 'autoGrow':
                this.autoGrow = prop.value == 'false' ? false : true;
                break;
              case 'maxlength':
                inputEl.maxlength = prop.value;
                break;
              case 'forcePTags':
                var forcePTags = prop.value == 'false' ? false : true;
                break;
              case 'forceBRTags':
                var forceBRTags = prop.value == 'true' ? true : false;
                break;
              case 'forceRootBlockPTag':
                var forceRootBlockPTag = prop.value == 'false' ? false : 'p';
                break;
              case 'enableSpellCheck':
                this.enableSpellCheck = !prop.value || prop.value === 'true';
                break;
            }
          }

          templates = rteConfig.templates && rteConfig.templates.template ? rteConfig.templates.template : null;

          // https://www.tiny.cloud/docs/plugins/
          pluginList = rteConfig.plugins;
          pluginList = this.autoGrow ? pluginList + ' autoresize' : pluginList;

          extendedValidElements = rteConfig.extendedElements ? rteConfig.extendedElements : '';

          toolbarConfig1 =
            rteConfig.toolbarItems1 && rteConfig.toolbarItems1.length != 0
              ? rteConfig.toolbarItems1
              : 'bold italic | bullist numlist';
          toolbarConfig2 =
            rteConfig.toolbarItems2 && rteConfig.toolbarItems2.length != 0 ? rteConfig.toolbarItems2 : '';
          toolbarConfig3 =
            rteConfig.toolbarItems3 && rteConfig.toolbarItems3.length != 0 ? rteConfig.toolbarItems3 : '';
          toolbarConfig4 =
            rteConfig.toolbarItems4 && rteConfig.toolbarItems4.length != 0 ? rteConfig.toolbarItems4 : '';

          rteStylesheets =
            rteConfig.rteStylesheets && typeof rteConfig.rteStylesheets === 'object'
              ? rteConfig.rteStylesheets.link
              : null;

          rteStyleOverride = rteConfig.rteStyleOverride ? rteConfig.rteStyleOverride : null;

          rtePasteWordElements = rteConfig.rtePasteWordElements
            ? rteConfig.rtePasteWordElements
            : '-strong/b,-em/i,-u,-span,-p,-ol,-ul,-li,-h1,-h2,-h3,-h4,-h5,-h6,-h7,-h8,-pre,-p/div,' +
              '-a[href|name],sub,sup,pre,blockquote,strike,br,del,' +
              'table[width],tr,td[colspan|rowspan|width],th[colspan|rowspan|width],thead,tfoot,tbody';

          try {
            // use tinymce default if not set
            styleFormats = rteConfig.styleFormats ? JSON.parse(rteConfig.styleFormats) : void 0;
          } catch (e) {
            // If there are multiple RTEs on the page, when the form loads, it would show N number
            // of dialogs. One is sufficient. Also, in 3.1.x, triggering multiple dialogs causes the
            // backdrop not to get clean out when the dialog is closed.
            if (!CStudioForms.Controls.RTETINYMCE5.styleFormatsParseErrorShown) {
              CStudioForms.Controls.RTETINYMCE5.styleFormatsParseErrorShown = true;
              let bundle = CStudioAuthoring.Messages.getBundle('forms', CStudioAuthoringContext.lang);
              CStudioAuthoring.Operations.showSimpleDialog(
                'message-dialog',
                CStudioAuthoring.Operations.simpleDialogTypeINFO,
                CStudioAuthoring.Messages.format(bundle, 'notification'),
                `<div>${CStudioAuthoring.Messages.format(
                  bundle,
                  'rteConfigJSONParseError',
                  'styleFormats',
                  `<code>${e.message}</code>`
                )}</div><pre>${rteConfig.styleFormats}</pre>`,
                null,
                YAHOO.widget.SimpleDialog.ICON_BLOCK,
                'studioDialog'
              );
            }
          }

          styleFormatsMerge = rteConfig.styleFormatsMerge === 'true';

          const codeEditorWrap = rteConfig.codeEditorWrap ? rteConfig.codeEditorWrap === 'true' : false;

          const external = {
            acecode: '/studio/static-assets/js/tinymce-plugins/ace/plugin.min.js',
            paste_from_word: '/studio/static-assets/js/tinymce-plugins/paste-from-word/plugin.min.js'
          };
          if (rteConfig.external_plugins) {
            Object.entries(rteConfig.external_plugins).forEach((entry) => {
              external[entry[0]] = CStudioAuthoring.StringUtils.keyFormat(entry[1], {
                site: CStudioAuthoringContext.site
              });
            });
          }

          const options = {
            selector: '#' + rteId,
            width: _thisControl.rteWidth,
            // As of 3.1.14, the toolbar is moved to be part of the editor text field (not stuck/floating at the top of the window).
            // Adding 78px (toolbar's height) so that the toolbar doesn't eat up on the height set on the content modelling tool.
            height: _thisControl.rteHeight + 78,
            min_height: _thisControl.rteHeight,
            theme: 'silver',
            plugins: pluginList,
            toolbar1: toolbarConfig1,
            toolbar2: toolbarConfig2,
            toolbar3: toolbarConfig3,
            toolbar4: toolbarConfig4,
            toolbar_sticky: true,
            image_advtab: true,
            encoding: 'xml',
            relative_urls: false,
            remove_script_host: false,
            convert_urls: false,
            readonly: _thisControl.readonly,
            force_p_newlines: forcePTags,
            force_br_newlines: forceBRTags,
            forced_root_block: forceRootBlockPTag,
            remove_trailing_brs: false,
            media_live_embeds: true,
            autoresize_on_init: false,
            autoresize_bottom_margin: 0,
            extended_valid_elements: extendedValidElements,
            browser_spellcheck: this.enableSpellCheck,
            contextmenu: !this.enableSpellCheck,

            menu: {
              tools: { title: 'Tools', items: 'tinymcespellchecker code acecode wordcount' },
              edit: { title: 'Edit', items: 'undo redo | cut copy paste paste_as_text | selectall | searchreplace' }
            },

            automatic_uploads: true,
            file_picker_types: 'image media file',
            file_picker_callback: function (cb, value, meta) {
              // meta contains info about type (image, media, etc). Used to properly add DS to dialogs.
              _thisControl.createControl(cb, meta);
            },

            templates: templates,

            content_css: rteStylesheets,
            content_style: rteStyleOverride,
            code_editor_wrap: codeEditorWrap,

            external_plugins: external,

            style_formats: styleFormats,

            style_formats_merge: styleFormatsMerge,

            paste_word_valid_elements: rtePasteWordElements,

            paste_postprocess_ext: function (plugin, args) {
              if (CStudioForms.Controls.RTETINYMCE5.pasteFromWordPostProcess) {
                CStudioForms.Controls.RTETINYMCE5.pasteFromWordPostProcess(plugin, args);
              }
            },

            setup: function (editor) {
              var addPadding = function () {
                const formHeader = $('#formHeader');
                if (formHeader.is(':visible')) {
                  formHeader.addClass('padded-top');
                } else {
                  $('#formContainer').addClass('padded-top');
                }
              };
              editor.on('init', function (e) {
                amplify.publish('/field/init/completed');
                _thisControl.editorId = editor.id;
                _thisControl.editor = editor;
                _thisControl._onChange(null, _thisControl);
              });

              editor.on('keyup paste undo redo', function (e) {
                _thisControl.save();
                _thisControl._onChangeVal(null, _thisControl);
              });

              // Save model when setting content into editor (images, tables, etc).
              editor.on('SetContent', function (e) {
                // Don't save model on initial setting of content (initializing editor)
                if (!e.initial) {
                  _thisControl.save();
                }
              });

              editor.on('Change', function (e) {
                const id = _thisControl.editorId,
                  windowHeight = $(window).height(),
                  $editorIframe = $('#' + id + '_ifr'),
                  editorScrollTop = $editorIframe.offset().top, // Top position in document
                  editorPos =
                    $editorIframe[0].getBoundingClientRect().top > 0 ? $editorIframe[0].getBoundingClientRect().top : 0, // Top position in current view
                  currentSelectionPos = $(tinymce.activeEditor.selection.getNode()).offset().top, // Top position of current node selected in editor
                  editorHeight = $editorIframe.height();

                // if current selection it out of view, scroll to selection
                if (editorPos + currentSelectionPos > windowHeight - 100) {
                  $(document).scrollTop(editorScrollTop + editorHeight - windowHeight + 100);
                }

                if (!e.initial) {
                  _thisControl.save();
                }
                _thisControl._onChangeVal(null, _thisControl);
              });

              editor.on('DblClick', function (e) {
                if (e.target.nodeName == 'IMG') {
                  tinyMCE.activeEditor.execCommand('mceImage');
                }
              });
            }
          };

          editor = tinymce.init({ ...options, ...this._getTinymceExtendedOptions(rteConfig) });

          // Update all content before saving the form (all content is automatically updated on focusOut)
          callback = {};
          callback.beforeSave = function () {
            _thisControl.save();
          };
          _thisControl.form.registerBeforeSaveCallback(callback);
        },

        createControl: function (cb, meta) {
          var datasourcesNames = '',
            imageManagerNames = this.imageManagerName, // List of image datasource IDs, could be an array or a string
            videoManagerNames = this.videoManagerName,
            fileManagerNames = this.fileManagerName,
            addContainerEl,
            tinyMCEContainer = $('.tox-dialog'),
            _self = this,
            type = meta.filetype == 'media' ? 'video' : meta.filetype == 'file' ? 'item' : meta.filetype;

          imageManagerNames = !imageManagerNames
            ? ''
            : Array.isArray(imageManagerNames)
            ? imageManagerNames.join(',')
            : imageManagerNames; // Turn the list into a string
          videoManagerNames = !videoManagerNames
            ? ''
            : Array.isArray(videoManagerNames)
            ? videoManagerNames.join(',')
            : videoManagerNames;
          fileManagerNames = !fileManagerNames
            ? ''
            : Array.isArray(fileManagerNames)
            ? fileManagerNames.join(',')
            : fileManagerNames;

          if (videoManagerNames !== '') {
            datasourcesNames = videoManagerNames;
          }
          if (imageManagerNames !== '') {
            if (datasourcesNames !== '') {
              datasourcesNames += ',';
            }
            datasourcesNames += imageManagerNames;
          }
          if (fileManagerNames !== '') {
            if (datasourcesNames !== '') {
              datasourcesNames += ',';
            }
            datasourcesNames += fileManagerNames;
          }

          if (this.addContainerEl) {
            addContainerEl = this.addContainerEl;
            this.addContainerEl = null;
            $('.cstudio-form-control-image-picker-add-container').remove();
          } else {
            addContainerEl = document.createElement('div');
            tinyMCEContainer.append(addContainerEl);
            YAHOO.util.Dom.addClass(addContainerEl, 'cstudio-form-control-image-picker-add-container');
            YAHOO.util.Dom.addClass(addContainerEl, 'cstudio-tinymce');
            this.addContainerEl = addContainerEl;

            addContainerEl.style.position = 'absolute';
            addContainerEl.style.right = '15px';
            addContainerEl.style.top = '113px';

            var datasourceMap = this.form.datasourceMap,
              datasourceDef = this.form.definition.datasources,
              addFunction; //video or image add function
            switch (type) {
              case 'image':
                addFunction = _self.addManagedImage;
                break;
              case 'video':
                addFunction = _self.addManagedVideo;
                break;
              default:
                addFunction = _self.addManagedFile;
            }

            var addMenuOption = function (el) {
              // We want to avoid possible substring conflicts by using a reg exp (a simple indexOf
              // would fail if a datasource id string is a substring of another datasource id)
              var regexpr = new RegExp('(' + el.id + ')[\\s,]|(' + el.id + ')$'),
                mapDatasource;

              if (datasourcesNames.indexOf(el.id) != -1 && el.interface === type) {
                mapDatasource = datasourceMap[el.id];

                var itemEl = document.createElement('div');
                YAHOO.util.Dom.addClass(itemEl, 'cstudio-form-control-image-picker-add-container-item');
                itemEl.textContent = el.title;
                addContainerEl.appendChild(itemEl);

                YAHOO.util.Event.on(
                  itemEl,
                  'click',
                  function () {
                    _self.addContainerEl = null;
                    $('.cstudio-form-control-image-picker-add-container').remove();

                    try {
                      addFunction(mapDatasource, cb); //video or image add function
                    } catch (e) {
                      CStudioAuthoring.Operations.showSimpleDialog(
                        'datasourceError',
                        CStudioAuthoring.Operations.simpleDialogTypeINFO,
                        _self.formatMessage(_self.words.notification),
                        _self.formatMessage(_self.messages.incompatibleDatasource),
                        null, // use default button
                        YAHOO.widget.SimpleDialog.ICON_BLOCK,
                        'studioDialog'
                      );
                    }
                  },
                  itemEl
                );
              }
            };
            datasourceDef.forEach(addMenuOption);

            // If no datasources for type
            if ($(addContainerEl).children().length === 0) {
              var itemEl = document.createElement('div');
              YAHOO.util.Dom.addClass(itemEl, 'cstudio-form-control-image-picker-add-container-item');
              itemEl.innerHTML = 'No datasources available';
              addContainerEl.appendChild(itemEl);
            }
          }
        },

        addManagedImage(datasource, cb) {
          if (datasource && datasource.insertImageAction) {
            datasource.insertImageAction({
              success: function (imageData) {
                var cleanUrl = imageData.relativeUrl.replace(/^(.+?\.(png|jpe?g)).*$/i, '$1'); //remove timestamp
                cb(cleanUrl, { title: imageData.fileName });
              },
              failure: function (message) {
                CStudioAuthoring.Operations.showSimpleDialog(
                  'message-dialog',
                  CStudioAuthoring.Operations.simpleDialogTypeINFO,
                  CMgs.format(langBundle, 'notification'),
                  message,
                  null,
                  YAHOO.widget.SimpleDialog.ICON_BLOCK,
                  'studioDialog'
                );
              }
            });
          }
        },

        addManagedVideo(datasource, cb) {
          if (datasource && datasource.insertVideoAction) {
            datasource.insertVideoAction({
              success: function (videoData) {
                cb(videoData.relativeUrl, { title: videoData.fileName });

                // var cleanUrl = imageData.previewUrl.replace(/^(.+?\.(png|jpe?g)).*$/i, '$1');   //remove timestamp
              },
              failure: function (message) {
                CStudioAuthoring.Operations.showSimpleDialog(
                  'message-dialog',
                  CStudioAuthoring.Operations.simpleDialogTypeINFO,
                  CMgs.format(langBundle, 'notification'),
                  message,
                  null,
                  YAHOO.widget.SimpleDialog.ICON_BLOCK,
                  'studioDialog'
                );
              }
            });
          }
        },

        addManagedFile(datasource, cb) {
          if (datasource && datasource.add) {
            datasource.add(
              {
                returnProp: 'browserUri', // to return proper item link (browserUri)
                insertItem: function (fileData) {
                  cb(fileData, {});
                },
                failure: function (message) {
                  CStudioAuthoring.Operations.showSimpleDialog(
                    'message-dialog',
                    CStudioAuthoring.Operations.simpleDialogTypeINFO,
                    CMgs.format(langBundle, 'notification'),
                    message,
                    null,
                    YAHOO.widget.SimpleDialog.ICON_BLOCK,
                    'studioDialog'
                  );
                }
              },
              false
            );
          }
        },

        /**
         * render of control markup
         */
        _renderInputMarkup: function (config, rteId) {
          var titleEl, controlWidgetContainerEl, validEl, inputEl, descriptionEl;

          YDom.addClass(this.containerEl, 'rte-inactive');

          // Control title of form
          titleEl = document.createElement('span');
          YDom.addClass(titleEl, 'cstudio-form-field-title');
          titleEl.textContent = config.title;

          // Control container under form
          controlWidgetContainerEl = document.createElement('div');
          YDom.addClass(controlWidgetContainerEl, 'cstudio-form-control-rte-container rte2-container');

          //TODO: move to stylesheet
          controlWidgetContainerEl.style.paddingLeft = '28%';

          // Control validation element (its state  is set by control constraints)
          validEl = document.createElement('span');
          YDom.addClass(validEl, 'validation-hint');
          YDom.addClass(validEl, 'cstudio-form-control-validation fa fa-checks');

          // Control textarea - has the content that will be rendered on the plugin
          inputEl = document.createElement('textarea');
          controlWidgetContainerEl.appendChild(inputEl);
          YDom.addClass(inputEl, 'datum');
          this.inputEl = inputEl;
          inputEl.value = this.value == '_not-set' ? config.defaultValue : this.value;
          inputEl.id = rteId;
          YDom.addClass(inputEl, 'cstudio-form-control-input');

          // Control description that will be shown on the form
          descriptionEl = document.createElement('span');
          YDom.addClass(descriptionEl, 'description');
          YDom.addClass(descriptionEl, 'cstudio-form-control-rte-description');
          descriptionEl.innerHTML = config.description;

          this.containerEl.appendChild(titleEl);
          this.containerEl.appendChild(validEl);
          this.containerEl.appendChild(controlWidgetContainerEl);
          controlWidgetContainerEl.appendChild(descriptionEl);

          return inputEl;
        },

        /**
         * on change
         */
        _onChange: function (evt, obj) {
          obj.value = this.editor ? this.editor.getContent() : obj.value;

          if (obj.required) {
            if (CStudioAuthoring.Utils.isEmptyHtml(obj.value)) {
              obj.setError('required', this.formatMessage(this.messages.requiredField));
              obj.renderValidation(true, false);
            } else {
              obj.clearError('required');
              obj.renderValidation(true, true);
            }
          } else {
            obj.renderValidation(false, true);
          }

          obj.owner.notifyValidation();
        },

        _onChangeVal: function (evt, obj) {
          obj.edited = true;
          this._onChange(evt, obj);
        },

        /**
         * call this instead of calling editor.save()
         */
        save: function (a) {
          this.updateModel(CStudioForms.Util.escapeXml(this.editor.getContent()));
        }
      });

      CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-rte-tinymce5', CStudioForms.Controls.RTETINYMCE5);
    }
  }
);
