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

import React, { PropsWithChildren, useEffect, useMemo, useRef } from 'react';
import Dialog from '@material-ui/core/Dialog';
import { useDispatch } from 'react-redux';
import LoadingState from '../../components/SystemStatus/LoadingState';
import clsx from 'clsx';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useMinimizeDialog, useUnmount } from '../../utils/hooks';
import { defineMessages, useIntl } from 'react-intl';
import {
  LEGACY_CODE_EDITOR_CLOSE,
  LEGACY_CODE_EDITOR_PENDING_CHANGES,
  LEGACY_CODE_EDITOR_RENDERED,
  LEGACY_CODE_EDITOR_SUCCESS,
  RELOAD_REQUEST
} from '../../state/actions/preview';
import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';
import StandardAction from '../../models/StandardAction';
import { minimizeDialog } from '../../state/reducers/dialogs/minimizedDialogs';
import { getHostToGuestBus } from '../../modules/Preview/previewContext';
import {
  closeCodeEditorDialog,
  closeConfirmDialog,
  showConfirmDialog,
  updateCodeEditorDialog
} from '../../state/actions/dialogs';
import DialogHeader from './DialogHeader';
import { getCodeEditorSrc } from '../../utils/path';
import { batchActions } from '../../state/actions/misc';
import { unlockItem } from '../../state/actions/content';

const translations = defineMessages({
  title: {
    id: 'craftercms.codeEditor.title',
    defaultMessage: 'Code Editor'
  },
  loadingForm: {
    id: 'craftercms.codeEditor.loadingForm',
    defaultMessage: 'Loading...'
  },
  pendingChanges: {
    id: 'craftercms.codeEditor.pendingChangesConfirmation',
    defaultMessage: 'Close without saving changes?'
  }
});

const styles = makeStyles(() =>
  createStyles({
    iframe: {
      height: '0',
      border: 0,
      '&.complete': {
        height: '100%',
        flexGrow: 1
      }
    },
    dialog: {
      minHeight: '90vh'
    },
    loadingRoot: {
      flexGrow: 1,
      justifyContent: 'center'
    },
    edited: {
      width: '12px',
      height: '12px',
      marginLeft: '5px'
    }
  })
);

interface LegacyCodeEditorDialogBaseProps {
  open?: boolean;
  site: string;
  path: string;
  type: string;
  contentType?: string;
  authoringBase: string;
  readonly?: boolean;
  inProgress?: boolean;
  pendingChanges?: boolean;
  onMinimized?(): void;
}

export type LegacyCodeEditorDialogProps = PropsWithChildren<
  LegacyCodeEditorDialogBaseProps & {
    onSuccess?(response?: any): void;
    onClose?(): void;
    onClosed?(): void;
    onDismiss?(): void;
  }
>;

export interface LegacyCodeEditorDialogStateProps extends LegacyCodeEditorDialogBaseProps {
  onSuccess?: StandardAction;
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onDismiss?: StandardAction;
}

function EmbeddedLegacyCodeEditor(props: LegacyCodeEditorDialogProps) {
  const {
    site,
    path,
    type,
    contentType,
    readonly,
    authoringBase,
    inProgress,
    onSuccess,
    onDismiss,
    onClosed,
    onMinimized
  } = props;

  const src = useMemo(() => getCodeEditorSrc({ site, path, type, readonly, authoringBase, contentType }), [
    authoringBase,
    path,
    readonly,
    site,
    type,
    contentType
  ]);

  const { formatMessage } = useIntl();
  const classes = styles({});
  const iframeRef = useRef(null);
  const dispatch = useDispatch();

  const messages = fromEvent(window, 'message').pipe(filter((e: any) => e.data && e.data.type));

  useEffect(() => {
    const messagesSubscription = messages.subscribe((e: any) => {
      switch (e.data.type) {
        case LEGACY_CODE_EDITOR_SUCCESS: {
          onSuccess?.();
          getHostToGuestBus().next({ type: RELOAD_REQUEST });
          dispatch(updateCodeEditorDialog({ pendingChanges: false }));
          switch (e.data.action) {
            case 'save': {
              break;
            }
            case 'saveAndClose': {
              onDismiss();
              break;
            }
            case 'saveAndMinimize': {
              onMinimized();
              break;
            }
          }
          break;
        }
        case LEGACY_CODE_EDITOR_CLOSE: {
          onDismiss();
          break;
        }
        case LEGACY_CODE_EDITOR_RENDERED: {
          if (inProgress) {
            const config = { inProgress: false };
            dispatch(updateCodeEditorDialog(config));
          }
          break;
        }
        case LEGACY_CODE_EDITOR_PENDING_CHANGES: {
          dispatch(updateCodeEditorDialog({ pendingChanges: true }));
          break;
        }
      }
    });
    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [inProgress, onSuccess, messages, dispatch, onDismiss, onMinimized]);

  useUnmount(onClosed);

  return (
    <>
      {inProgress && (
        <LoadingState title={formatMessage(translations.loadingForm)} classes={{ root: classes.loadingRoot }} />
      )}
      <iframe
        ref={iframeRef}
        src={src}
        title="Code Editor"
        className={clsx(classes.iframe, !inProgress && 'complete')}
      />
    </>
  );
}

export default function LegacyCodeEditorDialog(props: LegacyCodeEditorDialogProps) {
  const id = 'legacy-code-editor';
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const classes = styles();
  const { open, pendingChanges } = props;

  const title = formatMessage(translations.title);
  const minimized = useMinimizeDialog({
    id,
    title,
    minimized: false
  });

  const onMinimized = () => {
    dispatch(minimizeDialog({ id }));
  };

  const onClose = () => {
    if (pendingChanges) {
      dispatch(
        showConfirmDialog({
          title: formatMessage(translations.pendingChanges),
          onOk: batchActions([
            closeConfirmDialog(),
            closeCodeEditorDialog(),
            unlockItem({ path: props.path, notify: false })
          ]),
          onCancel: closeConfirmDialog()
        })
      );
    } else {
      dispatch(unlockItem({ path: props.path, notify: false }));
      props.onClose();
    }
  };

  return (
    <Dialog
      open={open && !minimized}
      keepMounted={minimized}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogHeader
        title={title}
        onDismiss={onClose}
        rightActions={[
          {
            icon: 'MinimizeIcon',
            onClick: onMinimized
          }
        ]}
      />
      <EmbeddedLegacyCodeEditor {...props} onMinimized={onMinimized} />
    </Dialog>
  );
}
