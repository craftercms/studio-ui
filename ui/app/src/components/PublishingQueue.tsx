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
import Button from '@material-ui/core/Button';
import PublishingPackage from "./PublishingPackage";
import { fetchPackages } from '../services/publishing';
import { Package } from "../models/publishing";
import SelectButton from "./ConfirmDropdown";

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
    height: '600px',
    padding: '40px',
    border: '1px solid #dedede',
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
    overflow: 'auto'
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
    '& .files': {
    },
  },
  selectAll: {
    marginRight: 'auto'
  },
  button: {
    margin: theme.spacing(1),
  },
}));

function PublishingQueue() {
  const classes = useStyles({});
  const [packages, setPackages] = useState(null);
  const [selected, setSelected] = useState([]);
  const {formatMessage} = useIntl();

  useEffect(
    () => {
      if(packages === null) {
        getPackages('editorial');
      }

    },
    []
  );

  function renderPackages(){
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
        setSelected={setSelected}/>
    })
  }

  function getPackages(siteId:string) {
    fetchPackages(siteId)
      .subscribe(
        ({response}) => {
          setPackages(response.packages);
        },
        ({response}) => {
          console.log(response);
        }
      );
  }

  function handleCancelAll() {
    console.log('cancel all')
  }

  function handleSelectAll(event: any) {
    if(event.target.checked) {
      let list = packages.map((item: Package) => item.id);
      setSelected(list);
    }else {
      setSelected([]);
    }
  }

  return (
    <div className={classes.publishingQueue}>
      <div className={classes.topBar}>
        <FormGroup className={classes.selectAll}>
          <FormControlLabel
            control={<Checkbox color="primary" onClick={(event) => handleSelectAll(event)}/>}
            label={formatMessage(messages.selectAll)}
          />
        </FormGroup>
        <SelectButton
          text={formatMessage(messages.cancelSelected)}
          cancelText={formatMessage(messages.cancel)}
          confirmText={formatMessage(messages.confirm)}
          confirmHelperText={formatMessage(messages.confirmAllHelper)}
          onConfirm={handleCancelAll}
        />
        <Button variant="outlined" className={classes.button}>
          {formatMessage(messages.filters)}
        </Button>
      </div>
      <div className={classes.queueList}>
        {packages && renderPackages()}
      </div>
    </div>
  )
}

export default PublishingQueue;
