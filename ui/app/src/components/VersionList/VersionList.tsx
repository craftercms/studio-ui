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
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVertRounded';
import { ItemHistoryEntry } from '../../models/Version';
import palette from '../../styles/palette';
import GlobalState from '../../models/GlobalState';
import { useSelection } from '../../hooks/useSelection';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import { createPresenceTable } from '../../utils/array';

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
  versions: ItemHistoryEntry[];
  selected?: string[];
  current?: string;
  isSelectMode?: boolean;
  onItemClick(version: ItemHistoryEntry): void;
  onOpenMenu?(anchorEl: Element, version: ItemHistoryEntry, isCurrent: boolean, lastOne: boolean): void;
}

export function VersionList(props: VersionListProps) {
  const { classes, cx } = versionListStyles();
  const { versions, onOpenMenu, onItemClick, current, selected, isSelectMode = false } = props;
  const locale = useSelection<GlobalState['uiConfig']['locale']>((state) => state.uiConfig.locale);
  const selectedLookup = createPresenceTable(selected);
  return (
    <List component="div" className={classes.list} disablePadding>
      {versions.map((version: ItemHistoryEntry, i: number) => {
        const isSelected = Boolean(selectedLookup[version.versionNumber]);
        return (
          <ListItemButton
            key={version.versionNumber}
            divider={versions.length - 1 !== i}
            onClick={() => onItemClick(version)}
            className={cx(classes.listItem, isSelected && 'selected')}
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
            {(onOpenMenu || isSelectMode) && (
              <ListItemSecondaryAction>
                {isSelectMode && <Checkbox checked={isSelected} />}
                {!isSelectMode && onOpenMenu && (
                  <IconButton
                    edge="end"
                    size="large"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenMenu(
                        e.currentTarget,
                        version,
                        current === version.versionNumber,
                        versions.length === i + 1
                      );
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                )}
              </ListItemSecondaryAction>
            )}
          </ListItemButton>
        );
      })}
    </List>
  );
}

export default VersionList;
