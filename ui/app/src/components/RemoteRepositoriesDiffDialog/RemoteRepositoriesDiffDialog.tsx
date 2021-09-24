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

import React, { useEffect, useMemo, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogHeader from '../DialogHeader';
import DialogBody from '../Dialogs/DialogBody';
import DialogFooter from '../Dialogs/DialogFooter';
import { FormattedMessage, useIntl } from 'react-intl';
import { diffConflictedFile as diffConflictedFileService } from '../../services/repositories';
import ApiResponse from '../../models/ApiResponse';
import { FileDiff } from '../../models/Repository';
import { SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import RemoteRepositoriesDiffDialogUI from './RemoteRepositoriesDiffDialogUI';
import SecondaryButton from '../SecondaryButton';
import ConfirmDropdown from '../Controls/ConfirmDropdown';
import { messages } from '../RemoteRepositoriesStatus';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { useLogicResource } from '../../utils/hooks/useLogicResource';

export interface RemoteRepositoriesDiffDialogProps {
  open: boolean;
  path: string;
  onResolveConflict(strategy: string, path: string): void;
  onClose(): void;
}

const useStyles = makeStyles((theme) =>
  createStyles({
    conflictActionButton: {
      color: theme.palette.warning.dark,
      borderColor: theme.palette.warning.main
    },
    dialogHeader: {
      paddingBottom: 0
    },
    dialogHeaderChildren: {
      padding: 0
    },
    dialogContent: {
      padding: 0
    },
    tabs: {
      minHeight: 'inherit'
    },
    tab: {
      minWidth: '80px',
      minHeight: '0',
      padding: '0 0 5px 0',
      marginRight: '20px',
      opacity: 1,
      '& span': {
        textTransform: 'none'
      }
    }
  })
);

export default function RemoteRepositoriesDiffDialog(props: RemoteRepositoriesDiffDialogProps) {
  const { open, path, onResolveConflict, onClose } = props;
  const siteId = useActiveSiteId();
  const [tab, setTab] = useState(0);
  const [fileDiff, setFileDiff] = useState<FileDiff>(null);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<ApiResponse>();
  const { formatMessage } = useIntl();
  const classes = useStyles();

  useEffect(() => {
    if (path) {
      setFetching(true);
      diffConflictedFileService(siteId, path).subscribe(
        (fileDiff) => {
          setFileDiff(fileDiff);
          setFetching(false);
        },
        ({ response }) => {
          setError(response);
          setFetching(false);
        }
      );
    }
  }, [path, siteId]);

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTab(newValue);
  };

  const resource = useLogicResource<FileDiff, { fileDiff: FileDiff; error: ApiResponse; fetching: boolean }>(
    useMemo(() => ({ fileDiff, error, fetching }), [fileDiff, error, fetching]),
    {
      shouldResolve: (source) => Boolean(source.fileDiff) && !fetching,
      shouldReject: ({ error }) => Boolean(error),
      shouldRenew: (source, resource) => fetching && resource.complete,
      resultSelector: (source) => source.fileDiff,
      errorSelector: () => error
    }
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogHeader
        title={
          <>
            <FormattedMessage id="words.diff" defaultMessage="Diff" />: {path}
          </>
        }
        onCloseButtonClick={onClose}
        classes={{
          root: classes.dialogHeader,
          subtitleWrapper: classes.dialogHeaderChildren
        }}
      >
        <Tabs
          value={tab}
          indicatorColor="primary"
          textColor="primary"
          onChange={handleTabChange}
          classes={{
            root: classes.tabs
          }}
        >
          <Tab label={<FormattedMessage id="words.diff" defaultMessage="Diff" />} className={classes.tab} />
          <Tab
            label={<FormattedMessage id="repositories.splitView" defaultMessage="Split View" />}
            className={classes.tab}
          />
        </Tabs>
      </DialogHeader>
      <DialogBody className={classes.dialogContent}>
        <SuspenseWithEmptyState resource={resource}>
          <RemoteRepositoriesDiffDialogUI resource={resource} tab={tab} />
        </SuspenseWithEmptyState>
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={onClose}>
          <FormattedMessage id="words.close" defaultMessage="Close" />
        </SecondaryButton>
        <ConfirmDropdown
          classes={{ button: classes.conflictActionButton }}
          text={formatMessage(messages.acceptRemote)}
          cancelText={formatMessage(messages.no)}
          confirmText={formatMessage(messages.yes)}
          confirmHelperText={formatMessage(messages.acceptRemoteHelper)}
          onConfirm={() => onResolveConflict('theirs', path)}
        />
        <ConfirmDropdown
          classes={{ button: classes.conflictActionButton }}
          text={formatMessage(messages.keepLocal)}
          cancelText={formatMessage(messages.no)}
          confirmText={formatMessage(messages.yes)}
          confirmHelperText={formatMessage(messages.keepLocalHelper)}
          onConfirm={() => onResolveConflict('ours', path)}
        />
      </DialogFooter>
    </Dialog>
  );
}
