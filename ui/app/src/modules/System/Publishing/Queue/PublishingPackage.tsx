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

import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import React, { ChangeEvent, useRef, useState } from "react";
import makeStyles from "@material-ui/styles/makeStyles/makeStyles";
import { defineMessages, useIntl } from "react-intl";
import SelectButton from "../../../../components/UserControl/ConfirmDropdown";
import Typography from "@material-ui/core/Typography";
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import { cancelPackage, fetchPackage } from "../../../../services/publishing";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import CircularProgress from '@material-ui/core/CircularProgress';
import "../../../../styles/animations.scss";
import clsx from "clsx";
import { CurrentFilters, READY_FOR_LIVE } from "../../../../models/publishing";

const useStyles = makeStyles((theme: Theme) => ({
  package: {
    padding: '20px 8px 20px 0',
    '& .loading-header': {
      display: 'flex',
      alignItems: 'center',
      height: '42px'
    },
    '& .name': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px'
    },
    '& .status': {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '10px'
    },
    '& .comment': {
      display: 'flex',
      '& p:first-child': {
        marginRight: '20px',
        marginBottom: '10px'
      },
      '& span': {
        color: theme.palette.text.secondary
      }
    },
    '& .files': {
      marginTop: '10px',
    },
  },
  checkbox: {
    marginRight: 'auto'
  },
  list: {
    '& li': {
      display: 'flex',
      justifyContent: 'space-between'
    },
    '& li:nth-child(odd)': {
      background: '#f9f9f9',
      borderBottom: '1px solid #dedede'
    }
  },
  spinner: {
    marginRight: '10px',
    color: theme.palette.text.secondary
  },
  packageLoading: {
    '-webkit-animation': 'pulse 3s infinite ease-in-out',
    'animation': 'pulse 3s infinite ease-in-out',
    pointerEvents: 'none'
  }
}));

const messages = defineMessages({
  cancel: {
    id: 'publishingDashboard.cancel',
    defaultMessage: 'Cancel'
  },
  confirm: {
    id: 'publishingDashboard.confirm',
    defaultMessage: 'Confirm'
  },
  confirmHelper: {
    id: 'publishingDashboard.confirmHelper',
    defaultMessage: 'Set the state for the item to "Cancelled"'
  },
  fetchPackagesFiles: {
    id: 'publishingDashboard.fetchPackagesFiles',
    defaultMessage: 'Fetch Packages Files'
  },
  scheduled: {
    id: 'publishingDashboard.scheduled',
    defaultMessage: 'Scheduled for <b>{schedule, date, medium} {schedule, time, short}</b> by <b>{approver}</b>',
  },
  status: {
    id: 'publishingDashboard.status',
    defaultMessage: 'Status is {state} for {environment} environment'
  },
  comment: {
    id: 'publishingDashboard.comment',
    defaultMessage: 'Comment'
  },
  commentNotProvided: {
    id: 'publishingDashboard.commentNotProvided',
    defaultMessage: '(submission comment not provided)'
  }
});

interface PublishingPackageProps {
  siteId: string;
  id: string;
  schedule: string;
  approver: string;
  state: string;
  environment: string;
  comment: string
  selected: any;

  setSelected(selected: any): any

  pending: any;
  apiState: any;

  setApiState(state: any): any;

  setPending(pending: any): any;

  getPackages(siteId: string, filters?: string): any;

  currentFilters: CurrentFilters;
  filesPerPackage: {
    [key: string]: any;
  };

  setFilesPerPackage(filesPerPackage: any): any;
}

