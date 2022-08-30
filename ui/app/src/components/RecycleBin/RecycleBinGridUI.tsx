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
import Chip from '@mui/material/Chip';
import ItemDisplay from '../ItemDisplay';
import { status } from '../IconGuideDashlet';
import { useStyles } from './styles';

export function RecycleBinGridUI(props: RecycleBinGridUIProps) {
  const { packages, pageSize, setPageSize, selectedPackages, setSelectedPackages, onOpenPackageDetails } = props;
  const localeBranch = useLocale();
  const { formatMessage } = useIntl();
  const { classes } = useStyles();

  const columns: GridColDef[] = [
    {
      field: 'comment',
      headerName: formatMessage(translations.comment),
      flex: 1,
      sortable: false,
      disableColumnMenu: true
    },
    {
      field: 'numberOfItems',
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
      disableColumnMenu: true,
      renderCell: (params: GridCellParams) => {
        if (params.value === 'no') {
          return <Chip label="No" size="small" />;
        } else {
          return (
            <>
              <ItemDisplay item={status[params.value]} showItemType={false} />{' '}
              {formatMessage(translations[params.value])}
            </>
          );
        }
      }
    },
    {
      field: 'timestamp',
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
      field: 'user',
      headerName: formatMessage(translations.deletedBy),
      flex: 0.6,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params: GridCellParams) => {
        return <Typography variant="body2">{`${params.value.firstName} ${params.value.lastName}`}</Typography>;
      }
    }
  ];

  return (
    <Box display="flex">
      <DataGrid
        autoHeight
        rows={packages}
        columns={columns}
        pageSize={pageSize}
        rowsPerPageOptions={[10, 15, 20]}
        onPageSizeChange={setPageSize}
        selectionModel={selectedPackages}
        onSelectionModelChange={(selectionModel) => setSelectedPackages(selectionModel as number[])}
        onRowClick={(params) => onOpenPackageDetails(params.row)}
        checkboxSelection
        disableSelectionOnClick
        className={classes.tableRoot}
      />
    </Box>
  );
}

export default RecycleBinGridUI;
