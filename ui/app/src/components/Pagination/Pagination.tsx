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

import TablePagination from '@mui/material/TablePagination';
import React from 'react';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { defineMessages, useIntl } from 'react-intl';
import clsx from 'clsx';

export interface PaginationProps {
  count: number;
  rowsPerPage: number;
  page: number;
  onPageChange(page: number): void;
  onRowsPerPageChange?: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  labelRowsPerPage?: React.ReactNode;
  rowsPerPageOptions?: Array<number | { value: number; label: string }>;
  classes?: Partial<Record<'root', string>>;
}

const useStyles = makeStyles(() =>
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
    },
    selectRoot: {
      marginRight: 0
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

export default function Pagination(props: PaginationProps) {
  const {
    count,
    rowsPerPage,
    page,
    onPageChange,
    labelRowsPerPage = '',
    rowsPerPageOptions,
    onRowsPerPageChange
  } = props;
  const { formatMessage } = useIntl();
  const classes = useStyles();
  return (
    <TablePagination
      classes={{
        root: clsx(classes.pagination, props.classes?.root),
        selectRoot: rowsPerPageOptions ? classes.selectRoot : 'hidden',
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
      onPageChange={(e, page: number) => onPageChange(page)}
      onRowsPerPageChange={onRowsPerPageChange}
    />
  );
}