export default function PublishingPackage(props: PublishingPackageProps) {
  const classes = useStyles({});
  const {formatMessage} = useIntl();
  const {
    id, approver, schedule, state, comment, environment,
    siteId, selected, setSelected, pending, setPending,
    getPackages, apiState, setApiState, currentFilters,
    filesPerPackage, setFilesPerPackage
  } = props;
  const [loading, setLoading] = useState(null);

  const {current: ref} = useRef<any>({});

  ref.cancelComplete = (packageId: string) => {
    setPending({...pending, [packageId]: false});
    getPackages(siteId);
  };

  function onSelect(event: ChangeEvent, id: string, checked: boolean) {
    if (checked) {
      setSelected({...selected, [id]: false});
    } else {
      setSelected({...selected, [id]: true});
    }
  }

  function handleCancel(packageId: string) {
    setPending({...pending, [packageId]: true});

    cancelPackage(siteId, [packageId])
      .subscribe(
        () => {
          ref.cancelComplete(packageId);
        },
        ({response}) => {
          setApiState({...apiState, error: true, errorResponse: response});
        }
      );
  }

  function onFetchPackages(packageId: string) {
    setLoading(true);
    fetchPackage(siteId, packageId)
      .subscribe(
        ({response}) => {
          setLoading(false);
          setFilesPerPackage({...filesPerPackage, [packageId]: response.package.items});
        },
        ({response}) => {
          setApiState({...apiState, error: true, errorResponse: response});
        }
      );
  }

  function renderFiles(files: [File]) {
    return files.map((file: any, index: number) => {
      return (
        <ListItem key={index}>
          <Typography variant="body2">
            {file.path}
          </Typography>
          <Typography variant="body2">
            {file.contentTypeClass}
          </Typography>
        </ListItem>
      )
    })
  }

  const checked = selected[id] ? selected[id] : false;
  return (
    <div className={clsx(classes.package, pending[id] && classes.packageLoading)}>
      <section className="name">
        {
          pending[id] ? (
            <header className={"loading-header"}>
              <CircularProgress size={15} className={classes.spinner} color={"inherit"}/>
              <Typography variant="body1">
                <strong>{id}</strong>
              </Typography>
            </header>
          ) : (
            (currentFilters.state === READY_FOR_LIVE) ? (
              <FormGroup className={classes.checkbox}>
                <FormControlLabel
                  control={
                    <Checkbox
                      color="primary"
                      checked={checked}
                      onChange={(event) => onSelect(event, id, checked)}/>
                  }
                  label={<strong>{id}</strong>}
                />
              </FormGroup>
            ) : (
              <Typography variant="body1">
                <strong>{id}</strong>
              </Typography>
            )
          )
        }
        {
          (state === READY_FOR_LIVE) &&
          <SelectButton
            text={formatMessage(messages.cancel)}
            cancelText={formatMessage(messages.cancel)}
            confirmText={formatMessage(messages.confirm)}
            confirmHelperText={formatMessage(messages.confirmHelper)}
            onConfirm={() => handleCancel(id)}
          />
        }
      </section>
      <div className="status">
        <Typography variant="body2">
          {
            formatMessage(
              messages.scheduled,
              {
                schedule: new Date(schedule),
                approver: approver,
                b: (content) => <strong key={content}>{content}</strong>
              }
            )
          }
        </Typography>
        <Typography variant="body2">
          {
            formatMessage(
              messages.status,
              {
                state: <strong key={state}>{state}</strong>,
                environment: <strong key={environment}>{environment}</strong>,
              }
            )
          }
        </Typography>
      </div>
      <div className="comment">
        <Typography variant="body2">
          {formatMessage(messages.comment)}
        </Typography>
        <Typography variant="body2">
          {comment ? comment : <span>{formatMessage(messages.commentNotProvided)}</span>}
        </Typography>
      </div>
      <div className="files">
        {
          (filesPerPackage && filesPerPackage[id]) &&
          <List aria-label="files list" className={classes.list}>
            {renderFiles(filesPerPackage[id])}
          </List>
        }
        {
          (filesPerPackage === null || !filesPerPackage[id]) &&
          <Button variant="outlined" onClick={() => onFetchPackages(id)} disabled={!!loading}>
            {
              loading &&
              <CircularProgress size={14} className={classes.spinner} color={"inherit"}/>
            }
            {formatMessage(messages.fetchPackagesFiles)}
          </Button>
        }
      </div>
    </div>
  )
}
