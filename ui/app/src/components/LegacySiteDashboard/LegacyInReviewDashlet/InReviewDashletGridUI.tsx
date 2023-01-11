/*
 * Copyright (C) 2007-2023 Crafter Software Corporation. All Rights Reserved.
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
import TableContainer from '@mui/material/TableContainer';
import useStyles from '../LegacyRecentActivityDashletGrid/styles';
import TableHead from '@mui/material/TableHead';
import Table from '@mui/material/Table';
import GlobalAppGridRow from '../../GlobalAppGridRow';
import GlobalAppGridCell from '../../GlobalAppGridCell';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import TableBody from '@mui/material/TableBody';

export interface InReviewDashletGridUIProps {
  // items: SandboxItem[]; TODO: update when API returns sandbox Items
  items: any[];
}

export function InReviewDashletGridUI(props: InReviewDashletGridUIProps) {
  const { items } = props;
  const { classes } = useStyles();

  return (
    <TableContainer>
      <Table size="small" className={classes.tableRoot}>
        <TableHead>
          <GlobalAppGridRow className="hoverDisabled">
            <GlobalAppGridCell className="checkbox">
              {/* TODO: add actions/disabled state/indeterminate/checked */}
              <Checkbox />
            </GlobalAppGridCell>
            <GlobalAppGridCell className="width40 pl0">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.item" defaultMessage="Item" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="width15 ellipsis">
              <Typography variant="subtitle2">
                <FormattedMessage id="inReviewDashlet.publishingTarget" defaultMessage="Publishing Target" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="width15 ellipsis">
              <Typography variant="subtitle2">
                <FormattedMessage id="inReviewDashlet.publishingDate" defaultMessage="Publishing Date" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="width15 ellipsis">
              <Typography variant="subtitle2">
                <FormattedMessage id="inReviewDashlet.lastEditedBy" defaultMessage="Last Edited By" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="width15 ellipsis">
              <Typography variant="subtitle2">
                <FormattedMessage id="inReviewDashlet.lastEdited" defaultMessage="Last Edited" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="checkbox" />
          </GlobalAppGridRow>
        </TableHead>
        <TableBody>
          {items.map((item, index) => (
            // TODO: onClick - item checked
            <GlobalAppGridRow key={index}>
              <GlobalAppGridCell className="checkbox">
                <Checkbox
                // disabled={item.stateMap.deleted}
                // checked={item.stateMap.deleted ? false : Boolean(selectedLookup[item.path])}
                // onClick={(e) => {
                //   e.stopPropagation();
                // }}
                // onChange={() => {
                //   onItemChecked(item.path);
                // }}
                />
              </GlobalAppGridCell>
              <GlobalAppGridCell className="ellipsis width40 pl0">
                {/* TODO: itemDisplay when API returns correct value */}
              </GlobalAppGridCell>
              <GlobalAppGridCell className="width15">{item.publishingTarget}</GlobalAppGridCell>
              <GlobalAppGridCell className="width15"></GlobalAppGridCell>
              <GlobalAppGridCell className="width15 ellipsis" title={item.submitter?.username}>
                {item.submitter?.username}
              </GlobalAppGridCell>
              <GlobalAppGridCell className="width15 ellipsis"></GlobalAppGridCell>
              <GlobalAppGridCell className="checkbox"></GlobalAppGridCell>
            </GlobalAppGridRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default InReviewDashletGridUI;
