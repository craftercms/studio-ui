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

import React, { useState } from 'react';
import RecycleBinGridUI from './RecycleBinGridUI';
import Box from '@mui/material/Box';
import { ViewToolbar } from '../ViewToolbar';
import { makeStyles } from 'tss-react/mui';
import { Theme } from '@mui/material/styles';
import { SearchBar } from '../SearchBar';
import { ActionsBar } from '../ActionsBar';
import useEnhancedDialogState from '../../hooks/useEnhancedDialogState';
import useWithPendingChangesCloseRequest from '../../hooks/useWithPendingChangesCloseRequest';
import { RecycleBinPackageDialog } from '../RecycleBinPackageDialog';
import { recycleBinPackages } from './utils';
import { useIntl } from 'react-intl';
import { translations } from './translations';

export const useStyles = makeStyles()((theme: Theme) => ({
  searchBarContainer: {
    width: '30%',
    [theme.breakpoints.up('md')]: {
      minWidth: '500px'
    }
  },
  searchPaper: {
    flex: 1
  },
  actionsBarRoot: {
    left: '0',
    right: '0',
    zIndex: 2,
    position: 'absolute'
  },
  actionsBarCheckbox: {
    margin: '7px 2px'
  },
  recycleBinPackageDialogFooter: {
    justifyContent: 'space-between'
  },
  itemTableContainer: {
    borderTop: `1px solid ${theme.palette.divider}`
  },
  noBorder: {
    border: 'none !important'
  }
}));

// TODO: embedded prop
export function RecycleBin() {
  const { classes } = useStyles();
  const [pageSize, setPageSize] = useState(10);
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [recycleBinPackage, setRecycleBinPackage] = useState(null);
  const isAllChecked = recycleBinPackages.length > 0 && selectedPackages.length === recycleBinPackages.length;
  const isIndeterminate = selectedPackages.length > 0 && selectedPackages.length < recycleBinPackages.length;
  const { formatMessage } = useIntl();

  const recycleBinPackageDialogState = useEnhancedDialogState();
  const recycleBinPackageDialogPendingChangesCloseRequest = useWithPendingChangesCloseRequest(
    recycleBinPackageDialogState.onClose
  );

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

  return (
    <Box>
      <ViewToolbar styles={{ toolbar: { justifyContent: 'center' } }}>
        <section className={classes.searchBarContainer}>
          <SearchBar
            onChange={() => {}}
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
            onOptionClicked={() => {
              console.log('option clicked');
            }}
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
      <RecycleBinPackageDialog
        open={recycleBinPackageDialogState.open}
        onClose={recycleBinPackageDialogState.onClose}
        recycleBinPackage={recycleBinPackage}
        onWithPendingChangesCloseRequest={recycleBinPackageDialogPendingChangesCloseRequest}
        onSubmittingAndOrPendingChange={recycleBinPackageDialogState.onSubmittingAndOrPendingChange}
      />
    </Box>
  );
}

export default RecycleBin;
