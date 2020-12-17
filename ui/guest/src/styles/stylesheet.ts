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

import palette from './palette';
import { JssStyle, Styles } from 'jss';

export type GuestRules =
  // Attributes
  | '[draggable="true"]'
  // Elements
  | 'craftercms-asset-uploader-mask-container'
  | 'craftercms-zone-marker'
  | 'craftercms-zone-marker-label'
  | 'craftercms-drop-marker'
  | 'craftercms-snackbar'
  | 'craftercms-dragged-element'
  | 'craftercms-asset-uploader-mask'
  | 'craftercms-field-instance-switcher'
  // Classes
  | '.craftercms-required-validation-failed'
  | '.craftercms-suggestion-validation-failed'
  | '.craftercms-placeholder-spinner'
  | '.craftercms-content-tree-locate'
  | '.craftercms-zone-marker-label__multi-mode'
  | '.craftercms-ice-on'
  | '.mce-content-body'
  // Keyframes
  | '@keyframes craftercms-uploader-mask-animation'
  | '@keyframes craftercms-placeholder-animation'
  | '@keyframes craftercms-placeholder-inner-animation'
  | '@keyframes craftercms-content-tree-locate-animation';

type AllRules = { [key in GuestRules]: any };

const getAllGuestRules: () => string[] = () => {
  const rules: AllRules = {
    '[draggable="true"]': undefined,
    'craftercms-asset-uploader-mask': undefined,
    'craftercms-asset-uploader-mask-container': undefined,
    'craftercms-dragged-element': undefined,
    'craftercms-drop-marker': undefined,
    'craftercms-field-instance-switcher': undefined,
    'craftercms-snackbar': undefined,
    'craftercms-zone-marker': undefined,
    'craftercms-zone-marker-label': undefined,
    '.craftercms-content-tree-locate': undefined,
    '.craftercms-ice-on': undefined,
    '.craftercms-placeholder-spinner': undefined,
    '.craftercms-required-validation-failed': undefined,
    '.craftercms-suggestion-validation-failed': undefined,
    '.craftercms-zone-marker-label__multi-mode': undefined,
    '.mce-content-body': undefined,
    '@keyframes craftercms-content-tree-locate-animation': undefined,
    '@keyframes craftercms-placeholder-animation': undefined,
    '@keyframes craftercms-placeholder-inner-animation': undefined,
    '@keyframes craftercms-uploader-mask-animation': undefined
  };
  return Object.keys(rules);
};

export type GuestStyles<RuleName extends GuestRules | string | number | symbol = string> = Styles<RuleName> & {
  '@global'?: Record<RuleName, JssStyle | string> &
    {
      [key in GuestRules]?: Record<RuleName | GuestRules, JssStyle | string>;
    };
};

export interface GuestStyleSheetConfig<RuleName extends string | number | symbol = string> {
  styles: GuestStyles;
  assetUploadMaskZIndex: number;
  assetUploadMaskBackgroundColor: string;
  zoneLabelBackground: string;
  zoneLabelTextColor: string;
  zoneLabelZIndex: number;
  zoneMarkerZIndex: number;
  dropMarkerZIndex: number;
  dropMarkerColor: string;
  snackBarZIndex: number;
  snackBarBackgroundColor: string;
  zoneMarkerOutlineColor: string;
  validationMandatoryColor: string;
  validationSuggestedColor: string;
  inlineTextEditorOutlineColor: string;
  inlineTextEditorFocusOutlineColor: string;
}

const defaults: GuestStyleSheetConfig = {
  styles: undefined,
  assetUploadMaskZIndex: 1010,
  assetUploadMaskBackgroundColor: 'white',
  dropMarkerZIndex: 1010,
  dropMarkerColor: palette.blue.main,
  snackBarZIndex: 1010,
  snackBarBackgroundColor: 'rgb(49, 49, 49)',
  zoneLabelZIndex: 1010,
  zoneLabelTextColor: '#00270b',
  zoneLabelBackground: 'linear-gradient(to bottom, rgba(48,219,91,0.8) 0%, rgba(52,199,89,0.8) 100%)',
  zoneMarkerZIndex: 1010,
  zoneMarkerOutlineColor: palette.green.main,
  inlineTextEditorOutlineColor: palette.blue.tint,
  inlineTextEditorFocusOutlineColor: palette.blue.main,
  validationMandatoryColor: palette.red.main,
  validationSuggestedColor: palette.orange.main
};

function collectRules(styles): { overrides; global; other } {
  const overrides = {},
    global = {},
    other = {};
  const toBeReturned = { overrides, global, other };
  if (!styles) {
    return toBeReturned;
  }
  const allRules = getAllGuestRules();
  Object.entries(styles).forEach(([rule, body]) => {
    if (rule === '@global') {
      Object.entries(body).forEach(([globalRule, globalRuleBody]) => {
        if (allRules.includes(globalRule)) {
          overrides[globalRule] = globalRuleBody;
        } else {
          global[globalRule] = globalRuleBody;
        }
      });
    } else {
      other[rule] = body;
    }
  });
  return toBeReturned;
}

