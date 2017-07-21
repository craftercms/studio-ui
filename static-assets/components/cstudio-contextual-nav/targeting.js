/**
 * Preview Tools
 */
CStudioAuthoring.ContextualNav.TargetingMod = CStudioAuthoring.ContextualNav.TargetingMod || {

	initialized: false,
	
	/**
	 * initialize module
	 */
	initialize: function(config) {
		this.definePlugin();
		CStudioAuthoring.ContextualNav.TargetingNav.init();
	},
	
	definePlugin: function() {
		var YDom = YAHOO.util.Dom,
			YEvent = YAHOO.util.Event;
		/**
		 * WCM preview tools Contextual Nav Widget
		 */
		CStudioAuthoring.register({
			"ContextualNav.TargetingNav": {
				init: function() {
					if(CStudioAuthoringContext.isPreview == true) {
						this.render();
					}
					this.model = {};
				},

				bindEvents: function() {
					var me = this;

					$(document).on("keyup", function(e) {
						if (e.keyCode === 13) {	// enter
							var reportContainerEl = document.getElementById("cstudioPreviewAnalyticsOverlay");
							me.updateTargeting(reportContainerEl);
							$(document).off("keyup");
						}

						if (e.keyCode === 27) {	// esc
							var reportContainerEl = document.getElementById("cstudioPreviewAnalyticsOverlay");
							me.closeDialog(reportContainerEl);
							$(document).off("keyup");
						}
					});
				},
				
				render: function() {
					var me = this,
						el, containerEl, iconEl, iconLabel, ptoOn;

					el = YDom.get("acn-persona");
					containerEl = document.createElement("div");
					containerEl.id = "acn-persona-container";
                    YDom.addClass(containerEl, "nav-link nav-container");

                    iconEl = document.createElement("span");
                    iconEl.id = "acn-persona-image";
                    YDom.addClass(iconEl, "nav-icon fa fa-bullseye");

                    iconLabel = document.createElement("span");
                    YDom.addClass(iconLabel, "nav-label");
                    iconLabel.innerHTML = "Targeting";

					containerEl.appendChild(iconEl);
                    containerEl.appendChild(iconLabel);
					el.appendChild(containerEl);

                    containerEl.onclick = function() {
						me.getTargeting();
                    }

				},

				getTargeting: function() {
					var reportContainerEl = document.getElementById("cstudioPreviewAnalyticsOverlay"),
						me = this,
						model = this.model;

					if(reportContainerEl) {
						document.body.removeChild(reportContainerEl);
					}

					var reportContainerEl = document.createElement("div");
					reportContainerEl.id = "cstudioPreviewAnalyticsOverlay";
					YAHOO.util.Dom.addClass(reportContainerEl, "cstudio-analytics-overlay row");

					reportContainerEl.style.position = "fixed";
					reportContainerEl.style.width = "800px";
					reportContainerEl.style.height = "auto";
					reportContainerEl.style.minHeight = "300px";
					reportContainerEl.style.maxHeight = "445px";
					reportContainerEl.style.top = "96px";
					reportContainerEl.style.padding = "15px 15px 50px 15px";
					// reportContainerEl.style.paddingBottom = "50px";

					var x = (window.innerWidth / 2) - (reportContainerEl.offsetWidth / 2) - 400;
					reportContainerEl.style.left = x+"px";

					document.body.appendChild(reportContainerEl);

					var markup =
						"<div class='col-md-12'><h3 class='modal-title bold'>Targeting</h3></div>" +
						"<div class='col-md-2 tac'><span class='fa fa-bullseye' style='font-size: 110px; color: #000; margin-top: 15px;'></span></div>";

					reportContainerEl.innerHTML = markup;

					var targetingContainerEl = document.createElement("div");
					targetingContainerEl.id = "targeting-container";
					YAHOO.util.Dom.addClass(targetingContainerEl, "col-md-10 targeting-container");
					targetingContainerEl.style.cssText = "overflow-y: scroll; max-height: 349px;";
					targetingContainerEl.innerHTML = "<h3 class='bold'>User Properties</h2>";

					reportContainerEl.appendChild(targetingContainerEl);

					CStudioAuthoring.Service.lookupConfigurtion(CStudioAuthoringContext.site, '/targeting/targeting-config.xml', {
						success: function (config) {
							var properties = config.property,
								currentProp,
								controlContainer;

							me.initModel(properties, {		//update model and properties with current profile
								success: function(properties){
									//Create and append the options
									for (var i = 0; i < properties.length; i++) {
										currentProp = properties[i];

										controlContainer = document.createElement("div");
										YAHOO.util.Dom.addClass(controlContainer, "control-container clearfix");
										controlContainer.style.marginBottom = "15px";
										targetingContainerEl.appendChild(controlContainer);

										var labelSpan = document.createElement("span");
										YAHOO.util.Dom.addClass(labelSpan, "control-label bold");
										labelSpan.style.cssText = "min-width: 80px; display: inline-block; margin-right: 20px;";
										labelSpan.innerHTML = currentProp.label;
										targetingContainerEl.appendChild(controlContainer);
										controlContainer.appendChild(labelSpan);

										// <!-- valid types: dropdown, checkboxes, input -->

										switch (currentProp.type) {
											case "dropdown":
												YAHOO.util.Dom.addClass(controlContainer, "dropdown");

												var selectList = document.createElement("select");
												selectList.id = currentProp.name;
												selectList.style.width = "30%";
												controlContainer.appendChild(selectList);

												for(var j = 0; j < currentProp.possible_values.value.length; j++){
													var option = document.createElement("option");
													option.value = currentProp.possible_values.value[j];
													option.text = currentProp.possible_values.value[j];
													if(currentProp.default_value == option.value){
														option.selected = 'selected';
													}
													selectList.appendChild(option);
												}

												break;
											case "checkboxes":
												YAHOO.util.Dom.addClass(controlContainer, "checkboxes clearfix");
												labelSpan.style.float = "left";

												var checkBoxGroupContainer = document.createElement("div");
												YAHOO.util.Dom.addClass(checkBoxGroupContainer, "checkbox-group");
												checkBoxGroupContainer.id = currentProp.name;
												checkBoxGroupContainer.style.cssText = "float: left; max-width: calc(100% - 100px); width: 100%;";
												controlContainer.appendChild(checkBoxGroupContainer);

												var checkboxSelectAll = document.createElement("span"),
													checkbox;
												YAHOO.util.Dom.addClass(checkboxSelectAll, "checkbox select-all mt0");
												checkboxSelectAll.innerHTML =
													"<label for='" + currentProp.name + "-all'>" +
													"	<input type='checkbox' id='" + currentProp.name + "-all' class='select-all'>" +
													"	<span>Select All</span>" +
													"</label>";
												checkBoxGroupContainer.appendChild(checkboxSelectAll);

												var defVals = currentProp.default_value.split(','),
													checked;

												for(var j = 0; j < currentProp.possible_values.value.length; j++){
													checked = defVals.indexOf(currentProp.possible_values.value[j]) != -1 ? "checked" : "";

													checkbox = document.createElement("span");
													YAHOO.util.Dom.addClass(checkboxSelectAll, "checkbox");
													checkbox.innerHTML =
														"<label style='width: 50%;' for='" + currentProp.name + "-" + currentProp.possible_values.value[j] + "'>" +
														"	<input  " + checked + " type='checkbox' data-value='" + currentProp.possible_values.value[j] + "' id='" + currentProp.name + "-" + currentProp.possible_values.value[j] + "'>" +
														"	<span>" + currentProp.possible_values.value[j] + "</span>" +
														"</label>";
													checkBoxGroupContainer.appendChild(checkbox);
												}

												checkboxSelectAll.onclick = function() {
													var checkAll = $(this).find("input[type='checkbox']").is(":checked");
													var checkboxes = $(this.parentElement).find('input[type="checkbox"]:not(".select-all")');

													$.each(checkboxes, function(i, el){
														el.checked = checkAll;
													});
												};

												break;
											case "input":
												YAHOO.util.Dom.addClass(controlContainer, "input");

												var input = document.createElement("input");
												input.id = currentProp.name;
												input.value = currentProp.default_value;
												input.style.width = "30%";
												controlContainer.appendChild(input);

												break;
										}

										var description = document.createElement("span");
										YAHOO.util.Dom.addClass(description, "description");
										description.innerHTML = currentProp.description;

										description.style.cssText = "color: #999999; display: block; margin-left: 100px; text-align: justify; margin-top: 5px;";
										controlContainer.appendChild(description);

										var hint = document.createElement("span");
										YAHOO.util.Dom.addClass(hint, "hint");
										hint.innerHTML = currentProp.hint;
										hint.style.cssText = "color: #999999; margin-left: 100px; text-align: justify; margin-top: 5px;";
										controlContainer.appendChild(hint);

									}
								}
							});

						}
					});

					var actionButtonsContainer = document.createElement("div");
					actionButtonsContainer.style.cssText = "position: absolute; bottom: 15px; right: 15px;";
					YAHOO.util.Dom.addClass(actionButtonsContainer, "action-buttons");

					var clearBtn = document.createElement("a");
					YAHOO.util.Dom.addClass(clearBtn, "btn btn-primary mr10");
					clearBtn.innerHTML = "Clear";
					actionButtonsContainer.appendChild(clearBtn);
					clearBtn.onclick = function() {
						CStudioAuthoring.Service.lookupConfigurtion(CStudioAuthoringContext.site, '/targeting/targeting-config.xml', {
							success: function (config) {
								var properties = config.property,
									currentProp,
									controlEl;

								for (var j = 0; j < properties.length; j++) {
									currentProp = properties[j];
									controlEl = document.getElementById(currentProp.name);

									switch (currentProp.type) {
										case "dropdown":

											for(var x = 0; x < controlEl.options.length; x++){
												if(controlEl.options[x].value == currentProp.default_value){
													controlEl.options[x].selected = 'selected';
												}
											}

											break;
										case "checkboxes":
											var $checkboxes = $(controlEl).find("input[type='checkbox']:not('.select-all')");
											$checkboxes.attr("checked", false);

											var defVals = currentProp.default_value.split(','),
												checked;

											for(var y= 0; y < defVals.length; y++){
												var val = controlEl.id + "-" + defVals[y];
												$("#" + val).prop( "checked", true );
											}

											break;
										case "input":
											controlEl.value = currentProp.default_value;
											break;
									}
								}
							}
						});
					};

					var applyBtn = document.createElement("a");
					YAHOO.util.Dom.addClass(applyBtn, "btn btn-primary mr10");
					applyBtn.innerHTML = "Apply";
					actionButtonsContainer.appendChild(applyBtn);
					applyBtn.onclick = function() {
						me.updateTargeting(reportContainerEl);
					};

					this.bindEvents();

					var cancelBtn = document.createElement("a");
					YAHOO.util.Dom.addClass(cancelBtn, "btn btn-default");
					cancelBtn.innerHTML = "Cancel";
					actionButtonsContainer.appendChild(cancelBtn);
					cancelBtn.onclick = function() {
						me.closeDialog(reportContainerEl);
					};

					reportContainerEl.appendChild(actionButtonsContainer);

				},

				//update model from current form and save on profile
				updateTargeting: function(reportContainerEl) {
					this.updateModel();

					var serviceUri = "/api/1/profile/set",
						first = true,
						value,
						key;

					for (var property in this.model) {

						if(this.model.hasOwnProperty(property)){
							value = this.model[property];
							key = property;

							if(value){
								if(first){
									first = false;
									serviceUri += "?" + key + "=" + value;
								}else{
									serviceUri += "&" + key + "=" + value;
								}
							}
						}
					}

					serviceUri = serviceUri + "&" + new Date();

					YConnect.asyncRequest('GET', CStudioAuthoring.Service.createEngineServiceUri(encodeURI(serviceUri)), {
						success: function() {
							document.body.removeChild(reportContainerEl);

							if(CStudioAuthoringContext.isPreview){
								CStudioAuthoring.Operations.refreshPreview();
							}
						}
					});
				},

				closeDialog: function(reportContainerEl) {
					document.body.removeChild(reportContainerEl);
				},

				//model created from xml config file and currentProfile
				initModel: function(properties, callback) {
					var me = this,
						properties = properties;

					//properties from xml
					properties.forEach(function(item){
						me.model[item.name] = item.default_value ? item.default_value : "";
					});

					//properties from profile
					var serviceUri = "/api/1/profile/get?time=" + new Date();
					YConnect.asyncRequest('GET', CStudioAuthoring.Service.createEngineServiceUri(serviceUri), {
						success: function(oResponse) {
							var json = oResponse.responseText,
								currentProfile = eval("(" + json + ")");

							for (var property in currentProfile) {
								if(currentProfile.hasOwnProperty(property)){
									me.model[property] = currentProfile[property];
								}

								for(var x = 0; x < properties.length; x++){
									if(properties[x].name == property){
										properties[x].default_value = currentProfile[property];
									}
								}
							}

							callback.success(properties);
						}
					});
				},

				//get model from current form
				updateModel: function() {
					var me = this,
						test = $("#targeting-container .control-container"),
						key,
						value;

					$.each(test, function(index, element){
						if($(element).hasClass("dropdown")){
							key = $(element).find("select").attr("id");
							value = $(element).find("select option:selected").text();
						}else if($(element).hasClass("checkboxes")){
							key = $(element).find(".checkbox-group").attr("id");
							value = [];
							var checkedElements = $(element).find('.checkbox-group input[type="checkbox"]:not(".select-all"):checked');

							$.each(checkedElements, function(i, el){
								value.push($(el).attr("data-value"));
							});

						}else if($(element).hasClass("input")){
							key = $(element).find("input").attr("id");
							value = $(element).find("input").val();
						}

						me.model[key] = value;
					});
				}
			}
		});
	}
};

CStudioAuthoring.Module.moduleLoaded("targeting", CStudioAuthoring.ContextualNav.TargetingMod);
