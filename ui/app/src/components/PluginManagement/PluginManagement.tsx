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

import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import SecondaryButton from '../SecondaryButton';
import AddIcon from '@material-ui/icons/Add';
import { createStyles, makeStyles, Theme, withStyles } from '@material-ui/core/styles';
import { PluginRecord } from '../../models/Plugin';
import moment from 'moment-timezone';
import { ConditionalLoadingState } from '../SystemStatus/LoadingState';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Checkbox from '@material-ui/core/Checkbox';
import { ListSubheader, TableBody } from '@material-ui/core';
import { AsDayMonthDateTime } from '../../modules/Content/History/VersionList';
import { useActiveSiteId, usePermissions } from '../../utils/hooks';
import EmptyState from '../SystemStatus/EmptyState';
import MarketplaceDialog from '../MarketplaceDialog';
import { MarketplacePlugin } from '../../models/MarketplacePlugin';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import Popover from '@material-ui/core/Popover';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { useDispatch } from 'react-redux';

const styles = makeStyles((theme) =>
  createStyles({
    title: {
      marginBottom: '25px'
    },
    createToken: {
      margin: '10px 0',
      borderRadius: '50px',
      border: 0,
      padding: '5px 25px',
      boxShadow: '0px 3px 5px 0px rgba(0, 0, 0, 0.2)'
    },
    tableWrapper: {
      marginTop: '25px'
    },
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

export const PluginManagement = () => {
  const classes = styles();
  const dispatch = useDispatch();
  const permissions = usePermissions();
  const siteId = useActiveSiteId();
  const [plugins, setPlugins] = useState<PluginRecord[]>(null);
  const [openMarketPlaceDialog, setOpenMarketPlaceDialog] = useState<boolean>(false);
  const listPlugins = permissions?.['/']['list_plugins'] ?? true;
  const installPlugins = permissions?.['/']['install_plugins'] ?? true;
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [pluginFiles, setPluginFiles] = React.useState<PluginRecord>(null);

  useEffect(() => {
    if (listPlugins && siteId) {
      // fetchInstalledMarketplacePlugins(siteId).subscribe(
      //   (plugins) => {
      //     setPlugins(plugins);
      //   },
      //   (error) => {
      //     dispatch(
      //       showErrorDialog({
      //         error
      //       })
      //     );
      //   }
      // );
      setPlugins([
        {
          id: 'test',
          version: {
            major: 1,
            minor: 1,
            patch: 21
          },
          pluginUrl: '/testing',
          installationDate: moment(),
          files: [
            {
              path: 'test/testing/tremendo',
              sha512: 'sha512a'
            },
            {
              path: '/test/testing/default',
              sha512: 'sha512b'
            }
          ]
        }
      ]);
    }
  }, [dispatch, listPlugins, siteId]);

  const onSearchPlugin = () => {
    if (installPlugins) {
      setOpenMarketPlaceDialog(true);
    }
  };

  const onInstallMarketplacePlugin = (plugin: MarketplacePlugin) => {};

  const onCloseMarketplaceDialog = () => {
    setOpenMarketPlaceDialog(false);
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
      <Typography variant="h4" component="h1" className={classes.title}>
        <FormattedMessage id="PluginManagement.title" defaultMessage="Plugin Management" />
      </Typography>
      <Divider />
      <SecondaryButton
        startIcon={<AddIcon />}
        className={classes.createToken}
        onClick={onSearchPlugin}
        disabled={installPlugins === false}
      >
        <FormattedMessage id="PluginManagement.searchPlugin" defaultMessage="Search & install" />
      </SecondaryButton>
      <Divider />
      {listPlugins === false ? (
        <EmptyState
          title={
            <FormattedMessage
              id="PluginManagement.listPluginPermission"
              defaultMessage="You don't have enough permissions to see the list of plugins"
            />
          }
        />
      ) : (
        <ConditionalLoadingState isLoading={plugins === null}>
          <TableContainer className={classes.tableWrapper}>
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox color="primary" />
                  </TableCell>
                  <TableCell align="left" padding="none">
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
                      <FormattedMessage id="PluginManagement.installationDate" defaultMessage="Installation Date" />
                    </Typography>
                  </StyledTableCell>
                  <TableCell align="center" className={classes.actions} />
                </TableRow>
              </TableHead>
              <TableBody>
                {plugins?.map((plugin) => (
                  <TableRow key={plugin.id}>
                    <TableCell padding="checkbox">
                      <Checkbox color="primary" />
                    </TableCell>
                    <TableCell component="th" id={plugin.id} scope="row" padding="none">
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
                      <AsDayMonthDateTime date={plugin.installationDate} />
                    </StyledTableCell>
                    <TableCell align="right" className={classes.actions}></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </ConditionalLoadingState>
      )}
      <MarketplaceDialog
        open={openMarketPlaceDialog}
        onClose={onCloseMarketplaceDialog}
        onInstall={onInstallMarketplacePlugin}
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
