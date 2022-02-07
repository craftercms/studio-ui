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
'use strict';

const path = require('path');

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

const validateBoolOption = (name, value, defaultValue) => {
  if (typeof value === 'undefined') {
    value = defaultValue;
  }

  if (typeof value !== 'boolean') {
    throw new Error(`Preset react-app: '${name}' option must be a boolean.`);
  }

  return value;
};

const babelHelperList = [
  'AsyncGenerator',
  'AwaitValue',
  'applyDecoratedDescriptor',
  'arrayWithHoles',
  'arrayWithoutHoles',
  'assertThisInitialized',
  'asyncGeneratorDelegate',
  'asyncIterator',
  'asyncToGenerator',
  'awaitAsyncGenerator',
  'classCallCheck',
  'classNameTDZError',
  'classPrivateFieldDestructureSet',
  'classPrivateFieldGet',
  'classPrivateFieldLooseBase',
  'classPrivateFieldLooseKey',
  'classPrivateFieldSet',
  'classPrivateMethodGet',
  'classPrivateMethodSet',
  'classStaticPrivateFieldSpecGet',
  'classStaticPrivateFieldSpecSet',
  'classStaticPrivateMethodGet',
  'classStaticPrivateMethodSet',
  'construct',
  'createClass',
  'decorate',
  'defaults',
  'defineEnumerableProperties',
  'defineProperty',
  'esm',
  'extends',
  'get',
  'getPrototypeOf',
  'inherits',
  'inheritsLoose',
  'initializerDefineProperty',
  'initializerWarningHelper',
  'instanceof',
  'interopRequireDefault',
  'interopRequireWildcard',
  'isNativeFunction',
  'iterableToArray',
  'iterableToArrayLimit',
  'iterableToArrayLimitLoose',
  'jsx',
  'newArrowCheck',
  'nonIterableRest',
  'nonIterableSpread',
  'objectDestructuringEmpty',
  'objectSpread',
  'objectSpread2',
  'objectWithoutProperties',
  'objectWithoutPropertiesLoose',
  'possibleConstructorReturn',
  'readOnlyError',
  'set',
  'setPrototypeOf',
  'skipFirstGeneratorNext',
  'slicedToArray',
  'slicedToArrayLoose',
  'superPropBase',
  'taggedTemplateLiteral',
  'taggedTemplateLiteralLoose',
  'tdz',
  'temporalRef',
  'temporalUndefined',
  'toArray',
  'toConsumableArray',
  'toPrimitive',
  'toPropertyKey',
  'typeof',
  'wrapAsyncGenerator',
  'wrapNativeSuper',
  'wrapRegExp'
];

function TransformImports(babel) {
  const { types } = babel;
  return {
    visitor: {
      ImportDeclaration(path, state) {
        const source = path.node.source.value;
        if (!source.startsWith('/') || !source.includes('@babel/runtime')) {
          return;
        }

        const url = source.match(/^(.*)(@babel\/runtime.*)/)[2];
        const helper = url.replace('@babel/runtime/helpers/', '');
        const name = path.node.specifiers.flatMap((specifier) =>
          specifier.type === 'ImportDefaultSpecifier' ? [specifier.local.name] : []
        )[0];

        path.remove();
      },
      ReferencedIdentifier(path) {
        const {
          node: { name }
        } = path;
        const cleanName = name.substr(1);
        if (babelHelperList.includes(cleanName)) {
          /* Use this console.log to identify which babel helpers are required
           * to export from on babelHelpers-legacy.ts */
          // console.log(cleanName);
          path.replaceWithSourceString(`CrafterCMSNext.util.babel.${cleanName}`);
        }
      }
    }
  };
}

