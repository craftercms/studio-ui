CStudioAuthoring.Module.requireModule(
	'codemirror',
	'/static-assets/components/cstudio-common/codemirror/lib/codemirror.js', {}, {
	moduleLoaded: function() {

		CStudioAuthoring.Utils.addJavascript("/static-assets/components/cstudio-common/codemirror/lib/util/formatting.js");
		CStudioAuthoring.Utils.addJavascript("/static-assets/components/cstudio-common/codemirror/mode/xml/xml.js");
		CStudioAuthoring.Utils.addJavascript("/static-assets/components/cstudio-common/codemirror/mode/javascript/javascript.js");
		CStudioAuthoring.Utils.addJavascript("/static-assets/components/cstudio-common/codemirror/mode/htmlmixed/htmlmixed.js");
		CStudioAuthoring.Utils.addJavascript("/static-assets/components/cstudio-common/codemirror/mode/css/css.js");
		CStudioAuthoring.Utils.addCss("/static-assets/components/cstudio-common/codemirror/lib/codemirror.css");
		CStudioAuthoring.Utils.addCss("/static-assets/themes/cstudioTheme/css/template-editor.css");

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
				var actions = [
					{ name: CMgs.format(formsLangBundle, "clearCache"), context: this, method: this.clearCache }
				];
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
									//"<button type='submit' id='save-button' class='edit-button'>Save</button>" + 
								"</div>" + 
							"</div>" + 
							"<div id='content-area'>" +
								"<div id='edit-window'>" + 
									"<textarea id='text-editor'></textarea>" +
								"</div>" + 
								"<div id='sample-window'>" +
									"<textarea id='sample-text'></textarea>" + 
								"</div>" + 
							"</div>" + 
						"</div>" + 
					"</div>";
				// set editor for configuration file 
				var editorEl = document.getElementById("text-editor");	
				var editorContainerEl = document.getElementById("edit-window");	
				this.setEditor(editorContainerEl, editorEl, false);
				// set editor for sample configuration file 
				var sampleEditorEl = document.getElementById("sample-text");	
				var sampleEditorContainerEl = document.getElementById("sample-window");	
				this.setEditor(sampleEditorContainerEl, sampleEditorEl, true);

				var itemSelectEl = document.getElementById("config-list");
				// add action buttons
				var buttonAreaEl = document.getElementById("config-buttons");
				this.addButtons(buttonAreaEl, itemSelectEl, editorEl.codeMirrorEditor);
				// set configuration dropdown
				var editAreaEl = document.getElementById("edit-area");
				this.loadConfigFiles(itemSelectEl, editAreaEl, editorEl.codeMirrorEditor, sampleEditorEl.codeMirrorEditor);

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
						selectedIndex = itemSelectEl.selectedIndex;

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
                                editor.clearHistory();
								CStudioAdminConsole.Tool.AdminConfig.prototype.expandEditor(editor);

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
									CStudioAdminConsole.Tool.AdminConfig.prototype.shrinkEditor(sampleEditor);
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

					} else {
						editAreaEl.style.display = 'none';
					}
				}; // end of change
			},
			
			/*
			* create CodeMirror editor
			*/
			setEditor: function (editorContainerEl, editorEl, readOnly) {
				// create edit area
				editorEl.style.backgroundColor= "white";
				editorEl.codeMirrorEditor = CodeMirror.fromTextArea(editorEl, {
					mode: 'xml',
					lineNumbers: true,
					lineWrapping: true,
					smartIndent: false
				});
				
				var codeEditorEl = YAHOO.util.Dom.getElementsByClassName("CodeMirror", null, editorContainerEl)[0];
				var codeEditorCanvasEl = YAHOO.util.Dom.getElementsByClassName("CodeMirror-wrap", null, editorContainerEl)[0];
						codeEditorCanvasEl.style.height = "100%";
						codeEditorCanvasEl.style.border = "thick solid #EEEEEE";
				var codeEditorScrollEl = YAHOO.util.Dom.getElementsByClassName("CodeMirror-scroll", null, editorContainerEl)[0];
						codeEditorScrollEl.style.height = "100%";
				
				if (readOnly) {
					codeEditorEl.style.backgroundColor = "#EEEEEE";
					editorEl.codeMirrorEditor.setOption("readOnly", true);
				} else {
					codeEditorEl.style.backgroundColor = "white";
				}

			},
			
			
			/*
			* add save, view sample and hide sample buttons
			*/
			addButtons: function (containerEl, itemSelectEl, editor) {
				containerEl.innerHTML = 
					"<button type='submit' id='save-button' class='btn btn-primary' style='margin-right:5px;'>"+CMgs.format(formsLangBundle, "save")+"</button>" +
					"<button type='submit' id='view-sample-button' class='btn btn-primary'>"+CMgs.format(formsLangBundle, "viewSample")+"</button>" +
					"<button type='submit' id='hide-sample-button' class='btn btn-primary'>"+CMgs.format(formsLangBundle, "hideSample")+"</button>";

				// add button actions
				var saveButtonEl = document.getElementById("save-button"),
					configFilesPath = CStudioAuthoring.Constants.CONFIG_FILES_PATH_ADMIN;

				// save the configuration file back to repo 
				saveButtonEl.onclick = function () { 
					var selectedIndex = itemSelectEl.selectedIndex;
					var saveCb = {
                        success: function() {
                            CStudioAuthoring.Utils.showNotification(CMgs.format(langBundle, "saved"), "top", "left", "success", 48, 197, "saveConf");
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

				}; // end of save
				
				var viewSampleButtonEl = document.getElementById("view-sample-button");
				var hideSampleButtonEl = document.getElementById("hide-sample-button");
				var sampleAreaEl = document.getElementById("sample-window");
                var contentArea = document.getElementById("content-area");
				
				viewSampleButtonEl.onclick = function () {
					CStudioAdminConsole.Tool.AdminConfig.prototype.shrinkEditorParent(contentArea);
					hideSampleButtonEl.style.display = 'inline';
					viewSampleButtonEl.style.display = 'none';
					sampleAreaEl.style.display = 'inline';
				};
				
				hideSampleButtonEl.onclick = function () {
					CStudioAdminConsole.Tool.AdminConfig.prototype.expandEditorParent(contentArea);
					hideSampleButtonEl.style.display = 'none';
					viewSampleButtonEl.style.display = 'inline';
					sampleAreaEl.style.display = 'none';
				};
				hideSampleButtonEl.style.display = 'none';
			},
			
			expandEditor: function(editor) {
				editor.setSize(this.width, this.height);
			},
			
			shrinkEditor: function(editor) {
				editor.setSize(this.width/2, this.height);
			},

            expandEditorParent: function(editor) {
                editor.classList.remove("sample");
            },

            shrinkEditorParent: function(editor) {
                editor.classList.add("sample");
            },

            clearCache: function() {
                var serviceUri = "/api/1/services/api/1/site/clear-configuration-cache.json?site="+CStudioAuthoringContext.site;

                var clearCacheCb = {
                    success: function() {
                        CStudioAuthoring.Operations.showSimpleDialog(
                            "cache-dialog",
                            CStudioAuthoring.Operations.simpleDialogTypeINFO,
                            CMgs.format(langBundle, "notification"),
                            CMgs.format(langBundle, "confCacheCleared"),
                            null, // use default button
                            YAHOO.widget.SimpleDialog.ICON_INFO,
                            "success studioDialog"
                        );
                    },

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

	
