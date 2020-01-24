/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
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
import { Item } from '../../../models/Item';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import { get } from '../../../utils/ajax';
import { FormattedMessage } from 'react-intl';
import Checkbox from '@material-ui/core/Checkbox';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
//imports for DependencySelectionDelete
import { checkState, onClickSetChecked, paths, selectAllDeps, updateCheckedList } from '../Publish/PublishDialog';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import Button from '@material-ui/core/Button';
import { palette } from '../../../styles/theme';

interface DependencySelectionProps {
  items: Item[];
  siteId?: string;      // for dependencySelectionDelete
  onChange?: Function;  // for dependencySelectionDelete
  checked: Item[];
  setChecked: Function;
  checkedSoftDep: any[];
  setCheckedSoftDep: Function;
  onClickSetChecked: Function;
  deps: any;
  showDepsButton: boolean;
  onSelectAllClicked: Function;
  onSelectAllSoftClicked: Function;
  onClickShowAllDeps? : any;
}

interface SelectionListProps {
  title: any;
  subtitle?: any;
  items?: Item[];
  uris?: [];
  onItemClicked?: Function;
  onSelectAllClicked?: Function;
  displayItemTitle: boolean;
  checked?: any;
  setChecked?: Function;
}

interface ResultObject {
  items1: [],
  items2: []
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

const useStyles = makeStyles((theme: Theme) => ({
  dependencySelection: {
    padding: '11px 12px',
    backgroundColor: palette.white,
    border: '1px solid',
    borderColor: palette.gray.light5,
    height: 'calc(100% - 24px)',
    minHeight: '374px',
    overflowY: 'scroll'
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
    marginTop: '20px',
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
      margin: '0px',
      padding: '0px',
      fontWeight: 400
    }
  },
  listItemPath: {
    padding: '0px'
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
    onClickShowAllDeps
  } = props;

  const classes = useStyles({});

  return (
    <>
      <div className={ classes.dependencySelection }>
        <SelectionList
          title={
            <FormattedMessage
              id="publishDialog.itemsToPublish"
              defaultMessage={`Items To Publish`}
            />
          }
          items={items}
          onItemClicked={onClickSetChecked}
          onSelectAllClicked={onSelectAllClicked}
          displayItemTitle={true}
          checked={checked}
          setChecked={setChecked}
        />
        {
          deps == null ? (null) : (
            <>
              <SelectionList
                title={
                  <FormattedMessage
                    id="publishDialog.hardDependencies"
                    defaultMessage={`Hard Dependencies`}
                  />
                }
                subtitle={
                  <FormattedMessage
                    id="publishDialog.submissionMandatory"
                    defaultMessage={`Submission Mandatory`}
                  />
                }
                uris={deps.items1}
                displayItemTitle={false}
              />
              <SelectionList
                title={
                  <FormattedMessage
                    id="publishDialog.softDependencies"
                    defaultMessage={`Soft Dependencies`}
                  />
                }
                subtitle={
                  <FormattedMessage
                    id="publishDialog.submissionOptional"
                    defaultMessage={`Submission Optional`}
                  />
                }
                uris={deps.items2}
                onItemClicked={setCheckedSoftDep}
                onSelectAllClicked={onSelectAllSoftClicked}
                displayItemTitle={false}
                checked={checkedSoftDep}
                setChecked={setChecked}
              />
            </>
          )
        }
      </div>
      <div className={ classes.bottomSection }>
        {
          (deps == null && !showDepsButton) ? (
            <div className="centerCircularProgress">
              <CenterCircularProgress/>
              <span className={ classes.circularProgressText }>
                <FormattedMessage
                  id="publishDialog.loadingDependencies"
                  defaultMessage={`Loading Dependencies, please wait{ellipsis}`}
                  values={{ ellipsis: '&hellip;' }}
                />
              </span>
            </div>
          ) : (
            // if no onClickShowAllDeps function defined, don't show button
            (showDepsButton && onClickShowAllDeps ) ? (
              <Button
                color="primary"
                onClick={onClickShowAllDeps}
                size="small"
                className={ classes.showAllBtn }
              >
                <FormattedMessage
                  id="publishDialog.showAllDependencies"
                  defaultMessage={`Show All Dependencies`}
                />
              </Button>
            ) : (null)
          )
        }
        { onClickShowAllDeps &&
          <p>
            <FormattedMessage
              id="publishDialog.changesInSelection"
              defaultMessage={`Changes in the selection of items to publish will require "all dependencies" to be recalculated.`}
            />
          </p>
        }
      </div>
    </>
  );
}


export function DependencySelectionDelete(props: DependencySelectionProps) {
  const [resultItems, setResultItems] = useState<ResultObject>();
  const { items, siteId } = props;
  const [checked, _setChecked] = useState<any>(
    checkState(items)
  );

  const setChecked = (uri: string[], isChecked: boolean) => {
    _setChecked(updateCheckedList(uri, isChecked, checked));
    setResultItems(null);
  };

  const classes = useStyles({});

  useEffect(checkedChange, [checked]);

  return (
    <>
      <div className={ classes.dependencySelection }>

        <SelectionList
          title={
            <FormattedMessage
              id="deleteDialog.deleteItems"
              defaultMessage={`Delete Items`}
            />
          }
          items={items}
          onItemClicked={onClickSetChecked}
          onSelectAllClicked={selectAllDeps}
          displayItemTitle={true}
          checked={checked}
          setChecked={setChecked}
        />
        {
          resultItems == null ? (null) : (
            <>
              <SelectionList
                title={
                  <FormattedMessage
                    id="deleteDialog.childItemsText"
                    defaultMessage={`Child Items`}
                  />
                }
                subtitle={
                  <FormattedMessage
                    id="deleteDialog.willGetDeleted"
                    defaultMessage={` Will get deleted`}
                  />
                }
                uris={resultItems.items1}
                displayItemTitle={false}
              />
              <SelectionList
                title={
                  <FormattedMessage
                    id="deleteDialog.dependendtItems"
                    defaultMessage={`Dependent Items`}
                  />
                }
                subtitle={
                  <FormattedMessage
                    id="deleteDialog.brokenItems"
                    defaultMessage={` Will have broken references`}
                  />
                }
                uris={resultItems.items2}
                displayItemTitle={false}
              />
            </>
          )
        }
      </div>
      <div className={ classes.bottomSection }>
        {
          (resultItems == null) ? (
            <div className="centerCircularProgress">
              <CenterCircularProgress/>
              <span className={ classes.circularProgressText }>
                <FormattedMessage
                  id="deleteDialog.uploadingDepenedents"
                  defaultMessage={`Updating dependents, please wait...`}
                />
              </span>
            </div>
          ) : (null)
        }
      </div>
    </>

  );

  function checkedChange() {
    showAllDependencies();
    setRef();
  }

  function setRef() {
    const result = Object.entries({ ...checked })
      .filter(([key, value]) => value === true)
      .map(([key]) => key);
    props.onChange(result);
  }

  function showAllDependencies() {
    get(`/studio/api/2/content/get_delete_package?siteId=${siteId}&paths=${paths(checked)}`)
      .subscribe(
        (response: any) => {
          setResultItems({
            items1: response.response.items.childItems,
            items2: response.response.items.dependentItems
          });
        },
        () => {
          setResultItems({
            items1: [],
            items2: []
          });
        }
      );
  }

}

function SelectionList(props: SelectionListProps) {

  const { title, subtitle, items, uris, onItemClicked, onSelectAllClicked, checked, setChecked } = props;

  const classes = useStyles({});

  return (
    <div>
      <Typography variant="h2" component="h2" className={ classes.selectionListTitle }>
        {title}
      </Typography>
      {
        subtitle ? (
          <Typography component="span">
            {` • `}
            {subtitle}
          </Typography>
        ) : (null)
      }
      {
        onSelectAllClicked ? (
          <Button
            color="primary"
            onClick={() => onSelectAllClicked(setChecked, items)}
            size="small"
            className={ classes.selectAllBtn }
          >
            <FormattedMessage
              id="common.selectAll"
              defaultMessage={`Select All`}
            />
          </Button>
        ) : (null)
      }
      {
        items &&
        <List className={ classes.selectionList }>
          {
            items.map((item: Item) => {
              const labelId = `checkbox-list-label-${item.uri}`;

              return (
                <ListItem
                  className={ classes.listItem }
                  key={item.uri}
                  role={undefined}
                  {... (onItemClicked ? {
                    button: true,
                    onClick: (e) => onItemClicked(e, item, setChecked, checked)
                  }: null) }
                >
                  {
                    onItemClicked &&
                    <ListItemIcon className={ classes.listItemIcon }>
                      <Checkbox
                        color="primary"
                        edge="start"
                        checked={!!checked[item.uri]}
                        tabIndex={-1}
                        disableRipple
                        inputProps={{ 'aria-labelledby': item.uri }}
                      />
                    </ListItemIcon>
                  }
                  <ListItemText
                    id={labelId}
                    primary={<h4>{item.internalName}</h4>}
                    primaryTypographyProps={{
                      className: classes.listItemTitle
                    }}
                    secondary={
                      <React.Fragment>
                        {item.uri}
                      </React.Fragment>
                    }
                    secondaryTypographyProps={{
                      className: classes.listItemPath
                    }}
                  />
                </ListItem>
              );
            })
          }
        </List>
      }
      {
        uris ? (
          <List>
            {
              uris.map((uri: string) => {
                const labelId = `checkbox-list-label-${uri}`;

                return (
                  <ListItem
                    className={ classes.listItem }
                    key={uri}
                    role={undefined}
                    dense
                    {... (onItemClicked ? {
                      button: true,
                      onClick: () => onItemClicked([uri], !checked[uri], setChecked, checked)
                    }: null)}
                  >
                    {
                      onItemClicked &&
                      <ListItemIcon className={ classes.listItemIcon }>
                        <Checkbox
                          color="primary"
                          edge="start"
                          checked={!!checked[uri]}
                          tabIndex={-1}
                          disableRipple
                          inputProps={{ 'aria-labelledby': uri }}
                        />
                      </ListItemIcon>
                    }
                    <ListItemText
                      id={labelId}
                      primary={ uri }

                    />
                  </ListItem>
                );
              })
            }
          </List>
        ) : (null)
      }
    </div>
  );

}

export default DependencySelection;
