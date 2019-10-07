import React, { useState, useEffect } from 'react';
import { Item } from '../models/Item';
import '../styles/dependency-selection.scss';
import { withStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import { get } from '../utils/ajax';
import { FormattedMessage } from 'react-intl';

interface DependencySelectionProps {
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

function SelectionList(props: DependencySelectionProps) {

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
          <button className="dependency-selection--nav-btn dependency-selection--select-all" onClick={() => onSelectAllClicked(setChecked, items)}>
            <FormattedMessage
              id="common.selectAll"
              defaultMessage={`Select All`}
            />
          </button>
        ) : (null)
      }
      {
        items ? (
          items.map((item) => (
            <div className="dependency-selection--section-dependencies" key={item.uri}>
              {
                onItemClicked ? (
                  <div className="dependency-selection--checkbox">
                    <BlueCheckbox
                      checked={!!checked[item.uri]}
                      onClick={(e) =>
                        onItemClicked(e, item, setChecked, checked)
                      }
                      onChange={(e) => void 0}
                      value={item.uri}
                      color="primary"
                    />
                  </div>
                ) : (null)
              }
              <div
                className="dependency-selection--information"
                onClick={(e) => onItemClicked(e, item, setChecked, checked)}>
                {
                  displayItemTitle ? (
                    <div className="dependency-selection--information--internal-name">
                      {item.internalName}
                    </div>
                  ) : (null)
                }
                <div className="dependency-selection--information--uri">&nbsp;{item.uri}</div>
              </div>
            </div>
          ))
        ) : (null)
      }
      {
        uris ? (
          <ul className="dependency-selection--list">
            {
              uris.map((uri: string) => (
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
                      onClick={(e) => onItemClicked([uri], !checked[uri], setChecked, checked)}>
                      {uri}
                    </div>
                  </li>
                ) : (
                  <li className="dependency-selection--list--hard" key={uri}>{uri}</li>
                )
              ))
            }
          </ul>
        ) : (null)
      }
    </div>
  );

}

export default SelectionList;