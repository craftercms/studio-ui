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

CStudioAdminConsole.Tool.ContentTypes.PropertyType.Bool =
  CStudioAdminConsole.Tool.ContentTypes.PropertyType.Bool ||
  function (fieldName, containerEl) {
    this.fieldName = fieldName;
    this.containerEl = containerEl;
    return this;
  };

YAHOO.extend(
  CStudioAdminConsole.Tool.ContentTypes.PropertyType.Bool,
  CStudioAdminConsole.Tool.ContentTypes.PropertyType,
  {
    render: function (value, updateFn, fName, itemId, defaultValue, typeControl, disabled, properties) {
      var _self = this;
      var containerEl = this.containerEl,
        wrapperEl = document.createElement('div'),
        valueEl = document.createElement('input');

      valueEl.type = 'checkbox';
      valueEl.fieldName = this.fieldName;
      properties && valueEl.setAttribute('data-id', properties.name);
      properties && valueEl.setAttribute('data-label', properties.label);

      wrapperEl.appendChild(valueEl);
      containerEl.appendChild(wrapperEl);

      if (updateFn) {
        var updateFieldFn = function (event, el) {
          _self.value = _self.getValue();
          updateFn(event, _self);
          CStudioAdminConsole.Tool.ContentTypes.visualization.render();
          valueEl.dispatchEvent(new Event('propertyUpdate', { event }));
        };

        YAHOO.util.Event.on(valueEl, 'change', updateFieldFn, valueEl);
      }

      if (properties && properties.dependsOn) {
        const dependency = document.querySelector(`[data-id="${properties.dependsOn}"]`);
        const dependencyStatus = _self.dependencyStatus(dependency);
        valueEl.checked = dependencyStatus.supported
          ? dependencyStatus.dependencyMet
            ? value == 'true'
            : false
          : value == 'true';

        _self.handleDependency(dependency, valueEl, properties, 'checked', false, updateFieldFn);
      } else {
        valueEl.checked = value == 'true';
      }

      this.valueEl = valueEl;
    },

    getValue: function () {
      return '' + (this.valueEl.checked == true);
    }
  }
);

CStudioAuthoring.Module.moduleLoaded(
  'cstudio-console-tools-content-types-proptype-boolean',
  CStudioAdminConsole.Tool.ContentTypes.PropertyType.Bool
);
