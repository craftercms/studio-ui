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

const messages = defineMessages({
  selectAll: {
    id: 'publishingQueue.selectAll',
    defaultMessage: 'Select All'
  },
  cancelSelected: {
    id: 'publishingQueue.cancelSelected',
    defaultMessage: 'Cancel Selected'
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
    border: '1px solid #dedede'
  },
  topBar: {
    display: 'flex',
    padding: '0 0 0 0',
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
  const [packages, setPackages] = useState(null);
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
      return <PublishingPackage package={item} key={index}/>
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
        {packages && renderPackages()}
      </div>
    </div>
  )
}

export default PublishingQueue;
