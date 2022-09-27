/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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

import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import { ListItem, ListItemText } from '@mui/material';
import ItemDisplay from '../ItemDisplay';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { FetchContentTypeUsageResponse } from '../../services/contentTypes';
import { ReactNode } from 'react';
import { SandboxItem } from '../../models/Item';

type ContentTypeUsageReportClassKey = 'listHeader' | 'listItem';

export interface ContentTypeUsageReportProps {
  entries: Array<[keyof FetchContentTypeUsageResponse, SandboxItem[]]>;
  classes?: Partial<Record<ContentTypeUsageReportClassKey, string>>;
  messages: {
    templates: ReactNode;
    scripts: ReactNode;
    content: ReactNode;
  };
}

function ContentTypeUsageReport(props: ContentTypeUsageReportProps) {
  const { entries, classes, messages } = props;
  return (
    <>
      {entries.map(([type, items]) => (
        <List
          key={type}
          subheader={
            <ListSubheader className={classes?.listHeader} disableSticky>
              {messages[type] ?? type} ({items.length})
            </ListSubheader>
          }
        >
          {items.map((item) => (
            <ListItem key={item.path} divider className={classes?.listItem}>
              <ListItemText
                primary={<ItemDisplay item={item} showNavigableAsLinks={false} />}
                secondary={<Typography variant="body2" color="textSecondary" children={item.path} />}
              />
            </ListItem>
          ))}
        </List>
      ))}
    </>
  );
}

export default ContentTypeUsageReport;
