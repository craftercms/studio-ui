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
import { DashboardItem } from './RecentlyPublishedDashlet';
import { DetailedItem } from '../../models/Item';
import ItemDisplay from '../ItemDisplay';
import MoreVertRounded from '@material-ui/icons/MoreVertRounded';
import Box from '@material-ui/core/Box';
import clsx from 'clsx';
import useStyles from './styles';
import { asLocalizedDateTime } from '../../utils/datetime';
import Tooltip from '@material-ui/core/Tooltip';

export interface RecentlyPublishedWidgetUIProps {
  resource: Resource<DashboardItem[]>;
  itemsLookup: LookupTable<DetailedItem>;
  localeBranch: GlobalState['uiConfig']['locale'];
  expandedItems: LookupTable<boolean>;
  onItemMenuClick(event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, item: DetailedItem): void;
  setExpandedItems(itemExpanded): void;
}

export default function RecentlyPublishedDashletUI(props: RecentlyPublishedWidgetUIProps) {
  const { resource, expandedItems, setExpandedItems, itemsLookup, onItemMenuClick, localeBranch } = props;
  const parentItems = resource.read();
  const classes = useStyles();

  const toggleExpand = (name) => {
    setExpandedItems({ [name]: !expandedItems[name] });
  };

  return (
    <TableContainer>
      <Table size="small" className={classes.tableRoot}>
        <TableHead>
          <GlobalAppGridRow className="hoverDisabled">
            <GlobalAppGridCell className="width40 pl20">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.item" defaultMessage="Item" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="width20 ellipsis">
              <Typography variant="subtitle2">
                <FormattedMessage id="recentlyPublished.publishedTo" defaultMessage="Published To" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="width20 ellipsis">
              <Typography variant="subtitle2">
                <FormattedMessage id="recentlyPublished.publishDate" defaultMessage="Publish Date" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="width20 ellipsis">
              <Typography variant="subtitle2">
                <FormattedMessage id="recentlyPublished.publishedBy" defaultMessage="Published By" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="checkbox" />
          </GlobalAppGridRow>
        </TableHead>
        <TableBody>
          {parentItems.map((item, i) => (
            <Fragment key={i}>
              <GlobalAppGridRow key={item.label} onClick={() => toggleExpand(item.label)}>
                <GlobalAppGridCell colSpan={5} className="expandableCell">
                  <Box display="flex" alignItems="center">
                    <IconButton size="small">
                      {expandedItems[item.label] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                    <Typography>
                      {item.label} ({item.children.length})
                    </Typography>
                  </Box>
                </GlobalAppGridCell>
              </GlobalAppGridRow>
              <GlobalAppGridRow className="hoverDisabled">
                <GlobalAppGridCell colSpan={5} className="padded0 bb0">
                  <Collapse in={expandedItems[item.label]}>
                    <Table size="small" className={classes.tableRoot}>
                      <TableBody>
                        {item.children.map((path, i) => (
                          <GlobalAppGridRow key={i}>
                            <GlobalAppGridCell className="ellipsis width40 pl20">
                              <ItemDisplay
                                item={itemsLookup[path]}
                                showNavigableAsLinks={false}
                                showPublishingTarget={false}
                                showWorkflowState={false}
                              />
                              <Typography
                                title={itemsLookup[path].path}
                                variant="caption"
                                component="p"
                                className={clsx(classes.itemPath, classes.ellipsis)}
                              >
                                {itemsLookup[path].path}
                              </Typography>
                            </GlobalAppGridCell>
                            <GlobalAppGridCell className="width20">
                              {itemsLookup[path].stateMap.submittedToLive ? (
                                <FormattedMessage id="words.live" defaultMessage="Live" />
                              ) : (
                                <FormattedMessage id="words.staging" defaultMessage="Staging" />
                              )}
                            </GlobalAppGridCell>
                            <GlobalAppGridCell
                              className="width20 ellipsis"
                              title={asLocalizedDateTime(
                                itemsLookup[path].stateMap.live
                                  ? itemsLookup[path].live.datePublished
                                  : itemsLookup[path].staging.datePublished,
                                localeBranch.localeCode,
                                localeBranch.dateTimeFormatOptions
                              )}
                            >
                              {asLocalizedDateTime(
                                itemsLookup[path].stateMap.live
                                  ? itemsLookup[path].live.datePublished
                                  : itemsLookup[path].staging.datePublished,
                                localeBranch.localeCode,
                                localeBranch.dateTimeFormatOptions
                              )}
                            </GlobalAppGridCell>
                            <GlobalAppGridCell className="width20">
                              {itemsLookup[path].stateMap.live
                                ? itemsLookup[path].live.publisher
                                : itemsLookup[path].staging.publisher}
                            </GlobalAppGridCell>
                            <GlobalAppGridCell className="checkbox">
                              <Tooltip title={<FormattedMessage id="words.options" defaultMessage="Options" />}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onItemMenuClick(e, itemsLookup[path]);
                                  }}
                                >
                                  <MoreVertRounded />
                                </IconButton>
                              </Tooltip>
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
