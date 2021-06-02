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
import { ItemStates } from '../../models/WorkflowState';
import { Resource } from '../../models/Resource';
import Checkbox from '@material-ui/core/Checkbox';
import ItemDisplay from '../ItemDisplay';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import ResizeableDrawer from '../../modules/Preview/ResizeableDrawer';

export interface WorkflowStatesGridUIProps {
  resource: Resource<ItemStates>;
  openFiltersDrawer: boolean;
}

const drawerWidth = 240;
const useStyles = makeStyles((theme) =>
  createStyles({
    drawerPaper: {
      padding: theme.spacing(2)
    },
    tableContainer: {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen
      })
    },
    itemPath: {
      color: theme.palette.text.secondary
    }
  })
);

export default function ItemStatesGridUI(props: WorkflowStatesGridUIProps) {
  const { resource, openFiltersDrawer } = props;
  const states = resource.read();
  const classes = useStyles();

  return (
    <div>
      <TableContainer
        className={classes.tableContainer}
        style={{
          width: `calc(100% - ${openFiltersDrawer ? drawerWidth : 0}px`,
          marginRight: openFiltersDrawer ? drawerWidth : 0
        }}
      >
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
            {states.items.map((item) => (
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
      {/* TODO: I don't think this should be resizable */}
      <ResizeableDrawer
        open={openFiltersDrawer}
        width={drawerWidth}
        onWidthChange={null}
        anchor="right"
        classes={{
          drawerPaper: classes.drawerPaper
        }}
      >
        <Button endIcon={<CloseIcon />} variant="outlined" onClick={null} fullWidth>
          <FormattedMessage id="itemStates.clearFilters" defaultMessage="Clear Filters" />
        </Button>
      </ResizeableDrawer>
    </div>
  );
}
