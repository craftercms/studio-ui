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
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import GlobalAppGridRow from '../GlobalAppGridRow';
import GlobalAppGridCell from '../GlobalAppGridCell';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import Checkbox from '@material-ui/core/Checkbox';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import { Resource } from '../../models/Resource';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import GlobalState from '../../models/GlobalState';
import LookupTable from '../../models/LookupTable';
import Collapse from '@material-ui/core/Collapse';
import { DashboardItem, useStyles } from './RecentlyPublishedWidget';
import { DetailedItem } from '../../models/Item';
import ItemDisplay from '../ItemDisplay';
import MoreVertRounded from '@material-ui/icons/MoreVertRounded';
import Box from '@material-ui/core/Box';
import clsx from 'clsx';

export interface RecentlyPublishedWidgetUIProps {
  resource: Resource<DashboardItem[]>;
  itemsLookup: LookupTable<DetailedItem[]>;
  localeBranch: GlobalState['uiConfig']['locale'];
  expandedItems: LookupTable<boolean>;
  selectedItems: LookupTable<boolean>;
  setSelectedItems(item): void;
  setExpandedItems(itemExpanded): void;
  onOptionsButtonClick?: any;
}

export default function RecentlyPublishedWidgetUi(props: RecentlyPublishedWidgetUIProps) {
  const {
    resource,
    expandedItems,
    setExpandedItems,
    itemsLookup,
    onOptionsButtonClick,
    localeBranch,
    selectedItems,
    setSelectedItems
  } = props;
  const parentItems = resource.read();
  const classes = useStyles();

  const toggleExpand = (name) => {
    setExpandedItems({ [name]: !expandedItems[name] });
  };

  const handleCheckboxChange = (itemId, event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedItems({
      [itemId]: event.target.checked
    });
  };

  return (
    <TableContainer>
      <Table size="small" className={classes.tableRoot}>
        <TableHead>
          <GlobalAppGridRow className="hoverDisabled">
            <GlobalAppGridCell className="checkbox bordered width5">
              <Checkbox />
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width40">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.item" defaultMessage="Item" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width20">
              <Typography variant="subtitle2">
                <FormattedMessage id="recentlyPublished.publishedTo" defaultMessage="Published To" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width20">
              <Typography variant="subtitle2">
                <FormattedMessage id="recentlyPublished.publishDate" defaultMessage="Publish Date" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width10">
              <Typography variant="subtitle2">
                <FormattedMessage id="recentlyPublished.publishedBy" defaultMessage="Published By" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width5" />
          </GlobalAppGridRow>
        </TableHead>
        <TableBody>
          {parentItems.map((item, i) => (
            <Fragment key={i}>
              <GlobalAppGridRow key={item.label} onClick={() => toggleExpand(item.label)}>
                <GlobalAppGridCell colSpan={6} className="expandableCell">
                  <Box display="flex" className={classes.expandableCellBox}>
                    <IconButton size="small">
                      {expandedItems[item.label] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                    <Typography>{item.label}</Typography>
                  </Box>
                </GlobalAppGridCell>
              </GlobalAppGridRow>
              <GlobalAppGridRow className="hoverDisabled">
                <GlobalAppGridCell colSpan={6} className="padded0">
                  <Collapse in={expandedItems[item.label]}>
                    <Table size="small" className={classes.tableRoot}>
                      <TableBody>
                        {itemsLookup[item.label].map((item) => (
                          <GlobalAppGridRow key={item.id}>
                            <GlobalAppGridCell className="checkbox width5">
                              <Checkbox
                                checked={Boolean(selectedItems[item.id])}
                                onChange={(e) => handleCheckboxChange(item.id, e)}
                              />
                            </GlobalAppGridCell>
                            <GlobalAppGridCell className="ellipsis width40 padded0">
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
                            <GlobalAppGridCell className="width20">
                              {item.stateMap.live ? (
                                <FormattedMessage id="words.live" defaultMessage="Live" />
                              ) : (
                                <FormattedMessage id="words.staging" defaultMessage="Staging" />
                              )}
                            </GlobalAppGridCell>
                            <GlobalAppGridCell
                              className="width20 ellipsis"
                              title={new Intl.DateTimeFormat(
                                localeBranch.localeCode,
                                localeBranch.dateTimeFormatOptions
                              ).format(
                                new Date(
                                  item.stateMap.live ? item.live.lastPublishedDate : item.staging.lastPublishedDate
                                )
                              )}
                            >
                              {new Intl.DateTimeFormat(
                                localeBranch.localeCode,
                                localeBranch.dateTimeFormatOptions
                              ).format(
                                new Date(
                                  item.stateMap.live ? item.live.lastPublishedDate : item.staging.lastPublishedDate
                                )
                              )}
                            </GlobalAppGridCell>
                            <GlobalAppGridCell className="width10">
                              {item.stateMap.live ? item.live.publisher : item.staging.publisher}
                            </GlobalAppGridCell>
                            <GlobalAppGridCell className="width5">
                              <IconButton onClick={(e) => onOptionsButtonClick(e, item)}>
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
