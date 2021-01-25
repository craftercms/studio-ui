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
import { TableBody } from '@material-ui/core';
import { AsDayMonthDateTime } from '../../modules/Content/History/VersionList';

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

  const [plugins, setPlugins] = useState<PluginRecord[]>(null);

  useEffect(() => {
    setPlugins([
      {
        id: 'test',
        version: {
          major: 1,
          minor: 2,
          patch: 3
        },
        pluginUrl: '/testing',
        installationDate: moment()
      }
    ]);
  }, []);

  const onSearchPlugin = () => {};

  return (
    <section>
      <Typography variant="h4" component="h1" className={classes.title}>
        <FormattedMessage id="PluginManagement.title" defaultMessage="Token Management" />
      </Typography>
      <Divider />
      <SecondaryButton startIcon={<AddIcon />} className={classes.createToken} onClick={onSearchPlugin}>
        <FormattedMessage id="PluginManagement.searchPlugin" defaultMessage="Search & install" />
      </SecondaryButton>
      <Divider />
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
                  <StyledTableCell align="left">{plugin.version.major}</StyledTableCell>
                  <StyledTableCell align="left">{plugin.pluginUrl}</StyledTableCell>
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
    </section>
  );
};

export default PluginManagement;
