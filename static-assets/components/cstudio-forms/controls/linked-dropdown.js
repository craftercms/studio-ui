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

CStudioForms.Controls.LinkedDropdown =
  CStudioForms.Controls.LinkedDropdown ||
  function (id, form, owner, properties, constraints, readonly) {
    this.owner = owner;
    this.owner.registerField(this);
    this.errors = [];
    this.properties = properties;
    this.constraints = constraints;
    this.inputEl = null;
    this.countEl = null;
    this.required = false;
    this.value = '_not-set';
    this.form = form;
    this.id = id;
    this.depends = '';
    this.readonly = readonly;

    amplify.subscribe('/datasource/loaded', this, this.onDatasourceLoaded);

    return this;
  };

YAHOO.extend(CStudioForms.Controls.LinkedDropdown, CStudioForms.CStudioFormField, {
  getLabel: function () {
    return CMgs.format(langBundle, 'linkedDropdown');
  },

  _onChange: function (evt, obj) {
    if (obj.inputEl) obj.value = obj.inputEl.value;

    if (obj.required) {
      if (obj.value == '') {
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

  _onChangeVal: function (evt, obj) {
    obj.edited = true;
    obj._onChange(evt, obj);
  },

  onDatasourceLoaded: function (data) {
    if (this.datasourceName === data.name && !this.datasource) {
      var datasource = this.form.datasourceMap[this.datasourceName];
      this.datasource = datasource;
      datasource.getList(this.callback);
    }
  },

  render: function (config, containerEl) {
    // we need to make the general layout of a control inherit from common
    // you should be able to override it -- but most of the time it wil be the same
    containerEl.id = this.id;

    var datasource = null;
    var showEmptyValue = false;
    var _self = this;

    for (var i = 0; i < config.properties.length; i++) {
      var prop = config.properties[i];

      if (prop.name == 'datasource') {
        if (prop.value && prop.value != '') {
          this.datasourceName = Array.isArray(prop.value) ? prop.value[0] : prop.value;
          this.datasourceName = this.datasourceName.replace('["', '').replace('"]', '');
        }
      }

      if (prop.name == 'emptyvalue') {
        showEmptyValue = eval(prop.value);
      }

      if (prop.name == 'readonly' && prop.value == 'true') {
        this.readonly = true;
      }
    }

    var keyValueList = null;

    var cb = {
      success: function (list) {
        keyValueList = list;
        var titleEl = document.createElement('span');

        YAHOO.util.Dom.addClass(titleEl, 'cstudio-form-field-title');
        titleEl.textContent = config.title;

        var controlWidgetContainerEl = document.createElement('div');
        YAHOO.util.Dom.addClass(controlWidgetContainerEl, 'cstudio-form-control-linked-dropdown-container');

        var validEl = document.createElement('span');
        YAHOO.util.Dom.addClass(validEl, 'validation-hint');
        YAHOO.util.Dom.addClass(validEl, 'cstudio-form-control-validation fa fa-check');
        controlWidgetContainerEl.appendChild(validEl);

        var inputEl = document.createElement('select');
        _self.inputEl = inputEl;
        YAHOO.util.Dom.addClass(inputEl, 'datum');
        YAHOO.util.Dom.addClass(inputEl, 'cstudio-form-control-linked-dropdown');

        if (showEmptyValue) {
          var optionEl = document.createElement('option');
          optionEl.text = '';
          optionEl.value = '';
          inputEl.add(optionEl);
        }

        if (keyValueList) {
          for (var j = 0; j < keyValueList.length; j++) {
            var item = keyValueList[j];
            var optionEl = document.createElement('option');
            optionEl.text = item.value;
            optionEl.value = item.key;
            inputEl.add(optionEl);
          }
        }

        inputEl.value = _self.value == '_not-set' ? config.defaultValue : _self.value;

        controlWidgetContainerEl.appendChild(inputEl);

        if (_self.readonly == true) {
          inputEl.disabled = true;
        }

        YAHOO.util.Event.on(
          inputEl,
          'focus',
          function (evt, context) {
            context.form.setFocusedField(context);
          },
          _self
        );
        YAHOO.util.Event.on(inputEl, 'change', _self._onChangeVal, _self);

        _self.renderHelp(config, controlWidgetContainerEl);

        var descriptionEl = document.createElement('span');
        YAHOO.util.Dom.addClass(descriptionEl, 'description');
        YAHOO.util.Dom.addClass(descriptionEl, 'cstudio-form-field-description');
        descriptionEl.textContent = config.description;

        containerEl.appendChild(titleEl);
        containerEl.appendChild(controlWidgetContainerEl);
        containerEl.appendChild(descriptionEl);

        // TODO remove comment once CRAFTERCMS-41 is closed
        // This call only makes sense for user actioned changes and
        // it is actually wiping out the value of the model when initialising
        // _self._onChange(null, _self);
      }
    };

    var datasource = this.form.datasourceMap[this.datasourceName];
    if (datasource) {
      this.datasource = datasource;
      datasource.getList(cb);
    } else {
      this.callback = cb;
    }
  },

  getValue: function () {
    return this.value;
  },

  setValue: function (value) {
    this.value = value;
    if (this.inputEl) this.inputEl.value = value;
    this._onChange(null, this);
    this.edited = false;
  },

  getName: function () {
    return 'linked-dropdown';
  },

  getSupportedProperties: function () {
    return [
      { label: CMgs.format(langBundle, 'datasource'), name: 'datasource', type: 'datasource:item' },
      { label: CMgs.format(langBundle, 'allowEmptyValue'), name: 'emptyvalue', type: 'boolean' },
      { label: CMgs.format(langBundle, 'readonly'), name: 'readonly', type: 'boolean' },
      { label: CMgs.format(langBundle, 'dependsOn'), name: 'depends', type: 'string' }
    ];
  },

  getSupportedConstraints: function () {
    return [{ label: CMgs.format(langBundle, 'required'), name: 'required', type: 'boolean' }];
  }
});

CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-linked-dropdown', CStudioForms.Controls.LinkedDropdown);
