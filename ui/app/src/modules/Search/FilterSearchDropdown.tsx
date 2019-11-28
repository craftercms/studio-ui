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
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import Button from "@material-ui/core/Button";
import React, { useState } from "react";
import Popover from '@material-ui/core/Popover';
import { defineMessages, useIntl } from "react-intl";
import { Theme } from "@material-ui/core";
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/KeyboardArrowDown';
import Collapse from '@material-ui/core/Collapse';
import clsx from 'clsx';
import { camelize } from '../../utils/string';
import makeStyles from "@material-ui/core/styles/makeStyles";
import FormGroup from "@material-ui/core/FormGroup";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    borderRadius: '0',
    marginRight: '50px',
    minWidth: '300px'
  },
  header: {
    width: '100%',
    padding: '10px 10px 10px 22px',
    borderTop: '1px solid #dedede',
    //borderBottom: '1px solid #dedede',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    '&.open': {
      borderBottom: '1px solid #dedede',
    }
  },
  body: {
    padding: '10px'
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  listPadding: {
    padding: '0'
  },
  Select: {
    width: '100%',
    '&.last': {
      marginTop: '10px'
    }
  },
  singleFilter: {
    '& .filterActions': {
      textAlign: 'right'
    }
  },
  button: {
    margin: theme.spacing(1),
  },
  checkboxLabel: {
    width: '100%',
    overflow: 'hidden',
    display: '-webkit-box',
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
  },
  checkboxRoot: {
    marginRight: '5px'
  }
}));

const messages: any = defineMessages({
  sortBy: {
    id: 'searchFilter.sortBy',
    defaultMessage: 'Sort By'
  },
  internalName: {
    id: 'searchFilter.internalName',
    defaultMessage: 'Name'
  },
  width: {
    id: 'searchFilter.width',
    defaultMessage: 'Width'
  },
  contentType: {
    id: 'searchFilter.contentType',
    defaultMessage: 'Content Type'
  },
  mimeType: {
    id: 'searchFilter.mimeType',
    defaultMessage: 'MIME Type'
  },
  size: {
    id: 'searchFilter.size',
    defaultMessage: 'Content Size'
  },
  lastEditDate: {
    id: 'searchFilter.lastEditDate',
    defaultMessage: 'Last Edit Date'
  },
  height: {
    id: 'searchFilter.height',
    defaultMessage: 'Height'
  },
  asc: {
    id: 'searchFilter.asc',
    defaultMessage: 'Ascending'
  },
  desc: {
    id: 'searchFilter.desc',
    defaultMessage: 'Descending'
  },
});

interface FilterSearchDropdownProps {

}

