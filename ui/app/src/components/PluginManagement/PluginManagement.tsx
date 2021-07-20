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

import Typography from '@material-ui/core/Typography';
import React, { useCallback, useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import AddIcon from '@material-ui/icons/Add';
import { createStyles, makeStyles, Theme, withStyles } from '@material-ui/core/styles';
import { PluginRecord } from '../../models/Plugin';
import { ConditionalLoadingState } from '../SystemStatus/LoadingState';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import { Button, ListSubheader, TableBody } from '@material-ui/core';
import { AsDayMonthDateTime } from '../../modules/Content/History/VersionList';
import EmptyState from '../SystemStatus/EmptyState';
import InstallPluginDialog from '../MarketplaceDialog';
import { MarketplacePlugin } from '../../models/MarketplacePlugin';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import Popover from '@material-ui/core/Popover';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { useDispatch } from 'react-redux';
import { fetchInstalledMarketplacePlugins } from '../../services/marketplace';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { getUserPermissions } from '../../services/security';
import { emitSystemEvent, pluginInstalled, showSystemNotification } from '../../state/actions/system';
import LookupTable from '../../models/LookupTable';
import { createLookupTable } from '../../utils/object';
import GlobalState from '../../models/GlobalState';
import GlobalAppToolbar from '../GlobalAppToolbar';
import { useSelection } from '../../utils/hooks/useSelection';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { useMount } from '../../utils/hooks/useMount';
import { batchActions } from '../../state/actions/misc';

const messages = defineMessages({
  pluginInstalled: {
    id: 'PluginManagement.pluginInstalled',
    defaultMessage: 'Plugin installed successfully'
  }
});

const styles = makeStyles((theme) =>
  createStyles({
    table: {
      minWidth: 650
    },
    actions: {
      width: '150px',
      padding: '5px 20px'
    }
  })
);

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: '5px'
    }
  })
)(TableCell);

interface PluginManagementProps {
  embedded?: boolean;
}

