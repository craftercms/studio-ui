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

import TablePagination, { tablePaginationClasses } from '@mui/material/TablePagination';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { FullSxRecord, PartialSxRecord } from '../../models/CustomRecord';
import { SxProps } from '@mui/system';
import { Theme } from '@mui/material';

export type PaginationClassKey = 'root' | 'selectRoot' | 'toolbar';

export type PaginationFullSx = FullSxRecord<PaginationClassKey>;

export type PaginationPartialSx = PartialSxRecord<PaginationClassKey>;

export interface PaginationProps {
  count: number;
  rowsPerPage: number;
  page: number;
  onPageChange(page: number): void;
  onRowsPerPageChange?: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  labelRowsPerPage?: React.ReactNode;
  rowsPerPageOptions?: Array<number | { value: number; label: string }>;
  classes?: Partial<Record<PaginationClassKey, string>>;
  sx?: PaginationPartialSx;
}

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

function getStyles(sx: PaginationPartialSx): PaginationFullSx {
  return {
    root: {
      display: 'flex',
      '& p': {
        padding: 0,
        margin: 0
      },
      '& svg': {
        top: 'inherit'
      },
      '& .hidden': {
        display: 'none'
      },
      ...sx?.root
    },
    selectRoot: {
      marginRight: 0,
      ...sx?.selectRoot
    },
    toolbar: {
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
      },
      ...sx?.toolbar
    }
  } as Record<PaginationClassKey, SxProps<Theme>>;
}

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
  const sx = getStyles(props.sx);
  return (
    <TablePagination
      classes={{
        root: props.classes?.root,
        selectRoot: props.classes?.selectRoot,
        toolbar: props.classes?.toolbar
      }}
      sx={{
        ...sx.root,
        [`& .${tablePaginationClasses['toolbar']}`]: {
          ...sx.toolbar
        },
        [`& .${tablePaginationClasses['selectRoot']}`]: {
          ...sx.selectRoot
        }
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
