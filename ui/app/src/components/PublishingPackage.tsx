import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import React from "react";
import makeStyles from "@material-ui/styles/makeStyles/makeStyles";
import { defineMessages, useIntl } from "react-intl";
import { Package } from "../models/publishing";

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
  fetchPackagesFiles: {
    id: 'publishingQueue.fetchPackagesFiles',
    defaultMessage: 'Fetch Packages Files'
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

  return (
    <div className={classes.package}>
      <div className={'name'}>
        <FormGroup className={classes.checkbox}>
          <FormControlLabel
            control={<Checkbox/>}
            label={id}
          />
        </FormGroup>
        <Button variant="outlined" color={"secondary"}>
          {formatMessage(messages.cancel)}
        </Button>
      </div>
      <div className='status'>
        <div>Scheduled for {schedule} by {approver}</div>
        <div>Status is {state} for {environment} enviroment</div>
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
