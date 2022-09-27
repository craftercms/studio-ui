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

import React, { ReactNode, useMemo } from 'react';
import { DetailedItem } from '../../models/Item';
import { useLocale } from '../../hooks/useLocale';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import Box from '@mui/material/Box';
import ItemStateIcon from '../ItemStateIcon';
import { getDateScheduled, isEditableAsset } from '../../utils/content';
import { FormattedMessage } from 'react-intl';
import { asLocalizedDateTime } from '../../utils/datetime';
import ItemPublishingTargetIcon from '../ItemPublishingTargetIcon';
import { getItemStateText } from '../ItemDisplay/utils';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Button from '@mui/material/Button';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import { makeStyles } from 'tss-react/mui';

import LookupTable from '../../models/LookupTable';

export interface SelectionListProps {
  title: ReactNode;
  subtitle?: ReactNode;
  emptyMessage?: ReactNode;
  items?: DetailedItem[];
  paths?: string[];
  displayItemTitle: boolean;
  // Optional since list may not have checkboxes
  selectedItems?: LookupTable<boolean>;
  disabled?: boolean;
  onItemClicked?(event: React.MouseEvent, path: string): void;
  onSelectAllClicked?(event: React.ChangeEvent, checked: boolean): void;
  onEditClick?(event: React.MouseEvent, path: string): void;
}

const useStyles = makeStyles()(() => ({
  listTitle: {
    display: 'flex !important',
    alignItems: 'center',
    whiteSpace: 'break-spaces'
  },
  selectionList: {
    paddingTop: 0
  },
  publishingTargetIcon: {
    fontSize: '1rem',
    margin: '0 5px'
  },
  stateScheduledIcon: {
    fontSize: '1em',
    marginRight: '5px'
  },
  emptyDependencies: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px',
    '& svg': {
      marginRight: '8px'
    }
  },
  selectAllBtn: {
    marginLeft: 'auto',
    fontWeight: 'bold',
    verticalAlign: 'baseline'
  },
  overflowText: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  }
}));

