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

import React, { PropsWithChildren, useEffect, useRef } from 'react';
import Dialog from '@material-ui/core/Dialog';
import { useDispatch } from 'react-redux';
import LoadingState from '../../components/SystemStatus/LoadingState';
import clsx from 'clsx';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useMinimizeDialog, useUnmount } from '../../utils/hooks';
import { defineMessages, useIntl } from 'react-intl';
import {
  LEGACY_CODE_EDITOR_CLOSE,
  LEGACY_CODE_EDITOR_RENDERED,
  LEGACY_CODE_EDITOR_SUCCESS,
  RELOAD_REQUEST
} from '../../state/actions/preview';
import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';
import StandardAction from '../../models/StandardAction';
import { minimizeDialog } from '../../state/reducers/dialogs/minimizedDialogs';
import { getHostToGuestBus } from '../../modules/Preview/previewContext';
import { updateCodeEditorDialog } from '../../state/actions/dialogs';
import DialogHeader from './DialogHeader';

const translations = defineMessages({
  title: {
    id: 'craftercms.codeEditor.title',
    defaultMessage: 'Code Editor'
  },
  loadingForm: {
    id: 'craftercms.codeEditor.loadingForm',
    defaultMessage: 'Loading...'
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
  src?: string;
  inProgress?: boolean;
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
  const { src, inProgress, onSuccess, onDismiss, onClosed } = props;

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
          switch (e.data.action) {
            case 'save': {
              break;
            }
            case 'saveAndClose': {
              onDismiss();
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
      }
    });
    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [inProgress, onSuccess, messages, dispatch, onDismiss]);

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

  const title = formatMessage(translations.title);

  const minimized = useMinimizeDialog({
    id,
    title,
    minimized: false
  });

  const onMinimized = () => {
    dispatch(minimizeDialog({ id }));
  };

  return (
    <Dialog
      open={props.open && !minimized}
      keepMounted={minimized}
      onClose={props.onClose}
      fullWidth
      maxWidth="xl"
      classes={{ paper: classes.dialog }}
    >
      <DialogHeader
        title={title}
        rightActions={[
          {
            icon: 'MinimizeIcon',
            onClick: onMinimized
          }
        ]}
      />
      <EmbeddedLegacyCodeEditor {...props} />
    </Dialog>
  );
}
