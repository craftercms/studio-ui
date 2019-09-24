import React from "react";
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import Gears  from "./Gears";

const useStyles = makeStyles((theme: Theme) => ({
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

export default function CreateSiteLoading() {
  const classes = useStyles({});
  return (
    <div className={classes.loadingView}>
      <Typography variant="h5" component="h1" className={classes.title}>
        Creating Site
      </Typography>
      <Typography variant="subtitle1" component="p" className={classes.paragraph}>
        Please wait while your site is being created..
      </Typography>
      <div className={classes.gearContainer}>
        <Gears width={'250px'} />
      </div>
      <Typography variant="subtitle1" component="p" className={classes.footerText}>
        CREATE IN BACKGROUND
      </Typography>
    </div>
  )
}
