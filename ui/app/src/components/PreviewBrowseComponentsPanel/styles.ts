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

import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme) =>
  createStyles({
    browsePanelWrapper: {
      padding: '16px 0 55px 0'
    },
    paginationContainer: {
      padding: '0 16px'
    },
    list: {
      padding: 0
    },
    search: {
      padding: '15px 15px 0 15px'
    },
    pagination: {
      borderTop: '1px solid rgba(0, 0, 0, 0.12)',
      '& p': {
        padding: 0
      },
      '& svg': {
        top: 'inherit'
      },
      '& .hidden': {
        display: 'none'
      }
    },
    toolbar: {
      padding: 0,
      display: 'flex',
      justifyContent: 'space-between',
      paddingLeft: '12px',
      '& .MuiTablePagination-spacer': {
        display: 'none'
      },
      '& .MuiTablePagination-spacer + p': {
        display: 'none'
      }
    },
    noResultsImage: {
      width: '150px'
    },
    noResultsTitle: {
      fontSize: 'inherit',
      marginTop: '10px'
    },
    select: {
      width: '100%',
      marginTop: '15px'
    },
    emptyState: {
      margin: `${theme.spacing(4)} ${theme.spacing(1)}`
    },
    emptyStateImage: {
      width: '50%',
      marginBottom: theme.spacing(1)
    },
    emptyStateTitle: {
      fontSize: '1em'
    }
  })
);

export const useComponentsPanelUI = makeStyles((theme) =>
  createStyles({
    browsePanelWrapper: {
      padding: '16px 0 55px 0'
    },
    paginationContainer: {
      padding: '0 16px'
    },
    list: {
      padding: 0
    },
    pagination: {
      borderTop: '1px solid rgba(0, 0, 0, 0.12)',
      '& p': {
        padding: 0
      },
      '& svg': {
        top: 'inherit'
      },
      '& .hidden': {
        display: 'none'
      }
    },
    toolbar: {
      padding: 0,
      display: 'flex',
      justifyContent: 'space-between',
      paddingLeft: '12px',
      '& .MuiTablePagination-spacer': {
        display: 'none'
      },
      '& .MuiTablePagination-spacer + p': {
        display: 'none'
      }
    },
    noResultsImage: {
      width: '150px'
    },
    noResultsTitle: {
      fontSize: 'inherit',
      marginTop: '10px'
    },
    emptyState: {
      margin: `${theme.spacing(4)} ${theme.spacing(1)}`
    },
    emptyStateImage: {
      width: '50%',
      marginBottom: theme.spacing(1)
    },
    emptyStateTitle: {
      fontSize: '1em'
    },
    helperTextWrapper: {
      margin: '10px 16px',
      paddingTop: '10px',
      textAlign: 'center',
      lineHeight: 1.2,
      borderTop: `1px solid ${theme.palette.divider}`
    }
  })
);

export default useStyles;
