/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React, { useEffect, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import { SiteState } from '../../models/Site';
import { MarketplacePlugin, MarketplacePluginParameter } from '../../models/MarketplacePlugin';
import { defineMessages, useIntl } from 'react-intl';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import palette from '../../styles/palette';

const useStyles = makeStyles()((theme) => ({
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
    color: palette.gray.medium2
  },
  showPassword: {
    color: theme.palette.primary.main,
    padding: '1px',
    marginLeft: '5px',
    '& svg': {
      fontSize: '1rem'
    }
  }
}));

interface BlueprintReviewProps {
  inputs: SiteState;
  blueprint: MarketplacePlugin;

  onGoTo(step: number): any;
}

const messages = defineMessages({
  siteInfo: {
    id: 'createSiteDialog.siteInfo',
    defaultMessage: 'Project Info'
  },
  blueprintStrategy: {
    id: 'createSiteDialog.blueprintStrategy',
    defaultMessage: 'Create from plugin'
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
  remoteName: {
    id: 'createSiteDialog.remoteName',
    defaultMessage: 'Git Remote Name'
  },
  remoteURL: {
    id: 'createSiteDialog.remoteURL',
    defaultMessage: 'Git Repo URL'
  },
  siteId: {
    id: 'createSiteDialog.siteId',
    defaultMessage: 'Project ID'
  },
  siteName: {
    id: 'createSiteDialog.siteName',
    defaultMessage: 'Project Name'
  },
  gitBranch: {
    id: 'createSiteDialog.gitBranch',
    defaultMessage: 'Git Branch'
  },
  userNameAndPassword: {
    id: 'createSiteDialog.userNameAndPassword',
    defaultMessage: 'Username & Password'
  },
  token: {
    id: 'createSiteDialog.token',
    defaultMessage: 'Token'
  },
  privateKey: {
    id: 'createSiteDialog.privateKey',
    defaultMessage: 'Private Key'
  },
  authentication: {
    id: 'createSiteDialog.authentication',
    defaultMessage: 'Authentication'
  },
  noDescription: {
    id: 'createSiteDialog.noDescription',
    defaultMessage: 'No description supplied'
  },
  description: {
    id: 'createSiteDialog.description',
    defaultMessage: 'Description'
  },
  blueprint: {
    id: 'createSiteDialog.plugin',
    defaultMessage: 'Blueprint'
  },
  blueprintParameters: {
    id: 'createSiteDialog.blueprintParameters',
    defaultMessage: 'Blueprint Parameters'
  },
  useDefaultValue: {
    id: 'createSiteDialog.useDefaultValue',
    defaultMessage: 'use default value'
  }
});

function BlueprintReview(props: BlueprintReviewProps) {
  const { classes } = useStyles();
  const { onGoTo, inputs, blueprint } = props;
  const [passwordFields, setPasswordFields] = useState(null);
  const { formatMessage } = useIntl();

  useEffect(() => {
    if (blueprint.parameters) {
      let fields: any = {};
      blueprint.parameters.forEach((parameter: MarketplacePluginParameter) => {
        if (parameter.type === 'PASSWORD') {
          fields[parameter.name] = false;
        }
      });
      setPasswordFields(fields);
    }
  }, [blueprint]);

  function renderAuth(type: string) {
    if (type === 'basic') {
      return formatMessage(messages.userNameAndPassword);
    } else if (type === 'token') {
      return formatMessage(messages.token);
    } else {
      return formatMessage(messages.privateKey);
    }
  }

  function showPassword(parameter: MarketplacePluginParameter) {
    setPasswordFields({ ...passwordFields, [parameter.name]: !passwordFields[parameter.name] });
  }

  function renderSingleParameter(parameter: MarketplacePluginParameter) {
    if (inputs.blueprintFields[parameter.name] && parameter.type === 'STRING') {
      return inputs.blueprintFields[parameter.name];
    } else if (parameter.type === 'STRING') {
      return parameter.defaultValue;
    } else if (inputs.blueprintFields[parameter.name] && parameter.type === 'PASSWORD') {
      return (
        <span>
          {passwordFields && passwordFields[parameter.name] ? inputs.blueprintFields[parameter.name] : '********'}
          <IconButton
            edge="end"
            className={classes.showPassword}
            aria-label="toggle password visibility"
            onClick={() => {
              showPassword(parameter);
            }}
            size="large"
          >
            {passwordFields && passwordFields[parameter.name] ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </span>
      );
    } else {
      return '********';
    }
  }

  function renderBlueprintParameters() {
    return blueprint.parameters.map((parameter, index) => {
      return (
        <Typography variant="body2" gutterBottom key={index}>
          <span className={classes.bold}>{parameter.label}: </span>
          {renderSingleParameter(parameter)}
        </Typography>
      );
    });
  }

  function renderGitOptions() {
    return (
      <div>
        {inputs.repoUrl && (
          <Typography variant="body2" gutterBottom>
            <span className={classes.bold}>{formatMessage(messages.remoteURL)}: </span> {inputs.repoUrl}
          </Typography>
        )}
        <Typography variant="body2" gutterBottom>
          <span className={classes.bold}>{formatMessage(messages.remoteName)}:</span>
          {` ${inputs.repoRemoteName ? inputs.repoRemoteName : 'origin'}`}
        </Typography>
        {inputs.repoAuthentication !== 'none' && (
          <Typography variant="body2" gutterBottom>
            <span className={classes.bold}>{formatMessage(messages.authentication)}:</span>{' '}
            {renderAuth(inputs.repoAuthentication)}
          </Typography>
        )}
      </div>
    );
  }

  return (
    <div className={classes.review}>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Typography variant="h6" gutterBottom className={classes.section}>
            {formatMessage(messages.creationStrategy)}
            <IconButton aria-label="goto" className={classes.edit} onClick={() => onGoTo(0)} size="large">
              <EditIcon />
            </IconButton>
          </Typography>
          {blueprint.id !== 'GIT' ? (
            <div>
              <Typography variant="body2" gutterBottom>
                {formatMessage(messages.blueprintStrategy)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <span className={classes.bold}>{formatMessage(messages.blueprint)}: </span>{' '}
                {blueprint && blueprint.name}
              </Typography>
            </div>
          ) : (
            <div>
              <Typography variant="body2" gutterBottom>
                {formatMessage(messages.gitStrategy)}
              </Typography>
            </div>
          )}
        </Grid>
        <Grid size={12}>
          <Typography variant="h6" gutterBottom className={classes.section}>
            {formatMessage(messages.siteInfo)}
            <IconButton aria-label="goto" className={classes.edit} onClick={() => onGoTo(1)} size="large">
              <EditIcon />
            </IconButton>
          </Typography>
          <Typography variant="body2" gutterBottom noWrap>
            <span className={classes.bold}>{formatMessage(messages.siteName)}: </span> {inputs.siteName}
          </Typography>
          <Typography variant="body2" gutterBottom>
            <span className={classes.bold}>{formatMessage(messages.siteId)}: </span> {inputs.siteId}
          </Typography>
          <Typography variant="body2" gutterBottom>
            <span className={classes.bold}>{formatMessage(messages.description)}:</span>
            {` `}
            {inputs.description ? (
              inputs.description
            ) : (
              <span className={classes.noDescription}>({formatMessage(messages.noDescription)})</span>
            )}
          </Typography>
          <Typography variant="body2" gutterBottom>
            <span className={classes.bold}>{formatMessage(messages.gitBranch)}:</span>
            {` ${inputs.gitBranch ? inputs.gitBranch : 'master'}`}
          </Typography>
          {blueprint.source !== 'GIT' && blueprint.id === 'GIT' && renderGitOptions()}
        </Grid>
        {blueprint.parameters && !!blueprint.parameters.length && (
          <Grid size={12}>
            <Typography variant="h6" gutterBottom className={classes.section}>
              {formatMessage(messages.blueprintParameters)}
              <IconButton aria-label="goto" className={classes.edit} onClick={() => onGoTo(1)} size="large">
                <EditIcon />
              </IconButton>
            </Typography>
            {renderBlueprintParameters()}
          </Grid>
        )}
      </Grid>
    </div>
  );
}

export default BlueprintReview;
