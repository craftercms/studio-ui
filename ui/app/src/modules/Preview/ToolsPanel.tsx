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
import TuneRoundedIcon from '@material-ui/icons/TuneRounded';
import DescriptionOutlined from '@material-ui/icons/DescriptionOutlined';
import DescriptionRounded from '@material-ui/icons/DescriptionRounded';
import ExtensionRoundedIcon from '@material-ui/icons/ExtensionRounded';
import LocalOfferOutlinedIcon from '@material-ui/icons/LocalOfferOutlined';
import LocalOfferRoundedIcon from '@material-ui/icons/LocalOfferRounded';
import ImageRoundedIcon from '@material-ui/icons/ImageRounded';
import CodeRoundedIcon from '@material-ui/icons/CodeRounded';
import InsertDriveFileRoundedIcon from '@material-ui/icons/InsertDriveFileRounded';
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import WidgetsOutlinedIcon from '@material-ui/icons/WidgetsOutlined';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import SettingsApplicationsOutlinedIcon from '@material-ui/icons/SettingsApplicationsOutlined';
import FormatAlignJustifyRoundedIcon from '@material-ui/icons/FormatAlignJustifyRounded';
import FormatAlignLeftRoundedIcon from '@material-ui/icons/FormatAlignLeftRounded';
import CloudUploadOutlinedIcon from '@material-ui/icons/CloudUploadOutlined';
import PollOutlinedIcon from '@material-ui/icons/PollOutlined';
import DashboardRoundedIcon from '@material-ui/icons/DashboardRounded';
import Component from '../../components/Icons/Component';
import EmptyState from '../../components/SystemStatus/EmptyState';
import GraphQL from '../../components/Icons/GraphQL';
import SiteEncryptTool from '../../components/SiteEncryptTool';
import SiteConfigurationManagement from '../../components/SiteConfigurationManagement';
import AuditSiteManagement from '../../components/AuditSiteManagement';
import LogConsole from '../../components/LogConsole';
import PublishingDashboard from '../../components/PublishingDashboard';
import Graphi from '../../components/GraphiQL';

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
  '@material-ui/icons/DashboardRounded': DashboardRoundedIcon,
  '@material-ui/icons/TuneRounded': TuneRoundedIcon,
  '@material-ui/icons/DescriptionOutlined': DescriptionOutlined,
  '@material-ui/icons/DescriptionRounded': DescriptionRounded,
  '@material-ui/icons/ExtensionRounded': ExtensionRoundedIcon,
  '@material-ui/icons/LocalOfferOutlined': LocalOfferOutlinedIcon,
  '@material-ui/icons/LocalOfferRounded': LocalOfferRoundedIcon,
  '@material-ui/icons/ImageRounded': ImageRoundedIcon,
  '@material-ui/icons/CodeRounded': CodeRoundedIcon,
  '@material-ui/icons/InsertDriveFileRounded': InsertDriveFileRoundedIcon,
  '@material-ui/icons/InsertDriveFileOutlined': InsertDriveFileOutlinedIcon,
  '@material-ui/icons/WidgetsOutlined': WidgetsOutlinedIcon,
  '@material-ui/icons/LockOutlined': LockOutlinedIcon,
  '@material-ui/icons/SettingsApplicationsOutlined': SettingsApplicationsOutlinedIcon,
  '@material-ui/icons/FormatAlignJustifyRounded': FormatAlignJustifyRoundedIcon,
  '@material-ui/icons/FormatAlignLeftRounded': FormatAlignLeftRoundedIcon,
  '@material-ui/icons/CloudUploadOutlined': CloudUploadOutlinedIcon,
  '@material-ui/icons/PollOutlined': PollOutlinedIcon,
  'craftercms.icons.PageExplorer': PageExplorer,
  'craftercms.icons.SiteExplorer': SiteExplorer,
  'craftercms.icons.Component': Component,
  'craftercms.icons.GraphQL': GraphQL,
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
  'craftercms.components.PluginManagement': PluginManagement,
  'craftercms.component.EmptyState': EmptyState,
  'craftercms.components.SiteEncryptTool': SiteEncryptTool,
  'craftercms.components.SiteConfigurationManagement': SiteConfigurationManagement,
  'craftercms.components.AuditSiteManagement': AuditSiteManagement,
  'craftercms.components.LogConsole': LogConsole,
  'craftercms.components.PublishingDashboard': PublishingDashboard,
  'craftercms.components.Graphi': Graphi
}).forEach(([id, component]) => {
  components.set(id, component);
});
