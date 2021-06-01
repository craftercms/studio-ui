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
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import { createStyles, makeStyles } from '@material-ui/core/styles';

export interface WorkflowStatesGridUIProps {
  resource: Resource<ItemStates>;
}

const drawerWidth = 250;
const useStyles = makeStyles((theme) =>
  createStyles({
    drawer: {
      width: drawerWidth,
      flexShrink: 0
    },
    drawerPaper: {
      width: drawerWidth,
      padding: theme.spacing(2)
    }
  })
);

export default function ItemStatesGridUI(props: WorkflowStatesGridUIProps) {
  const { resource } = props;
  const states = resource.read();
  const classes = useStyles();

  console.log(states);

  return (
    <div>
      <TableContainer>
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
                  <Typography variant="body2">{item.path}</Typography> {/* TODO: proper type */}
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
      <Drawer
        variant="persistent"
        anchor="right"
        open={true}
        className={classes.drawer}
        classes={{
          paper: classes.drawerPaper
        }}
      >
        <Button endIcon={<CloseIcon />} variant="outlined" onClick={null}>
          <FormattedMessage id="itemStates.clearFilters" defaultMessage="Clear Filters" />
        </Button>
      </Drawer>
    </div>
  );
}
