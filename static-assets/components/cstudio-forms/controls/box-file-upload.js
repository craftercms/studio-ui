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

CStudioAuthoring.Utils.addCss('/static-assets/styles/box-file-upload.css');
CStudioAuthoring.Utils.addJavascript('https://cdn01.boxcdn.net/platform/elements/3.5.1/en-US/picker.js');

CStudioForms.Controls.BoxFileUpload = CStudioForms.Controls.BoxFileUpload ||  
function(id, form, owner, properties, constraints, readonly)  {
  this.owner = owner;
  this.owner.registerField(this);
  this.errors = []; 
  this.properties = properties;
  this.constraints = constraints;
  this.fileEl = null;
  this.inputEl = null;
  this.required = false;
  this.value = "_not-set";
  this.form = form;
  this.id = id;
  this.readonly = readonly;
  this.enable_upload = false;
  this.enable_multi = false;
  this.logo = "box";
  
  if(properties) {
    var required = constraints.find(function(property){ return property.name === "required"; });
    if(required) {
      this.required = required.value === "true";
    }
    var profile_id = properties.find(function(property){ return property.name === "profile_id"; });
    if(profile_id) {
      this.profile_id = profile_id.value;
    }
    var enable_upload = properties.find(function(property){ return property.name === "enable_upload"; });
    if(enable_upload) {
      this.enable_upload = enable_upload.value === "true";
    }
    var enable_multi = properties.find(function(property){ return property.name === "enable_multi_selection"; });
    if(enable_multi) {
      this.enable_multi = enable_multi.value;
    }
    var logo = properties.find(function(property){ return property.name === "logo"; });
    if(logo) {
      this.logo = logo.value;
    }
  }
  
  return this;
};

YAHOO.extend(CStudioForms.Controls.BoxFileUpload, CStudioForms.CStudioFormField, {
  
  getLabel: function() {
    return "Box File Upload";
  },
  
  getName: function() {
    return "box-file-upload";
  },

  setValue: function(value) {
    var validationResult = true,
        self=this;
    if(value) {
      this.value = value;
      this.form.updateModel(this.id, this.value);
      this.fileEl.innerHTML = value.map(function(f){ return "<span id='"+f.name+"'>box://" + f.name + "*" + "<a class='removeItemBox' data-id='"+f.id+"' ><i class='fa fa-trash'></i></a></span>"; }).join("<br/>")
      this.clearError("required");
        var _self;
        var removeItems = document.getElementsByClassName("removeItemBox");
        for (var i = 0; i < removeItems.length; i++) {
            removeItems[i].addEventListener('click', function(){
                _self = this;
                self.value = self.value.filter(function(el) {
                    return el.id !== _self.getAttribute("data-id");
                });
                self.setValue(self.value);
            });
        }

    } else if(this.required) {
      validationResult = false;
      this.setError("required", "Field is Required");
    }
    this.renderValidation(true, validationResult);
    this.owner.notifyValidation();
  },
  
  getValue: function() {
    return this.value;
  },
  
  getSupportedProperties: function() {
    return [
      { label: "Profile ID", name: "profile_id", type: "string", defaultValue: "box-default" },
      { label: "Enable Upload", name: "enable_upload", type: "boolean", defaultValue: false },
      { label: "Enable Multiple Selection", name: "enable_multi_selection", type: "boolean", defaultValue: false },
      { label: "Logo", name: "logo", type: "string", defaultValue: "box" }
    ];
  },
  
  getSupportedConstraints: function() {
    return [
      { label: CMgs.format(langBundle, "required"), name: "required", type: "boolean" }
    ];
  },
  
  render: function(config, containerEl, lastTwo) {    
    var titleEl = document.createElement("span");
		YAHOO.util.Dom.addClass(titleEl, "cstudio-form-field-title");
		titleEl.innerHTML = config.title;
    containerEl.appendChild(titleEl);
    
    var controlWidgetContainerEl = document.createElement("div");
		YAHOO.util.Dom.addClass(controlWidgetContainerEl, "cstudio-form-control-input-container");
    
    var validEl = document.createElement("span");
		YAHOO.util.Dom.addClass(validEl, "validation-hint");
		YAHOO.util.Dom.addClass(validEl, "cstudio-form-control-validation fa fa-check");
		controlWidgetContainerEl.appendChild(validEl);

    this.fileEl = document.createElement("p");
    YAHOO.util.Dom.addClass(this.fileEl, "itemsSelected");
    controlWidgetContainerEl.appendChild(this.fileEl);
    
    var picker = document.createElement("div");
    picker.id = "box-picker-" + this.id;
    picker.className = "box-picker";
    controlWidgetContainerEl.appendChild(picker);
    
    containerEl.appendChild(controlWidgetContainerEl);
    
    var self = this;
    var tokenUri = CStudioAuthoring.Service.createServiceUri("/api/1/services/api/1/box/token.json");
    tokenUri += "&site=" + CStudioAuthoringContext.site;
    tokenUri += "&profileId=" + this.profile_id;
    tokenUri += "&" + CStudioAuthoringContext.xsrfParameterName + "=" + CStudioAuthoringContext.xsrfToken;    
    YAHOO.util.Connect.asyncRequest("GET", tokenUri, {
        success: function(o) {
            var data = JSON.parse(o.responseText);
            var folderId = '0';
            var accessToken = data.accessToken;
            var filePicker = new Box.FilePicker();
            filePicker.addListener('choose', function(evt) {
                self.edited = true;
                var value = evt.map(function(e){
                    return { 'id': e.id, 'name': e.name };
                });

                if(Array.isArray(self.value) && self.value.length > 0){
                    var flag = true;
                    for(var i=0; i< self.value.length; i++){
                        flag = true;
                        for(var j=0; j< value.length; j++) {
                            if(self.value[i].id == value[j].id){
                                flag = false;
                            }
                        }
                        if(flag == true){
                            value.push(self.value[i]);
                        }

                    }
                }

                self.setValue(value);

            });
            filePicker.show(folderId, accessToken, {
                    logoUrl: self.logo,
                    container: '#box-picker-' + self.id,
                    maxSelectable: self.enable_multi !== "false" ? Infinity : 1,
                    canUpload: self.enable_upload,
                    canSetShareAccess: false,
                    canCreateNewFolder: self.enable_upload
            });
        }
    });
  }
  
});

CStudioAuthoring.Module.moduleLoaded("cstudio-forms-controls-box-file-upload", CStudioForms.Controls.BoxFileUpload);