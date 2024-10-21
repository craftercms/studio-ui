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

import { RepositoryStatus } from '../../../models/Repository';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import GlobalAppGridRow from '../../GlobalAppGridRow';
import GlobalAppGridCell from '../../GlobalAppGridCell';
import Typography from '@mui/material/Typography';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { makeStyles } from 'tss-react/mui';
import Button from '@mui/material/Button';
import ConfirmDropdown from '../../ConfirmDropdown';
import GlobalAppToolbar from '../../GlobalAppToolbar';
import { messages } from './translations';
import Alert from '@mui/material/Alert';
import translations from '../translations';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import { DropDownMenu } from '../../DropDownMenuButton';

export interface RepoStatusUIProps {
  status: RepositoryStatus;
  onCommitClick(): void;
  onResolveConflict(strategy: string, path: string): void;
  onDiffClick(path: string): void;
  onBulkAction(e, actionId: string): void;
}

const useStyles = makeStyles()((theme) => ({
  sectionLabel: {
    fontWeight: 400,
    color: theme.palette.success.dark
  },
  conflictedFilesLabel: {
    color: theme.palette.error.dark
  },
  fileName: {
    fontWeight: 600
  },
  revertAllButton: {
    color: theme.palette.error.dark,
    borderColor: theme.palette.error.main,
    marginRight: theme.spacing(2)
  },
  commitButton: {
    color: theme.palette.success.dark,
    borderColor: theme.palette.success.main
  },
  statusNote: {
    color: theme.palette.text.secondary
  },
  conflictActions: {
    textAlign: 'right'
  },
  conflictActionButton: {
    marginRight: theme.spacing(2),
    color: theme.palette.warning.dark,
    borderColor: theme.palette.warning.main
  }
}));

export function RepoStatusUI(props: RepoStatusUIProps) {
  const { status, onCommitClick, onResolveConflict, onDiffClick, onBulkAction } = props;
  const { classes, cx } = useStyles();
  const { formatMessage } = useIntl();
  const hasConflicts = status.conflicting.length > 0;
  const hasConflictsOrUncommitted = hasConflicts || status.uncommittedChanges.length > 0;
  return hasConflictsOrUncommitted ? (
    <>
      <GlobalAppToolbar
        title=""
        subtitle={
          <FormattedMessage
            id="repository.statusNote"
            defaultMessage="Do not use Studio as a git merge and conflict resolution platform. All merge conflicts should be resolved upstream before getting pulled into Studio."
          />
        }
        rightContent={
          <>
            <DropDownMenu
              onMenuItemClick={onBulkAction}
              variant="outlined"
              options={[
                {
                  id: 'acceptAll',
                  primaryText: <FormattedMessage defaultMessage="Accept all Remote" />,
                  disabled: !hasConflicts
                },
                {
                  id: 'keepAll',
                  primaryText: <FormattedMessage defaultMessage="Keep all Local" />,
                  disabled: !hasConflicts
                },
                {
                  id: 'revertAll',
                  primaryText: <FormattedMessage defaultMessage="Revert all" />
                }
              ]}
              menuProps={{ sx: { minWidth: 180 } }}
              sx={{ mr: 2 }}
            >
              <FormattedMessage defaultMessage="Bulk actions" />
            </DropDownMenu>
            <Button variant="outlined" className={classes.commitButton} onClick={onCommitClick} disabled={hasConflicts}>
              <FormattedMessage id="repositories.commitResolution" defaultMessage="Commit Resolution" />
            </Button>
          </>
        }
        showHamburgerMenuButton={false}
        showAppsButton={false}
        styles={{
          toolbar: {
            '& > section': {
              alignItems: 'start'
            }
          },
          subtitle: {
            whiteSpace: 'normal'
          }
        }}
      />
      <Box padding={2}>
        <Grid container spacing={2}>
          {status.conflicting.length > 0 && (
            <Grid size={{ md: 12 }}>
              <Typography variant="h6" className={cx(classes.sectionLabel, classes.conflictedFilesLabel)}>
                <FormattedMessage id="repository.conflictedFiles" defaultMessage="Conflicted Files" />
              </Typography>
              <TableContainer>
                <Table>
                  <TableBody>
                    {status.conflicting.map((file) => (
                      <GlobalAppGridRow key={file} className="hoverDisabled">
                        <GlobalAppGridCell className="width50">
                          <span className={classes.fileName}>{file.substr(file.lastIndexOf('/') + 1)}</span> - {file}
                        </GlobalAppGridCell>
                        <GlobalAppGridCell className={classes.conflictActions}>
                          <ConfirmDropdown
                            classes={{ button: classes.conflictActionButton }}
                            text={formatMessage(messages.acceptRemote)}
                            cancelText={formatMessage(messages.no)}
                            confirmText={formatMessage(messages.yes)}
                            confirmHelperText={formatMessage(messages.acceptRemoteHelper)}
                            onConfirm={() => onResolveConflict('theirs', file)}
                          />
                          <ConfirmDropdown
                            classes={{ button: classes.conflictActionButton }}
                            text={formatMessage(messages.keepLocal)}
                            cancelText={formatMessage(messages.no)}
                            confirmText={formatMessage(messages.yes)}
                            confirmHelperText={formatMessage(messages.keepLocalHelper)}
                            onConfirm={() => onResolveConflict('ours', file)}
                          />
                          <Button variant="outlined" onClick={() => onDiffClick(file)}>
                            {formatMessage(messages.diff)}
                          </Button>
                        </GlobalAppGridCell>
                      </GlobalAppGridRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ mb: 2 }} />
            </Grid>
          )}
          {status.uncommittedChanges.length > 0 && (
            <Grid size={{ md: 12 }}>
              <Typography variant="h6" className={classes.sectionLabel}>
                <FormattedMessage id="repository.pendingCommit" defaultMessage="Pending Commit" />
              </Typography>
              <TableContainer>
                <Table>
                  <TableBody>
                    {status.uncommittedChanges.map((file) => (
                      <GlobalAppGridRow key={file} className="hoverDisabled">
                        <GlobalAppGridCell>
                          <span className={classes.fileName}>{file.substr(file.lastIndexOf('/') + 1)}</span> - {file}
                        </GlobalAppGridCell>
                      </GlobalAppGridRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}
        </Grid>
      </Box>
    </>
  ) : (
    <Alert severity="success" sx={{ m: 2 }}>
      {formatMessage(translations.noConflicts)}
    </Alert>
  );
}

export default RepoStatusUI;
