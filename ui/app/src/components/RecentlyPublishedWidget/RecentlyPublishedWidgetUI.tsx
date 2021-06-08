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

export interface RecentlyPublishedWidgetUIProps {
  resource: Resource<LegacyDeploymentHistoryResponse>;
}

export default function RecentlyPublishedWidgetUi(props: RecentlyPublishedWidgetUIProps) {
  const { resource } = props;
  const history = resource.read();

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
                <FormattedMessage id="words.edit" defaultMessage="Edit" />
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
          <GlobalAppGridRow>
            <GlobalAppGridCell></GlobalAppGridCell>
          </GlobalAppGridRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
