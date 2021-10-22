/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import * as React from 'react';
import palette from '../styles/palette';
import Global from '@mui/material/GlobalStyles';
import { defaultStyleConfig as config } from '../styles/stylesheet';

export interface GuestGlobalStylesProps {}

// Hoist global styles to a static constant to avoid re-rendering.
const styles = (
  <Global
    styles={{
      // Elements
      'craftercms-asset-uploader-mask-container': {
        zIndex: config.assetUploadMaskZIndex,
        position: 'absolute',
        pointerEvents: 'none'
      },
      'craftercms-asset-uploader-mask': {
        background: config.assetUploadMaskBackgroundColor,
        opacity: 0.5,
        height: '100%',
        width: '100%',
        display: 'block',
        transition: 'height 0.3s ease-out',
        animation: 'craftercms-uploader-mask-animation 1.5s infinite ease-in-out'
      },
      'craftercms-drop-marker': {
        zIndex: config.dropMarkerZIndex,
        position: 'fixed',
        pointerEvents: 'none',
        '&::before, &::after': {
          content: '""',
          width: '8px',
          height: '8px',
          background: config.dropMarkerColor,
          borderRadius: '8px',
          marginTop: '-3px',
          marginLeft: '-4.5px',
          position: 'absolute'
        },
        '&.horizontal': {
          height: 2,
          visibility: 'visible',
          background: config.dropMarkerColor,
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
          border: `1px solid ${config.dropMarkerColor}`,
          boxShadow: '1px 0 2px rgba(255, 255, 255, .4),  -1px 0 2px rgba(255, 255, 255, .4)',
          '&::before': {
            top: 0
          },
          '&::after': {
            bottom: -4
          }
        }
      },
      'craftercms-snackbar': {
        top: 10,
        right: 10,
        position: 'fixed',
        color: '#fff',
        display: 'flex',
        padding: '15px 20px',
        flexGrow: 1,
        flexWrap: 'wrap',
        fontSize: '0.875rem',
        alignItems: 'center',
        fontFamily: '"Source Sans Pro", "Open Sans", sans-serif',
        fontWeight: 400,
        lineHeight: 1.43,
        borderRadius: '4px',
        backgroundColor: config.snackBarBackgroundColor,
        minWidth: '288px',
        transform: 'none',
        transition: 'transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
        boxShadow:
          '0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12)',
        zIndex: config.snackBarZIndex
      },
      'craftercms-dragged-element': {
        display: 'block',
        maxWidth: 200,
        backgroundColor: '#fff',
        color: palette.gray.medium4,
        padding: '5px 10px',
        borderRadius: 10,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        position: 'absolute',
        top: -100
      },
      'craftercms-field-instance-switcher': {
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        backgroundColor: palette.white,
        boxShadow: '0 2px 1px -1px rgba(0,0,0,0.2), 0 1px 1px 0 rgba(0,0,0,0.14), 0 1px 3px 0 rgba(0,0,0,0.12)',
        padding: '10px 14px',
        color: palette.black,
        display: 'flex',
        alignItems: 'center',
        zIndex: 2,
        '& .disable': {
          pointerEvents: 'none',
          opacity: '0.5'
        },
        '& i': {
          display: 'inherit',
          padding: '2px',
          cursor: 'pointer'
        },
        '& svg': {
          fill: 'currentColor',
          width: '1em',
          height: '1em',
          display: 'inline-block',
          fontSize: '1.5rem',
          transition: 'fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
          flexShrink: 0,
          userSelect: 'none'
        }
      },
      // Classes

      '.craftercms-placeholder-spinner': {
        animation: 'craftercms-placeholder-animation 2s linear infinite',
        '& .path': {
          stroke: palette.blue.main,
          animation: 'craftercms-placeholder-inner-animation 1.5s ease-in-out infinite'
        }
      },
      '.craftercms-content-tree-locate': {
        animation: 'craftercms-content-tree-locate-animation 300ms 2 ease-in-out'
      },
      '.craftercms-zone-marker-label__multi-mode': {
        background: config.zoneMarkerOutlineColor,
        top: 0,
        left: 'auto',
        right: 0,
        minWidth: 0,
        marginLeft: 0,
        position: 'absolute',
        padding: '2px 10px',
        borderRadius: 0,
        boxShadow: 'none',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      },
      '.craftercms-ice-on': {
        '& [data-craftercms-model-id], & [data-craftercms-model-id] a': {
          cursor: 'url("/studio/static-assets/images/cursor-edit@1.5x.png"), pointer !important'
        },
        '& [draggable="true"]': {
          cursor: 'url("/studio/static-assets/images/cursor-drag@1.5x.png"), move !important'
        }
      },
      '.mce-content-body': {
        outlineOffset: 5,
        outline: `2px solid ${config.inlineTextEditorOutlineColor}`,
        '&:focus': {
          outline: `5px solid ${config.inlineTextEditorFocusOutlineColor}`
        }
      },
      // Keyframes
      '@keyframes craftercms-uploader-mask-animation': {
        '0%': {
          opacity: 0.4
        },
        '50%': {
          opacity: 0.5
        },
        '100%': {
          opacity: 0.4
        }
      },
      '@keyframes craftercms-placeholder-animation': {
        '100%': { transform: 'rotate(360deg)' }
      },
      '@keyframes craftercms-placeholder-inner-animation': {
        '0%': { strokeDasharray: '1, 150', strokeDashoffset: '0' },
        '50%': { strokeDasharray: '90, 150', strokeDashoffset: '-35' },
        '100%': { strokeDasharray: '90, 150', strokeDashoffset: '-124' }
      },
      '@keyframes craftercms-content-tree-locate-animation': {
        '0%': {
          transform: 'scaleX(1)'
        },
        '50%': {
          transform: 'scale3d(1.05,1.05,1.05)'
        },
        to: {
          transform: 'scaleX(1)'
        }
      }
    }}
  />
);

export function GuestGlobalStyles(props: GuestGlobalStylesProps) {
  return styles;
}

export default GuestGlobalStyles;
