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

import React, { useEffect, useMemo, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { createStyles, darken, lighten, makeStyles, Theme, withStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/DeleteOutline';
import { AsDayMonthDateTime } from '../../modules/Content/History/VersionList';
import { deleteToken, getTokens, updateToken } from '../../services/tokens';
import { useDispatch } from 'react-redux';
import { Token } from '../../models/Token';
import CreateTokenDialog from '../CreateTokenDialog/CreateTokenDialog';
import clsx from 'clsx';
import { showSystemNotification } from '../../state/actions/system';
import ConfirmDropdown from '../Controls/ConfirmDropdown';
import ActionsBar, { Action } from '../ActionsBar';
import { ConditionalLoadingState } from '../SystemStatus/LoadingState';
import EmptyState from '../SystemStatus/EmptyState';
import CopyTokenDialog from '../CopyTokenDialog/CopyTokenDialog';
import moment from 'moment-timezone';
import { forkJoin } from 'rxjs';
import SecondaryButton from '../SecondaryButton';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import Chip from '@material-ui/core/Chip';
import Switch from '@material-ui/core/Switch';
import { showErrorDialog } from '../../state/reducers/dialogs/error';

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
    },
    actionsBar: {
      position: 'absolute',
      left: 0,
      right: 0,
      zIndex: 1
    },
    chip: {
      backgroundColor:
        theme.palette.type === 'light'
          ? lighten(theme.palette.success.main, 0.9)
          : darken(theme.palette.success.main, 0.9),
      height: 'auto',
      padding: '4px 6.5px',
      '&.disabled': {
        backgroundColor:
          theme.palette.type === 'light'
            ? lighten(theme.palette.warning.main, 0.9)
            : darken(theme.palette.warning.main, 0.9)
      },
      '&.expired': {
        backgroundColor:
          theme.palette.type === 'light'
            ? lighten(theme.palette.error.main, 0.9)
            : darken(theme.palette.error.main, 0.9)
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
    defaultMessage: 'Token created and copied to clipboard'
  },
  tokenCopied: {
    id: 'tokenManagement.copied',
    defaultMessage: 'Token copied to clipboard'
  },
  tokenDeleted: {
    id: 'tokenManagement.deleted',
    defaultMessage: '{count, plural, one {Token deleted} other {The selected tokens were deleted}}'
  },
  tokenUpdated: {
    id: 'tokenManagement.updated',
    defaultMessage: 'Token updated'
  },
  never: {
    id: 'words.never',
    defaultMessage: 'Never'
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
  },
  deletedSelected: {
    id: 'tokenManagement.deletedSelected',
    defaultMessage: 'Delete Selected'
  },
  clearSelected: {
    id: 'tokenManagement.clearSelected',
    defaultMessage: 'Clear Selected ({count})'
  },
  emptyTokens: {
    id: 'tokenManagement.emptyTokens',
    defaultMessage: 'There are no tokens, click on Create Token to add a new one'
  }
});

