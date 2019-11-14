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
import makeStyles from "@material-ui/styles/makeStyles/makeStyles";
import { defineMessages, useIntl } from "react-intl";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import { CurrentFilters } from "../../../../models/publishing";
import SearchIcon from '@material-ui/icons/Search';
import { Theme } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    width: '300px'
  },
  header: {
    background: '#f9f9f9',
    padding: '10px',
    borderTop: '1px solid #dedede',
    borderBottom: '1px solid #dedede'
  },
  body: {
    padding: '10px',
    position: 'relative'
  },
  formControl: {
    width: '100%',
    padding: '5px 15px 20px 15px',
  },
  search: {
    width: '100%',
    margin: 'auto',
    position: 'relative'
  },
  searchIcon: {
    width: theme.spacing(7),
    color: '#828282',
    height: '41px;',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1
  },
  searchTextField: {
    '& input': {
      paddingLeft: '50px'
    }
  }
}));

const messages: any = defineMessages({
  pathExpression: {
    id: 'publishingDashboard.pathExpression',
    defaultMessage: 'Path Expression'
  },
  environment: {
    id: 'publishingDashboard.environment',
    defaultMessage: 'Environment'
  },
  state: {
    id: 'publishingDashboard.state',
    defaultMessage: 'State'
  },
  all: {
    id: 'publishingDashboard.all',
    defaultMessage: 'All'
  },
  READY_FOR_LIVE: {
    id: 'publishingDashboard.READY_FOR_LIVE',
    defaultMessage: 'Ready for Live'
  },
  PROCESSING: {
    id: 'publishingDashboard.PROCESSING',
    defaultMessage: 'Processing'
  },
  COMPLETED: {
    id: 'publishingDashboard.COMPLETED',
    defaultMessage: 'Completed'
  },
  CANCELLED: {
    id: 'publishingDashboard.CANCELLED',
    defaultMessage: 'Cancelled'
  },
  BLOCKED: {
    id: 'publishingDashboard.BLOCKED',
    defaultMessage: 'Blocked'
  }
});

interface FilterDropdownProps {
  text: string;
  className: any;

  handleFilterChange(event: any): any;

  handleEnterKey(path: string): any;

  currentFilters: CurrentFilters;
  filters: any;
}

export default function FilterDropdown(props: FilterDropdownProps) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const classes = useStyles({});
  const {text, className, handleFilterChange, handleEnterKey, currentFilters, filters} = props;
  const [path, setPath] = useState('');
  const {formatMessage} = useIntl();

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onKeyPress = (event: React.KeyboardEvent, path: string) => {
    if (event.charCode === 13) {
      handleEnterKey(path);
    }
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
        <section>
          <header className={classes.header}>
            <Typography variant="body1">
              <strong>{formatMessage(messages.pathExpression)}</strong>
            </Typography>
          </header>
          <div className={classes.body}>
            <div className={classes.searchIcon}>
              <SearchIcon/>
            </div>
            <TextField
              id="path"
              name="path"
              className={classes.searchTextField}
              InputLabelProps={{shrink: true}}
              fullWidth
              placeholder={"e.g. /SOME/PATH/*"}
              onChange={(event) => setPath(event.target.value)}
              onKeyPress={(event) => onKeyPress(event, path)}
              value={path}
            />
          </div>
        </section>
        <section>
          <header className={classes.header}>
            <Typography variant="body1">
              <strong>{formatMessage(messages.environment)}</strong>
            </Typography>
          </header>
          <div className={classes.formControl}>
            <RadioGroup aria-label="environment" name="environment"
                        value={currentFilters.environment} onChange={handleFilterChange}>
              <FormControlLabel value={""} control={<Radio color="primary"/>}
                                label={formatMessage(messages.all)}/>
              {
                filters.environments &&
                filters.environments.map((filter: string, index: number) => {
                  return <FormControlLabel key={index} value={filter} control={<Radio color="primary"/>}
                                           label={filter}/>
                })
              }
            </RadioGroup>
          </div>
        </section>
        <section>
          <header className={classes.header}>
            <Typography variant="body1">
              <strong>{formatMessage(messages.state)}</strong>
            </Typography>
          </header>
          <div className={classes.formControl}>
            <RadioGroup aria-label="state" name="state"
                        value={currentFilters.state} onChange={handleFilterChange}>
              <FormControlLabel value={""} control={<Radio color="primary"/>}
                                label={formatMessage(messages.all)}/>
              {
                filters.states.map((filter: string, index: number) => {
                  return <FormControlLabel
                    key={index}
                    value={filter}
                    control={<Radio color="primary"/>}
                    label={formatMessage(messages[filter])}/>
                })
              }
            </RadioGroup>
          </div>
        </section>
      </Popover>
    </div>
  )
}
