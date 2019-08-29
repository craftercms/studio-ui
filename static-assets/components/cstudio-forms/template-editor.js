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

CStudioAuthoring.Module.requireModule(
	'ace',
	'/static-assets/components/cstudio-common/ace/ace.js', {}, {
		moduleLoaded: function() {

			CStudioAuthoring.Utils.addCss("/static-assets/themes/cstudioTheme/css/template-editor.css");
			CStudioAuthoring.Utils.addJavascript("/static-assets/components/cstudio-common/ace/ext-language_tools.js");

			CStudioAuthoring.Module.requireModule(
				"cstudio-forms-engine",
				'/static-assets/components/cstudio-forms/forms-engine.js',
				{  },
				{ moduleLoaded: function() {

					CStudioForms.TemplateEditor = CStudioForms.TemplateEditor ||  function()  {
							return this;
						}


					var CMgs = CStudioAuthoring.Messages;
					var contextNavLangBundle = CMgs.getBundle("contextnav", CStudioAuthoringContext.lang);

					CStudioForms.TemplateEditor.prototype = {

						render: function(templatePath, channel, onSaveCb, contentType, mode) {

							var getContentCb = {
								success: function(response) {
									this.context.renderTemplateEditor(templatePath, response, onSaveCb, contentType, mode);
								},
								failure: function() {
								},
								context: this
							};

							CStudioAuthoring.Service.getContent(templatePath, true, getContentCb, false);
						},

						renderTemplateEditor: function(templatePath, content, onSaveCb, contentType, isRead) {
							var permsCallback = {
								success: function(response) {
									var isWrite = CStudioAuthoring.Service.isWrite(response.permissions);

									var modalEl = document.createElement("div");
									modalEl.id = "cstudio-template-editor-container-modal";
									document.body.appendChild(modalEl);

									var containerEl = document.createElement("div");
									containerEl.id = "cstudio-template-editor-container";
									YAHOO.util.Dom.addClass(containerEl, 'seethrough');
									modalEl.appendChild(containerEl);
                                    var formHTML = '';

                                    if(isRead === "read"){
                                        formHTML +='<div id="cstudio-form-readonly-banner">READ ONLY</div>';

                                    }

									formHTML +=
										"<div id='template-editor-toolbar'><div id='template-editor-toolbar-variable'></div>" +
											"<div class='' style='position: absolute; right: 20px; top: 23px;'>" +
											"Theme: " +
											"<select id='themeSelector'>"+
												"<option value='chrome'>Light</option>" +
												"<option value='tomorrow_night'>Dark</option>"+
										  	"</select>" +
											"</div>" +
										"</div>" +
										"<div id='editor-container'>"+
										"</div>" +
										"<div id='template-editor-button-container'>";

									if(isWrite == true) {
										formHTML +=
											"<div class='edit-buttons-container'>" +
											"<div  id='template-editor-update-button' class='btn btn-primary cstudio-template-editor-button'>Update</div>" +
											"<div  id='template-editor-cancel-button' class='btn btn-default cstudio-template-editor-button'>Cancel</div>" +
											"<div/>";
									}
									else {
										formHTML +=
                                            "<div class='edit-buttons-container viewer'>" +
											"<div  id='template-editor-cancel-button' style='right: 120px;' class='btn btn-default cstudio-template-editor-button'>Close</div>";
                                            "<div/>";
									}

									formHTML +=
										"</div>";

									containerEl.innerHTML = formHTML;
									var editorContainerEl = document.getElementById("editor-container");
									var editorEl = document.createElement("pre");
									editorEl.id = "editorPreEl"
									editorEl.textContent= content;
									editorContainerEl.appendChild(editorEl);

									var langTools;

									var initEditorFn = function() {
										if(typeof ace === "undefined" ) {
											window.setTimeout(500, initEditorFn);
										}
										else {
											var modePath = "ace/mode/";
											var mode = modePath + "htmlmixed";

											if(templatePath.indexOf(".css") != -1) {
												mode = modePath + "css";
											}else if(templatePath.indexOf(".js") != -1) {
												mode = modePath + "javascript";
											}else if(templatePath.indexOf(".groovy") != -1){
												mode = modePath + "groovy";
											}else if(templatePath.indexOf(".ftl") != -1){
												mode = modePath + "ftl";
											}else if(templatePath.indexOf(".xml") != -1){
												mode = modePath + "xml";
											}

											langTools = ace.require("ace/ext/language_tools");
											var aceEditor = ace.edit("editorPreEl"),
												theme = CStudioAuthoring.Utils.Cookies.readCookie("templateEditorTheme") ? CStudioAuthoring.Utils.Cookies.readCookie("templateEditorTheme") : "chrome";

											aceEditor.setTheme("ace/theme/" + theme);
											aceEditor.session.setMode(mode);

											aceEditor.setOptions({
												enableBasicAutocompletion: true,
												enableSnippets: true,
												enableLiveAutocompletion: true,
												showPrintMargin: false,
												fontSize: "11pt"
											});

											$("#themeSelector").val(theme);

											$('#themeSelector').on('change', function() {
												aceEditor.setTheme("ace/theme/" + this.value);
												CStudioAuthoring.Utils.Cookies.createCookie("templateEditorTheme", this.value);
											})

											return aceEditor;
										}
									};

									var aceEditor = initEditorFn();

									var _getVarsFromSections = function(sections, parent, variables) {
										var variables = variables ? variables : [],
											_searchFields = function(section) {
												if(section.fields.field.length){
													$.each(section.fields.field, function() {
														if(this.id) {
															var value = this.title ? this.title : this.id,
																containsDash = (this.id.indexOf('-') > -1),
																id = containsDash ? "[\"" + this.id + "\"]" : this.id;

															if(parent){
																var parentVarContainsDash = (sections.id.indexOf('-') > -1),
																	parentId = parentVarContainsDash ? "[\"" + sections.id + "\"]" : sections.id;
																value = parent + " - " + value;
																id = containsDash ? parentId + ".item[0]" + id : parentId + ".item[0]." + id;
															}

															if(this.type == "node-selector") {
																variables.push(
																	{
																		"value" : id + ".item[0].key",
																		"label" : value + " - Key"
																	},
																	{
																		"value" : + id + ".item[0].value",
																		"label" : value + " - Value"
																	}
																);
															}else{
																variables.push({
																	"value" : id,
																	"label" : value
																});
																if(this.type == "repeat") {
																	_getVarsFromSections(this, value, variables);
																}
															}

														}
													});
												}else{
													var field = section.fields.field;
													if(field.id) {
														var value = field.title ? field.title : field.id,
															containsDash = (field.id.indexOf('-') > -1),
															id = containsDash ? "[\"" + field.id + "\"]" : field.id;

														if(parent){
															var parentVarContainsDash = (sections.id.indexOf('-') > -1),
																parentId = parentVarContainsDash ? "[\"" + sections.id + "\"]" : sections.id;
															value = parent + " - " + value;
															id = containsDash ? parentId + ".item[0]" + id : parentId + ".item[0]." + id;
														}

														if(field.type == "node-selector") {
															variables.push(
																{
																	"value" : id + ".item[0].key",
																	"label" : value + " - Key"
																},
																{
																	"value" : id + ".item[0].value",
																	"label" : value + " - Value"
																}
															);
														}else{
															variables.push({
																"value" : id,
																"label" : value
															});
															if(field.type == "repeat") {
																_getVarsFromSections(field, value, variables);
															}
														}
													}
												}
											}

										if(sections.length){
											$.each(sections, function() {	//puede haber solo una seccion
												_searchFields(this);
											});
										}else{
											_searchFields(sections);
										}

										return variables;
									};
									var _updateVarModel = function() {
										var varList = $("#var-names"),
											variableModel = $("#variable").find('option:selected'),
											selectedValue = $(varList).find('option:selected').val();

										//if val contains - ,
										var containsDash = (selectedValue.indexOf('-') > -1);
										if(containsDash){
											variableModel.val("${contentModel" + selectedValue + "}");
										}else {
											variableModel.val("${contentModel." + selectedValue + "}");
										}

									};
									var _addVarsSelect = function() {
										var selectVarList = document.createElement("select");
										selectVarList.id = "var-names";
										selectVarList.style.marginLeft = "10px";
										$("#variable").after(selectVarList);
										$(selectVarList).hide();

										//fill variables on select item
										var sectionsCallBack = {
											success: function(response) {
												var variables = _getVarsFromSections(response.sections.section);

												for (var i = 0; i < variables.length; i++) {
													var option = document.createElement("option");
													option.value = variables[i].value;
													option.text = variables[i].label;
													selectVarList.appendChild(option);
												}

												_updateVarModel();

												selectVarList.onchange = function() {
													_updateVarModel();
												};
											},
											failure: function() {

											}
										};

										var path = '/content-types' + contentType + '/form-definition.xml';
										CStudioAuthoring.Service.lookupConfigurtion(CStudioAuthoringContext.site, path, sectionsCallBack);
									};

									var templateEditorToolbarVarElt = document.getElementById("template-editor-toolbar-variable");
									var filename = templatePath.substring(templatePath.lastIndexOf("/")+1);
									var filenameH2 = document.createElement("p");
									filenameH2.id = 'fileName';
									filenameH2.innerHTML = filename;
									templateEditorToolbarVarElt.appendChild(filenameH2);

									if(templatePath.indexOf(".ftl") != -1 || templatePath.indexOf(".groovy")) {

										//Create array of options to be added
										var variableOpts = [];

										if(templatePath.indexOf(".groovy") != -1) {
											//Create array of options to be added
											variableOpts = [
												{label:"Access Content Model", value:"contentModel"},
												{label:"Access Template Model", value:"templateModel"},

												{label:"Current Site ID", value:"siteContext.siteName"},
												{label:"Request Parameters", value:"params"},
												{label:"Cookies", value:"cookies"},
												{label:"HTTP Request", value:"request"},
												{label:"HTTP Response", value:"response"},
												{label:"Session", value:"session"},
												{label:"Transform PATH to URL", value:"urlTransformationService.transform('storeUrlToRenderUrl', STOREURL)"},

												{label:"User Profile", value:"profile"},
												{label:"Current Authentication", value:"authentication"},

												{label:"Log an INFO", value:"logger.info('MY MESSAGE')"},
												{label:"Log an ERROR", value:"logger.error('MY MESSAGE')"},

												{label:"Search Service", value:"searchService"},
												{label:"Site Item Service", value:"siteItemService"},
												{label:"Profile Service", value:"profileService"},

												{label:"Get Spring Bean", value:"applicationContext.get(\"SPRING_BEAN_NAME\")"}
											];

											langTools = ace.require("ace/ext/language_tools");
											var customCompleter = {
												getCompletions: function(editor, session, pos, prefix, callback) {
													callback(null, Object.keys(variableOpts).map(function(key, index) {
														return {
															caption: variableOpts[key].label,
															value: variableOpts[key].value,
															meta: "Crafter Studio"
														};
													}));

												}
											}
											// aceEditor.completers = [staticWordCompleter]
											langTools.addCompleter(customCompleter);
										}
										else if(templatePath.indexOf(".ftl") != -1) {
											variableOpts = [
												{label:"Content variable", value:"${contentModel.VARIABLENAME}"},
												{label:"Request parameter", value:"${RequestParameters[\"PARAMNAME\"]!\"DEFAULT\"}"},
												{label:"Studio support", value:"<#import \"/templates/system/common/cstudio-support.ftl\" as studio />\r\n\t...\r\n\t<@studio.toolSupport />"},
												{label:"Dynamic navigation", value:"<#include \"/templates/web/navigation/navigation.ftl\">\r\n\t...\r\n\t<@renderNavigation \"/site/website\", 1 />"},
												{label:"Transform PATH to URL", value:"${urlTransformationService.transform('storeUrlToRenderUrl', STOREURL)}"},

												{label:"Incontext editing attribute (pencil)", value:"<@studio.iceAttr iceGroup=\"ICEGROUID\"/>"},
												{label:"Component DropZone attribute", value:"<@studio.componentContainerAttr target=\"TARGETID\" objectId=contentModel.objectId />"},
												{label:"Component attribute", value:"<@studio.componentAttr path=contentModel.storeUrl ice=false />"},
												{label:"Render list of components", value:"<#list contentModel.VARIABLENAME.item as module>\r\n\t<@renderComponent component=module />\r\n</#list>"},
												{label:"Iterate over a list of items and load content item", value:"<#list contentModel.VARIABLENAME.item as myItem>\r\n\t<#assign myContentItem =  siteItemService.getSiteItem(myItem.key) />\r\n\t${myContentItem.variableName}\r\n</#list>"},
												{label:"Iterate over repeat group", value:"<#list contentModel.VARIABLENAME.item as row>\r\n\t${row.VARIABLENAME}\r\n</#list>"},


												{label:"Freemarker value assignment", value:"<#assign imageSource = contentModel.image!\"\" />"},
												{label:"Freemarker value IF", value:"<#if CONDITION>\r\n\t...\r\n</#if>"},
												{label:"Freemarker value LOOP", value:"<#list ARRAY as value>\r\n\t${value_index}: ${value}\r\n</#list>"},
												{label:"Freemarker Fragment include", value:"<#include \"/templates/PATH\" />"},
												{label:"Freemarker Library import", value:"<#import \"/templates/PATH\" as NAMESPACE />"},

												{label:"HTML Page", value:"<#import \"/templates/system/common/cstudio-support.ftl\" as studio />\r\n<html lang=\"en\">\r\n<head>\r\n\t</head>\r\n\t<body>\r\n\t\t<h1>CONTENT HERE</h1>\r\n\t<@studio.toolSupport/>\r\n\t</body>\r\n</html>"},
												{label:"HTML Component", value:"<#import \"/templates/system/common/cstudio-support.ftl\" as studio />\r\n<div <@studio.componentAttr path=contentModel.storeUrl ice=false /> >\r\nCOMPONENT MARKUP</div>"},

											];

											langTools = ace.require("ace/ext/language_tools");
											var customCompleter = {
												getCompletions: function(editor, session, pos, prefix, callback) {
													callback(null, Object.keys(variableOpts).map(function(key, index) {
														// console.log(variableOpts[key].value);

														return {
															caption: variableOpts[key].label,
															value: variableOpts[key].value,
															meta: "Crafter Studio"
														};
													}));

												}
											}
											// aceEditor.completers = [staticWordCompleter]
											langTools.addCompleter(customCompleter);
										}

										//Create and append select list
										if (variableOpts.length > 0) {
											var variableLabel = document.createElement("label");
											variableLabel.innerHTML = CMgs.format(contextNavLangBundle, "variableLabel");
											templateEditorToolbarVarElt.appendChild(variableLabel);

											var selectList = document.createElement("select");
											selectList.id = "variable";
											templateEditorToolbarVarElt.appendChild(selectList);

											//Create and append the options
											for (var i = 0; i < variableOpts.length; i++) {
												var option = document.createElement("option");
												option.value = variableOpts[i].value;
												option.text = variableOpts[i].label;
												selectList.appendChild(option);
											}

											//Create and append add button
											var addButton = document.createElement("button");
											addButton.id = "addButtonVar";
											addButton.innerHTML = "Add Code";
											addButton.className = "btn btn-primary";
											templateEditorToolbarVarElt.appendChild(addButton);

											if(contentType && contentType !== ""){
												_addVarsSelect();

												var selectedLabel = $("#variable").find('option:selected').text(),
													$varsSelect = $("#var-names");
												if(selectedLabel == "Content variable"){
													$varsSelect.show();
												}

												selectList.onchange = function() {

													var selectedLabel = $(this).find('option:selected').text();

													if(selectedLabel == 'Content variable') {
														if($varsSelect.length){
															$varsSelect.show();
														}
													}else {
														$varsSelect.hide();
													}

												};
											}

											addButton.onclick = function() {
												var cursorPosition = aceEditor.getCursorPosition();
												// Insert text (second argument) with given position
												aceEditor.session.insert(cursorPosition, selectList.options[selectList.selectedIndex].value);
											};
										}
									}

									var cancelEdit = function() {
										var cancelEditServiceUrl = "/api/1/services/api/1/content/unlock-content.json"
											+ "?site=" + CStudioAuthoringContext.site
											+ "&path=" + encodeURI(templatePath);

										var cancelEditCb = {
											success: function(response) {
												modalEl.parentNode.removeChild(modalEl);
											},
											failure: function() {
											}
										};

										if (typeof CStudioAuthoring.editDisabled !== 'undefined') {
											for(var x = 0; x < window.parent.CStudioAuthoring.editDisabled.length; x++){
												window.parent.CStudioAuthoring.editDisabled[x].style.pointerEvents = "";
											}
											window.parent.CStudioAuthoring.editDisabled = [];
										}

										YAHOO.util.Connect.asyncRequest('GET', CStudioAuthoring.Service.createServiceUri(cancelEditServiceUrl), cancelEditCb);
									}

									var cancelEl = document.getElementById('template-editor-cancel-button');
									cancelEl.onclick = function() {
										cancelEdit();
									};

									var saveSvcCb = {
										success: function() {
											modalEl.parentNode.removeChild(modalEl);
											onSaveCb.success();
										},
										failure: function() {
										}
									};

									if(isWrite == true) {
										var saveEl = document.getElementById('template-editor-update-button');
										saveEl.onclick = function() {
											var value = aceEditor.getValue();
											var path = templatePath.substring(0, templatePath.lastIndexOf("/"));
											var filename = templatePath.substring(templatePath.lastIndexOf("/")+1);

											var writeServiceUrl = "/api/1/services/api/1/content/write-content.json" +
												"?site=" + CStudioAuthoringContext.site +
												"&phase=onSave" +
												"&path=" + path +
												"&fileName=" + encodeURI(filename) +
												"&user=" + CStudioAuthoringContext.user +
												"&unlock=true";

											YAHOO.util.Connect.setDefaultPostHeader(false);
											YAHOO.util.Connect.initHeader("Content-Type", "text/pain; charset=utf-8");
											YAHOO.util.Connect.initHeader(CStudioAuthoringContext.xsrfHeaderName, CrafterCMSNext.util.storage.getRequestForgeryToken());
											YAHOO.util.Connect.asyncRequest('POST', CStudioAuthoring.Service.createServiceUri(writeServiceUrl), saveSvcCb, value);
										};
									}

								},
								failure: function() {

								}
							}

							CStudioAuthoring.Service.getUserPermissions(
								CStudioAuthoringContext.site,
								templatePath,
								permsCallback);

						}
					};

					CStudioAuthoring.Module.moduleLoaded("cstudio-forms-template-editor",CStudioForms.TemplateEditor);
				}
				} );
		}
	} );
