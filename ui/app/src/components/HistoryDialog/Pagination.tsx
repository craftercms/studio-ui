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

import { useIntl } from 'react-intl';
import TablePagination from '@mui/material/TablePagination';
import translations from './translations';
import React from 'react';
import { paginationStyles } from './HistoryDialog';
import { PaginationProps } from './utils';

// TODO: Check if we can use the components/Pagination component

export function Pagination(props: PaginationProps) {
  const classes = paginationStyles({});
  const { formatMessage } = useIntl();
  const { count, page, rowsPerPage } = props;
  return (
    <TablePagination
      className={classes.pagination}
      classes={{ root: classes.pagination, selectRoot: 'hidden', toolbar: classes.toolbar }}
      component="div"
      labelRowsPerPage=""
      rowsPerPageOptions={[10, 20, 30]}
      count={count}
      rowsPerPage={rowsPerPage}
      page={page}
      backIconButtonProps={{
        'aria-label': formatMessage(translations.previousPage)
      }}
      nextIconButtonProps={{
        'aria-label': formatMessage(translations.nextPage)
      }}
      onPageChange={(e: React.MouseEvent<HTMLButtonElement>, nextPage: number) => props.onPageChanged(nextPage)}
    />
  );
}
