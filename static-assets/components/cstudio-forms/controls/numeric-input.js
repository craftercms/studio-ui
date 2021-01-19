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

(function() {
  const i18n = CrafterCMSNext.i18n,
    formatMessage = i18n.intl.formatMessage,
    numericInputControlMessages = i18n.messages.numericInputControlMessages;

  CStudioForms.Controls.numericInput =
    CStudioForms.Controls.numericInput ||
    function(id, form, owner, properties, constraints, readonly) {
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
      this.supportedPostFixes = ['_i', '_l', '_f', '_d'];
      this.inputTimeout = null;

      return this;
    };

  YAHOO.extend(CStudioForms.Controls.numericInput, CStudioForms.CStudioFormField, {
    getLabel: function() {
      return CMgs.format(langBundle, 'numericInput');
    },

    _onChange: function(evt, obj) {
      obj.value = obj.inputEl.value;

      // Empty error state before new validation (for a clean state)
      YAHOO.util.Dom.removeClass(obj.patternErrEl, 'on');
      YAHOO.util.Dom.removeClass(obj.numTypeErrEl, 'on');
      obj.clearError('pattern');

      var validationExist = false;
      var validationResult = true;
      if (obj.required) {
        if (obj.inputEl.value == '') {
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

          const numType = obj.id.substring(obj.id.indexOf('_'));
          let numTypeRegex;
          let numTypeErrMessage;
          if (numType === '_f' || numType === '_d') {
            // with decimals
            numTypeRegex = /^(\d|-)?(\d|,)*\.?\d*$/;
          } else {
            numTypeRegex = /^([+-]?[1-9]\d*|0)$/;
            numTypeErrMessage = formatMessage(numericInputControlMessages.noDecimalsErrMessage);
          }

          if (obj.inputEl.value.match(numTypeRegex)) {
            // only when there is no other validation mark it as passed
            obj.clearError('pattern');
            YAHOO.util.Dom.removeClass(obj.numTypeErrEl, 'on');
            validationExist = true;
          } else {
            if (obj.inputEl.value != '') {
              obj.numTypeErrEl.innerHTML = numTypeErrMessage;
              YAHOO.util.Dom.addClass(obj.numTypeErrEl, 'on');
            }
            obj.setError('pattern', 'numtype failed.');
            validationExist = true;
            validationResult = false;
          }
        }
      }
      // actual validation is checked by # of errors
      // renderValidation does not require the result being passed
      obj.renderValidation(validationExist, validationResult);
      obj.owner.notifyValidation();
      obj.form.updateModel(obj.id, obj.getValue());
    },

    _onChangeVal: function(evt, obj) {
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
    count: function(evt, countEl, el) {
      const self = this;
      clearTimeout(el.inputTimeout);

      el.inputTimeout = setTimeout(function() {
        const element = el ? el : self,
          max = element.maxValue,
          min = element.minValue;

        if (max != null && max !== '' && parseFloat(element.value) > max) {
          self.setValue(max);
        } else if (min != null && min !== '' && parseFloat(element.value) < min) {
          self.setValue(min);
        }
      }, 500);
    },

    render: function(config, containerEl) {
      const self = this;
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
      inputEl.setAttribute('type', 'number');
      this.inputEl = inputEl;
      YAHOO.util.Dom.addClass(inputEl, 'datum');
      YAHOO.util.Dom.addClass(inputEl, 'cstudio-form-control-input');
      inputEl.value = (this.value = '_not-set') ? config.defaultValue : this.value;
      controlWidgetContainerEl.appendChild(inputEl);

      YAHOO.util.Event.on(
        inputEl,
        'focus',
        function(evt, context) {
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

        if (prop.name == 'maxValue') {
          inputEl.maxValue = prop.value;
          inputEl.setAttribute('max', prop.value);
        }

        if (prop.name == 'minValue') {
          inputEl.minValue = prop.value;
          inputEl.setAttribute('min', prop.value);
        }

        if (prop.name == 'readonly' && prop.value == 'true') {
          this.readonly = true;
        }
      }

      inputEl.setAttribute('step', 'any');

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

      var numTypeErrEl = document.createElement('div');
      YAHOO.util.Dom.addClass(numTypeErrEl, 'cstudio-form-control-input-url-err');
      controlWidgetContainerEl.appendChild(numTypeErrEl);
      this.numTypeErrEl = numTypeErrEl;

      $(inputEl).on('keyup keypress mouseup', function(e) {
        self.count(e, countEl, this);
      });

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

    getValue: function() {
      return this.value;
    },

    setValue: function(value) {
      this.value = value;
      this.inputEl.value = value;

      this.count(null, this.countEl, this.inputEl);
      this._onChange(null, this);
      this.edited = false;
    },

    getName: function() {
      return 'numeric-input';
    },

    getSupportedProperties: function() {
      return [
        {
          label: CMgs.format(langBundle, 'displaySize'),
          name: 'size',
          type: 'int',
          defaultValue: '50'
        },
        {
          label: formatMessage(numericInputControlMessages.maximun),
          name: 'maxValue',
          type: 'float'
        },
        {
          label: formatMessage(numericInputControlMessages.minimun),
          name: 'minValue',
          type: 'float'
        },
        { label: CMgs.format(langBundle, 'readonly'), name: 'readonly', type: 'boolean' },
        { label: 'Tokenize for Indexing', name: 'tokenize', type: 'boolean', defaultValue: 'false' }
      ];
    },

    getSupportedConstraints: function() {
      return [
        { label: CMgs.format(langBundle, 'required'), name: 'required', type: 'boolean' },
        { label: CMgs.format(langBundle, 'matchPattern'), name: 'pattern', type: 'string' }
      ];
    },

    getSupportedPostFixes: function() {
      return this.supportedPostFixes;
    }
  });

  CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-numeric-input', CStudioForms.Controls.numericInput);
})();
