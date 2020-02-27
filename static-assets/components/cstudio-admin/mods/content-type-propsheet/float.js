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
 *
 *
 */

CStudioAdminConsole.Tool.ContentTypes.PropertyType.Float = CStudioAdminConsole.Tool.ContentTypes.PropertyType.Float ||  function(fieldName, containerEl)  {
  this.fieldName = fieldName;
  this.containerEl = containerEl;
  return this;
}

YAHOO.extend(CStudioAdminConsole.Tool.ContentTypes.PropertyType.Float, CStudioAdminConsole.Tool.ContentTypes.PropertyType, {
  render: function(value, updateFn) {
    var _self = this;
    var containerEl = this.containerEl;
    var valueEl = document.createElement("input");
    YAHOO.util.Dom.addClass(valueEl, "content-type-property-sheet-property-value");
    containerEl.appendChild(valueEl);
    valueEl.value = value;
    valueEl.fieldName = this.fieldName;

    var validFn = function(evt, el) {

      if (evt && evt != null) {
        var charCode = (evt.which) ? evt.which : evt.keyCode

        if(!_self.isNumberKey(charCode)) {
          if(evt)
            YAHOO.util.Event.stopEvent(evt);
        }
      }
    };

    YAHOO.util.Event.on(valueEl, 'keydown', validFn, valueEl);

    if(updateFn) {
      var updateFieldFn = function(event, el) {
        updateFn(event, el);
        CStudioAdminConsole.Tool.ContentTypes.visualization.render();
      };

      YAHOO.util.Event.on(valueEl, 'keyup', updateFieldFn, valueEl);
    }

    this.valueEl = valueEl;
  },

  getValue: function() {
    return this.valueEl.value;
  },

  isNumberKey: function(charCode) {
    // subtract sign (keyboard = 189, keyboard = 173 (firefox), numeric pad = 109)
    const isSubtractSign = (charCode === 109 || charCode === 189 || charCode === 173);

    // decimal sign (keyboard = 190, numeric pad = 110)
    const isDecimalSign = (charCode === 190 || charCode === 110);

    // charCode < 48 or > 57 = not numbers
    // charCode 43 = execute
    return !(charCode != 43 && charCode > 31 && (charCode < 48 || charCode > 57) && !isSubtractSign && !isDecimalSign);
  }

});

CStudioAuthoring.Module.moduleLoaded("cstudio-console-tools-content-types-proptype-float", CStudioAdminConsole.Tool.ContentTypes.PropertyType.Float);
