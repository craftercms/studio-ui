/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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

CStudioForms.Controls.AWSFileUpload =
  CStudioForms.Controls.AWSFileUpload ||
  function (id, form, owner, properties, constraints, readonly) {
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
      var required = constraints.find(function (property) {
        return property.name === 'required';
      });
      if (required) {
        this.required = required.value === 'true';
      }
      var profile_id = properties.find(function (property) {
        return property.name === 'profile_id';
      });
      if (profile_id) {
        this.profile_id = profile_id.value;
      }
    }

    return this;
  };

YAHOO.extend(CStudioForms.Controls.AWSFileUpload, CStudioForms.CStudioFormField, {
  getLabel: function () {
    return 'AWS File Upload';
  },

  getName: function () {
    return 'aws-file-upload';
  },

  // Previously received Array<{ key; bucket }>
  setValue: function (value /*: string; */) {
    var validationResult = true;
    if (value) {
      this.value = value;
      this.fileEl.innerHTML = value;
      this.form.updateModel(this.id, this.value);
      this.clearError('required');
    } else if (this.required) {
      validationResult = false;
      this.setError('required', 'Field is Required');
    }
    this.renderValidation(true, validationResult);
    this.owner.notifyValidation();
  },

  getValue: function () {
    return this.value;
  },

  getSupportedProperties: function () {
    return [{ label: 'Profile ID', name: 'profile_id', type: 'string', defaultValue: 's3-default' }];
  },

  getSupportedConstraints: function () {
    return [{ label: CMgs.format(langBundle, 'required'), name: 'required', type: 'boolean' }];
  },

  _onChange: function (event, obj) {
    const dispatch = craftercms.getStore().dispatch;
    const file = event.target.files[0];
    const profileId = this.profile_id;
    if (file) {
      dispatch({ type: 'BLOCK_UI', payload: { message: 'Uploading...' } });
      const reader = new FileReader();
      reader.onload = (e) => {
        file.dataUrl = e.target.result;
        craftercms.services.content
          .uploadToS3(CStudioAuthoringContext.site, file, '/', profileId, CStudioAuthoringContext.xsrfParameterName)
          .subscribe({
            next(result) {
              if (result.type === 'complete') {
                dispatch({ type: 'UNBLOCK_UI' });
                obj.setValue(result.payload.body.item.url);
                obj.edited = true;
              } else {
                // Progress event...
              }
            },
            error(error) {
              const apiResponse = error?.body?.response;
              !apiResponse && console.error(error);
              dispatch({ type: 'UNBLOCK_UI' });
              dispatch({
                type: 'SHOW_ERROR_DIALOG',
                payload: {
                  error: apiResponse ?? {
                    message: 'An error occurred while uploading the file'
                  }
                }
              });
            }
          });
      };
      reader.readAsDataURL(file);
    }
  },

  render: function (config, containerEl, lastTwo) {
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
    this.fileEl.style.marginLeft = '10px';

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

    var inputEl = document.createElement('input');
    this.inputEl = inputEl;
    inputEl.type = 'file';
    inputEl.name = 'file';
    YAHOO.util.Dom.addClass(inputEl, 'datum');
    YAHOO.util.Dom.addClass(inputEl, 'cstudio-form-control-input');
    YAHOO.util.Event.on(inputEl, 'change', (e) => this._onChange(e, this));

    formEl.appendChild(inputEl);
    formEl.appendChild(this.fileEl);

    controlWidgetContainerEl.appendChild(formEl);

    containerEl.appendChild(controlWidgetContainerEl);
  }
});

CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-aws-file-upload', CStudioForms.Controls.AWSFileUpload);
