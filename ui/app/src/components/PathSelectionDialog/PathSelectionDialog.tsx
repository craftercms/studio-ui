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
import Dialog from '@mui/material/Dialog';
import { makeStyles } from 'tss-react/mui';
import { withoutIndex } from '../../utils/path';
import StandardAction from '../../models/StandardAction';
import TranslationOrText from '../../models/TranslationOrText';
import { useUnmount } from '../../hooks/useUnmount';
import { usePossibleTranslation } from '../../hooks/usePossibleTranslation';
import { useSelection } from '../../hooks/useSelection';
import { useWithPendingChangesCloseRequest } from '../../hooks/useWithPendingChangesCloseRequest';
import { FormattedMessage } from 'react-intl';
import DialogBody from '../DialogBody/DialogBody';
import DialogFooter from '../DialogFooter/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import CreateFolderDialog from '../CreateFolderDialog';
import DialogHeader from '../DialogHeader';
import FolderBrowserTreeView from '../FolderBrowserTreeView';
import PathSelectionInput from '../PathSelectionInput';
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import BasePathSelector from '../BasePathSelector';
import { UNDEFINED } from '../../utils/constants';

export interface PathSelectionDialogBaseProps {
  open: boolean;
  title?: TranslationOrText;
  rootPath?: string;
  initialPath?: string;
  allowSwitchingRootPath?: boolean;
  showCreateFolderOption?: boolean;
  stripXmlIndex?: boolean;
}

export interface PathSelectionDialogCallbacks {
  onClose(): void;
  onClosed?(): void;
  onOk?(response: { path: string }): void;
}

export type PathSelectionDialogProps = PathSelectionDialogBaseProps & PathSelectionDialogCallbacks;

export interface PathSelectionDialogStateProps extends PathSelectionDialogBaseProps {
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onOk?: StandardAction;
}

export function PathSelectionDialog(props: PathSelectionDialogProps) {
  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="sm">
      <PathSelectionDialogContainer {...props} />
    </Dialog>
  );
}

const useStyles = makeStyles()(() => ({
  dialogBody: {
    minHeight: '60vh'
  },
  createFolderBtn: {
    marginRight: 'auto'
  },
  treeViewRoot: {
    marginTop: '15px'
  }
}));

export function PathSelectionDialogContainer(props: PathSelectionDialogProps) {
  const {
    onClosed,
    onClose,
    onOk,
    rootPath = '',
    initialPath,
    showCreateFolderOption = true,
    stripXmlIndex = true,
    allowSwitchingRootPath = true
  } = props;
  const [root, setRoot] = useState(rootPath);
  const [currentPath, setCurrentPath] = useState(initialPath ?? root);
  const [openCreateFolderDialog, setOpenCreateFolderDialog] = useState(false);
  const { classes } = useStyles();
  const title = usePossibleTranslation(props.title);
  const createFolderState = useSelection((state) => state.dialogs.createFolder);

  useUnmount(onClosed);

  const onCloseCreateFolder = () => setOpenCreateFolderDialog(false);

  const onWithPendingChangesCloseRequest = useWithPendingChangesCloseRequest(onCloseCreateFolder);

  const onCreateFolder = () => setOpenCreateFolderDialog(true);

  const onFolderCreated = ({ path, name }: { path: string; name: string }) => {
    setOpenCreateFolderDialog(false);
    let id = `${path}/${name}`;
    setCurrentPath(id);
  };

  const onPathChanged = (path: string) => {
    setCurrentPath(path);
  };

  return (
    <>
      <DialogHeader
        title={title ?? <FormattedMessage id="pathSelectionDialog.title" defaultMessage="Select Path" />}
        onCloseButtonClick={onClose}
      />
      <DialogBody className={classes.dialogBody}>
        {root && root !== '/' ? (
          <>
            <PathSelectionInput
              rootPath={root}
              onChange={onPathChanged}
              currentPath={currentPath}
              startAdornment={
                allowSwitchingRootPath ? (
                  <Tooltip
                    title={
                      <FormattedMessage id="pathSelectionDialog.changeRootButtonLabel" defaultMessage="Change root" />
                    }
                  >
                    <IconButton
                      sx={{ mr: 0.5 }}
                      onClick={() => {
                        setRoot('');
                        setCurrentPath('');
                      }}
                    >
                      <KeyboardArrowLeftRoundedIcon />
                    </IconButton>
                  </Tooltip>
                ) : (
                  UNDEFINED
                )
              }
            />
            <FolderBrowserTreeView rootPath={root} onPathSelected={onPathChanged} selectedPath={currentPath} />
          </>
        ) : (
          <BasePathSelector
            value=""
            onChange={(e) => {
              const path = e.target.value;
              setRoot(path);
              setCurrentPath(path);
            }}
          />
        )}
      </DialogBody>
      <DialogFooter>
        {showCreateFolderOption && (
          <SecondaryButton onClick={onCreateFolder} className={classes.createFolderBtn}>
            <FormattedMessage id="pathSelectionDialog.createFolderButtonLabel" defaultMessage="Create Folder" />
          </SecondaryButton>
        )}
        <SecondaryButton onClick={onClose}>
          <FormattedMessage id="words.cancel" defaultMessage="Cancel" />
        </SecondaryButton>
        <PrimaryButton onClick={() => onOk?.({ path: stripXmlIndex ? withoutIndex(currentPath) : currentPath })}>
          <FormattedMessage id="words.accept" defaultMessage="Accept" />
        </PrimaryButton>
      </DialogFooter>
      <CreateFolderDialog
        title={<FormattedMessage id="newFolder.title" defaultMessage="Create a New Folder" />}
        path={currentPath}
        isSubmitting={createFolderState.isSubmitting}
        hasPendingChanges={createFolderState.hasPendingChanges}
        isMinimized={createFolderState.isMinimized}
        onWithPendingChangesCloseRequest={onWithPendingChangesCloseRequest}
        open={openCreateFolderDialog}
        onClose={onCloseCreateFolder}
        onCreated={onFolderCreated}
      />
    </>
  );
}

export default PathSelectionDialog;
