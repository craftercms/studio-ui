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

export const useStyles = makeStyles(() =>
  createStyles({
    dialogBody: {
      overflow: 'auto'
    },
    btnSpinner: {
      marginLeft: 11,
      marginRight: 11,
      color: '#fff'
    },
    errorPaperRoot: {
      maxHeight: '586px',
      height: '100vh',
      padding: 0
    },
    countContainer: {
      padding: '5px'
    },
    submissionCommentCount: {
      fontSize: '14px',
      color: palette.gray.medium4
    }
  })
);

export const useDeleteDialogUIStyles = makeStyles((theme) =>
  createStyles({
    submissionCommentField: {
      '& .MuiTextField-root': {
        width: '100%'
      }
    },
    depsContainer: {
      background: theme.palette.background.paper,
      border: `1px solid ${theme.palette.divider}`
    }
  })
);
