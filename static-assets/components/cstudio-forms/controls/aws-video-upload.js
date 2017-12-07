CStudioForms.Controls.AWSVideoUpload = CStudioForms.Controls.AWSVideoUpload ||  
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
  
  if(properties) {
    var required = constraints.find(function(property){ return property.name === "required"; });
    if(required) {
      this.required = required.value === "true";
    }
    var profile_id = properties.find(function(property){ return property.name === "profile_id"; });
    if(profile_id) {
      this.profile_id = profile_id.value;
    }
  }
  
  return this;
};

YAHOO.extend(CStudioForms.Controls.AWSVideoUpload, CStudioForms.CStudioFormField, {
  
  getLabel: function() {
    return "AWS Video Upload";
  },
  
  getName: function() {
    return "aws-video-upload";
  },
  
  setValue: function(value) {
    var validationResult = true;
    if(value && value[0] && value[0].base_key) {
      this.value = value;
      this.form.updateModel(this.id, this.value);
      this.fileEl.innerHTML = "s3://" + value[0].output_bucket + "/" + value[0].base_key + "*";
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
      { label: "Profile ID", name: "profile_id", type: "string", defaultValue: "elastic-transcoder-default" }
    ];
  },
  
  getSupportedConstraints: function() {
    return [
      { label: CMgs.format(langBundle, "required"), name: "required", type: "boolean" }
    ];
  },
  
  _onChange: function(evt, obj) {
    var serviceUri = CStudioAuthoring.Service.createServiceUri("/api/1/services/api/1/aws/elastictranscoder/transcode.json");

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

    YAHOO.util.Connect.setForm("upload_form", true);
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
    formEl.id = "upload_form";

    var inputContainerEl = document.createElement("div");
    YAHOO.util.Dom.addClass(inputContainerEl, "cstudio-form-control-input-help-container");
    
    var inputEl = document.createElement("input");
		this.inputEl = inputEl;
    inputEl.type = "file";
    inputEl.name = "file";
		YAHOO.util.Dom.addClass(inputEl, "datum");
		YAHOO.util.Dom.addClass(inputEl, "cstudio-form-control-input");
    YAHOO.util.Event.on(inputEl, "change",  this._onChange, this);

    inputContainerEl.appendChild(inputEl);

    this.renderHelp(config, inputContainerEl);
    
    formEl.appendChild(inputContainerEl);
    
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
    
    controlWidgetContainerEl.appendChild(formEl);

    var descriptionEl = document.createElement("span");
    YAHOO.util.Dom.addClass(descriptionEl, 'description');
    YAHOO.util.Dom.addClass(descriptionEl, 'cstudio-form-field-description');
    descriptionEl.innerHTML = config.description;

    controlWidgetContainerEl.appendChild(descriptionEl);
    
    containerEl.appendChild(controlWidgetContainerEl);
  }
  
});

CStudioAuthoring.Module.moduleLoaded("cstudio-forms-controls-aws-video-upload", CStudioForms.Controls.AWSVideoUpload);