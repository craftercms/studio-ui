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

CStudioAdminConsole.Tool.ContentTypes.PropertyType.RteConfiguration =
  CStudioAdminConsole.Tool.ContentTypes.PropertyType.RteConfiguration ||
  function (fieldName, containerEl, form, type) {
    this.fieldName = fieldName;
    this.containerEl = containerEl;
    this.form = form;
    return this;
  };

YAHOO.extend(
  CStudioAdminConsole.Tool.ContentTypes.PropertyType.RteConfiguration,
  CStudioAdminConsole.Tool.ContentTypes.PropertyType,
  {
    render: function (value, updateFn) {
      var _self = this;
      var form = this.form;
      var type = this['interface'];
      var containerEl = this.containerEl;
      var valueEl = document.createElement('input');
      YAHOO.util.Dom.addClass(valueEl, 'content-type-property-sheet-property-value');
      containerEl.appendChild(valueEl);
      valueEl.value = value;
      valueEl.fieldName = this.fieldName;
      this.valueEl = valueEl;

      var pickEl = document.createElement('select');
      YAHOO.util.Dom.addClass(pickEl, 'content-type-property-sheet-property-value');
      pickEl.style.display = 'none';
      containerEl.appendChild(pickEl);
      pickEl.context = this;

      // don't let the user type anything
      YAHOO.util.Event.on(
        valueEl,
        'keydown',
        function (evt) {
          YAHOO.util.Event.stopEvent(evt);
        },
        valueEl
      );
      YAHOO.util.Event.on(
        valueEl,
        'click',
        function (evt) {
          valueEl.style.display = 'none';
          pickEl.style.display = 'inline';

          var configCb = {
            success: function (config) {
              pickEl.options.length = 0;

              for (var j = 0; j < config.setup.length; j++) {
                setupId = config.setup[j].id;
                var option = new Option(setupId, setupId);
                pickEl.options[pickEl.options.length] = option;
                if (setupId == valueEl.value) {
                  option.selected = true;
                }
              }
            },
            failure: function () {}
          };

          CStudioAuthoring.Service.lookupConfigurtion(
            CStudioAuthoringContext.site,
            '/form-control-config/rte/rte-setup.xml',
            configCb
          );
        },
        pickEl
      );

      YAHOO.util.Event.on(
        pickEl,
        'change',
        function (evt) {
          valueEl.style.display = 'inline';
          pickEl.style.display = 'none';
          var value = pickEl.options[pickEl.selectedIndex].value;
          valueEl.value = value;
          updateFn(evt, { fieldName: valueEl.fieldName, value: value });
          CStudioAdminConsole.Tool.ContentTypes.visualization.render();
        },
        pickEl
      );
    },

    getValue: function () {
      return this.valueEl.value;
    }
  }
);

CStudioAuthoring.Module.moduleLoaded(
  'cstudio-console-tools-content-types-proptype-rteConfiguration',
  CStudioAdminConsole.Tool.ContentTypes.PropertyType.RteConfiguration
);
