/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import { darken, fade } from '@material-ui/core/styles';

export const backgroundColor = '#E7E7E7';
export const RedColor = '#FF3B30';

const defaultTheme = createMuiTheme();
export const theme = createMuiTheme({
  typography: {
    button: {
      textTransform: 'none'
    },
    fontSize: 14,
    fontFamily: [
      '"Open Sans"',
      'sans-serif'
    ].join(',')
  },
  palette: {
    primary: {
      main: '#7E9DBB',
      contrastText: '#FFFFFF'
    },
    text: {
      secondary: '#828282'
    }
  },
  overrides: {
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
        '&.MuiInput-underline:before': {
          display: 'none'
        },
        '&.MuiInput-underline:after': {
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
        backgroundColor: '#FFFFFF',
        border: '1px solid #ced4da',
        fontSize: 16,
        width: '100%',
        padding: '10px 12px',
        transition: defaultTheme.transitions.create(['border-color', 'box-shadow']),
        '&:focus:invalid': {
          boxShadow: `${fade('#7E9DBB', 0.25)} 0 0 0 0.2rem`
        },
        '&:focus': {
          boxShadow: `${fade('#7E9DBB', 0.25)} 0 0 0 0.2rem`,
          borderColor: '#7E9DBB'
        }
      }
    },
    MuiTabs: {
      indicator: {
        backgroundColor: '#7E9DBB'
      }
    },
    MuiButton: {
      contained: {
        color: '#4F4F4F',
        backgroundColor: '#FFFFFF',
        textTransform: 'inherit',
        '&:hover': {
          backgroundColor: '#FFFFFF'
        }
      },
      outlinedPrimary: {
        color: darken('#7E9DBB', 0.10),
        border: `1px solid ${darken('#7E9DBB', 0.10)}`
      }
    }
  }
});
