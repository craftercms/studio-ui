/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';
import makeStyles from "@material-ui/core/styles/makeStyles";
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from "@material-ui/core/IconButton";
import EditIcon from '@material-ui/icons/Edit';
import { SiteState } from "../models/Site";
import { Blueprint } from "../models/Blueprint";
import { defineMessages, useIntl } from "react-intl";
import { Theme } from "@material-ui/core/styles/createMuiTheme";

const useStyles = makeStyles((theme: Theme) => ({
  review: {
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
    color: theme.palette.primary.main,
    '& svg': {
      fontSize: '1.2rem'
    }
  },
  noDescription: {
    color: '#a2a2a2'
  }
}));

interface BlueprintReview {
  inputs: SiteState,
  onGoTo(step: number): any,
  blueprint: Blueprint,
}

const messages = defineMessages({
  siteInfo: {
    id: 'createSiteDialog.siteInfo',
    defaultMessage: 'Site Info'
  },
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
    defaultMessage: 'Git Remote Name'
  },
  remoteURL: {
    id: 'createSiteDialog.remoteURL',
    defaultMessage: 'Git Repo URL'
  },
  remoteBranch: {
    id: 'createSiteDialog.remoteBranch',
    defaultMessage: 'Git Branch'
  },
  siteId: {
    id: 'createSiteDialog.siteId',
    defaultMessage: 'Site ID'
  },
  sandboxBranch: {
    id: 'createSiteDialog.sandboxBranch',
    defaultMessage: 'Sandbox Branch'
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

function BlueprintReview(props: BlueprintReview) {
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
          inputs.repoUrl &&
          <Typography variant="body2" gutterBottom>
            <span className={classes.bold}>{formatMessage(messages.remoteURL)}: </span> {inputs.repoUrl}
          </Typography>
        }
          <Typography variant="body2" gutterBottom>
            <span className={classes.bold}>{formatMessage(messages.remoteName)}: </span> {inputs.repoRemoteName? inputs.repoRemoteName : 'origin'}
          </Typography>
          <Typography variant="body2" gutterBottom>
            <span className={classes.bold}>{formatMessage(messages.remoteBranch)}: </span> {inputs.repoRemoteBranch? inputs.repoRemoteBranch : 'master'}
          </Typography>
        {
          inputs.repoAuthentication !== 'none' &&
          <Typography variant="body2" gutterBottom>
            <span className={classes.bold}>{formatMessage(messages.authentication)}: </span> {renderAuth(inputs.repoAuthentication)}
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
            </div>
          }
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom className={classes.section}>
            {formatMessage(messages.siteInfo)}
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
          {blueprint.source !== 'GIT' && ( blueprint.id === "GIT" || inputs.pushSite) && renderGitOptions()}
          <Typography variant="body2" gutterBottom>
            <span className={classes.bold}>{formatMessage(messages.sandboxBranch)}: </span> {inputs.sandboxBranch ? inputs.sandboxBranch : 'master'}
          </Typography>
          {
            (blueprint.id !== "GIT" && inputs.pushSite) &&
              <div>
                <Typography variant="body2" gutterBottom>
                  {formatMessage(messages.pushSite)}
                </Typography>
              </div>
          }
        </Grid>
      </Grid>
    </div>
  )
}

export default BlueprintReview;
