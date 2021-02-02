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

CStudioAuthoring.Utils.addCss('/static-assets/styles/box-file-upload.css');
CStudioAuthoring.Utils.addJavascript('https://cdn01.boxcdn.net/platform/elements/3.5.1/en-US/picker.js');

CStudioForms.Controls.BoxFileUpload =
  CStudioForms.Controls.BoxFileUpload ||
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
    this.enable_upload = false;
    this.enable_multi = false;
    this.logo = 'box';

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
      var enable_upload = properties.find(function(property) {
        return property.name === 'enable_upload';
      });
      if (enable_upload) {
        this.enable_upload = enable_upload.value === 'true';
      }
      var enable_multi = properties.find(function(property) {
        return property.name === 'enable_multi_selection';
      });
      if (enable_multi) {
        this.enable_multi = enable_multi.value;
      }
      var logo = properties.find(function(property) {
        return property.name === 'logo';
      });
      if (logo) {
        this.logo = logo.value;
      }
    }

    return this;
  };

YAHOO.extend(CStudioForms.Controls.BoxFileUpload, CStudioForms.CStudioFormField, {
  getLabel: function() {
    return 'Box File Upload';
  },

  getName: function() {
    return 'box-file-upload';
  },

  setValue: function(value) {
    var validationResult = true,
      self = this;
    if (value && value.length > 0) {
      value.forEach(function(element, index, array) {
        CrafterCMSNext.services.box
          .fetchBoxURL(CStudioAuthoringContext.site, self.profile_id, value[index].id, value[index].name)
          .subscribe(
            (url) => {
              value[index].url = url;

              if (index === value.length - 1) {
                self.value = value;
                self.form.updateModel(self.id, self.value);
                self.fileEl.innerHTML = value
                  .map(function(f) {
                    const name = CrafterCMSNext.util.string.escapeHTML(f.name);
                    return `<span id="${f.name}">${name}*<a class="removeItemBox" data-id="${f.id}"<i class='fa fa-trash'></i></span>`;
                  })
                  .join('<br/>');
                self.clearError('required');
                var _self;
                var removeItems = document.getElementsByClassName('removeItemBox');
                for (var i = 0; i < removeItems.length; i++) {
                  removeItems[i].addEventListener('click', function() {
                    _self = this;
                    self.value = self.value.filter(function(el) {
                      return el.id !== _self.getAttribute('data-id');
                    });
                    self.setValue(self.value);
                  });
                }
              }
              self.renderValidation(true, validationResult);
              self.owner.notifyValidation();
            },
            (response) => {
              console.log(response);
            }
          );
      });
    } else {
      self.value = value;
      self.form.updateModel(self.id, self.value);
      self.fileEl.innerHTML = '';
      self.clearError('required');
      if (this.required) {
        validationResult = false;
        this.setError('required', 'Field is Required');
        this.renderValidation(true, validationResult);
        this.owner.notifyValidation();
      }
    }
  },

  getValue: function() {
    return this.value;
  },

  getSupportedProperties: function() {
    return [
      { label: 'Profile ID', name: 'profile_id', type: 'string', defaultValue: 'box-default' },
      { label: 'Enable Upload', name: 'enable_upload', type: 'boolean', defaultValue: false },
      {
        label: 'Enable Multiple Selection',
        name: 'enable_multi_selection',
        type: 'boolean',
        defaultValue: false
      },
      { label: 'Logo', name: 'logo', type: 'string', defaultValue: 'box' }
    ];
  },

  getSupportedConstraints: function() {
    return [{ label: CMgs.format(langBundle, 'required'), name: 'required', type: 'boolean' }];
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

    this.fileEl = document.createElement('p');
    YAHOO.util.Dom.addClass(this.fileEl, 'itemsSelected');
    controlWidgetContainerEl.appendChild(this.fileEl);

    var picker = document.createElement('div');
    picker.id = 'box-picker-' + this.id.replace(/\|/g, '-');
    picker.className = 'box-picker';
    controlWidgetContainerEl.appendChild(picker);

    containerEl.appendChild(controlWidgetContainerEl);

    var self = this;
    CrafterCMSNext.services.box.fetchToken(CStudioAuthoringContext.site, this.profile_id).subscribe((accessToken) => {
      var folderId = '0';
      var filePicker = new Box.FilePicker();
      filePicker.addListener('choose', function(evt) {
        self.edited = true;
        var value = evt.map(function(e) {
          return { id: e.id, name: e.name };
        });

        if (Array.isArray(self.value) && self.value.length > 0) {
          var flag = true;
          for (var i = 0; i < self.value.length; i++) {
            flag = true;
            for (var j = 0; j < value.length; j++) {
              if (self.value[i].id == value[j].id) {
                flag = false;
              }
            }
            if (flag == true) {
              value.push(self.value[i]);
            }
          }
        }

        self.setValue(value);
      });
      filePicker.show(folderId, accessToken, {
        logoUrl: self.logo,
        container: '#box-picker-' + self.id.replace(/\|/g, '-'),
        maxSelectable: self.enable_multi !== 'false' ? Infinity : 1,
        canUpload: self.enable_upload,
        canSetShareAccess: false,
        canCreateNewFolder: self.enable_upload
      });
    });
  }
});

CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-box-file-upload', CStudioForms.Controls.BoxFileUpload);
