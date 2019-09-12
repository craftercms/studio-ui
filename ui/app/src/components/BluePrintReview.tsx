import React from 'react';
import makeStyles from "@material-ui/core/styles/makeStyles";
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from "@material-ui/core/IconButton";
import EditIcon from '@material-ui/icons/Edit';

const useStyles = makeStyles(theme => ({
  review: {
    paddingTop: '40px',
    maxWidth: '600px',
    margin: 'auto'
  },
  section: {
    marginBottom: '0'
  },
  bold: {
    fontWeight: 'bold'
  },
  inline: {
    display: 'inline'
  },
  edit: {
    color: '#7E9DBB',
    '& svg': {
      fontSize: '1.2rem'
    }
  },
  noDescription: {
    color: '#a2a2a2'
  }
}));

function BluePrintReview(props: any) {
  const classes = useStyles({});

  const {onGoTo, inputs, blueprint} = props;

  return (
    <div className={classes.review}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom className={classes.section}>
            Creation Strategy
            <IconButton aria-label="goto" className={classes.edit} onClick={() => onGoTo(0)}>
              <EditIcon/>
            </IconButton>
          </Typography>
          <Typography variant="body2" gutterBottom>
            Created from blueprint
          </Typography>
          <Typography variant="body2" gutterBottom>
            <span className={classes.bold}>Blueprint: </span> {blueprint && blueprint.plugin.name}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom className={classes.section}>
            Site name & description
            <IconButton aria-label="goto" className={classes.edit} onClick={() => onGoTo(1)}>
              <EditIcon/>
            </IconButton>
          </Typography>
          <Typography variant="body2" gutterBottom>
            <span className={classes.bold}>Site IdL: </span> {inputs.siteId}
          </Typography>
          <Typography variant="body2" gutterBottom>
            <span className={classes.bold}>Description: </span> { inputs.description? inputs.description : <span className={classes.noDescription}>(no description supplied)</span> }
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom className={classes.section}>
            Additional Options
            <IconButton aria-label="goto" className={classes.edit} onClick={() => onGoTo(1)}>
              <EditIcon/>
            </IconButton>
          </Typography>
          <Typography variant="body2" gutterBottom>
            Elastic Search
          </Typography>
        </Grid>
      </Grid>
    </div>
  )
}

export default BluePrintReview;
