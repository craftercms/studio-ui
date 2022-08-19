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

import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import { RecycleBinPackageDialogContainerProps } from './utils';
import { FormattedMessage, useIntl } from 'react-intl';
import { nou } from '../../utils/object';
import Chip from '@mui/material/Chip';
import ItemDisplay from '../ItemDisplay';
import { status } from '../IconGuideDashlet';
import { translations } from '../RecycleBin/translations';
import useLocale from '../../hooks/useLocale';
import GlobalAppGridCell from '../GlobalAppGridCell';
import Box from '@mui/material/Box';
import { DataGrid, GridCellParams, GridColDef } from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import { DialogBody } from '../DialogBody';
import { DialogFooter } from '../DialogFooter';
import Button from '@mui/material/Button';
import { SystemIcon } from '../SystemIcon';
import { useStyles } from '../RecycleBin';

// TODO: Add loader
export function RecycleBinPackageDialogContainer(props: RecycleBinPackageDialogContainerProps) {
  const { recycleBinPackage } = props;
  const { formatMessage } = useIntl();
  const localeBranch = useLocale();
  const { classes } = useStyles();

  // TODO: i18n
  const itemsColumns: GridColDef[] = [
    {
      field: 'item',
      headerName: formatMessage(translations.item),
      sortable: false,
      disableColumnMenu: true,
      flex: 1,
      renderCell: (params: GridCellParams) => {
        return <Typography variant="body2">{params.row.label}</Typography>;
      }
    },
    {
      field: 'lastModified',
      headerName: formatMessage(translations.lastModified),
      sortable: false,
      disableColumnMenu: true,
      flex: 1,
      renderCell: (params: GridCellParams) => {
        const date = new Intl.DateTimeFormat(localeBranch.localeCode, localeBranch.dateTimeFormatOptions).format(
          new Date(params.row.dateModified)
        );
        return (
          <Typography variant="body2">
            {date} by {params.row.modifier}
          </Typography>
        );
      }
    },
    {
      field: 'lastPublished',
      headerName: formatMessage(translations.lastPublish),
      sortable: false,
      disableColumnMenu: true,
      flex: 1
    }
  ];

  return (
    <>
      <DialogBody>
        {recycleBinPackage && (
          <>
            <Box display="flex" sx={{ mb: 5 }}>
              <TableContainer>
                <Table
                  sx={{
                    [`& .${tableCellClasses.root}`]: {
                      borderBottom: 'none'
                    }
                  }}
                >
                  <TableBody>
                    <TableRow>
                      <GlobalAppGridCell component="th" scope="row" className="width15">
                        <FormattedMessage id="words.comment" defaultMessage="Comment" />
                      </GlobalAppGridCell>
                      <GlobalAppGridCell>{recycleBinPackage.comment}</GlobalAppGridCell>
                    </TableRow>
                    <TableRow>
                      <GlobalAppGridCell component="th" scope="row" className="width15">
                        <FormattedMessage id="words.published" defaultMessage="Published" />
                      </GlobalAppGridCell>
                      <TableCell>
                        {nou(recycleBinPackage.published) ? (
                          <Chip label="No" size="small" />
                        ) : (
                          <>
                            <ItemDisplay item={status[recycleBinPackage.published]} showItemType={false} />{' '}
                            {formatMessage(translations[recycleBinPackage.published])}
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <GlobalAppGridCell component="th" scope="row" className="width15">
                        <FormattedMessage id="recycleBin.deletedBy" defaultMessage="Deleted by" />
                      </GlobalAppGridCell>
                      <GlobalAppGridCell>{recycleBinPackage.deletedBy}</GlobalAppGridCell>
                    </TableRow>
                    <TableRow>
                      <GlobalAppGridCell component="th" scope="row" className="width15">
                        <FormattedMessage id="recycleBin.dateDeleted" defaultMessage="Date deleted" />
                      </GlobalAppGridCell>
                      <GlobalAppGridCell>
                        {new Intl.DateTimeFormat(localeBranch.localeCode, localeBranch.dateTimeFormatOptions).format(
                          new Date(recycleBinPackage.dateDeleted)
                        )}
                      </GlobalAppGridCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <Box display="flex" className={classes.itemTableContainer}>
              <DataGrid
                autoHeight
                columns={itemsColumns}
                rows={recycleBinPackage.items}
                pageSize={10}
                disableSelectionOnClick
                classes={{
                  root: classes.noBorder,
                  columnHeaders: classes.noBorder,
                  cell: classes.noBorder,
                  'cell--withRenderer': classes.noBorder,
                  footerContainer: classes.noBorder
                }}
              />
            </Box>
          </>
        )}
      </DialogBody>
      <DialogFooter className={classes.recycleBinPackageDialogFooter}>
        <Button
          variant="text"
          startIcon={<SystemIcon icon={{ id: '@mui/icons-material/SettingsBackupRestoreOutlined' }} />}
        >
          <FormattedMessage id="words.restore" defaultMessage="Restore" />
        </Button>
        <Button variant="text" startIcon={<SystemIcon icon={{ id: '@mui/icons-material/CloudUploadOutlined' }} />}>
          <FormattedMessage id="recycleBinPackageDialog.publishDeletion" defaultMessage="Publish Deletion" />
        </Button>
      </DialogFooter>
    </>
  );
}