export default function FilterSearchDropdown(props: any) {
  const classes = useStyles({});
  const [anchorEl, setAnchorEl] = React.useState(null);
  const {text, className, facets, handleFilterChange, queryParams} = props;
  const {formatMessage} = useIntl();
  const [expanded, setExpanded] = useState({
    sortBy: true
  });

  const setCheckedParameterFromURL = (queryParams) => {
    if(queryParams['filters']){
      let checked = {};
      Object.keys(queryParams['filters']).forEach((key) => {
        checked[key] = {};
        queryParams['filters'][key].forEach((name) => {
          checked[key][name] = true;
        });
      });
      return checked;
    } else {
      return {};
    }
  };

  const [checkedFilters, setCheckedFilters] = React.useState(setCheckedParameterFromURL(queryParams));

  let filterKeys = [];
  let facetsLookupTable = {};

  facets.forEach((facet) => {
    filterKeys.push(facet.name);
    facetsLookupTable[facet.name] = facet;
  });

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExpandClick = (item: string) => {
    setExpanded({...expanded, [item]: !expanded[item]})
  };

  const renderSortBy = () => {
    return (
      <Select
        id="sortBy"
        value={queryParams['sortBy'] || "internalName"}
        className={classes.Select}
        onChange={(event) => handleFilterChange({name: 'sortBy', value: event.target.value})}
      >
        <MenuItem value='internalName'>{formatMessage(messages[camelize('internalName')])}</MenuItem>
        {
          filterKeys.map((name: string, i: number) => {
            return <MenuItem value={name} key={i}>{formatMessage(messages[camelize(name)])}</MenuItem>
          })
        }
      </Select>
    )
  };

  const renderSortOrder = () => {
    return (
      <Select
        id="sortOrder"
        value={queryParams['sortOrder'] || "asc"}
        className={clsx(classes.Select, 'last')}
        onChange={(event) => handleFilterChange({name: 'sortOrder', value: event.target.value})}
      >
        <MenuItem value="asc">{formatMessage(messages.asc)}</MenuItem>
        <MenuItem value="desc">{formatMessage(messages.desc)}</MenuItem>
      </Select>

    )
  };

  const renderFilter = (key: string) => {
    if (key === 'content-type') {
      return (
        <div className={classes.singleFilter}>
          <div className={'filterActions'}>
            <Button variant="outlined" className={classes.button} onClick={() => handleClearClick(key)}>Clear</Button>
            <Button variant="contained" color='primary' className={classes.button} onClick={() => handleApplyClick(key)}>Apply</Button>
          </div>
          <div className={'filterBody'}>
            {renderCheckboxes(facetsLookupTable[key].values, key)}
          </div>
        </div>)
    } else {
      return <p>{key}</p>;
    }
  };

  const renderFilters = () => {
    return (
      filterKeys.map((key: string, i: number) => {
        let name = camelize(key);
        return (
          <div key={i}>
            <ListItem button classes={{root: classes.listPadding}} onClick={() => handleExpandClick(name)}>
              <header className={clsx(classes.header, !!(expanded && expanded[name]) && 'open')}>
                <Typography variant="body1">
                  <strong>{formatMessage(messages[name])}</strong>
                </Typography>
                <ExpandMoreIcon
                  className={clsx(classes.expand, !!(expanded && expanded[name]) && classes.expandOpen)}/>
              </header>
            </ListItem>
            <Collapse in={!!(expanded && expanded[name])} timeout={300}>
              <div className={classes.body}>
                {renderFilter(key)}
              </div>
            </Collapse>
          </div>
        )
      })
    )
  };

  const renderCheckboxes = (items: object, facetName: string) => {
    return (
      <FormGroup>
        {
          Object.keys(items).map((key) => {
            return (
              <FormControlLabel
                key={key}
                name={key}
                control={<Checkbox color="primary" checked={(checkedFilters && checkedFilters[facetName] && checkedFilters[facetName][key]) || false} value={key} onChange={(e) => handleCheckboxClick(key, e.target.checked , facetName)}/>}
                label={`${key} (${items[key]})`}
                labelPlacement="start"
                classes={{root: classes.checkboxRoot, label: classes.checkboxLabel}}
              />
            )
          })
        }
      </FormGroup>
    )
  };

  const handleCheckboxClick = (key: string, checked: boolean, facetName: string) => {
    const facetFilter = checkedFilters[facetName] || {};
    facetFilter[key] = checked;
    setCheckedFilters({...checkedFilters, [facetName]: facetFilter});
  };

  const handleApplyClick = (facet: string) => {
    let values = Object.keys(checkedFilters[facet]).filter((name) => checkedFilters[facet][name]);
    if(values.length === 0){
      values = undefined;
    }
    handleFilterChange({name: facet, value: values}, true)
  };

  const handleClearClick = (facet: string) => {
    if(checkedFilters[facet]){
      let emptyFilter = {...checkedFilters[facet]};
      Object.keys(emptyFilter).forEach((name) => {
        emptyFilter[name] = false;
      });
      setCheckedFilters({...checkedFilters, [facet]: emptyFilter});
    }
    handleFilterChange({name: facet, value: undefined}, true)
  };

  return (
    <div>
      <Button variant="outlined" onClick={handleClick} className={className}>
        {text} <ArrowDropDownIcon/>
      </Button>
      <Popover
        id="simple-menu"
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        classes={{paper: classes.paper}}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <List classes={{padding: classes.listPadding}}>
          <div>
            <ListItem button classes={{root: classes.listPadding}} onClick={() => handleExpandClick('sortBy')}>
              <header className={classes.header}>
                <Typography variant="body1">
                  <strong>{formatMessage(messages.sortBy)}</strong>
                </Typography>
                <ExpandMoreIcon
                  className={clsx(classes.expand, !!(expanded && expanded['sortBy']) && classes.expandOpen)}/>
              </header>
            </ListItem>
            <Collapse in={!!(expanded && expanded['sortBy'])} timeout={300}>
              <div className={classes.body}>
                {renderSortBy()}
                {renderSortOrder()}
              </div>
            </Collapse>
          </div>
          {renderFilters()}
        </List>
      </Popover>
    </div>
  )
}