module.exports = function (api, opts) {
  if (!opts) {
    opts = {};
  }

  const env = process.env.BABEL_ENV || process.env.NODE_ENV;

  var isEnvDevelopment = env === 'development';
  var isEnvProduction = env === 'production';
  var isEnvTest = env === 'test';

  var useESModules = validateBoolOption('useESModules', opts.useESModules, isEnvDevelopment || isEnvProduction);
  var isFlowEnabled = validateBoolOption('flow', opts.flow, true);
  var isTypeScriptEnabled = validateBoolOption('typescript', opts.typescript, true);
  var areHelpersEnabled = validateBoolOption('helpers', opts.helpers, true);
  var useAbsoluteRuntime = validateBoolOption('absoluteRuntime', opts.absoluteRuntime, true);

  var absoluteRuntimePath = undefined;
  if (useAbsoluteRuntime) {
    absoluteRuntimePath = path.dirname(require.resolve('@babel/runtime/package.json'));
  }

  if (!isEnvDevelopment && !isEnvProduction && !isEnvTest) {
    throw new Error(
      'Using `babel-preset-react-app` requires that you specify `NODE_ENV` or ' +
        '`BABEL_ENV` environment variables. Valid values are "development", ' +
        '"test", and "production". Instead, received: ' +
        JSON.stringify(env) +
        '.'
    );
  }

  api.cache(true);

  return {
    presets: [
      [
        // Latest stable ECMAScript features
        require('@babel/preset-env').default,
        {
          loose: true,
          // Allow importing core-js in entrypoint and use browserlist to select polyfills
          useBuiltIns: 'entry',
          // Set the corejs version we are using to avoid warnings in console
          // This will need to change once we upgrade to corejs@3
          corejs: 3,
          // Do not transform modules to CJS
          modules: false,
          // Exclude transforms that make all code slower
          exclude: ['transform-typeof-symbol']
        }
      ],
      [
        require('@babel/preset-react').default,
        {
          // Adds component stack to warning messages
          // Adds __self attribute to JSX which React will use for some warnings
          development: isEnvDevelopment || isEnvTest,
          // Will use the native built-in instead of trying to polyfill
          // behavior for any plugins that require one.
          useBuiltIns: true
        }
      ]
    ],
    plugins: [
      require('babel-plugin-macros'),
      [
        require('@babel/plugin-transform-destructuring').default,
        {
          // Use loose mode for performance:
          // https://github.com/facebook/create-react-app/issues/5602
          loose: false,
          selectiveLoose: [
            'useState',
            'useEffect',
            'useContext',
            'useReducer',
            'useCallback',
            'useMemo',
            'useRef',
            'useImperativeHandle',
            'useLayoutEffect',
            'useDebugValue'
          ]
        }
      ],
      [
        require('@babel/plugin-proposal-class-properties').default,
        {
          loose: true
        }
      ],
      // Adds Numeric Separators
      require('@babel/plugin-proposal-numeric-separator').default,
      [
        require('@babel/plugin-proposal-object-rest-spread').default,
        {
          useBuiltIns: true
        }
      ],
      [
        require('@babel/plugin-transform-runtime').default,
        {
          corejs: false,
          helpers: areHelpersEnabled,
          // By default, babel assumes babel/runtime version 7.0.0-beta.0,
          // explicitly resolving to match the provided helper functions.
          // https://github.com/babel/babel/issues/10261
          version: require('@babel/runtime/package.json').version,
          regenerator: true,
          // https://babeljs.io/docs/en/babel-plugin-transform-runtime#useesmodules
          // We should turn this on once the lowest version of Node LTS
          // supports ES Modules.
          useESModules: false,
          // Undocumented option that lets us encapsulate our runtime, ensuring
          // the correct version is used
          // https://github.com/babel/babel/blob/090c364a90fe73d36a30707fc612ce037bdbbb24/packages/babel-plugin-transform-runtime/src/index.js#L35-L42
          absoluteRuntime: absoluteRuntimePath
        }
      ],
      TransformImports,
      [
        // Remove PropTypes from production build
        require('babel-plugin-transform-react-remove-prop-types').default,
        {
          removeImport: true
        }
      ],
      // Adds syntax support for import()
      require('@babel/plugin-syntax-dynamic-import').default,
      // Adds syntax support for optional chaining (.?)
      require('@babel/plugin-proposal-optional-chaining').default,
      // Adds syntax support for default value using ?? operator
      require('@babel/plugin-proposal-nullish-coalescing-operator').default
    ]
  };
};
