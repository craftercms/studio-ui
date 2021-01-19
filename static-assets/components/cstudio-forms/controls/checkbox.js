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

CStudioForms.Controls.Checkbox =
  CStudioForms.Controls.Checkbox ||
  function(id, form, owner, properties, constraints, readonly) {
    this.owner = owner;
    this.owner.registerField(this);
    this.errors = [];
    this.properties = properties;
    this.constraints = constraints;
    this.inputEl = null;
    this.required = false;
    this.value = '';
    this.form = form;
    this.id = id;
    this.readonly = readonly;
    this.supportedPostFixes = ['_b'];

    return this;
  };

YAHOO.extend(CStudioForms.Controls.Checkbox, CStudioForms.CStudioFormField, {
  getLabel: function() {
    return CMgs.format(langBundle, 'checkBox');
  },

  _onChange: function(evt, obj) {
    obj.value = obj.inputEl.checked;

    if (obj.required) {
      if (obj.inputEl.checked == false) {
        obj.setError('required', 'Field is Required');
        obj.renderValidation(true, false);
      } else {
        obj.clearError('required');
        obj.renderValidation(true, true);
      }
    } else {
      obj.renderValidation(false, true);
    }

    obj.owner.notifyValidation();
    obj.form.updateModel(obj.id, obj.getValue());
  },

  _onChangeVal: function(evt, obj) {
    obj.edited = true;
    obj._onChange(evt, obj);
  },

  render: function(config, containerEl) {
    // we need to make the general layout of a control inherit from common
    // you should be able to override it -- but most of the time it wil be the same
    containerEl.id = this.id;

    for (var i = 0; i < config.properties.length; i++) {
      var prop = config.properties[i];

      if (prop.name == 'readonly' && prop.value == 'true') {
        this.readonly = true;
      }
    }
    var _valueStr = this.value == '_not-set' ? config.defaultValue : this.value;
    var _value = _valueStr == 'true' || _valueStr == true ? true : false;

    var titleEl = document.createElement('span');

    YAHOO.util.Dom.addClass(titleEl, 'cstudio-form-field-title');
    titleEl.textContent = config.title;

    var controlWidgetContainerEl = document.createElement('div');
    YAHOO.util.Dom.addClass(controlWidgetContainerEl, 'cstudio-form-control-checkbox-container');

    var validEl = document.createElement('span');
    YAHOO.util.Dom.addClass(validEl, 'validation-hint');
    YAHOO.util.Dom.addClass(validEl, 'cstudio-form-control-validation fa fa-check');
    controlWidgetContainerEl.appendChild(validEl);

    var inputEl = document.createElement('input');
    inputEl.type = 'checkbox';
    inputEl.checked = _value;
    this.inputEl = inputEl;
    YAHOO.util.Dom.addClass(inputEl, 'datum');
    YAHOO.util.Dom.addClass(inputEl, 'cstudio-form-control-checkbox');

    controlWidgetContainerEl.appendChild(inputEl);

    YAHOO.util.Event.on(
      inputEl,
      'click',
      function(evt, context) {
        context.form.setFocusedField(context);
      },
      this
    );

    YAHOO.util.Event.on(inputEl, 'change', this._onChangeVal, this);

    if (this.readonly == true) {
      inputEl.disabled = true;
    }

    this.renderHelp(config, controlWidgetContainerEl);

    var descriptionEl = document.createElement('span');
    YAHOO.util.Dom.addClass(descriptionEl, 'description');
    YAHOO.util.Dom.addClass(descriptionEl, 'cstudio-form-field-description');
    descriptionEl.textContent = config.description;

    containerEl.appendChild(titleEl);
    containerEl.appendChild(controlWidgetContainerEl);
    containerEl.appendChild(descriptionEl);
  },

  getValue: function() {
    return this.value;
  },

  setValue: function(value) {
    this.value = value;
    this.inputEl.checked = this.value == 'true' || this.value == true ? true : false;
    this._onChange(null, this);
    this.edited = false;
  },

  getName: function() {
    return 'checkbox';
  },

  getSupportedProperties: function() {
    return [{ label: CMgs.format(langBundle, 'readonly'), name: 'readonly', type: 'boolean' }];
  },

  getSupportedConstraints: function() {
    return [{ label: CMgs.format(langBundle, 'required'), name: 'required', type: 'boolean' }];
  },

  getSupportedPostFixes: function() {
    return this.supportedPostFixes;
  }
});

CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-checkbox', CStudioForms.Controls.Checkbox);
