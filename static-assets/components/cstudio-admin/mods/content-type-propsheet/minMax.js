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
    this.value = { minValue: '', maxValue: '' };
    this.inputClassName = 'min-max-property';
    return this;
  };

YAHOO.extend(
  CStudioAdminConsole.Tool.ContentTypes.PropertyType.MinMax,
  CStudioAdminConsole.Tool.ContentTypes.PropertyType,
  {
    createInputEl: function (value, fieldName) {
      const el = document.createElement('input');
      el.classList.add('content-type-property-sheet-property-value', this.inputClassName);
      el.value = value;
      el.fieldName = fieldName;
      return el;
    },
    render: function (value, updateFn) {
      var _self = this;
      var containerEl = this.containerEl;
      this.value = value;

      const minValueEl = this.createInputEl(value.minValue ?? '', `min${this.fieldName}`);
      const maxValueEl = this.createInputEl(value.maxValue ?? '', `max${this.fieldName}`);
      containerEl.appendChild(minValueEl);
      containerEl.appendChild(maxValueEl);

      // region Events
      $(containerEl).on('focus', `.${this.inputClassName}`, function (e) {
        e.target.setAttribute('type', 'number');
      });

      $(minValueEl).on('blur', function (e) {
        minValueEl.setAttribute('type', 'text');

        const minValue =
          Boolean(maxValueEl.value) && parseInt(minValueEl.value) > parseInt(maxValueEl.value)
            ? maxValueEl.value
            : minValueEl.value;

        minValueEl.value = minValue;
        _self.value.minValue = minValue;

        if (updateFieldFn) {
          updateFieldFn(e);
        }
      });

      $(maxValueEl).on('blur', function (e) {
        maxValueEl.setAttribute('type', 'text');

        const maxValue =
          Boolean(maxValueEl.value) && parseInt(maxValueEl.value) < parseInt(minValueEl.value)
            ? minValueEl.value
            : maxValueEl.value;

        maxValueEl.value = maxValue;
        _self.value.maxValue = maxValue;

        if (updateFieldFn) {
          updateFieldFn(e);
        }
      });
      // endregion

      if (updateFn) {
        var updateFieldFn = function (event) {
          updateFn(event, {
            fieldName: _self.fieldName,
            value: _self.value
          });
          CStudioAdminConsole.Tool.ContentTypes.visualization.render();
        };
      }
    },

    getValue: function () {
      return this.value;
    }
  }
);

CStudioAuthoring.Module.moduleLoaded(
  'cstudio-console-tools-content-types-proptype-minMax',
  CStudioAdminConsole.Tool.ContentTypes.PropertyType.MinMax
);
