import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import React, { ChangeEvent, useState } from "react";
import makeStyles from "@material-ui/styles/makeStyles/makeStyles";
import { defineMessages, useIntl } from "react-intl";
import { Package } from "../models/publishing";
import SelectButton from "./SelectButton";
import Typography from "@material-ui/core/Typography";
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import { fetchPackage, cancelPackage } from "../services/publishing";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles((theme: Theme) => ({
  package: {
    padding: '20px 8px 20px 0',
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
    '& li:nth-child(odd)':{
      background: '#f9f9f9',
      borderBottom: '1px solid #dedede'
    }
  },
  spinner: {
    marginRight: '10px',
    color: theme.palette.text.secondary
  }
}));

const messages = defineMessages({
  cancel: {
    id: 'publishingQueue.cancel',
    defaultMessage: 'Cancel'
  },
  confirm: {
    id: 'publishingQueue.confirm',
    defaultMessage: 'Confirm'
  },
  confirmHelper: {
    id: 'publishingQueue.confirmHelper',
    defaultMessage: 'Set the state for the item to "Cancelled"'
  },
  fetchPackagesFiles: {
    id: 'publishingQueue.fetchPackagesFiles',
    defaultMessage: 'Fetch Packages Files'
  },
  scheduled: {
    id: 'publishingQueue.scheduled',
    defaultMessage: 'Scheduled for <b>{schedule, date, medium} {schedule, time, short}</b> by <b>{approver}</b>',
  },
  status: {
    id: 'publishingQueue.status',
    defaultMessage: 'Status is {state} for {environment} environment'
  },
  comment: {
    id: 'publishingQueue.comment',
    defaultMessage: 'Comment'
  },
  commentNotProvided: {
    id: 'publishingQueue.commentNotProvided',
    defaultMessage: '(submission comment not provided)'
  }
});

interface PublishingPackage {
  package: Package;
  siteId: string;
}

export default function PublishingPackage(props: PublishingPackage) {
  const classes = useStyles({});
  const {formatMessage} = useIntl();
  const {package: pack, siteId} = props;
  const [files, setFiles] = useState(null);
  const [loading, setLoading] = useState(null);
  const [selected, setSelected] = useState([]);
  const {id, approver, schedule, state, comment, environment} = pack;

  function onSelect(event: ChangeEvent, id: string) {
    setSelected([...selected, id]);
    console.log(selected)
  }

  function onSelectAll() {

  }

  function handleCancel(packageId: string) {
    cancelPackage(siteId, [packageId])
      .subscribe(
        ({response}) => {
          console.log(response);
        },
        ({response}) => {
          console.log(response);
        }
      );
  }

  function onFetchPackages(packageId: string) {
    setLoading(true);
    fetchPackage(siteId, packageId)
      .subscribe(
        ({response}) => {
          setFiles(response.package.items);
        },
        ({response}) => {
          console.log(response);
        }
      );
  }

  function renderFiles() {
    return files.map((file:any, index:number) => {
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

  return (
    <div className={classes.package}>
      <div className={'name'}>
        <FormGroup className={classes.checkbox}>
          <FormControlLabel
            control={<Checkbox color="primary" checked={!!selected.find((item:string) => item === id)} onChange={(event) => onSelect(event, id)}/>}
            label={<strong>{id}</strong>}
          />
        </FormGroup>
        <SelectButton
          text={formatMessage(messages.cancel)}
          cancelText={formatMessage(messages.cancel)}
          confirmText={formatMessage(messages.confirm)}
          confirmHelperText={formatMessage(messages.confirmHelper)}
          onConfirm={() => handleCancel(id)}
        />
      </div>
      <div className='status'>
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
      <div className='comment'>
        <Typography variant="body2">
          {formatMessage(messages.comment)}
        </Typography>
        <Typography variant="body2">
          {comment ? comment : <span>{formatMessage(messages.commentNotProvided)}</span>}
        </Typography>
      </div>
      <div className='files'>
        {
          files &&
          <List aria-label="files list" className={classes.list}>
            {renderFiles()}
          </List>
        }
        {
          (files === null) &&
          <Button variant="outlined" onClick={() => onFetchPackages(id)} disabled={!!loading}>
            {
              loading &&
              <CircularProgress size={14} className={classes.spinner} color={'inherit'}/>
            }
            {formatMessage(messages.fetchPackagesFiles)}
          </Button>
        }
      </div>
    </div>
  )
}
