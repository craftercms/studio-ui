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

import { RecycleBinRestoreDialogContainerProps } from './utils';
import { useEffect, useState } from 'react';
import { validateRestoreMock } from '../../services/content';
import { ApiResponse } from '../../models';
import { DialogBody } from '../DialogBody';
import { DialogFooter } from '../DialogFooter';
import { ApiResponseErrorState } from '../ApiResponseErrorState';
import { LoadingState } from '../LoadingState';
import DialogContentText from '@mui/material/DialogContentText';
import { FormattedMessage } from 'react-intl';
import List from '@mui/material/List';
import { ListItem } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import PrimaryButton from '../PrimaryButton';
import SecondaryButton from '../SecondaryButton';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import SettingsBackupRestoreOutlinedIcon from '@mui/icons-material/SettingsBackupRestoreOutlined';
import { getStyles } from './styles';

export function RecycleBinRestoreDialogContainer(props: RecycleBinRestoreDialogContainerProps) {
  const { restorePackage, onRestore, onClose, isSubmitting } = props;
  const [conflicts, setConflicts] = useState(null);
  const [fetchingValidation, setFetchingValidation] = useState(false);
  const [error, setError] = useState<ApiResponse>(null);
  const sx = getStyles();

  useEffect(() => {
    setFetchingValidation(true);
    if (restorePackage) {
      validateRestoreMock(restorePackage.id).subscribe({
        next(response: any) {
          setConflicts(response.conflicts ?? []);
          setFetchingValidation(false);
        },
        error(error) {
          setError(error);
          setFetchingValidation(false);
        }
      });
    }
  }, [restorePackage]);

  const restorePackages = () => {
    onRestore(conflicts);
  };

  return (
    <>
      <DialogBody>
        {error ? (
          <ApiResponseErrorState error={error} />
        ) : fetchingValidation && !conflicts ? (
          <LoadingState />
        ) : (
          <>
            <DialogContentText color="textPrimary" variant="body1">
              <SettingsBackupRestoreOutlinedIcon sx={sx.confirmTitleIcon} />
              <FormattedMessage
                id="recycleBin.confirmRestoring"
                defaultMessage="Confirm the restoring of the package listed below"
              />
            </DialogContentText>
            {/* TODO: update this: not a list anymore */}
            <List dense sx={sx.itemsListRoot}>
              <ListItem sx={sx.listItem}>
                <ListItemText primary={restorePackage.comment} />
              </ListItem>
            </List>

            {conflicts?.length > 0 && (
              <>
                <Divider sx={sx.divider} />

                <Typography variant="subtitle1" sx={sx.conflictsTitle}>
                  <FormattedMessage id="words.conflicts" defaultMessage="Conflicts" />
                </Typography>

                <TableContainer sx={sx.conflictsTableContainer}>
                  <Table sx={sx.conflictsTableRoot}>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <FormattedMessage id="recycleBin.conflictingPath" defaultMessage="Conflicting path" />
                        </TableCell>
                        <TableCell>
                          <FormattedMessage id="recycleBin.resolvedPath" defaultMessage="Resolved path" />
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {conflicts?.map((conflict) => (
                        <TableRow>
                          <TableCell>{conflict.path}</TableCell>
                          <TableCell>{conflict.resolutionStrategies[0].resolvedPath}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </>
        )}
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={(e) => onClose(e, null)}>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton
          onClick={restorePackages}
          autoFocus
          disabled={fetchingValidation || isSubmitting}
          loading={isSubmitting}
        >
          <FormattedMessage id="words.restore" defaultMessage="Restore" />
        </PrimaryButton>
      </DialogFooter>
    </>
  );
}
