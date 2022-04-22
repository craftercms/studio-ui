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

CStudioForms.Controls.RTE =
  CStudioForms.Controls.RTE ||
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

CStudioForms.Controls.RTE.plugins = CStudioForms.Controls.RTE.plugins || {};

CStudioAuthoring.Module.requireModule(
  'cstudio-forms-rte-config-manager',
  '/static-assets/components/cstudio-forms/controls/rte-config-manager.js',
  {},
  {
    moduleLoaded: function () {
      const YDom = YAHOO.util.Dom;
      const tinymce = window.tinymce;
      YAHOO.extend(CStudioForms.Controls.RTE, CStudioForms.CStudioFormField, {
        getLabel: function () {
          return CMgs.format(langBundle, 'rte');
        },

        /**
         * render the RTE
         */
        render: function (config, containerEl) {
          var _thisControl = this,
            configuration = 'generic';

          const { operators } = CrafterCMSNext.rxjs;
          const { take } = operators;

          for (var i = 0; i < config.properties.length; i++) {
            var prop = config.properties[i];

            if (prop.name == 'rteConfiguration') {
              if (prop.value && prop.Value != '') {
                configuration = prop.value;
              }

              break;
            }
          }

          CrafterCMSNext.system
            .getStore()
            .pipe(take(1))
            .subscribe((store) => {
              if (!Boolean(store.getState().preview.richTextEditor)) {
                // If textEditorConfig is not loaded
                const unsubscribe = store.subscribe(() => {
                  if (Boolean(store.getState().preview.richTextEditor)) {
                    _thisControl._initializeRte(
                      config,
                      store.getState().preview.richTextEditor[configuration],
                      containerEl
                    );
                    unsubscribe();
                  }
                });

                store.dispatch({
                  type: 'INIT_RICH_TEXT_EDITOR_CONFIG',
                  payload: {
                    configXml: CrafterCMSNext.system.store.getState().uiConfig.xml,
                    siteId: CStudioAuthoringContext.site
                  }
                });
              } else {
                // If textEditorConfig is already loaded
                _thisControl._initializeRte(
                  config,
                  store.getState().preview.richTextEditor[configuration],
                  containerEl
                );
              }
            });
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
          return 'rte';
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
          return [{ label: CMgs.format(langBundle, 'required'), name: 'required', type: 'boolean' }];
        },

        getSupportedPostFixes: function () {
          return this.supportedPostFixes;
        },

        /**
         * render and initialization of editor
         */
        _initializeRte: function (config, rteConfig, containerEl) {
          var _thisControl = this,
            callback,
            rteId = CStudioAuthoring.Utils.generateUUID(),
            inputEl,
            pluginList;

          containerEl.id = this.id;
          this.containerEl = containerEl;
          this.fieldConfig = config;
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

          // https://www.tiny.cloud/docs/plugins/
          // paste plugin is hardcoded in order to enable drag and drop functionality (and avoid it being removed from
          // configuration file).
          pluginList = [rteConfig.tinymceOptions?.plugins, 'paste', this.autoGrow && 'autoresize']
            .filter(Boolean)
            .join(' ');

          const $editorContainer = $(`#${rteId}`).parent(),
            editorContainerWidth = $editorContainer.width(),
            editorContainerPL = parseFloat($editorContainer.css('padding-left').replace('px', ''));

          if (_thisControl.rteWidth > editorContainerWidth) {
            $editorContainer.css('padding-left', 0);
            $editorContainer.css('float', 'right');
            if (_thisControl.rteWidth > editorContainerWidth + editorContainerPL) {
              _thisControl.rteWidth = editorContainerWidth + editorContainerPL;
            }
          }

          const imageDatasources = this.imageManagerName ? this.imageManagerName.split(',') : [];
          const imageUploadDatasources = [
            'img-CMIS-upload',
            'img-desktop-upload',
            'img-S3-upload',
            'img-WebDAV-upload'
          ];
          this.editorImageDatasources = this.form.definition.datasources.filter(
            (datasource) =>
              datasource.interface === 'image' &&
              imageUploadDatasources.includes(datasource.name) &&
              imageDatasources.includes(datasource.id)
          );

          const external = {
            ...rteConfig.tinymceOptions?.external_plugins,
            acecode: '/studio/static-assets/js/tinymce-plugins/ace/plugin.min.js',
            craftercms_paste_extension: '/studio/static-assets/js/tinymce-plugins/craftercms_paste_extension/plugin.js'
          };

          tinymce.init({
            selector: '#' + rteId,
            width: _thisControl.rteWidth,
            // As of 3.1.14, the toolbar is moved to be part of the editor text field (not stuck/floating at the top of the window).
            // Adding 78px (toolbar's height) so that the toolbar doesn't eat up on the height set on the content modelling tool.
            height: _thisControl.rteHeight + 78,
            min_height: _thisControl.rteHeight,
            theme: 'silver',
            plugins: pluginList,
            toolbar_sticky: true,
            image_advtab: true,
            encoding: 'xml',
            relative_urls: false,
            remove_script_host: false,
            convert_urls: false,
            readonly: _thisControl.readonly, // comes from control props (not xml config)
            force_br_newlines: forceBRTags, // comes from control props (not xml config)
            forced_root_block: forceRootBlockPTag, // comes from control props (not xml config)
            remove_trailing_brs: false,
            media_live_embeds: true,
            autoresize_on_init: false,
            autoresize_bottom_margin: 0,
            contextmenu: !this.enableSpellCheck, // comes from control props (not xml config)
            image_uploadtab: this.editorImageDatasources.length > 0, // comes from control props (not xml config)
            craftercms_paste_cleanup: rteConfig?.tinymceOptions?.craftercms_paste_cleanup ?? true, // If doesn't exist or if true => true
            automatic_uploads: true,
            file_picker_types: 'image media file',
            skin: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oxide-dark' : 'oxide',
            code_editor_inline: true,

            external_plugins: external,

            file_picker_callback: function (cb, value, meta) {
              // meta contains info about type (image, media, etc). Used to properly add DS to dialogs.
              _thisControl.createControl(cb, meta);
            },
            images_upload_handler: function (blobInfo, success, failure) {
              _thisControl.addDndImage(blobInfo, success, failure);
            },
            setup: function (editor) {
              var pluginManager = tinymce.util.Tools.resolve('tinymce.PluginManager');

              editor.on('init', function (e) {
                amplify.publish('/field/init/completed');
                _thisControl.editorId = editor.id;
                _thisControl.editor = editor;
                if (_thisControl.value && _thisControl.value !== '_not-set') {
                  editor.setContent(_thisControl.value, { format: 'raw' });
                }
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

              // No point in waiting for `craftercms_tinymce_hooks` if the hook won't be loaded at all.
              external.craftercms_tinymce_hooks &&
                pluginManager.waitFor(
                  'craftercms_tinymce_hooks',
                  () => {
                    const hooks = pluginManager.get('craftercms_tinymce_hooks');
                    if (hooks) {
                      pluginManager.get('craftercms_tinymce_hooks').setup?.(editor);
                    } else {
                      console.error(
                        "The `craftercms_tinymce_hooks` was configured to be loaded but didn't load. Check the path is correct in the rte configuration file."
                      );
                    }
                  },
                  'loaded'
                );
            },
            paste_preprocess(plugin, args) {
              _thisControl.editor.plugins.craftercms_paste_extension?.paste_preprocess(plugin, args);
            },
            paste_postprocess: function (plugin, args) {
              // If no text, and external it means that is dragged
              // text validation is because it can be text copied from outside the editor
              if (args.node.outerText === '' && !args.internal && !_thisControl.editorImageDatasources.length) {
                args.preventDefault();
                _thisControl.editor.notificationManager.open({
                  text: _thisControl.formatMessage(_thisControl.messages.noDatasourcesConfigured),
                  timeout: 3000,
                  type: 'error'
                });
              } else {
                _thisControl.editor.plugins.craftercms_paste_extension?.paste_postprocess(plugin, args);
              }
            },
            ...(rteConfig?.tinymceOptions && {
              ...CrafterCMSNext.util.object.reversePluckProps(
                rteConfig.tinymceOptions,
                'target', // Target can't be changed
                'inline', // The control will always have the default (false) in forms-engine.
                'setup',
                'base_url',
                'encoding',
                'autosave_ask_before_unload', // Autosave options are removed since it is not supported in control.
                'autosave_interval',
                'autosave_prefix',
                'autosave_restore_when_empty',
                'autosave_retention',
                'file_picker_callback', // File picker integration with our data sources is already implemented in the control
                'height', // Height is set via control properties
                'width', // Width is set via control properties
                'paste_postprocess', // Already implemented for paste and drag&drop using our data sources.
                'images_upload_handler', // Images upload integration with our data sources is already implemented in the control
                'code_editor_inline', // Code editor will always be inline in forms-engine.
                'plugins', // Considered/used above, mixed with our options
                'toolbar_sticky', // Toolbar is configured and styled to be sticky in forms-engine
                'relative_urls' // To avoid allowing convertion of urls to be relative to the document_base_url
              )
            })
          });

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
                      addFunction(mapDatasource, cb); // video or image add function
                    } catch (e) {
                      CStudioAuthoring.Operations.showSimpleDialog(
                        'datasourceError',
                        CStudioAuthoring.Operations.simpleDialogTypeINFO,
                        _self.formatMessage(_self.words.notification),
                        _self.formatMessage(_self.messages.incompatibleDatasource),
                        null, // use default button
                        YAHOO.widget.SimpleDialog.ICON_BLOCK,
                        'studioDialog',
                        null,
                        1301
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

        addManagedImage(datasource, cb, file) {
          if (datasource && datasource.insertImageAction) {
            datasource.insertImageAction(
              {
                success: function (imageData) {
                  var cleanUrl = imageData.relativeUrl.replace(/^(.+?\.(png|jpe?g)).*$/i, '$1'); //remove timestamp

                  if (cb.success) {
                    cb.success(cleanUrl, { title: imageData.fileName });
                  } else {
                    cb(cleanUrl, { title: imageData.fileName });
                  }
                },
                failure: function (message) {
                  if (cb.failure) {
                    cb.failure(message);
                  } else {
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
                }
              },
              file
            );
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

        addDndImage(blobInfo, success, failure) {
          const _self = this;
          const datasourceMap = this.form.datasourceMap;

          const $imageToAdd = $(_self.editor.iframeElement)
            .contents()
            .find(`img[src="${blobInfo.blobUri()}"]`)
            .css('opacity', 0.3);

          if (this.editorImageDatasources.length > 0) {
            this.editor.windowManager.open({
              title: 'Source',
              body: {
                type: 'panel',
                items: [
                  {
                    type: 'selectbox',
                    name: 'datasource',
                    label: this.formatMessage(this.messages.chooseSource),
                    items: this.editorImageDatasources.map((source) => ({
                      value: source.id,
                      text: source.title
                    }))
                  }
                ]
              },
              onSubmit: function (api) {
                const ds = datasourceMap[api.getData().datasource];

                const file = blobInfo.blob();
                file.dataUrl = `data:${file.type};base64,${blobInfo.base64()}`;

                _self.addManagedImage(
                  ds,
                  {
                    success: function (url, data) {
                      _self.editor.notificationManager.open({
                        text: _self.formatMessage(_self.messages.dropImageUploaded, { title: data.title }),
                        timeout: 3000,
                        type: 'success'
                      });

                      $imageToAdd.css('opacity', '');
                      success(url);
                    },
                    failure: function (error) {
                      _self.editor.notificationManager.open({
                        text: error.message,
                        timeout: 3000,
                        type: 'error'
                      });
                      $imageToAdd.remove();
                      failure();
                    }
                  },
                  file
                );
                api.close();
              },
              onCancel: function () {
                if ($imageToAdd.length > 0) {
                  $imageToAdd.remove();
                  failure(null, { remove: true });
                } else {
                  // Remove spinner added by upload tab under insert image dialog
                  $('.tox-dialog__busy-spinner').remove();
                }
              },
              buttons: [
                {
                  type: 'cancel',
                  text: _self.formatMessage(_self.words.cancel)
                },
                {
                  text: _self.formatMessage(_self.words.select),
                  type: 'submit',
                  primary: true,
                  enabled: false
                }
              ]
            });
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

          // TODO: move to stylesheet
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

      CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-rte', CStudioForms.Controls.RTE);
    }
  }
);
