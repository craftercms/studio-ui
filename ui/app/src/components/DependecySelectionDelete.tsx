import React, { useState, useEffect } from 'react';
import { Item } from '../models/Item';
import '../styles/dependency-selection.scss';
import { withStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import { get } from '../utils/ajax';

interface DependecySelectionDeleteProps {
  items: Item[];
  onChange: Function;
  siteId: string;
}

interface itemsObject {
  child: [],
  dependent: []
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

declare const CStudioAuthoring: any;
declare const CStudioAuthoringContext: any;

function DependecySelectionDelete(props: DependecySelectionDeleteProps) {
  const [resultItems, setResultItems] = useState<itemsObject>();
  const { items, siteId, onChange } = props;
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
    _setChecked(nextChecked);
    setResultItems(null);
  }

  const paths =
    Object.entries({ ...checked })
      .filter(([key, value]) => value === true)
      .map(([key]) => key);

  const Messages = CStudioAuthoring.Messages;
  const bundle = Messages.getBundle('forms', CStudioAuthoringContext.lang);
  const selectAllMessage = Messages.format(bundle, 'selectAll');
  const childItemsText = Messages.format(bundle, 'childItemsText');
  const willGetDeleted = Messages.format(bundle, 'willGetDeleted');
  const dependendtItems = Messages.format(bundle, 'dependendtItems');
  const brokenItems = Messages.format(bundle, 'brokenItems');
  const deleteItems = Messages.format(bundle, 'deleteItems');
  const uploadingDepenedents = Messages.format(bundle, 'uploadingDepenedents');

  useEffect(
    () => {
      showAllDependencies();
      setRef();
    },
    [checked],
  );

  return (
    <div>
      <div className="dependency-selection">
        <h2 className="dependency-selection--title dependency-selection--publish-title">
          {deleteItems}
        </h2>
        <button className="dependency-selection--nav-btn dependency-selection--select-all" onClick={selectAll}>
          {selectAllMessage}
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
          resultItems == null ? (null) : (
            <div>
              <h2 className="dependency-selection--subtitle" >
                {childItemsText}
              </h2>
              <span> • {willGetDeleted}</span>
              <ul className="dependency-selection--list">
                {
                  resultItems && resultItems.child
                    ? (
                      resultItems.child.map((uri: string) => (
                        <li className="dependency-selection--list--hard" key={uri}>{uri}</li>
                      ))
                    )
                    : (null)
                }
              </ul>
              <h2 className="dependency-selection--subtitle">
                {dependendtItems}
              </h2>
              <span> • {brokenItems}</span>
              <ul className="dependency-selection--list" >
                {
                  resultItems && resultItems.dependent
                    ? (
                      resultItems.dependent.map((uri: string) => (
                        <li key={uri}>
                          <div className="dependency-selection--list--soft-item" >{uri}</div>
                        </li>
                      ))
                    )
                    : (null)
                }
              </ul>
            </div>
          )
        }
      </div>
      <div className="dependency-selection--bottom-section">
        {
          (resultItems == null) ? (
            <div className="centerCircularProgress">
              <CenterCircularProgress /> <span className="dependency-selection--center-circular-progress-text" >{uploadingDepenedents}</span>
            </div>
          ) : (null)
        }
      </div>
    </div>
  );

  function selectAll() {
    setChecked(items.map(i => i.uri), true);
  }

  function setRef() {
    const result = Object.entries({ ...checked })
      .filter(([key, value]) => value === true)
      .map(([key]) => key);
    props.onChange(result);
  }

  function showAllDependencies() {
    get(`/studio/api/2/content/get_delete_package?siteId=${siteId}&paths=${paths}`)
      .subscribe(
        (response: any) => {
          setResultItems({
            child: response.response.items.childItems,
            dependent: response.response.items.dependentItems
          });
        },
        () => {
          setResultItems({
            child: [],
            dependent: []
          });
        }
      );
  }

}

export default DependecySelectionDelete;