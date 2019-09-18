import React from 'react';
import makeStyles from "@material-ui/core/styles/makeStyles";
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from "@material-ui/core/IconButton";
import EditIcon from '@material-ui/icons/Edit';
import { SiteState } from "../models/Site";
import { Blueprint } from "../models/Blueprint";
import { defineMessages, useIntl } from "react-intl";

const useStyles = makeStyles(() => ({
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

interface BluePrintReview {
  inputs: SiteState,
  onGoTo(step: number): any,
  blueprint: Blueprint,
}

const messages = defineMessages({
  bluePrintStrategy: {
    id: 'createSiteDialog.bluePrintStrategy',
    defaultMessage: 'Create from blueprint'
  },
  gitStrategy: {
    id: 'createSiteDialog.gitStrategy',
    defaultMessage: 'Existing remote git repo clone'
  },
  creationStrategy: {
    id: 'createSiteDialog.creationStrategy',
    defaultMessage: 'Creation Strategy'
  },
  additionalOptions: {
    id: 'createSiteDialog.additionalOptions',
    defaultMessage: 'Additional Options'
  },
  pushSite: {
    id: 'createSiteDialog.pushSite',
    defaultMessage: 'Push the site to a remote Git repository after creation'
  },
  noPushSite: {
    id: 'createSiteDialog.noPushSite',
    defaultMessage: 'Don\'t push the site to a remote Git repository after creation'
  },
  remoteName: {
    id: 'createSiteDialog.remoteName',
    defaultMessage: 'Remote Name'
  },
  remoteURL: {
    id: 'createSiteDialog.remoteURL',
    defaultMessage: 'URL'
  },
  remoteBranch: {
    id: 'createSiteDialog.remoteBranch',
    defaultMessage: 'Branch'
  },
  siteId: {
    id: 'createSiteDialog.siteId',
    defaultMessage: 'Site ID'
  },
  userNameAndPassword: {
    id: 'common.userNameAndPassword',
    defaultMessage: 'Username & Password'
  },
  token: {
    id: 'common.token',
    defaultMessage: 'Token'
  },
  privateKey: {
    id: 'common.privateKey',
    defaultMessage: 'Private Key'
  },
  authentication: {
    id: 'common.authentication',
    defaultMessage: 'Authentication'
  },
  noDescription: {
    id: 'common.noDescription',
    defaultMessage: 'No description supplied'
  },
  description: {
    id: 'common.description',
    defaultMessage: 'Description'
  },
  bluePrint: {
    id: 'common.bluePrint',
    defaultMessage: 'Blueprint'
  }
});

function BluePrintReview(props: BluePrintReview) {
  const classes = useStyles({});
  const {onGoTo, inputs, blueprint} = props;
  const { formatMessage } = useIntl();

  function renderAuth(type:string) {
    if(type === 'basic') {
      return formatMessage(messages.userNameAndPassword);
    }else if (type === 'token'){
      return formatMessage(messages.token);
    }else {
      return formatMessage(messages.privateKey);
    }
  }

  function renderGitOptions() {
    return (<div>
        {
          inputs.repo_url &&
          <Typography variant="body2" gutterBottom>
            <span className={classes.bold}>{formatMessage(messages.remoteURL)}: </span> {inputs.repo_url}
          </Typography>
        }
        {
          inputs.repo_remote_name &&
          <Typography variant="body2" gutterBottom>
            <span className={classes.bold}>{formatMessage(messages.remoteName)}: </span> {inputs.repo_remote_name}
          </Typography>
        }
        {
          inputs.repo_remote_branch &&
          <Typography variant="body2" gutterBottom>
            <span className={classes.bold}>{formatMessage(messages.remoteBranch)}: </span> {inputs.repo_remote_branch}
          </Typography>
        }
        {
          inputs.repo_authentication !== 'none' &&
          <Typography variant="body2" gutterBottom>
            <span className={classes.bold}>{formatMessage(messages.authentication)}: </span> {renderAuth(inputs.repo_authentication)}
          </Typography>
        }
      </div>
    )
  }

  return (
    <div className={classes.review}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom className={classes.section}>
            {formatMessage(messages.creationStrategy)}
            <IconButton aria-label="goto" className={classes.edit} onClick={() => onGoTo(0)}>
              <EditIcon/>
            </IconButton>
          </Typography>
          {
            (blueprint.id !== "GIT") ?
            <div>
              <Typography variant="body2" gutterBottom>
                {formatMessage(messages.bluePrintStrategy)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <span className={classes.bold}>{formatMessage(messages.bluePrint)}: </span> {blueprint && blueprint.name}
              </Typography>
            </div>
            :
            <div>
              <Typography variant="body2" gutterBottom>
                {formatMessage(messages.gitStrategy)}
              </Typography>
              {renderGitOptions()}
            </div>
          }
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom className={classes.section}>
            Site name & description
            <IconButton aria-label="goto" className={classes.edit} onClick={() => onGoTo(1)}>
              <EditIcon/>
            </IconButton>
          </Typography>
          <Typography variant="body2" gutterBottom>
            <span className={classes.bold}>{formatMessage(messages.siteId)}: </span> {inputs.siteId}
          </Typography>
          <Typography variant="body2" gutterBottom>
            <span className={classes.bold}>{formatMessage(messages.description)}: </span> {inputs.description ? inputs.description :
            <span className={classes.noDescription}>({formatMessage(messages.noDescription)})</span>}
          </Typography>
        </Grid>
        {
          (blueprint.id !== "GIT") &&
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom className={classes.section}>
              {formatMessage(messages.additionalOptions)}
              <IconButton aria-label="goto" className={classes.edit} onClick={() => onGoTo(1)}>
                <EditIcon/>
              </IconButton>
            </Typography>
            {inputs.push_site ?
              <div>
                <Typography variant="body2" gutterBottom>
                  {formatMessage(messages.pushSite)}
                </Typography>
                {renderGitOptions()}
              </div> :
              <Typography variant="body2" gutterBottom>
                {formatMessage(messages.noPushSite)}
              </Typography>
            }
          </Grid>
        }
      </Grid>
    </div>
  )
}

export default BluePrintReview;
