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

CStudioForms.Controls.Input =
  CStudioForms.Controls.Input ||
  function (id, form, owner, properties, constraints, readonly) {
    this.owner = owner;
    this.owner.registerField(this);
    this.errors = [];
    this.properties = properties;
    this.constraints = constraints;
    this.inputEl = null;
    this.patternErrEl = null;
    this.countEl = null;
    this.required = false;
    this.value = '_not-set';
    this.form = form;
    this.id = id;
    this.readonly = readonly;
    this.supportedPostFixes = ['_s', '_t'];
    this.escapeContent = false;

    this.formatMessage = CrafterCMSNext.i18n.intl.formatMessage;
    this.controlsCommonMessages = CrafterCMSNext.i18n.messages.controlsCommonMessages;

    return this;
  };

YAHOO.extend(CStudioForms.Controls.Input, CStudioForms.CStudioFormField, {
  getLabel: function () {
    return CMgs.format(langBundle, 'input');
  },

  _onChange: function (evt, obj) {
    obj.value = obj.inputEl.value;

    // Empty error state before new validation (for a clean state)
    YAHOO.util.Dom.removeClass(obj.patternErrEl, 'on');
    obj.clearError('pattern');

    var validationExist = false;
    var validationResult = true;
    if (obj.required) {
      if (obj.inputEl.value.trim() === '') {
        obj.setError('required', 'Field is Required');
        validationExist = true;
        validationResult = false;
      } else {
        obj.clearError('required');
        validationExist = true;
      }
    }

    if ((!validationExist && obj.inputEl.value != '') || (validationExist && validationResult)) {
      for (var i = 0; i < obj.constraints.length; i++) {
        var constraint = obj.constraints[i];
        if (constraint.name == 'pattern') {
          var regex = constraint.value;
          if (regex != '') {
            if (obj.inputEl.value.match(regex)) {
              // only when there is no other validation mark it as passed
              obj.clearError('pattern');
              YAHOO.util.Dom.removeClass(obj.patternErrEl, 'on');
              validationExist = true;
            } else {
              if (obj.inputEl.value != '') {
                YAHOO.util.Dom.addClass(obj.patternErrEl, 'on');
              }
              obj.setError('pattern', 'The value entered is not allowed in this field.');
              validationExist = true;
              validationResult = false;
            }
          }

          break;
        }
      }
    }
    // actual validation is checked by # of errors
    // renderValidation does not require the result being passed
    obj.renderValidation(validationExist, validationResult);
    obj.owner.notifyValidation();
    const valueToSet = obj.escapeContent ? CStudioForms.Util.escapeXml(obj.getValue()) : obj.getValue();
    obj.form.updateModel(obj.id, valueToSet);
  },

  _onChangeVal: function (evt, obj) {
    obj.edited = true;
    if (this._onChange) {
      this._onChange(evt, obj);
    }
  },

  /**
   * perform count calculation on keypress
   * @param evt event
   * @param el element
   */
  count: function (evt, countEl, el) {
    // 'this' is the input box
    el = el ? el : this;
    var text = el.value;

    var charCount = text.length ? text.length : el.textLength ? el.textLength : 0;
    var maxlength = el.maxlength && el.maxlength != '' ? el.maxlength : -1;

    if (maxlength != -1) {
      if (charCount > el.maxlength) {
        // truncate if exceeds max chars
        if (charCount > el.maxlength) {
          this.value = text.substr(0, el.maxlength);
          charCount = el.maxlength;
        }

        if (
          evt &&
          evt != null &&
          evt.keyCode != 8 &&
          evt.keyCode != 46 &&
          evt.keyCode != 37 &&
          evt.keyCode != 38 &&
          evt.keyCode != 39 &&
          evt.keyCode != 40 && // arrow keys
          evt.keyCode != 88 &&
          evt.keyCode != 86
        ) {
          // allow backspace and
          // delete key and arrow keys (37-40)
          // 86 -ctrl-v, 90-ctrl-z,
          if (evt) YAHOO.util.Event.stopEvent(evt);
        }
      }
    }

    if (maxlength != -1) {
      countEl.innerHTML = charCount + ' / ' + el.maxlength;
    } else {
      countEl.innerHTML = charCount;
    }
  },

  render: function (config, containerEl) {
    // we need to make the general layout of a control inherit from common
    // you should be able to override it -- but most of the time it wil be the same
    containerEl.id = this.id;

    var titleEl = document.createElement('span');

    YAHOO.util.Dom.addClass(titleEl, 'cstudio-form-field-title');
    titleEl.textContent = config.title;

    var controlWidgetContainerEl = document.createElement('div');
    YAHOO.util.Dom.addClass(controlWidgetContainerEl, 'cstudio-form-control-input-container');

    var validEl = document.createElement('span');
    YAHOO.util.Dom.addClass(validEl, 'validation-hint');
    YAHOO.util.Dom.addClass(validEl, 'cstudio-form-control-validation fa fa-check');

    var inputEl = document.createElement('input');
    this.inputEl = inputEl;
    YAHOO.util.Dom.addClass(inputEl, 'datum');
    YAHOO.util.Dom.addClass(inputEl, 'cstudio-form-control-input');

    const valueToSet = this.escapeContent ? CStudioForms.Util.unEscapeXml(this.value) : this.value;
    inputEl.value = this.value === '_not-set' ? config.defaultValue : valueToSet;
    controlWidgetContainerEl.appendChild(inputEl);

    YAHOO.util.Event.on(
      inputEl,
      'focus',
      function (evt, context) {
        context.form.setFocusedField(context);
      },
      this
    );

    YAHOO.util.Event.on(inputEl, 'change', this._onChangeVal, this);
    YAHOO.util.Event.on(inputEl, 'blur', this._onChange, this);

    for (var i = 0; i < config.properties.length; i++) {
      var prop = config.properties[i];

      if (prop.name == 'size') {
        inputEl.size = prop.value;
      }

      if (prop.name == 'maxlength') {
        inputEl.maxlength = prop.value;
      }

      if (prop.name == 'readonly' && prop.value == 'true') {
        this.readonly = true;
      }

      if (prop.name === 'escapeContent' && prop.value === 'true') {
        this.escapeContent = true;
      }
    }

    if (this.readonly == true) {
      inputEl.disabled = true;
    }

    var countEl = document.createElement('div');
    YAHOO.util.Dom.addClass(countEl, 'char-count');
    YAHOO.util.Dom.addClass(countEl, 'cstudio-form-control-input-count');
    controlWidgetContainerEl.appendChild(countEl);
    this.countEl = countEl;

    var patternErrEl = document.createElement('div');
    patternErrEl.innerHTML = 'The value entered is not allowed in this field.';
    YAHOO.util.Dom.addClass(patternErrEl, 'cstudio-form-control-input-url-err');
    controlWidgetContainerEl.appendChild(patternErrEl);
    this.patternErrEl = patternErrEl;

    YAHOO.util.Event.on(inputEl, 'keyup', this.count, countEl);
    YAHOO.util.Event.on(inputEl, 'keypress', this.count, countEl);
    YAHOO.util.Event.on(inputEl, 'mouseup', this.count, countEl);

    this.renderHelp(config, controlWidgetContainerEl);

    var descriptionEl = document.createElement('span');
    YAHOO.util.Dom.addClass(descriptionEl, 'description');
    YAHOO.util.Dom.addClass(descriptionEl, 'cstudio-form-field-description');
    descriptionEl.textContent = config.description;

    containerEl.appendChild(titleEl);
    containerEl.appendChild(validEl);
    containerEl.appendChild(controlWidgetContainerEl);
    containerEl.appendChild(descriptionEl);
  },

  getValue: function () {
    return this.value;
  },

  setValue: function (value) {
    const valueToSet = this.escapeContent ? CStudioForms.Util.unEscapeXml(value) : value;

    this.value = valueToSet;
    this.inputEl.value = valueToSet;
    this.count(null, this.countEl, this.inputEl);
    this._onChange(null, this);
    this.edited = false;
  },

  getName: function () {
    return 'input';
  },

  getSupportedProperties: function () {
    return [
      {
        label: CMgs.format(langBundle, 'displaySize'),
        name: 'size',
        type: 'int',
        defaultValue: '50'
      },
      {
        label: CMgs.format(langBundle, 'maxLength'),
        name: 'maxlength',
        type: 'int',
        defaultValue: '50'
      },
      { label: CMgs.format(langBundle, 'readonly'), name: 'readonly', type: 'boolean' },
      { label: 'Tokenize for Indexing', name: 'tokenize', type: 'boolean', defaultValue: 'false' },
      {
        label: this.formatMessage(this.controlsCommonMessages.escapeContent),
        name: 'escapeContent',
        type: 'boolean',
        defaultValue: 'false'
      }
    ];
  },

  getSupportedConstraints: function () {
    return [
      { label: CMgs.format(langBundle, 'required'), name: 'required', type: 'boolean' },
      { label: CMgs.format(langBundle, 'matchPattern'), name: 'pattern', type: 'string' }
    ];
  },

  getSupportedPostFixes: function () {
    return this.supportedPostFixes;
  }
});

CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-input', CStudioForms.Controls.Input);
