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

import jss, { StyleSheet } from 'jss';
import preset from 'jss-preset-default';
import stylesheet, { GuestStyleSheetConfig } from './stylesheet';
import { createTheme, Theme, ThemeOptions } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import palette from './palette';
import { useMemo } from 'react';
import { ZoneMarkerFullSx } from '../react';

export interface GuestStyleConfig extends GuestStyleSheetConfig {}

export function appendStyleSheet(config?: GuestStyleConfig): StyleSheet {
  jss.setup(preset());

  const sheet: StyleSheet = jss.createStyleSheet(stylesheet(config));

  sheet.attach();

  return sheet;
}

export function useGuestTheme(styleConfig: ThemeOptions): Theme {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  return useMemo(() => {
    const mode = prefersDarkMode ? 'dark' : 'light';
    return createTheme(
      {
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
          }
        }
      },
      styleConfig
    );
  }, [prefersDarkMode, styleConfig]);
}

export interface GuestStylesSx {
  zoneMarker: Record<
    'base' | 'selectModeHighlight' | 'moveModeHighlight' | 'errorHighlight' | 'warnHighlight',
    ZoneMarkerFullSx
  >;
}

export const styleSxDefaults: GuestStylesSx = {
  zoneMarker: {
    base: {
      paper: {},
      box: {},
      icon: {}
    },
    selectModeHighlight: {
      paper: {
        bgcolor: 'success.light',
        color: 'success.contrastText'
      },
      box: {
        outlineColor: (theme) => theme.palette.success.light
      },
      icon: {
        color: 'success.contrastText'
      }
    },
    moveModeHighlight: {
      paper: {
        bgcolor: 'primary.light',
        color: 'primary.contrastText'
      },
      box: {
        outlineColor: (theme) => theme.palette.primary.light
      },
      icon: {}
    },
    errorHighlight: {
      paper: {
        bgcolor: 'error.light',
        color: 'error.contrastText'
      },
      box: {
        bgcolor: 'error.light'
      },
      icon: {}
    },
    warnHighlight: {
      paper: {
        bgcolor: 'warning.light',
        color: 'warning.contrastText'
      },
      box: {
        outlineColor: (theme) => theme.palette.warning.light
      },
      icon: {}
    }
  }
};
