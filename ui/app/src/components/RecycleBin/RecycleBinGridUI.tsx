/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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

import React from 'react';
import { DataGrid, GridCellParams, GridColDef } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import useLocale from '../../hooks/useLocale';
import Typography from '@mui/material/Typography';
import { translations } from './translations';
import { useIntl } from 'react-intl';
import { RecycleBinGridUIProps } from './utils';

export function RecycleBinGridUI(props: RecycleBinGridUIProps) {
  const { packages } = props;
  const localeBranch = useLocale();
  const { formatMessage } = useIntl();

  const columns: GridColDef[] = [
    {
      field: 'comment',
      headerName: formatMessage(translations.comment),
      flex: 1,
      sortable: false,
      disableColumnMenu: true
    },
    {
      field: 'numOfItems',
      headerName: formatMessage(translations.numOfItems),
      flex: 0.3,
      sortable: false,
      disableColumnMenu: true
    },
    {
      field: 'published',
      headerName: formatMessage(translations.published),
      flex: 0.3,
      sortable: false,
      disableColumnMenu: true
    },
    {
      field: 'dateDeleted',
      headerName: formatMessage(translations.dateDeleted),
      flex: 0.4,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params: GridCellParams) => {
        const date = new Intl.DateTimeFormat(localeBranch.localeCode, localeBranch.dateTimeFormatOptions).format(
          new Date(params.value as Date)
        );
        return (
          <Typography variant="body2" title={date?.toString()}>
            {date}
          </Typography>
        );
      }
    },
    {
      field: 'deletedBy',
      headerName: formatMessage(translations.deletedBy),
      flex: 0.6,
      sortable: false,
      disableColumnMenu: true
    }
  ];

  return (
    <Box display="flex">
      <DataGrid
        autoHeight
        rows={packages}
        columns={columns}
        pageSize={10} /* TODO: pending */
        rowsPerPageOptions={[10, 15, 20]}
        checkboxSelection
        disableSelectionOnClick
      />
    </Box>
  );
}

export default RecycleBinGridUI;
