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

import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import GlobalAppGridRow from '../GlobalAppGridRow';
import GlobalAppGridCell from '../GlobalAppGridCell';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import React from 'react';
import { Resource } from '../../models/Resource';
import Checkbox from '@mui/material/Checkbox';
import ItemDisplay from '../ItemDisplay/ItemDisplay';
import useStyles from './styles';
import { SandboxItem } from '../../models/Item';
import { PagedArray } from '../../models/PagedArray';
import Pagination from '../Pagination/Pagination';
import LookupTable from '../../models/LookupTable';

export interface WorkflowStatesGridUIProps {
  resource: Resource<PagedArray<SandboxItem>>;
  selectedItems: LookupTable<SandboxItem>;
  allItemsSelected: boolean;
  hasThisPageItemsChecked: boolean;
  isThisPageIndeterminate: boolean;
  onToggleSelectedItems(): void;
  onItemSelected(item: SandboxItem, value: boolean): void;
  onPageChange(page: number): void;
  onRowSelected(item: SandboxItem): void;
  onRowsPerPageChange?: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
}

export function ItemStatesGridUI(props: WorkflowStatesGridUIProps) {
  const {
    resource,
    onPageChange,
    onRowsPerPageChange,
    selectedItems,
    onItemSelected,
    onRowSelected,
    onToggleSelectedItems,
    allItemsSelected,
    hasThisPageItemsChecked,
    isThisPageIndeterminate
  } = props;
  const itemStates = resource.read();
  const { classes, cx: clsx } = useStyles();

  return (
    <>
      <TableContainer className={classes.tableContainer}>
        <Table size="small">
          <TableHead>
            <GlobalAppGridRow className="hoverDisabled">
              <GlobalAppGridCell align="center">
                <Checkbox
                  checked={allItemsSelected || hasThisPageItemsChecked}
                  indeterminate={hasThisPageItemsChecked ? isThisPageIndeterminate : false}
                  onClick={(e) => onToggleSelectedItems()}
                />
              </GlobalAppGridCell>
              <GlobalAppGridCell className="width60 pl0">
                <Typography variant="subtitle2">
                  <FormattedMessage id="words.item" defaultMessage="Item" />
                </Typography>
              </GlobalAppGridCell>
              <GlobalAppGridCell className="width20">
                <Typography variant="subtitle2">
                  <FormattedMessage id="words.processing" defaultMessage="Processing" />
                </Typography>
              </GlobalAppGridCell>
              <GlobalAppGridCell className="width40">
                <Typography variant="subtitle2">
                  <FormattedMessage id="words.locked" defaultMessage="Locked" />
                </Typography>
              </GlobalAppGridCell>
              <GlobalAppGridCell className="width20">
                <Typography variant="subtitle2">
                  <FormattedMessage id="words.live" defaultMessage="Live" />
                </Typography>
              </GlobalAppGridCell>
              <GlobalAppGridCell className="width20">
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
                className={clsx((Boolean(selectedItems[item.path]) || allItemsSelected) && classes.rowSelected)}
              >
                <GlobalAppGridCell align="center">
                  <Checkbox
                    checked={allItemsSelected || Boolean(selectedItems[item.path])}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    onChange={(e) => {
                      onItemSelected(item, e.target.checked);
                    }}
                  />
                </GlobalAppGridCell>
                <GlobalAppGridCell className="ellipsis maxWidth300 pl0">
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
                <GlobalAppGridCell>
                  <Typography variant="body2">
                    {item.stateMap.systemProcessing ? (
                      <FormattedMessage id="words.yes" defaultMessage="Yes" />
                    ) : (
                      <FormattedMessage id="words.no" defaultMessage="No" />
                    )}
                  </Typography>
                </GlobalAppGridCell>
                <GlobalAppGridCell>
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
                <GlobalAppGridCell>
                  <Typography variant="body2">
                    {item.stateMap.live ? (
                      <FormattedMessage id="words.yes" defaultMessage="Yes" />
                    ) : (
                      <FormattedMessage id="words.no" defaultMessage="No" />
                    )}
                  </Typography>
                </GlobalAppGridCell>
                <GlobalAppGridCell>
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
        mode="table"
        count={itemStates.total}
        rowsPerPage={itemStates.limit}
        page={itemStates && Math.ceil(itemStates.offset / itemStates.limit)}
        onPageChange={(e, page: number) => onPageChange(page)}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </>
  );
}

export default ItemStatesGridUI;
