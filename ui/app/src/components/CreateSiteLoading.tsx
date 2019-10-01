import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import Gears  from "./Gears";
import { defineMessages, useIntl } from "react-intl";

const useStyles = makeStyles(() => ({
  loadingView: {
    height: '100%',
    background: '#EBEBF0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  gearContainer: {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'center'
  },
  title: {
    marginTop: '40px'
  },
  paragraph: {
    marginBottom: '10px'
  },
  footerText: {
    marginBottom: '60px'
  }
}));

const messages = defineMessages({
  creatingSite: {
    id: 'createSiteDialog.creatingSite',
    defaultMessage: 'Creating Site'
  },
  pleaseWait: {
    id: 'createSiteDialog.pleaseWait',
    defaultMessage: 'Please wait while your site is being created..'
  },
  createInBackground: {
    id: 'createSiteDialog.createInBackground',
    defaultMessage: 'Create in Background'
  }
});

export default function CreateSiteLoading() {
  const classes = useStyles({});
  const {formatMessage} = useIntl();
  return (
    <div className={classes.loadingView}>
      <Typography variant="h5" component="h1" className={classes.title} color={'textSecondary'}>
        {formatMessage(messages.creatingSite)}
      </Typography>
      <Typography variant="subtitle1" component="p" className={classes.paragraph} color={'textSecondary'}>
        {formatMessage(messages.pleaseWait)}
      </Typography>
      <div className={classes.gearContainer}>
        <Gears width={'250px'} />
      </div>
      <Typography variant="subtitle1" component="p" className={classes.footerText} color={'textSecondary'}>
        {formatMessage(messages.createInBackground)}
      </Typography>
    </div>
  )
}
