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

CStudioForms.Datasources.SiteComponent =
  CStudioForms.Datasources.SiteComponent ||
  function(id, form, properties, constraints) {
    this.id = id;
    this.form = form;
    this.properties = properties;
    this.constraints = constraints;
    this.callbacks = [];
    var _self = this;
    this.messages = {
      siteComponentDSMessages: CrafterCMSNext.i18n.messages.siteComponentDSMessages,
      words: CrafterCMSNext.i18n.messages.words
    };

    for (var i = 0; i < properties.length; i++) {
      var property = properties[i];
      if (property.name === 'componentPath') {
        CrafterCMSNext.services.content.getContentDOM(CStudioAuthoringContext.siteId, property.value).subscribe(
          (dom) => {
            let items = Array.from(dom.querySelectorAll('items > item'));
            items = items.map((item) => {
              let values = {};
              Array.from(item.children).map((child) => {
                values[child.tagName] = CrafterCMSNext.util.string.unescapeHTML(child.innerHTML);
              });
              return values;
            });
            _self.list = items;
            for (var j = 0; j < _self.callbacks.length; j++) {
              _self.callbacks[j].success(items);
            }
          },
          () => {
            CStudioAuthoring.Operations.showSimpleDialog(
              'unableLoad-dialog',
              CStudioAuthoring.Operations.simpleDialogTypeINFO,
              CrafterCMSNext.i18n.intl.formatMessage(_self.messages.words.notification),
              CrafterCMSNext.i18n.intl.formatMessage(_self.messages.siteComponentDSMessages.unableLoad, {
                file: property.value
              }),
              null,
              YAHOO.widget.SimpleDialog.ICON_BLOCK,
              'studioDialog'
            );
          }
        );
      }
    }

    return this;
  };

YAHOO.extend(CStudioForms.Datasources.SiteComponent, CStudioForms.CStudioFormDatasource, {
  getLabel: function() {
    return CrafterCMSNext.i18n.intl.formatMessage(CrafterCMSNext.i18n.messages.siteComponentDSMessages.siteComponent);
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
      if (prop.name === 'dataType') {
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
    return 'site-component';
  },

  getSupportedProperties: function() {
    return [
      {
        label: CrafterCMSNext.i18n.intl.formatMessage(this.messages.siteComponentDSMessages.dataType),
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
            label: CrafterCMSNext.i18n.intl.formatMessage(this.messages.siteComponentDSMessages.string),
            selected: false
          },
          {
            value: 'value_i',
            label: CrafterCMSNext.i18n.intl.formatMessage(this.messages.siteComponentDSMessages.integer),
            selected: false
          },
          {
            value: 'value_f',
            label: CrafterCMSNext.i18n.intl.formatMessage(this.messages.siteComponentDSMessages.float),
            selected: false
          },
          {
            value: 'value_dt',
            label: CrafterCMSNext.i18n.intl.formatMessage(this.messages.siteComponentDSMessages.date),
            selected: false
          },
          {
            value: 'value_html',
            label: CrafterCMSNext.i18n.intl.formatMessage(this.messages.siteComponentDSMessages.html),
            selected: false
          }
        ]
      },
      {
        label: CrafterCMSNext.i18n.intl.formatMessage(this.messages.siteComponentDSMessages.componentPath),
        name: 'componentPath',
        type: 'string'
      }
    ];
  },

  getSupportedConstraints: function() {
    return [
      {
        label: CrafterCMSNext.i18n.intl.formatMessage(this.messages.siteComponentDSMessages.required),
        name: 'required',
        type: 'boolean'
      }
    ];
  },

  getList: function(cb) {
    if (!this.list) {
      this.callbacks[this.callbacks.length] = cb;
    } else {
      cb.success(this.list);
    }
  }
});

CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-site-component', CStudioForms.Datasources.SiteComponent);
