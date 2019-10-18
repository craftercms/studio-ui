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

import React, { useEffect, useState } from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { defineMessages, useIntl } from 'react-intl';
import PublishingPackage from "./PublishingPackage";
import { cancelPackage, fetchPackages, fetchEnvironments } from '../services/publishing';
import { CurrentFilters, Package } from "../models/publishing";
import ConfirmDropdown from "./ConfirmDropdown";
import FilterDropdown from "./FilterDropdown";
import { setRequestForgeryToken } from "../utils/auth";
import TablePagination from '@material-ui/core/TablePagination';

const messages = defineMessages({
  selectAll: {
    id: 'publishingQueue.selectAll',
    defaultMessage: 'Select All'
  },
  cancelSelected: {
    id: 'publishingQueue.cancelSelected',
    defaultMessage: 'Cancel Selected'
  },
  cancel: {
    id: 'publishingQueue.cancel',
    defaultMessage: 'Cancel'
  },
  confirm: {
    id: 'publishingQueue.confirm',
    defaultMessage: 'Confirm'
  },
  confirmAllHelper: {
    id: 'publishingQueue.confirmHelper',
    defaultMessage: 'Set the state for all selected items to "Cancelled"'
  },
  filters: {
    id: 'publishingQueue.filters',
    defaultMessage: 'Filters'
  }
});

const useStyles = makeStyles((theme: Theme) => ({
  publishingQueue: {
    marginTop: '40px',
    margin: 'auto',
    width: '800px',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column'
  },
  topBar: {
    display: 'flex',
    padding: '0 0 0 0',
    alignItems: 'center',
    borderTop: '1px solid #dedede',
    borderBottom: '1px solid #dedede',

  },
  queueList: {
    //overflow: 'auto'
  },
  package: {
    padding: '20px',
    '& .name': {
      display: 'flex',
      justifyContent: 'space-between'
    },
    '& .status': {
      display: 'flex',
      justifyContent: 'space-between',
    },
    '& .comment': {
      display: 'flex',
      justifyContent: 'space-between',
      '& div:first-child': {
        marginRight: '20px'
      }
    },
    '& .files': {},
  },
  selectAll: {
    marginRight: 'auto'
  },
  button: {
    margin: theme.spacing(1),
  },
}));

const currentFiltersInitialState:CurrentFilters = {
  environment: '',
  path: '',
  states: [],
  limit: 5,
  offset: 0
};

function PublishingQueue() {
  const classes = useStyles({});
  const [packages, setPackages] = useState(null);
  const [selected, setSelected] = useState([]);
  const [pending, setPending] = useState({});
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    environments: null,
    states: ['READY_FOR_LIVE', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'BLOCKED']
  });
  const [currentFilters, setCurrentFilters] = useState(currentFiltersInitialState);
  const {formatMessage} = useIntl();

  setRequestForgeryToken();

  useEffect(
    () => {
      if(currentFilters && packages !== null){
        getPackages('editorial');
      }
      if (packages === null) {
        getPackages('editorial');
      }
      if (filters.environments === null){
        getEnvironments('editorial');
      }
    },
    // eslint-disable-next-line
    [currentFilters]
  );

  function renderPackages() {
    return packages.map((item: Package, index: number) => {
      return <PublishingPackage
        id={item.id}
        approver={item.approver}
        schedule={item.schedule}
        state={item.state}
        comment={item.comment}
        environment={item.environment}
        key={index}
        siteId={'editorial'}
        selected={selected}
        pending={pending}
        setPending={setPending}
        getPackages={getPackages}
        setSelected={setSelected}/>
    })
  }

  function getEnvironments(siteId: string) {
    fetchEnvironments(siteId)
      .subscribe(
        ({response}) => {
          let channels: string[] = [];
          response.availablePublishChannels.forEach((channel:any) => {
            channels.push(channel.name);
          });
          setFilters({...filters, environments: channels });
        },
        ({response}) => {
          console.log(response);
        }
      );
  }

  function getFilters(currentFilters: CurrentFilters) {
    let filters:any = {};
    if(currentFilters.environment) filters['environment'] = currentFilters.environment;
    if(currentFilters.path) filters['path'] = currentFilters.path;
    //if(currentFilters.states) filters['states'] = currentFilters.states;
    if(currentFilters.limit) filters['limit'] = currentFilters.limit;
    if(currentFilters.offset) filters['offset'] = currentFilters.offset;
    return filters;
  }

  function getPackages(siteId: string) {
    fetchPackages(siteId, getFilters(currentFilters))
      .subscribe(
        ({response}) => {
          setTotal(response.total);
          setPackages(response.packages);
        },
        ({response}) => {
          console.log(response);
        }
      );
  }

  function handleCancelAll() {
    let _pending:{[id:string]:boolean} = {};
    selected.forEach((id: string) => {
      _pending[id] = true;
    });
    setPending(_pending);
    cancelPackage('editorial', selected)
      .subscribe(
        () => {
          selected.forEach((id: string) => {
            _pending[id] = false;
          });
          setPending({...pending, ..._pending});
        },
        ({response}) => {
          console.log(response);
        }
      );
  }

  function handleSelectAll(event: any) {
    if(!packages) return false;
    if (event.target.checked) {
      let list = packages.map((item: Package) => item.id);
      setSelected(list);
    } else {
      setSelected([]);
    }
  }

  function handleFilterChange(event: any) {
    event.persist();
    if (event.target.type === 'checkbox') {
      let states:any = [...currentFilters.states];
      let index = states.indexOf(event.target.value);
      if(index !== -1) {
        states = states.splice(index, 1);
      } else {
        states.push(event.target.value);
      }
      setCurrentFilters({...currentFilters, states: states, offset: 0});
    } else if (event.target.type === 'radio'){
      setCurrentFilters({...currentFilters, environment: event.target.value, offset: 0});
    } else {
      setCurrentFilters({...currentFilters, path: event.target.value, offset: 0});
    }
  }

  function handleChangePage(event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage: number) {
    setCurrentFilters({...currentFilters, offset: newPage});
  }

  function handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setCurrentFilters({...currentFilters, offset: 0, limit: parseInt(event.target.value, 10)});
  }

  return (
    <div className={classes.publishingQueue}>
      <div className={classes.topBar}>
        <FormGroup className={classes.selectAll}>
          <FormControlLabel
            control={<Checkbox color="primary" onClick={handleSelectAll}/>}
            label={formatMessage(messages.selectAll)}
          />
        </FormGroup>
        <ConfirmDropdown
          text={formatMessage(messages.cancelSelected)}
          cancelText={formatMessage(messages.cancel)}
          confirmText={formatMessage(messages.confirm)}
          confirmHelperText={formatMessage(messages.confirmAllHelper)}
          onConfirm={handleCancelAll}
        />
        <FilterDropdown className={classes.button} text={formatMessage(messages.filters)} handleFilterChange={handleFilterChange}
                        currentFilters={currentFilters} filters={filters}/>
      </div>
      <div className={classes.queueList}>
        {packages && renderPackages()}
      </div>
      <TablePagination
        rowsPerPageOptions={[3, 5, 10]}
        component="div"
        count={total}
        rowsPerPage={currentFilters.limit}
        page={currentFilters.offset}
        backIconButtonProps={{
          'aria-label': 'previous page',
        }}
        nextIconButtonProps={{
          'aria-label': 'next page',
        }}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </div>
  )
}

export default PublishingQueue;
