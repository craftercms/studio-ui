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

CStudioForms.Controls.AWSVideoUpload =
  CStudioForms.Controls.AWSVideoUpload ||
  function(id, form, owner, properties, constraints, readonly) {
    this.owner = owner;
    this.owner.registerField(this);
    this.errors = [];
    this.properties = properties;
    this.constraints = constraints;
    this.fileEl = null;
    this.inputEl = null;
    this.required = false;
    this.value = '_not-set';
    this.form = form;
    this.id = id;
    this.readonly = readonly;

    if (properties) {
      var required = constraints.find(function(property) {
        return property.name === 'required';
      });
      if (required) {
        this.required = required.value === 'true';
      }
      var profile_id = properties.find(function(property) {
        return property.name === 'profile_id';
      });
      if (profile_id) {
        this.profile_id = profile_id.value;
      }
    }

    return this;
  };

YAHOO.extend(CStudioForms.Controls.AWSVideoUpload, CStudioForms.CStudioFormField, {
  getLabel: function() {
    return 'AWS Video Upload';
  },

  getName: function() {
    return 'aws-video-upload';
  },

  setValue: function(value) {
    var validationResult = true;
    if (value && value[0] && value[0].base_key) {
      this.value = value;
      this.form.updateModel(this.id, this.value);
      this.fileEl.innerHTML = 's3://' + value[0].output_bucket + '/' + value[0].base_key + '*';
      this.clearError('required');
    } else if (this.required) {
      validationResult = false;
      this.setError('required', 'Field is Required');
    }
    this.renderValidation(true, validationResult);
    this.owner.notifyValidation();
  },

  getValue: function() {
    return this.value;
  },

  getSupportedProperties: function() {
    return [
      {
        label: 'Service',
        name: 'service',
        type: 'dropdown',
        defaultValue: [
          { value: 'elastictranscoder', label: 'Elastic Transcoder', selected: true },
          { value: 'mediaconvert', label: 'MediaConvert', selected: false }
        ]
      },
      {
        label: 'Profile ID',
        name: 'profile_id',
        type: 'string',
        defaultValue: 'elastic-transcoder-default'
      }
    ];
  },

  getSupportedConstraints: function() {
    return [{ label: CMgs.format(langBundle, 'required'), name: 'required', type: 'boolean' }];
  },

  _onChange: function(evt, obj) {
    var service = JSON.parse(
      obj.properties.find(function(p) {
        return p.name === 'service';
      }).value
    ).find(function(p) {
      return p.selected;
    }).value;
    var url;
    if (service === 'elastictranscoder') {
      url = '/api/1/services/api/1/aws/elastictranscoder/transcode.json';
    } else if (service === 'mediaconvert') {
      url = '/api/1/services/api/1/aws/mediaconvert/upload.json';
    }
    var serviceUri = CStudioAuthoring.Service.createServiceUri(url);

    var callback = {
      cache: false,
      upload: function(o) {
        document.getElementById('cstudioSaveAndClose').disabled = '';
        document.getElementById('cstudioSaveAndCloseDraft').disabled = '';
        document.getElementById('cstudioSaveAndPreview').disabled = '';
        document.getElementById('cancelBtn').disabled = '';
        try {
          var data = JSON.parse(o.responseText);
          if (data.hasError) {
            CStudioAuthoring.Operations.showSimpleDialog(
              'error-dialog',
              CStudioAuthoring.Operations.simpleDialogTypeINFO,
              'Notification',
              data.errors.join(', '),
              null,
              YAHOO.widget.SimpleDialog.ICON_BLOCK,
              'studioDialog'
            );
          } else {
            obj.setValue(data);
            obj.edited = true;
          }
        } catch (err) {
          obj.fileEl.innerHTML = '';
          CStudioAuthoring.Operations.showSimpleDialog(
            'error-dialog',
            CStudioAuthoring.Operations.simpleDialogTypeINFO,
            'Notification',
            err.message,
            null,
            YAHOO.widget.SimpleDialog.ICON_BLOCK,
            'studioDialog'
          );
        }
      },
      failure: function(o) {
        obj.fileEl.innerHTML = '';
        document.getElementById('cstudioSaveAndClose').disabled = '';
        document.getElementById('cstudioSaveAndCloseDraft').disabled = '';
        document.getElementById('cstudioSaveAndPreview').disabled = '';
        document.getElementById('cancelBtn').disabled = '';
        CStudioAuthoring.Operations.showSimpleDialog(
          'error-dialog',
          CStudioAuthoring.Operations.simpleDialogTypeINFO,
          'Notification',
          'File upload failed due to a unknown error.',
          null,
          YAHOO.widget.SimpleDialog.ICON_BLOCK,
          'studioDialog'
        );
      }
    };

    YAHOO.util.Connect.setForm('upload_form_' + obj.id, true);
    serviceUri +=
      '&' + CStudioAuthoringContext.xsrfParameterName + '=' + CrafterCMSNext.util.auth.getRequestForgeryToken();
    YAHOO.util.Connect.asyncRequest('POST', serviceUri, callback);
    document.getElementById('cstudioSaveAndClose').disabled = 'disabled';
    document.getElementById('cstudioSaveAndCloseDraft').disabled = 'disabled';
    document.getElementById('cstudioSaveAndPreview').disabled = 'disabled';
    document.getElementById('cancelBtn').disabled = 'disabled';
    obj.fileEl.innerHTML = '<i class="fa fa-spinner fa-spin"/>';
  },

  render: function(config, containerEl, lastTwo) {
    var titleEl = document.createElement('span');
    YAHOO.util.Dom.addClass(titleEl, 'cstudio-form-field-title');
    titleEl.textContent = config.title;
    containerEl.appendChild(titleEl);

    var controlWidgetContainerEl = document.createElement('div');
    YAHOO.util.Dom.addClass(controlWidgetContainerEl, 'cstudio-form-control-input-container');

    var validEl = document.createElement('span');
    YAHOO.util.Dom.addClass(validEl, 'validation-hint');
    YAHOO.util.Dom.addClass(validEl, 'cstudio-form-control-validation fa fa-check');
    containerEl.appendChild(validEl);

    this.fileEl = document.createElement('span');
    controlWidgetContainerEl.appendChild(this.fileEl);

    var formEl = document.createElement('form');
    formEl.id = 'upload_form_' + this.id;

    var profileEl = document.createElement('input');
    profileEl.type = 'hidden';
    profileEl.name = 'profile';
    profileEl.value = this.profile_id;

    formEl.appendChild(profileEl);

    var siteEl = document.createElement('input');
    siteEl.type = 'hidden';
    siteEl.name = 'site';
    siteEl.value = CStudioAuthoringContext.site;

    formEl.appendChild(siteEl);

    var inputContainerEl = document.createElement('div');
    YAHOO.util.Dom.addClass(inputContainerEl, 'cstudio-form-control-input-help-container');

    var inputEl = document.createElement('input');
    this.inputEl = inputEl;
    inputEl.type = 'file';
    inputEl.name = 'file';
    YAHOO.util.Dom.addClass(inputEl, 'datum');
    YAHOO.util.Dom.addClass(inputEl, 'cstudio-form-control-input');
    YAHOO.util.Event.on(inputEl, 'change', this._onChange, this);

    inputContainerEl.appendChild(inputEl);

    this.renderHelp(config, inputContainerEl);

    formEl.appendChild(inputContainerEl);

    controlWidgetContainerEl.appendChild(formEl);

    var descriptionEl = document.createElement('span');
    YAHOO.util.Dom.addClass(descriptionEl, 'description');
    YAHOO.util.Dom.addClass(descriptionEl, 'cstudio-form-field-description');
    descriptionEl.textContent = config.description;

    controlWidgetContainerEl.appendChild(descriptionEl);

    containerEl.appendChild(controlWidgetContainerEl);
  }
});

CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-aws-video-upload', CStudioForms.Controls.AWSVideoUpload);
