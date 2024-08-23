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

import { createTheme, Theme, ThemeOptions } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import palette from '@craftercms/studio-ui/styles/palette';
import { useMemo } from 'react';
import { DropMarkerPartialSx, ZoneMarkerPartialSx } from '../react';
import { SxProps } from '@mui/system';

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
        },
        typography: {
          fontFamily: '"Source Sans Pro", "Open Sans", sans-serif',
          fontSize: 16
        }
      },
      styleConfig
    );
  }, [prefersDarkMode, styleConfig]);
}

type GuestStyleSxKeys = 'base' | 'selectModeHighlight' | 'moveModeHighlight';

export interface GuestStylesSx {
  zoneMarker: Record<GuestStyleSxKeys | 'errorHighlight' | 'warnHighlight' | 'disabledHighlight', ZoneMarkerPartialSx>;
  dropMarker: Record<GuestStyleSxKeys, DropMarkerPartialSx>;
  ghostElement: SxProps<Theme>;
}

export const styleSxDefaults: Partial<GuestStylesSx> = {
  zoneMarker: {
    base: {},
    selectModeHighlight: {
      paper: {
        bgcolor: 'success.light',
        color: 'success.contrastText'
      },
      box: {
        outlineColor: 'success.light'
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
        outlineColor: (theme) => theme.palette.error.light
      }
    },
    warnHighlight: {
      paper: {
        bgcolor: 'warning.light',
        color: 'warning.contrastText'
      },
      box: {
        outlineColor: (theme) => theme.palette.warning.light
      }
    },
    disabledHighlight: {
      paper: {
        bgcolor: (theme) => theme.palette.grey[400],
        color: (theme) => theme.palette.getContrastText(theme.palette.grey[400])
      },
      box: {
        outlineColor: (theme) => theme.palette.grey[400]
      }
    }
  },
  dropMarker: {
    base: {},
    selectModeHighlight: {},
    moveModeHighlight: {}
  }
};
