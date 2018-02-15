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
      this.enable_upload = enable_upload.value;
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
    var validationResult = true;
    if(value) {
      this.value = value;
      this.form.updateModel(this.id, this.value);
      this.fileEl.innerHTML = value.map(function(f){ return "box://" + f.name + "*"; }).join("<br/>")
      this.clearError("required");
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

    this.fileEl = document.createElement("span");
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
                self.setValue(evt.map(function(e){
                    return { 'id': e.id, 'name': e.name };
                }));
            });
            filePicker.show(folderId, accessToken, {
                    logoUrl: self.logo,
                    container: '#box-picker-' + self.id,
                    maxSelectable: self.enable_multi? Infinity : 1,
                    canUpload: self.enable_upload,
                    canSetShareAccess: false,
                    canCreateNewFolder: self.enable_upload
            });
        }
    });
  }
  
});

CStudioAuthoring.Module.moduleLoaded("cstudio-forms-controls-box-file-upload", CStudioForms.Controls.BoxFileUpload);