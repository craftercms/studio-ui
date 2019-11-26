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
import { Theme, List, ListItem, MenuItem, Select } from "@material-ui/core";
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/KeyboardArrowDown';
import Collapse from '@material-ui/core/Collapse';
import makeStyles from "@material-ui/styles/makeStyles/makeStyles";
import clsx from 'clsx';
import { camelize } from '../../utils/string';

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    width: '300px',
    borderRadius: '0 !important'
  },
  header: {
    width: '100%',
    padding: '10px 10px 10px 22px',
    borderTop: '1px solid #dedede',
    borderBottom: '1px solid #dedede',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
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
    padding: '0 !important'
  },
  Select: {
    width: '100%',
    '&.last': {
      marginTop: '10px'
    }
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
  const [anchorEl, setAnchorEl] = React.useState(null);
  const classes = useStyles({});
  const {text, className, facets} = props;
  const {formatMessage} = useIntl();
  const [expanded, setExpanded] = useState({
    sortBy: true
  });

  let filterKeys = ['internalName'];

  facets.forEach((facet) => {
    filterKeys.push(facet.name);
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
        value={"internalName"}
        className={classes.Select}
      >
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
        value={"asc"}
        className={clsx(classes.Select, 'last')}
      >
        <MenuItem value="asc">{formatMessage(messages.asc)}</MenuItem>
        <MenuItem value="desc">{formatMessage(messages.desc)}</MenuItem>
      </Select>

    )
  };

  const renderFilters = () => {
    return (
      filterKeys.map((key:string, i:number) => {
        let name = camelize(key);
        return (
          <div key={i}>
            <ListItem button classes={{root: classes.listPadding}} onClick={() => handleExpandClick(name)}>
              <header className={classes.header}>
                <Typography variant="body1">
                  <strong>{formatMessage(messages[name])}</strong>
                </Typography>
                <ExpandMoreIcon
                  className={clsx(classes.expand, !!(expanded && expanded[name]) && classes.expandOpen)}/>
              </header>
            </ListItem>
            <Collapse in={!!(expanded && expanded[name])} timeout={300}>
              <div className={classes.body}>
                {name}
              </div>
            </Collapse>
          </div>
        )
      })
    )
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
