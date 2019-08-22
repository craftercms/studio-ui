import React, { useState } from 'react';
import { Item } from '../models/item';
import '../styles/dependency-selection.scss';
import { withStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import { get } from '../utils/ajax';

// components/DependecySelection.tsx
interface DependecySelectionProps {
  items: Item[];
  siteId: string;
  result: { current?: any };
}

interface DepsObject {
  hard: [],
  soft: []
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

const BlueCheckbox = withStyles({
  root: {
    color: '#7e9dbb',
    padding: '2px',
    '&$checked': {
      color: '#7e9dbb',
    },
  },
  checked: {},
})(Checkbox);

function DependecySelection(props: DependecySelectionProps) {
  const [deps, setDeps] = useState<DepsObject>();
  const [showDepBtn, setshowDepBtn] = useState(true);
  const { items, siteId, result } = props;
  const [checked, _setChecked] = useState<any>(
    (items || []).reduce(
      (table: any, item) => {
        table[item.uri] = true;
        return table;
      },
      {}
    )
  );
  const setChecked = (uri: string[], isChecked: boolean) => {
    const nextChecked = { ...checked };
    (Array.isArray(uri) ? uri : [uri]).forEach((u) => {
      nextChecked[u] = isChecked;
    });
    setRef();
    _setChecked(nextChecked)
    setshowDepBtn(true);
    setDeps(null);
    cleanCheckedSoftDep();
  }

  const [checkedSoftDep, _setCheckedSoftDep] = useState<any>({});
  const setCheckedSoftDep = (uri: string[], isChecked: boolean) => {
    const nextCheckedSoftDep = { ...checkedSoftDep };
    (Array.isArray(uri) ? uri : [uri]).forEach((u) => {
      nextCheckedSoftDep[u] = isChecked;
    });
    setRef();
    _setCheckedSoftDep(nextCheckedSoftDep)
  }
  const cleanCheckedSoftDep = () => {
    const nextCheckedSoftDep = {};
    setRef();
    _setCheckedSoftDep(nextCheckedSoftDep)
  }
  setRef();

  return (
    <div>
      <div className="dependency-selection">
        <h2 className="dependency-selection--title">
          Items to Publish
        </h2>
        <button className="dependency-selection--nav-btn dependency-selection--select-all" onClick={selectAll}>
          Select All
        </button>
        {
          items.map((item) => (
            <div className="dependency-selection--section-dependencies" key={item.uri}>
              <div className="dependency-selection--checkbox">
                <BlueCheckbox
                  checked={!!checked[item.uri]}
                  onClick={(e: any) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setChecked([item.uri], !checked[item.uri])
                  }}
                  onChange={(e) => { }}
                  value={item.uri}
                  color="primary"
                />
              </div>
              <div className="dependency-selection--information">
                <div className="dependency-selection--information--internal-name">{item.internalName}</div>
                <div className="dependency-selection--information--uri">&nbsp;{item.uri}</div>
              </div>
            </div>
          ))
        }
        {
          deps == null ? (
            <div></div>
          ) : (
              <div>
                <h2 className="dependency-selection--subtitle" >
                  Hard Dependencies
                </h2>
                <span> • Submission mandatory</span>
                <ul className="dependency-selection--list">
                  {
                    deps && deps.hard
                      ? (
                        deps.hard.map((uri: string) => (
                          <li className="dependency-selection--list--hard" key={uri}>{uri}</li>
                        ))
                      )
                      : (
                        <div></div>
                      )
                  }
                </ul>
                <h2 className="dependency-selection--subtitle">
                  Soft Dependencies
                </h2>
                <span> • Submission optional</span>
                <button className="dependency-selection--nav-btn" onClick={selectAllSoft}>
                  Select All
                </button>
                <ul className="dependency-selection--list" >
                  {
                    deps && deps.soft
                      ? (
                        deps.soft.map((uri: string) => (
                          <li key={uri}>
                            <div className="dependency-selection--list--soft-checkbox" >
                              <BlueCheckbox
                                checked={!!checkedSoftDep[uri]}
                                onChange={(e) => setCheckedSoftDep([uri], e.target.checked)}
                                value={uri}
                                color="primary"
                              />
                            </div>
                            <div className="dependency-selection--list--soft-item" >{uri}</div>
                          </li>
                        ))
                      )
                      : (
                        <div></div>
                      )
                  }
                </ul>
              </div>
            )
        }
      </div>
      <div className="dependency-selection--bottom-section">
        {
          (deps == null && !showDepBtn) ? (
            <div className="centerCircularProgress">
              <CenterCircularProgress /> <span className="dependency-selection--center-circular-progress-text" >Loading Dependencies, please wait...</span>
            </div>
          ) : (
              showDepBtn ? (
                <button className="dependency-selection--nav-btn dependency-selection--show-all" onClick={showAllDependencies}>
                  Show All Dependencies
                </button>
              ) : (
                  <div></div>
                )
            )
        }
        <p>
          Changes in the selection of items to publish will require "all dependencies" to be recalculated.
          Dependency calculation is computationally.
      </p>
      </div>
    </div>
  );

  function selectAll() {
    setChecked(items.map(i => i.uri), true);
  }

  function selectAllSoft() {
    setCheckedSoftDep(deps.soft, true);
  }

  function setRef() {
    result.current = Object.entries({ ...checked, ...checkedSoftDep })
      .filter(([key, value]) => value === true)
      .map(([key]) => key)
  }

  function showAllDependencies() {
    setshowDepBtn(false);
    get(`/studio/api/2/dependency/dependencies?siteId=${siteId}&paths=${Object.entries({ ...checked })
      .filter(([key, value]) => value === true)
      .map(([key]) => key)}`)
      .subscribe(
        (response: any) => {
          setDeps({
            hard: response.response.items.hardDependencies,
            soft: response.response.items.softDependencies
          });
        },
        () => {
          setDeps({
            hard: [],
            soft: []
          });
        }
      );
  }

}

export default DependecySelection;