export default function TokenManagement() {
  const classes = styles();
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const [tokens, setTokens] = useState<Token[]>(null);
  const [checkedLookup, setCheckedLookup] = useState({});
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [createdToken, setCreatedToken] = useState<Token>(null);
  const checkedCount = useMemo(() => Object.values(checkedLookup).filter(Boolean).length, [checkedLookup]);
  const options = useMemo(
    () => [
      {
        id: 'delete',
        label: formatMessage(translations.deletedSelected)
      },
      {
        id: 'clear',
        label: formatMessage(translations.clearSelected, { count: checkedCount })
      }
    ],
    [checkedCount, formatMessage]
  );

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

  const onCopyTokenDialogClose = () => {
    setCreatedToken(null);
  };

  const onTokenCreated = (token: Token) => {
    fetchTokens();
    dispatch(
      showSystemNotification({
        message: formatMessage(translations.tokenCreated)
      })
    );
    setOpenCreateDialog(false);
    setCreatedToken(token);
  };

  const onTokenCopied = () => {
    dispatch(
      showSystemNotification({
        message: formatMessage(translations.tokenCopied)
      })
    );
  };

  const onSetEnabled = (id: number, checked: boolean) => {
    const _tokens = { ...tokens };
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
    }).subscribe(
      (token) => {
        fetchTokens();
        dispatch(
          showSystemNotification({
            message: formatMessage(translations.tokenUpdated)
          })
        );
      },
      (response) => {
        setTokens(_tokens);
        dispatch(showErrorDialog({ error: response }));
      }
    );
  };

  const onDeleteToken = (id: number) => {
    const _tokens = { ...tokens };
    setTokens(tokens.filter((token) => token.id !== id));
    setCheckedLookup({
      ...checkedLookup,
      [id]: false
    });
    deleteToken(id).subscribe(
      (token) => {
        fetchTokens();
        dispatch(
          showSystemNotification({
            message: formatMessage(translations.tokenDeleted, { count: 1 })
          })
        );
      },
      (response) => {
        setTokens(_tokens);
        setCheckedLookup({
          ...checkedLookup,
          [id]: false
        });
        dispatch(showErrorDialog({ error: response }));
      }
    );
  };

  const onOptionClicked = (action: Action) => {
    switch (action.id) {
      case 'delete': {
        const requests = [];
        let checkedIds = [];
        let _checkedLookup = { ...checkedLookup };
        Object.keys(checkedLookup).forEach((id, i) => {
          if (checkedLookup[id]) {
            checkedIds.push(parseInt(id));
            _checkedLookup[id] = false;
            requests.push(deleteToken(parseInt(id)));
          }
        });

        setCheckedLookup(_checkedLookup);

        setTokens(tokens.filter((token) => !checkedIds.includes(token.id)));

        forkJoin(requests).subscribe(
          (responses) => {
            dispatch(
              showSystemNotification({
                message: formatMessage(translations.tokenDeleted, { count: checkedIds.length })
              })
            );
          },
          (response) => {
            fetchTokens();
            dispatch(showErrorDialog({ error: response }));
          }
        );
        break;
      }
      case 'clear': {
        onToggleSelectAll(false);
        break;
      }
    }
  };

  const onItemChecked = (id: number, checked: boolean) => {
    setCheckedLookup({ ...checkedLookup, [id]: checked });
  };

  const onToggleSelectAll = (check: boolean) => {
    const _checkedLookup = {};
    tokens.forEach((token) => {
      _checkedLookup[token.id] = check;
    });
    setCheckedLookup(_checkedLookup);
  };

  return (
    <section>
      <Typography variant="h4" component="h1" className={classes.title}>
        <FormattedMessage id="GlobalMenu.TokenManagement" defaultMessage="Token Management" />
      </Typography>
      <Divider />
      <SecondaryButton startIcon={<AddIcon />} className={classes.createToken} onClick={onCreateToken}>
        <FormattedMessage id="tokenManagement.createToken" defaultMessage="Create Token" />
      </SecondaryButton>
      <Divider />
      <ConditionalLoadingState isLoading={tokens === null}>
        {tokens?.length ? (
          <TableContainer className={classes.tableWrapper}>
            {checkedCount > 0 && (
              <ActionsBar
                onOptionClicked={onOptionClicked}
                options={options}
                isIndeterminate={checkedCount > 0 && checkedCount < tokens.length}
                isChecked={checkedCount === tokens.length}
                toggleSelectAll={() => onToggleSelectAll(checkedCount !== tokens.length)}
                classes={{
                  root: classes.actionsBar
                }}
              />
            )}
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      disabled={checkedCount > 0}
                      checked={false}
                      color="primary"
                      onClick={() => {
                        onToggleSelectAll(true);
                      }}
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
                        checked={!!checkedLookup[token.id]}
                        color="primary"
                        onChange={(event, checked) => {
                          onItemChecked(token.id, checked);
                        }}
                      />
                    </TableCell>
                    <TableCell component="th" id={token.id.toString()} scope="row" padding="none">
                      <Chip
                        label={
                          Date.parse(token.expiresAt) < Date.now() ? (
                            <FormattedMessage id="words.expired" defaultMessage="Expired" />
                          ) : token.enabled ? (
                            <FormattedMessage id="words.enabled" defaultMessage="Enabled" />
                          ) : (
                            <FormattedMessage id="words.disabled" defaultMessage="Disabled" />
                          )
                        }
                        className={clsx(
                          classes.chip,
                          !token.enabled && 'disabled',
                          moment(token.expiresAt) < moment() && 'expired'
                        )}
                      />
                    </TableCell>
                    <StyledTableCell align="left">{token.label}</StyledTableCell>
                    <StyledTableCell align="left">
                      {token.expiresAt ? (
                        <AsDayMonthDateTime date={token.expiresAt} />
                      ) : (
                        <Typography color="textSecondary" variant="body2">
                          ({formatMessage(translations.never).toLowerCase()})
                        </Typography>
                      )}
                    </StyledTableCell>
                    <StyledTableCell align="left">
                      <AsDayMonthDateTime date={token.createdOn} />
                    </StyledTableCell>
                    <TableCell align="right" className={classes.actions}>
                      {(token.expiresAt === null || moment(token.expiresAt) > moment()) && (
                        <Switch
                          checked={token.enabled}
                          onChange={(e, checked) => {
                            onSetEnabled(token.id, checked);
                          }}
                          color="primary"
                        />
                      )}
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
        ) : (
          <EmptyState title={formatMessage(translations.emptyTokens)} />
        )}
      </ConditionalLoadingState>
      <CreateTokenDialog open={openCreateDialog} onCreated={onTokenCreated} onClose={onCreateTokenDialogClose} />
      <CopyTokenDialog
        open={Boolean(createdToken)}
        token={createdToken}
        onClose={onCopyTokenDialogClose}
        onCopy={onTokenCopied}
      />
    </section>
  );
}
