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

(function () {
  function formatMessage(id) {
    return CrafterCMSNext.i18n.intl.formatMessage(CrafterCMSNext.i18n.messages.localeSelectorControlMessages[id]);
  }

  function formatLanguageMessage(id) {
    return CrafterCMSNext.i18n.messages.languages[id] ?? id;
  }

  CStudioForms.Controls.LocaleSelector = function (id, form, owner, properties, constraints, readonly) {
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
    this.readonly = readonly;
    return this;
  };

  YAHOO.extend(CStudioForms.Controls.LocaleSelector, CStudioForms.CStudioFormField, {
    getLabel: function () {
      return formatMessage('label');
    },

    validate: function (obj) {
      if (obj.inputEl) obj.value = obj.inputEl.value;
      if (obj.required) {
        if (obj.value === '') {
          obj.setError('required', formatMessage('requiredError'));
          obj.renderValidation(true, false);
        } else {
          obj.clearError('required');
          obj.renderValidation(true, true);
        }
      } else {
        obj.renderValidation(false, true);
      }
      obj.owner.notifyValidation();
    },

    _onChange: function (evt, obj) {
      this.validate(obj);
      obj.form.updateModel(obj.id, obj.getValue());
    },

    _onChangeVal: function (evt, obj) {
      obj.edited = true;
      obj._onChange(evt, obj);
    },

    render: function (config, containerEl) {
      var _self = this;
      containerEl.id = this.id;

      for (var i = 0; i < config.properties.length; i++) {
        var prop = config.properties[i];

        if (prop.name === 'readonly' && prop.value === 'true') {
          this.readonly = true;
        }
      }

      CrafterCMSNext.services.translation
        .fetchSiteLocales(CStudioAuthoringContext.site)
        .subscribe(({ localeCodes, defaultLocaleCode }) => {
          if (localeCodes) {
            var titleEl = document.createElement('span');

            YAHOO.util.Dom.addClass(titleEl, 'cstudio-form-field-title');
            titleEl.innerHTML = config.title;

            if (!_self.controlWidgetContainerEl) {
              var controlWidgetContainerEl = document.createElement('div');
              YAHOO.util.Dom.addClass(controlWidgetContainerEl, 'cstudio-form-control-dropdown-container');

              var validEl = document.createElement('span');
              YAHOO.util.Dom.addClass(validEl, 'validation-hint');
              YAHOO.util.Dom.addClass(validEl, 'cstudio-form-control-validation fa fa-check');
              controlWidgetContainerEl.appendChild(validEl);

              var inputEl = document.createElement('select');
              _self.inputEl = inputEl;
              YAHOO.util.Dom.addClass(inputEl, 'datum');
              YAHOO.util.Dom.addClass(inputEl, 'cstudio-form-control-dropdown');

              _self.controlWidgetContainerEl = controlWidgetContainerEl;
              _self.controlWidgetContainerEl.inputEl = inputEl;

              inputEl.value = _self.value === '_not-set' ? config.defaultValue : _self.value;
              _self.controlWidgetContainerEl.appendChild(inputEl);
              YAHOO.util.Event.on(
                inputEl,
                'focus',
                function (evt, context) {
                  context.form.setFocusedField(context);
                },
                _self
              );
              YAHOO.util.Event.on(inputEl, 'change', _self._onChangeVal, _self);

              _self.renderHelp(config, _self.controlWidgetContainerEl);

              var descriptionEl = document.createElement('span');
              YAHOO.util.Dom.addClass(descriptionEl, 'description');
              YAHOO.util.Dom.addClass(descriptionEl, 'cstudio-form-field-description');
              descriptionEl.innerHTML = config.description;

              containerEl.appendChild(titleEl);
              containerEl.appendChild(_self.controlWidgetContainerEl);
              containerEl.appendChild(descriptionEl);
            }

            if (_self.controlWidgetContainerEl.inputEl.options.length <= 0) {
              var optionElEmpty = document.createElement('option');
              optionElEmpty.classList.add('hide');
              optionElEmpty.disabled = true;
              optionElEmpty.selected = 'selected';
              _self.controlWidgetContainerEl.inputEl.add(optionElEmpty);
            }

            localeCodes.forEach((localeCode) => {
              var optionEl = document.createElement('option');
              optionEl.text = formatLanguageMessage(localeCode);
              optionEl.value = localeCode;
              _self.controlWidgetContainerEl.inputEl.add(optionEl);
            });

            if (_self.readonly === true) {
              inputEl.disabled = true;
            }

            var savedValue = _self.getValue();
            var configValue = savedValue && savedValue !== '' ? savedValue : defaultLocaleCode;

            for (var x = 0; x < _self.inputEl.options.length; x++) {
              if (_self.inputEl.options[x].value.toLowerCase() === configValue.toLowerCase()) {
                _self.inputEl.value = configValue; // set value
                _self.validate(_self);
              }
            }
          } else {
            containerEl.style.display = 'none';
          }
        });
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
      return 'locale-selector';
    },

    getSupportedProperties: function () {
      return [{ label: CMgs.format(langBundle, 'readonly'), name: 'readonly', type: 'boolean' }];
    },

    getSupportedConstraints: function () {
      return [{ label: CMgs.format(langBundle, 'required'), name: 'required', type: 'boolean' }];
    }
  });

  CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-locale-selector', CStudioForms.Controls.LocaleSelector);
})();
