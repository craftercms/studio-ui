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

import React, { ElementType, useEffect, useState } from 'react';
import { defineMessages, useIntl } from "react-intl";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { palette } from "../../styles/theme";
import { fetchSites } from "../../services/sites";
import Popover from "@material-ui/core/Popover";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TitleCard from "../TitleCard";
import HomeIcon from '@material-ui/icons/Home';
import VisibilityIcon from '@material-ui/icons/Visibility';
import clsx from 'clsx';

const useStyles = makeStyles(() => ({
  popover: {
    maxWidth: '834px',
    width: '100%',
    maxHeight: '656px',
    backgroundColor: palette.white,
    borderRadius: '20px',
    boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.25), 0px 0px 4px rgba(0, 0, 0, 0.25)'
  },
  sitesPanel: {
    backgroundColor: palette.gray.light1,
    padding: '30px 24px 30px 30px'
  },
  sitesContent: {
    backgroundColor: palette.white,
    padding: '86px 24px 30px 30px'
  },
  title: {
    marginBottom: '24px',
    textTransform: 'uppercase',
    color: palette.gray.dark1
  },
  titleCard: {
    marginBottom: '20px',
  },
  sitesApps: {
    marginTop: '30px',
    display: 'flex',
    flexWrap: 'wrap'
  },
  tile: {
    width: '100px',
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  icon: {
    fontSize: '35px',
    color: palette.gray.dark1
  },
  tileTitle: {
    color: palette.gray.dark1
  }
}));

const messages = defineMessages({
  mySites: {
    id: 'globalMenu.mySites',
    defaultMessage: 'My Sites'
  },
  apps: {
    id: 'globalMenu.apps',
    defaultMessage: 'Apps'
  },
  preview: {
    id: 'globalMenu.preview',
    defaultMessage: 'Preview'
  },
  sites: {
    id: 'globalMenu.sites',
    defaultMessage: 'Sites'
  },
  users: {
    id: 'globalMenu.users',
    defaultMessage: 'Users'
  },
  groups: {
    id: 'globalMenu.groups',
    defaultMessage: 'Groups'
  },
  cluster: {
    id: 'globalMenu.cluster',
    defaultMessage: 'Cluster'
  },
  audit: {
    id: 'globalMenu.audit',
    defaultMessage: 'Audit'
  },
  loggingLevels: {
    id: 'globalMenu.loggingLevels',
    defaultMessage: 'Logging Levels'
  },
  logConsole: {
    id: 'globalMenu.logConsole',
    defaultMessage: 'Log Console'
  },
  globalConfig: {
    id: 'globalMenu.globalConfig',
    defaultMessage: 'Global Config'
  }
});

interface TileProps {
  icon: ElementType<any> | string;
  title: string;
}

function Tile(props: TileProps) {
  const {title, icon: Icon } = props;
  const classes = useStyles({});

  return (
      <div className={classes.tile}>
        {
          typeof Icon === 'string'
            ? <i className={clsx(classes.icon, Icon)}></i>
            : <Icon className={classes.icon}/>
        }
        <Typography variant="subtitle1" color="textSecondary" className={classes.tileTitle}>
          {title}
        </Typography>
      </div>
  )
}

interface GlobalNavProps {
  anchor: Element;
  onMenuClose: (e: React.MouseEvent<any>) => void;
}

export default function GlobalNav(props: GlobalNavProps) {
  const {anchor, onMenuClose} = props;
  const [open, setOpen] = useState(true);
  const classes = useStyles({});
  const {formatMessage} = useIntl();
  const [sites, setSites] = useState([]);

  function handleClose() {
    setOpen(false);
  }

  useEffect(() => {
    fetchSites().subscribe(
      ({response}) => {
        setSites(response.sites);
      }
    )
  }, []);

  return (
    <Popover
      open={open}
      anchorEl={anchor}
      onClose={handleClose}
      classes={{paper: classes.popover}}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Grid container spacing={0}>
        <Grid item xs={5} className={classes.sitesPanel}>
          <Typography variant="h6" gutterBottom className={classes.title}>
            {formatMessage(messages.mySites)}
          </Typography>
          {
            sites.map((site, i) =>
              <TitleCard key={i} title={site.siteId} options={true} classes={{root: classes.titleCard}}/>
            )
          }
        </Grid>
        <Grid item xs={7} className={classes.sitesContent}>
          <TitleCard title={"My Dashboard"} icon={HomeIcon} classes={{root: classes.titleCard}}/>
          <Typography variant="h6" gutterBottom className={classes.title}>
            {formatMessage(messages.apps)}
          </Typography>
          <div className={classes.sitesApps}>
            <Tile title={formatMessage(messages.preview)} icon={VisibilityIcon} />
            <Tile title={formatMessage(messages.sites)} icon='fa fa-sitemap' />
            <Tile title={formatMessage(messages.users)} icon='fa fa-user' />
            <Tile title={formatMessage(messages.groups)} icon='fa fa-users' />
            <Tile title={formatMessage(messages.cluster)} icon='fa fa-database' />
            <Tile title={formatMessage(messages.audit)} icon='fa fa-bars' />
            <Tile title={formatMessage(messages.loggingLevels)} icon='fa fa-level-down' />
            <Tile title={formatMessage(messages.logConsole)} icon='fa fa-align-left' />
            <Tile title={formatMessage(messages.globalConfig)} icon='fa fa-globe' />
          </div>
        </Grid>
      </Grid>
    </Popover>
  )
}

function onItemClick(e: React.MouseEvent<any>, url: string) {
  const base = window.location.host.replace('3000', '8080');
  window.location.href = `//${base}/studio${url}`;
}
