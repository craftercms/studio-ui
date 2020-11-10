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

import {
  createGenerateClassName,
  createMuiTheme,
  fade,
  ThemeOptions
} from '@material-ui/core/styles';
import palette from './palette';
import { GenerateId } from 'jss';

export const backgroundColor = palette.gray.light1;
export const RedColor = palette.red.main;

export const defaultThemeOptions: ThemeOptions = (function() {
  const defaultTheme = createMuiTheme();
  const theme: ThemeOptions = {
    typography: {
      button: {
        textTransform: 'none'
      },
      fontSize: 14,
      fontFamily: '"Source Sans Pro", "Open Sans", sans-serif'
    },
    palette: {
      type: 'light',
      primary: {
        main: palette.blue.main
      },
      warning: {
        main: palette.orange.main
      },
      error: {
        main: palette.red.main
      },
      success: {
        main: palette.green.main
      },
      info: {
        main: palette.teal.main
      }
    },
    overrides: {
      MuiListItem: {
        root: {
          '&.Mui-selected, &.Mui-selected:hover': {
            backgroundColor: palette.blue.highlight
          }
        }
      },
      MuiFormLabel: {
        root: {
          transform: 'translate(0, 1.5px) scale(1) !important',
          transformOrigin: 'top left !important'
        },
        asterisk: {
          color: RedColor
        }
      },
      MuiInputBase: {
        root: {
          'label + &': {
            marginTop: `${defaultTheme.spacing(3)}px !important`
          },
          '&.MuiInput-underline::before': {
            display: 'none'
          },
          '&.MuiInput-underline::after': {
            display: 'none'
          },
          '&$error .MuiInputBase-input': {
            color: RedColor,
            borderColor: RedColor,
            '&:focus': {
              boxShadow: 'rgba(244, 67, 54, 0.25) 0 0 0 0.2rem'
            }
          },
          '&$multiline textarea': {
            padding: '10px 12px'
          }
        },
        input: {
          borderRadius: 4,
          position: 'relative',
          border: '1px solid #ced4da',
          fontSize: 16,
          width: '100%',
          padding: '10px 12px',
          transition: defaultTheme.transitions.create(['border-color', 'box-shadow']),
          '&:focus:invalid': {
            boxShadow: `${fade(palette.blue.main, 0.25)} 0 0 0 0.2rem`
          },
          '&:focus': {
            boxShadow: `${fade(palette.blue.main, 0.25)} 0 0 0 0.2rem`,
            borderColor: palette.blue.main
          }
        }
      },
      MuiTabs: {
        indicator: {
          backgroundColor: palette.blue.main
        }
      },
      MuiAccordion: {
        root: {
          '&:before': {
            display: 'none'
          }
        }
      }
    }
  };
  return theme;
})();

export const generateClassName: GenerateId = createGenerateClassName({
  productionPrefix: 'craftercms-'
});
