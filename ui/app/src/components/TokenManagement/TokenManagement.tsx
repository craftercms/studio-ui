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
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { createStyles, makeStyles, withStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/DeleteOutline';
import { AsDayMonthDateTime } from '../../modules/Content/History/VersionList';
import { deleteToken, getTokens, updateToken } from '../../services/token';
import { useDispatch } from 'react-redux';
import { Token } from '../../models/Token';
import CreateTokenDialog from '../Dialogs/CreateTokenDialog';
import clsx from 'clsx';
import { showSystemNotification } from '../../state/actions/system';
import ConfirmDropdown from '../Controls/ConfirmDropdown';

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
      backgroundColor: theme.palette.success.light,
      height: 'auto',
      padding: '4px 6.5px',
      '&.disabled': {
        backgroundColor: theme.palette.warning.light
      }
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

const translations = defineMessages({
  tokenCreated: {
    id: 'tokenManagement.created',
    defaultMessage: 'Token created'
  },
  tokenDeleted: {
    id: 'tokenManagement.deleted',
    defaultMessage: 'Token deleted'
  },
  tokenUpdated: {
    id: 'tokenManagement.updated',
    defaultMessage: 'Token updated'
  },
  confirmHelperText: {
    id: 'words.helperText',
    defaultMessage: 'Delete "{label}" token?'
  },
  confirmOk: {
    id: 'words.yes',
    defaultMessage: 'Yes'
  },
  confirmCancel: {
    id: 'words.no',
    defaultMessage: 'No'
  }
});

export default function TokenManagement() {
  const classes = styles();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = () => {
    getTokens().subscribe((tokens) => {
      setTokens(tokens);
    });
  };

  const onCreateToken = () => {
    setOpenCreateDialog(true);
  };

  const onCreateTokenDialogClose = () => {
    setOpenCreateDialog(false);
  };

  const onCreateTokenSuccess = (token: Token) => {
    fetchTokens();
    dispatch(
      showSystemNotification({
        message: formatMessage(translations.tokenCreated)
      })
    );
    setOpenCreateDialog(false);
  };

  const onSetEnabled = (id: number, checked: boolean) => {
    setTokens(
      tokens.map((token) => {
        if (token.id === id) {
          return { ...token, enabled: checked };
        } else {
          return token;
        }
      })
    );
    updateToken(id, {
      enabled: checked
    }).subscribe((token) => {
      fetchTokens();
      dispatch(
        showSystemNotification({
          message: formatMessage(translations.tokenUpdated)
        })
      );
    });
  };

  const onDeleteToken = (id: number) => {
    setTokens(tokens.filter((token) => token.id !== id));
    deleteToken(id).subscribe((token) => {
      fetchTokens();
      dispatch(
        showSystemNotification({
          message: formatMessage(translations.tokenDeleted)
        })
      );
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
                <Checkbox defaultChecked indeterminate color="primary" />
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
                    // checked={token.enabled}
                    color="primary"
                    // onChange={(event, checked) => {
                    //   onSetEnabled(token.id, checked);
                    // }}
                  />
                </TableCell>
                <TableCell component="th" id={token.id.toString()} scope="row" padding="none">
                  <Chip
                    label={
                      token.enabled ? (
                        <FormattedMessage id="words.enabled" defaultMessage="Enabled" />
                      ) : (
                        <FormattedMessage id="words.disabled" defaultMessage="Disabled" />
                      )
                    }
                    className={clsx(classes.chip, !token.enabled && 'disabled')}
                  />
                </TableCell>
                <StyledTableCell align="left">{token.label}</StyledTableCell>
                <StyledTableCell align="left">
                  {token.expiresAt ? (
                    <AsDayMonthDateTime date={token.expiresAt} />
                  ) : (
                    <Typography color="textSecondary" variant="body2">
                      (<FormattedMessage id="words.never" defaultMessage="Never" />)
                    </Typography>
                  )}
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
                  />
                  <ConfirmDropdown
                    cancelText={formatMessage(translations.confirmCancel)}
                    confirmText={formatMessage(translations.confirmOk)}
                    confirmHelperText={formatMessage(translations.confirmHelperText, {
                      label: token.label
                    })}
                    icon={DeleteIcon}
                    onConfirm={() => {
                      onDeleteToken(token.id);
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <CreateTokenDialog open={openCreateDialog} onCreated={onCreateTokenSuccess} onClose={onCreateTokenDialogClose} />
    </section>
  );
}
