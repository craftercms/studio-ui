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

import React, { useCallback, useEffect, useState } from 'react';
import RecycleBinGridUI from './RecycleBinGridUI';
import Box from '@mui/material/Box';
import { ViewToolbar } from '../ViewToolbar';
import { SearchBar } from '../SearchBar';
import { ActionsBar } from '../ActionsBar';
import useEnhancedDialogState from '../../hooks/useEnhancedDialogState';
import useWithPendingChangesCloseRequest from '../../hooks/useWithPendingChangesCloseRequest';
import { RecycleBinPackageDialog } from '../RecycleBinPackageDialog';
import { RecycleBinPackage, RecycleBinProps } from './utils';
import { FormattedMessage, useIntl } from 'react-intl';
import { translations } from './translations';
import UseWithPendingChangesCloseRequest from '../../hooks/useWithPendingChangesCloseRequest';
import { RecycleBinRestoreDialog } from '../RecycleBinRestoreDialog';
import { asArray } from '../../utils/array';
import { fetchRecycleBinPackages, restoreRecycleBinPackages } from '../../services/content';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { useDispatch } from 'react-redux';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { showSystemNotification } from '../../state/actions/system';
import { useStyles } from './styles';
import { GlobalAppToolbar } from '../GlobalAppToolbar';
import { ApiResponseErrorState } from '../ApiResponseErrorState';
import { LoadingState } from '../LoadingState';

