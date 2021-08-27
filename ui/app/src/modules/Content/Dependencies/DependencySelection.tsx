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

import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { DetailedItem, SandboxItem } from '../../../models/Item';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { FormattedMessage } from 'react-intl';
import Checkbox from '@material-ui/core/Checkbox';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { updateCheckedList } from '../Publish/PublishDialog';
import Button from '@material-ui/core/Button';
import { useSelection } from '../../../utils/hooks/useSelection';
import { useActiveSiteId } from '../../../utils/hooks/useActiveSiteId';
import LookupTable from '../../../models/LookupTable';
import { createPresenceTable } from '../../../utils/array';
import { useLocale } from '../../../utils/hooks/useLocale';
import { asLocalizedDateTime } from '../../../utils/datetime';
import { getDateScheduled } from '../../../utils/detailedItem';
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined';
import ItemStateIcon from '../../../components/ItemStateIcon';
import ItemPublishingTargetIcon from '../../../components/ItemPublishingTargetIcon';
import { getItemStateText } from '../../../components/ItemDisplay/utils';
import clsx from 'clsx';

interface DependencySelectionProps {
  items?: DetailedItem[];
  siteId?: string; // for dependencySelectionDelete
  onChange?: Function; // for dependencySelectionDelete
  checked: LookupTable<boolean>;
  checkedSoftDep: LookupTable<boolean>;
  setCheckedSoftDep: Function;
  onClickSetChecked: Function;
  deps: any;
  onSelectAllClicked: Function;
  onSelectAllSoftClicked: Function;
  disabled?: boolean;
}

interface SelectionListProps {
  title: ReactNode;
  subtitle?: ReactNode;
  emptyMessage?: ReactNode;
  items?: DetailedItem[];
  uris?: string[];
  onItemClicked?: Function;
  onSelectAllClicked?: Function;
  displayItemTitle: boolean;
  checked?: any;
  disabled?: boolean;
  showEdit?: boolean;
  onEditClick?: Function;
}

export interface DeleteDependencies {
  childItems: string[];
  dependentItems: string[];
}

const useStyles = makeStyles((theme) =>
  createStyles({
    dependencySelection: {
      background: theme.palette.background.paper,
      border: `1px solid ${theme.palette.divider}`,
      minHeight: '374px'
    },
    dependencySelectionDisabled: {
      opacity: 0.7
    },
    selectAllBtn: {
      marginLeft: 'auto',
      fontWeight: 'bold',
      verticalAlign: 'baseline'
    },
    showAllBtn: {
      marginLeft: 0,
      verticalAlign: 'baseline'
    },
    selectionList: {
      paddingTop: 0
    },
    listTitle: {
      display: 'flex !important',
      alignItems: 'center',
      whiteSpace: 'break-spaces'
    },
    listItemTitle: {
      '& h4': {
        fontSize: '1rem',
        margin: 0,
        padding: 0,
        fontWeight: 400
      }
    },
    listItemPath: {
      padding: 0
    },
    secondaryAction: {
      padding: '0 80px 0 5px'
    },
    overflowText: {
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis'
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
    }
  })
);

export function DependencySelection(props: DependencySelectionProps) {
  const {
    items,
    checked,
    checkedSoftDep,
    setCheckedSoftDep,
    deps,
    onClickSetChecked,
    onSelectAllClicked,
    onSelectAllSoftClicked,
    disabled = false
  } = props;

  const classes = useStyles();

  return (
    <>
      <div className={clsx(classes.dependencySelection, disabled && classes.dependencySelectionDisabled)}>
        <SelectionList
          title={<FormattedMessage id="publishDialog.itemsToPublish" defaultMessage="Items To Publish" />}
          items={items}
          onItemClicked={onClickSetChecked}
          onSelectAllClicked={onSelectAllClicked}
          displayItemTitle={true}
          checked={checked}
          disabled={disabled}
        />
        {deps == null ? null : (
          <>
            <SelectionList
              title={<FormattedMessage id="publishDialog.hardDependencies" defaultMessage="Hard Dependencies" />}
              subtitle={
                <FormattedMessage id="publishDialog.submissionMandatory" defaultMessage="Submission Mandatory" />
              }
              emptyMessage={
                <FormattedMessage id="publishDialog.emptyHardDependencies" defaultMessage="No hard dependencies" />
              }
              uris={deps.items1 ?? []}
              displayItemTitle={false}
              disabled={disabled}
            />
            <SelectionList
              title={<FormattedMessage id="publishDialog.softDependencies" defaultMessage="Soft Dependencies" />}
              subtitle={<FormattedMessage id="publishDialog.submissionOptional" defaultMessage="Submission Optional" />}
              emptyMessage={
                <FormattedMessage id="publishDialog.emptySoftDependencies" defaultMessage="No soft dependencies" />
              }
              uris={deps.items2 ?? []}
              onItemClicked={setCheckedSoftDep}
              onSelectAllClicked={onSelectAllSoftClicked}
              displayItemTitle={false}
              checked={checkedSoftDep}
              disabled={disabled}
            />
          </>
        )}
      </div>
    </>
  );
}

interface DependencySelectionDeleteProps {
  items: DetailedItem[];
  resultItems: DeleteDependencies;
  onChange: Function;
  onEditDependency?: Function;
}

