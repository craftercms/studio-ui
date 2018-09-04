CStudioAuthoring.Module.requireModule(
	'ace',
	'/static-assets/components/cstudio-common/ace/ace.js', {}, {
	moduleLoaded: function() {

		CStudioAuthoring.Utils.addCss("/static-assets/themes/cstudioTheme/css/template-editor.css");
		CStudioAuthoring.Utils.addJavascript("/static-assets/components/cstudio-common/ace/ext-language_tools.js");

		CStudioAuthoring.Utils.addCss("/static-assets/components/cstudio-admin/mods/admin-configurations.css");
		CStudioAdminConsole.Tool.AdminConfig = CStudioAdminConsole.Tool.AdminConfig ||  function(config, el)  {
			this.containerEl = el;
			this.config = config;
			this.types = [];
			return this;
		}

		/**
		 * Overarching class that drives the content type tools
 		*/
		YAHOO.extend(CStudioAdminConsole.Tool.AdminConfig, CStudioAdminConsole.Tool, {
			height: 600,
			
			renderWorkarea: function() {
				var workareaEl = document.getElementById("cstudio-admin-console-workarea");
		
				workareaEl.innerHTML =
					"<div id='config-area'>" +
					"</div>";
				var actions = [];
				CStudioAuthoring.ContextualNav.AdminConsoleNav.initActions(actions);
				this.renderJobsList();

				var historyEl = document.createElement("li");
				historyEl.className = 'acn-link';
				historyEl.id = 'historyEl';

				document.getElementById('activeContentActions').appendChild(historyEl);
			},
	
			renderJobsList: function() {
		
				var containerEl = document.getElementById("config-area");
				
				containerEl.innerHTML = 
					"<div class='configuration-window'>" +
						"<select id='config-list'>" +
					 		" <option value='' >"+CMgs.format(langBundle, "confTabSelectConf")+"</option>" +
						"</select>" +
						"<div id='edit-area'>" + 
							"<div id='menu-area'>" + 
								"<div id='config-description'>" + 
								"</div>" +
                                "<div id='config-buttons'>" +
                                "</div>" +
							"</div>" + 
							"<div id='content-area'>" +
								"<div id='edit-window'>" + 
								"</div>" +
								"<div id='sample-window'>" +
								"</div>" + 
							"</div>" + 
						"</div>" + 
					"</div>";
				// set editor for configuration file 	
				var editorContainerEl = document.getElementById("edit-window");	
				var editorEl = this.setEditor(editorContainerEl, false);
				// set editor for sample configuration file 
				var sampleEditorContainerEl = document.getElementById("sample-window");	
				var sampleEditorEl = this.setEditor(sampleEditorContainerEl, true);

				var itemSelectEl = document.getElementById("config-list");
				// add action buttons
                var buttonAreaEl = document.getElementById("config-buttons");
				this.addButtons(buttonAreaEl, itemSelectEl, editorEl);
				// set configuration dropdown
				var editAreaEl = document.getElementById("edit-area");
				this.loadConfigFiles(itemSelectEl, editAreaEl, editorEl, sampleEditorEl);

				// hide display area by default
				editAreaEl.style.display = 'none';
		
			},
			
			/*
			* populate the list of configuration files
			*/
			loadConfigFiles: function (itemSelectEl, editAreaEl, editor, sampleEditor) {
				// load configuration to get the configuration files list
				CStudioAuthoring.Service.lookupConfigurtion(
					CStudioAuthoringContext.site, 
					"/administration/config-list.xml", {
						success: function(config) {
							if (config.files.file && config.files.file.length) {
								var index = 1;
								for (var fileIndex in config.files.file) {
									var fileConfig = config.files.file[fileIndex];
									var option = new Option(CMgs.format(langBundle, fileConfig.title), fileConfig.path, false, false);
									option.setAttribute("description", CMgs.format(langBundle, fileConfig.description));
									option.setAttribute("sample", fileConfig.samplePath);
									itemSelectEl.options[index++] = option;
								}
							} else if (config.files.file) {
								var fileConfig = config.files.file;
								var option = new Option(CMgs.format(langBundle, fileConfig.title), fileConfig.path, false, false);
								option.setAttribute("description", CMgs.format(langBundle, fileConfig.description));
								option.setAttribute("sample", fileConfig.samplePath);
								itemSelectEl.options[1] = option;
							}
						},
						failure: function() {
                            CStudioAuthoring.Operations.showSimpleDialog(
                                "errorDialog-dialog",
                                CStudioAuthoring.Operations.simpleDialogTypeINFO,
                                CMgs.format(langBundle, "notification"),
                                CMgs.format(langBundle, "failConfig"),
                                null, // use default button
                                YAHOO.widget.SimpleDialog.ICON_BLOCK,
                                "studioDialog"
                            );
						}
					}
				);
			
				// add onchange behavior to display selected
				itemSelectEl.onchange = function() {
					var configFilesPath = CStudioAuthoring.Constants.CONFIG_FILES_PATH_ADMIN,
						selectedIndex = itemSelectEl.selectedIndex,
                        contentArea = document.getElementById("content-area");

					$('#historyEl').empty();

					if(selectedIndex != 0) {
						editAreaEl.style.display = 'block';
						var descriptionEl = document.getElementById("config-description");
						descriptionEl.innerHTML = itemSelectEl[selectedIndex].getAttribute("description");

						// load configuration into editor
						var url = '/studio/api/1/services/api/1/content/get-content-at-path.bin?site=' +
							CStudioAuthoringContext.site + '&path=' + configFilesPath + itemSelectEl[selectedIndex].value,
							elemPath = configFilesPath + itemSelectEl[selectedIndex].value;
						var getConfigCb = {
							success: function(response) {
								editor.setValue(response.responseText);
                                editor.clearSelection(); // This will remove the highlight over the text
                                CStudioAdminConsole.Tool.AdminConfig.prototype.expandEditorParent(contentArea);

								//add history

								var siteDropdownLangBundle = CMgs.getBundle("siteDropdown", CStudioAuthoringContext.lang);

								var historyLink = document.createElement("a");
								historyLink.className = 'cursor';
								var textnode = document.createTextNode(CMgs.format(siteDropdownLangBundle, "history"));         // Create a text node
								historyLink.appendChild(textnode);

								historyLink.onclick = function() {
									var content = {
										uri: elemPath,
										escaped: true
									};
									CStudioAuthoring.Operations.viewContentHistory(content);
								};

								document.getElementById('historyEl').append(historyLink);

							},
							failure: function() {
								editor.setValue("");
								CStudioAdminConsole.Tool.AdminConfig.prototype.expandEditor(editor);
							}
						};
						YAHOO.util.Connect.asyncRequest('GET', url, getConfigCb);

						//sample
						var sampleTextEl = document.getElementById("sample-text");

						// load sample configuration into view sample area
						var samplePath = itemSelectEl[selectedIndex].getAttribute("sample");
						var viewSampleButtonEl = document.getElementById("view-sample-button");
						if (samplePath != 'undefined' && samplePath != '') {
							var url = '/studio/api/1/services/api/1/content/get-content-at-path.bin?site=' +
								CStudioAuthoringContext.site + '&path=' + configFilesPath + itemSelectEl[selectedIndex].getAttribute("sample");

							var getSampleCb = {
								success: function(response) {
									var sampleAreaEl = document.getElementById("sample-window");
									sampleAreaEl.style.display = 'inline';
									sampleEditor.setValue(response.responseText);
									sampleEditor.clearSelection(); // This will remove the highlight over the text
									CStudioAdminConsole.Tool.AdminConfig.prototype.shrinkEditor(sampleEditor);
                                    CStudioAdminConsole.Tool.AdminConfig.prototype.shrinkEditor(editor);
									viewSampleButtonEl.style.display = 'inline';
									var hideSampleButtonEl = document.getElementById("hide-sample-button");
									hideSampleButtonEl.style.display = 'none';
									sampleAreaEl.style.display = 'none';
								},
								failure: function() {
									viewSampleButtonEl.style.display = 'none';
								}
							};
							YAHOO.util.Connect.asyncRequest('GET', url, getSampleCb);
						} else {
							viewSampleButtonEl.style.display = 'none';
						}

                        CStudioAdminConsole.CommandBar.show();

					} else {
						editAreaEl.style.display = 'none';
                        CStudioAdminConsole.CommandBar.hide();
					}
				}; // end of change
			},
			
			/*
			* create editor
			*/
			setEditor: function (editorContainerEl, readOnly) {
				var editorEl = document.createElement("pre");
				editorEl.id = readOnly ? "sample-text" : "text-editor";
				editorEl.className += "editor-text";
				editorContainerEl.appendChild(editorEl);
				
				var mode = "ace/mode/xml";

				var langTools = ace.require("ace/ext/language_tools");
				var aceEditor = ace.edit(editorEl.id);
				aceEditor.session.setMode(mode);
				aceEditor.setOptions({
					showPrintMargin: false,
					fontSize: "12px"
				});

				if (readOnly) {
					aceEditor.setReadOnly(true);
					aceEditor.container.style.background="#EEEEEE";
				} else {
					aceEditor.container.style.background="white";
				}

				return aceEditor;

			},
			
			
			/*
			* add save, view sample and hide sample buttons
			*/
			addButtons: function (containerEl, itemSelectEl, editor) {

                containerEl.innerHTML =
                    "<button type='submit' id='view-sample-button' class='btn btn-primary'>"+CMgs.format(formsLangBundle, "viewSample")+"</button>" +
                    "<button type='submit' id='hide-sample-button' class='btn btn-primary'>"+CMgs.format(formsLangBundle, "hideSample")+"</button>";

                CStudioAdminConsole.CommandBar.render([{label:CMgs.format(langBundle, "save"), class:"btn-primary", fn: function(){
                    saveFn();
                } },
                    {label:CMgs.format(langBundle, "cancel"), class:"btn-default", fn: function() {
                        me.renderWorkarea();
                        CStudioAdminConsole.CommandBar.hide();
                    } }
                ]);

                CStudioAdminConsole.CommandBar.hide();

                var viewSampleButtonEl = document.getElementById("view-sample-button");
                var hideSampleButtonEl = document.getElementById("hide-sample-button");
                var sampleAreaEl = document.getElementById("sample-window");
                var contentArea = document.getElementById("content-area");
                var me = this,
                    configFilesPath = CStudioAuthoring.Constants.CONFIG_FILES_PATH_ADMIN;
                hideSampleButtonEl.style.display = 'none';

                var saveFn = function(){
                    var selectedIndex = itemSelectEl.selectedIndex;
                    var saveCb = {
                        success: function() {
                            CStudioAuthoring.Utils.showNotification(CMgs.format(langBundle, "saved"), "top", "left", "success", 48, 197, "saveConf");
                            me.clearCache();
                        },
                        failure: function() {
                            CStudioAuthoring.Operations.showSimpleDialog(
                                "errorDialog-dialog",
                                CStudioAuthoring.Operations.simpleDialogTypeINFO,
                                CMgs.format(langBundle, "notification"),
                                CMgs.format(langBundle, "saveFailed"),
                                null, // use default button
                                YAHOO.widget.SimpleDialog.ICON_BLOCK,
                                "studioDialog"
                            );
                        }
                    };
                    var xml = editor.getValue();
                    var savePath = itemSelectEl[selectedIndex].value;
                    if (savePath != 'undefined' && savePath != '') {

                        var defPath =  configFilesPath + itemSelectEl[selectedIndex].value;

                        var url = "/api/1/services/api/1/site/write-configuration.json" +
                            "?site=" + CStudioAuthoringContext.site + "&path=" + defPath;

                        YAHOO.util.Connect.setDefaultPostHeader(false);
						YAHOO.util.Connect.initHeader("Content-Type", "application/xml; charset=utf-8");
						YAHOO.util.Connect.initHeader(CStudioAuthoringContext.xsrfHeaderName, CStudioAuthoringContext.xsrfToken);
                        YAHOO.util.Connect.asyncRequest('POST', CStudioAuthoring.Service.createServiceUri(url), saveCb, xml);
                    } else {
                        CStudioAuthoring.Operations.showSimpleDialog(
                            "errorDialog-dialog",
                            CStudioAuthoring.Operations.simpleDialogTypeINFO,
                            CMgs.format(langBundle, "notification"),
                            CMgs.format(langBundle, "noConfPathError"),
                            null, // use default button
                            YAHOO.widget.SimpleDialog.ICON_BLOCK,
                            "studioDialog"
                        );
                    }
                }

                viewSampleButtonEl.onclick = function () {
                    CStudioAdminConsole.Tool.AdminConfig.prototype.shrinkEditorParent(contentArea, editor);
                    hideSampleButtonEl.style.display = 'inline';
                    viewSampleButtonEl.style.display = 'none';
                    sampleAreaEl.style.display = 'inline';
                };

                hideSampleButtonEl.onclick = function () {
                    CStudioAdminConsole.Tool.AdminConfig.prototype.expandEditorParent(contentArea, editor);
                    hideSampleButtonEl.style.display = 'none';
                    viewSampleButtonEl.style.display = 'inline';
                    sampleAreaEl.style.display = 'none';
                };

			},
			
			expandEditor: function(editor) {
				var editorContainer = editor.container;
				editorContainer.style.width = this.width;
				editorContainer.style.height = this.height;
				editor.resize();
			},
			
			shrinkEditor: function(editor) {
				var editorContainer = editor.container;
				editorContainer.style.width = this.width/2;
				editorContainer.style.height = this.height;
				editor.resize();
			},

            expandEditorParent: function(contentArea, editor) {
                contentArea.classList.remove("sample");
                if (editor){
					var editorContainer = editor.container;
					editorContainer.style.width = "100%";
					editorContainer.style.height = this.height;
					editor.resize();
                }
            },

            shrinkEditorParent: function(contentArea, editor) {
                contentArea.classList.add("sample");
                if (editor){
					var editorContainer = editor.container;
					editorContainer.style.width = "100%";
					editorContainer.style.height = this.height;
					editor.resize();
                }
            },

            clearCache: function() {
                var serviceUri = "/api/1/services/api/1/site/clear-configuration-cache.json?site="+CStudioAuthoringContext.site;

                var clearCacheCb = {
                    success: function() {},

                    failure: function() {
                        CStudioAuthoring.Operations.showSimpleDialog(
                            "cacheError-dialog",
                            CStudioAuthoring.Operations.simpleDialogTypeINFO,
                            CMgs.format(langBundle, "notification"),
                            CMgs.format(langBundle, "clearCacheError"),
                            null, // use default button
                            YAHOO.widget.SimpleDialog.ICON_BLOCK,
                            "studioDialog"
                        );
                    }
                };

                YConnect.asyncRequest("GET", CStudioAuthoring.Service.createServiceUri(serviceUri), clearCacheCb);
            }
			
		});

	CStudioAuthoring.Module.moduleLoaded("cstudio-console-tools-admin-configurations",CStudioAdminConsole.Tool.AdminConfig);

}});

	
