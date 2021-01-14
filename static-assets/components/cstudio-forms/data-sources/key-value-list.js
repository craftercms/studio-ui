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

CStudioForms.Datasources.KeyValueList =
  CStudioForms.Datasources.KeyValueList ||
  function(id, form, properties, constraints) {
    this.id = id;
    this.form = form;
    this.properties = properties;
    this.constraints = constraints;

    return this;
  };

YAHOO.extend(CStudioForms.Datasources.KeyValueList, CStudioForms.CStudioFormDatasource, {
  getLabel: function() {
    return CMgs.format(langBundle, 'staticKeyValuePairs');
  },

  add: function(control) {
    var _self = this;

    var addContainerEl = null;

    if (control.addContainerEl) {
      addContainerEl = control.addContainerEl;
      control.addContainerEl = null;
      control.containerEl.removeChild(addContainerEl);
    } else {
      addContainerEl = document.createElement('div');
      control.containerEl.appendChild(addContainerEl);
      YAHOO.util.Dom.addClass(addContainerEl, 'cstudio-form-control-node-selector-add-container');
      control.addContainerEl = addContainerEl;

      addContainerEl.style.left = control.addButtonEl.offsetLeft + 'px';
      addContainerEl.style.top = control.addButtonEl.offsetTop + 22 + 'px';

      var list = this.getList();
      var showKeys = this.showKeys();
      for (var i = 0; i < list.length; i++) {
        var itemEl = document.createElement('div');
        YAHOO.util.Dom.addClass(itemEl, 'cstudio-form-control-node-selector-add-container-item');
        itemEl.textContent = showKeys ? list[i].key : list[i].value;
        addContainerEl.appendChild(itemEl);
        itemEl._value = list[i].value;
        itemEl._key = list[i].key;

        YAHOO.util.Event.on(
          itemEl,
          'click',
          function() {
            control.insertItem(this._key, this._value);
            control._renderItems();
          },
          itemEl
        );
      }
    }
  },

  showKeys: function() {
    var showKeys = false;
    var properties = this.properties;

    for (var i = 0; i < properties.length; i++) {
      var prop = properties[i];

      if (prop.name == 'showkeys') {
        if (prop.value && prop.value != '') {
          showKeys = prop.value == 'true';
          break;
        }
      }
    }

    return showKeys;
  },

  getList: function(cb) {
    var value = [];
    var properties = this.properties;

    for (var i = 0; i < properties.length; i++) {
      var prop = properties[i];

      if (prop.name == 'options') {
        if (prop.value && prop.value != '') {
          value = prop.value;
          break;
        }
      }
    }

    if (cb != null && cb != undefined) {
      cb.success(eval(value));
    } else {
      return value;
    }
  },

  getInterface: function() {
    return 'item';
  },

  /*
   * Datasource controllers don't have direct access to the properties controls, only to their properties and their values.
   * Because the property control (dropdown) and the dataType property share the property value, the dataType value must stay
   * as an array of objects where each object corresponds to each one of the options of the control. In order to know exactly
   * which of the options in the control is currently selected, we loop through all of the objects in the dataType value
   * and check their selected value.
   */
  getDataType: function getDataType() {
    var val = null;

    this.properties.forEach(function(prop) {
      if (prop.name == 'dataType') {
        // return the value of the option currently selected
        var value = JSON.parse(prop.value);
        value.forEach(function(opt) {
          if (opt.selected) {
            val = opt.value;
          }
        });
      }
    });
    return val;
  },

  getName: function() {
    return 'key-value-list';
  },

  getSupportedProperties: function() {
    return [
      {
        label: CMgs.format(langBundle, 'dataType'),
        name: 'dataType',
        type: 'dropdown',
        defaultValue: [
          {
            // Update this array if the dropdown options need to be updated
            value: 'value',
            label: '',
            selected: true
          },
          {
            value: 'value_s',
            label: CMgs.format(langBundle, 'string'),
            selected: false
          },
          {
            value: 'value_i',
            label: CMgs.format(langBundle, 'integer'),
            selected: false
          },
          {
            value: 'value_f',
            label: CMgs.format(langBundle, 'float'),
            selected: false
          },
          {
            value: 'value_dt',
            label: CMgs.format(langBundle, 'date'),
            selected: false
          },
          {
            value: 'value_html',
            label: CMgs.format(langBundle, 'HTML'),
            selected: false
          }
        ]
      },
      {
        label: CMgs.format(langBundle, 'options'),
        name: 'options',
        type: 'keyValueMap'
      },
      {
        label: CMgs.format(langBundle, 'showKeys'),
        name: 'showkeys',
        type: 'boolean'
      }
    ];
  },

  getSupportedConstraints: function() {
    return [{ label: CMgs.format(langBundle, 'required'), name: 'required', type: 'boolean' }];
  }
});

CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-key-value-list', CStudioForms.Datasources.KeyValueList);
