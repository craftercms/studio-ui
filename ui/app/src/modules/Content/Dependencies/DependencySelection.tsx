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

import React, { useEffect, useState } from 'react';
import { DetailedItem, SandboxItem } from '../../../models/Item';
import { createStyles, makeStyles, withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import { FormattedMessage } from 'react-intl';
import Checkbox from '@material-ui/core/Checkbox';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { onClickSetChecked, selectAllDeps, updateCheckedList } from '../Publish/PublishDialog';
import Button from '@material-ui/core/Button';
import clsx from 'clsx';
import { useSelection } from '../../../utils/hooks/useSelection';
import { useActiveSiteId } from '../../../utils/hooks/useActiveSiteId';
import LookupTable from '../../../models/LookupTable';
import { createPresenceTable } from '../../../utils/array';
import PublishingTargetIcon from '@material-ui/icons/FiberManualRecordRounded';
import ScheduledStateIcon from '@material-ui/icons/AccessTimeRounded';
import palette from '../../../styles/palette';
import { useLocale } from '../../../utils/hooks/useLocale';
import { asLocalizedDateTime } from '../../../utils/datetime';

interface DependencySelectionProps {
  items?: DetailedItem[] | SandboxItem[];
  siteId?: string; // for dependencySelectionDelete
  onChange?: Function; // for dependencySelectionDelete
  checked: LookupTable<boolean>;
  setChecked: Function;
  checkedSoftDep: LookupTable<boolean>;
  setCheckedSoftDep: Function;
  onClickSetChecked: Function;
  deps: any;
  showDepsButton: boolean;
  onSelectAllClicked: Function;
  onSelectAllSoftClicked: Function;
  onClickShowAllDeps?: any;
  disabled?: boolean;
}

interface SelectionListProps {
  title: any;
  subtitle?: any;
  items?: DetailedItem[] | SandboxItem[];
  uris?: string[];
  onItemClicked?: Function;
  onSelectAllClicked?: Function;
  displayItemTitle: boolean;
  checked?: any;
  setChecked?: Function;
  disabled?: boolean;
  showEdit?: boolean;
  onEditClick?: Function;
}

export interface DeleteDependencies {
  childItems: string[];
  dependentItems: string[];
}

const CenterCircularProgress = withStyles({
  root: {
    justifyContent: 'center',
    color: '#7e9dbb',
    width: '30px!important',
    height: '30px!important',
    marginRight: '10px'
  }
})(CircularProgress);

const useStyles = makeStyles((theme) =>
  createStyles({
    dependencySelection: {
      padding: '11px 12px',
      background: theme.palette.background.paper,
      border: `1px solid ${theme.palette.divider}`,
      height: 'calc(100% - 24px)',
      minHeight: '374px',
      overflowY: 'hidden'
    },
    dependencySelectionDelete: {
      overflowY: 'auto'
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
    bottomSection: {
      marginLeft: '10px'
    },
    circularProgressText: {
      position: 'relative',
      bottom: '9px'
    },
    selectionList: {
      paddingTop: 0
    },
    listItem: {
      padding: '0 5px'
    },
    listItemIcon: {
      minWidth: '36px'
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
      color: palette.gray.medium2,
      margin: '0 5px'
    },
    publishingTargetLive: {
      color: palette.green.main
    },
    publishingTargetStaged: {
      color: palette.blue.main
    },
    stateScheduledIcon: {
      fontSize: '1rem',
      color: palette.green.main,
      marginRight: '5px'
    }
  })
);

export function DependencySelection(props: DependencySelectionProps) {
  const {
    items,
    checked,
    setChecked,
    checkedSoftDep,
    setCheckedSoftDep,
    deps,
    showDepsButton,
    onClickSetChecked,
    onSelectAllClicked,
    onSelectAllSoftClicked,
    onClickShowAllDeps,
    disabled = false
  } = props;

  const classes = useStyles({});

  return (
    <>
      <div className={`${classes.dependencySelection} ${disabled ? classes.dependencySelectionDisabled : ''}`}>
        <SelectionList
          title={<FormattedMessage id="publishDialog.itemsToPublish" defaultMessage="Items To Publish" />}
          items={items}
          onItemClicked={onClickSetChecked}
          onSelectAllClicked={onSelectAllClicked}
          displayItemTitle={true}
          checked={checked}
          setChecked={setChecked}
          disabled={disabled}
        />
        {deps == null ? null : (
          <>
            <SelectionList
              title={<FormattedMessage id="publishDialog.hardDependencies" defaultMessage="Hard Dependencies" />}
              subtitle={
                <FormattedMessage id="publishDialog.submissionMandatory" defaultMessage="Submission Mandatory" />
              }
              uris={deps.items1}
              displayItemTitle={false}
              disabled={disabled}
            />
            <SelectionList
              title={<FormattedMessage id="publishDialog.softDependencies" defaultMessage="Soft Dependencies" />}
              subtitle={<FormattedMessage id="publishDialog.submissionOptional" defaultMessage="Submission Optional" />}
              uris={deps.items2}
              onItemClicked={setCheckedSoftDep}
              onSelectAllClicked={onSelectAllSoftClicked}
              displayItemTitle={false}
              checked={checkedSoftDep}
              setChecked={setChecked}
              disabled={disabled}
            />
          </>
        )}
      </div>
      <div className={classes.bottomSection}>
        {deps == null && !showDepsButton ? (
          <div className="centerCircularProgress">
            <CenterCircularProgress />
            <span className={classes.circularProgressText}>
              <FormattedMessage
                id="publishDialog.loadingDependencies"
                defaultMessage="Loading Dependencies, please wait..."
              />
            </span>
          </div>
        ) : (
          // If no onClickShowAllDeps function defined, don't show button
          showDepsButton &&
          onClickShowAllDeps && (
            <Button color="primary" onClick={onClickShowAllDeps} size="small" className={classes.showAllBtn}>
              <FormattedMessage id="publishDialog.showAllDependencies" defaultMessage="Show All Dependencies" />
            </Button>
          )
        )}
        {onClickShowAllDeps && (
          <p>
            <FormattedMessage
              id="publishDialog.changesInSelection"
              defaultMessage={
                'Changes in the selection of items to publish will require "all dependencies" to be recalculated.'
              }
            />
          </p>
        )}
      </div>
    </>
  );
}

interface DependencySelectionDeleteProps {
  items: SandboxItem[];
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
    <div className={clsx(classes.dependencySelection, classes.dependencySelectionDelete)}>
      <SelectionList
        title={<FormattedMessage id="deleteDialog.deleteItems" defaultMessage="Delete Items" />}
        items={items}
        onItemClicked={onClickSetChecked}
        onSelectAllClicked={selectAllDeps}
        displayItemTitle={true}
        checked={checked}
        setChecked={setChecked}
      />
      <>
        <SelectionList
          title={<FormattedMessage id="deleteDialog.childItemsText" defaultMessage="Child Items" />}
          subtitle={<FormattedMessage id="deleteDialog.willGetDeleted" defaultMessage="Will get deleted" />}
          uris={resultItems.childItems}
          displayItemTitle={false}
        />
        <SelectionList
          title={<FormattedMessage id="deleteDialog.dependentItems" defaultMessage="Dependent Items" />}
          subtitle={<FormattedMessage id="deleteDialog.brokenItems" defaultMessage="Will have broken references" />}
          uris={resultItems.dependentItems}
          displayItemTitle={false}
          showEdit
          onEditClick={onEditClick}
        />
      </>
      <div className={classes.bottomSection}>
        {resultItems === null && (
          <div className="centerCircularProgress">
            <CenterCircularProgress />
            <span className={classes.circularProgressText}>
              <FormattedMessage
                id="deleteDialog.updatingDependents"
                defaultMessage="Updating dependents, please wait..."
              />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function SelectionList(props: SelectionListProps) {
  const {
    title,
    subtitle,
    items,
    uris,
    onItemClicked,
    onSelectAllClicked,
    checked,
    setChecked,
    disabled = false,
    showEdit = false,
    onEditClick
  } = props;

  const classes = useStyles({});
  const locale = useLocale();

  return (
    <>
      <Box display="flex" alignItems="center" whiteSpace="break-spaces">
        <Typography variant="subtitle1" component="h2">
          {title}
        </Typography>
        {subtitle ? (
          <Typography component="span">
            {` • `}
            {subtitle}
          </Typography>
        ) : null}
        {onSelectAllClicked ? (
          <Button
            color="primary"
            onClick={() => onSelectAllClicked(setChecked, items)}
            size="small"
            className={classes.selectAllBtn}
          >
            <FormattedMessage id="common.selectAll" defaultMessage="Select All" />
          </Button>
        ) : null}
      </Box>
      {items && (
        <List className={classes.selectionList}>
          {// @ts-ignore
          items.map((item) => {
            const labelId = `checkbox-list-label-${item.path}`;

            return (
              <ListItem
                className={classes.listItem}
                key={item.path}
                role={undefined}
                {...(onItemClicked
                  ? {
                      button: true,
                      onClick: (e) => onItemClicked(e, item, setChecked, checked)
                    }
                  : null)}
              >
                {onItemClicked && (
                  <ListItemIcon className={classes.listItemIcon}>
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
                  {item.live && (
                    <Box display="flex" alignItems="center">
                      <ScheduledStateIcon className={classes.stateScheduledIcon} />
                      {item.live.dateScheduled ? (
                        <Typography variant="body2" color="textSecondary">
                          <FormattedMessage
                            id="itemPublishingDate.scheduled"
                            defaultMessage="Scheduled for {date}"
                            values={{
                              date: asLocalizedDateTime(
                                item.live.dateScheduled,
                                locale.localeCode,
                                locale.dateTimeFormatOptions
                              )
                            }}
                          />
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          <FormattedMessage id="itemPublishingDate.now" defaultMessage="Scheduled for ASAP" />
                        </Typography>
                      )}
                      {item.stateMap.submittedToLive ? (
                        <>
                          <PublishingTargetIcon
                            className={clsx(classes.publishingTargetIcon, classes.publishingTargetLive)}
                          />
                          <Typography variant="body2" color="textSecondary">
                            <FormattedMessage id="publishingTargetLive.live" defaultMessage="Submitted to live" />
                          </Typography>
                        </>
                      ) : item.stateMap.submittedToStaging ? (
                        <>
                          <PublishingTargetIcon
                            className={clsx(classes.publishingTargetIcon, classes.publishingTargetStaged)}
                          />
                          <Typography variant="body2" color="textSecondary">
                            <FormattedMessage
                              id="publishingTargetStaged.staging"
                              defaultMessage="Submitted to staging"
                            />
                          </Typography>
                        </>
                      ) : (
                        <>
                          <PublishingTargetIcon className={classes.publishingTargetIcon} />
                          <Typography variant="body2" color="textSecondary">
                            <FormattedMessage id="words.unpublished" defaultMessage="Unpublished" />
                          </Typography>
                        </>
                      )}
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
      {uris ? (
        <List>
          {uris.map((uri: string) => {
            const labelId = `checkbox-list-label-${uri}`;

            return (
              <ListItem
                className={classes.listItem}
                classes={{ secondaryAction: classes.secondaryAction }}
                key={uri}
                role={undefined}
                dense
                {...(onItemClicked
                  ? {
                      button: true,
                      onClick: () => onItemClicked([uri], !checked[uri], setChecked, checked)
                    }
                  : null)}
              >
                {onItemClicked && (
                  <ListItemIcon className={classes.listItemIcon}>
                    <Checkbox
                      color="primary"
                      edge="start"
                      checked={!!checked[uri]}
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
          })}
        </List>
      ) : null}
    </>
  );
}

export default DependencySelection;
