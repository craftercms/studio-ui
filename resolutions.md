# Resolutions

This file is meant to justify the use of resolutions in `package.json` and allow informed management of the resolutions.

- `nth-check`: older version(s) have security vulnerabilities (older pulled by transient dependencies).
- `@typescript-eslint/*`: avoid multiple resolutions which some packages like `eslint-plugin-jsx-a11y` and `eslint-plugin-react` are pulling a much older versions.
- `clsx`: notistack uses version 1.x but has no issue running with 2.x
- `react-is`: hoist-non-react-statics, pretty-format, prop-types and react-router@npm:5.3.4 are pulling an older version which may cause multiple versions of react-is in the runtime.
