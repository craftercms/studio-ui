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

import React, { useState, useEffect, useCallback } from 'react';
import { Item } from '../models/Item';
import '../styles/dependency-selection.scss';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import { get } from '../utils/ajax';
import { FormattedMessage } from 'react-intl';
import Checkbox from '@material-ui/core/Checkbox';

interface DependencySelectionProps {
  items: Item[];
  siteId: string;
  onChange: Function;
}

interface ResultObject {
  items1: [];
  items2: [];
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

const BlueCheckbox = withStyles({
  root: {
    color: '#7e9dbb',
    padding: '2px',
    '&$checked': {
      color: '#7e9dbb'
    }
  },
  checked: {}
})(Checkbox);

const CenterCircularProgress = withStyles({
  root: {
    justifyContent: 'center',
    color: '#7e9dbb',
    width: '30px!important',
    height: '30px!important',
    marginRight: '10px'
  }
})(CircularProgress);

const checkState = (items: Item[]) => {
  return (items || []).reduce((table: any, item) => {
    table[item.uri] = true;
    return table;
  }, {});
};

const updateCheckedList = (uri: string[], isChecked: boolean, checked: any) => {
  const nextChecked = { ...checked };
  (Array.isArray(uri) ? uri : [uri]).forEach((u) => {
    nextChecked[u] = isChecked;
  });
  return nextChecked;
};

const onClickSetChecked = (e: any, item: any, setChecked: Function, checked: any) => {
  e.stopPropagation();
  e.preventDefault();
  setChecked([item.uri], !checked[item.uri]);
};

const paths = (checked: any) =>
  Object.entries({ ...checked })
    .filter(([, value]) => value)
    .map(([key]) => encodeURIComponent(key));

const selectAll = (setChecked: Function, items: Item[]) => {
  setChecked(
    items.map((i) => i.uri),
    true
  );
};

export function DependencySelection(props: DependencySelectionProps) {
  const [deps, setDeps] = useState<ResultObject>();
  const [showDepsButton, setShowDepsButton] = useState(true);
  const { items, siteId, onChange } = props;
  const [checked, _setChecked] = useState<any>(checkState(items));

  const setChecked = (uri: string[], isChecked: boolean) => {
    _setChecked(updateCheckedList(uri, isChecked, checked));
    setShowDepsButton(true);
    setDeps(null);
    cleanCheckedSoftDep();
  };

  const [checkedSoftDep, _setCheckedSoftDep] = useState<any>({});

  const setCheckedSoftDep = (uri: string[], isChecked: boolean) => {
    const nextCheckedSoftDep = { ...checkedSoftDep };
    (Array.isArray(uri) ? uri : [uri]).forEach((u) => {
      nextCheckedSoftDep[u] = isChecked;
    });
    _setCheckedSoftDep(nextCheckedSoftDep);
  };

  const cleanCheckedSoftDep = () => {
    const nextCheckedSoftDep = {};
    _setCheckedSoftDep(nextCheckedSoftDep);
  };

  function selectAllSoft() {
    setCheckedSoftDep(deps.items2, true);
  }

  function showAllDependencies() {
    setShowDepsButton(false);
    get(`/studio/api/2/dependency/dependencies?siteId=${siteId}&paths=${paths(checked)}`).subscribe(
      (response: any) => {
        setDeps({
          items1: response.response.items.hardDependencies,
          items2: response.response.items.softDependencies
        });
      },
      () => {
        setDeps({
          items1: [],
          items2: []
        });
      }
    );
  }

  useEffect(() => {
    onChange(
      Object.entries({ ...checked, ...checkedSoftDep })
        .filter(([, value]) => value === true)
        .map(([key]) => key)
    );
  }, [checked, checkedSoftDep, onChange]);

  return (
    <>
      <div className="dependency-selection">
        <SelectionList
          title={<FormattedMessage id="publishDialog.itemsToPublish" defaultMessage={`Items To Publish`} />}
          items={items}
          onItemClicked={onClickSetChecked}
          onSelectAllClicked={selectAll}
          displayItemTitle={true}
          checked={checked}
          setChecked={setChecked}
        />
        {deps != null && (
          <>
            <SelectionList
              title={<FormattedMessage id="publishDialog.hardDependencies" defaultMessage={`Hard Dependencies`} />}
              subtitle={
                <FormattedMessage id="publishDialog.submissionMandatory" defaultMessage={`Submission Mandatory`} />
              }
              uris={deps.items1}
              displayItemTitle={false}
            />
            <SelectionList
              title={<FormattedMessage id="publishDialog.softDependencies" defaultMessage={`Soft Dependencies`} />}
              subtitle={
                <FormattedMessage id="publishDialog.submissionOptional" defaultMessage={`Submission Optional`} />
              }
              uris={deps.items2}
              onItemClicked={setCheckedSoftDep}
              onSelectAllClicked={selectAllSoft}
              displayItemTitle={false}
              checked={checkedSoftDep}
              setChecked={setChecked}
            />
          </>
        )}
      </div>
      <div className="dependency-selection--bottom-section">
        {deps == null && !showDepsButton ? (
          <div className="centerCircularProgress">
            <CenterCircularProgress />
            <span className="dependency-selection--center-circular-progress-text">
              <FormattedMessage
                id="publishDialog.loadingDependencies"
                defaultMessage={`Loading Dependencies, please wait{ellipsis}`}
                values={{ ellipsis: '&hellip;' }}
              />
            </span>
          </div>
        ) : (
          showDepsButton && (
            <button
              className="dependency-selection--nav-btn dependency-selection--show-all"
              onClick={showAllDependencies}
              disabled={Object.values(checked).filter((value) => value).length === 0}
            >
              <FormattedMessage id="publishDialog.showAllDependencies" defaultMessage={`Show All Dependencies`} />
            </button>
          )
        )}
        <p>
          <FormattedMessage
            id="publishDialog.changesInSelection"
            defaultMessage={`Changes in the selection of items to publish will require "all dependencies" to be recalculated.`}
          />
        </p>
      </div>
    </>
  );
}

export function DependencySelectionDelete(props: DependencySelectionProps) {
  const [resultItems, setResultItems] = useState<ResultObject>();
  const { items, siteId, onChange } = props;
  const [checked, _setChecked] = useState<any>(checkState(items));

  const setChecked = (uri: string[], isChecked: boolean) => {
    _setChecked(updateCheckedList(uri, isChecked, checked));
    setResultItems(null);
  };

  const showAllDependencies = useCallback(
    () =>
      get(`/studio/api/2/content/get_delete_package?siteId=${siteId}&paths=${paths(checked)}`).subscribe(
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
      ),
    [checked, siteId]
  );

  useEffect(() => {
    const result = Object.entries({ ...checked })
      .filter(([, value]) => value === true)
      .map(([key]) => key);

    if (result.length) {
      showAllDependencies();
    } else {
      setResultItems({
        items1: [],
        items2: []
      });
    }

    onChange(result);
  }, [checked, onChange, showAllDependencies]);

  return (
    <>
      <div className="dependency-selection">
        <SelectionList
          title={<FormattedMessage id="deleteDialog.deleteItems" defaultMessage={`Delete Items`} />}
          items={items}
          onItemClicked={onClickSetChecked}
          onSelectAllClicked={selectAll}
          displayItemTitle={true}
          checked={checked}
          setChecked={setChecked}
        />
        {resultItems != null && (
          <>
            <SelectionList
              title={<FormattedMessage id="deleteDialog.childItemsText" defaultMessage={`Child Items`} />}
              subtitle={<FormattedMessage id="deleteDialog.willGetDeleted" defaultMessage={` Will get deleted`} />}
              uris={resultItems.items1}
              displayItemTitle={false}
            />
            <SelectionList
              title={<FormattedMessage id="deleteDialog.dependendtItems" defaultMessage={`Dependent Items`} />}
              subtitle={
                <FormattedMessage id="deleteDialog.brokenItems" defaultMessage={` Will have broken references`} />
              }
              uris={resultItems.items2}
              displayItemTitle={false}
            />
          </>
        )}
      </div>
      <div className="dependency-selection--bottom-section">
        {resultItems == null && (
          <div className="centerCircularProgress">
            <CenterCircularProgress />
            <span className="dependency-selection--center-circular-progress-text">
              <FormattedMessage
                id="deleteDialog.uploadingDepenedents"
                defaultMessage={`Updating dependents, please wait...`}
              />
            </span>
          </div>
        )}
      </div>
    </>
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
    displayItemTitle,
    checked,
    setChecked
  } = props;

  return (
    <div>
      <h2 className="dependency-selection--title dependency-selection--publish-title">{title}</h2>
      {subtitle && (
        <span>
          {` • `}
          {subtitle}
        </span>
      )}
      {onSelectAllClicked && (
        <button
          className="dependency-selection--nav-btn dependency-selection--select-all"
          onClick={() => onSelectAllClicked(setChecked, items)}
        >
          <FormattedMessage id="common.selectAll" defaultMessage={`Select All`} />
        </button>
      )}
      {items &&
        items.map((item) => (
          <div className="dependency-selection--section-dependencies" key={item.uri}>
            {onItemClicked && (
              <div className="dependency-selection--checkbox">
                <BlueCheckbox
                  checked={!!checked[item.uri]}
                  onClick={(e) => onItemClicked(e, item, setChecked, checked)}
                  onChange={() => void 0}
                  value={item.uri}
                  color="primary"
                />
              </div>
            )}
            <div
              className="dependency-selection--information"
              onClick={(e) => onItemClicked(e, item, setChecked, checked)}
            >
              {displayItemTitle && (
                <div className="dependency-selection--information--internal-name">{item.internalName}</div>
              )}
              <div className="dependency-selection--information--uri">&nbsp;{item.uri}</div>
            </div>
          </div>
        ))}
      {uris && (
        <ul className="dependency-selection--list">
          {uris.map((uri: string) =>
            onItemClicked ? (
              <li key={uri}>
                <div className="dependency-selection--list--soft-checkbox">
                  <BlueCheckbox
                    checked={!!checked[uri]}
                    onChange={(e) => onItemClicked([uri], e.target.checked, setChecked, checked)}
                    value={uri}
                    color="primary"
                  />
                </div>
                <div
                  className="dependency-selection--list--soft-item"
                  onClick={() => onItemClicked([uri], !checked[uri], setChecked, checked)}
                >
                  {uri}
                </div>
              </li>
            ) : (
              <li className="dependency-selection--list--hard" key={uri}>
                {uri}
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}

export default DependencySelection;
