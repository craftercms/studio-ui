module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
    'prettier'
  ],
  ignorePatterns: ['dist', 'build', 'build_tsc', '.eslintrc.cjs', 'target'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'prettier/prettier': ['error'],
    'spaced-comment': [
      'error',
      'always',
      {
        line: {
          markers: ['/', '#']
        },
        block: {
          markers: ['!', '*', '#', 'function', 'const', 'if', 'export', 'interface', '#__PURE__', '@__PURE__'],
          exceptions: ['!', '*', '#'],
          balanced: false
        }
      }
    ]
  }
};
