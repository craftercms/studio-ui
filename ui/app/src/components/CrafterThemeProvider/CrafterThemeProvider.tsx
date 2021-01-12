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

import React, { PropsWithChildren, useMemo } from 'react';
import { createMuiTheme, StylesProvider, ThemeOptions, ThemeProvider } from '@material-ui/core/styles';
import { defaultThemeOptions, generateClassName } from '../../styles/theme';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import palette from '../../styles/palette';
import { extend } from '../../utils/object';

export type CrafterThemeProviderProps = PropsWithChildren<{ themeOptions?: ThemeOptions }>;

export function CrafterThemeProvider(props: CrafterThemeProviderProps) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = useMemo(() => {
    const type = prefersDarkMode ? 'dark' : 'light';
    const auxTheme = createMuiTheme({ palette: { type } });
    return createMuiTheme({
      ...(props.themeOptions ?? defaultThemeOptions),
      palette: {
        type,
        primary: {
          main: prefersDarkMode ? palette.blue.tint : palette.blue.main
        },
        warning: {
          main: prefersDarkMode ? palette.orange.tint : palette.orange.main
        },
        error: {
          main: prefersDarkMode ? palette.red.tint : palette.red.main
        },
        success: {
          main: prefersDarkMode ? palette.green.tint : palette.green.main
        },
        info: {
          main: prefersDarkMode ? palette.teal.tint : palette.teal.main
        },
        ...props.themeOptions?.palette
      },
      overrides: extend(
        (props.themeOptions ?? defaultThemeOptions).overrides ?? {},
        {
          MuiInputBase: {
            input: {
              backgroundColor: auxTheme.palette.background.paper
            }
          }
        },
        { deep: true }
      )
    });
  }, [prefersDarkMode, props.themeOptions]);
  return (
    <ThemeProvider theme={theme}>
      <StylesProvider generateClassName={generateClassName} children={props.children} />
    </ThemeProvider>
  );
}

export default CrafterThemeProvider;
