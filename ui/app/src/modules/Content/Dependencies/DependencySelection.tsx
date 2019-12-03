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

import React, { useState, useEffect } from 'react';
import { Item } from '../../../models/Item';
import '../../../styles/dependency-selection.scss';
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
import { checkState, updateCheckedList, selectAllDeps, paths } from "../Submit/RequestPublishDialog";

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

  return (
    <>
      <div className="dependency-selection">
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
      <div className="dependency-selection--bottom-section">
        {
          (deps == null && !showDepsButton) ? (
            <div className="centerCircularProgress">
              <CenterCircularProgress/>
              <span className="dependency-selection--center-circular-progress-text">
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
              <button
                className="dependency-selection--nav-btn dependency-selection--show-all"
                onClick={onClickShowAllDeps}
              >
                <FormattedMessage
                  id="publishDialog.showAllDependencies"
                  defaultMessage={`Show All Dependencies`}
                />
              </button>
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
  const { items, siteId, onClickSetChecked } = props;
  const [checked, _setChecked] = useState<any>(
    checkState(items)
  );

  const setChecked = (uri: string[], isChecked: boolean) => {
    _setChecked(updateCheckedList(uri, isChecked, checked));
    setResultItems(null);
  };

  useEffect(checkedChange, [checked]);

  return (
    <>
      <div className="dependency-selection">

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
      <div className="dependency-selection--bottom-section">
        {
          (resultItems == null) ? (
            <div className="centerCircularProgress">
              <CenterCircularProgress/>
              <span className="dependency-selection--center-circular-progress-text">
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

  const { title, subtitle, items, uris, onItemClicked, onSelectAllClicked, displayItemTitle, checked, setChecked } = props;

  return (
    <div>
      <h2 className="dependency-selection--title dependency-selection--publish-title">
        {title}
      </h2>
      {
        subtitle ? (
          <span>
            {` • `}
            {subtitle}
          </span>
        ) : (null)
      }
      {
        onSelectAllClicked ? (
          <button className="dependency-selection--nav-btn dependency-selection--select-all"
                  onClick={() => onSelectAllClicked(setChecked, items)}>
            <FormattedMessage
              id="common.selectAll"
              defaultMessage={`Select All`}
            />
          </button>
        ) : (null)
      }
      {
        items &&
        <List>
          {
            items.map((item: Item) => {
              const labelId = `checkbox-list-label-${item.uri}`;

              return (
                <ListItem
                  key={item.uri}
                  role={undefined}
                  // dense
                  {...onItemClicked ? {
                    button: true,
                    onClick: (e) => onItemClicked(e, item, setChecked, checked)
                  }: null}
                >
                  {
                    onItemClicked &&
                    <ListItemIcon>
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
                    primary={ item.internalName }
                    secondary={
                      <React.Fragment>
                        <Typography
                          component="span"
                          variant="body2"
                          color="textPrimary"
                        >
                          { item.uri }
                        </Typography>
                      </React.Fragment>
                    }

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
                    key={uri}
                    role={undefined}
                    dense
                    {...onItemClicked ? {
                      button: true,
                      onClick: () => onItemClicked([uri], !checked[uri], setChecked, checked)
                    }: null}
                  >
                    {
                      onItemClicked &&
                      <ListItemIcon>
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
