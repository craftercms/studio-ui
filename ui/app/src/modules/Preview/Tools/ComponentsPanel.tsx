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
import ToolPanel from './ToolPanel';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import List from '@material-ui/core/List';
import ContentType from '../../../models/ContentType';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import { getHostToGuestBus } from '../previewContext';
import {
  browseSharedInstance,
  COMPONENT_DRAG_ENDED,
  COMPONENT_DRAG_STARTED,
  CONTENT_TYPE_RECEPTACLES_REQUEST,
  selectTool
} from '../../../state/actions/preview';
import { useStateResourceSelection } from '../../../utils/hooks';
import { EntityState } from '../../../models/GlobalState';
import { nnou } from '../../../utils/object';
import { DraggablePanelListItem } from './DraggablePanelListItem';
import { useDispatch } from 'react-redux';
import { PropsWithResource, SuspenseWithEmptyState } from '../../../components/SystemStatus/Suspencified';

const translations = defineMessages({
  componentsPanel: {
    id: 'craftercms.ice.components.title',
    defaultMessage: 'Components'
  },
  browse: {
    id: 'craftercms.ice.components.browse',
    defaultMessage: 'Browse existing instances'
  }
});

type ComponentsPanelUIProps = PropsWithResource<ContentType[]>;

export default function ComponentsPanel() {
  const resource = useStateResourceSelection<ContentType[], EntityState<ContentType>>(
    (state) => state.contentTypes,
    {
      shouldRenew: (source, resource) => resource.complete,
      shouldResolve: (source) => !source.isFetching && nnou(source.byId),
      shouldReject: (source) => nnou(source.error),
      errorSelector: (source) => source.error,
      resultSelector: (source) => Object.values(source.byId)
    }
  );

  return (
    <ToolPanel title={translations.componentsPanel}>
      <SuspenseWithEmptyState
        resource={resource}
        loadingStateProps={{
          title: (
            <FormattedMessage
              id="componentsPanel.suspenseStateMessage"
              defaultMessage="Retrieving Page Model"
            />
          )
        }}
        withEmptyStateProps={{
          emptyStateProps: {
            title: (
              <FormattedMessage
                id="componentsPanel.emptyStateMessage"
                defaultMessage="No components found"
              />
            ),
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
    </ToolPanel>
  );
}

// export function ComponentsPanelUI(props: ComponentsPanelUIProps) {
export const ComponentsPanelUI: React.FC<ComponentsPanelUIProps> = (props) => {
  const { resource } = props;

  const contentTypes = resource.read();
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const hostToGuest$ = getHostToGuestBus();
  const [menuContext, setMenuContext] = useState<{ anchor: Element; contentType: ContentType }>();
  const componentTypes = useMemo(
    () => contentTypes.filter((contentType) => contentType.type === 'component'),
    [contentTypes]
  );

  const onDragStart = (contentType) =>
    hostToGuest$.next({ type: COMPONENT_DRAG_STARTED, payload: contentType });

  const onDragEnd = () => hostToGuest$.next({ type: COMPONENT_DRAG_ENDED });

  const onMenuClose = () => setMenuContext(null);

  const onMenuOptionClicked = () => setMenuContext(null);

  const onBrowseSharedInstancesClicked = () => {
    dispatch(browseSharedInstance(menuContext.contentType.id));
  };

  const onListReceptaclesClick = () => {
    dispatch(selectTool('craftercms.ice.contentTypeReceptacles'));
    hostToGuest$.next({
      type: CONTENT_TYPE_RECEPTACLES_REQUEST,
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
        <MenuItem onClick={onMenuOptionClicked}>List in-page instances</MenuItem>
        <MenuItem onClick={onBrowseSharedInstancesClicked}>
          {formatMessage(translations.browse)}
        </MenuItem>
        <MenuItem onClick={onListReceptaclesClick}>List receptacles</MenuItem>
      </Menu>
    </>
  );
};
