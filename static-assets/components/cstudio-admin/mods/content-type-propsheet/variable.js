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

CStudioAdminConsole.Tool.ContentTypes.PropertyType.Variable = function (fieldName, containerEl) {
  this.fieldName = fieldName;
  this.containerEl = containerEl;
  return this;
};

YAHOO.extend(
  CStudioAdminConsole.Tool.ContentTypes.PropertyType.Variable,
  CStudioAdminConsole.Tool.ContentTypes.PropertyType,
  {
    render: function (value, updateFn, fName, itemId, defaultValue, type, disabled) {
      var containerEl = this.containerEl;
      var valueEl = document.createElement('input');
      YAHOO.util.Dom.addClass(valueEl, 'property-input-' + fName);
      valueEl.disabled = disabled;
      containerEl.appendChild(valueEl);
      valueEl.value = value;
      valueEl.fieldName = this.fieldName;

      if (updateFn) {
        var updateFieldFn = function (event, el) {
          if (fName === 'id' && this.value) {
            var input = YDom.getElementsByClassName('property-input-id')[0];

            if (CStudioAdminConsole.ignorePostfixFields.filter((field) => field.startsWith(input.value)).length === 0) {
              input.value = this.value.replace(/[-]/g, '_');
            } else {
              input.value = this.value;
            }
          }
          updateFn(event, el);
          var addPostfixes = '';
          switch (type) {
            case 'dropdown':
            case 'image-picker':
            case 'video-picker':
            case 'label':
            case 'input':
              addPostfixes = '_s';
              break;
            case 'numeric-input':
              addPostfixes = '_i';
              break;
            case 'textarea':
              addPostfixes = '_t';
              break;
            case 'repeat':
            case 'checkbox-group':
            case 'node-selector':
            case 'transcoded-video-picker':
              addPostfixes = '_o';
              break;
            case 'rte':
              addPostfixes = '_html';
              break;
            case 'time':
              addPostfixes = '_to';
              break;
            case 'date-time':
              addPostfixes = '_dt';
              break;
            case 'checkbox':
              addPostfixes = '_b';
              break;
          }
          if (YDom.hasClass(this, 'property-input-title') && !YDom.hasClass(this, 'no-update')) {
            var idDatasource = YDom.getElementsByClassName('property-input-name')[0]
              ? YDom.getElementsByClassName('property-input-name')[0]
              : YDom.getElementsByClassName('property-input-id')[0];
            if (idDatasource) {
              idDatasource.value = this.value.replace(/[^A-Za-z0-9-_]/g, '');
              idDatasource.value = idDatasource.value.replace(/[-]/g, '_');
              idDatasource.value =
                idDatasource.value.substr(0, 1).toLowerCase() + idDatasource.value.substr(1) + addPostfixes;

              updateFn(event, idDatasource);
            }
          }
          CStudioAdminConsole.Tool.ContentTypes.visualization.render();
        };

        var checkVarState = function (event, el) {
          var titleEl = YDom.getElementsByClassName('property-input-title');
          YAHOO.util.Dom.addClass(titleEl, 'no-update');

          if (this.value == '') {
            YAHOO.util.Dom.removeClass(titleEl, 'no-update');
          }
        };

        YAHOO.util.Event.on(valueEl, 'keyup', updateFieldFn, valueEl);

        $(valueEl).on('paste', function (e) {
          updateFieldFn(e, valueEl);
        });

        if ((fName == 'id' || fName == 'name') && value !== '') {
          var titleEl = YDom.getElementsByClassName('property-input-title');
          YAHOO.util.Dom.addClass(titleEl, 'no-update');
          YAHOO.util.Event.on(valueEl, 'keyup', checkVarState);
        } else if (fName == 'id' && value == '') {
          YAHOO.util.Event.on(valueEl, 'keyup', checkVarState);
        }
      }

      this.valueEl = valueEl;
    },

    getValue: function () {
      return this.valueEl.value;
    }
  }
);

CStudioAuthoring.Module.moduleLoaded(
  'cstudio-console-tools-content-types-proptype-variable',
  CStudioAdminConsole.Tool.ContentTypes.PropertyType.Variable
);
