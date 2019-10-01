import React from "react";
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Fab from "@material-ui/core/Fab";
import crack from "../assets/full-crack.svg";
import { defineMessages, useIntl } from "react-intl";
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

const useStyles = makeStyles((theme: Theme) => ({
  loadingView: {
    height: '100%',
    background: '#EBEBF0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px'
  },
  gearContainer: {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'center'
  },
  title: {
    marginTop: '20px',
    marginBottom: '10px'
  },
  paragraph: {
    marginTop: '10px',
  },
  link: {
    color: theme.palette.text.secondary,
    '& svg': {
      verticalAlign: 'sub',
      fontSize: '1.3rem'
    }
  },
  circleBtn: {
    color: '#4F4F4F',
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    left: '40px',
    top: '35px',
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
  moreInfo: {
    id: 'common.moreInfo',
    defaultMessage: 'More info'
  }
});


export default function CreateSiteError(props: CreateSiteError) {
  const classes = useStyles({});
  const { error, onBack } = props;
  const {formatMessage} = useIntl();
  const { code, documentationUrl, message, remedialAction } = error;

  return (
    <div className={classes.loadingView}>
      <img src={crack} alt="error"/>
      <Typography variant="h5" component="h1" className={classes.title} color={'textSecondary'}>
        Error {code}
      </Typography>
      <Typography variant="subtitle1" component="p" color={'textSecondary'}>
        {message}. {remedialAction}
      </Typography>
      {
        documentationUrl &&
        <Typography variant="subtitle1" component="p" className={classes.paragraph}>
           <a className={classes.link} href={documentationUrl} target={'blank'}>{formatMessage(messages.moreInfo)}<OpenInNewIcon/></a>
        </Typography>
      }
      <Fab aria-label="back" className={classes.circleBtn} onClick={onBack} >
        <ArrowBackIcon />
      </Fab>
    </div>
  )
}
