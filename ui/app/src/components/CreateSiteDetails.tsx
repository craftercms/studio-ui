import React from "react";
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import { defineMessages, useIntl } from "react-intl";

const useStyles = makeStyles((theme: Theme) => ({
  detailsView: {
    height: '100%',
    background: '#EBEBF0',
    display: 'flex',
    flexDirection: 'column',
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


export default function CreateSiteDetails(props: any) {
  const classes = useStyles({});
  const {formatMessage} = useIntl();

  return (
    <div className={classes.detailsView}>
      <Typography variant="h5" component="h1">
        Name
      </Typography>
    </div>
  )
}
