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

import React, { useMemo, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import List from '@material-ui/core/List';
import ContentType from '../../models/ContentType';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import { getHostToGuestBus } from '../../modules/Preview/previewContext';
import {
  COMPONENT_DRAG_ENDED,
  COMPONENT_DRAG_STARTED,
  CONTENT_TYPE_DROP_TARGETS_REQUEST,
  pushToolsPanelPage,
  setContentTypeFilter,
  setPreviewEditMode
} from '../../state/actions/preview';
import { nnou, reversePluckProps } from '../../utils/object';
import { DraggablePanelListItem } from '../../modules/Preview/Tools/DraggablePanelListItem';
import { useDispatch } from 'react-redux';
import { PropsWithResource, SuspenseWithEmptyState } from '../SystemStatus/Suspencified';
import { EntityState } from '../../models/EntityState';
import { batchActions } from '../../state/actions/misc';
import { createToolsPanelPage, createWidgetDescriptor } from '../../utils/state';
import { useSelection } from '../../utils/hooks/useSelection';
import { useSelectorResource } from '../../utils/hooks/useSelectorResource';

const translations = defineMessages({
  previewComponentsPanelTitle: {
    id: 'previewComponentsPanel.title',
    defaultMessage: 'Add Components'
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
  }
});

type ComponentsPanelUIProps = PropsWithResource<ContentType[]>;

export default function PreviewComponentsPanel() {
  const resource = useSelectorResource<ContentType[], EntityState<ContentType>>((state) => state.contentTypes, {
    shouldRenew: (source, resource) => resource.complete,
    shouldResolve: (source) => !source.isFetching && nnou(source.byId),
    shouldReject: (source) => nnou(source.error),
    errorSelector: (source) => source.error,
    resultSelector: (source) => Object.values(reversePluckProps(source.byId, '/component/level-descriptor'))
  });

  return (
    <>
      <SuspenseWithEmptyState
        resource={resource}
        loadingStateProps={{
          title: <FormattedMessage id="componentsPanel.suspenseStateMessage" defaultMessage="Retrieving Page Model" />
        }}
        withEmptyStateProps={{
          emptyStateProps: {
            title: <FormattedMessage id="componentsPanel.emptyStateMessage" defaultMessage="No components found" />,
            subtitle: (
              <FormattedMessage
                id="componentsPanel.emptyStateMessageSubtitle"
                defaultMessage="Communicate with your developers to create the required components in the system."
              />
            )
          }
        }}
      >
        <ComponentsPanelUI resource={resource} />
      </SuspenseWithEmptyState>
    </>
  );
}

export const ComponentsPanelUI: React.FC<ComponentsPanelUIProps> = (props) => {
  const { resource } = props;

  const contentTypes = resource.read();
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const editMode = useSelection((state) => state.preview.editMode);

  const hostToGuest$ = getHostToGuestBus();
  const [menuContext, setMenuContext] = useState<{ anchor: Element; contentType: ContentType }>();
  const componentTypes = useMemo(() => contentTypes.filter((contentType) => contentType.type === 'component'), [
    contentTypes
  ]);

  const onDragStart = (contentType) => {
    if (!editMode) {
      dispatch(setPreviewEditMode({ editMode: true }));
    }
    hostToGuest$.next({ type: COMPONENT_DRAG_STARTED, payload: contentType });
  };

  const onDragEnd = () => hostToGuest$.next({ type: COMPONENT_DRAG_ENDED });

  const onMenuClose = () => setMenuContext(null);

  const onBrowseSharedInstancesClicked = () => {
    dispatch(
      batchActions([
        setContentTypeFilter(menuContext.contentType.id),
        pushToolsPanelPage(
          createToolsPanelPage({ id: 'previewBrowseComponentsPanel.title' }, [
            createWidgetDescriptor({ id: 'craftercms.components.PreviewBrowseComponentsPanel' })
          ])
        )
      ])
    );
  };

  const onListInPageInstancesClick = () => {
    dispatch(
      batchActions([
        setContentTypeFilter(menuContext.contentType.id),
        pushToolsPanelPage(
          createToolsPanelPage({ id: 'previewInPageInstancesPanel.title' }, [
            createWidgetDescriptor({ id: 'craftercms.components.PreviewInPageInstancesPanel' })
          ])
        )
      ])
    );
  };

  const onListDropTargetsClick = () => {
    dispatch(
      pushToolsPanelPage(
        createToolsPanelPage({ id: 'previewDropTargetsPanel.title', defaultMessage: 'Component Drop Targets' }, [
          createWidgetDescriptor({ id: 'craftercms.components.PreviewDropTargetsPanel' })
        ])
      )
    );
    hostToGuest$.next({
      type: CONTENT_TYPE_DROP_TARGETS_REQUEST,
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
