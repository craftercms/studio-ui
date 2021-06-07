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

import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import GlobalAppGridRow from '../GlobalAppGridRow';
import GlobalAppGridCell from '../GlobalAppGridCell';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import React from 'react';
import { Resource } from '../../models/Resource';
import Checkbox from '@material-ui/core/Checkbox';
import ItemDisplay from '../ItemDisplay';
import useStyles from './styles';
import { ItemStates, SandboxItem } from '../../models/Item';
import { PagedArray } from '../../models/PagedArray';
import Pagination from '../Pagination';
import clsx from 'clsx';
import LookupTable from '../../models/LookupTable';

export interface WorkflowStatesGridUIProps {
  resource: Resource<PagedArray<SandboxItem>>;
  rowsPerPageOptions?: number[];
  selectedItems: LookupTable<SandboxItem>;
  onToggleSelectedItems(): void;
  onItemSelected(item: SandboxItem, value: boolean): void;
  onChangePage(page: number): void;
  onRowSelected(item: SandboxItem): void;
  onChangeRowsPerPage?: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
}

export const drawerWidth = 260;

export const states: ItemStates[] = [
  'new',
  'modified',
  'deleted',
  'locked',
  'systemProcessing',
  'submitted',
  'scheduled',
  'staged',
  'live'
];

export default function ItemStatesGridUI(props: WorkflowStatesGridUIProps) {
  const {
    resource,
    onChangePage,
    onChangeRowsPerPage,
    rowsPerPageOptions = [5, 10, 15],
    selectedItems,
    onItemSelected,
    onRowSelected,
    onToggleSelectedItems
  } = props;
  const itemStates = resource.read();
  const classes = useStyles();

  return (
    <>
      <TableContainer className={classes.tableContainer}>
        <Table>
          <TableHead>
            <GlobalAppGridRow className="hoverDisabled">
              <GlobalAppGridCell align="center" className="bordered padded10">
                <Checkbox checked={false} onClick={(e) => onToggleSelectedItems()} />
              </GlobalAppGridCell>
              <GlobalAppGridCell className="bordered width60">
                <Typography variant="subtitle2">
                  <FormattedMessage id="words.item" defaultMessage="Item" />
                </Typography>
              </GlobalAppGridCell>
              <GlobalAppGridCell className="bordered width20 padded10">
                <Typography variant="subtitle2">
                  <FormattedMessage id="words.processing" defaultMessage="Processing" />
                </Typography>
              </GlobalAppGridCell>
              <GlobalAppGridCell className="bordered width40 padded10">
                <Typography variant="subtitle2">
                  <FormattedMessage id="words.locked" defaultMessage="Locked" />
                </Typography>
              </GlobalAppGridCell>
              <GlobalAppGridCell className="bordered width20 padded10">
                <Typography variant="subtitle2">
                  <FormattedMessage id="words.live" defaultMessage="Live" />
                </Typography>
              </GlobalAppGridCell>
              <GlobalAppGridCell className="bordered width20 padded10">
                <Typography variant="subtitle2">
                  <FormattedMessage id="words.staged" defaultMessage="Staged" />
                </Typography>
              </GlobalAppGridCell>
            </GlobalAppGridRow>
          </TableHead>
          <TableBody>
            {itemStates.map((item) => (
              <GlobalAppGridRow
                key={item.id}
                onClick={() => onRowSelected(item)}
                className={clsx(Boolean(selectedItems[item.path]) && classes.rowSelected)}
              >
                <GlobalAppGridCell align="center" className="padded10">
                  <Checkbox
                    checked={Boolean(selectedItems[item.path])}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    onChange={(e) => {
                      onItemSelected(item, e.target.checked);
                    }}
                  />
                </GlobalAppGridCell>
                <GlobalAppGridCell className="ellipsis maxWidth300">
                  <ItemDisplay item={item} />
                  <Typography
                    title={item.path}
                    variant="caption"
                    component="p"
                    className={clsx(classes.itemPath, classes.ellipsis)}
                  >
                    {item.path}
                  </Typography>
                </GlobalAppGridCell>
                <GlobalAppGridCell className="padded10">
                  <Typography variant="body2">
                    {item.stateMap.systemProcessing ? (
                      <FormattedMessage id="words.yes" defaultMessage="Yes" />
                    ) : (
                      <FormattedMessage id="words.no" defaultMessage="No" />
                    )}
                  </Typography>
                </GlobalAppGridCell>
                <GlobalAppGridCell className="padded10">
                  <Typography variant="body2" className={classes.ellipsis} title={item.lockOwner}>
                    {item.stateMap.locked ? (
                      <FormattedMessage
                        id="itemStates.lockedBy"
                        defaultMessage="By {owner}"
                        values={{
                          owner: item.lockOwner
                        }}
                      />
                    ) : (
                      <FormattedMessage id="words.no" defaultMessage="No" />
                    )}
                  </Typography>
                </GlobalAppGridCell>
                <GlobalAppGridCell className="padded10">
                  <Typography variant="body2">
                    {item.stateMap.live ? (
                      <FormattedMessage id="words.yes" defaultMessage="Yes" />
                    ) : (
                      <FormattedMessage id="words.no" defaultMessage="No" />
                    )}
                  </Typography>
                </GlobalAppGridCell>
                <GlobalAppGridCell className="padded10">
                  <Typography variant="body2">
                    {item.stateMap.staged ? (
                      <FormattedMessage id="words.yes" defaultMessage="Yes" />
                    ) : (
                      <FormattedMessage id="words.no" defaultMessage="No" />
                    )}
                  </Typography>
                </GlobalAppGridCell>
              </GlobalAppGridRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        rowsPerPageOptions={rowsPerPageOptions}
        classes={{ root: classes.paginationRoot }}
        count={itemStates.total}
        rowsPerPage={itemStates.limit}
        page={itemStates && Math.ceil(itemStates.offset / itemStates.limit)}
        onChangePage={(page: number) => onChangePage(page)}
        onChangeRowsPerPage={onChangeRowsPerPage}
      />
    </>
  );
}
