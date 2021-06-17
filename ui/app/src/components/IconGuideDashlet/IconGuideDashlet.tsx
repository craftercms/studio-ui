/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import React, { useState } from 'react';
import Dashlet from '../Dashlet';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import ItemStateIcon from '../ItemStateIcon';
import { getItemStateText } from '../ItemDisplay/utils';
import ItemTypeIcon from '../ItemTypeIcon';

const useStyles = makeStyles((theme) =>
  createStyles({
    iconGuideContainer: {
      padding: theme.spacing(2)
    },
    guideSectionTitle: {
      marginBottom: theme.spacing(1),
      '&:not(:first-child)': {
        marginTop: theme.spacing(3)
      }
    },
    stateContainer: {
      display: 'flex',
      alignItems: 'center'
    },
    icon: {
      marginRight: theme.spacing(1)
    }
  })
);

const messages = defineMessages({
  page: { id: 'iconGuide.page', defaultMessage: 'Page' },
  component: { id: 'iconGuide.component', defaultMessage: 'Component' },
  folder: { id: 'iconGuide.folder', defaultMessage: 'Folder' },
  levelDescriptor: { id: 'iconGuide.levelDescriptor', defaultMessage: 'levelDescriptor' },
  renderingTemplate: { id: 'iconGuide.renderingTemplate', defaultMessage: 'Rendering Template' },
  script: { id: 'iconGuide.script', defaultMessage: 'Script' },
  taxonomy: { id: 'iconGuide.taxonomy', defaultMessage: 'Taxonomy' },
  image: { id: 'iconGuide.asset', defaultMessage: 'Image' },
  javascript: { id: 'iconGuide.asset', defaultMessage: 'JavaScript' },
  json: { id: 'iconGuide.asset', defaultMessage: 'Json' },
  groovy: { id: 'iconGuide.asset', defaultMessage: 'Groovy' },
  freemarker: { id: 'iconGuide.asset', defaultMessage: 'Freemarker' },
  html: { id: 'iconGuide.asset', defaultMessage: 'HTML' },
  css: { id: 'iconGuide.asset', defaultMessage: 'CSS' },
  plainText: { id: 'iconGuide.asset', defaultMessage: 'Plain Text' },
  xml: { id: 'iconGuide.asset', defaultMessage: 'XML' },
  font: { id: 'iconGuide.asset', defaultMessage: 'Font' },
  icon: { id: 'iconGuide.asset', defaultMessage: 'Icon' }
});

const states = {
  new: { stateMap: { new: true } },
  modified: { stateMap: { modified: true } },
  deleted: { stateMap: { deleted: true } },
  locked: { stateMap: { locked: true } },
  systemProcessing: { stateMap: { systemProcessing: true } },
  submitted: { stateMap: { submitted: true } },
  scheduled: { stateMap: { scheduled: true } },
  publishing: { stateMap: { publishing: true } },
  staged: { stateMap: { staged: true } },
  live: { stateMap: { live: true } }
};

const types = {
  page: { systemType: 'page' },
  component: { systemType: 'component' },
  folder: { systemType: 'folder' },
  levelDescriptor: { systemType: 'levelDescriptor' },
  renderingTemplate: { systemType: 'renderingTemplate' },
  script: { systemType: 'script' },
  taxonomy: { systemType: 'taxonomy' },
  image: { systemType: 'asset', mimeType: 'image/' },
  javascript: { systemType: 'asset', mimeType: 'application/javascript' },
  json: { systemType: 'asset', mimeType: 'application/json' },
  groovy: { systemType: 'asset', mimeType: 'application/x-groovy' },
  freemarker: { systemType: 'asset', mimeType: 'application/x-freemarker' },
  html: { systemType: 'asset', mimeType: 'text/html' },
  css: { systemType: 'asset', mimeType: 'text/css' },
  plainText: { systemType: 'asset', mimeType: 'text/plain' },
  xml: { systemType: 'asset', mimeType: 'application/xml' },
  font: { systemType: 'asset', mimeType: 'font/ttf' },
  icon: { systemType: 'asset', mimeType: 'image/vnd.microsoft.icon' }
};

export default function IconGuideDashlet() {
  const [expanded, setExpanded] = useState(true);
  const classes = useStyles();
  const { formatMessage } = useIntl();

  return (
    <Dashlet
      title={<FormattedMessage id="iconGuide.title" defaultMessage="Icon Guide" />}
      expanded={expanded}
      onToggleExpanded={() => setExpanded(!expanded)}
    >
      <div className={classes.iconGuideContainer}>
        <Typography variant="subtitle2" className={classes.guideSectionTitle}>
          <FormattedMessage id="iconGuide.workflowStates" defaultMessage="Workflow States" />
        </Typography>
        <Grid container spacing={2}>
          {Object.keys(states).map((key) => (
            <Grid item xs={3} className={classes.stateContainer}>
              <ItemStateIcon item={states[key]} className={classes.icon} />
              <Typography variant="body2" component="span">
                {getItemStateText(states[key].stateMap)}
              </Typography>
            </Grid>
          ))}
        </Grid>

        <Typography variant="subtitle2" className={classes.guideSectionTitle}>
          <FormattedMessage id="iconGuide.itemTypes" defaultMessage="Item Types" />
        </Typography>
        <Grid container spacing={2}>
          {Object.keys(types).map((key) => (
            <Grid item xs={3} className={classes.stateContainer}>
              <ItemTypeIcon item={types[key]} className={classes.icon} />
              <Typography variant="body2" component="span">
                {formatMessage(messages[key])}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </div>
    </Dashlet>
  );
}
