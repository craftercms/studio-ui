import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import emptyIGM from "../assets/desert.svg";
import { defineMessages, useIntl } from "react-intl";

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

const messages = defineMessages({
  defaultAlt: {
    id: 'common.defaultAlt',
    defaultMessage: 'Empty'
  },
});

interface EmptyState {
  image?: string,
  imageAlt?: string
  title: string
  subtitle: string
}

export default function EmptyState(props: EmptyState) {
  const classes = useStyles({});
  const {image, imageAlt, title, subtitle} = props;
  const {formatMessage} = useIntl();

  return (
    <div className={classes.emptyContainer}>
      {
        image ?
          <img src={image} alt={imageAlt}/> :
          <img src={emptyIGM} alt={formatMessage(messages.defaultAlt)}/>
      }
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
