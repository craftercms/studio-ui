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

import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import List from '@mui/material/List';
import ContentType from '../../models/ContentType';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import { getHostToGuestBus } from '../../utils/subjects';
import {
  componentDragEnded,
  componentDragStarted,
  contentTypeDropTargetsRequest,
  pushIcePanelPage,
  setContentTypeFilter,
  setPreviewEditMode
} from '../../state/actions/preview';
import { DraggablePanelListItem } from '../DraggablePanelListItem/DraggablePanelListItem';
import { useDispatch } from 'react-redux';
import { batchActions } from '../../state/actions/misc';
import { createToolsPanelPage, createWidgetDescriptor } from '../../utils/state';
import { useSelection } from '../../hooks/useSelection';
import SearchBar from '../SearchBar';
import LoadingState from '../LoadingState';
import ErrorBoundary from '../ErrorBoundary';
import EmptyState from '../EmptyState';
import Box from '@mui/material/Box';

const translations = defineMessages({
  previewComponentsPanelTitle: {
    id: 'previewComponentsPanelTitle',
    defaultMessage: 'Create Content'
  },
  browse: {
    id: 'previewComponentsPanel.browse',
    defaultMessage: 'Browse existing'
  },
  listDropTargets: {
    id: 'previewComponentsPanel.listDropTargets',
    defaultMessage: 'List drop targets'
  },
  listInPageInstances: {
    id: 'previewComponentsPanel.listInPageInstances',
    defaultMessage: 'Instances on this page'
  },
  filter: {
    defaultMessage: 'Filter...'
  }
});

type ComponentsPanelUIProps = { componentTypes: ContentType[] };

export function PreviewComponentsPanel() {
  const contentTypesBranch = useSelection((state) => state.contentTypes);
  const contentTypesBranchEntries = Object.entries(contentTypesBranch.byId ?? {});
  const [keyword, setKeyword] = useState('');
  const lowerCaseKeyword = keyword.toLowerCase();
  const filteredContentTypes = contentTypesBranch.byId
    ? contentTypesBranchEntries
        .filter(
          ([id, contentType]) =>
            id !== '/component/level-descriptor' &&
            contentType.type === 'component' &&
            (contentType.name.toLowerCase().includes(lowerCaseKeyword) ||
              contentType.id.toLowerCase().includes(lowerCaseKeyword))
        )
        .map(([, contentType]) => contentType)
        .sort((a: ContentType, b: ContentType) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    : null;
  const { formatMessage } = useIntl();
  return (
    <ErrorBoundary>
      <Box sx={{ padding: (theme) => `${theme.spacing(1)} ${theme.spacing(1)} 0` }}>
        <SearchBar
          placeholder={formatMessage(translations.filter)}
          showActionButton={Boolean(keyword)}
          onChange={setKeyword}
          keyword={keyword}
          autoFocus
        />
      </Box>
      {contentTypesBranch.isFetching ? (
        <LoadingState
          title={<FormattedMessage id="componentsPanel.suspenseStateMessage" defaultMessage="Retrieving Page Model" />}
        />
      ) : contentTypesBranchEntries.length === 0 ? (
        <EmptyState
          title={<FormattedMessage id="componentsPanel.emptyStateMessage" defaultMessage="No components found" />}
          subtitle={
            <FormattedMessage
              id="componentsPanel.emptyComponentsSubtitle"
              defaultMessage="Communicate with your developers to create the required components in the system."
            />
          }
        />
      ) : filteredContentTypes.length === 0 ? (
        <EmptyState
          title={<FormattedMessage id="componentsPanel.emptyStateMessage" defaultMessage="No components found" />}
          subtitle={<FormattedMessage defaultMessage="Try changing the keyword." />}
        />
      ) : (
        <ComponentsPanelUI componentTypes={filteredContentTypes} />
      )}
    </ErrorBoundary>
  );
}

export const ComponentsPanelUI: React.FC<ComponentsPanelUIProps> = (props) => {
  const { componentTypes } = props;
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const editMode = useSelection((state) => state.preview.editMode);

  const hostToGuest$ = getHostToGuestBus();
  const [menuContext, setMenuContext] = useState<{ anchor: Element; contentType: ContentType }>();

  const onDragStart = (contentType) => {
    if (!editMode) {
      dispatch(setPreviewEditMode({ editMode: true }));
    }
    hostToGuest$.next({ type: componentDragStarted.type, payload: contentType });
  };

  const onDragEnd = () => hostToGuest$.next({ type: componentDragEnded.type });

  const onMenuClose = () => setMenuContext(null);

  const onBrowseSharedInstancesClicked = () => {
    dispatch(
      batchActions([
        setContentTypeFilter(menuContext.contentType.id),
        pushIcePanelPage(
          createToolsPanelPage(
            { id: 'previewBrowseComponentsPanelTitle' },
            [createWidgetDescriptor({ id: 'craftercms.components.PreviewBrowseComponentsPanel' })],
            'icePanel'
          )
        )
      ])
    );
  };

  const onListInPageInstancesClick = () => {
    dispatch(
      batchActions([
        setContentTypeFilter(menuContext.contentType.id),
        pushIcePanelPage(
          createToolsPanelPage(
            { id: 'previewInPageInstancesPanel.title' },
            [createWidgetDescriptor({ id: 'craftercms.components.PreviewInPageInstancesPanel' })],
            'icePanel'
          )
        )
      ])
    );
  };

  const onListDropTargetsClick = () => {
    dispatch(
      pushIcePanelPage(
        createToolsPanelPage(
          { id: 'previewDropTargetsPanelTitle', defaultMessage: 'Drop Targets' },
          [createWidgetDescriptor({ id: 'craftercms.components.PreviewDropTargetsPanel' })],
          'icePanel'
        )
      )
    );
    hostToGuest$.next({
      type: contentTypeDropTargetsRequest.type,
      payload: menuContext.contentType.id
    });
  };

  return (
    <>
      <List>
        {componentTypes.map((contentType) => (
          <DraggablePanelListItem
            key={contentType.id}
            primaryText={contentType.name}
            secondaryText={contentType.id}
            onDragStart={() => onDragStart(contentType)}
            onDragEnd={onDragEnd}
            onMenu={(anchor) => setMenuContext({ anchor, contentType })}
          />
        ))}
      </List>

      <Menu open={!!menuContext} anchorEl={menuContext?.anchor} onClose={onMenuClose}>
        <MenuItem onClick={onListInPageInstancesClick}>{formatMessage(translations.listInPageInstances)}</MenuItem>
        <MenuItem onClick={onBrowseSharedInstancesClicked}>{formatMessage(translations.browse)}</MenuItem>
        <MenuItem onClick={onListDropTargetsClick}>{formatMessage(translations.listDropTargets)}</MenuItem>
      </Menu>
    </>
  );
};

export default PreviewComponentsPanel;
