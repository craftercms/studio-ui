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

import React, { PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import { useDispatch } from 'react-redux';
import LoadingState from '../../components/SystemStatus/LoadingState';
import clsx from 'clsx';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { createStyles } from '@material-ui/core';
import { useMinimizeDialog, useUnmount } from '../../utils/hooks';
import { defineMessages, useIntl } from 'react-intl';
import {
  EMBEDDED_LEGACY_FORM_CLOSE,
  EMBEDDED_LEGACY_FORM_FAILURE,
  EMBEDDED_LEGACY_FORM_MINIMIZE,
  EMBEDDED_LEGACY_FORM_PREVIEW_REFRESH,
  EMBEDDED_LEGACY_FORM_RENDERED,
  EMBEDDED_LEGACY_FORM_SAVE,
  RELOAD_REQUEST
} from '../../state/actions/preview';
import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';
import ErrorDialog from '../../components/SystemStatus/ErrorDialog';
import { ApiResponse } from '../../models/ApiResponse';
import StandardAction from '../../models/StandardAction';
import { updateEditConfig } from '../../state/reducers/dialogs/edit';
import { minimizeDialog } from '../../state/reducers/dialogs/minimizedDialogs';
import { getHostToGuestBus } from '../../modules/Preview/previewContext';

const translations = defineMessages({
  contentForm: {
    id: 'craftercms.edit.contentForm',
    defaultMessage: 'Content Form'
  },
  template: {
    id: 'craftercms.edit.template',
    defaultMessage: 'Template'
  },
  controller: {
    id: 'craftercms.edit.controller',
    defaultMessage: 'Controller'
  },
  loadingForm: {
    id: 'craftercms.edit.loadingForm',
    defaultMessage: 'Loading...'
  }
});

const styles = makeStyles(() =>
  createStyles({
    iframe: {
      height: '0',
      border: 0,
      '&.complete': {
        height: '100%'
      }
    },
    loadingRoot: {
      height: 'calc(100% - 104px)',
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
  src?: string;
  inProgress?: boolean;
  onMinimized?(): void;
}

export type LegacyFormDialogProps = PropsWithChildren<LegacyFormDialogBaseProps & {
  onClose?(): any;
  onClosed?(): any;
  onDismiss?(): any;
  onSaveSuccess?(response?: any): any;
}>;

export interface LegacyFormDialogStateProps extends LegacyFormDialogBaseProps {
  onSaveSuccess?: StandardAction;
  onClose?: StandardAction;
  onDismiss?: StandardAction;
}

function EmbeddedLegacyEditor(props: LegacyFormDialogProps) {
  const {
    src,
    inProgress,
    onSaveSuccess,
    onDismiss,
    onClosed,
    onMinimized
  } = props;

  const { formatMessage } = useIntl();
  const classes = styles({});
  const iframeRef = useRef(null);
  const dispatch = useDispatch();
  const [error, setError] = useState<ApiResponse>(null);

  const messages = fromEvent(window, 'message').pipe(filter((e: any) => e.data && e.data.type));

  const onErrorClose = () => {
    setError(null);
    closeEmbeddedLegacyForm(false);
  };

  const closeEmbeddedLegacyForm = useCallback(
    (refresh: boolean) => {
      onDismiss();
      if (refresh) {
        getHostToGuestBus().next({ type: RELOAD_REQUEST });
      }
    },
    [onDismiss]
  );

  useEffect(() => {
    const messagesSubscription = messages.subscribe((e: any) => {
      switch (e.data.type) {
        case EMBEDDED_LEGACY_FORM_MINIMIZE: {
          onMinimized();
          break;
        }
        case EMBEDDED_LEGACY_FORM_PREVIEW_REFRESH: {
          getHostToGuestBus().next({ type: RELOAD_REQUEST });
          break;
        }
        case EMBEDDED_LEGACY_FORM_CLOSE: {
          closeEmbeddedLegacyForm(e.data.refresh);
          break;
        }
        case EMBEDDED_LEGACY_FORM_RENDERED: {
          if (inProgress) {
            const config = { inProgress: false };
            dispatch(updateEditConfig(config));
          }
          break;
        }
        case EMBEDDED_LEGACY_FORM_SAVE: {
          closeEmbeddedLegacyForm(e.data.refresh);
          onSaveSuccess?.(e.data);
          break;
        }
        case EMBEDDED_LEGACY_FORM_FAILURE: {
          setError({
            message: e.data.message
          });
          break;
        }
      }
    });
    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [inProgress, onSaveSuccess, messages, closeEmbeddedLegacyForm, dispatch, onMinimized]);

  useUnmount(onClosed);

  return (
    <>
      {inProgress && (
        <LoadingState
          title={formatMessage(translations.loadingForm)}
          classes={{ root: classes.loadingRoot }}
        />
      )}
      <iframe
        ref={iframeRef}
        src={src}
        title="Embedded Legacy Form"
        className={clsx(classes.iframe, !inProgress && 'complete')}
      />
      <ErrorDialog open={Boolean(error)} error={error} onDismiss={onErrorClose} />
    </>
  );
}

export default function (props: LegacyFormDialogProps) {
  const id = 'legacy-editor';
  const dispatch = useDispatch();

  const minimized = useMinimizeDialog({
    id,
    title: 'edito',
    minimized: false
  });

  //updateDialog

  const onMinimized = () => {
    dispatch(minimizeDialog({ id }));
  };

  return (
    <Dialog
      open={props.open && !minimized}
      keepMounted={minimized}
      fullScreen
      onClose={props.onClose}
    >
      <EmbeddedLegacyEditor {...props} onMinimized={onMinimized} />
    </Dialog>
  );
}
