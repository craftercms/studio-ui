import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import React from "react";
import makeStyles from "@material-ui/styles/makeStyles/makeStyles";
import { defineMessages, useIntl } from "react-intl";
import { Package } from "../models/publishing";
import SelectButton from "./SelectButton";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles(() => ({
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
      '& div:first-child': {
        marginRight: '20px',
        marginBottom: '10px'
      }
    },
    '& .files': {
      marginTop: '10px',
    },
  },
  checkbox: {
    marginRight: 'auto'
  },
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
  }
});

interface PublishingPackage {
  package: Package
}

export default function PublishingPackage(props: PublishingPackage) {
  const classes = useStyles({});
  const {formatMessage} = useIntl();

  const {id, approver, schedule, state, comment, environment} = props.package;

  console.log(props.package);

  function handleCancel(item: Package) {
    console.log('cancel')
  }

  return (
    <div className={classes.package}>
      <div className={'name'}>
        <FormGroup className={classes.checkbox}>
          <FormControlLabel
            control={<Checkbox color="primary"/>}
            label={id}
          />
        </FormGroup>
        <SelectButton
          text={formatMessage(messages.cancel)}
          cancelText={formatMessage(messages.cancel)}
          confirmText={formatMessage(messages.confirm)}
          confirmHelperText={formatMessage(messages.confirmHelper)}
          onConfirm={()=> handleCancel(props.package)}
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
        <div>Comment</div>
        <div>{comment? comment : '(submission comment not provided)'}</div>
      </div>
      <div className='files'>
        <Button variant="outlined">
          {formatMessage(messages.fetchPackagesFiles)}
        </Button>
      </div>
    </div>
  )
}
