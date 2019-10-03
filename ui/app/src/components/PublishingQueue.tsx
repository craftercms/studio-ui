import React from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { defineMessages, useIntl } from 'react-intl';
import Button from '@material-ui/core/Button';

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
  filters: {
    id: 'publishingQueue.filters',
    defaultMessage: 'Filters'
  },
  fetchPackagesFiles: {
    id: 'publishingQueue.fetchPackagesFiles',
    defaultMessage: 'Fetch Packages Files'
  }
});


const useStyles = makeStyles((theme: Theme) => ({
  publishingQueue: {
    marginTop: '40px',
    margin: 'auto',
    width: '800px',
    height: '600px',
    padding: '40px',
    border: '1px solid #dedede'
  },
  topBar: {
    display: 'flex',
    padding: '0 20px',
    alignItems: 'center',
    borderTop: '1px solid #dedede',
    borderBottom: '1px solid #dedede',

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
  const {formatMessage} = useIntl();
  return (
    <div className={classes.publishingQueue}>
      <div className={classes.topBar}>
        <FormGroup className={classes.selectAll}>
          <FormControlLabel
            control={<Checkbox/>}
            label={formatMessage(messages.selectAll)}
          />
        </FormGroup>
        <Button variant="outlined" color={"secondary"} className={classes.button}>
          {formatMessage(messages.cancelSelected)}
        </Button>
        <Button variant="outlined" className={classes.button}>
          {formatMessage(messages.filters)}
        </Button>
      </div>
      <div className={classes.queueList}>
        <div className={classes.package}>
          <div className={'name'}>
            <FormGroup className={classes.selectAll}>
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
      </div>
    </div>
  )
}

export default PublishingQueue;