export function DependencySelectionDelete(props: DependencySelectionDeleteProps) {
  const classes = useStyles({});
  const { items, resultItems, onChange, onEditDependency } = props;
  const [checked, _setChecked] = useState<any>(createPresenceTable(items, true, (item) => item.path));
  const siteId = useActiveSiteId();
  const authoringBase = useSelection<string>((state) => state.env.authoringBase);

  const setChecked = (uri: string[], isChecked: boolean) => {
    _setChecked(updateCheckedList(uri, isChecked, checked));
  };

  const onClickSetChecked = (e: any, item: SandboxItem) => {
    e.stopPropagation();
    e.preventDefault();
    setChecked([item.path], !checked[item.path]);
  };

  const selectAllDeps = () => {
    const isAllChecked = !items.some((item) => !checked[item.path]);
    setChecked(
      items.map((i) => i.path),
      !isAllChecked
    );
  };

  useEffect(() => {
    const result = Object.entries({ ...checked })
      .filter(([key, value]) => value === true)
      .map(([key]) => key);
    onChange?.(result);
  }, [checked, onChange]);

  const onEditClick = (uri: string) => {
    onEditDependency({ site: siteId, path: uri, authoringBase });
  };

  return (
    <div className={classes.dependencySelection}>
      <SelectionList
        title={<FormattedMessage id="deleteDialog.deleteItems" defaultMessage="Delete Items" />}
        items={items}
        onItemClicked={onClickSetChecked}
        onSelectAllClicked={selectAllDeps}
        displayItemTitle={true}
        checked={checked}
      />
      <>
        <SelectionList
          title={<FormattedMessage id="deleteDialog.childItemsText" defaultMessage="Child Items" />}
          subtitle={<FormattedMessage id="deleteDialog.willGetDeleted" defaultMessage="Will get deleted" />}
          emptyMessage={<FormattedMessage id="deleteDialog.emptyChildItems" defaultMessage="No child items" />}
          uris={resultItems.childItems}
          displayItemTitle={false}
        />
        <SelectionList
          title={<FormattedMessage id="deleteDialog.dependentItems" defaultMessage="Dependent Items" />}
          subtitle={<FormattedMessage id="deleteDialog.brokenItems" defaultMessage="Will have broken references" />}
          emptyMessage={<FormattedMessage id="deleteDialog.emptyDependentItems" defaultMessage="No dependent items" />}
          uris={resultItems.dependentItems}
          displayItemTitle={false}
          showEdit
          onEditClick={onEditClick}
        />
      </>
    </div>
  );
}

function SelectionList(props: SelectionListProps) {
  const {
    title,
    subtitle,
    emptyMessage,
    items,
    uris,
    onItemClicked,
    onSelectAllClicked,
    checked,
    disabled = false,
    showEdit = false,
    onEditClick
  } = props;

  const classes = useStyles();
  const locale = useLocale();

  const paths = items ? items.map((item) => item.path) : uris;

  const isAllChecked = useMemo(() => (checked ? !paths?.some((path) => !checked[path]) : null), [paths, checked]);
  const isIndeterminate = useMemo(() => (checked ? paths?.some((path) => checked?.[path] && !isAllChecked) : null), [
    paths,
    checked,
    isAllChecked
  ]);

  return (
    <>
      <ListItem divider dense disableGutters={!Boolean(paths)}>
        <ListItemIcon>
          {onSelectAllClicked && Boolean(paths?.length) && (
            <Checkbox
              color="primary"
              edge="start"
              disabled={disabled}
              indeterminate={isIndeterminate}
              checked={isAllChecked || isIndeterminate}
              onChange={() => onSelectAllClicked()}
            />
          )}
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
      {items && (
        <List className={classes.selectionList}>
          {items.map((item) => {
            const labelId = `checkbox-list-label-${item.path}`;
            return (
              <ListItem
                key={item.path}
                role={undefined}
                disabled={disabled}
                {...(onItemClicked
                  ? {
                      button: true,
                      onClick: (e) => onItemClicked(e, item)
                    }
                  : null)}
              >
                {onItemClicked && (
                  <ListItemIcon>
                    <Checkbox
                      color="primary"
                      edge="start"
                      checked={!!checked[item.path]}
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
                          <FormattedMessage id="itemPublishingDate.now" defaultMessage="Submitted for ASAP" />
                        ) : (
                          <FormattedMessage id="itemPublishingDate.now" defaultMessage="Scheduled for ASAP" />
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
                        {getItemStateText(item.stateMap)}
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
      )}
      {uris && (
        <List>
          {uris.length ? (
            uris.map((uri: string) => {
              const labelId = `checkbox-list-label-${uri}`;

              return (
                <ListItem
                  classes={{ secondaryAction: classes.secondaryAction }}
                  key={uri}
                  role={undefined}
                  dense
                  {...(onItemClicked
                    ? {
                        button: true,
                        onClick: (e) => onItemClicked(e, uri, !Boolean(checked[uri]))
                      }
                    : null)}
                >
                  {onItemClicked && (
                    <ListItemIcon>
                      <Checkbox
                        color="primary"
                        edge="start"
                        checked={Boolean(checked[uri])}
                        tabIndex={-1}
                        disableRipple
                        inputProps={{ 'aria-labelledby': uri }}
                        disabled={disabled}
                      />
                    </ListItemIcon>
                  )}
                  <ListItemText
                    id={labelId}
                    primary={uri}
                    primaryTypographyProps={{
                      title: uri,
                      classes: { root: classes.overflowText }
                    }}
                  />
                  {showEdit && (
                    <ListItemSecondaryAction>
                      <Button
                        color="primary"
                        onClick={() => onEditClick(uri)}
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
              <ErrorOutlineOutlinedIcon color="action" fontSize="small" />
              <Typography variant="caption">{emptyMessage}</Typography>
            </Box>
          )}
        </List>
      )}
    </>
  );
}

export default DependencySelection;
