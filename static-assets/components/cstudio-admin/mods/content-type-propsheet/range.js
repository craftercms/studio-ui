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

CStudioAdminConsole.Tool.ContentTypes.PropertyType.Range =
  CStudioAdminConsole.Tool.ContentTypes.PropertyType.Range ||
  function (fieldName, containerEl) {
    this.fieldName = fieldName;
    this.containerEl = containerEl;
    this.fieldValue = { exact: '', min: '', max: '' };
    this.formatMessage = CrafterCMSNext.i18n.intl.formatMessage;
    this.contentTypesMessages = CrafterCMSNext.i18n.messages.contentTypesMessages;
    return this;
  };

YAHOO.extend(
  CStudioAdminConsole.Tool.ContentTypes.PropertyType.Range,
  CStudioAdminConsole.Tool.ContentTypes.PropertyType,
  {
    render: function (value, updateFn) {
      var _self = this;
      var isExact = false;
      if (value) {
        try {
          var obj = typeof value == 'string' ? eval('(' + value + ')') : value;

          if (typeof obj == 'number') {
            isExact = true;
            this.fieldValue['exact'] = value;
          } else {
            if (!Array.isArray(obj)) {
              if (obj['exact'] && obj['exact'] != '') {
                isExact = true;
                this.fieldValue['exact'] = obj['exact'];
              } else {
                this.fieldValue['min'] = obj['min'];
                this.fieldValue['max'] = obj['max'];
              }
            } else {
              isExact = true;
            }
          }
          this.lastValidValue = JSON.parse(JSON.stringify(this.fieldValue));
        } catch (err) {}
      }

      var containerEl = this.containerEl;
      YDom.addClass(containerEl, 'range');

      var labelEl = YDom.getFirstChild(containerEl);

      var switchCtrl = document.createElement('a');
      YDom.addClass(switchCtrl, 'switch-icon');
      switchCtrl.innerHTML = '&nbsp;';
      labelEl.appendChild(switchCtrl);

      var ctrlsContainerEl = document.createElement('div');
      YDom.addClass(ctrlsContainerEl, 'type-range');

      var exactContainerEl = document.createElement('div');
      YDom.addClass(exactContainerEl, 'exact-value');
      if (!isExact) {
        YDom.addClass(exactContainerEl, 'hide');
      }
      var exactValEl = this.createControl('exact', updateFn);
      exactContainerEl.appendChild(exactValEl);

      var rangeContainerEl = document.createElement('div');
      YDom.addClass(rangeContainerEl, 'range-value');
      if (isExact) {
        YDom.addClass(rangeContainerEl, 'hide');
      }
      var minValEl = this.createControl('min', updateFn);
      var maxValEl = this.createControl('max', updateFn);
      YDom.addClass(maxValEl, 'last');
      rangeContainerEl.appendChild(minValEl);
      rangeContainerEl.appendChild(maxValEl);

      ctrlsContainerEl.appendChild(exactContainerEl);
      ctrlsContainerEl.appendChild(rangeContainerEl);
      containerEl.appendChild(ctrlsContainerEl);

      var switchFn = function (evt, el) {
        if (YDom.hasClass(exactContainerEl, 'hide')) {
          minValEl.resetValue();
          maxValEl.resetValue();
          YDom.removeClass(exactContainerEl, 'hide');
          YDom.addClass(rangeContainerEl, 'hide');
        } else {
          exactValEl.resetValue();
          YDom.removeClass(rangeContainerEl, 'hide');
          YDom.addClass(exactContainerEl, 'hide');
        }

        updateFn(null, {
          fieldName: _self.fieldName,
          value: _self.valueToJsonString(_self.fieldValue)
        });
      };

      YAHOO.util.Event.on(switchCtrl, 'click', switchFn, switchCtrl);

      // Update the model with the same value but with the correct format ( see valueToJsonString )
      updateFn(null, { fieldName: this.fieldName, value: this.valueToJsonString(this.fieldValue) });
    },

    createControl: function (label, updateFn) {
      var _self = this;

      var valueEl = document.createElement('div');
      YDom.addClass(valueEl, 'value');

      var valEl = document.createElement('input');

      var spanEl = document.createElement('span');
      spanEl.innerHTML = label;

      valueEl.appendChild(valEl);
      valueEl.appendChild(spanEl);

      valEl.value = this.fieldValue[label];

      var hideFn = function (evt, el) {
        var spanEl = YDom.getNextSibling(el);
        YDom.addClass(spanEl, 'hide');
      };

      var showFn = function (evt, el) {
        var spanEl = YDom.getNextSibling(el);
        YDom.removeClass(spanEl, 'hide');

        const currentValue = el.value;
        const isNumber = /^[+-]?\d+(\.\d+)?$/;
        const isValid = currentValue.match(isNumber) !== null || currentValue === '';
        const $element = $(el);
        if (isValid) {
          _self.fieldValue[label] = el.value;
          $element.removeClass('invalid');
        } else {
          $element.addClass('invalid');
          this.value = _self.fieldValue[label];
          CStudioAuthoring.Utils.showNotification(
            _self.formatMessage(_self.contentTypesMessages.invalidNumber, { value: currentValue }),
            'top',
            'right',
            'error',
            48,
            'int-property'
          );
        }
        updateFn(null, {
          fieldName: _self.fieldName,
          value: _self.valueToJsonString(_self.fieldValue)
        });
      };

      YAHOO.util.Event.on(valEl, 'focus', hideFn, valEl);
      YAHOO.util.Event.on(valEl, 'blur', showFn, valEl);

      valueEl.resetValue = function () {
        _self.fieldValue[label] = '';
        valEl.value = '';
      };

      return valueEl;
    },

    valueToJsonString: function (value) {
      var strValue = '';

      strValue = '{ "exact":"' + value['exact'] + '", ';
      strValue += '"min":"' + value['min'] + '", ';
      strValue += '"max":"' + value['max'] + '" }';

      return strValue;
    },

    getValue: function () {
      return this.valueEl.value;
    },

    isNumberKey: function (charCode) {
      return !(charCode != 43 && charCode > 31 && (charCode < 48 || charCode > 57));
    }
  }
);

CStudioAuthoring.Module.moduleLoaded(
  'cstudio-console-tools-content-types-proptype-range',
  CStudioAdminConsole.Tool.ContentTypes.PropertyType.Range
);
