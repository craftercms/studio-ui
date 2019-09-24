import React from "react";
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Fab from "@material-ui/core/Fab";
import crack from "../assets/crack.svg";
import { defineMessages, useIntl } from "react-intl";

const useStyles = makeStyles((theme: Theme) => ({
  loadingView: {
    height: '100%',
    background: '#EBEBF0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundImage:`url(${crack})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '50%',
    backgroundPosition: '101% 101%'
  },
  gearContainer: {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'center'
  },
  title: {
    marginTop: '60px',
    marginBottom: '10px'
  },
  paragraph: {
    marginBottom: '10px'
  },
  circleBtn: {
    color: '#4F4F4F',
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    left: '40px',
    bottom: '40px',
    '&:hover': {
      backgroundColor: '#FFFFFF',
    },
  }
}));

interface CreateSiteError {
  onBack(event: any): any,
  error: {
    code: string,
    documentationUrl?: string,
    message: string,
    remedialAction: string
  },
}

const messages = defineMessages({
  documentation: {
    id: 'common.documentation',
    defaultMessage: 'Documentation'
  }
});


export default function CreateSiteError(props: CreateSiteError) {
  const classes = useStyles({});
  const { error, onBack } = props;
  const {formatMessage} = useIntl();
  const { code, documentationUrl, message, remedialAction } = error;

  return (
    <div className={classes.loadingView}>
      <Typography variant="h5" component="h1" className={classes.title}>
        Error {code}
      </Typography>
      <Typography variant="subtitle1" component="p" className={classes.paragraph}>
        {message}. {remedialAction}
      </Typography>
      {documentationUrl && <Typography variant="subtitle1" component="p" className={classes.paragraph}>
         <a href={documentationUrl}>{formatMessage(messages.documentation)}</a>
      </Typography>}
      <Fab aria-label="back" className={classes.circleBtn} onClick={onBack} >
        <ArrowBackIcon />
      </Fab>
    </div>
  )
}
