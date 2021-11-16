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

import GlobalAppToolbar from '../GlobalAppToolbar';
import { FormattedMessage } from 'react-intl';
import React, { useEffect, useState } from 'react';
import LegacyIFrame from '../LegacyIFrame';
import Box from '@mui/material/Box';
import LoadingState from '../SystemStatus/LoadingState';
import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';
import { onSubmittingAndOrPendingChangeProps } from '../../utils/hooks/useEnhancedDialogState';
import { useDispatch } from 'react-redux';
import { fetchContentTypes } from '../../state/actions/preview';

interface ContentTypeManagementProps {
  embedded?: boolean;
  showAppsButton?: boolean;
  onSubmittingAndOrPendingChange?(value: onSubmittingAndOrPendingChangeProps): void;
}

export default function ContentTypeManagement(props: ContentTypeManagementProps) {
  const { embedded = false, showAppsButton, onSubmittingAndOrPendingChange } = props;
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const messages = fromEvent(window, 'message').pipe(
    filter((e: any) =>
      ['CONTENT_TYPES_ON_SAVE', 'CONTENT_TYPES_ON_SUBMITTING_OR_PENDING_CHANGES_MESSAGE'].includes(e.data?.type)
    )
  );

  useEffect(() => {
    const messagesSubscription = messages.subscribe((e: any) => {
      if (e.data.type === 'CONTENT_TYPES_ON_SAVE') {
        dispatch(fetchContentTypes());
      } else {
        onSubmittingAndOrPendingChange?.(e.data.payload);
      }
    });
    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [dispatch, messages, onSubmittingAndOrPendingChange]);

  return (
    <Box height="100%" display="flex" flexDirection="column">
      {!embedded && (
        <GlobalAppToolbar
          title={<FormattedMessage id="dropTargetsMessages.contentTypes" defaultMessage="Content Types" />}
          showAppsButton={showAppsButton}
        />
      )}
      {loading && <LoadingState styles={{ root: { flexGrow: 1 } }} />}
      <LegacyIFrame
        path="/legacy-site-config?mode=embedded#tool/content-types"
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
