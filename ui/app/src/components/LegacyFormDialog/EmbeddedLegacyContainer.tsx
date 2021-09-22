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

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LegacyFormDialogContainerProps } from './utils';
import { getEditFormSrc } from '../../utils/path';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { ApiResponse } from '../../models/ApiResponse';
import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';
import { emitSystemEvent, itemCreated, itemUpdated } from '../../state/actions/system';
import {
  EMBEDDED_LEGACY_FORM_CLOSE,
  EMBEDDED_LEGACY_FORM_FAILURE,
  EMBEDDED_LEGACY_FORM_PENDING_CHANGES,
  EMBEDDED_LEGACY_FORM_RENDER_FAILED,
  EMBEDDED_LEGACY_FORM_RENDERED,
  EMBEDDED_LEGACY_FORM_SAVE,
  EMBEDDED_LEGACY_FORM_SUCCESS,
  EMBEDDED_LEGACY_MINIMIZE_REQUEST,
  RELOAD_REQUEST
} from '../../state/actions/preview';
import { getHostToGuestBus } from '../../modules/Preview/previewContext';
import { updateEditConfig } from '../../state/actions/dialogs';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { useUnmount } from '../../utils/hooks/useUnmount';
import LoadingState from '../SystemStatus/LoadingState';
import clsx from 'clsx';
import ErrorDialog from '../SystemStatus/ErrorDialog';
import { styles, translations } from './LegacyFormDialog';

export const EmbeddedLegacyContainer = React.forwardRef(function EmbeddedLegacyEditor(
  props: LegacyFormDialogContainerProps,
  ref
) {
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
    onMinimize,
    onClose,
    onClosed,
    iceGroupId,
    newEmbedded
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
        ...(selectedFields ? { selectedFields: JSON.stringify(selectedFields) } : {}),
        ...(newEmbedded ? { newEmbedded: JSON.stringify(newEmbedded) } : {})
      }),
    [
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
      selectedFields,
      newEmbedded
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
    onClose();
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
              onMinimize();
              break;
            }
            case 'saveAndPreview':
            case 'saveAndClose': {
              onClose();
              break;
            }
          }
          break;
        }
        case EMBEDDED_LEGACY_FORM_CLOSE: {
          if (e.data.close) {
            onClose();
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
          onClose();
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
              onClose();
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
        case EMBEDDED_LEGACY_MINIMIZE_REQUEST: {
          onMinimize();
        }
      }
    });
    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [inProgress, onSave, messages, dispatch, onClose, formatMessage, onMinimize]);

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
