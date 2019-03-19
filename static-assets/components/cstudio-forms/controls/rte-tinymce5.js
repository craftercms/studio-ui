/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
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
	this.value = "_not-set";
	this.form = form;
	this.id = id;
	this.readonly = readonly;
	this.rteHeight = 300;
	this.pencilMode = pencilMode;
	
	return this;
}

CStudioForms.Controls.RTETINYMCE5.plugins =  CStudioForms.Controls.RTETINYMCE5.plugins || {};

CStudioAuthoring.Module.requireModule(
	"cstudio-forms-rte-config-manager",
	'/static-assets/components/cstudio-forms/controls/rte-config-manager.js',
	{  },
	{ moduleLoaded: function() {

	var YDom = YAHOO.util.Dom;

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

				if(prop.name == "rteConfiguration") {
					if(prop.value && prop.Value != "") {
						configuration = prop.value;
					}
					
					break;
				}
			};
				
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
			};

			this.updateModel(value);
			this.edited = false;
		},

		updateModel: function(value) {
			this.form.updateModel(this.id, CStudioForms.Util.unEscapeXml(value));
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
				{ label: CMgs.format(langBundle, "height"), name: "height", type: "int" },
				{ label: CMgs.format(langBundle, "forceRootBlockP"), name: "forceRootBlockPTag", type: "boolean", defaultValue: "true" },
				{ label: CMgs.format(langBundle, "forcePNewLines"), name: "forcePTags", type: "boolean", defaultValue: "true" },
				{ label: CMgs.format(langBundle, "forceBRNewLines"), name: "forceBRTags", type: "boolean", defaultValue: "false" },
				{ label: CMgs.format(langBundle, "supportedChannels"), name: "supportedChannels", type: "supportedChannels" },
				{ label: CMgs.format(langBundle, "RTEConfiguration"), name: "rteConfiguration", type: "string", defaultValue: "generic" },
				{ label: CMgs.format(langBundle, "imageManager"), name: "imageManager", type: "datasource:image" },
				{ label: CMgs.format(langBundle, "videoManager"), name: "videoManager", type: "datasource:video" }
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
					case "height" :					
						this.rteHeight = (prop.value === undefined || prop.value === '') ? 300 : parseInt(prop.value, 10);
						break;
					case "maxlength" :
						inputEl.maxlength = prop.value;
						break;
					case "forcePTags" :
						var forcePTags = (prop.value == "false") ? false : true;
						break;
					case "forceBRTags" :
						var forceBRTags = (prop.value == "true") ? true : false;
						break;
					case "forceRootBlockPTag" : 
						var forceRootBlockPTag = (prop.value == "false") ? false : "p";
						break;
				}
			}

			templates = rteConfig.templates && rteConfig.templates.template ? rteConfig.templates.template : null;

			// https://www.tiny.cloud/docs/plugins/
			pluginList = rteConfig.plugins;

			toolbarConfig1 = (rteConfig.toolbarItems1 && rteConfig.toolbarItems1.length !=0) ? 
				rteConfig.toolbarItems1 : "bold italic | bullist numlist";
			toolbarConfig2 = (rteConfig.toolbarItems2 && rteConfig.toolbarItems2.length !=0) ? rteConfig.toolbarItems2 : "";
			toolbarConfig3 = (rteConfig.toolbarItems3 && rteConfig.toolbarItems3.length !=0) ? rteConfig.toolbarItems3 : "";
			toolbarConfig4 = (rteConfig.toolbarItems4 && rteConfig.toolbarItems4.length !=0) ? rteConfig.toolbarItems4 : "";

			rteStylesheets = ( rteConfig.rteStylesheets && typeof rteConfig.rteStylesheets === 'object' ) 
				? rteConfig.rteStylesheets.link : null;

			rteStyleOverride = ( rteConfig.rteStyleOverride && typeof rteConfig.rteStylesheets === 'object' ) 
				? rteConfig.rteStyleOverride : null;
			
			editor = tinymce.init({
				selector: '#' + rteId,
				height: _thisControl.rteHeight,
				theme: 'silver',
				plugins: pluginList,
				toolbar1: toolbarConfig1,
				toolbar2: toolbarConfig2,
				toolbar3: toolbarConfig3,
				toolbar4: toolbarConfig4,
				image_advtab: true,
				encoding: 'xml',
				relative_urls : false,
				remove_script_host : false,
				convert_urls : true,
				readonly: _thisControl.readonly,
				force_p_newlines: forcePTags,
				force_br_newlines: forceBRTags,
				forced_root_block: forceRootBlockPTag,
				remove_trailing_brs: false,
				media_live_embeds: true,	

				menu: {
					tools: {title: 'Tools', items: 'tinymcespellchecker code acecode wordcount'},
				},

				automatic_uploads: true,
				file_picker_types: 'image media',
				file_picker_callback: function(cb, value, meta) {
					// meta contains info about type (image, media, etc). Used to properly add DS to dialogs.
					_thisControl.createControl(cb, meta);

				},

				templates: templates,

				content_css: rteStylesheets,
				content_style: rteStyleOverride,

				setup: function (editor) {
					editor.on('init', function (e) {
						amplify.publish('/field/init/completed');
						_thisControl.editor = editor;
						_thisControl._onChange(null, _thisControl);
						_thisControl._hideBars(this.editorContainer);
					});

					editor.on('focus', function (e) {
						_thisControl._showBars(this.editorContainer);
					});

					editor.on('blur', function (e) {
						_thisControl._hideBars(this.editorContainer);					
					});

					editor.on('keyup paste', function (e){
						_thisControl._onChangeVal(null, _thisControl);
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
			var datasourcesNames,
				imageManagerNames = this.imageManagerName,  // List of image datasource IDs, could be an array or a string
				videoManagerNames = this.videoManagerName,
				addContainerEl,
				tinyMCEContainer = $(".tox-dialog"),
				_self = this,
				type = meta.filetype == 'media' ? 'video' : meta.filetype;

			imageManagerNames = (!imageManagerNames) ? "" :
								(Array.isArray(imageManagerNames)) ? imageManagerNames.join(",") : imageManagerNames;  // Turn the list into a string
			videoManagerNames = (!videoManagerNames) ? "" :
								(Array.isArray(videoManagerNames)) ? videoManagerNames.join(",") : videoManagerNames;

			datasourcesNames = videoManagerNames === "" ? imageManagerNames : imageManagerNames + "," + videoManagerNames ;

			if(this.addContainerEl) {
				addContainerEl = this.addContainerEl;
				this.addContainerEl = null;
				$('.cstudio-form-control-image-picker-add-container').remove();
			}else{
				addContainerEl = document.createElement("div");
				tinyMCEContainer.append(addContainerEl);
				YAHOO.util.Dom.addClass(addContainerEl, 'cstudio-form-control-image-picker-add-container');
				this.addContainerEl = addContainerEl;

				addContainerEl.style.position = 'absolute';
				addContainerEl.style.right = '15px';
				addContainerEl.style.top = '113px';

				var datasourceMap = this.form.datasourceMap,
					datasourceDef = this.form.definition.datasources,
					addFunction = type === 'image' ? _self.addManagedImage : _self.addManagedVideo;		//video or image add function

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

						YAHOO.util.Event.on(itemEl, 'click', function() {
							_self.addContainerEl = null;
							$('.cstudio-form-control-image-picker-add-container').remove();

							addFunction(mapDatasource, cb);		//video or image add function
						}, itemEl);
					}
				}
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
						cb(imageData.previewUrl, { title: imageData.fileName });

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