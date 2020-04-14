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

CStudioForms.Datasources.ConfiguredList =
  CStudioForms.Datasources.ConfiguredList ||
  function(id, form, properties, constraints) {
    this.id = id;
    this.form = form;
    this.sort = this.SORT_NONE;
    this.properties = properties;
    this.constraints = constraints;
    this.callbacks = [];
    var _self = this;

    for (var i = 0; i < properties.length; i++) {
      var property = properties[i];
      if (property.name == 'sort') {
        var propValues = JSON.parse(property.value);

        for (var x = 0; x < propValues.length; x++) {
          if (propValues[x].selected) {
            this.sort = propValues[x].label;
          }
        }
      }

      if (property.name == 'listName') {
        var cb = {
          success: function(config) {
            if (config) {
              var values = config.values.item;
              if (!values.length) {
                values = [values.item];
              }

              if (_self.sort != _self.SORT_NONE) {
                if (_self.sort == _self.SORT_ASC) {
                  values = values.sort(function(a, b) {
                    return a.value > b.value;
                  });
                } else {
                  values = values.sort(function(a, b) {
                    return a.value < b.value;
                  });
                }
              }

              _self.list = values;

              for (var j = 0; j < _self.callbacks.length; j++) {
                _self.callbacks[j].success(values);
              }
            }
          },
          failure: function() {}
        };

        CStudioAuthoring.Service.lookupConfigurtion(
          CStudioAuthoringContext.site,
          '/form-control-config/configured-lists/' + property.value + '.xml',
          cb
        );
      }
    }

    return this;
  };

YAHOO.extend(CStudioForms.Datasources.ConfiguredList, CStudioForms.CStudioFormDatasource, {
  getLabel: function() {
    return CMgs.format(langBundle, 'configuredListOfPairs');
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
    return 'configured-list';
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
        label: CMgs.format(langBundle, 'listName'),
        name: 'listName',
        type: 'string'
      },
      {
        label: CMgs.format(langBundle, 'sort'),
        name: 'sort',
        type: 'dropdown',
        defaultValue: [
          {
            // Update this array if the dropdown options need to be updated
            value: CStudioForms.Datasources.ConfiguredList.SORT_NONE,
            label: 'None',
            selected: true
          },
          {
            value: CStudioForms.Datasources.ConfiguredList.SORT_ASC,
            label: CMgs.format(langBundle, 'ascending'),
            selected: false
          },
          {
            value: CStudioForms.Datasources.ConfiguredList.SORT_DESC,
            label: CMgs.format(langBundle, 'descending'),
            selected: false
          }
        ]
      }
    ];
  },

  getSupportedConstraints: function() {
    return [{ label: CMgs.format(langBundle, 'required'), name: 'required', type: 'boolean' }];
  },

  getList: function(cb) {
    if (!this.list) {
      this.callbacks[this.callbacks.length] = cb;
    } else {
      cb.success(this.list);
    }
  },
  SORT_NONE: 'None',
  SORT_DESC: 'descending',
  SORT_ASC: 'ascending'
});

CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-configured-list', CStudioForms.Datasources.ConfiguredList);
