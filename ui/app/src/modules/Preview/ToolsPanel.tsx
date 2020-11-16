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

import React, { useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import { defineMessages } from 'react-intl';
import { updateToolsPanelWidth } from '../../state/actions/preview';
import { useDispatch } from 'react-redux';
import { useActiveSiteId, useLogicResource, usePreviewState, useSelection } from '../../utils/hooks';
import ResizeableDrawer from './ResizeableDrawer';
import { ErrorBoundary } from '../../components/SystemStatus/ErrorBoundary';
import ToolsPanelEmbeddedAppViewButton from '../../components/ToolsPanelEmbeddedAppViewButton';
import ToolsPanelPageButton from '../../components/ToolsPanelPageButton';
import PathNavigator from '../../components/Navigation/PathNavigator/PathNavigator';
import ToolsPanelPageComponent from '../../components/ToolsPanelPage';
import { components } from '../../utils/craftercms';
import { fetchSiteUiConfig } from '../../state/actions/configuration';
import GlobalState from '../../models/GlobalState';
import Suspencified from '../../components/SystemStatus/Suspencified';
import { renderWidgets } from '../../components/Widget';
import LookupTable from '../../models/LookupTable';

const translations = defineMessages({
  unknownPanelTitle: {
    id: 'unknownPanel.title',
    defaultMessage: 'Unknown Panel'
  },
  componentsPanelTitle: {
    id: 'componentsPanel.title',
    defaultMessage: 'Components'
  },
  assetsPanelTitle: {
    id: 'assetsPanel.title',
    defaultMessage: 'Assets'
  },
  audiencesPanelTitle: {
    id: 'audiencesPanel.title',
    defaultMessage: 'Audience Targeting'
  },
  simulatorPanelTitle: {
    id: 'simulatorPanelTitle.title',
    defaultMessage: 'Device Simulator'
  },
  browseComponentsPanelTitle: {
    id: 'browseComponentsPanel.title',
    defaultMessage: 'Browse Components'
  },
  pageExplorerPanelTitle: {
    id: 'pageExplorerPanel.title',
    defaultMessage: 'Page Explorer'
  },
  searchPanelTitle: {
    id: 'searchPanel.title',
    defaultMessage: 'Search Everywhere'
  },
  loading: {
    id: 'words.loading',
    defaultMessage: 'Loading'
  },
  siteExplorerPanelTitle: {
    id: 'siteExplorerPanel.title',
    defaultMessage: 'Site Explorer'
  }
});

export interface ToolsPanelPage {
  id: string;
  roles: string[];
  configuration: LookupTable<string>;
}

export default function ToolsPanel() {
  const dispatch = useDispatch();
  const site = useActiveSiteId();
  const { showToolsPanel } = usePreviewState();
  const toolsPanelWidth = useSelection<number>((state) => state.preview.toolsPanelWidth);
  const pages = useSelection<ToolsPanelPage[]>((state) => state.preview.toolsPanelPageStack);
  const uiConfig = useSelection<GlobalState['uiConfig']>((state) => state.uiConfig);

  const widgetResource = useLogicResource(uiConfig, {
    errorSelector: (source) => source.error,
    resultSelector: (source) => source.preview.toolsPanel.widgets,
    shouldReject: (source) => Boolean(source.error),
    shouldResolve: (source) => Boolean(source.preview.toolsPanel),
    shouldRenew: (source) => source.isFetching && Boolean(source.preview.toolsPanel)
  });

  const pagesResource = useLogicResource(pages, {
    errorSelector: (source) => null,
    resultSelector: (source) => source,
    shouldReject: (source) => null,
    shouldResolve: (source) => Boolean(source),
    shouldRenew: (source) => null
  });

  useEffect(() => {
    dispatch(fetchSiteUiConfig({ site }));
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
      <ErrorBoundary>
        <Suspencified>
          <ToolsPaneBody resource={{ widgetResource, pagesResource }} />
        </Suspencified>
      </ErrorBoundary>
    </ResizeableDrawer>
  );
}

function ToolsPaneBody(props) {
  const widget = props.resource.widgetResource.read();
  const pages = props.resource.pagesResource.read();
  const stack = pages.length ? pages : widget;

  return <>{renderWidgets(stack, ['admin'])}</>;
}

function Search() {
  return <Typography>Hello, this is the search app.</Typography>;
}

Object.entries({
  'craftercms.component.ToolsPanelEmbeddedAppViewButton': ToolsPanelEmbeddedAppViewButton,
  'craftercms.component.ToolsPanelPageButton': ToolsPanelPageButton,
  'craftercms.component.search': Search,
  'craftercms.component.PathNavigator': PathNavigator,
  'craftercms.component.ToolsPanelPage': ToolsPanelPageComponent
}).forEach(([id, component]) => {
  components.set(id, component);
});
