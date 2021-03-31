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

import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { updateToolsPanelWidth } from '../../state/actions/preview';
import { useDispatch } from 'react-redux';
import {
  useActiveSiteId,
  useActiveUser,
  useLogicResource,
  usePreviewState,
  useSelection,
  useSiteUIConfig
} from '../../utils/hooks';
import ResizeableDrawer from './ResizeableDrawer';
import ToolsPanelEmbeddedAppViewButton from '../../components/ToolsPanelEmbeddedAppViewButton';
import ToolsPanelPageButton from '../../components/ToolsPanelPageButton';
import PathNavigator from '../../components/PathNavigator/PathNavigator';
import ToolsPanelPageComponent from '../../components/ToolsPanelPage';
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
import { SuspenseWithEmptyState } from '../../components/SystemStatus/Suspencified';
import PreviewInPageInstancesPanel from '../../components/PreviewInPageInstancesPanel';
import PreviewDropTargetsPanel from '../../components/PreviewDropTargetsPanel';
import LegacySiteToolsFrame from '../../components/LegacySiteToolsFrame';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import LegacyDashboardFrame from '../../components/LegacyDashboardFrame';
import SearchIcon from '@material-ui/icons/SearchRounded';
import Asset from '@material-ui/icons/ImageOutlined';
import ExtensionOutlinedIcon from '@material-ui/icons/ExtensionOutlined';
import Audiences from '@material-ui/icons/EmojiPeopleRounded';
import PageExplorer from '../../components/Icons/PageExplorerRounded';
import SiteExplorer from '../../components/Icons/SiteExplorerRounded';
import Simulator from '@material-ui/icons/DevicesRounded';
import BrushOutlinedIcon from '@material-ui/icons/BrushOutlined';
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined';
import PreviewSettingsPanel from '../../components/PreviewSettingsPanel';
import PluginManagement from '../../components/PluginManagement';
import PathNavigatorTree from '../../components/PathNavigatorTree';

defineMessages({
  previewSiteExplorerPanelTitle: {
    id: 'previewSiteExplorerPanel.title',
    defaultMessage: 'Site Explorer'
  }
});

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    emptyState: {
      margin: `${theme.spacing(4)}px ${theme.spacing(1)}px`
    },
    emptyStateImage: {
      width: '50%',
      marginBottom: theme.spacing(1)
    },
    loadingViewRoot: {
      flex: 1,
      flexDirection: 'row'
    }
  })
);

export default function ToolsPanel() {
  const dispatch = useDispatch();
  const site = useActiveSiteId();
  const classes = useStyles();
  const { showToolsPanel } = usePreviewState();
  const toolsPanelWidth = useSelection<number>((state) => state.preview.toolsPanelWidth);
  const pages = useSelection<WidgetDescriptor[]>((state) => state.preview.toolsPanelPageStack);
  const uiConfig = useSiteUIConfig();
  const baseUrl = useSelection<string>((state) => state.env.authoringBase);

  const resource = useLogicResource<WidgetDescriptor[], GlobalState['uiConfig']>(uiConfig, {
    errorSelector: (source) => source.error,
    resultSelector: (source) => source.preview.toolsPanel.widgets,
    shouldReject: (source) => Boolean(source.error),
    shouldResolve: (source) => Boolean(source.preview.toolsPanel.widgets),
    shouldRenew: (source, resource) => source.isFetching || resource.complete
  });

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
      <SuspenseWithEmptyState
        resource={resource}
        loadingStateProps={{
          classes: { root: classes.loadingViewRoot }
        }}
        withEmptyStateProps={{
          isEmpty: (widgets) => !site || widgets?.length === 0,
          emptyStateProps: {
            title: site ? (
              <FormattedMessage id="previewTools.noWidgetsMessage" defaultMessage="No tools have been configured" />
            ) : (
              <FormattedMessage id="previewTools.choseSiteMessage" defaultMessage="Please choose site" />
            ),
            ...(!site && { image: `${baseUrl}/static-assets/images/choose_option.svg` }),
            classes: { root: classes.emptyState, image: classes.emptyStateImage }
          }
        }}
      >
        <ToolsPaneBody resource={resource} pageStack={pages} />
      </SuspenseWithEmptyState>
    </ResizeableDrawer>
  );
}

interface ToolsPaneBodyProps {
  resource: Resource<WidgetDescriptor[]>;
  pageStack: WidgetDescriptor[];
}

function ToolsPaneBody(props: ToolsPaneBodyProps) {
  const root = props.resource.read();
  const site = useActiveSiteId();
  const { pageStack } = props;
  const { rolesBySite } = useActiveUser();
  return <>{renderWidgets(pageStack.length ? pageStack.slice(props.pageStack.length - 1) : root, rolesBySite[site])}</>;
}

// TODO: Move this to a better place.
Object.entries({
  '@material-ui/icons/SearchRounded': SearchIcon,
  '@material-ui/icons/ExtensionOutlined': ExtensionOutlinedIcon,
  '@material-ui/icons/ImageOutlined': Asset,
  '@material-ui/icons/EmojiPeopleRounded': Audiences,
  '@material-ui/icons/DevicesRounded': Simulator,
  '@material-ui/icons/BrushOutlined': BrushOutlinedIcon,
  '@material-ui/icons/SettingsOutlined': SettingsOutlinedIcon,
  'craftercms.icons.PageExplorer': PageExplorer,
  'craftercms.icons.SiteExplorer': SiteExplorer,
  'craftercms.components.ToolsPanelEmbeddedAppViewButton': ToolsPanelEmbeddedAppViewButton,
  'craftercms.components.ToolsPanelPageButton': ToolsPanelPageButton,
  'craftercms.components.PathNavigator': PathNavigator,
  'craftercms.components.PathNavigatorTree': PathNavigatorTree,
  'craftercms.components.ToolsPanelPage': ToolsPanelPageComponent,
  'craftercms.components.PreviewSearchPanel': PreviewSearchPanel,
  'craftercms.components.PreviewComponentsPanel': PreviewComponentsPanel,
  'craftercms.components.PreviewAssetsPanel': PreviewAssetsPanel,
  'craftercms.components.PreviewAudiencesPanel': PreviewAudiencesPanel,
  'craftercms.components.PreviewPageExplorerPanel': PreviewPageExplorerPanel,
  'craftercms.components.PreviewSimulatorPanel': PreviewSimulatorPanel,
  'craftercms.components.PreviewBrowseComponentsPanel': PreviewBrowseComponentsPanel,
  'craftercms.components.PreviewInPageInstancesPanel': PreviewInPageInstancesPanel,
  'craftercms.components.PreviewDropTargetsPanel': PreviewDropTargetsPanel,
  'craftercms.components.LegacySiteToolsFrame': LegacySiteToolsFrame,
  'craftercms.components.LegacyDashboardFrame': LegacyDashboardFrame,
  'craftercms.components.PreviewSettingsPanel': PreviewSettingsPanel,
  'craftercms.components.PluginManagement': PluginManagement
}).forEach(([id, component]) => {
  components.set(id, component);
});
