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
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import useStyles from './styles';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { ItemStateMap, ItemStates, SandboxItem } from '../../models/Item';
import LookupTable from '../../models/LookupTable';
import ItemStateIcon from '../ItemStateIcon';
import { getItemPublishingTargetText, getItemStateText } from '../ItemDisplay/utils';
import ItemPublishingTargetIcon from '../ItemPublishingTargetIcon';
import { Divider } from '@material-ui/core';
import PersistentDrawer from '../PersistentDrawer';
import { PagedArray } from '../../models/PagedArray';
import Pagination from '../Pagination';
import Box from '@material-ui/core/Box';

export interface WorkflowStatesGridUIProps {
  resource: Resource<PagedArray<SandboxItem>>;
  openFiltersDrawer: boolean;
  pathRegex: string;
  filtersLookup: LookupTable<boolean>;
  onPathRegexInputChanges(value: string): void;
  onFilterChecked(id: string, value): void;
  onClearFilters(): void;
  onChangePage(page: number): void;
  onChangeRowsPerPage?: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
}

const drawerWidth = 260;

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
    openFiltersDrawer,
    onFilterChecked,
    filtersLookup,
    pathRegex,
    onPathRegexInputChanges,
    onClearFilters,
    onChangePage,
    onChangeRowsPerPage
  } = props;
  const itemStates = resource.read();
  const classes = useStyles();

  return (
    <div>
      <Box
        display="flex"
        flexDirection="column"
        width={`calc(100% - ${openFiltersDrawer ? drawerWidth : 0}px)`}
        className={classes.wrapper}
      >
        <TableContainer className={classes.tableContainer}>
          <Table>
            <TableHead>
              <GlobalAppGridRow className="hoverDisabled">
                <GlobalAppGridCell className="bordered">
                  <Typography variant="subtitle2">
                    <Checkbox />
                  </Typography>
                </GlobalAppGridCell>
                <GlobalAppGridCell className="bordered">
                  <Typography variant="subtitle2">
                    <FormattedMessage id="words.item" defaultMessage="Item" />
                  </Typography>
                </GlobalAppGridCell>
                <GlobalAppGridCell className="bordered">
                  <Typography variant="subtitle2">
                    <FormattedMessage id="words.processing" defaultMessage="Processing" />
                  </Typography>
                </GlobalAppGridCell>
                <GlobalAppGridCell className="bordered">
                  <Typography variant="subtitle2">
                    <FormattedMessage id="words.locked" defaultMessage="Locked" />
                  </Typography>
                </GlobalAppGridCell>
                <GlobalAppGridCell className="bordered">
                  <Typography variant="subtitle2">
                    <FormattedMessage id="words.live" defaultMessage="Live" />
                  </Typography>
                </GlobalAppGridCell>
                <GlobalAppGridCell className="bordered">
                  <Typography variant="subtitle2">
                    <FormattedMessage id="words.staged" defaultMessage="Staged" />
                  </Typography>
                </GlobalAppGridCell>
              </GlobalAppGridRow>
            </TableHead>
            <TableBody>
              {itemStates.map((item) => (
                <GlobalAppGridRow key={item.id}>
                  <GlobalAppGridCell align="left">
                    <Checkbox />
                  </GlobalAppGridCell>
                  <GlobalAppGridCell>
                    <ItemDisplay item={item} />
                    <Typography variant="caption" component="p" className={classes.itemPath}>
                      {item.path}
                    </Typography>
                  </GlobalAppGridCell>
                  <GlobalAppGridCell>
                    {item.stateMap.systemProcessing ? (
                      <FormattedMessage id="words.yes" defaultMessage="Yes" />
                    ) : (
                      <FormattedMessage id="words.no" defaultMessage="No" />
                    )}
                  </GlobalAppGridCell>
                  <GlobalAppGridCell>
                    {item.stateMap.locked ? (
                      // TODO: according to design, this needs ellipsis
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
                  </GlobalAppGridCell>
                  <GlobalAppGridCell>
                    {item.stateMap.live ? (
                      <FormattedMessage id="words.yes" defaultMessage="Yes" />
                    ) : (
                      <FormattedMessage id="words.no" defaultMessage="No" />
                    )}
                  </GlobalAppGridCell>
                  <GlobalAppGridCell>
                    {item.stateMap.staged ? (
                      <FormattedMessage id="words.yes" defaultMessage="Yes" />
                    ) : (
                      <FormattedMessage id="words.no" defaultMessage="No" />
                    )}
                  </GlobalAppGridCell>
                </GlobalAppGridRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Pagination
          rowsPerPageOptions={[5, 10, 15]}
          classes={{ root: classes.paginationRoot }}
          count={itemStates.total}
          rowsPerPage={itemStates.limit}
          page={itemStates && Math.ceil(itemStates.offset / itemStates.limit)}
          onChangePage={(page: number) => onChangePage(page)}
          onChangeRowsPerPage={onChangeRowsPerPage}
        />
      </Box>
      <PersistentDrawer
        open={openFiltersDrawer}
        width={drawerWidth}
        anchor="right"
        classes={{
          drawerPaper: classes.drawerPaper
        }}
      >
        <form noValidate autoComplete="off">
          <Button
            disabled={pathRegex === '' && !Object.values(filtersLookup).some((value) => value)}
            endIcon={<CloseIcon />}
            variant="outlined"
            onClick={onClearFilters}
            fullWidth
          >
            <FormattedMessage id="itemStates.clearFilters" defaultMessage="Clear Filters" />
          </Button>
          <TextField
            value={pathRegex}
            className={classes.inputPath}
            onChange={(e) => onPathRegexInputChanges(e.target.value)}
            label={<FormattedMessage id="itemStates.pathRegex" defaultMessage="Path (regex)" />}
            fullWidth
            variant="outlined"
            FormHelperTextProps={{
              className: classes.helperText
            }}
            helperText={
              <FormattedMessage id="itemStates.pathRegexHelperText" defaultMessage="Use a path-matching regex" />
            }
          />
          <FormControl component="fieldset" className={classes.formControl}>
            <FormLabel component="legend" className={classes.formLabel}>
              <FormattedMessage id="itemStates.showItemsIn" defaultMessage="Show Items In" />
            </FormLabel>
            <FormGroup className={classes.formGroup}>
              <FormControlLabel
                classes={{ label: classes.iconLabel }}
                control={
                  <Checkbox
                    checked={Object.values(filtersLookup).some((value) => value)}
                    indeterminate={
                      Object.values(filtersLookup).every((value) => value)
                        ? null
                        : Object.values(filtersLookup).some((value) => value)
                    }
                    name="all"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      onFilterChecked(event.target.name, !Object.values(filtersLookup).every((value) => value));
                    }}
                  />
                }
                label={<FormattedMessage id="itemStates.allStates" defaultMessage="All states" />}
              />
              <Divider />
              {states.map((id) => (
                <FormControlLabel
                  key={id}
                  classes={{ label: classes.iconLabel }}
                  control={
                    <Checkbox
                      checked={filtersLookup[id]}
                      name={id}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        onFilterChecked(event.target.name, event.target.checked);
                      }}
                    />
                  }
                  label={
                    ['staged', 'live'].includes(id) ? (
                      <>
                        <ItemPublishingTargetIcon item={{ stateMap: { [id]: true } } as SandboxItem} />
                        {getItemPublishingTargetText({ [id]: true } as ItemStateMap)}
                      </>
                    ) : (
                      <>
                        <ItemStateIcon item={{ stateMap: { [id]: true } } as SandboxItem} />
                        {getItemStateText({ [id]: true } as ItemStateMap)}
                      </>
                    )
                  }
                />
              ))}
            </FormGroup>
          </FormControl>
        </form>
      </PersistentDrawer>
    </div>
  );
}
