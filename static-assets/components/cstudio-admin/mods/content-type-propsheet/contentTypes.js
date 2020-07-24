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
(function () {
  var _CrafterCMSNext = CrafterCMSNext,
      React = _CrafterCMSNext.React,
      ReactDOM = _CrafterCMSNext.ReactDOM,
      i18n = _CrafterCMSNext.i18n;
  var useState = React.useState,
      useMemo = React.useMemo,
      useRef = React.useRef,
      useEffect = React.useEffect;
  var STAR = '*';

  function createLookupTableFromCVS(cvs) {
    return !cvs ? [] : cvs.split(',').reduce(function (lookupTable, id) {
      return CrafterCMSNext.util.babel.objectSpread({}, lookupTable, CrafterCMSNext.util.babel.defineProperty({}, id, true));
    }, {});
  }

  function Selector(_ref) {
    var contentTypes = _ref.contentTypes,
        onSelection = _ref.onSelection,
        initialValue = _ref.initialValue;

    var _useState = useState(''),
        _useState2 = CrafterCMSNext.util.babel.slicedToArray(_useState, 2),
        keywords = _useState2[0],
        setKeywords = _useState2[1];

    var _useState3 = useState(createLookupTableFromCVS(initialValue)),
        _useState4 = CrafterCMSNext.util.babel.slicedToArray(_useState3, 2),
        selected = _useState4[0],
        setSelected = _useState4[1];

    var types = useMemo(function () {
      return [{
        name: STAR,
        label: 'Allow any component'
      }].concat(CrafterCMSNext.util.babel.toConsumableArray(contentTypes.filter(function (type) {
        return type.type === 'component' && (type.name.includes(keywords) || type.label.includes(keywords));
      })));
    }, [contentTypes, keywords]);
    var ref = useRef();

    var update = function update(id, isSelected) {
      var isStar = id === STAR;
      var nextSelected = isStar ? {} : CrafterCMSNext.util.babel.objectSpread({}, selected);

      if (isSelected) {
        nextSelected[id] = isSelected;
      } else {
        delete nextSelected[id];
      }

      setSelected(nextSelected);
      onSelection && onSelection(Object.keys(nextSelected));
    };

    useEffect(function () {
      if (selected[STAR]) {
        Array.from(ref.current.querySelectorAll('input')).forEach(function (e) {
          if (e.value !== STAR) {
            e.checked = false;
          }
        });
      }
    }, [selected]);
    return /*#__PURE__*/React.createElement("div", {
      ref: ref
    }, /*#__PURE__*/React.createElement("div", {
      className: "content-type-selector--search-wrapper"
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: keywords,
      className: "content-type-selector--search-input",
      placeholder: "Search components...",
      onChange: function onChange(e) {
        return setKeywords(e.target.value);
      }
    })), types.map(function (contentType) {
      return /*#__PURE__*/React.createElement("label", {
        key: "".concat(contentType.name, "_label"),
        className: "content-type-selector--label"
      }, /*#__PURE__*/React.createElement("input", {
        type: "checkbox",
        value: contentType.name,
        className: "content-type-selector--checkbox",
        checked: selected[contentType.name],
        disabled: contentType.name === STAR ? false : selected[STAR],
        onChange: function onChange(e) {
          return update(e.target.value, e.target.checked);
        }
      }), contentType.label);
    }));
  }

  function ContentTypes(fieldName, container) {
    this.fieldName = fieldName;
    this.container = container;
    this.value = '';
  }

  ContentTypes.prototype = {
    render: function render(value, updateFn) {
      var _this = this;

      var element = $('<div class="content-type-selector"/>').appendTo(this.container)[0];
      var contentTypes = CStudioAuthoring.Dialogs.DialogSelectContentType.contentTypes;
      ReactDOM.render( /*#__PURE__*/React.createElement(Selector, {
        initialValue: value,
        contentTypes: contentTypes,
        onSelection: function onSelection(selected) {
          var value = _this.value = selected.join(',');
          updateFn(null, {
            fieldName: _this.fieldName,
            value: value
          });
        }
      }), element);
      this.value = value;
    },
    getValue: function getValue() {
      return this.value;
    }
  };
  CStudioAuthoring.Module.moduleLoaded('cstudio-console-tools-content-types-proptype-contentTypes', ContentTypes);
})();