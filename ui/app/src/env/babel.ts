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

/*
 * README
 * If needed, to recreate this file...
 * 1. ls -1 node_models/@babel/runtime
 * 2. Exclude the "esm" folder
 * 3. Convert that list into a JS array (copy on chrome console wrapped in `` and .split('\n)
 * 4. Run

  code = [];

  babelHelpers = babelHelpers.map(h => h.replace('.js', ''))

  babelHelpers.forEach((helper) => {
    code.push(`import _${helper} from "@babel/runtime/helpers/${helper}";`);
  })

  code.push(`\n`);
  code.push(`export default {`);

  babelHelpers.forEach((helper, index) => {
    code.push(`  ${helper}: _${helper}${index === babelHelpers.length - 1 ? '' : ','}`);
  })

  code.push(`};`);
  code.push(`\n`);

 */

// import _AsyncGenerator from '@babel/runtime/helpers/AsyncGenerator';
// import _AwaitValue from '@babel/runtime/helpers/AwaitValue';
// import _applyDecoratedDescriptor from '@babel/runtime/helpers/applyDecoratedDescriptor';
// import _arrayWithHoles from '@babel/runtime/helpers/arrayWithHoles';
// import _arrayWithoutHoles from '@babel/runtime/helpers/arrayWithoutHoles';
// import _assertThisInitialized from '@babel/runtime/helpers/assertThisInitialized';
// import _asyncGeneratorDelegate from '@babel/runtime/helpers/asyncGeneratorDelegate';
// import _asyncIterator from '@babel/runtime/helpers/asyncIterator';
// import _asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator';
// import _awaitAsyncGenerator from '@babel/runtime/helpers/awaitAsyncGenerator';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
// import _classNameTDZError from '@babel/runtime/helpers/classNameTDZError';
// import _classPrivateFieldDestructureSet from '@babel/runtime/helpers/classPrivateFieldDestructureSet';
// import _classPrivateFieldGet from '@babel/runtime/helpers/classPrivateFieldGet';
// import _classPrivateFieldLooseBase from '@babel/runtime/helpers/classPrivateFieldLooseBase';
// import _classPrivateFieldLooseKey from '@babel/runtime/helpers/classPrivateFieldLooseKey';
// import _classPrivateFieldSet from '@babel/runtime/helpers/classPrivateFieldSet';
// import _classPrivateMethodGet from '@babel/runtime/helpers/classPrivateMethodGet';
// import _classPrivateMethodSet from '@babel/runtime/helpers/classPrivateMethodSet';
// import _classStaticPrivateFieldSpecGet from '@babel/runtime/helpers/classStaticPrivateFieldSpecGet';
// import _classStaticPrivateFieldSpecSet from '@babel/runtime/helpers/classStaticPrivateFieldSpecSet';
// import _classStaticPrivateMethodGet from '@babel/runtime/helpers/classStaticPrivateMethodGet';
// import _classStaticPrivateMethodSet from '@babel/runtime/helpers/classStaticPrivateMethodSet';
// import _construct from '@babel/runtime/helpers/construct';
import _createClass from '@babel/runtime/helpers/createClass';
// import _decorate from '@babel/runtime/helpers/decorate';
// import _defaults from '@babel/runtime/helpers/defaults';
// import _defineEnumerableProperties from '@babel/runtime/helpers/defineEnumerableProperties';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
// import _extends from '@babel/runtime/helpers/extends';
// import _get from '@babel/runtime/helpers/get';
// import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
// import _inherits from '@babel/runtime/helpers/inherits';
// import _inheritsLoose from '@babel/runtime/helpers/inheritsLoose';
// import _initializerDefineProperty from '@babel/runtime/helpers/initializerDefineProperty';
// import _initializerWarningHelper from '@babel/runtime/helpers/initializerWarningHelper';
// import _instanceof from '@babel/runtime/helpers/instanceof';
// import _interopRequireDefault from '@babel/runtime/helpers/interopRequireDefault';
// import _interopRequireWildcard from '@babel/runtime/helpers/interopRequireWildcard';
// import _isNativeFunction from '@babel/runtime/helpers/isNativeFunction';
// import _iterableToArray from '@babel/runtime/helpers/iterableToArray';
// import _iterableToArrayLimit from '@babel/runtime/helpers/iterableToArrayLimit';
// import _iterableToArrayLimitLoose from '@babel/runtime/helpers/iterableToArrayLimitLoose';
// import _jsx from '@babel/runtime/helpers/jsx';
// import _newArrowCheck from '@babel/runtime/helpers/newArrowCheck';
// import _nonIterableRest from '@babel/runtime/helpers/nonIterableRest';
// import _nonIterableSpread from '@babel/runtime/helpers/nonIterableSpread';
// import _objectDestructuringEmpty from '@babel/runtime/helpers/objectDestructuringEmpty';
import _objectSpread from '@babel/runtime/helpers/objectSpread';
// import _objectSpread2 from '@babel/runtime/helpers/objectSpread2';
// import _objectWithoutProperties from '@babel/runtime/helpers/objectWithoutProperties';
// import _objectWithoutPropertiesLoose from '@babel/runtime/helpers/objectWithoutPropertiesLoose';
// import _possibleConstructorReturn from '@babel/runtime/helpers/possibleConstructorReturn';
// import _readOnlyError from '@babel/runtime/helpers/readOnlyError';
// import _set from '@babel/runtime/helpers/set';
// import _setPrototypeOf from '@babel/runtime/helpers/setPrototypeOf';
// import _skipFirstGeneratorNext from '@babel/runtime/helpers/skipFirstGeneratorNext';
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
// import _slicedToArrayLoose from '@babel/runtime/helpers/slicedToArrayLoose';
// import _superPropBase from '@babel/runtime/helpers/superPropBase';
// import _taggedTemplateLiteral from '@babel/runtime/helpers/taggedTemplateLiteral';
// import _taggedTemplateLiteralLoose from '@babel/runtime/helpers/taggedTemplateLiteralLoose';
// import _tdz from '@babel/runtime/helpers/tdz';
// import _temporalRef from '@babel/runtime/helpers/temporalRef';
// import _temporalUndefined from '@babel/runtime/helpers/temporalUndefined';
// import _toArray from '@babel/runtime/helpers/toArray';
import _toConsumableArray from '@babel/runtime/helpers/toConsumableArray';
// import _toPrimitive from '@babel/runtime/helpers/toPrimitive';
// import _toPropertyKey from '@babel/runtime/helpers/toPropertyKey';
// import _typeof from '@babel/runtime/helpers/typeof';
// import _wrapAsyncGenerator from '@babel/runtime/helpers/wrapAsyncGenerator';
// import _wrapNativeSuper from '@babel/runtime/helpers/wrapNativeSuper';
// import _wrapRegExp from '@babel/runtime/helpers/wrapRegExp';

export {
  _classCallCheck as classCallCheck,
  _createClass as createClass,
  _defineProperty as defineProperty,
  _objectSpread as objectSpread,
  _slicedToArray as slicedToArray,
  _toConsumableArray as toConsumableArray
};
