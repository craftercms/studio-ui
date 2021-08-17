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

import React, { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import { useDispatch } from 'react-redux';
import LoadingState from '../../components/SystemStatus/LoadingState';
import clsx from 'clsx';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { defineMessages, useIntl } from 'react-intl';
import {
  EMBEDDED_LEGACY_FORM_CLOSE,
  EMBEDDED_LEGACY_FORM_FAILURE,
  EMBEDDED_LEGACY_FORM_PENDING_CHANGES,
  EMBEDDED_LEGACY_FORM_RENDER_FAILED,
  EMBEDDED_LEGACY_FORM_RENDERED,
  EMBEDDED_LEGACY_FORM_SAVE,
  EMBEDDED_LEGACY_FORM_SUCCESS,
  RELOAD_REQUEST
} from '../../state/actions/preview';
import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';
import ErrorDialog from '../../components/SystemStatus/ErrorDialog';
import { ApiResponse } from '../../models/ApiResponse';
import StandardAction from '../../models/StandardAction';
import { minimizeDialog } from '../../state/reducers/dialogs/minimizedDialogs';
import { getHostToGuestBus } from '../../modules/Preview/previewContext';
import { updateEditConfig } from '../../state/actions/dialogs';
import { emitSystemEvent, itemCreated, itemUpdated } from '../../state/actions/system';
import { getEditFormSrc } from '../../utils/path';
import DialogHeader from './DialogHeader';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { useUnmount } from '../../utils/hooks/useUnmount';
import { useMinimizeDialog } from '../../utils/hooks/useMinimizeDialog';

const translations = defineMessages({
  title: {
    id: 'legacyFormDialog.title',
    defaultMessage: 'Content Form'
  },
  loadingForm: {
    id: 'legacyFormDialog.loadingForm',
    defaultMessage: 'Loading...'
  },
  error: {
    id: 'legacyFormDialog.errorLoadingForm',
    defaultMessage: 'An error occurred trying to load the form'
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

interface LegacyFormDialogBaseProps {
  open?: boolean;
  path: string;
  selectedFields?: string[];
  authoringBase: string;
  site?: string;
  isHidden?: boolean;
  modelId?: string;
  readonly?: boolean;
  changeTemplate?: string;
  contentTypeId?: string;
  isNewContent?: boolean;
  inProgress?: boolean;
  onMinimized?(): void;
  pendingChanges?: boolean;
  iceGroupId?: string;
}

export type LegacyFormDialogProps = PropsWithChildren<
  LegacyFormDialogBaseProps & {
    onClose?(): any;
    onClosed?(): any;
    onDismiss?(): any;
    onSaveSuccess?(response?: any): any;
  }
>;

export interface LegacyFormDialogStateProps extends LegacyFormDialogBaseProps {
  onSaveSuccess?: StandardAction;
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onDismiss?: StandardAction;
}

const EmbeddedLegacyEditor = React.forwardRef(function EmbeddedLegacyEditor(props: LegacyFormDialogProps, ref) {
  const {
    path,
    selectedFields,
    authoringBase,
    readonly,
    site,
    isHidden,
    modelId,
    contentTypeId,
    isNewContent,
    changeTemplate,
    inProgress,
    onSaveSuccess,
    onDismiss,
    onClosed,
    onMinimized,
    iceGroupId
  } = props;

  const src = useMemo(
    () =>
      getEditFormSrc({
        path,
        site,
        authoringBase,
        readonly,
        isHidden,
        modelId,
        changeTemplate,
        contentTypeId,
        isNewContent,
        iceGroupId,
        ...(selectedFields ? { selectedFields: JSON.stringify(selectedFields) } : {})
      }),
    [
      authoringBase,
      changeTemplate,
      contentTypeId,
      isHidden,
      isNewContent,
      modelId,
      path,
      selectedFields,
      readonly,
      site,
      iceGroupId
    ]
  );

  const { formatMessage } = useIntl();
  const classes = styles({});
  const iframeRef = useRef(null);
  const dispatch = useDispatch();
  const [error, setError] = useState<ApiResponse>(null);

  const messages = fromEvent(window, 'message').pipe(filter((e: any) => e.data && e.data.type));

  const onErrorClose = () => {
    setError(null);
    onDismiss();
  };

  const onSave = useCallback(
    (data) => {
      onSaveSuccess?.(data);
      if (data.isNew) {
        dispatch(emitSystemEvent(itemCreated({ target: data.item.uri })));
      } else {
        dispatch(emitSystemEvent(itemUpdated({ target: path })));
      }
    },
    [dispatch, onSaveSuccess, path]
  );

  useEffect(() => {
    const messagesSubscription = messages.subscribe((e: any) => {
      switch (e.data.type) {
        case EMBEDDED_LEGACY_FORM_SUCCESS: {
          onSave(e.data);
          getHostToGuestBus().next({ type: RELOAD_REQUEST });
          dispatch(updateEditConfig({ pendingChanges: false }));
          switch (e.data.action) {
            case 'save': {
              break;
            }
            case 'saveAndMinimize': {
              onMinimized();
              break;
            }
            case 'saveAndPreview':
            case 'saveAndClose': {
              onDismiss();
              break;
            }
          }
          break;
        }
        case EMBEDDED_LEGACY_FORM_CLOSE: {
          if (e.data.close) {
            onDismiss();
          }
          if (e.data.refresh) {
            getHostToGuestBus().next({ type: RELOAD_REQUEST });
          }
          break;
        }
        case EMBEDDED_LEGACY_FORM_RENDERED: {
          if (inProgress) {
            dispatch(updateEditConfig({ inProgress: false }));
          }
          break;
        }
        case EMBEDDED_LEGACY_FORM_RENDER_FAILED: {
          onDismiss();
          dispatch(showErrorDialog({ error: { message: formatMessage(translations.error) } }));
          break;
        }
        case EMBEDDED_LEGACY_FORM_SAVE: {
          onSave(e.data);
          dispatch(updateEditConfig({ pendingChanges: false }));
          if (e.data.refresh) {
            getHostToGuestBus().next({ type: RELOAD_REQUEST });
          }
          switch (e.data.action) {
            case 'save': {
              break;
            }
            case 'saveAndClose':
            case 'saveAndPreview': {
              onDismiss();
              break;
            }
          }
          break;
        }
        case EMBEDDED_LEGACY_FORM_FAILURE: {
          setError({
            message: e.data.message
          });
          break;
        }
        case EMBEDDED_LEGACY_FORM_PENDING_CHANGES: {
          dispatch(updateEditConfig({ pendingChanges: true }));
          break;
        }
      }
    });
    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [inProgress, onSave, messages, dispatch, onDismiss, formatMessage, onMinimized]);

  useUnmount(onClosed);

  return (
    <>
      {inProgress && (
        <LoadingState title={formatMessage(translations.loadingForm)} classes={{ root: classes.loadingRoot }} />
      )}
      <iframe
        ref={(e) => {
          iframeRef.current = e;
          if (ref) {
            typeof ref === 'function' ? ref(e) : (ref.current = e);
          }
        }}
        src={src}
        title="Embedded Legacy Form"
        className={clsx(classes.iframe, !inProgress && 'complete')}
      />
      <ErrorDialog open={Boolean(error)} error={error} onDismiss={onErrorClose} />
    </>
  );
});

export const legacyEditorId = 'legacy-editor';

export default function LegacyFormDialog(props: LegacyFormDialogProps) {
  const id = legacyEditorId;
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const classes = styles();
  const { open, inProgress } = props;

  const iframeRef = useRef<HTMLIFrameElement>();

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
    if (inProgress) {
      props?.onClose();
    }
    iframeRef.current.contentWindow.postMessage({ type: 'LEGACY_FORM_DIALOG_CANCEL_REQUEST' }, '*');
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
      <EmbeddedLegacyEditor ref={iframeRef} {...props} onMinimized={onMinimized} />
    </Dialog>
  );
}
