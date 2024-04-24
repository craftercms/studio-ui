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

(function () {
  const i18n = CrafterCMSNext.i18n,
    formatMessage = i18n.intl.formatMessage,
    checkboxGroupControlMessages = i18n.messages.checkboxGroupControlMessages;

  CStudioForms.Controls.CheckBoxGroup =
    CStudioForms.Controls.CheckBoxGroup ||
    function (id, form, owner, properties, constraints, readonly) {
      this.owner = owner;
      this.owner.registerField(this);
      this.errors = [];
      this.properties = properties;
      this.constraints = constraints;
      this.inputEl = null;
      this.countEl = null;
      this.required = false;
      this.value = '_not-set';
      this.form = form;
      this.id = id;
      this.readonly = readonly;
      this.minSize = 0;
      this.hiddenEl = null;
      // Stores the type of data the control is now working with (this value is fetched from the datasource controller)
      this.dataType = null;
      this.supportedPostFixes = ['_o'];

      amplify.subscribe('/datasource/loaded', this, this.onDatasourceLoaded);

      return this;
    };

  YAHOO.extend(CStudioForms.Controls.CheckBoxGroup, CStudioForms.CStudioFormField, {
    getLabel: function () {
      return CMgs.format(langBundle, 'groupedCheckboxes');
    },

    getRequirementCount: function () {
      var count = 0;

      if (this.minSize > 0) {
        count++;
      }

      return count;
    },

    validate: function () {
      if (this.minSize > 0) {
        if (this.value.length < this.minSize) {
          this.setError('minCount', '# items are required');
          this.renderValidation(true, false);
        } else {
          this.clearError('minCount');
          this.renderValidation(true, true);
        }
      } else {
        this.renderValidation(false, true);
      }
      this.owner.notifyValidation();
    },

    _onChangeVal: function (evt, obj) {
      obj.edited = true;
    },

    onDatasourceLoaded: function (data) {
      if (this.datasourceName === data.name && !this.datasource) {
        var datasource = this.form.datasourceMap[this.datasourceName];
        this.datasource = datasource;
        this.dataType = datasource.getDataType();
        if (!this.dataType.match(/^value$/)) {
          this.dataType += 'mv';
        }
        datasource.getList(this.callback);
      }
    },

    render: function (config, containerEl, lastTwo, isValueSet) {
      containerEl.id = this.id;
      this.containerEl = containerEl;
      this.config = config;

      var _self = this,
        datasource = null;

      for (var i = 0; i < config.constraints.length; i++) {
        var constraint = config.constraints[i];

        if (constraint.name == 'minSize' && constraint.value != '') {
          this.minSize = parseInt(constraint.value);
        }
      }

      for (var i = 0; i < config.properties.length; i++) {
        var prop = config.properties[i];

        if (prop.name == 'datasource') {
          if (prop.value && prop.value != '') {
            this.datasourceName = Array.isArray(prop.value) ? prop.value[0] : prop.value;
            this.datasourceName = this.datasourceName.replace('["', '').replace('"]', '');
          }
        }

        if (prop.name == 'selectAll' && prop.value == 'true') {
          this.selectAll = true;
        }

        if (prop.name === 'listDirection') {
          var value = JSON.parse(prop.value);
          value.forEach(function (opt) {
            if (opt.selected) {
              val = opt.value;
            }
          });

          this.listDirection = val;
        }

        if (prop.name == 'readonly' && prop.value == 'true') {
          this.readonly = true;
        }
      }

      if (this.value === '_not-set' || this.value === '') {
        this.value = [];
      }

      var cb = {
        success: function (list) {
          var keyValueList = list,
            // setValue will provide an array with the values that were checked last time the form was saved (datasource A).
            // If someone decides to tie this control to a different datasource (datasource B): none, some or all of values
            // from datasource A may be present in datasource B. If there were values checked in datasource A and they are
            // also found in datasource B, then they will remain checked. However, if there were values checked in
            // datasource A that are no longer found in datasource B, these need to be removed from the control's value.
            newValue = [],
            rowEl,
            labelEl,
            textEl,
            inputEl;

          containerEl.innerHTML = '';
          var titleEl = document.createElement('span');

          YAHOO.util.Dom.addClass(titleEl, 'cstudio-form-field-title');
          titleEl.textContent = config.title;

          var controlWidgetContainerEl = document.createElement('div');
          YAHOO.util.Dom.addClass(controlWidgetContainerEl, 'cstudio-form-control-input-container');

          var validEl = document.createElement('span');
          YAHOO.util.Dom.addClass(validEl, 'validation-hint');
          YAHOO.util.Dom.addClass(validEl, 'cstudio-form-control-validation fa fa-check');

          var hiddenEl = document.createElement('input');
          hiddenEl.type = 'hidden';
          YAHOO.util.Dom.addClass(hiddenEl, 'datum');
          controlWidgetContainerEl.appendChild(hiddenEl);
          _self.hiddenEl = hiddenEl;

          var groupEl = document.createElement('div');
          groupEl.className = 'checkbox-group';

          if (_self.selectAll && !_self.readonly) {
            rowEl = document.createElement('span');
            rowEl.className = 'checkbox select-all';

            labelEl = document.createElement('label');
            labelEl.setAttribute('for', _self.id + '-all');

            rowEl.appendChild(labelEl);

            textEl = document.createElement('span');
            textEl.innerHTML = 'Select All';

            inputEl = document.createElement('input');
            inputEl.type = 'checkbox';
            inputEl.checked = false;
            inputEl.id = _self.id + '-all';

            YAHOO.util.Event.on(
              inputEl,
              'click',
              function (evt, context) {
                context.form.setFocusedField(context);
              },
              _self
            );
            YAHOO.util.Event.on(inputEl, 'change', _self.toggleAll, inputEl, _self);

            labelEl.appendChild(inputEl);
            labelEl.appendChild(textEl);
            groupEl.appendChild(rowEl);
          }

          controlWidgetContainerEl.appendChild(groupEl);

          const listDirection = _self.listDirection ? _self.listDirection : 'horizontal';
          let iterationLength = keyValueList.length, // If listDirection === 'horizontal' iterate normally;
            listLengthOdd;

          if (listDirection === 'vertical') {
            // if listDirection === 'vertical', will iterate half the length of the array, and render
            // index item and index + iterationLength item on each iteration
            listLengthOdd = keyValueList.length % 2 === 1;
            // if list length is odd then add 1 before calculating half
            iterationLength = listLengthOdd ? (keyValueList.length + 1) / 2 : keyValueList.length / 2;
          }

          for (var j = 0; j < iterationLength; j++) {
            let item = keyValueList[j];
            _self.renderItem(item, groupEl, newValue);

            // render index + iterationLength
            if (listDirection === 'vertical' && j + iterationLength < keyValueList.length) {
              item = keyValueList[j + iterationLength];
              _self.renderItem(item, groupEl, newValue);
            }
          }
          _self.value = newValue;

          var helpContainerEl = document.createElement('div');
          YAHOO.util.Dom.addClass(helpContainerEl, 'cstudio-form-field-help-container');
          controlWidgetContainerEl.appendChild(helpContainerEl);

          _self.renderHelp(config, helpContainerEl);

          var descriptionEl = document.createElement('span');
          YAHOO.util.Dom.addClass(descriptionEl, 'description');
          YAHOO.util.Dom.addClass(descriptionEl, 'cstudio-form-field-description');
          descriptionEl.textContent = config.description;

          containerEl.appendChild(titleEl);
          containerEl.appendChild(validEl);
          containerEl.appendChild(controlWidgetContainerEl);
          containerEl.appendChild(descriptionEl);

          // Check if the value loaded is valid or not
          _self.validate();
        }
      };

      if (isValueSet) {
        var datasource = this.form.datasourceMap[this.datasourceName];
        // This render method is currently being called twice (on initialization and on the setValue).
        // We need the value to know which checkboxes should be checked or not so restrict the rendering to only
        // after the value has been set.
        if (datasource) {
          this.datasource = datasource;
          this.dataType = datasource.getDataType() || 'value'; // Set default value for dataType (for backwards compatibility)
          if (!this.dataType.match(/^value$/)) {
            this.dataType += 'mv';
          }
          datasource.getList(cb);
        } else {
          this.callback = cb;
        }
      }
    },

    renderItem: function (item, groupEl, newValue) {
      let rowEl, labelEl, textEl, inputEl;
      const _self = this;

      rowEl = document.createElement('span');
      rowEl.className = 'checkbox';

      labelEl = document.createElement('label');
      labelEl.setAttribute('for', this.id + '-' + item.key);

      rowEl.appendChild(labelEl);

      textEl = document.createElement('span');
      // TODO:
      // we might need to create something on the datasource
      // to get the value based on the list of possible value holding properties
      // using datasource.getSupportedProperties
      textEl.textContent =
        item.value ||
        item.value_f ||
        item.value_smv ||
        item.value_imv ||
        item.value_fmv ||
        item.value_dtmv ||
        item.value_htmlmv;

      inputEl = document.createElement('input');
      inputEl.type = 'checkbox';

      if (this.isSelected(item.key)) {
        newValue.push(this.updateDataType(item));
        inputEl.checked = true;
      } else {
        inputEl.checked = false;
      }

      inputEl.id = this.id + '-' + item.key;

      if (this.readonly == true) {
        inputEl.disabled = true;
      }

      YAHOO.util.Event.on(
        inputEl,
        'click',
        function (evt, context) {
          context.form.setFocusedField(context);
          _self.checkStates(this);
        },
        _self
      );
      YAHOO.util.Event.on(inputEl, 'change', this.onChange, inputEl, this);
      inputEl.context = this;
      inputEl.item = item;

      labelEl.appendChild(inputEl);
      labelEl.appendChild(textEl);
      groupEl.appendChild(rowEl);
    },

    toggleAll: function (evt, el) {
      var ancestor = YAHOO.util.Dom.getAncestorByClassName(el, 'checkbox-group'),
        checkboxes = YAHOO.util.Selector.query('.checkbox input[type="checkbox"]', ancestor),
        _self = this;

      this.value = [];
      this.value.length = 0;
      if (el.checked) {
        // select all
        checkboxes.forEach(function (el) {
          var valObj = {};

          el.checked = true;
          if (el.item) {
            // the select/deselect toggle button doesn't have an item attribute
            valObj.key = el.item.key;
            valObj[_self.dataType] = el.item.value || el.item[_self.dataType];
            _self.value.push(valObj);
          }
        });
      } else {
        // unselect all
        checkboxes.forEach(function (el) {
          el.checked = false;
        });
      }
      this.form.updateModel(this.id, this.getValue());
      this.hiddenEl.value = this.valueToString();
      this.validate();
      this._onChangeVal(evt, this);
    },

    checkStates: function (el) {
      var ancestor = YAHOO.util.Dom.getAncestorByClassName(el, 'checkbox-group'),
        checkboxes = YAHOO.util.Selector.query('.checkbox input[type="checkbox"]', ancestor),
        state = el.checked,
        allSameState = true,
        checkAllEl = YAHOO.util.Selector.query('.checkbox.select-all input[type="checkbox"]', ancestor)[0];

      if (checkAllEl) {
        checkboxes.forEach(function (el) {
          var isSelectAll = el.parentElement.className.indexOf('select-all') != -1;

          if (!isSelectAll && el.checked != state) {
            allSameState = false;
          }
        });

        if (allSameState) {
          checkAllEl.checked = state;
        } else {
          checkAllEl.checked = false;
        }
      }
    },

    onChange: function (evt, el) {
      var checked = el.checked;

      if (checked) {
        this.selectItem(el.item.key, el.item.value || el.item[this.dataType]);
      } else {
        this.unselectItem(el.item.key);
      }
      this.form.updateModel(this.id, this.getValue());
      this.hiddenEl.value = this.valueToString();
      this.validate();
      this._onChangeVal(evt, this);
    },

    isSelected: function (key) {
      var selected = false;
      var values = this.getValue();

      for (var i = 0; i < values.length; i++) {
        if (values[i].key == key) {
          selected = true;
          break;
        }
      }
      return selected;
    },

    getIndex: function (key) {
      var index = -1;
      var values = this.getValue();

      for (var i = 0; i < values.length; i++) {
        if (values[i].key == key) {
          index = i;
          break;
        }
      }

      return index;
    },

    selectItem: function (key, value) {
      var valObj = {};

      if (!this.isSelected(key)) {
        valObj.key = key;
        valObj[this.dataType] = value;

        this.value[this.value.length] = valObj;
      }
    },

    unselectItem: function (key) {
      var index = this.getIndex(key);

      if (index != -1) {
        this.value.splice(index, 1);
      }
    },

    getValue: function () {
      return this.value;
    },

    updateDataType: function (valObj) {
      if (this.dataType) {
        for (var prop in valObj) {
          if (prop.match(/value/)) {
            if (prop !== this.dataType) {
              // Rename the property (e.g. "value") to the current data type ("value_s")
              valObj[this.dataType] = valObj[prop];
              delete valObj[prop];
            }
          }
        }
        return valObj;
      } else {
        throw new TypeError('Function updateDataType (checkbox-group.js) : module variable dataType is undefined');
      }
    },

    setValue: function (value) {
      if (value === '') {
        value = [];
      } else if (typeof value === 'string') {
        try {
          value = JSON.parse(value);
        } catch (err) {
          console.log(err);
        }
      }

      this.value = value;
      this.form.updateModel(this.id, this.getValue());
      this.render(this.config, this.containerEl, false, true);
      if (this.hiddenEl) {
        this.hiddenEl.value = this.valueToString();
      } else {
        console.error('[checkbox-group.js] setValue: Trying to set value of `hiddenEl` but it is not defined yet.');
      }
    },

    valueToString: function () {
      var strValue = '[';
      var values = this.getValue();
      var item = null;
      if (values === '') values = [];

      for (var i = 0; i < values.length; i++) {
        item = values[i];
        strValue += '{ "key": "' + item.key + '", "' + this.dataType + '":"' + item[this.dataType] + '"}';
        if (i != values.length - 1) {
          strValue += ',';
        }
      }

      strValue += ']';
      return strValue;
    },

    getName: function () {
      return 'checkbox-group';
    },

    getSupportedProperties: function () {
      return [
        {
          label: formatMessage(checkboxGroupControlMessages.datasource),
          name: 'datasource',
          type: 'datasource:item:singleSelection'
        },
        {
          label: formatMessage(checkboxGroupControlMessages.showSelectAll),
          name: 'selectAll',
          type: 'boolean'
        },
        {
          label: formatMessage(checkboxGroupControlMessages.listDirection),
          name: 'listDirection',
          type: 'dropdown',
          defaultValue: [
            {
              value: 'horizontal',
              label: formatMessage(checkboxGroupControlMessages.horizontal),
              selected: true
            },
            {
              value: 'vertical',
              label: formatMessage(checkboxGroupControlMessages.vertical),
              selected: false
            }
          ]
        },
        {
          label: formatMessage(checkboxGroupControlMessages.readonly),
          name: 'readonly',
          type: 'boolean'
        }
      ];
    },

    getSupportedConstraints: function () {
      return [{ label: CMgs.format(langBundle, 'minimumSelection'), name: 'minSize', type: 'int' }];
    },

    getSupportedPostFixes: function () {
      return this.supportedPostFixes;
    }
  });

  CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-checkbox-group', CStudioForms.Controls.CheckBoxGroup);
})();
