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

CStudioForms.Controls.RTETINYMCE5 = CStudioForms.Controls.RTETINYMCE5 ||
function(id, form, owner, properties, constraints, readonly, pencilMode)  {
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

  this.messages = {
    rteControlMessages: CrafterCMSNext.i18n.messages.rteControlMessages
  };

  return this;
};

CStudioForms.Controls.RTETINYMCE5.plugins =  CStudioForms.Controls.RTETINYMCE5.plugins || {};

CStudioAuthoring.Module.requireModule(
	"cstudio-forms-rte-config-manager",
	'/static-assets/components/cstudio-forms/controls/rte-config-manager.js',
	{  },
	{ moduleLoaded: function() {

	const YDom = YAHOO.util.Dom,
        i18n = CrafterCMSNext.i18n,
        formatMessage = i18n.intl.formatMessage,
        messages = i18n.messages.contentTypesMessages;

	YAHOO.extend(CStudioForms.Controls.RTETINYMCE5, CStudioForms.CStudioFormField, {

		getLabel: function() {
			return CMgs.format(langBundle, "rteTinyMCE5");
		},

		/**
		 * render the RTE
		 */
		render: function(config, containerEl) {
			var _thisControl = this,
				configuration = "generic";

			for(var i=0; i<config.properties.length; i++) {
        var prop = config.properties[i];

        if (prop.name == 'rteConfiguration') {
          if (prop.value && prop.Value != '') {
            configuration = prop.value;
          }

          break;
        }
      }

			CStudioForms.Controls.RTEManager.getRteConfiguration(configuration, "no-role-support", {
				success: function(rteConfig) {
					_thisControl._initializeRte(config, rteConfig, containerEl);
				},
				failure: function() {
				}
			}, "/form-control-config/rte/rte-setup-tinymce5.xml");
		},

		/**
		 * get the value of this control
		 */
		getValue: function() {
			if(this.editor) {
				this.editor.save();
				value = this.inputEl.value;
				this.value = value;
			}

			return this.value;
		},

		/**
		 * set the value for the control
		 */
		setValue: function(value) {
			this.value = value;

			try {
				tinymce.activeEditor.setContent(value, {format: 'raw'});
			}
			catch(err) {
      }

			this.updateModel(value);
			this.edited = false;
		},

		updateModel: function(value) {
      const newValue = this.escapeScripts ? value : CStudioForms.Util.unEscapeXml(value);

      this.form.updateModel(this.id, newValue);
    },

		/**
		 * get the widget name
		 */
		getName: function() {
			return "rte-tinymce5";
		},

		/**
		 * get supported properties
		 */
		getSupportedProperties: function() {
			return [
        { label: formatMessage(messages.width), name: 'width', type: 'int' },
        { label: formatMessage(messages.height), name: 'height', type: 'int' },
        { label: formatMessage(messages.autoGrow), name: 'autoGrow', type: 'boolean', defaultValue: 'false' },
        {
          label: formatMessage(messages.forceRootBlockP),
          name: 'forceRootBlockPTag',
          type: 'boolean',
          defaultValue: 'true'
        },
        { label: formatMessage(messages.forcePNewLines), name: 'forcePTags', type: 'boolean', defaultValue: 'true' },
        { label: formatMessage(messages.forceBRNewLines), name: 'forceBRTags', type: 'boolean', defaultValue: 'false' },
        { label: formatMessage(messages.supportedChannels), name: 'supportedChannels', type: 'supportedChannels' },
        {
          label: formatMessage(messages.RTEConfiguration),
          name: 'rteConfiguration',
          type: 'string',
          defaultValue: 'generic'
        },
        {
          label: CrafterCMSNext.i18n.intl.formatMessage(this.messages.rteControlMessages.escapeScripts),
          name: 'escapeScripts',
          type: 'boolean',
          defaultValue: 'true'
        },
        { label: formatMessage(messages.imageManager), name: 'imageManager', type: 'datasource:image' },
        { label: formatMessage(messages.videoManager), name: 'videoManager', type: 'datasource:video' },
        { label: formatMessage(messages.fileManager), name: 'fileManager', type: 'datasource:item' }
      ];
		},

		/**
		 * get the supported constraints
		 */
		getSupportedConstraints: function() {
			return [
				{ label: CMgs.format(langBundle, "required"), name: "required", type: "boolean" }
			];
		},

    getSupportedPostFixes: function() {
      return this.supportedPostFixes;
    },

		/**
		 * render and initialization of editor
		 */
		_initializeRte: function(config, rteConfig, containerEl) {
			var _thisControl = this,
				editor,
				callback,
				rteId = CStudioAuthoring.Utils.generateUUID(),
				inputEl,
				pluginList,
				rteStylesheets,
				rteStyleOverride,
				toolbarConfig1,
				toolbarConfig2,
				toolbarConfig3,
				toolbarConfig4,
				templates;

			containerEl.id = this.id;
			this.containerEl = containerEl;
			this.fieldConfig = config;
			this.rteConfig = rteConfig;
			this.rteId = rteId;

			inputEl = this._renderInputMarkup(config, rteId);

			// Getting properties from content-type
			for(var i=0; i<config.properties.length; i++) {
				var prop = config.properties[i];

				switch (prop.name) {
					case "imageManager" :
						this.imageManagerName = (prop.value && prop.Value != "") ? prop.value : null;
						break;
					case "videoManager" :
						this.videoManagerName = (prop.value && prop.Value != "") ? prop.value : null;
						break;
					case "width" :
						var value = isNaN(parseInt(prop.value)) ? prop.value : parseInt(prop.value);
						this.rteWidth = (typeof prop.value == "string" && prop.value) ? value : "100%";
						break;
					case "fileManager" :
						this.fileManagerName = (prop.value && prop.Value != "") ? prop.value : null;
						break;
					case "height" :
						this.rteHeight = (prop.value === undefined || prop.value === '') ? 300 : parseInt(prop.value, 10);
            break;
          case "autoGrow" :
						this.autoGrow = (prop.value == "false") ? false : true;
						break;
					case "maxlength" :
						inputEl.maxlength = prop.value;
            break;
          case 'forcePTags' :
            var forcePTags = (prop.value == 'false') ? false : true;
            break;
          case 'forceBRTags' :
            var forceBRTags = (prop.value == 'true') ? true : false;
            break;
          case 'forceRootBlockPTag' :
            var forceRootBlockPTag = (prop.value == 'false') ? false : 'p';
            break;
          case 'escapeScripts' :
            var escapeScripts = (prop.value == 'true') ? true : false;
            this.escapeScripts = escapeScripts;
            break;
        }
			}

			templates = rteConfig.templates && rteConfig.templates.template ? rteConfig.templates.template : null;

			// https://www.tiny.cloud/docs/plugins/
      pluginList = rteConfig.plugins;
      pluginList = this.autoGrow ? pluginList + ' autoresize' : pluginList;

			toolbarConfig1 = (rteConfig.toolbarItems1 && rteConfig.toolbarItems1.length !=0) ?
        rteConfig.toolbarItems1 : 'bold italic | bullist numlist';
      toolbarConfig2 = (rteConfig.toolbarItems2 && rteConfig.toolbarItems2.length != 0) ? rteConfig.toolbarItems2 : '';
      toolbarConfig3 = (rteConfig.toolbarItems3 && rteConfig.toolbarItems3.length != 0) ? rteConfig.toolbarItems3 : '';
      toolbarConfig4 = (rteConfig.toolbarItems4 && rteConfig.toolbarItems4.length != 0) ? rteConfig.toolbarItems4 : '';

      rteStylesheets = (rteConfig.rteStylesheets && typeof rteConfig.rteStylesheets === 'object')
        ? rteConfig.rteStylesheets.link : null;

      rteStyleOverride = rteConfig.rteStyleOverride ? rteConfig.rteStyleOverride : null;

      const extendedValidElements = escapeScripts ? '' : 'script[language|type|src]';

      editor = tinymce.init({
        selector: '#' + rteId,
        width: _thisControl.rteWidth,
        height: _thisControl.rteHeight,
        min_height: _thisControl.rteHeight,
        theme: 'silver',
        plugins: pluginList,
        toolbar1: toolbarConfig1,
        toolbar2: toolbarConfig2,
				toolbar3: toolbarConfig3,
				toolbar4: toolbarConfig4,
				image_advtab: true,
				encoding: 'xml',
				relative_urls : false,
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

        menu: {
          tools: { title: 'Tools', items: 'tinymcespellchecker code acecode wordcount' },
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

				setup: function (editor) {
				  var addPadding = function () {
				    const formHeader= $('#formHeader');
            if(formHeader.is(':visible')) {
              formHeader.addClass('padded-top');
            }else {
              $('#formContainer').addClass('padded-top');
            }
          };
					editor.on('init', function (e) {
            amplify.publish('/field/init/completed');
            _thisControl.editorId = editor.id;
						_thisControl.editor = editor;
						_thisControl._onChange(null, _thisControl);
						_thisControl._hideBars(this.editorContainer);
					});

					editor.on('focus', function (e) {
            addPadding();
						_thisControl._showBars(this.editorContainer);
					});

					editor.on('blur', function (e) {
            addPadding();
						_thisControl._hideBars(this.editorContainer);
					});

					editor.on('keyup paste', function (e){
						_thisControl.save();
						_thisControl._onChangeVal(null, _thisControl);
					});

					// Save model when setting content into editor (images, tables, etc).
					editor.on('SetContent', function(e){
						// Don't save model on initial setting of content (initializing editor)
						if(!e.initial) {
							_thisControl.save();
            }
					});

					editor.on('Change', function(e){
            const id = _thisControl.editorId,
                  windowHeight = $(window).height(),
                  $editorIframe = $('#' + id + '_ifr'),
                  editorScrollTop = $editorIframe.offset().top,   // Top position in document
                  editorPos = $editorIframe[0].getBoundingClientRect().top > 0 ? $editorIframe[0].getBoundingClientRect().top : 0, // Top position in current view
                  currentSelectionPos = $(tinymce.activeEditor.selection.getNode()).offset().top,   // Top position of current node selected in editor
                  editorHeight = $editorIframe.height();

            // if current selection it out of view, scroll to selection
            if ( editorPos + currentSelectionPos > windowHeight - 100 ) {
              $(document).scrollTop(editorScrollTop + editorHeight - windowHeight + 100);
            }

						if(!e.initial) {
							_thisControl.save();
						}
          });

          editor.on('DblClick', function(e){
						if (e.target.nodeName=='IMG') {
							tinyMCE.activeEditor.execCommand('mceImage');
						}
          });

          editor.on('Focus', function(e){
            const id = _thisControl.editorId;
            $('#' + id + ' + .tox-tinymce').addClass('focused');
          });

          editor.on('Blur', function(e){
            const id = _thisControl.editorId;
            $('#' + id + ' + .tox-tinymce').removeClass('focused');
          });

				}
			});

			// Update all content before saving the form (all content is automatically updated on focusOut)
			callback = {};
			callback.beforeSave = function () {
				_thisControl.save();
			};
			_thisControl.form.registerBeforeSaveCallback(callback);
		},

		createControl: function(cb, meta) {
			var datasourcesNames = "",
				imageManagerNames = this.imageManagerName,  // List of image datasource IDs, could be an array or a string
				videoManagerNames = this.videoManagerName,
				fileManagerNames = this.fileManagerName,
				addContainerEl,
				tinyMCEContainer = $(".tox-dialog"),
				_self = this,
				type = meta.filetype == 'media' ? 'video' : meta.filetype == 'file' ? 'item' : meta.filetype;

			imageManagerNames = (!imageManagerNames) ? "" :
								(Array.isArray(imageManagerNames)) ? imageManagerNames.join(",") : imageManagerNames;  // Turn the list into a string
			videoManagerNames = (!videoManagerNames) ? "" :
								(Array.isArray(videoManagerNames)) ? videoManagerNames.join(",") : videoManagerNames;
			fileManagerNames = (!fileManagerNames) ? "" :
								(Array.isArray(fileManagerNames)) ? fileManagerNames.join(",") : fileManagerNames;

			if(videoManagerNames !== ""){
				datasourcesNames = videoManagerNames;
			}
			if(imageManagerNames !== ""){
				if(datasourcesNames !== "" ){
					datasourcesNames += ",";
				}
				datasourcesNames += imageManagerNames;
			}
			if(fileManagerNames !== ""){
				if(datasourcesNames !== "" ){
					datasourcesNames += ",";
				}
				datasourcesNames += fileManagerNames;
			}

			if(this.addContainerEl) {
				addContainerEl = this.addContainerEl;
				this.addContainerEl = null;
				$('.cstudio-form-control-image-picker-add-container').remove();
			}else{
				addContainerEl = document.createElement("div");
				tinyMCEContainer.append(addContainerEl);
				YAHOO.util.Dom.addClass(addContainerEl, 'cstudio-form-control-image-picker-add-container');
				YAHOO.util.Dom.addClass(addContainerEl, 'cstudio-tinymce');
				this.addContainerEl = addContainerEl;

				addContainerEl.style.position = 'absolute';
				addContainerEl.style.right = '15px';
				addContainerEl.style.top = '113px';

				var datasourceMap = this.form.datasourceMap,
					datasourceDef = this.form.definition.datasources,
					addFunction;		//video or image add function
				switch(type) {
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
					var regexpr = new RegExp("(" + el.id + ")[\\s,]|(" + el.id + ")$"),
						mapDatasource;

					if ((datasourcesNames.indexOf(el.id) != -1) && (el.interface === type)) {
						mapDatasource = datasourceMap[el.id];

						var itemEl = document.createElement("div");
						YAHOO.util.Dom.addClass(itemEl, 'cstudio-form-control-image-picker-add-container-item');
            itemEl.innerHTML = el.title;
            addContainerEl.appendChild(itemEl);

            YAHOO.util.Event.on(itemEl, 'click', function () {
              _self.addContainerEl = null;
              $('.cstudio-form-control-image-picker-add-container').remove();

              addFunction(mapDatasource, cb);		//video or image add function
            }, itemEl);
          }
        };
				datasourceDef.forEach(addMenuOption);

				// If no datasources for type
				if( $(addContainerEl).children().length === 0 ){
					var itemEl = document.createElement("div");
					YAHOO.util.Dom.addClass(itemEl, 'cstudio-form-control-image-picker-add-container-item');
					itemEl.innerHTML = 'No datasources available';
					addContainerEl.appendChild(itemEl);
				}
			}

		},

		addManagedImage(datasource, cb) {
			if(datasource && datasource.insertImageAction) {
				datasource.insertImageAction({
					success: function(imageData) {
						var cleanUrl = imageData.relativeUrl.replace(/^(.+?\.(png|jpe?g)).*$/i, '$1');   //remove timestamp
						cb(cleanUrl, { title: imageData.fileName });
					},
					failure: function(message) {
						CStudioAuthoring.Operations.showSimpleDialog(
							"message-dialog",
							CStudioAuthoring.Operations.simpleDialogTypeINFO,
							CMgs.format(langBundle, "notification"),
							message,
							null,
							YAHOO.widget.SimpleDialog.ICON_BLOCK,
							"studioDialog"
						);
					}
				});
			}
		},

		addManagedVideo(datasource, cb) {
			if(datasource && datasource.insertVideoAction) {
				datasource.insertVideoAction({
					success: function(videoData) {
						cb(videoData.relativeUrl, { title: videoData.fileName });

						// var cleanUrl = imageData.previewUrl.replace(/^(.+?\.(png|jpe?g)).*$/i, '$1');   //remove timestamp
					},
					failure: function(message) {
						CStudioAuthoring.Operations.showSimpleDialog(
							"message-dialog",
							CStudioAuthoring.Operations.simpleDialogTypeINFO,
							CMgs.format(langBundle, "notification"),
							message,
							null,
							YAHOO.widget.SimpleDialog.ICON_BLOCK,
							"studioDialog"
						);
					}
				});
			}
		},

		addManagedFile(datasource, cb) {
			if(datasource && datasource.add) {
				datasource.add({
					insertItem: function(fileData) {
            var cleanUrl = fileData;
            cb(cleanUrl);
          },
					failure: function(message) {
						CStudioAuthoring.Operations.showSimpleDialog(
							"message-dialog",
							CStudioAuthoring.Operations.simpleDialogTypeINFO,
							CMgs.format(langBundle, "notification"),
							message,
							null,
							YAHOO.widget.SimpleDialog.ICON_BLOCK,
							"studioDialog"
						);
					}
				}, false);
			}
		},

		/**
		 * render of control markup
		 */
		_renderInputMarkup: function(config, rteId){
			var titleEl,
				controlWidgetContainerEl,
				validEl,
				inputEl,
				descriptionEl;

			YDom.addClass(this.containerEl, "rte-inactive");

			// Control title of form
			titleEl = document.createElement("span");
			YDom.addClass(titleEl, 'cstudio-form-field-title');
			titleEl.innerHTML = config.title;

			// Control container under form
			controlWidgetContainerEl = document.createElement("div");
			YDom.addClass(controlWidgetContainerEl, 'cstudio-form-control-rte-container rte2-container');

			//TODO: move to stylesheet
			controlWidgetContainerEl.style.paddingLeft = '28%';

			// Control validation element (its state  is set by control constraints)
			validEl = document.createElement("span");
			YDom.addClass(validEl, 'validation-hint');
			YDom.addClass(validEl, 'cstudio-form-control-validation fa fa-checks');

			// Control textarea - has the content that will be rendered on the plugin
			inputEl = document.createElement("textarea");
			controlWidgetContainerEl.appendChild(inputEl);
			YDom.addClass(inputEl, 'datum');
			this.inputEl = inputEl;
			inputEl.value = (this.value == "_not-set") ? config.defaultValue : this.value;
			inputEl.id = rteId;
			YDom.addClass(inputEl, 'cstudio-form-control-input');

			// Control description that will be shown on the form
			descriptionEl = document.createElement("span");
			YDom.addClass(descriptionEl, 'description');
			YDom.addClass(descriptionEl, 'cstudio-form-control-rte-description');
			descriptionEl.innerHTML = config.description;

			this.containerEl.appendChild(titleEl);
			this.containerEl.appendChild(validEl);
			this.containerEl.appendChild(controlWidgetContainerEl);
			controlWidgetContainerEl.appendChild(descriptionEl);

			return inputEl;
		},

		_hideBars(container){
			var $container = $(container),
				currentWidth = this.editor.editorContainer.clientWidth,
				barsHeight = 98,
				editorHeight = this.rteHeight;

			// $container.find(".tox-menubar").hide();
			// $container.find(".tox-toolbar").hide();
		},

		_showBars(container){
			var $container = $(container),
				currentWidth = this.editor.editorContainer.clientWidth,
				editorHeight = this.rteHeight;

			// $container.find(".tox-menubar").show();
			// $container.find(".tox-toolbar").show();
		},

		/**
		 * on change
		 */
		_onChange: function(evt, obj) {
			obj.value = this.editor ? this.editor.getContent() : obj.value;

			if(obj.required) {
				if(obj.value == "") {
					obj.setError("required", "Field is Required");
					obj.renderValidation(true, false);
				}
				else {
					obj.clearError("required");
					obj.renderValidation(true, true);
				}
			}
			else {
				obj.renderValidation(false, true);
			}

			obj.owner.notifyValidation();
		},

		_onChangeVal: function(evt, obj) {
			obj.edited = true;
			this._onChange(evt, obj);
		},

		/**
		 * call this instead of calling editor.save()
		 */
		save: function(a) {
			this.updateModel(this.editor.getContent());
		}
	});

	CStudioAuthoring.Module.moduleLoaded("cstudio-forms-controls-rte-tinymce5", CStudioForms.Controls.RTETINYMCE5);

}} );
