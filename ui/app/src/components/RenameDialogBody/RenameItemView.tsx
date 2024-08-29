/*
 * Copyright (C) 2007-2023 Crafter Software Corporation. All Rights Reserved.
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

import TextField from '@mui/material/TextField';
import { FormattedMessage } from 'react-intl';
import { isEditableAsset, openItemEditor } from '../../utils/content';
import Typography from '@mui/material/Typography';
import { DependenciesList } from '../DependenciesDialog';
import Alert from '@mui/material/Alert';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import React, { ReactNode } from 'react';
import { DetailedItem } from '../../models';
import { fetchRenameAssetDependants } from '../../state/actions/dialogs';
import useEnv from '../../hooks/useEnv';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { useDispatch } from 'react-redux';
import { LoadingState } from '../LoadingState';
import { ApiResponseErrorState } from '../ApiResponseErrorState';
import IconButton from '@mui/material/IconButton';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { AjaxError } from 'rxjs/ajax';

export interface RenameItemViewProps {
  name: string;
  disabled: boolean;
  newNameExists: boolean;
  dependantItems: DetailedItem[];
  isSubmitting: boolean;
  confirmBrokenReferences: boolean;
  setConfirmBrokenReferences: (value: boolean) => void;
  fetchingDependantItems: boolean;
  error: AjaxError;
  onRename: () => void;
  onInputChanges: (event: React.ChangeEvent<HTMLInputElement>) => void;
  helperText?: ReactNode;
}

export function RenameItemView(props: RenameItemViewProps) {
  const {
    name,
    disabled,
    dependantItems,
    newNameExists,
    isSubmitting,
    confirmBrokenReferences,
    fetchingDependantItems,
    error,
    helperText,
    setConfirmBrokenReferences,
    onRename,
    onInputChanges
  } = props;
  const { authoringBase } = useEnv();
  const siteId = useActiveSiteId();
  const dispatch = useDispatch();

  const handleEditorDisplay = (item: DetailedItem) => {
    openItemEditor(item, authoringBase, siteId, dispatch, fetchRenameAssetDependants());
  };

  return fetchingDependantItems ? (
    <LoadingState
      title={<FormattedMessage defaultMessage="Fetching dependent items" />}
      styles={{ title: { marginTop: 0 } }}
    />
  ) : dependantItems ? (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!disabled) {
            onRename();
          }
        }}
      >
        <TextField
          fullWidth
          label={<FormattedMessage id="renameAsset.rename" defaultMessage="New name" />}
          value={name}
          autoFocus
          required
          error={newNameExists}
          helperText={helperText}
          disabled={isSubmitting}
          margin="normal"
          InputLabelProps={{
            shrink: true
          }}
          onChange={onInputChanges}
          autoComplete="off"
        />
      </form>
      {dependantItems.length > 0 ? (
        <>
          <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
            <FormattedMessage id="renameAsset.dependentItems" defaultMessage="Dependent Items" />
          </Typography>
          <DependenciesList
            dependencies={dependantItems}
            compactView={false}
            showTypes="all-deps"
            renderAction={(dependency) =>
              isEditableAsset(dependency.path) ? (
                <IconButton onClick={() => handleEditorDisplay(dependency)}>
                  <EditRoundedIcon />
                </IconButton>
              ) : null
            }
          />
          <Alert severity="warning" icon={false} sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={confirmBrokenReferences}
                  onChange={() => setConfirmBrokenReferences(!confirmBrokenReferences)}
                  inputProps={{ 'aria-label': 'controlled' }}
                />
              }
              label={
                <FormattedMessage
                  id="renameAsset.confirmBrokenReferences"
                  defaultMessage="I understand that there will be broken references"
                />
              }
            />
          </Alert>
        </>
      ) : (
        <Typography
          variant="body1"
          sx={{
            verticalAlign: 'middle',
            display: 'inline-flex',
            mt: 2
          }}
        >
          <InfoOutlinedIcon
            sx={{
              color: (theme) => theme.palette.text.secondary,
              mr: 1
            }}
          />
          <FormattedMessage id="renameAsset.noDependentItems" defaultMessage="No dependent items" />
        </Typography>
      )}
    </>
  ) : (
    error && <ApiResponseErrorState error={error.response} />
  );
}

export default RenameItemView;
