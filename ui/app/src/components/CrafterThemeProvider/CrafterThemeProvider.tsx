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

import React, { PropsWithChildren, useMemo } from 'react';
import { createTheme, StyledEngineProvider, Theme, ThemeOptions, ThemeProvider } from '@mui/material/styles';
import StylesProvider from '@mui/styles/StylesProvider';
import { createDefaultThemeOptions, generateClassName } from '../../styles/theme';
import useMediaQuery from '@mui/material/useMediaQuery';
import palette from '../../styles/palette';
import { GenerateId } from 'jss';
import { deepmerge } from '@mui/utils';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

export type CrafterThemeProviderProps = PropsWithChildren<{
  themeOptions?: ThemeOptions;
  generateClassName?: GenerateId;
}>;

export function CrafterThemeProvider(props: CrafterThemeProviderProps) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = useMemo(() => {
    const mode = prefersDarkMode ? 'dark' : 'light';
    const auxTheme = createTheme({ palette: { mode } });
    const defaultThemeOptions = createDefaultThemeOptions({ mode });
    return createTheme({
      ...(props.themeOptions ?? defaultThemeOptions),
      palette: {
        mode,
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
        secondary: {
          main: prefersDarkMode ? palette.indigo.tint : palette.purple.tint
        },
        action: {
          selected: palette.blue.highlight
        },
        background: {
          default: prefersDarkMode ? palette.gray.dark7 : palette.gray.light0
        },
        ...props.themeOptions?.palette
      },
      components: deepmerge((props.themeOptions ?? defaultThemeOptions).components ?? {}, {
        MuiLink: {
          defaultProps: {
            underline: 'hover'
          }
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              backgroundColor: auxTheme.palette.background.paper
            }
          }
        },
        MuiInputBase: {
          styleOverrides: {
            root: {
              backgroundColor: auxTheme.palette.background.paper
            }
          }
        }
      })
    });
  }, [prefersDarkMode, props.themeOptions]);
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <StylesProvider generateClassName={props.generateClassName ?? generateClassName} children={props.children} />
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default CrafterThemeProvider;
