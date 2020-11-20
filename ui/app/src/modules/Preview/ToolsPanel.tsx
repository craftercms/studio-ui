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

import React, { useEffect, useMemo } from 'react';
import { defineMessages } from 'react-intl';
import { updateToolsPanelWidth } from '../../state/actions/preview';
import { useDispatch } from 'react-redux';
import { useActiveSiteId, useLogicResource, usePreviewState, useSelection } from '../../utils/hooks';
import ResizeableDrawer from './ResizeableDrawer';
import ToolsPanelEmbeddedAppViewButton from '../../components/ToolsPanelEmbeddedAppViewButton';
import ToolsPanelPageButton from '../../components/ToolsPanelPageButton';
import PathNavigator from '../../components/Navigation/PathNavigator/PathNavigator';
import ToolsPanelPageComponent from '../../components/ToolsPanelPage';
import { fetchSiteUiConfig } from '../../state/actions/configuration';
import GlobalState from '../../models/GlobalState';
import { renderWidgets, WidgetDescriptor } from '../../components/Widget';
import { components } from '../../services/plugin';
import PreviewSearchPanel from '../../components/PreviewSearchPanel';
import PreviewComponentsPanel from '../../components/PreviewComponentsPanel';
import PreviewAssetsPanel from '../../components/PreviewAssetsPanel';
import PreviewAudiencesPanel from '../../components/PreviewAudiencesPanel';
import PreviewPageExplorerPanel from '../../components/PreviewPageExplorerPanel';
import PreviewSimulatorPanel from '../../components/PreviewSimulatorPanel';
import { Resource } from '../../models/Resource';
import PreviewBrowseComponentsPanel from '../../components/PreviewBrowseComponentsPanel/PreviewBrowseComponentsPanel';
import Suspencified from '../../components/SystemStatus/Suspencified';
import PreviewInPageInstancesPanel from '../../components/PreviewInPageInstancesPanel';
import PreviewReceptaclesPanel from '../../components/PreviewReceptaclesPanel';
import LegacySiteToolsFrame from '../../components/LegacySiteToolsFrame';

defineMessages({
  previewSiteExplorerPanelTitle: {
    id: 'previewSiteExplorerPanel.title',
    defaultMessage: 'Site Explorer'
  }
});

export default function ToolsPanel() {
  const dispatch = useDispatch();
  const site = useActiveSiteId();
  const { showToolsPanel } = usePreviewState();
  const toolsPanelWidth = useSelection<number>((state) => state.preview.toolsPanelWidth);
  const pages = useSelection<WidgetDescriptor[]>((state) => state.preview.toolsPanelPageStack);
  const uiConfig = useSelection<GlobalState['uiConfig']>((state) => state.uiConfig);

  const resource = useLogicResource<
    WidgetDescriptor[],
    { pages: WidgetDescriptor[]; uiConfig: GlobalState['uiConfig'] }
  >(
    useMemo(() => ({ pages, uiConfig }), [pages, uiConfig]),
    {
      errorSelector: (source) => source.uiConfig.error,
      resultSelector: (source) =>
        source.pages.length ? pages.slice(pages.length - 1) : source.uiConfig.preview.toolsPanel.widgets,
      shouldReject: (source) => Boolean(source.uiConfig.error),
      shouldResolve: (source) => Boolean(source.uiConfig.preview.toolsPanel.widgets),
      shouldRenew: (source, resource) => source.uiConfig.isFetching || resource.complete
    }
  );

  useEffect(() => {
    if (site) {
      dispatch(fetchSiteUiConfig({ site }));
    }
  }, [dispatch, site]);

  return (
    <ResizeableDrawer
      open={showToolsPanel}
      width={toolsPanelWidth}
      onWidthChange={(width) => {
        dispatch(
          updateToolsPanelWidth({
            width
          })
        );
      }}
    >
      <Suspencified>
        <ToolsPaneBody resource={resource} />
      </Suspencified>
    </ResizeableDrawer>
  );
}

interface ToolsPaneBodyProps {
  resource: Resource<WidgetDescriptor[]>;
}

function ToolsPaneBody(props: ToolsPaneBodyProps) {
  const stack = props.resource.read();
  return <>{renderWidgets(stack, ['admin'])}</>;
}

// TODO: Move this to a better place.
Object.entries({
  'craftercms.components.ToolsPanelEmbeddedAppViewButton': ToolsPanelEmbeddedAppViewButton,
  'craftercms.components.ToolsPanelPageButton': ToolsPanelPageButton,
  'craftercms.components.PathNavigator': PathNavigator,
  'craftercms.components.ToolsPanelPage': ToolsPanelPageComponent,
  'craftercms.components.PreviewSearchPanel': PreviewSearchPanel,
  'craftercms.components.PreviewComponentsPanel': PreviewComponentsPanel,
  'craftercms.components.PreviewAssetsPanel': PreviewAssetsPanel,
  'craftercms.components.PreviewAudiencesPanel': PreviewAudiencesPanel,
  'craftercms.components.PreviewPageExplorerPanel': PreviewPageExplorerPanel,
  'craftercms.components.PreviewSimulatorPanel': PreviewSimulatorPanel,
  'craftercms.components.PreviewBrowseComponentsPanel': PreviewBrowseComponentsPanel,
  'craftercms.components.PreviewInPageInstancesPanel': PreviewInPageInstancesPanel,
  'craftercms.components.PreviewReceptaclesPanel': PreviewReceptaclesPanel,
  'craftercms.components.LegacySiteToolsFrame': LegacySiteToolsFrame
}).forEach(([id, component]) => {
  components.set(id, component);
});
