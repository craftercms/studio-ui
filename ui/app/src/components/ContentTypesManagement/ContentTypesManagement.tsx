/*
 * Copyright (C) 2007-2023 Crafter Software Corporation. All Rights Reserved.
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

import React, { useEffect } from 'react';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { fetchLegacyContentTypes } from '../../services/contentTypes';
import useSpreadState from '../../hooks/useSpreadState';
import { ContentTypesLoader } from '../NewContentDialog';
import { EmptyState } from '../EmptyState';
import { FormattedMessage } from 'react-intl';
import { ContentTypesGrid } from '../ContentTypesGrid';
import Paper from '@mui/material/Paper';
import { GlobalAppToolbar } from '../GlobalAppToolbar';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import { ApiResponseErrorState } from '../ApiResponseErrorState';
import Box from '@mui/material/Box';

export interface ContentTypesManagementProps {
  embedded?: boolean;
  showAppsButton?: boolean;
}

export function ContentTypesManagement(props: ContentTypesManagementProps) {
  const { embedded, showAppsButton } = props;
  const siteId = useActiveSiteId();
  const [state, setState] = useSpreadState({
    contentTypes: null,
    filteredContentTypes: null,
    loadingContentTypes: false,
    error: null
  });

  useEffect(() => {
    setState({ loadingContentTypes: true });
    fetchLegacyContentTypes(siteId).subscribe({
      next(response) {
        setState({ loadingContentTypes: false, contentTypes: response, error: null });
      },
      error(response) {
        setState({ loadingContentTypes: false, error: response });
      }
    });
  }, [siteId, setState]);

  return (
    <Paper elevation={0}>
      <GlobalAppToolbar
        title={!embedded && <FormattedMessage id="GlobalMenu.ContentTypes" defaultMessage="Content Types" />}
        leftContent={
          <Button startIcon={<AddIcon />} variant="outlined" color="primary" onClick={() => null}>
            <FormattedMessage id="ContentTypesManagement.createNewType" defaultMessage="Create New Type" />
          </Button>
        }
        showHamburgerMenuButton={!embedded}
        showAppsButton={showAppsButton}
      />

      <Box display="flex" justifyContent="space-between" alignItems="flex-end">
        {/* TODO: searchBox here */}
      </Box>

      {state.loadingContentTypes && <ContentTypesLoader isCompact={false} />}
      {state.error && <ApiResponseErrorState error={state.error} />}
      {state.contentTypes?.length === 0 && (
        <EmptyState
          title={
            <FormattedMessage id="contentTypesManagement.emptyStateMessage" defaultMessage="No Content Types Found" />
          }
        />
      )}
      {state.contentTypes?.length > 0 && (
        <ContentTypesGrid filterContentTypes={state.contentTypes} isCompact={false} onTypeOpen={() => null} />
      )}
    </Paper>
  );
}

export default ContentTypesManagement;
