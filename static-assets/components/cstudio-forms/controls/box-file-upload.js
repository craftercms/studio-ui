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
    if(value && value[0] && value[0].id) {
      this.value = value;
      this.form.updateModel(this.id, this.value);
      this.fileEl.innerHTML = "box://" + value[0].name + "*";
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
    ];
  },
  
  getSupportedConstraints: function() {
    return [
      { label: CMgs.format(langBundle, "required"), name: "required", type: "boolean" }
    ];
  },
  
  _onChange: function(evt, obj) {
    var serviceUri = CStudioAuthoring.Service.createServiceUri("/api/1/services/api/1/box/upload.json");

    var callback = { 
      cache: false,
      upload: function(o) {
        document.getElementById("cstudioSaveAndClose").disabled="";
        document.getElementById("cstudioSaveAndCloseDraft").disabled="";
        document.getElementById("cstudioSaveAndPreview").disabled="";
        document.getElementById("cancelBtn").disabled="";
        try {
          var data = JSON.parse(o.responseText);
          if(data.hasError) {
            CStudioAuthoring.Operations.showSimpleDialog(
                "error-dialog",
                CStudioAuthoring.Operations.simpleDialogTypeINFO,
                "Notification",
                data.errors.join(", "),
                null,
                YAHOO.widget.SimpleDialog.ICON_BLOCK,
                "studioDialog"
            );
          } else {
            obj.setValue(data);
            obj.edited = true;
          }
        } catch(err) {
          obj.fileEl.innerHTML = "";
          CStudioAuthoring.Operations.showSimpleDialog(
              "error-dialog",
              CStudioAuthoring.Operations.simpleDialogTypeINFO,
              "Notification",
              err.message,
              null,
              YAHOO.widget.SimpleDialog.ICON_BLOCK,
              "studioDialog"
          );
        }
      },
      failure: function(o) {
        obj.fileEl.innerHTML = "";
        document.getElementById("cstudioSaveAndClose").disabled="";
        document.getElementById("cstudioSaveAndCloseDraft").disabled="";
        document.getElementById("cstudioSaveAndPreview").disabled="";
        document.getElementById("cancelBtn").disabled="";
        CStudioAuthoring.Operations.showSimpleDialog(
            "error-dialog",
            CStudioAuthoring.Operations.simpleDialogTypeINFO,
            "Notification",
            "File upload failed due to a unknown error.",
            null,
            YAHOO.widget.SimpleDialog.ICON_BLOCK,
            "studioDialog"
        );
      }
    };

    YAHOO.util.Connect.setForm("upload_form_" + obj.id, true);
    serviceUri += "&" + CStudioAuthoringContext.xsrfParameterName + "=" + CStudioAuthoringContext.xsrfToken;    
    YAHOO.util.Connect.asyncRequest("POST", serviceUri, callback);
    document.getElementById("cstudioSaveAndClose").disabled="disabled";
    document.getElementById("cstudioSaveAndCloseDraft").disabled="disabled";
    document.getElementById("cstudioSaveAndPreview").disabled="disabled";
    document.getElementById("cancelBtn").disabled="disabled";
    obj.fileEl.innerHTML = "<i class=\"fa fa-spinner fa-spin\"/>";
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
    
    var formEl = document.createElement("form");
    formEl.id = "upload_form_" + this.id;
    
    var profileEl = document.createElement("input");
    profileEl.type = "hidden";
    profileEl.name = "profile";
    profileEl.value = this.profile_id;
    
    formEl.appendChild(profileEl);
    
    var siteEl = document.createElement("input");
    siteEl.type = "hidden";
    siteEl.name = "site";
    siteEl.value = CStudioAuthoringContext.site;
    
    formEl.appendChild(siteEl);
    
    var inputEl = document.createElement("input");
    this.inputEl = inputEl;
    inputEl.type = "file";
    inputEl.name = "file";
    YAHOO.util.Dom.addClass(inputEl, "datum");
    YAHOO.util.Dom.addClass(inputEl, "cstudio-form-control-input");
    YAHOO.util.Event.on(inputEl, "change",  this._onChange, this);
    
    formEl.appendChild(inputEl);
    
    controlWidgetContainerEl.appendChild(formEl);
    
    containerEl.appendChild(controlWidgetContainerEl);
    
    var picker = document.createElement("div");
    picker.id = "box-picker";
    picker.className = "box-picker";
    containerEl.appendChild(picker);
    
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
                self.setValue([{ 'id': evt[0].id, 'name': evt[0].name }])
            });
            filePicker.show(folderId, accessToken, {
                    logoUrl: 'box',
                    container: '#box-picker',
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