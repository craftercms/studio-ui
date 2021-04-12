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

import TablePagination from '@material-ui/core/TablePagination';
import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { defineMessages, useIntl } from 'react-intl';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    pagination: {
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
    paginationToolbar: {
      padding: '0 0 0 12px',
      minHeight: '30px !important',
      justifyContent: 'space-between',
      '& .MuiTablePagination-spacer': {
        display: 'none'
      },
      '& .MuiTablePagination-spacer + p': {
        display: 'none'
      },
      '& .MuiButtonBase-root': {
        padding: 0
      }
    }
  })
);

const translations = defineMessages({
  previousPage: {
    id: 'pagination.previousPage',
    defaultMessage: 'Previous page'
  },
  nextPage: {
    id: 'pagination.nextPage',
    defaultMessage: 'Next page'
  }
});

interface PaginationProps {
  count: number;
  rowsPerPage: number;
  page: number;
  onChangePage(page: number): void;
  labelRowsPerPage?: React.ReactNode;
  rowsPerPageOptions?: Array<number | { value: number; label: string }>;
}

export default function Pagination(props: PaginationProps) {
  const { count, rowsPerPage, page, onChangePage, labelRowsPerPage = '', rowsPerPageOptions } = props;
  const { formatMessage } = useIntl();
  const classes = useStyles();
  return (
    <TablePagination
      classes={{
        root: classes.pagination,
        selectRoot: 'hidden',
        toolbar: classes.paginationToolbar
      }}
      component="div"
      rowsPerPageOptions={rowsPerPageOptions}
      labelRowsPerPage={labelRowsPerPage}
      count={count}
      rowsPerPage={rowsPerPage}
      page={page}
      backIconButtonProps={{ 'aria-label': formatMessage(translations.previousPage) }}
      nextIconButtonProps={{ 'aria-label': formatMessage(translations.nextPage) }}
      onChangePage={(e, page: number) => onChangePage(page)}
    />
  );
}
