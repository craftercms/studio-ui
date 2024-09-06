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

import GlobalAppToolbar from '../GlobalAppToolbar';
import { FormattedMessage } from 'react-intl';
import React, { useEffect, useState } from 'react';
import LegacyIFrame from '../LegacyIFrame';
import Box from '@mui/material/Box';
import LoadingState from '../LoadingState/LoadingState';
import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';
import { onSubmittingAndOrPendingChangeProps } from '../../hooks/useEnhancedDialogState';
import { useDispatch } from 'react-redux';
import {
  contentTypeCreated,
  contentTypeDeleted,
  contentTypeUpdated,
  emitSystemEvent
} from '../../state/actions/system';
import { ProjectToolsRoutes } from '../../env/routes';

export interface ContentTypeManagementProps {
  embedded?: boolean;
  showAppsButton?: boolean;
  mountMode?: 'dialog' | 'page';
  onClose?: () => void;
  onMinimize?: () => void;
  onSubmittingAndOrPendingChange?(value: onSubmittingAndOrPendingChangeProps): void;
}

export function ContentTypeManagement(props: ContentTypeManagementProps) {
  const { embedded = false, showAppsButton, onClose, onMinimize, mountMode, onSubmittingAndOrPendingChange } = props;
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const messagesSubscription = fromEvent(window, 'message')
      .pipe(
        filter((e: any) =>
          [
            'CONTENT_TYPES_ON_SAVED',
            'CONTENT_TYPES_ON_CREATED',
            'CONTENT_TYPES_ON_DELETED',
            'CONTENT_TYPES_ON_SUBMITTING_OR_PENDING_CHANGES_MESSAGE'
          ].includes(e.data?.type)
        )
      )
      .subscribe((e: any) => {
        switch (e.data.type) {
          case 'CONTENT_TYPES_ON_SAVED': {
            switch (e.data.saveType) {
              case 'saveAndClose':
                onClose?.();
                break;
              case 'saveAndMinimize':
                onMinimize?.();
                break;
            }
            break;
          }
          case 'CONTENT_TYPES_ON_CREATED': {
            dispatch(emitSystemEvent(contentTypeCreated()));
            break;
          }
          case 'CONTENT_TYPES_ON_DELETED': {
            dispatch(emitSystemEvent(contentTypeDeleted()));
            break;
          }
          case 'CONTENT_TYPES_ON_SUBMITTING_OR_PENDING_CHANGES_MESSAGE': {
            onSubmittingAndOrPendingChange?.(e.data.payload);
            break;
          }
        }
      });
    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [dispatch, onSubmittingAndOrPendingChange, embedded, onClose, onMinimize]);
  return (
    <Box height="100%" display="flex" flexDirection="column">
      {!embedded && (
        <GlobalAppToolbar
          title={<FormattedMessage id="componentsMessages.contentTypes" defaultMessage="Content Types" />}
          showAppsButton={showAppsButton}
        />
      )}
      {loading && <LoadingState styles={{ root: { flexGrow: 1 } }} />}
      <LegacyIFrame
        path={`/legacy-site-config?mode=embedded${mountMode ? `&mountMode=${mountMode}` : ''}#tool${ProjectToolsRoutes.ContentTypes}`}
        iframeProps={{
          style: {
            height: loading ? '0' : '100%'
          },
          onLoad: () => {
            setLoading(false);
          }
        }}
      />
    </Box>
  );
}

export default ContentTypeManagement;
