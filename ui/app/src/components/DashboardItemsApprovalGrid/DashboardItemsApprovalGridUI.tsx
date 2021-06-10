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
import { DetailedItem } from '../../models/Item';
import GlobalAppGridRow from '../GlobalAppGridRow';
import GlobalAppGridCell from '../GlobalAppGridCell';
import LookupTable from '../../models/LookupTable';
import Checkbox from '@material-ui/core/Checkbox';
import MoreVertRounded from '@material-ui/icons/MoreVertRounded';
import ItemDisplay from '../ItemDisplay';
import clsx from 'clsx';
import { useLocale } from '../../utils/hooks';
import { nnou } from '../../utils/object';

interface DashboardItemsApprovalGridUIProps {
  resource: Resource<{ label: string; path: string }[]>;
  itemsLookup: LookupTable<DetailedItem[]>;
  expandedLookup: LookupTable<boolean>;
  selectedLookup: LookupTable<boolean>;
  publishingTargetLookup: LookupTable<string>;
  onExpandedRow(path: string, value: boolean): void;
  onItemChecked(path: string, value: boolean): void;
  onItemMenuClick(event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, item: DetailedItem): void;
}

export default function DashboardItemsApprovalGridUI(props: DashboardItemsApprovalGridUIProps) {
  const {
    resource,
    onExpandedRow,
    expandedLookup,
    publishingTargetLookup,
    itemsLookup,
    selectedLookup,
    onItemMenuClick,
    onItemChecked
  } = props;
  const items = resource.read();
  const classes = useStyles();
  const locale = useLocale();

  return (
    <TableContainer>
      <Table className={classes.tableRoot} size="small">
        <TableHead>
          <GlobalAppGridRow className="hoverDisabled">
            <GlobalAppGridCell className="checkbox bordered">
              <Checkbox />
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width40 padded0">
              <FormattedMessage id="dashboardItemsApproval.itemName" defaultMessage="Item Name" />
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width15 ellipsis">
              <FormattedMessage id="dashboardItemsApproval.publishingTarget" defaultMessage="Publishing Target" />
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width15 ellipsis">
              <FormattedMessage id="dashboardItemsApproval.publishingDate" defaultMessage="Publishing Date" />
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width15 ellipsis">
              <FormattedMessage id="dashboardItemsApproval.lastEditedBy" defaultMessage="Last Edited By" />
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width15 ellipsis">
              <FormattedMessage id="dashboardItemsApproval.lastEdited" defaultMessage="Last Edited" />
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered checkbox"></GlobalAppGridCell>
          </GlobalAppGridRow>
        </TableHead>
        <TableBody>
          {items.map((item, i) => (
            <Fragment key={i}>
              <GlobalAppGridRow onClick={() => onExpandedRow(item.path, !expandedLookup[item.path])}>
                <GlobalAppGridCell colSpan={7} className="expandableCell">
                  <Box display="flex">
                    <IconButton size="small">
                      <ExpandMoreIcon />
                    </IconButton>
                    <Typography>
                      {item.label} ({itemsLookup[item.path].length})
                    </Typography>
                  </Box>
                </GlobalAppGridCell>
              </GlobalAppGridRow>
              <GlobalAppGridRow className="hoverDisabled">
                <GlobalAppGridCell colSpan={7} className="padded0">
                  <Collapse in={expandedLookup[item.path]}>
                    <Table size="small" className={classes.tableRoot}>
                      <TableBody>
                        {itemsLookup[item.path].map((item, i) => (
                          <GlobalAppGridRow key={i}>
                            <GlobalAppGridCell className="checkbox">
                              <Checkbox
                                checked={nnou(selectedLookup[item.path]) ? selectedLookup[item.path] : false}
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                onChange={() => {
                                  onItemChecked(
                                    item.path,
                                    nnou(selectedLookup[item.path]) ? !selectedLookup[item.path] : true
                                  );
                                }}
                              />
                            </GlobalAppGridCell>
                            <GlobalAppGridCell className="ellipsis width40 padded0">
                              <ItemDisplay item={item} showNavigableAsLinks={false} showPublishingTarget={false} />
                              <Typography
                                title={item.path}
                                variant="caption"
                                component="p"
                                className={clsx(classes.itemPath, classes.ellipsis)}
                              >
                                {item.path}
                              </Typography>
                            </GlobalAppGridCell>
                            <GlobalAppGridCell className="width15">
                              {publishingTargetLookup[item.path]}
                            </GlobalAppGridCell>
                            <GlobalAppGridCell className="width15">11111</GlobalAppGridCell>
                            <GlobalAppGridCell className="width15 ellipsis" title={item.sandbox.modifier}>
                              {item.sandbox.modifier}
                            </GlobalAppGridCell>
                            <GlobalAppGridCell
                              className="width15 ellipsis"
                              title={new Intl.DateTimeFormat(locale.localeCode, locale.dateTimeFormatOptions).format(
                                new Date(item.sandbox.dateModified)
                              )}
                            >
                              {new Intl.DateTimeFormat(locale.localeCode, locale.dateTimeFormatOptions).format(
                                new Date(item.sandbox.dateModified)
                              )}
                            </GlobalAppGridCell>
                            <GlobalAppGridCell className="checkbox">
                              <IconButton size="small" onClick={(e) => onItemMenuClick(e, item)}>
                                <MoreVertRounded />
                              </IconButton>
                            </GlobalAppGridCell>
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
