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

CStudioAdminConsole.Tool.ContentTypes.PropertyType.Dropdown =
  CStudioAdminConsole.Tool.ContentTypes.PropertyType.Dropdown ||
  function(fieldName, containerEl) {
    this.fieldName = fieldName;
    this.containerEl = containerEl;
    this.value = null;
    this.controlEl = null;
    return this;
  };

YAHOO.extend(
  CStudioAdminConsole.Tool.ContentTypes.PropertyType.Dropdown,
  CStudioAdminConsole.Tool.ContentTypes.PropertyType,
  {
    render: function(value, updateFn) {
      function createDropdown(value) {
        var ddEl = document.createElement('select');

        if (Array.isArray(value)) {
          value.forEach(function(optObj) {
            var optEl = document.createElement('option');

            if (optObj.hasOwnProperty('value') && optObj.hasOwnProperty('label') && optObj.hasOwnProperty('selected')) {
              optEl.value = optObj.value;
              optEl.innerHTML = optObj.label;
              optEl.selected = optObj.selected;
              ddEl.appendChild(optEl);
            } else {
              throw new TypeError(
                'Function getOptions (dropdown.js) : expected object must have the properties: value, label and selected'
              );
            }
          });
          return ddEl;
        } else {
          throw new TypeError('Function getOptions (dropdown.js) : expected value must be an array of objects');
        }
        // value must be an array of objects
      }

      var wrapperEl = document.createElement('div');
      var controlEl = createDropdown(value);

      this.value = value;
      this.controlEl = controlEl;
      controlEl.fieldName = this.fieldName;

      wrapperEl.appendChild(controlEl);
      this.containerEl.appendChild(wrapperEl);

      if (updateFn) {
        var updateFieldFn = function(event, _this) {
          _this.value = _this.getValue();
          updateFn(event, _this);
          CStudioAdminConsole.Tool.ContentTypes.visualization.render();
        };
        YAHOO.util.Event.on(controlEl, 'change', updateFieldFn, this, true);
      }
    },

    getValue: function() {
      var controlEl = this.controlEl,
        ddValue = this.value;

      // controlEl.options isn't a "real" array so it doesn't have the forEach function, but we'll borrow it from the Array prototype
      Array.prototype.forEach.call(controlEl.options, function(opt, idx) {
        ddValue[idx].selected = opt.selected; // Only update the selected value of each one of the options in the dropdown
      });
      return ddValue;
    }
  }
);

CStudioAuthoring.Module.moduleLoaded(
  'cstudio-console-tools-content-types-proptype-dropdown',
  CStudioAdminConsole.Tool.ContentTypes.PropertyType.Dropdown
);
