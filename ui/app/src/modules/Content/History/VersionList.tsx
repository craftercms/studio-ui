/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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

import { createStyles, makeStyles } from '@material-ui/core/styles';
import { FormattedDateParts, FormattedMessage, FormattedTime } from 'react-intl';
import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Chip from '@material-ui/core/Chip';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVertRounded';
import { Resource } from '../../../models/Resource';
import { LegacyVersion } from '../../../models/Version';
import clsx from 'clsx';
import palette from '../../../styles/palette';
import GlobalState from '../../../models/GlobalState';
import { useSelection } from '../../../utils/hooks';

const versionListStyles = makeStyles((theme) =>
  createStyles({
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
  })
);

interface FancyFormattedDateProps {
  date: string;
  locale?: GlobalState['uiConfig']['locale'];
}

export function AsDayMonthDateTime(props: FancyFormattedDateProps) {
  const ordinals = 'selectordinal, one {#st} two {#nd} few {#rd} other {#th}';
  const { date, locale } = props;
  const hour12 = locale?.dateTimeFormatOptions?.hour12 ?? true;

  return (
    <FormattedDateParts value={date} month="long" day="numeric" weekday="long" year="numeric">
      {(parts) => (
        <>
          {`${parts[0].value} ${parts[2].value} `}
          <FormattedMessage
            id="dateTime.ordinals"
            defaultMessage={`{day, ${ordinals}}`}
            values={{ day: parts[4].value }}
          />{' '}
          {parts[6].value} @ <FormattedTime value={date} hour12={hour12} />
        </>
      )}
    </FormattedDateParts>
  );
}

interface VersionListProps {
  versions: Resource<LegacyVersion[]>;
  selected?: string[];
  current?: string;
  onItemClick(version: LegacyVersion): void;
  onOpenMenu?(anchorEl: Element, version: LegacyVersion, isCurrent: boolean, lastOne: boolean): void;
}

export function VersionList(props: VersionListProps) {
  const classes = versionListStyles({});
  const { versions: versionsResource, onOpenMenu, onItemClick, current, selected } = props;
  const versions = versionsResource.read();
  const locale = useSelection<GlobalState['uiConfig']['locale']>((state) => state.uiConfig.locale);

  return (
    <List component="div" className={classes.list} disablePadding>
      {versions.map((version: LegacyVersion, i: number) => {
        return (
          <ListItem
            key={version.versionNumber}
            divider={versions.length - 1 !== i}
            button
            onClick={() => onItemClick(version)}
            className={clsx(classes.listItem, selected?.includes(version.versionNumber) && 'selected')}
          >
            <ListItemText
              classes={{
                multiline: classes.listItemTextMultiline,
                primary: classes.listItemTextPrimary,
                secondary: classes.listItemTextSecondary
              }}
              primary={
                <>
                  <AsDayMonthDateTime date={version.lastModifiedDate} locale={locale} />
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
