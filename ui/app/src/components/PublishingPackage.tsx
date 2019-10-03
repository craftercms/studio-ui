import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import React from "react";
import makeStyles from "@material-ui/styles/makeStyles/makeStyles";
import { Theme } from "@material-ui/core";
import { defineMessages, useIntl } from "react-intl";

const useStyles = makeStyles((theme: Theme) => ({
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
  checkbox: {
    marginRight: 'auto'
  },
  button: {
    margin: theme.spacing(1),
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


export default function PublishingPackage(props: any) {
  const classes = useStyles({});
  const {formatMessage} = useIntl();

  return (
    <div className={classes.package}>
      <div className={'name'}>
        <FormGroup className={classes.checkbox}>
          <FormControlLabel
            control={<Checkbox/>}
            label="Package 848484h284hc738341bn71b47748-3486n8234"
          />
        </FormGroup>
        <Button variant="outlined" color={"secondary"} className={classes.button}>
          {formatMessage(messages.cancel)}
        </Button>
      </div>
      <div className='status'>
        <div>Scheduled for 2019-08-31 04:15:00 by admin</div>
        <div>Status is Ready for Live @ Staging enviroment</div>
      </div>
      <div className='comment'>
        <div>Comment</div>
        <div>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation</div>
      </div>
      <div className='files'>
        <Button variant="outlined" className={classes.button}>
          {formatMessage(messages.fetchPackagesFiles)}
        </Button>
      </div>
    </div>
  )
}
