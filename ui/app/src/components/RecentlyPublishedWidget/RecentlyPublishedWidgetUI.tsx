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

import React from 'react';
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
import TableRow from '@material-ui/core/TableRow';

export interface RecentlyPublishedWidgetUIProps {
  resource: Resource<LegacyDeploymentHistoryResponse>;
  localeBranch: GlobalState['uiConfig']['locale'];
  expandedItems: LookupTable<boolean>;
  setExpandedItems(itemExpanded): void;
}

export default function RecentlyPublishedWidgetUi(props: RecentlyPublishedWidgetUIProps) {
  const { resource, expandedItems, setExpandedItems } = props;
  const history = resource.read();
  const classes = useStyles();

  console.log('history', history);

  const toggleExpand = (name) => {
    setExpandedItems({ [name]: !expandedItems[name] });
  };

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <GlobalAppGridRow>
            <GlobalAppGridCell>
              <Checkbox />
            </GlobalAppGridCell>
            <GlobalAppGridCell>
              <Typography variant="subtitle2">
                <FormattedMessage id="recentlyPublished.itemName" defaultMessage="Item Name" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell>
              <Typography variant="subtitle2">
                <FormattedMessage id="words.url" defaultMessage="URL" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell>
              <Typography variant="subtitle2">
                <FormattedMessage id="recentlyPublished.publishingTarget" defaultMessage="Publishing Target" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell>
              <Typography variant="subtitle2">
                <FormattedMessage id="recentlyPublished.publishDate" defaultMessage="Publish Date" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell>
              <Typography variant="subtitle2">
                <FormattedMessage id="recentlyPublished.publishedBy" defaultMessage="Published By" />
              </Typography>
            </GlobalAppGridCell>
          </GlobalAppGridRow>
        </TableHead>
        <TableBody>
          {history.documents.map((document) => (
            <>
              <GlobalAppGridRow key={document.internalName} onClick={() => toggleExpand(document.internalName)}>
                <GlobalAppGridCell colSpan={7}>
                  <IconButton size="small">
                    {expandedItems[document.internalName] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                  {document.internalName}
                </GlobalAppGridCell>
              </GlobalAppGridRow>
              <TableRow hover={false}>
                <GlobalAppGridCell colSpan={6} className={classes.collapseCell}>
                  <Collapse in={expandedItems[document.internalName]}>
                    <Table size="small">
                      <TableBody>
                        {document.children.map((item) => (
                          <GlobalAppGridRow>
                            <GlobalAppGridCell>
                              <Checkbox />
                            </GlobalAppGridCell>
                            <GlobalAppGridCell>{item.name}</GlobalAppGridCell>
                          </GlobalAppGridRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Collapse>
                </GlobalAppGridCell>
              </TableRow>
            </>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
