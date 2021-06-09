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
import { LegacyDeploymentHistoryResponse } from '../../models/Dashboard';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import GlobalState from '../../models/GlobalState';
import LookupTable from '../../models/LookupTable';
import Collapse from '@material-ui/core/Collapse';
import { useStyles } from './RecentlyPublishedWidget';
import Pagination from '../Pagination/Pagination';
import { DetailedItem } from '../../models/Item';
import ItemDisplay from '../ItemDisplay';
import MoreVertRounded from '@material-ui/icons/MoreVertRounded';
import Box from '@material-ui/core/Box';

export interface RecentlyPublishedWidgetUIProps {
  resource: Resource<LegacyDeploymentHistoryResponse>;
  itemsLookup: LookupTable<DetailedItem[]>;
  localeBranch: GlobalState['uiConfig']['locale'];
  expandedItems: LookupTable<boolean>;
  rowsPerPageOptions?: number[];
  setExpandedItems(itemExpanded): void;
  onOptionsButtonClick?: any;
}

export default function RecentlyPublishedWidgetUi(props: RecentlyPublishedWidgetUIProps) {
  const {
    resource,
    expandedItems,
    setExpandedItems,
    rowsPerPageOptions = [5, 10, 15],
    itemsLookup,
    onOptionsButtonClick,
    localeBranch
  } = props;
  const history = resource.read();
  const classes = useStyles();

  console.log('itemsLookup', itemsLookup);

  const toggleExpand = (name) => {
    setExpandedItems({ [name]: !expandedItems[name] });
  };

  return (
    <TableContainer>
      <Table size="small" className={classes.tableRoot}>
        <TableHead>
          <GlobalAppGridRow className="hoverDisabled">
            <GlobalAppGridCell className="checkbox bordered">
              <Checkbox />
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width60">
              <Typography variant="subtitle2">
                <FormattedMessage id="recentlyPublished.itemName" defaultMessage="Item Name" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width10">
              <Typography variant="subtitle2">
                <FormattedMessage id="recentlyPublished.publishingTarget" defaultMessage="Publishing Target" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width10">
              <Typography variant="subtitle2">
                <FormattedMessage id="recentlyPublished.publishDate" defaultMessage="Publish Date" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width10">
              <Typography variant="subtitle2">
                <FormattedMessage id="recentlyPublished.publishedBy" defaultMessage="Published By" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered" />
          </GlobalAppGridRow>
        </TableHead>
        <TableBody>
          {history.documents.map((document, i) => (
            <Fragment key={i}>
              <GlobalAppGridRow key={document.internalName} onClick={() => toggleExpand(document.internalName)}>
                <GlobalAppGridCell colSpan={6} className="expandableCell">
                  <Box display="flex" className={classes.expandableCellBox}>
                    <IconButton size="small">
                      {expandedItems[document.internalName] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                    <Typography>{document.internalName}</Typography>
                  </Box>
                </GlobalAppGridCell>
              </GlobalAppGridRow>
              <GlobalAppGridRow className="hoverDisabled">
                <GlobalAppGridCell colSpan={6} className="padded0">
                  <Collapse in={expandedItems[document.internalName]}>
                    <Table size="small" className={classes.tableRoot}>
                      <TableBody>
                        {itemsLookup[document.internalName].map((item) => (
                          <GlobalAppGridRow key={item.id}>
                            <GlobalAppGridCell className="checkbox">
                              <Checkbox />
                            </GlobalAppGridCell>
                            <GlobalAppGridCell className="ellipsis width60 padded0">
                              <ItemDisplay item={item} />
                              <Typography
                                title={item.path}
                                variant="caption"
                                component="p"
                                className={classes.itemPath}
                              >
                                {item.path}
                              </Typography>
                            </GlobalAppGridCell>
                            <GlobalAppGridCell className="width10">
                              {item.live ? (
                                <FormattedMessage id="words.live" defaultMessage="Live" />
                              ) : (
                                <FormattedMessage id="words.staging" defaultMessage="Staging" />
                              )}
                            </GlobalAppGridCell>
                            <GlobalAppGridCell className="width10">
                              {new Intl.DateTimeFormat(
                                localeBranch.localeCode,
                                localeBranch.dateTimeFormatOptions
                              ).format(
                                new Date(item.live ? item.live.lastPublishedDate : item.staging.lastPublishedDate)
                              )}
                            </GlobalAppGridCell>
                            <GlobalAppGridCell className="width10">
                              {item.live ? item.live.publisher : item.staging.publisher}
                            </GlobalAppGridCell>
                            <GlobalAppGridCell>
                              <IconButton onClick={(e) => onOptionsButtonClick(e, item)}>
                                <MoreVertRounded />
                              </IconButton>
                            </GlobalAppGridCell>
                          </GlobalAppGridRow>
                        ))}
                      </TableBody>
                    </Table>
                    {/* <Pagination
                      count={document.numOfChildren}
                      rowsPerPage={10}
                      rowsPerPageOptions={rowsPerPageOptions}
                      page={0}
                      onChangePage={() => {}}
                      classes={{ root: classes.paginationRoot }}
                    /> */}
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
