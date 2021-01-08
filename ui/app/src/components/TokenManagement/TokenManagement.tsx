/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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
import {
  Button,
  Checkbox,
  Chip,
  Divider,
  IconButton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Theme,
  Typography
} from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import { createStyles, makeStyles, withStyles } from '@material-ui/core/styles';
import palette from '../../styles/palette';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/DeleteOutline';
import { AsDayMonthDateTime } from '../../modules/Content/History/VersionList';
import { deleteToken, getTokens, updateToken } from '../../services/token';
import { useDispatch } from 'react-redux';
import { showCreateTokenDialog } from '../../state/actions/dialogs';
import { Token } from '../../models/Token';

const styles = makeStyles((theme) =>
  createStyles({
    title: {
      marginBottom: '25px'
    },
    createToken: {
      margin: '10px 0',
      borderRadius: '50px',
      border: 0,
      boxShadow: '0 3px 1px -2px rgba(0,0,0,0.2), 0 2px 2px 0 rgba(0,0,0,0.14), 0 1px 5px 0 rgba(0,0,0,0.12)',
      padding: '5px 25px'
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
    },
    chip: {
      backgroundColor: palette.green.light,
      height: 'auto',
      padding: '4px 6.5px'
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

export default function TokenManagement() {
  const classes = styles();
  // TODO: Should the tokens be on the store??
  const [tokens, setTokens] = useState<Token[]>([]);
  const dispatch = useDispatch();

  useEffect(() => {
    getTokens().subscribe((tokens) => {
      setTokens(tokens);
    });
  }, []);

  const onCreateToken = () => {
    dispatch(showCreateTokenDialog({}));
  };

  const onSetEnabled = (id: number, checked: boolean) => {
    // TODO: Move to reducer/epics??;
    updateToken(id, {
      enabled: checked
    }).subscribe((token) => {
      console.log(token);
    });
  };

  const onDeleteToken = (id: number) => {
    // TODO: Move to reducer/epics??;
    deleteToken(id).subscribe((token) => {
      console.log(token);
    });
  };

  return (
    <section>
      <Typography variant="h4" component="h1" className={classes.title}>
        <FormattedMessage id="GlobalMenu.TokenManagement" defaultMessage="Token Management" />
      </Typography>
      <Divider />
      <Button variant="outlined" startIcon={<AddIcon />} className={classes.createToken} onClick={onCreateToken}>
        <FormattedMessage id="tokenManagement.createToken" defaultMessage="Create Token" />
      </Button>
      <Divider />
      <TableContainer className={classes.tableWrapper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  defaultChecked
                  indeterminate
                  color="primary"
                  inputProps={{ 'aria-label': 'select all checkbox' }}
                />
              </TableCell>
              <TableCell align="left" padding="none">
                <Typography variant="subtitle2">
                  <FormattedMessage id="words.status" defaultMessage="Status" />
                </Typography>
              </TableCell>
              <StyledTableCell align="left">
                <Typography variant="subtitle2">
                  <FormattedMessage id="words.label" defaultMessage="Label" />
                </Typography>
              </StyledTableCell>
              <StyledTableCell align="left">
                <Typography variant="subtitle2">
                  <FormattedMessage id="words.expiration" defaultMessage="Expiration" />
                </Typography>
              </StyledTableCell>
              <StyledTableCell align="left">
                <Typography variant="subtitle2">
                  <FormattedMessage id="words.created" defaultMessage="Created" />
                </Typography>
              </StyledTableCell>
              <TableCell align="center" className={classes.actions} />
            </TableRow>
          </TableHead>
          <TableBody>
            {tokens.map((token) => (
              <TableRow key={token.id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={token.enabled}
                    color="primary"
                    inputProps={{ 'aria-label': 'select checkbox' }}
                    onChange={(event, checked) => {
                      onSetEnabled(token.id, checked);
                    }}
                  />
                </TableCell>
                <TableCell component="th" id={token.id.toString()} scope="row" padding="none">
                  <Chip label={token.enabled ? 'Enabled' : 'Disabled'} className={classes.chip} />
                </TableCell>
                <StyledTableCell align="left">{token.label}</StyledTableCell>
                <StyledTableCell align="left">
                  <AsDayMonthDateTime date={token.expiresAt} />
                </StyledTableCell>
                <StyledTableCell align="left">
                  <AsDayMonthDateTime date={token.createdOn} />
                </StyledTableCell>
                <TableCell align="center" className={classes.actions}>
                  <Switch
                    checked={token.enabled}
                    onChange={(e, checked) => {
                      onSetEnabled(token.id, checked);
                    }}
                    color="primary"
                    name="status"
                    inputProps={{ 'aria-label': 'status checkbox' }}
                  />
                  <IconButton
                    onClick={() => {
                      onDeleteToken(token.id);
                    }}
                  >
                    <DeleteIcon color="primary" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </section>
  );
}
