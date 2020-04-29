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

CStudioAdminConsole.Tool.ContentTypes.PropertyType.Int =
  CStudioAdminConsole.Tool.ContentTypes.PropertyType.Int ||
  function (fieldName, containerEl) {
    this.fieldName = fieldName;
    this.containerEl = containerEl;
    return this;
  };

YAHOO.extend(
  CStudioAdminConsole.Tool.ContentTypes.PropertyType.Int,
  CStudioAdminConsole.Tool.ContentTypes.PropertyType,
  {
    render: function (value, updateFn) {
      var _self = this;
      var containerEl = this.containerEl;
      var valueEl = document.createElement('input');
      YAHOO.util.Dom.addClass(valueEl, 'content-type-property-sheet-property-value');
      containerEl.appendChild(valueEl);
      valueEl.value = value;
      valueEl.fieldName = this.fieldName;

      var validFn = function (evt, el) {
        if (evt && evt != null) {
          if (!_self.isValidKey(evt)) {
            if (evt) YAHOO.util.Event.stopEvent(evt);
          }
        }
      };

      YAHOO.util.Event.on(valueEl, 'keydown', validFn, valueEl);

      if (updateFn) {
        var updateFieldFn = function (event, el) {
          updateFn(event, el);
          CStudioAdminConsole.Tool.ContentTypes.visualization.render();
        };

        YAHOO.util.Event.on(valueEl, 'keyup', updateFieldFn, valueEl);
      }

      this.valueEl = valueEl;
    },

    getValue: function () {
      return this.valueEl.value;
    },

    isValidKey: function (evt) {
      const key = evt.key,
        charCode = evt.which ? evt.which : evt.keyCode,
        isDelete = charCode === 8 || charCode === 46,
        isValid = !isNaN(parseFloat(key)) ||    // if it's a number
          key === '-' ||                        // is it's a minus sign
          key === '.' ||                        // if it's a decimal point
          isDelete ||                           // if it's delete/backspace
          evt.ctrlKey;                          // if it's a control key (ctrl + a ...)

      return isValid;
    }
  }
);

CStudioAuthoring.Module.moduleLoaded(
  'cstudio-console-tools-content-types-proptype-int',
  CStudioAdminConsole.Tool.ContentTypes.PropertyType.Int
);