export function SelectionList(props: SelectionListProps) {
  // region const { ... } = props
  const {
    title,
    subtitle,
    emptyMessage,
    items,
    paths = items.map((item) => item.path),
    onItemClicked,
    onSelectAllClicked,
    selectedItems,
    disabled = false,
    onEditClick
  } = props;
  // endregion

  const { classes } = useStyles();
  const locale = useLocale();
  const isAllChecked = useMemo(
    () => (selectedItems ? !paths?.some((path) => !selectedItems[path]) : null),
    [paths, selectedItems]
  );
  const isIndeterminate = useMemo(
    () => (selectedItems ? paths?.some((path) => selectedItems?.[path] && !isAllChecked) : null),
    [paths, selectedItems, isAllChecked]
  );

  return (
    <>
      <ListItem divider dense disableGutters={!Boolean(paths)}>
        <ListItemIcon>
          <Checkbox
            color="primary"
            edge="start"
            disabled={disabled || paths?.length === 0 || !onSelectAllClicked}
            indeterminate={isIndeterminate}
            checked={isAllChecked || isIndeterminate || !onSelectAllClicked}
            onChange={onSelectAllClicked}
          />
        </ListItemIcon>
        <ListItemText
          primary={
            <>
              <Typography variant="subtitle1" component="h2">
                {title}
              </Typography>
              {subtitle ? (
                <Typography component="span">
                  {` • `}
                  {subtitle}
                </Typography>
              ) : null}
            </>
          }
          primaryTypographyProps={{
            classes: { root: classes.listTitle }
          }}
        />
      </ListItem>
      {items ? (
        <List className={classes.selectionList}>
          {items.map((item) => {
            const labelId = `checkbox-list-label-${item.path}`;
            return (
              <ListItem
                dense
                key={item.path}
                disabled={disabled}
                // @ts-ignore
                button={Boolean(onItemClicked)}
                onClick={onItemClicked ? (e) => onItemClicked(e, item.path) : void 0}
              >
                {onItemClicked && (
                  <ListItemIcon>
                    <Checkbox
                      color="primary"
                      edge="start"
                      checked={!!selectedItems[item.path]}
                      tabIndex={-1}
                      disableRipple
                      inputProps={{ 'aria-labelledby': item.path }}
                      disabled={disabled}
                    />
                  </ListItemIcon>
                )}
                <ListItemText id={labelId}>
                  <Typography variant="subtitle1">{item.label}</Typography>
                  {(item.stateMap.submitted || item.stateMap.scheduled) && (
                    <Box display="flex" alignItems="center">
                      <ItemStateIcon displayTooltip={false} className={classes.stateScheduledIcon} item={item} />
                      <Typography variant="body2" color="textSecondary">
                        {getDateScheduled(item) ? (
                          item.stateMap.submitted ? (
                            <FormattedMessage
                              id="itemPublishingDate.submitted"
                              defaultMessage="Submitted for {date}"
                              values={{
                                date: asLocalizedDateTime(
                                  getDateScheduled(item),
                                  locale.localeCode,
                                  locale.dateTimeFormatOptions
                                )
                              }}
                            />
                          ) : (
                            <FormattedMessage
                              id="itemPublishingDate.scheduled"
                              defaultMessage="Scheduled for {date}"
                              values={{
                                date: asLocalizedDateTime(
                                  getDateScheduled(item),
                                  locale.localeCode,
                                  locale.dateTimeFormatOptions
                                )
                              }}
                            />
                          )
                        ) : item.stateMap.submitted ? (
                          <FormattedMessage
                            id="itemPublishingDate.submittedForAsap"
                            defaultMessage="Submitted for ASAP"
                          />
                        ) : (
                          <FormattedMessage
                            id="itemPublishingDate.scheduledForAsap"
                            defaultMessage="Scheduled for ASAP"
                          />
                        )}
                      </Typography>
                      <ItemPublishingTargetIcon
                        displayTooltip={false}
                        className={classes.publishingTargetIcon}
                        item={
                          {
                            stateMap: {
                              [item.stateMap.submittedToLive ? 'live' : 'staged']:
                                item.stateMap.submittedToLive || item.stateMap.submittedToStaging
                            }
                          } as DetailedItem
                        }
                      />
                      <Typography variant="body2" color="textSecondary">
                        {getItemStateText(item.stateMap, { user: item.lockOwner })}
                      </Typography>
                    </Box>
                  )}
                  <Typography variant="body2" color="textSecondary">
                    {item.path}
                  </Typography>
                </ListItemText>
              </ListItem>
            );
          })}
        </List>
      ) : (
        <List>
          {paths.length ? (
            paths.map((path: string) => {
              const labelId = `checkbox-list-label-${path}`;
              return (
                <ListItem
                  dense
                  key={path}
                  disabled={disabled}
                  // @ts-ignore
                  button={Boolean(onItemClicked)}
                  onClick={onItemClicked ? (e) => onItemClicked(e, path) : null}
                >
                  {onItemClicked && (
                    <ListItemIcon>
                      <Checkbox
                        color="primary"
                        edge="start"
                        checked={Boolean(selectedItems[path])}
                        tabIndex={-1}
                        disableRipple
                        inputProps={{ 'aria-labelledby': path }}
                        disabled={disabled}
                      />
                    </ListItemIcon>
                  )}
                  <ListItemText
                    id={labelId}
                    primary={path}
                    primaryTypographyProps={{
                      title: path,
                      classes: { root: classes.overflowText }
                    }}
                  />
                  {onEditClick && isEditableAsset(path) && (
                    <ListItemSecondaryAction>
                      <Button
                        color="primary"
                        onClick={(e) => onEditClick(e, path)}
                        size="small"
                        className={classes.selectAllBtn}
                      >
                        <FormattedMessage id="words.edit" defaultMessage="Edit" />
                      </Button>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              );
            })
          ) : (
            <Box className={classes.emptyDependencies}>
              <InfoIcon color="action" fontSize="small" />
              <Typography variant="caption">{emptyMessage}</Typography>
            </Box>
          )}
        </List>
      )}
    </>
  );
}
