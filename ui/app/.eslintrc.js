module.exports = {
  extends: [
    "react-app",
    "react-app/jest",
    "plugin:prettier/recommended"
  ],
  "plugins": [
    "prettier"
  ],
  settings: {
    react: {
      // Tells eslint-plugin-react to automatically detect the version of React to use.
      version: 'detect',
    },
    // Tells eslint how to resolve imports
    'import/resolver': {
      node: {
        paths: ['src'],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  "rules": {
    "prettier/prettier": [
      "error"
    ],
    "spaced-comment": [
      "error",
      "always",
      {
        "line": {
          "markers": [
            "/",
            "#"
          ]
        },
        "block": {
          "markers": [
            "!",
            "*",
            "#",
            "function",
            "const",
            "if",
            "export",
            "interface",
            "#__PURE__",
            "@__PURE__"
          ],
          "exceptions": [
            "!",
            "*",
            "#"
          ],
          "balanced": false
        }
      }
    ]
  }
};
  