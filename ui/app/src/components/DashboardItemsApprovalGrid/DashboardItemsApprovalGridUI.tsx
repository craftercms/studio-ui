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

import React, { Fragment } from 'react';
import { Resource } from '../../models/Resource';
import TableContainer from '@material-ui/core/TableContainer';
import useStyles from './styles';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import Typography from '@material-ui/core/Typography/Typography';
import { FormattedMessage } from 'react-intl';
import TableBody from '@material-ui/core/TableBody';
import IconButton from '@material-ui/core/IconButton';
import Collapse from '@material-ui/core/Collapse';
import Box from '@material-ui/core/Box';
import ExpandMoreIcon from '@material-ui/icons/ExpandMoreRounded';
import { LegacyItem } from '../../models/Item';
import GlobalAppGridRow from '../GlobalAppGridRow';
import GlobalAppGridCell from '../GlobalAppGridCell';
import LookupTable from '../../models/LookupTable';
import Checkbox from '@material-ui/core/Checkbox';

interface DashboardItemsApprovalGridUIProps {
  resource: Resource<LegacyItem[]>;
  onExpandedRow(path: string, value: boolean): void;
  expandedLookup: LookupTable<boolean>;
}

export default function DashboardItemsApprovalGridUI(props: DashboardItemsApprovalGridUIProps) {
  const { resource, onExpandedRow, expandedLookup } = props;
  const items = resource.read();
  const classes = useStyles();

  return (
    <TableContainer>
      <Table className={classes.tableRoot} size="small">
        <TableHead>
          <GlobalAppGridRow className="hoverDisabled">
            <GlobalAppGridCell className="checkbox bordered">
              <Checkbox />
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width25 padded0">
              <Typography variant="subtitle2">
                <FormattedMessage id="dashboardItemsApproval.itemName" defaultMessage="Item Name" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width10">
              <Typography variant="subtitle2">
                <FormattedMessage id="dashboardItemsApproval.view" defaultMessage="View" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width25">
              <Typography variant="subtitle2">
                <FormattedMessage id="dashboardItemsApproval.url" defaultMessage="Url" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width10">
              <Typography variant="subtitle2">
                <FormattedMessage id="dashboardItemsApproval.publishingTarget" defaultMessage="Publishing Target" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width10">
              <Typography variant="subtitle2">
                <FormattedMessage id="dashboardItemsApproval.publishingDate" defaultMessage="Publishing Date" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width10">
              <Typography variant="subtitle2">
                <FormattedMessage id="dashboardItemsApproval.lastEditedBy" defaultMessage="Last Edited By" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width10">
              <Typography variant="subtitle2">
                <FormattedMessage id="dashboardItemsApproval.lastEdited" defaultMessage="Last Edited" />
              </Typography>
            </GlobalAppGridCell>
          </GlobalAppGridRow>
        </TableHead>
        <TableBody>
          {items.map((item, i) => (
            <Fragment key={i}>
              <GlobalAppGridRow onClick={() => onExpandedRow(item.uri, !expandedLookup[item.uri])}>
                <GlobalAppGridCell colSpan={8} className="expandableCell">
                  <Box display="flex">
                    <IconButton size="small">
                      <ExpandMoreIcon />
                    </IconButton>
                    <Typography>{item.name}</Typography>
                  </Box>
                </GlobalAppGridCell>
              </GlobalAppGridRow>
              <GlobalAppGridRow className="hoverDisabled">
                <GlobalAppGridCell colSpan={8} className="padded0">
                  <Collapse in={expandedLookup[item.uri] ?? false}>
                    <Table size="small" className={classes.tableRoot}>
                      <TableBody>
                        {item.children.map((item, i) => (
                          <GlobalAppGridRow key={i}>
                            <GlobalAppGridCell className="checkbox">
                              <Checkbox />
                            </GlobalAppGridCell>
                            <GlobalAppGridCell className="ellipsis width25 padded0">{item.name}</GlobalAppGridCell>
                            <GlobalAppGridCell className="width10">view</GlobalAppGridCell>
                            <GlobalAppGridCell className="ellipsis width25">{item.uri}</GlobalAppGridCell>
                            <GlobalAppGridCell className="width10">target</GlobalAppGridCell>
                            <GlobalAppGridCell className="width10">11111</GlobalAppGridCell>
                            <GlobalAppGridCell className="width10">editedBy</GlobalAppGridCell>
                            <GlobalAppGridCell className="width10">lastEdited</GlobalAppGridCell>
                          </GlobalAppGridRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Collapse>
                </GlobalAppGridCell>
              </GlobalAppGridRow>
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
