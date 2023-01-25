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

export type ContentTypeEditorClassKey = 'drawer' | 'fieldsAccordion';

export type ContentTypeEditorFullSx = FullSxRecord<ContentTypeEditorClassKey>;

export type ContentTypeEditorPartialSx = PartialSxRecord<ContentTypeEditorClassKey>;

const drawerWidth = 286;
function getStyles(sx?: ContentTypeEditorPartialSx): ContentTypeEditorFullSx {
  return {
    drawer: {
      width: drawerWidth,
      marginTop: '65px',
      flexShrink: 0,
      '& .MuiDrawer-paper': {
        width: drawerWidth,
        p: 2,
        top: '65px',
        bottom: 0,
        boxSizing: 'border-box',
        height: 'auto'
      },
      ...sx?.drawer
    },
    fieldsAccordion: {
      marginTop: 2,
      border: 'none',
      boxShadow: 'none',
      '& .MuiAccordionSummary-root': {
        minHeight: 'unset !important',
        borderRadius: '4px',
        backgroundColor: (theme) => theme.palette.background.default,
        '& .MuiAccordionSummary-content': {
          mt: '8px !important',
          mb: '8px !important',
          '& .MuiTypography-root': {
            textTransform: 'uppercase',
            fontSize: '12px',
            fontWeight: '600'
          }
        }
      }
    }
  };
}

export default getStyles;
