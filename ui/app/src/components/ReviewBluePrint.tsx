import React from 'react';
import makeStyles from "@material-ui/core/styles/makeStyles";
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
  review: {
    maxWidth: '600px',
    margin: 'auto'
  },
  bold: {
    fontWeight: 'bold'
  },
  inline: {
    display: 'inline'
  }
}));

function ReviewBluePrint(props: any) {
  const classes = useStyles({});

  return (
    <div className={classes.review}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Creation Strategy
          </Typography>
          <Typography variant="body2" gutterBottom>
            Created from blueprint
          </Typography>
          <Typography variant="body2" gutterBottom>
            <span className={classes.bold}>Blueprint: </span> React - Single page application powered by React
          </Typography>
        </Grid>
      </Grid>
    </div>
  )
}

export default ReviewBluePrint;