export const PluginManagement = (props: PluginManagementProps) => {
  const { embedded = false } = props;
  const classes = styles();
  const dispatch = useDispatch();
  const siteId = useActiveSiteId();
  const { formatMessage } = useIntl();
  const [plugins, setPlugins] = useState<PluginRecord[]>(null);
  const [permissions, setPermissions] = useState<string[]>(null);
  const [openMarketPlaceDialog, setOpenMarketPlaceDialog] = useState(null);
  const listPluginsPermission = permissions?.includes('list_plugins');
  const installPluginsPermission = permissions?.includes('install_plugins');
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [pluginFiles, setPluginFiles] = React.useState<PluginRecord>(null);
  const [installedPluginsLookup, setInstalledPluginsLookup] = useState<LookupTable<PluginRecord>>();
  const locale = useSelection<GlobalState['uiConfig']['locale']>((state) => state.uiConfig.locale);

  useMount(() => {
    getUserPermissions(siteId, '/').subscribe((permissions) => {
      setPermissions(permissions);
    });
  });

  const refresh = useCallback(
    () =>
      fetchInstalledMarketplacePlugins(siteId).subscribe(
        (plugins) => {
          setPlugins(plugins);
          setInstalledPluginsLookup(createLookupTable(plugins, 'id'));
        },
        (error) => {
          dispatch(
            showErrorDialog({
              error
            })
          );
        }
      ),
    [dispatch, siteId]
  );

  useEffect(() => {
    if (listPluginsPermission && siteId) {
      refresh();
    }
  }, [dispatch, listPluginsPermission, refresh, siteId]);

  const onSearchPlugin = () => {
    setOpenMarketPlaceDialog({
      installPermission: installPluginsPermission
    });
  };

  const onInstallMarketplacePlugin = (plugin: MarketplacePlugin) => {
    dispatch(
      batchActions([
        showSystemNotification({
          message: formatMessage(messages.pluginInstalled)
        }),
        emitSystemEvent(pluginInstalled())
      ])
    );
    refresh();
  };

  const onCloseMarketplaceDialog = () => {
    setOpenMarketPlaceDialog(null);
  };

  const showPluginFiles = (event: React.MouseEvent<HTMLButtonElement>, plugin: PluginRecord) => {
    setPluginFiles(plugin);
    setAnchorEl(event.currentTarget);
  };

  const closePluginFilesPopover = () => {
    setAnchorEl(null);
  };

  return (
    <section>
      <GlobalAppToolbar
        title={
          !embedded && (
            <FormattedMessage id="globalMenu.pluginManagementEntryLabel" defaultMessage="Plugin Management" />
          )
        }
        showAppsButton={!embedded}
        showHamburgerMenuButton={!embedded}
        styles={
          embedded && {
            leftContent: {
              marginLeft: 0
            }
          }
        }
        leftContent={
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            color="primary"
            onClick={onSearchPlugin}
            disabled={permissions === null || listPluginsPermission === false}
          >
            {installPluginsPermission ? (
              <FormattedMessage id="pluginManagement.searchPlugin" defaultMessage="Search & install" />
            ) : (
              <FormattedMessage id="words.search" defaultMessage="Search" />
            )}
          </Button>
        }
      />
      {permissions && listPluginsPermission === false ? (
        <EmptyState
          title={
            <FormattedMessage
              id="pluginManagement.listPluginPermission"
              defaultMessage="You don't have enough permissions to see the list of plugins"
            />
          }
        />
      ) : (
        <ConditionalLoadingState isLoading={plugins === null}>
          <TableContainer>
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell align="left">
                    <Typography variant="subtitle2">
                      <FormattedMessage id="words.id" defaultMessage="Id" />
                    </Typography>
                  </TableCell>
                  <StyledTableCell align="left">
                    <Typography variant="subtitle2">
                      <FormattedMessage id="words.version" defaultMessage="Version" />
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="left">
                    <Typography variant="subtitle2">
                      <FormattedMessage id="words.url" defaultMessage="Url" />
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="left">
                    <Typography variant="subtitle2">
                      <FormattedMessage id="words.files" defaultMessage="Files" />
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="left">
                    <Typography variant="subtitle2">
                      <FormattedMessage id="pluginManagement.installationDate" defaultMessage="Installation Date" />
                    </Typography>
                  </StyledTableCell>
                  <TableCell align="center" className={classes.actions} />
                </TableRow>
              </TableHead>
              <TableBody>
                {plugins?.map((plugin) => (
                  <TableRow key={plugin.id}>
                    <TableCell component="th" id={plugin.id} scope="row">
                      {plugin.id}
                    </TableCell>
                    <StyledTableCell align="left">
                      {plugin.version.major}.{plugin.version.minor}.{plugin.version.patch}
                    </StyledTableCell>
                    <StyledTableCell align="left">{plugin.pluginUrl}</StyledTableCell>
                    <StyledTableCell align="left">
                      {plugin.files.length}
                      <IconButton onClick={(e) => showPluginFiles(e, plugin)} size="small">
                        <ExpandMoreRoundedIcon />
                      </IconButton>
                    </StyledTableCell>
                    <StyledTableCell align="left">
                      <AsDayMonthDateTime date={plugin.installationDate} locale={locale} />
                    </StyledTableCell>
                    <TableCell align="right" className={classes.actions} />
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {plugins?.length === 0 && (
            <EmptyState
              title={
                <FormattedMessage id="pluginManagement.emptyList" defaultMessage="There are no plugins installed" />
              }
            />
          )}
        </ConditionalLoadingState>
      )}
      <InstallPluginDialog
        open={Boolean(openMarketPlaceDialog)}
        onClose={onCloseMarketplaceDialog}
        onInstall={onInstallMarketplacePlugin}
        installedPlugins={installedPluginsLookup}
        installPermission={openMarketPlaceDialog?.installPermission}
      />
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={closePluginFilesPopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
      >
        <List
          dense
          subheader={
            <ListSubheader>
              <FormattedMessage id="words.files" defaultMessage="Files" />
            </ListSubheader>
          }
        >
          {pluginFiles?.files.map((file, i) => (
            <ListItem key={i}>
              <ListItemText primary={file.path} />
            </ListItem>
          ))}
        </List>
      </Popover>
    </section>
  );
};

export default PluginManagement;
