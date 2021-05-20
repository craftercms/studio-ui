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
import { createStyles, makeStyles } from '@material-ui/core/styles';
import palette from '../../styles/palette';

export const useStyles = makeStyles((theme) =>
  createStyles({
    resizeHandle: {
      width: '2px',
      minWidth: '2px',
      margin: '0px 5px',
      cursor: 'ew-resize',
      padding: '4px 0 0',
      backgroundColor: 'rgba(0, 0, 0, 0.12)',
      transition: 'width 200ms',
      '&:hover': {
        width: '4px',
        visibility: 'visible',
        backgroundColor: palette.blue.tint
      }
    },
    resizeHandleActive: {
      width: '4px',
      visibility: 'visible',
      backgroundColor: palette.blue.tint
    }
  })
);

export default useStyles;
