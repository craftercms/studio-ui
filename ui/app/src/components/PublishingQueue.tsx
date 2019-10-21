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
import { cancelPackage, fetchEnvironments, fetchPackages } from '../services/publishing';
import { CurrentFilters, Package } from "../models/publishing";
import ConfirmDropdown from "./ConfirmDropdown";
import FilterDropdown from "./FilterDropdown";
import { setRequestForgeryToken } from "../utils/auth";
import TablePagination from '@material-ui/core/TablePagination';
import ErrorState from "./ErrorState";
import EmptyState from "./EmptyState";
import Typography from "@material-ui/core/Typography";

const messages = defineMessages({
  selectAll: {
    id: 'publishingQueue.selectAll',
    defaultMessage: 'Select all on this page'
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
  },
  noPackagesTitle: {
    id: 'publishingQueue.noPackagesTitle',
    defaultMessage: 'No Packages Where Found'
  },
  noPackagesSubtitle: {
    id: 'publishingQueue.noPackagesSubtitle',
    defaultMessage: 'Try changing your query'
  },
  filteredBy: {
    id: 'publishingQueue.filteredBy',
    defaultMessage: 'Showing: {state, select, all {} other {Status : {state}.}} {environment, select, all {} other {{environment} environment.}} {path, select, none {}  other {Filtered by {path}}}'
  },
  packagesSelected: {
    id: 'publishingQueue.packagesSelected',
    defaultMessage: '{count, plural, one {{count} Package selected} other {{count} Packages selected}}',
  },
});

const useStyles = makeStyles((theme: Theme) => ({
  publishingQueue: {
  },
  topBar: {
    display: 'flex',
    padding: '0 0 0 0',
    alignItems: 'center',
    borderBottom: '1px solid #dedede',
  },
  secondBar: {
    background: '#f9f9f9',
    padding: '10px',
    borderBottom: '1px solid #dedede'
  },
  queueList: {
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
  packagesSelected:{
    marginRight: '10px'
  },
  selectAll: {
    marginRight: 'auto'
  },
  button: {
    margin: theme.spacing(1),
  },
  empty: {
    padding: '40px 0'
  }
}));

const currentFiltersInitialState:CurrentFilters = {
  environment: '',
  path: '',
  states: [],
  limit: 5,
  page: 0
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
  const [apiState, setApiState] = useState({
    error: false,
    errorResponse: null,
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
        apiState={apiState}
        setApiState={setApiState}
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
          setApiState({...apiState, error: true, errorResponse: response});
        }
      );
  }

  function getFilters(currentFilters: CurrentFilters) {
    let filters:any = {};
    if(currentFilters.environment) filters['environment'] = currentFilters.environment;
    if(currentFilters.path) filters['path'] = currentFilters.path;
    if(currentFilters.states.length) filters['state'] = currentFilters.states.join();
    if(currentFilters.limit) filters['limit'] = currentFilters.limit;
    if(currentFilters.page) filters['offset'] = currentFilters.page * currentFilters.limit;
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
          setApiState({...apiState, error: true, errorResponse: response});
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
          setApiState({...apiState, error: true, errorResponse: response});
        }
      );
  }

  function handleSelectAll(event: any) {
    if(!packages || packages.length === 0) return false;
    const list = packages.map((item: Package) => item.id);
    if (event.target.checked) {
      setSelected([...selected, ...list]);
    } else {
      const filteredList = list.filter(function(name: string) {
        return selected.indexOf(name) < 0;
      });
      setSelected(filteredList);
    }
  }

  function areAllSelected() {
    if(!packages || packages.length === 0) return false;
    let _selected: boolean = true;
    packages.forEach((item: Package) => {
      if(!selected.includes(item.id)) {
        _selected = false;
      }
    });
    return _selected;
  }

  function handleFilterChange(event: any) {
    event.persist();
    if (event.target.type === 'checkbox') {
      let states:any = [...currentFilters.states];
      if(event.target.checked){
        states.push(event.target.value);
      } else {
        states = states.filter((item: string) => item !== event.target.value);
      }
      setCurrentFilters({...currentFilters, states: states, page: 0});
    } else if (event.target.type === 'radio'){
      setCurrentFilters({...currentFilters, environment: event.target.value, page: 0});
    }
  }

  function handleEnterKey(path: string) {
    setCurrentFilters({...currentFilters, path: path, page: 0});
  }

  function handleChangePage(event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage: number) {
    setCurrentFilters({...currentFilters, page: newPage});
  }

  function handleChangeRowsPerPage(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setCurrentFilters({...currentFilters, page: 0, limit: parseInt(event.target.value, 10)});
  }

  return (
    <div className={classes.publishingQueue}>
      <div className={classes.topBar}>
        <FormGroup className={classes.selectAll}>
          <FormControlLabel
            control={<Checkbox color="primary"
                               checked={areAllSelected()}
                               disabled={!packages || !packages.length} onClick={handleSelectAll}/>}
            label={formatMessage(messages.selectAll)}
          />
        </FormGroup>
        {
          (selected.length > 0) &&
          <Typography variant="body2" className={classes.packagesSelected} color={"textSecondary"}>
            {formatMessage(messages.packagesSelected, { count: selected.length })}
          </Typography>
        }
        <ConfirmDropdown
          text={formatMessage(messages.cancelSelected)}
          cancelText={formatMessage(messages.cancel)}
          confirmText={formatMessage(messages.confirm)}
          confirmHelperText={formatMessage(messages.confirmAllHelper)}
          onConfirm={handleCancelAll}
        />
        <FilterDropdown className={classes.button} text={formatMessage(messages.filters)} handleFilterChange={handleFilterChange}
                        currentFilters={currentFilters} handleEnterKey={handleEnterKey} filters={filters}/>
      </div>
      {
        (currentFilters.states.length || currentFilters.path || currentFilters.environment) &&
        <div className={classes.secondBar}>
          <Typography variant="body2">
            {
              formatMessage(
                messages.filteredBy,
                {
                  state: currentFilters.states.length? <strong key="state">{currentFilters.states.join()}</strong> : 'all',
                  path: currentFilters.path? <strong key="path">{currentFilters.path}</strong> : 'none',
                  environment: currentFilters.environment? <strong key="environment">{currentFilters.environment}</strong> : 'all',
                }
              )
            }
          </Typography>
        </div>
      }
      {
        (apiState.error && apiState.errorResponse)?
          <ErrorState error={apiState.errorResponse}/>
        :
          <div className={classes.queueList}>
            {packages && renderPackages()}
            {
              packages !== null && packages.length === 0 &&
              <div className={classes.empty}>
                  <EmptyState title={formatMessage(messages.noPackagesTitle)} subtitle={formatMessage(messages.noPackagesSubtitle)}/>
              </div>
            }
          </div>
      }
      <TablePagination
        rowsPerPageOptions={[3, 5, 10]}
        component="div"
        count={total}
        rowsPerPage={currentFilters.limit}
        page={currentFilters.page}
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
