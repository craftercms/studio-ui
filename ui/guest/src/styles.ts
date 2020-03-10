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

import jss, { StyleSheet } from 'jss';
import preset from 'jss-preset-default';

export function appendStyleSheet(styles: StyleSheet): StyleSheet {

  const colors = {
    blue: '#007AFF',
    blueTint: '#409CFF',
    blueShade: '#0040DD',
    /* - - - - - - - - - - */
    gray: '#8E8393',
    grayTint: '#98989D',
    grayShade: '#69696E',
    /* - - - - - - - - - - */
    green: '#34C759',
    greenTint: '#30DB5B',
    greenShade: '#248A3D',
    /* - - - - - - - - - - */
    indigo: '#5856d6',
    indigoTint: '#7D7AFF',
    indigoShade: '#3634A3',
    /* - - - - - - - - - - */
    orange: '#FF9500',
    orangeTint: '#FFB340',
    orangeShade: '#C93400',
    /* - - - - - - - - - - */
    pink: '#FF2D55',
    pinkTint: '#FF6482',
    pinkShade: '#D30F45',
    /* - - - - - - - - - - */
    purple: '#AF52DE',
    purpleTint: '#DA8FFF',
    purpleShade: '#8944AB',
    /* - - - - - - - - - - */
    red: '#FF3B30',
    redTint: '#FF6961',
    redShade: '#D70015',
    /* - - - - - - - - - - */
    teal: '#5AC8FA',
    tealTint: '#70D7FF',
    tealShade: '#0071A4',
    /* - - - - - - - - - - */
    yellow: '#FFCC00',
    yellowTint: '#FFD426',
    yellowShade: '#A05A00',
  };

  jss.setup(preset());

  const stylesheet: StyleSheet = jss.createStyleSheet({
    '@global': {
      '[data-craftercms-model-id][contentEditable="true"]': {
        outlineOffset: 5,
        outline: `2px solid ${colors.blueTint}`,
        '&:focus': {
          outline: `5px solid ${colors.blue}`
        }
      },
      '[draggable="true"]': {
        'cursor': 'move !important'
      },
      'craftercms-zone-marker, craftercms-zone-marker-label': {
        boxSizing: 'border-box'
      },
      'craftercms-zone-marker': {
        outline: `2px solid ${colors.green}`,
        outlineOffset: '-2px',
        textAlign: 'center',
        position: 'absolute',
        zIndex: '1000',
        pointerEvents: 'none'
      },
      'craftercms-zone-marker-label': {
        background: `${colors.green}`,
        color: '#fff',
        padding: '2px 10px',
        display: 'inline-block',
        fontSize: '14px',
        position: 'absolute',
        top: '-25px',
        left: '50%',
        right: '0',
        marginLeft: '-60px',
        textAlign: 'center',
        minWidth: '120px',
        maxWidth: '120px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontWeight: '700',
        pointerEvents: 'none',
        zIndex: '1000'
      },
      'craftercms-drop-marker': {
        zIndex: '1010',
        position: 'fixed',
        pointerEvents: 'none',
        '&::before, &::after': {
          content: '""',
          width: '8px',
          height: '8px',
          background: colors.blue,
          borderRadius: '8px',
          marginTop: '-3px',
          marginLeft: '-4.5px',
          position: 'absolute'
        },
        '&.horizontal': {
          height: 2,
          visibility: 'visible',
          background: colors.blue,
          boxShadow: '0 1px 2px rgba(255, 255, 255, .4),  0 -1px 2px rgba(255, 255, 255, .4)',
          '&::before': {
            left: 0
          },
          '&::after': {
            right: 0
          }
        },
        '&.vertical': {
          width: 2,
          minHeight: '5px',
          marginLeft: '3px',
          border: `1px solid ${colors.blue}`,
          boxShadow: '1px 0 2px rgba(255, 255, 255, .4),  -1px 0 2px rgba(255, 255, 255, .4)',
          '&::before': {
            top: 0
          },
          '&::after': {
            bottom: -4
          }
        }
      },
      '.craftercms-placeholder-spinner': {
        animation: 'craftercms-placeholder-rotate 2s linear infinite',
        '& .path': {
          stroke: colors.blue,
          animation: 'craftercms-placeholder-dash 1.5s ease-in-out infinite'
        }
      },
      '@keyframes craftercms-placeholder-rotate': {
        '100%': { transform: 'rotate(360deg)' }
      },
      '@keyframes craftercms-placeholder-dash': {
        '0%': { strokeDasharray: '1, 150', strokeDashoffset: '0' },
        '50%': { strokeDasharray: '90, 150', strokeDashoffset: '-35' },
        '100%': { strokeDasharray: '90, 150', strokeDashoffset: '-124' }
      },
      '.craftercms-contentTree-pulse': {
        animation: 'craftercms-contentTree-pulse-animation 300ms 2 ease-in-out'
      },
      '@keyframes craftercms-contentTree-pulse-animation': {
        '0%': {
          transform: 'scaleX(1)'
        },
        '50%': {
          transform: 'scale3d(1.05,1.05,1.05)'
        },
        'to': {
          transform: 'scaleX(1)'
        }
      }
    },
  });

  stylesheet.attach();

  return stylesheet;

}
