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

import { makeStyles } from 'tss-react/mui';
import { FormattedDateParts, FormattedMessage, FormattedTime } from 'react-intl';
import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVertRounded';
import { Resource } from '../../models/Resource';
import { ItemVersion } from '../../models/Version';
import palette from '../../styles/palette';
import GlobalState from '../../models/GlobalState';
import { useSelection } from '../../hooks/useSelection';

const versionListStyles = makeStyles()((theme) => ({
  list: {
    backgroundColor: theme.palette.background.paper,
    padding: 0,
    borderRadius: '5px 5px 0 0'
  },
  listItem: {
    padding: '15px 48px 15px 20px',
    '&.selected': {
      backgroundColor: palette.blue.highlight
    }
  },
  listItemTextMultiline: {
    margin: 0
  },
  listItemTextPrimary: {
    display: 'flex',
    alignItems: 'center'
  },
  listItemTextSecondary: {
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  chip: {
    padding: '1px',
    backgroundColor: palette.green.main,
    height: 'auto',
    color: palette.white,
    marginLeft: '10px'
  }
}));

interface FancyFormattedDateProps {
  date: string;
  locale?: GlobalState['uiConfig']['locale'];
}

export function AsDayMonthDateTime(props: FancyFormattedDateProps) {
  const { date, locale } = props;
  const hour12 = locale?.dateTimeFormatOptions?.hour12 ?? true;

  return (
    <FormattedDateParts value={date} month="long" day="numeric" weekday="long" year="numeric">
      {(parts) => (
        <>
          {`${parts[0].value} ${parts[2].value} `}
          <FormattedMessage
            id="dateTime.ordinals"
            defaultMessage="{day, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}"
            values={{ day: parts[4].value }}
          />{' '}
          {parts[6].value} @ <FormattedTime value={date} hour12={hour12} />
        </>
      )}
    </FormattedDateParts>
  );
}

interface VersionListProps {
  versions: Resource<ItemVersion[]>;
  selected?: string[];
  current?: string;
  onItemClick(version: ItemVersion): void;
  onOpenMenu?(anchorEl: Element, version: ItemVersion, isCurrent: boolean, lastOne: boolean): void;
}

export function VersionList(props: VersionListProps) {
  const { classes, cx } = versionListStyles();
  const { versions: versionsResource, onOpenMenu, onItemClick, current, selected } = props;
  const versions = versionsResource.read();
  const locale = useSelection<GlobalState['uiConfig']['locale']>((state) => state.uiConfig.locale);

  return (
    <List component="div" className={classes.list} disablePadding>
      {versions.map((version: ItemVersion, i: number) => {
        return (
          <ListItem
            key={version.versionNumber}
            divider={versions.length - 1 !== i}
            button
            onClick={() => onItemClick(version)}
            className={cx(classes.listItem, selected?.includes(version.versionNumber) && 'selected')}
          >
            <ListItemText
              classes={{
                multiline: classes.listItemTextMultiline,
                primary: classes.listItemTextPrimary,
                secondary: classes.listItemTextSecondary
              }}
              primary={
                <>
                  <AsDayMonthDateTime date={version.modifiedDate} locale={locale} />
                  {current === version.versionNumber && (
                    <Chip
                      label={<FormattedMessage id="historyDialog.current" defaultMessage="current" />}
                      className={classes.chip}
                    />
                  )}
                </>
              }
              secondary={version.comment}
            />
            {onOpenMenu && (
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={(e) =>
                    onOpenMenu(e.currentTarget, version, current === version.versionNumber, versions.length === i + 1)
                  }
                  size="large"
                >
                  <MoreVertIcon />
                </IconButton>
              </ListItemSecondaryAction>
            )}
          </ListItem>
        );
      })}
    </List>
  );
}

export default VersionList;