export default function stylesheet(config: GuestStyleSheetConfig): Styles<'@global'> {
  config = Object.assign({}, defaults, config);
  const { overrides, global, other } = collectRules(config.styles);
  const styles: Record<GuestRules, JssStyle> = {
    // Attributes
    '[draggable="true"]': {
      cursor: 'move !important',
      ...overrides['[draggable="true"]']
    },
    // Elements
    'craftercms-asset-uploader-mask-container': {
      zIndex: config.assetUploadMaskZIndex,
      position: 'absolute',
      pointerEvents: 'none',
      ...overrides['craftercms-asset-uploader-mask-container']
    },
    'craftercms-asset-uploader-mask': {
      background: config.assetUploadMaskBackgroundColor,
      opacity: 0.5,
      height: '100%',
      width: '100%',
      display: 'block',
      transition: 'height 0.3s ease-out',
      animation: 'craftercms-uploader-mask-animation 1.5s infinite ease-in-out',
      ...overrides['craftercms-asset-uploader-mask']
    },
    'craftercms-zone-marker': {
      boxSizing: 'border-box',
      outline: `2px solid ${config.zoneMarkerOutlineColor}`,
      outlineOffset: '-2px',
      textAlign: 'center',
      position: 'absolute',
      zIndex: config.zoneMarkerZIndex,
      pointerEvents: 'none',
      ...overrides['craftercms-zone-marker']
    },
    'craftercms-zone-marker-label': {
      boxSizing: 'border-box',
      background: config.zoneLabelBackground,
      color: config.zoneLabelTextColor,
      padding: '10px',
      borderRadius: 10,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '14px',
      position: 'fixed',
      top: '1em',
      left: '50%',
      right: '0',
      marginLeft: '-150px',
      textAlign: 'center',
      minWidth: '300px',
      maxWidth: '300px',
      overflow: 'hidden',
      fontWeight: 700,
      pointerEvents: 'none',
      zIndex: config.zoneLabelZIndex,
      boxShadow: `0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)`,
      ...overrides['craftercms-zone-marker-label']
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
      },
      ...overrides['craftercms-drop-marker']
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
        '0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12)',
      zIndex: config.snackBarZIndex,
      ...overrides['craftercms-snackbar']
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
      top: -100,
      ...overrides['craftercms-dragged-element']
    },
    'craftercms-field-instance-switcher': {
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      backgroundColor: palette.white,
      boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
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
    '.craftercms-zone-marker-icon': {
      marginLeft: '10px'
    },
    '.craftercms-required-validation-failed': {
      outlineColor: config.validationMandatoryColor,
      '& craftercms-zone-marker-label': {
        background: config.validationMandatoryColor
      },
      ...overrides['.craftercms-required-validation-failed']
    },
    '.craftercms-suggestion-validation-failed': {
      outlineColor: config.validationSuggestedColor,
      '& craftercms-zone-marker-label': {
        background: config.validationSuggestedColor
      },
      ...overrides['.craftercms-suggestion-validation-failed']
    },
    '.craftercms-placeholder-spinner': {
      animation: 'craftercms-placeholder-animation 2s linear infinite',
      '& .path': {
        stroke: palette.blue.main,
        animation: 'craftercms-placeholder-inner-animation 1.5s ease-in-out infinite'
      },
      ...overrides['.craftercms-placeholder-spinner']
    },
    '.craftercms-content-tree-locate': {
      animation: 'craftercms-content-tree-locate-animation 300ms 2 ease-in-out',
      ...overrides['.craftercms-content-tree-locate']
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
      whiteSpace: 'nowrap',
      ...overrides['.craftercms-zone-marker-label__multi-mode']
    },
    '.craftercms-ice-on': overrides['.craftercms-ice-on'],
    '.mce-content-body': {
      outlineOffset: 5,
      outline: `2px solid ${config.inlineTextEditorOutlineColor}`,
      '&:focus': {
        outline: `5px solid ${config.inlineTextEditorFocusOutlineColor}`
      },
      ...overrides['[data-craftercms-model-id][contentEditable="true"]']
    },
    // Keyframes
    '@keyframes craftercms-uploader-mask-animation': overrides['@keyframes craftercms-uploader-mask-animation'] ?? {
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
    '@keyframes craftercms-placeholder-animation': overrides['@keyframes craftercms-placeholder-animation'] ?? {
      '100%': { transform: 'rotate(360deg)' }
    },
    '@keyframes craftercms-placeholder-inner-animation': overrides[
      '@keyframes craftercms-placeholder-inner-animation'
    ] ?? {
      '0%': { strokeDasharray: '1, 150', strokeDashoffset: '0' },
      '50%': { strokeDasharray: '90, 150', strokeDashoffset: '-35' },
      '100%': { strokeDasharray: '90, 150', strokeDashoffset: '-124' }
    },
    '@keyframes craftercms-content-tree-locate-animation': overrides[
      '@keyframes craftercms-content-tree-locate-animation'
    ] ?? {
      '0%': {
        transform: 'scaleX(1)'
      },
      '50%': {
        transform: 'scale3d(1.05,1.05,1.05)'
      },
      to: {
        transform: 'scaleX(1)'
      }
    },
    ...global
  };
  return { '@global': styles, ...other };
}