export function RecycleBin(props: RecycleBinProps) {
  const { embedded } = props;
  const { classes } = useStyles();
  const [pageSize, setPageSize] = useState(10);
  const [recycleBinPackages, setRecycleBinPackages] = useState<RecycleBinPackage[]>([]);
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [recycleBinPackage, setRecycleBinPackage] = useState(null);
  const [restorePackages, setRestorePackages] = useState([]);
  const isAllChecked = recycleBinPackages.length > 0 && selectedPackages.length === recycleBinPackages.length;
  const isIndeterminate = selectedPackages.length > 0 && selectedPackages.length < recycleBinPackages.length;
  const { formatMessage } = useIntl();
  const siteId = useActiveSiteId();
  const dispatch = useDispatch();
  const [fetchingPackages, setFetchingPackages] = useState(false);
  const [error, setError] = useState();
  const fetchPackages = useCallback((siteId) => {
    setFetchingPackages(true);
    return fetchRecycleBinPackages(siteId).subscribe({
      next(packages) {
        setRecycleBinPackages(packages);
        setFetchingPackages(false);
      },
      error(error) {
        setError(error);
        setFetchingPackages(false);
      }
    });
  }, []);

  const recycleBinPackageDialogState = useEnhancedDialogState();
  const recycleBinPackageDialogPendingChangesCloseRequest = useWithPendingChangesCloseRequest(
    recycleBinPackageDialogState.onClose
  );

  const recycleBinRestoreDialogState = useEnhancedDialogState();
  const recycleBinRestoreDialogPendingChangesCloseRequest = UseWithPendingChangesCloseRequest(
    recycleBinRestoreDialogState.onClose
  );

  useEffect(() => {
    fetchPackages(siteId);
  }, [siteId, fetchPackages]);

  const onToggleCheckedAll = () => {
    if (isAllChecked) {
      setSelectedPackages([]);
    } else {
      const checked = [];
      recycleBinPackages.forEach((recycleBinPackage) => checked.push(recycleBinPackage.id));
      setSelectedPackages(checked);
    }
  };

  const onOpenPackageDetails = (recycleBinPackage) => {
    setRecycleBinPackage(recycleBinPackage);
    recycleBinPackageDialogState.onOpen();
  };

  const onShowRestoreDialog = (packages: RecycleBinPackage[] | RecycleBinPackage) => {
    setRestorePackages(asArray(packages));
    recycleBinRestoreDialogState.onOpen();
  };

  const onRestore = (ids: string[]) => {
    recycleBinRestoreDialogState.onSubmittingAndOrPendingChange({ isSubmitting: true });
    restoreRecycleBinPackages(ids).subscribe({
      next() {
        recycleBinRestoreDialogState.onSubmittingAndOrPendingChange({ isSubmitting: false });
        recycleBinRestoreDialogState.onClose();
        setSelectedPackages([]);
        fetchPackages(siteId);
        dispatch(
          showSystemNotification({
            message: formatMessage(translations.restoreSuccess)
          })
        );
      },
      error(error) {
        dispatch(showErrorDialog({ error }));
        recycleBinRestoreDialogState.onSubmittingAndOrPendingChange({ isSubmitting: false });
      }
    });
  };

  const onActionBarOptionClicked = (option: string) => {
    if (option === 'restore') {
      const packages = recycleBinPackages.filter((recycleBinPackage) =>
        selectedPackages.includes(recycleBinPackage.id)
      );
      onShowRestoreDialog(packages);
    }
  };

  return (
    <Box>
      {!embedded && (
        <GlobalAppToolbar
          title={<FormattedMessage id="recycleBin.title" defaultMessage="Recycle Bin" />}
          showHamburgerMenuButton
          showAppsButton
        />
      )}
      {error ? (
        <ApiResponseErrorState error={error} />
      ) : fetchingPackages ? (
        <LoadingState />
      ) : (
        <>
          <ViewToolbar styles={{ toolbar: { justifyContent: 'center' } }}>
            <section className={classes.searchBarContainer}>
              <SearchBar
                onChange={() => {}} // TODO: pending
                keyword={null}
                showActionButton={false}
                showDecoratorIcon
                classes={{ root: classes.searchPaper }}
              />
            </section>
          </ViewToolbar>
          <Box>
            {(isIndeterminate || isAllChecked) && (
              <ActionsBar
                classes={{
                  root: classes.actionsBarRoot,
                  checkbox: classes.actionsBarCheckbox
                }}
                options={[
                  {
                    id: 'restore',
                    label: formatMessage(translations.restore),
                    icon: { id: '@mui/icons-material/SettingsBackupRestoreOutlined' }
                  },
                  {
                    id: 'publish',
                    label: formatMessage(translations.publishDeletion),
                    icon: { id: '@mui/icons-material/CloudUploadOutlined' }
                  }
                ]}
                isIndeterminate={isIndeterminate}
                isChecked={isAllChecked}
                numOfSkeletonItems={2}
                onOptionClicked={onActionBarOptionClicked}
                onCheckboxChange={onToggleCheckedAll}
              />
            )}
            <RecycleBinGridUI
              packages={recycleBinPackages}
              pageSize={pageSize}
              setPageSize={setPageSize}
              selectedPackages={selectedPackages}
              setSelectedPackages={setSelectedPackages}
              onOpenPackageDetails={onOpenPackageDetails}
            />
          </Box>
        </>
      )}
      <RecycleBinPackageDialog
        open={recycleBinPackageDialogState.open}
        onClose={recycleBinPackageDialogState.onClose}
        recycleBinPackage={recycleBinPackage}
        onRestore={() => {
          recycleBinPackageDialogState.onClose();
          onShowRestoreDialog(recycleBinPackage);
        }}
        onWithPendingChangesCloseRequest={recycleBinPackageDialogPendingChangesCloseRequest}
        onSubmittingAndOrPendingChange={recycleBinPackageDialogState.onSubmittingAndOrPendingChange}
      />
      <RecycleBinRestoreDialog
        open={recycleBinRestoreDialogState.open}
        onClose={recycleBinRestoreDialogState.onClose}
        packages={restorePackages}
        onRestore={onRestore}
        onWithPendingChangesCloseRequest={recycleBinRestoreDialogPendingChangesCloseRequest}
        onSubmittingAndOrPendingChange={recycleBinRestoreDialogState.onSubmittingAndOrPendingChange}
      />
    </Box>
  );
}

export default RecycleBin;
