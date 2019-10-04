import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import emptyIGM from "../assets/desert.svg";

const useStyles = makeStyles(() => ({
  emptyContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    margin: 'auto',
    '& .title': {
      marginTop: '20px',
      marginBottom: '10px'
    },
    '& .paragraph': {
      marginTop: '10px',
    },
  }
}));

interface EmptyState {
  image?: string,
  title: string
  subtitle: string
}

export default function EmptyState(props: EmptyState) {
  const classes = useStyles({});
  const {image, title, subtitle} = props;

  return (
    <div className={classes.emptyContainer}>
      <img src={image ? image : emptyIGM} alt=""/>
      {
        title &&
        <Typography variant="h5" component="h1" className={'title'} color={'textSecondary'}>
          {title}
        </Typography>
      }
      {
        subtitle &&
        <Typography variant="subtitle1" component="p" className={'paragraph'} color={'textSecondary'}>
          {subtitle}
        </Typography>
      }
    </div>
  )
}
