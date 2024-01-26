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

!CStudioForms.Controls.AWSFileUpload &&
  (function () {
    CStudioForms.Controls.AWSFileUpload = function (id, form, owner, properties, constraints, readonly) {
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
      getLabel: () => 'AWS File Upload',
      getName: () => 'aws-file-upload',

      setValue: function (value) {
        let validationResult = true;
        const item = value?.[0];
        if (item) {
          const url = item.url ?? '';
          const name = item.name ?? item.key;
          const bucket = item.bucketName ? `${item.bucketName}/${item.prefix}` : item.bucket ?? '';
          this.value = [{ key: name, bucket, url }];
          this.fileEl.innerHTML = `<code>s3://${bucket}/${name}*</code><code>${url}</code>`;
          this.form.updateModel(this.id, this.value);
          this.previewEl.innerHTML = /\.(jpg|jpeg|png|gif|bmp|ico|svg|webp)$/i.test(url)
            ? `<img src="${url}" />`
            : /\.(mp4|webm|ogv)$/i.test(url)
              ? `<video controls muted><source src="${url}" type="video/${url.match(/\.(.+)$/)?.[1]}"></video>`
              : /\.(pdf|html|js|css|txt|json|md|jsx|ts|tsx|yaml|ftl)$/i.test(url)
                ? `<iframe src="${url}" />`
                : '(Preview not available)';
          this.clearError('required');
        } else if (this.required) {
          validationResult = false;
          this.setError('required', 'Field is Required');
        }
        this.renderValidation(true, validationResult);
        this.owner.notifyValidation();
      },

      getValue: () => this.value,

      getSupportedProperties: () => [
        { label: 'Profile ID', name: 'profile_id', type: 'string', defaultValue: 's3-default' }
      ],

      getSupportedConstraints: () => [
        { label: CMgs.format(langBundle, 'required'), name: 'required', type: 'boolean' }
      ],

      render: function (config, containerEl, lastTwo) {
        // language=html
        containerEl.innerHTML = `
          <span class="cstudio-form-field-title">${config.title}</span>
          <span class="validation-hint cstudio-form-control-validation fa fa-check"></span>
          <div class="aws-file-upload-control-container cstudio-form-control-input-container">
            <input
              type="file"
              name="file"
              class="datum cstudio-form-control-input"
            >
            <div data-name="fileEl" class="aws-file-upload-url-el"></div>
            <div data-name="previewEl" class="aws-file-upload-preview-el"></div>
          </div>
        `;
        this.fileEl = containerEl.querySelector('[data-name="fileEl"]');
        this.previewEl = containerEl.querySelector('[data-name="previewEl"]');
        var inputEl = (this.inputEl = containerEl.querySelector('input'));
        inputEl.addEventListener('change', (e) => this._onChange(e, this));
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
                    obj.setValue([result.payload.body.item]);
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
      }
    });

    CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-aws-file-upload', CStudioForms.Controls.AWSFileUpload);
  })();
