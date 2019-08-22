import React, { useEffect, useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import MuiExpansionPanel from '@material-ui/core/ExpansionPanel';
import MuiExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import MuiExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { get } from '../utils/ajax';
import { Item } from '../models/item';

// components/DependecyItem.tsx
interface DependecyItemProps {
  item: Item;
  siteId: string;
  isOpen: boolean;
  onToggle: (isVisible: boolean) => void;
  checked: { [prop: string]: boolean };
  onSelection: Function;
}

interface DepsObject {
  hard: [],
  soft: []
}

const ExpansionPanel = withStyles({
  root: {
    borderBottom: '1px solid rgba(0, 0, 0, .125)',
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
  },
  expanded: {},
})(MuiExpansionPanel);

const ExpansionPanelSummary = withStyles({
  root: {
    marginBottom: -1,
    padding: '0 12px 0 6px',
    minHeight: 56,
    '&$expanded': {
      minHeight: 56,
    },
  },
  content: {
    margin: 0,
    '&$expanded': {
      margin: 0,
    },
  },
  expanded: {},
})(MuiExpansionPanelSummary);

const ExpansionPanelDetails = withStyles(theme => ({
  root: {
    padding: '0 0 22px 43px',
  },
}))(MuiExpansionPanelDetails);

const CenterCircularProgress = withStyles({
  root: {
    justifyContent: 'center',
    color: '#7e9dbb',
  }
})(CircularProgress);

const BlueCheckbox = withStyles({
  root: {
    color: '#7e9dbb',
    padding: '4px 6px',
    '&$checked': {
      color: '#7e9dbb',
    },
  },
  checked: {},
})(Checkbox);

const BlueExpandMoreIcon = withStyles({
  root: {
    color: '#7e9dbb'
  }
})(ExpandMoreIcon);

function DependecyItem(props: DependecyItemProps) {

  const [deps, setDeps] = useState<DepsObject>();

  useEffect(
    () => {
      if(props.isOpen && deps === undefined){
        get(`/studio/api/2/dependency/dependencies?siteId=${props.siteId}&paths=${props.item.uri}`)
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
    },
    [props.isOpen]
  );

  return (
    <div>
      <ExpansionPanel square expanded={props.isOpen} onChange={(e, nextVisible) => props.onToggle(nextVisible)}>
        <ExpansionPanelSummary expandIcon={<BlueExpandMoreIcon />} aria-controls="panel1d-content" id="">
          <Typography>
            <BlueCheckbox
              checked={!!props.checked[props.item.uri]}
              onClick={(e:any) => {
                e.stopPropagation();
                e.preventDefault();
                props.onSelection(props.item.uri, !props.checked[props.item.uri])
              }}
              onChange={(e) => {}}
              value={props.item.uri}
              color="primary"
            />
            
            <strong>
              <span>{props.item.internalName} •</span>
              <span>&nbsp;{props.item.uri}</span>
            </strong>
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
            {
              deps == null ? (
                <div className="centerCircularProgress">
                  <CenterCircularProgress />
                </div>
              ) : (
                <div>
                  <p className="hardDependenciesTitle" ><strong>Hard Dependencies</strong></p>
                  <ul>
                    {
                      deps && deps.hard
                      ? ( 
                        deps.hard.map((uri: string) => (
                          <li key={uri}>{uri}</li>
                        ))
                      ) 
                      : (
                        <div></div>
                      )
                    }
                  </ul>
                    <p>
                      <strong>Soft Dependencies</strong> • <span>Submission Optional</span> 
                      <button className="navButtons" onClick={selectAllSoft}>Select All</button>
                    </p>
                  <ul>
                    {
                      deps && deps.soft
                      ? ( 
                        deps.soft.map((uri: string) => (
                          <li key={uri}>
                            <BlueCheckbox
                              checked={!!props.checked[uri]}
                              onChange={(e) => props.onSelection(uri, e.target.checked)}
                              value={uri}
                              color="primary"
                            />
                            {uri}
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
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </div>

  );

  function selectAllSoft() {
    props.onSelection(deps.soft, true);
  }


}

export default DependecyItem;