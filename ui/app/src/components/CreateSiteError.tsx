import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import Gears  from "./Gears";

const useStyles = makeStyles((theme: any) => ({
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
    marginTop: '60px',
    marginBottom: '10px'
  },
  paragraph: {
    marginBottom: '10px'
  }
}));

interface CreateSiteError {
  error: {
    code: string,
    documentationUrl?: string,
    message: string,
    remedialAction: string
  },
}

export default function CreateSiteError(props: CreateSiteError) {
  const classes = useStyles({});
  const { code, documentationUrl, message, remedialAction } = props.error;
  return (
    <div className={classes.loadingView}>
      <Typography variant="h5" component="h1" className={classes.title}>
        Error {code}
      </Typography>
      <Typography variant="subtitle1" component="p" className={classes.paragraph}>
        {message}
      </Typography>
      <Typography variant="subtitle1" component="p" className={classes.paragraph}>
        {remedialAction}
      </Typography>
    </div>
  )
}
