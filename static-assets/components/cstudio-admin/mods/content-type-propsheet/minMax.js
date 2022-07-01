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

CStudioAdminConsole.Tool.ContentTypes.PropertyType.MinMax =
  CStudioAdminConsole.Tool.ContentTypes.PropertyType.MinMax ||
  function (fieldName, containerEl) {
    this.fieldName = fieldName;
    this.containerEl = containerEl;
    this.formatMessage = CrafterCMSNext.i18n.intl.formatMessage;
    this.contentTypesMessages = CrafterCMSNext.i18n.messages.contentTypesMessages;
    return this;
  };

YAHOO.extend(
  CStudioAdminConsole.Tool.ContentTypes.PropertyType.MinMax,
  CStudioAdminConsole.Tool.ContentTypes.PropertyType,
  {
    render: function (value, updateFn, fName, itemId, defaultValue, typeControl, disabled, properties) {
      const _self = this;
      const mode = properties.mode;
      const containerEl = this.containerEl;
      const valueEl = document.createElement('input');
      valueEl.classList.add('content-type-property-sheet-property-value');
      valueEl.setAttribute('id', `${properties.type}-${properties.name}`);
      valueEl.value = value;
      valueEl.fieldName = this.fieldName;
      containerEl.appendChild(valueEl);

      $(valueEl).on('focus', function () {
        valueEl.setAttribute('type', 'number');
      });

      $(valueEl).on('blur', function (e) {
        valueEl.setAttribute('type', 'text');

        const counterpartEl = document.getElementById(`${properties.type}-${properties.counterpartControl}`);
        const currentValue = this.value;
        const isValueValid = !Boolean(counterpartEl?.value)
          ? true
          : mode === 'min'
          ? parseInt(currentValue) <= parseInt(counterpartEl.value)
          : parseInt(currentValue) >= parseInt(counterpartEl.value);

        if (!isValueValid) {
          CStudioAuthoring.Utils.showNotification(
            mode === 'min'
              ? _self.formatMessage(_self.contentTypesMessages.minValueError)
              : _self.formatMessage(_self.contentTypesMessages.maxValueError),
            'top',
            'right',
            'error',
            48,
            'int-property'
          );
          this.value = counterpartEl.value;
        }

        if (updateFieldFn) {
          updateFieldFn(e, this);
        }
      });

      if (updateFn) {
        var updateFieldFn = function (event, el) {
          updateFn(event, el);
          CStudioAdminConsole.Tool.ContentTypes.visualization.render();
        };
      }

      this.valueEl = valueEl;
    },

    getValue: function () {
      return this.valueEl.value;
    }
  }
);

CStudioAuthoring.Module.moduleLoaded(
  'cstudio-console-tools-content-types-proptype-minMax',
  CStudioAdminConsole.Tool.ContentTypes.PropertyType.MinMax
);
