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
import { deleteSite, fetchSites } from "../../services/sites";
import Popover from "@material-ui/core/Popover";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TitleCard from "../TitleCard";
import HomeIcon from '@material-ui/icons/Home';
import clsx from 'clsx';
import { getGlobalMenuitems } from '../../services/configuration';
import Cookies from "js-cookie";
import ConfirmDialog from "../UserControl/ConfirmDialog";
import ErrorState from "../SystemStatus/ErrorState";

const useStyles = makeStyles(() => ({
  popover: {
    maxWidth: '920px',
    width: '100%',
    maxHeight: '656px',
    backgroundColor: palette.white,
    borderRadius: '20px',
    boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.25), 0px 0px 4px rgba(0, 0, 0, 0.25)'
  },
  sitesPanel: {
    backgroundColor: palette.gray.light1,
    padding: '30px 24px 30px 30px',
    height: '600px',
    overflow: 'auto'
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
    padding: '10px',
    width: '120px',
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
  },
  errorPaperRoot: {
    height: '100%'
  }
}));

const messages = defineMessages({
  mySites: {
    id: 'globalMenu.mySites',
    defaultMessage: 'My Sites'
  },
  myDashboard: {
    id: 'globalMenu.myDashboard',
    defaultMessage: 'My Dashboard'
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
  },
  dashboard: {
    id: 'globalMenu.dashboard',
    defaultMessage: 'Dashboard'
  },
  remove: {
    id: 'globalMenu.remove',
    defaultMessage: 'Remove'
  },
  ok: {
    id: 'globalMenu.ok',
    defaultMessage: 'Ok'
  },
  cancel: {
    id: 'globalMenu.cancel',
    defaultMessage: 'Cancel'
  },
  removeSite: {
    id: 'globalMenu.removeSite',
    defaultMessage: 'Remove site'
  },
  removeSiteConfirm: {
    id: 'globalMenu.removeSiteConfirm',
    defaultMessage: 'Do you want to remove {site}?'
  }
});

interface TileProps {
  icon: ElementType<any> | string;
  title: string;
  id?: string;

  onItemClick(id: string): any;
}

function Tile(props: TileProps) {
  const {id, title, icon: Icon, onItemClick} = props;
  const classes = useStyles({});

  return (
    <div className={classes.tile} onClick={() => onItemClick(id)}>
      {
        typeof Icon === 'string'
          ? <i className={clsx(classes.icon, `fa ${Icon}`)}></i>
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
  const [menuItems, setMenuItems] = useState([]);
  const [currentSite, setCurrentSite] = useState(null);
  const [confirmation, setConfirmation] = React.useState({
    open: false,
    id: null,
  });
  const [apiState, setApiState] = useState({
    error: false,
    errorResponse: null
  });

  const globalNavUrlMapping = {
    'home.globalMenu.logging-levels': 'logging',
    'home.globalMenu.log-console': 'log',
    'home.globalMenu.users': 'users',
    'home.globalMenu.sites': 'sites',
    'home.globalMenu.audit': 'audit',
    'home.globalMenu.groups': 'groups',
    'home.globalMenu.globalConfig': 'global-config',
    'home.globalMenu.cluster': 'cluster',
  };

  const cardActions = [
    {
      name: formatMessage(messages.preview),
      confirm: false,
      onClick: onPreviewClick
    },
    {
      name: formatMessage(messages.dashboard),
      confirm: false,
      onClick: onPreviewClick
    },
    {
      name: formatMessage(messages.remove),
      confirm: true,
      onClick: confirmDialog
    },
  ];

  function handleClose() {
    setOpen(false);
  }

  function onItemClick(id: string) {
    console.log(globalNavUrlMapping[id])
    const url = `/#/globalMenu/${globalNavUrlMapping[id]}`;
    const base = window.location.host.replace('3000', '8080');
    window.location.href = `//${base}/studio${url}`;
  }

  function onCardClick(id: string) {
    setCurrentSite(id);
  }

  function onPreviewClick(id: string) {
    if (!id) {
      id = sites[0].siteId;
      if (currentSite) {
        id = currentSite;
      }
    }
    Cookies.set('crafterSite', id, {
      domain: window.location.hostname.includes('.') ? window.location.hostname : '',
      path: '/'
    });
    const url = `/preview/#/?page=/&site=${id}`;
    const base = window.location.host.replace('3000', '8080');
    window.location.href = `//${base}/studio${url}`;
  }

  function onDashboardClick(id: string) {
    if (!id) {
      id = sites[0].siteId;
      if (currentSite) {
        id = currentSite;
      }
    }
    Cookies.set('crafterSite', id, {
      domain: window.location.hostname.includes('.') ? window.location.hostname : '',
      path: '/'
    });
    const url = '/studio/site-dashboard';
    const base = window.location.host.replace('3000', '8080');
    window.location.href = `//${base}${url}`;
  }

  function confirmDialog(id: string) {
    setConfirmation({open: true, id});
  }

  const handleConfirmCancel = () => {
    setConfirmation({...confirmation, open: false});
  };

  function handleErrorBack() {
    setApiState({...apiState, error: false});
  }

  const handleConfirmOk = () => {
    let id = confirmation.id;
    setConfirmation({...confirmation, open: false});
    deleteSite(id).subscribe(
      () => {
        fetchSites().subscribe(
          ({response}) => {
            setSites(response.sites);
          }
        );
      },
      ({response}) => {
        const _response = {...response, code: '', documentationUrl: '', remedialAction: ''};
        setApiState({...apiState, error: true, errorResponse: _response});
      }
    )
  };

  useEffect(() => {
    fetchSites().subscribe(
      ({response}) => {
        setSites(response.sites);
      }
    );
    getGlobalMenuitems().subscribe(
      ({response}) => {
        setMenuItems(response.menuItems);
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
      {
        apiState.error ? (
          <ErrorState
            classes={{root: classes.errorPaperRoot}}
            error={apiState.errorResponse}
            onBack={handleErrorBack}
          />
        ) : (
          <>
            <Grid container spacing={0}>
              <Grid item xs={5} className={classes.sitesPanel}>
                <Typography variant="h6" gutterBottom className={classes.title}>
                  {formatMessage(messages.mySites)}
                </Typography>
                {
                  sites.map((site, i) =>
                    <TitleCard key={i} title={site.siteId} options={true} classes={{root: classes.titleCard}}
                               onCardClick={onCardClick} cardActions={cardActions}/>
                  )
                }
              </Grid>
              <Grid item xs={7} className={classes.sitesContent}>
                {currentSite}
                <TitleCard title={formatMessage(messages.myDashboard)} icon={HomeIcon}
                           classes={{root: classes.titleCard}}
                           onCardClick={onDashboardClick}/>
                <Typography variant="h6" gutterBottom className={classes.title}>
                  {formatMessage(messages.apps)}
                </Typography>
                <div className={classes.sitesApps}>
                  <Tile title={formatMessage(messages.preview)} icon='fa fa-eye' onItemClick={onPreviewClick}/>
                  {
                    menuItems.map((item, i) =>
                      <Tile key={i} title={item.label} icon={item.icon} id={item.id} onItemClick={onItemClick}/>
                    )
                  }
                </div>
              </Grid>
            </Grid>
            <ConfirmDialog
              open={confirmation.open}
              onOk={handleConfirmOk}
              onClose={handleConfirmCancel}
              description={formatMessage(messages.removeSiteConfirm, {site: confirmation.id})}
              title={formatMessage(messages.removeSite)}
            />
          </>
        )
      }
    </Popover>
  )
}
