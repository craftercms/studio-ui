/*
 * Copyright (C) 2007-2023 Crafter Software Corporation. All Rights Reserved.
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

import { FullSxRecord, PartialSxRecord } from '../../models';

export type ContentTypeEditorClassKey =
  | 'body'
  | 'drawer'
  | 'fieldsAccordion'
  | 'contentTypeSingleField'
  | 'contentTypeRepeatField'
  | 'semibold'
  | 'contentTypeInfo'
  | 'typeItem';

export type ContentTypeEditorFullSx = FullSxRecord<ContentTypeEditorClassKey>;

export type ContentTypeEditorPartialSx = PartialSxRecord<ContentTypeEditorClassKey>;

const drawerWidth = 286;
function getStyles(sx?: ContentTypeEditorPartialSx): ContentTypeEditorFullSx {
  return {
    drawer: {
      width: drawerWidth,
      marginTop: '65px',
      flexShrink: 0,
      backgroundColor: (theme) => theme.palette.background.default,
      '& .MuiDrawer-paper': {
        width: drawerWidth,
        p: 2,
        top: '65px',
        bottom: 0,
        boxSizing: 'border-box',
        height: 'auto',
        backgroundColor: (theme) => theme.palette.background.default
      },
      ...sx?.drawer
    },
    body: {
      height: 'calc(100vh - 65px)',
      overflowY: 'scroll',
      ...sx?.body
    },
    fieldsAccordion: {
      marginTop: 2,
      border: 'none',
      boxShadow: 'none',
      backgroundImage: 'none',
      backgroundColor: (theme) => theme.palette.background.default,
      '& .MuiAccordionSummary-root': {
        minHeight: 'unset !important',
        borderRadius: '4px',
        backgroundColor: (theme) => theme.palette.background.paper,
        '& .MuiAccordionSummary-content': {
          mt: '8px !important',
          mb: '8px !important',
          '& .MuiTypography-root': {
            textTransform: 'uppercase',
            fontSize: '12px',
            fontWeight: '600'
          }
        }
      },
      ...sx?.fieldsAccordion
    },
    contentTypeSingleField: {
      width: '100%',
      justifyContent: 'flex-start',
      mb: 1
      // backgroundColor: (theme) => theme.palette.action.selected // TODO: blueish color, not gray
      // backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.16)')
    },
    contentTypeRepeatField: {
      backgroundColor: (theme) => theme.palette.secondary.dark,
      p: 1
    },
    semibold: {
      fontWeight: 600
    },
    contentTypeInfo: {
      display: 'flex',
      boxShadow: 'none',
      backgroundImage: 'none',
      ...sx?.contentTypeInfo
    },
    typeItem: {
      pl: 0,
      ...sx?.typeItem
    }
  };
}

export default getStyles;
