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
import { BaseItem, SandboxItem } from '../../../models/Item';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import { FormattedMessage } from 'react-intl';
import Checkbox from '@material-ui/core/Checkbox';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Typography from '@material-ui/core/Typography';
import { createCheckedItems, onClickSetChecked, selectAllDeps, updateCheckedList } from '../Publish/PublishDialog';
import Button from '@material-ui/core/Button';
import clsx from 'clsx';
import { useActiveSiteId, useSelection } from '../../../utils/hooks';

interface DependencySelectionProps<T extends BaseItem = BaseItem> {
  items: T[];
  siteId?: string; // for dependencySelectionDelete
  onChange?: Function; // for dependencySelectionDelete
  checked: T[];
  setChecked: Function;
  checkedSoftDep: any[];
  setCheckedSoftDep: Function;
  onClickSetChecked: Function;
  deps: any;
  showDepsButton: boolean;
  onSelectAllClicked: Function;
  onSelectAllSoftClicked: Function;
  onClickShowAllDeps?: any;
  disabled?: boolean;
}

interface SelectionListProps<T extends BaseItem = BaseItem> {
  title: any;
  subtitle?: any;
  items?: T[];
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

const useStyles = makeStyles((theme) => ({
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
  selectionListTitle: {
    margin: '6px auto 6px',
    display: 'inline-block',
    fontSize: '16px',
    fontWeight: 400
  },
  selectAllBtn: {
    marginLeft: '17px',
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
  }
}));

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
                defaultMessage="Loading Dependencies, please wait{ellipsis}"
                values={{ ellipsis: '&hellip;' }}
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
  const [checked, _setChecked] = useState<any>(createCheckedItems(items));
  const siteId = useActiveSiteId();
  const authoringBase = useSelection<string>((state) => state.env.authoringBase);
  const defaultFormSrc = `${authoringBase}/legacy/form`;

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
    const src = `${defaultFormSrc}?site=${siteId}&path=${uri}&type=form`;
    onEditDependency(src);
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

  return (
    <div>
      <Typography variant="h2" component="h2" className={classes.selectionListTitle}>
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
      {items && (
        <List className={classes.selectionList}>
          {items.map((item) => {
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
                <ListItemText
                  id={labelId}
                  primary={<h4>{item.label}</h4>}
                  primaryTypographyProps={{
                    className: classes.listItemTitle
                  }}
                  secondary={<React.Fragment>{item.path}</React.Fragment>}
                  secondaryTypographyProps={{
                    className: classes.listItemPath
                  }}
                />
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
                <ListItemText id={labelId} primary={uri} />
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
    </div>
  );
}

export default DependencySelection;
