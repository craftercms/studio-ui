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

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LegacyFormDialogContainerProps } from './utils';
import { getEditFormSrc } from '../../utils/path';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { ApiResponse } from '../../models/ApiResponse';
import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';
import {
  EMBEDDED_LEGACY_CHANGE_TO_EDIT_MODE,
  EMBEDDED_LEGACY_FORM_CLOSE,
  EMBEDDED_LEGACY_FORM_DISABLE_HEADER,
  EMBEDDED_LEGACY_FORM_DISABLE_ON_CLOSE,
  EMBEDDED_LEGACY_FORM_ENABLE_HEADER,
  EMBEDDED_LEGACY_FORM_ENABLE_ON_CLOSE,
  EMBEDDED_LEGACY_FORM_FAILURE,
  EMBEDDED_LEGACY_FORM_PENDING_CHANGES,
  EMBEDDED_LEGACY_FORM_RENDER_FAILED,
  EMBEDDED_LEGACY_FORM_RENDERED,
  EMBEDDED_LEGACY_FORM_SAVE,
  EMBEDDED_LEGACY_FORM_SAVE_END,
  EMBEDDED_LEGACY_FORM_SAVE_START,
  EMBEDDED_LEGACY_FORM_SUCCESS,
  EMBEDDED_LEGACY_MINIMIZE_REQUEST,
  reloadRequest
} from '../../state/actions/preview';
import { getHostToGuestBus } from '../../utils/subjects';
import { updateEditDialogConfig } from '../../state/actions/dialogs';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import { useUnmount } from '../../hooks/useUnmount';
import LoadingState from '../LoadingState/LoadingState';
import ErrorDialog from '../ErrorDialog/ErrorDialog';
import { translations } from './translations';
import { useStyles } from './styles';
import { hasEditAction } from '../../utils/content';
import { nnou } from '../../utils/object';
import { useFetchItem } from '../../hooks/useFetchItem';

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
    newEmbedded,
    index,
    setIframeLoaded
  } = props;

  const { formatMessage } = useIntl();
  const { classes, cx: clsx } = useStyles();
  const iframeRef = useRef(null);
  const dispatch = useDispatch();
  const [error, setError] = useState<ApiResponse>(null);
  // When filename, path prop will still be the previous one, and useDetailedItem will try to re-fetch the
  // non-existing item (old filename path), so we will only re-fetch when the actual path prop of the component
  // changes (useDetailedItemNoState).
  const item = useFetchItem(path);
  const availableActions = item?.availableActions;
  let fieldsIndexes;
  if (selectedFields && index) {
    fieldsIndexes = {};
    selectedFields.forEach((id) => {
      fieldsIndexes[id] = index;
    });
  }

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
        ...(nnou(availableActions) && !isNewContent ? { canEdit: hasEditAction(availableActions) } : {}),
        ...(selectedFields && selectedFields.length ? { selectedFields: JSON.stringify(selectedFields) } : {}),
        ...(newEmbedded ? { newEmbedded: JSON.stringify(newEmbedded) } : {}),
        ...(fieldsIndexes ? { fieldsIndexes: JSON.stringify(fieldsIndexes) } : {})
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
      newEmbedded,
      availableActions,
      fieldsIndexes
    ]
  );

  const messages = fromEvent(window, 'message').pipe(filter((e: any) => e.data && e.data.type));

  const onErrorClose = () => {
    setError(null);
    onClose();
  };

  const onSave = useCallback(
    (data) => {
      onSaveSuccess?.(data);
    },
    [onSaveSuccess]
  );

  useEffect(() => {
    const messagesSubscription = messages.subscribe((e: any) => {
      switch (e.data.type) {
        case EMBEDDED_LEGACY_FORM_SUCCESS: {
          onSave(e.data);
          getHostToGuestBus().next({ type: reloadRequest.type });
          dispatch(updateEditDialogConfig({ pendingChanges: false }));
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
            getHostToGuestBus().next({ type: reloadRequest.type });
          }
          break;
        }
        case EMBEDDED_LEGACY_FORM_RENDERED: {
          setIframeLoaded(true);
          if (inProgress) {
            dispatch(updateEditDialogConfig({ inProgress: false }));
          }
          break;
        }
        case EMBEDDED_LEGACY_FORM_ENABLE_ON_CLOSE: {
          dispatch(updateEditDialogConfig({ isSubmitting: false }));
          break;
        }
        case EMBEDDED_LEGACY_FORM_DISABLE_ON_CLOSE: {
          dispatch(updateEditDialogConfig({ isSubmitting: true }));
          break;
        }
        case EMBEDDED_LEGACY_FORM_ENABLE_HEADER: {
          dispatch(updateEditDialogConfig({ disableHeader: false }));
          break;
        }
        case EMBEDDED_LEGACY_FORM_DISABLE_HEADER: {
          dispatch(updateEditDialogConfig({ disableHeader: true }));
          break;
        }
        case EMBEDDED_LEGACY_FORM_RENDER_FAILED: {
          onClose();
          dispatch(showErrorDialog({ error: { message: formatMessage(translations.error) } }));
          break;
        }
        case EMBEDDED_LEGACY_FORM_SAVE: {
          onSave(e.data);
          dispatch(updateEditDialogConfig({ pendingChanges: false }));
          if (e.data.refresh) {
            getHostToGuestBus().next({ type: reloadRequest.type });
          }
          switch (e.data.action) {
            case 'save': {
              break;
            }
            case 'saveAndMinimize': {
              onMinimize();
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
          dispatch(updateEditDialogConfig({ pendingChanges: true }));
          break;
        }
        case EMBEDDED_LEGACY_MINIMIZE_REQUEST: {
          onMinimize();
          break;
        }
        case EMBEDDED_LEGACY_CHANGE_TO_EDIT_MODE: {
          dispatch(updateEditDialogConfig({ readonly: false }));
          break;
        }
        case EMBEDDED_LEGACY_FORM_SAVE_START: {
          dispatch(updateEditDialogConfig({ isSubmitting: true }));
          break;
        }
        case EMBEDDED_LEGACY_FORM_SAVE_END: {
          dispatch(updateEditDialogConfig({ isSubmitting: false }));
          break;
        }
      }
    });
    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [inProgress, onSave, messages, dispatch, onClose, formatMessage, onMinimize, setIframeLoaded]);

  useUnmount(onClosed);

  return (
    <>
      {(inProgress || !item) && !isNewContent && (
        <LoadingState title={formatMessage(translations.loadingForm)} classes={{ root: classes.loadingRoot }} />
      )}
      {(item || isNewContent) && (
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
      )}
      <ErrorDialog open={Boolean(error)} error={error} onDismiss={onErrorClose} />
    </>
  );
});

export default EmbeddedLegacyContainer;
