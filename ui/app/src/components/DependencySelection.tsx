import React, { useState, useEffect } from 'react';
import { Item } from '../models/Item';
import SelectionList from './SelectionList';
import '../styles/dependency-selection.scss';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import { get } from '../utils/ajax';
import { FormattedMessage } from 'react-intl';

interface DependencySelectionProps {
  items: Item[];
  siteId: string;
  onChange: Function;
}

interface resultObject {
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

const checkState = (items: Item[]) => {
  return (items || []).reduce(
    (table: any, item) => {
      table[item.uri] = true;
      return table;
    },
    {}
  )
}

const updateCheckedList = (uri: string[], isChecked: boolean, checked: any) => {
  const nextChecked = { ...checked };
  (Array.isArray(uri) ? uri : [uri]).forEach((u) => {
    nextChecked[u] = isChecked;
  });
  return nextChecked;
}

const onClickSetChecked = (e: any, item: any, setChecked: Function, checked: any) => {
  e.stopPropagation();
  e.preventDefault();
  setChecked([item.uri], !checked[item.uri])
};

const paths = (checked: any) => {
    return Object.entries({ ...checked })
      .filter(([key, value]) => value === true)
      .map(([key]) => key);
}

const selectAll = (setChecked: Function, items: Item[]) => {
  setChecked(items.map(i => i.uri), true);
}

export function DependencySelection(props: DependencySelectionProps) {

  const [deps, setDeps] = useState<resultObject>();
  const [showDepsButton, setShowDepsButton] = useState(true);
  const { items, siteId } = props;
  const [checked, _setChecked] = useState<any>(
    checkState(items)
  );

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

  useEffect(
    () => {
      setRef();
    },
    [checked, checkedSoftDep]
  );

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
          onSelectAllClicked={selectAll}
          displayItemTitle={true}
          checked={checked}
          setChecked= {setChecked}
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
                onSelectAllClicked={selectAllSoft}
                displayItemTitle={false}
                checked={checkedSoftDep}
                setChecked= {setChecked}
              />
            </>
          )
        }
      </div>
      <div className="dependency-selection--bottom-section">
        {
          (deps == null && !showDepsButton) ? (
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
              showDepsButton ? (
                <button
                  className="dependency-selection--nav-btn dependency-selection--show-all"
                  onClick={showAllDependencies}
                >
                  <FormattedMessage
                    id="publishDialog.showAllDependencies"
                    defaultMessage={`Show All Dependencies`}
                  />
                </button>
              ) : (null)
            )
        }
        <p>
          <FormattedMessage
            id="publishDialog.changesInSelection"
            defaultMessage={`Changes in the selection of items to publish will require "all dependencies" to be recalculated.`}
          />
        </p>
      </div>
    </>
  );

  function selectAllSoft() {
    setCheckedSoftDep(deps.items2, true);
  }

  function setRef() {
    const result = (
      Object.entries({ ...checked, ...checkedSoftDep })
        .filter(([key, value]) => value === true)
        .map(([key]) => key)
    );
    props.onChange(result);
  }

  function showAllDependencies() {
    setShowDepsButton(false);
    get(`/studio/api/2/dependency/dependencies?siteId=${siteId}&paths=${paths(checked)}`)
      .subscribe(
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

}

export function DependencySelectionDelete(props: DependencySelectionProps) {
  const [resultItems, setResultItems] = useState<resultObject>();
  const { items, siteId } = props;
  const [checked, _setChecked] = useState<any>(
    checkState(items)
  );

  const setChecked = (uri: string[], isChecked: boolean) => {
    _setChecked(updateCheckedList(uri, isChecked, checked));
    setResultItems(null);
  }

  useEffect(
    () => {
      showAllDependencies();
      setRef();
    },
    [checked],
  );

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
          onSelectAllClicked={selectAll}
          displayItemTitle= {true}
          checked= {checked}
          setChecked= {setChecked}
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
                subtitle= {
                  <FormattedMessage
                    id="deleteDialog.willGetDeleted"
                    defaultMessage={` Will get deleted`}
                  />
                }
                uris= {resultItems.items1}
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
                displayItemTitle= {false}
              />
          </>
        )
      }
    </div>
    <div className="dependency-selection--bottom-section">
      {
        (resultItems == null) ? (
          <div className="centerCircularProgress">
            <CenterCircularProgress /> 
            <span className="dependency-selection--center-circular-progress-text" >
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

export default DependencySelection;
