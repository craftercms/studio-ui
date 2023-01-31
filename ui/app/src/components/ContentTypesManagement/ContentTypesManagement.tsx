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

import React, { useEffect, useState } from 'react';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { fetchLegacyContentTypes } from '../../services/contentTypes';
import useSpreadState from '../../hooks/useSpreadState';
import { ContentTypesLoader } from '../NewContentDialog';
import { EmptyState } from '../EmptyState';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { ContentTypesGrid } from '../ContentTypesGrid';
import Paper from '@mui/material/Paper';
import { GlobalAppToolbar } from '../GlobalAppToolbar';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import { ApiResponseErrorState } from '../ApiResponseErrorState';
import Box from '@mui/material/Box';
import useSubject from '../../hooks/useSubject';
import { debounceTime } from 'rxjs/operators';
import { SearchBar } from '../SearchBar';
import { ApiResponse, LegacyContentType } from '../../models';
import { ContentTypeEditor } from '../ContentTypeEditor';
import useContentTypeList from '../../hooks/useContentTypeList';
import Drawer from '@mui/material/Drawer';
import getStyles from './styles';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import AutoAwesomeMotionOutlinedIcon from '@mui/icons-material/AutoAwesomeMotionOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';

export interface ContentTypesManagementProps {
  embedded?: boolean;
  showAppsButton?: boolean;
}

const messages = defineMessages({
  search: {
    id: 'words.search',
    defaultMessage: 'Search'
  }
});

export function ContentTypesManagement(props: ContentTypesManagementProps) {
  const { embedded, showAppsButton } = props;
  const siteId = useActiveSiteId();
  const [state, setState] = useSpreadState<{
    contentTypes: LegacyContentType[];
    filteredContentTypes: LegacyContentType[];
    loadingContentTypes: boolean;
    error: ApiResponse;
  }>({
    contentTypes: null,
    filteredContentTypes: null,
    loadingContentTypes: false,
    error: null
  });
  useContentTypeList();
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [contentTypeConfig, setContentTypeConfig] = useState<LegacyContentType>();
  const [keyword, setKeyword] = useState('');
  const [debounceKeyword, setDebounceKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'page' | 'component'>('all');
  const sx = getStyles();
  const { formatMessage } = useIntl();

  const selectContentType = (selected: LegacyContentType) => {
    setContentTypeConfig(selected);
    setView('editor');
  };

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

  useEffect(() => {
    if (state.contentTypes) {
      setState({
        filteredContentTypes: state.contentTypes.filter((contentType) =>
          contentType.label.toLowerCase().includes(debounceKeyword.toLowerCase()) && typeFilter === 'all'
            ? true
            : typeFilter === contentType.type
        )
      });
    }
  }, [debounceKeyword, setState, state.contentTypes, typeFilter]);

  const onSearch$ = useSubject<string>();

  useEffect(() => {
    onSearch$.pipe(debounceTime(400)).subscribe((keywords) => {
      setDebounceKeyword(keywords);
    });
  });

  const onSearch = (keyword: string) => {
    onSearch$.next(keyword);
    setKeyword(keyword);
  };

  return (
    <Paper elevation={0}>
      {view === 'list' ? (
        <>
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

          <Box display="flex">
            <Drawer variant="permanent" anchor="left" sx={sx.drawer}>
              <List>
                <ListItemButton selected={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>
                  <ListItemIcon>
                    <AutoAwesomeMotionOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <FormattedMessage
                        id="contentTypesManagement.allContentTypes"
                        defaultMessage="All Content Types"
                      />
                    }
                  />
                </ListItemButton>
                <ListItemButton selected={typeFilter === 'page'} onClick={() => setTypeFilter('page')}>
                  <ListItemIcon>
                    <InsertDriveFileOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText primary={<FormattedMessage id="words.pages" defaultMessage="Pages" />} />
                </ListItemButton>
                <ListItemButton selected={typeFilter === 'component'} onClick={() => setTypeFilter('component')}>
                  <ListItemIcon>
                    <ExtensionOutlinedIcon />
                  </ListItemIcon>
                  <ListItemText primary={<FormattedMessage id="words.components" defaultMessage="Components" />} />
                </ListItemButton>
              </List>
            </Drawer>
            <Box sx={sx.body}>
              <Box display="flex" justifyContent="flex-end">
                <SearchBar
                  onChange={onSearch}
                  keyword={keyword}
                  autoFocus
                  showActionButton={Boolean(keyword)}
                  placeholder={formatMessage(messages.search)}
                />
              </Box>

              {state.loadingContentTypes && <ContentTypesLoader isCompact={false} />}
              {state.error && <ApiResponseErrorState error={state.error} />}
              {state.filteredContentTypes?.length === 0 && (
                <EmptyState
                  title={
                    <FormattedMessage
                      id="contentTypesManagement.emptyStateMessage"
                      defaultMessage="No Content Types Found"
                    />
                  }
                />
              )}
              {state.filteredContentTypes?.length > 0 && (
                <ContentTypesGrid
                  filterContentTypes={state.filteredContentTypes}
                  isCompact={false}
                  onTypeOpen={selectContentType}
                />
              )}
            </Box>
          </Box>
        </>
      ) : (
        <ContentTypeEditor config={contentTypeConfig} onGoBack={() => setView('list')} />
      )}
    </Paper>
  );
}

export default ContentTypesManagement;
