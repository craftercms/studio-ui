import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import Gears from "./Gears";

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
    marginTop: '40px',
    marginBottom: '15px'
  },
  paragraph: {
    marginBottom: '10px'
  },
  footerText: {
    marginBottom: '60px'
  }
}));

interface LoadingState {
  title: string,
  subtitle?: string
  subtitle2?: string
}

export default function LoadingState(props: LoadingState) {
  const classes = useStyles({});
  return (
    <div className={classes.loadingView}>
      <Typography variant="h5" component="h1" className={classes.title} color={'textSecondary'}>
        {props.title}
      </Typography>
      {
        props.subtitle &&
        <Typography variant="subtitle1" component="p" className={classes.paragraph} color={'textSecondary'}>
          {props.subtitle}
        </Typography>
      }
      <div className={classes.gearContainer}>
        <Gears width={'250px'}/>
      </div>
      {
        props.subtitle2 &&
        <Typography variant="subtitle1" component="p" className={classes.footerText} color={'textSecondary'}>
          {props.subtitle2}
        </Typography>
      }
    </div>
  )
}
