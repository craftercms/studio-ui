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
 *
 *
 */

CStudioAdminConsole.Tool.ContentTypes.PropertyType.Float =
  CStudioAdminConsole.Tool.ContentTypes.PropertyType.Float ||
  function (fieldName, containerEl) {
    this.fieldName = fieldName;
    this.containerEl = containerEl;
    this.formatMessage = CrafterCMSNext.i18n.intl.formatMessage;
    this.contentTypesMessages = CrafterCMSNext.i18n.messages.contentTypesMessages;
    return this;
  };

YAHOO.extend(
  CStudioAdminConsole.Tool.ContentTypes.PropertyType.Float,
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

      $(valueEl).on('focus', function () {
        valueEl.setAttribute('type', 'number');
      });

      $(valueEl).on('blur', function (e) {
        valueEl.setAttribute('type', 'text');
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
  'cstudio-console-tools-content-types-proptype-float',
  CStudioAdminConsole.Tool.ContentTypes.PropertyType.Float
);
