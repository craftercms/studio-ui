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

import { components } from '../services/plugin';
import { lazy } from 'react';

export const registerComponents = () => {
  Object.entries({
    '@mui/icons-material/SearchRounded': lazy(() => import('@mui/icons-material/SearchRounded')),
    '@mui/icons-material/ExtensionOutlined': lazy(() => import('@mui/icons-material/ExtensionOutlined')),
    '@mui/icons-material/ImageOutlined': lazy(() => import('@mui/icons-material/ImageOutlined')),
    '@mui/icons-material/EmojiPeopleRounded': lazy(() => import('@mui/icons-material/EmojiPeopleRounded')),
    '@mui/icons-material/DevicesRounded': lazy(() => import('@mui/icons-material/DevicesRounded')),
    '@mui/icons-material/BrushOutlined': lazy(() => import('@mui/icons-material/BrushOutlined')),
    '@mui/icons-material/SettingsOutlined': lazy(() => import('@mui/icons-material/SettingsOutlined')),
    '@mui/icons-material/DashboardRounded': lazy(() => import('@mui/icons-material/DashboardRounded')),
    '@mui/icons-material/TuneRounded': lazy(() => import('@mui/icons-material/TuneRounded')),
    '@mui/icons-material/DescriptionOutlined': lazy(() => import('@mui/icons-material/DescriptionOutlined')),
    '@mui/icons-material/DescriptionRounded': lazy(() => import('@mui/icons-material/DescriptionRounded')),
    '@mui/icons-material/ExtensionRounded': lazy(() => import('@mui/icons-material/ExtensionRounded')),
    '@mui/icons-material/LocalOfferOutlined': lazy(() => import('@mui/icons-material/LocalOfferOutlined')),
    '@mui/icons-material/LocalOfferRounded': lazy(() => import('@mui/icons-material/LocalOfferRounded')),
    '@mui/icons-material/ImageRounded': lazy(() => import('@mui/icons-material/ImageRounded')),
    '@mui/icons-material/CodeRounded': lazy(() => import('@mui/icons-material/CodeRounded')),
    '@mui/icons-material/InsertDriveFileRounded': lazy(() => import('@mui/icons-material/InsertDriveFileRounded')),
    '@mui/icons-material/InsertDriveFileOutlined': lazy(() => import('@mui/icons-material/InsertDriveFileOutlined')),
    '@mui/icons-material/WidgetsOutlined': lazy(() => import('@mui/icons-material/WidgetsOutlined')),
    '@mui/icons-material/LockOutlined': lazy(() => import('@mui/icons-material/LockOutlined')),
    '@mui/icons-material/SettingsApplicationsOutlined': lazy(
      () => import('@mui/icons-material/SettingsApplicationsOutlined')
    ),
    '@mui/icons-material/FormatAlignJustifyRounded': lazy(
      () => import('@mui/icons-material/FormatAlignJustifyRounded')
    ),
    '@mui/icons-material/FormatAlignLeftRounded': lazy(() => import('@mui/icons-material/FormatAlignLeftRounded')),
    '@mui/icons-material/CloudUploadOutlined': lazy(() => import('@mui/icons-material/CloudUploadOutlined')),
    '@mui/icons-material/PollOutlined': lazy(() => import('@mui/icons-material/PollOutlined')),
    'craftercms.icons.PageExplorer': lazy(() => import('../components/Icons/PageExplorerRounded')),
    'craftercms.icons.SiteExplorer': lazy(() => import('../components/Icons/SiteExplorerRounded')),
    'craftercms.icons.Component': lazy(() => import('../components/Icons/Component')),
    'craftercms.icons.GraphQL': lazy(() => import('../components/Icons/GraphQL')),
    'craftercms.components.LauncherLinkTile': lazy(() => import('../components/LauncherLinkTile')),
    'craftercms.components.LauncherPublishingStatusTile': lazy(
      () => import('../components/LauncherPublishingStatusTile')
    ),
    'craftercms.components.LauncherSection': lazy(() => import('../components/LauncherSection')),
    'craftercms.components.LauncherGlobalNav': lazy(() => import('../components/LauncherGlobalNav')),
    'craftercms.icons.Preview': lazy(() => import('../components/Icons/Preview')),
    'craftercms.icons.CrafterIcon': lazy(() => import('../components/Icons/About')),
    'craftercms.icons.Docs': lazy(() => import('../components/Icons/Docs')),
    'craftercms.icons.Sites': lazy(() => import('../components/Icons/SitesRounded')),
    '@mui/icons-material/BuildRounded': lazy(() => import('@mui/icons-material/BuildRounded')),
    '@mui/icons-material/AccountCircleRounded': lazy(() => import('@mui/icons-material/AccountCircleRounded')),
    '@mui/icons-material/PeopleRounded': lazy(() => import('@mui/icons-material/PeopleRounded')),
    '@mui/icons-material/SupervisedUserCircleRounded': lazy(
      () => import('@mui/icons-material/SupervisedUserCircleRounded')
    ),
    '@mui/icons-material/StorageRounded': lazy(() => import('@mui/icons-material/StorageRounded')),
    '@mui/icons-material/SubjectRounded': lazy(() => import('@mui/icons-material/SubjectRounded')),
    '@mui/icons-material/SettingsApplicationsRounded': lazy(
      () => import('@mui/icons-material/SettingsApplicationsRounded')
    ),
    '@mui/icons-material/FormatAlignCenterRounded': lazy(() => import('@mui/icons-material/FormatAlignCenterRounded')),
    '@mui/icons-material/LockRounded': lazy(() => import('@mui/icons-material/LockRounded')),
    '@mui/icons-material/VpnKeyRounded': lazy(() => import('@mui/icons-material/VpnKeyRounded')),
    '@mui/icons-material/PublicRounded': lazy(() => import('@mui/icons-material/PublicRounded')),
    '@mui/icons-material/VideocamOutlined': lazy(() => import('@mui/icons-material/VideocamOutlined')),
    'craftercms.components.ToolsPanelEmbeddedAppViewButton': lazy(
      () => import('../components/ToolsPanelEmbeddedAppViewButton')
    ),
    'craftercms.components.ToolsPanelPageButton': lazy(() => import('../components/ToolsPanelPageButton')),
    'craftercms.components.PathNavigator': lazy(() => import('../components/PathNavigator')),
    'craftercms.components.PathNavigatorTree': lazy(() => import('../components/PathNavigatorTree')),
    'craftercms.components.ToolsPanelPage': lazy(() => import('../components/ToolsPanelPage/ToolsPanelPage')),
    'craftercms.components.PreviewSearchPanel': lazy(() => import('../components/PreviewSearchPanel')),
    'craftercms.components.PreviewComponentsPanel': lazy(() => import('../components/PreviewComponentsPanel')),
    'craftercms.components.PreviewAssetsPanel': lazy(() => import('../components/PreviewAssetsPanel')),
    'craftercms.components.PreviewAudiencesPanel': lazy(() => import('../components/PreviewAudiencesPanel')),
    'craftercms.components.PreviewPageExplorerPanel': lazy(() => import('../components/PreviewPageExplorerPanel')),
    'craftercms.components.PreviewSimulatorPanel': lazy(() => import('../components/PreviewSimulatorPanel')),
    'craftercms.components.PreviewBrowseComponentsPanel': lazy(
      () => import('../components/PreviewBrowseComponentsPanel')
    ),
    'craftercms.components.PreviewInPageInstancesPanel': lazy(
      () => import('../components/PreviewInPageInstancesPanel')
    ),
    'craftercms.components.PreviewDropTargetsPanel': lazy(() => import('../components/PreviewDropTargetsPanel')),
    'craftercms.components.LegacySiteToolsFrame': lazy(() => import('../components/LegacySiteToolsFrame')),
    'craftercms.components.LegacyDashboardFrame': lazy(() => import('../components/LegacyDashboardFrame')),
    'craftercms.components.PreviewSettingsPanel': lazy(() => import('../components/PreviewSettingsPanel')),
    'craftercms.components.PluginManagement': lazy(() => import('../components/PluginManagement')),
    'craftercms.component.EmptyState': lazy(() => import('../components/SystemStatus/EmptyState')),
    'craftercms.components.SiteEncryptTool': lazy(() => import('../components/SiteEncryptTool')),
    'craftercms.components.ContentTypeManagement': lazy(() => import('../components/ContentTypesManagement')),
    'craftercms.components.SiteConfigurationManagement': lazy(
      () => import('../components/SiteConfigurationManagement')
    ),
    'craftercms.components.SiteAuditManagement': lazy(() => import('../components/SiteAuditManagement')),
    'craftercms.components.LogConsole': lazy(() => import('../components/LogConsole')),
    'craftercms.components.PublishingDashboard': lazy(() => import('../components/PublishingDashboard')),
    'craftercms.components.SiteGraphiQL': lazy(() => import('../components/SiteGraphiQL')),
    'craftercms.components.EmbeddedSiteTools': lazy(() => import('../components/SiteToolsApp/EmbeddedSiteTools')),
    'craftercms.components.RemoteRepositoriesManagement': lazy(
      () => import('../components/RemoteRepositoriesManagement')
    ),
    'craftercms.components.ItemStatesManagement': lazy(() => import('../components/ItemStatesManagement')),
    'craftercms.components.AwaitingApprovalDashlet': lazy(() => import('../components/AwaitingApprovalDashlet')),
    'craftercms.components.RecentlyPublishedDashlet': lazy(() => import('../components/RecentlyPublishedDashlet')),
    'craftercms.components.ApprovedScheduledDashlet': lazy(() => import('../components/ApprovedScheduledDashlet')),
    'craftercms.components.RecentActivityDashlet': lazy(() => import('../components/RecentActivityDashlet')),
    'craftercms.components.IconGuideDashlet': lazy(() => import('../components/IconGuideDashlet')),
    'craftercms.components.PublishingStatusButton': lazy(() => import('../components/PublishingStatusButton')),
    'craftercms.components.QuickCreate': lazy(() => import('../modules/Preview/QuickCreate')),
    'craftercms.components.EditModeSwitch': lazy(() => import('../components/EditModeSwitch')),
    'craftercms.components.PreviewAddressBar': lazy(() => import('../components/PreviewAddressBar')),
    'craftercms.components.SiteSwitcherSelect': lazy(() => import('../components/SiteSwitcherSelect')),
    'craftercms.components.Dashboard': lazy(() => import('../components/Dashboard')),
    'craftercms.components.SiteToolsPanel': lazy(() => import('../components/SiteToolsPanel')),
    'craftercms.components.LegacyComponentsPanel': lazy(() => import('../components/LegacyComponentsPanel')),
    'craftercms.components.EditModesSwitcher': lazy(() => import('../components/EditModesSwitcher')),
    'craftercms.components.EmbeddedSearchIframe': lazy(() => import('../components/EmbeddedSearchIframe')),
    'craftercms.components.WidgetDialogIconButton': lazy(() => import('../components/WidgetDialogIconButton'))
  }).forEach(([id, component]) => {
    components.set(id, component);
  });
};
