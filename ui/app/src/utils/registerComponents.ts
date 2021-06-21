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
    '@material-ui/icons/SearchRounded': lazy(() => import('@material-ui/icons/SearchRounded')),
    '@material-ui/icons/ExtensionOutlined': lazy(() => import('@material-ui/icons/ExtensionOutlined')),
    '@material-ui/icons/ImageOutlined': lazy(() => import('@material-ui/icons/ImageOutlined')),
    '@material-ui/icons/EmojiPeopleRounded': lazy(() => import('@material-ui/icons/EmojiPeopleRounded')),
    '@material-ui/icons/DevicesRounded': lazy(() => import('@material-ui/icons/DevicesRounded')),
    '@material-ui/icons/BrushOutlined': lazy(() => import('@material-ui/icons/BrushOutlined')),
    '@material-ui/icons/SettingsOutlined': lazy(() => import('@material-ui/icons/SettingsOutlined')),
    '@material-ui/icons/DashboardRounded': lazy(() => import('@material-ui/icons/DashboardRounded')),
    '@material-ui/icons/TuneRounded': lazy(() => import('@material-ui/icons/TuneRounded')),
    '@material-ui/icons/DescriptionOutlined': lazy(() => import('@material-ui/icons/DescriptionOutlined')),
    '@material-ui/icons/DescriptionRounded': lazy(() => import('@material-ui/icons/DescriptionRounded')),
    '@material-ui/icons/ExtensionRounded': lazy(() => import('@material-ui/icons/ExtensionRounded')),
    '@material-ui/icons/LocalOfferOutlined': lazy(() => import('@material-ui/icons/LocalOfferOutlined')),
    '@material-ui/icons/LocalOfferRounded': lazy(() => import('@material-ui/icons/LocalOfferRounded')),
    '@material-ui/icons/ImageRounded': lazy(() => import('@material-ui/icons/ImageRounded')),
    '@material-ui/icons/CodeRounded': lazy(() => import('@material-ui/icons/CodeRounded')),
    '@material-ui/icons/InsertDriveFileRounded': lazy(() => import('@material-ui/icons/InsertDriveFileRounded')),
    '@material-ui/icons/InsertDriveFileOutlined': lazy(() => import('@material-ui/icons/InsertDriveFileOutlined')),
    '@material-ui/icons/WidgetsOutlined': lazy(() => import('@material-ui/icons/WidgetsOutlined')),
    '@material-ui/icons/LockOutlined': lazy(() => import('@material-ui/icons/LockOutlined')),
    '@material-ui/icons/SettingsApplicationsOutlined': lazy(() =>
      import('@material-ui/icons/SettingsApplicationsOutlined')
    ),
    '@material-ui/icons/FormatAlignJustifyRounded': lazy(() => import('@material-ui/icons/FormatAlignJustifyRounded')),
    '@material-ui/icons/FormatAlignLeftRounded': lazy(() => import('@material-ui/icons/FormatAlignLeftRounded')),
    '@material-ui/icons/CloudUploadOutlined': lazy(() => import('@material-ui/icons/CloudUploadOutlined')),
    '@material-ui/icons/PollOutlined': lazy(() => import('@material-ui/icons/PollOutlined')),
    'craftercms.icons.PageExplorer': lazy(() => import('../components/Icons/PageExplorerRounded')),
    'craftercms.icons.SiteExplorer': lazy(() => import('../components/Icons/SiteExplorerRounded')),
    'craftercms.icons.Component': lazy(() => import('../components/Icons/Component')),
    'craftercms.icons.GraphQL': lazy(() => import('../components/Icons/GraphQL')),
    'craftercms.components.LauncherLinkTile': lazy(() => import('../components/LauncherLinkTile')),
    'craftercms.components.LauncherPublishingStatusTile': lazy(() =>
      import('../components/LauncherPublishingStatusTile')
    ),
    'craftercms.components.LauncherSection': lazy(() => import('../components/LauncherSection')),
    'craftercms.components.LauncherGlobalNav': lazy(() => import('../components/LauncherGlobalNav')),
    'craftercms.icons.Preview': lazy(() => import('../components/Icons/Preview')),
    'craftercms.icons.CrafterIcon': lazy(() => import('../components/Icons/About')),
    'craftercms.icons.Docs': lazy(() => import('../components/Icons/Docs')),
    'craftercms.icons.Sites': lazy(() => import('../components/Icons/SitesRounded')),
    '@material-ui/icons/BuildRounded': lazy(() => import('@material-ui/icons/BuildRounded')),
    '@material-ui/icons/AccountCircleRounded': lazy(() => import('@material-ui/icons/AccountCircleRounded')),
    '@material-ui/icons/PeopleRounded': lazy(() => import('@material-ui/icons/PeopleRounded')),
    '@material-ui/icons/SupervisedUserCircleRounded': lazy(() =>
      import('@material-ui/icons/SupervisedUserCircleRounded')
    ),
    '@material-ui/icons/StorageRounded': lazy(() => import('@material-ui/icons/StorageRounded')),
    '@material-ui/icons/SubjectRounded': lazy(() => import('@material-ui/icons/SubjectRounded')),
    '@material-ui/icons/SettingsApplicationsRounded': lazy(() =>
      import('@material-ui/icons/SettingsApplicationsRounded')
    ),
    '@material-ui/icons/FormatAlignCenterRounded': lazy(() => import('@material-ui/icons/FormatAlignCenterRounded')),
    '@material-ui/icons/LockRounded': lazy(() => import('@material-ui/icons/LockRounded')),
    '@material-ui/icons/VpnKeyRounded': lazy(() => import('@material-ui/icons/VpnKeyRounded')),
    '@material-ui/icons/PublicRounded': lazy(() => import('@material-ui/icons/PublicRounded')),
    '@material-ui/icons/VideocamOutlined': lazy(() => import('@material-ui/icons/VideocamOutlined')),
    'craftercms.components.ToolsPanelEmbeddedAppViewButton': lazy(() =>
      import('../components/ToolsPanelEmbeddedAppViewButton')
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
    'craftercms.components.PreviewBrowseComponentsPanel': lazy(() =>
      import('../components/PreviewBrowseComponentsPanel')
    ),
    'craftercms.components.PreviewInPageInstancesPanel': lazy(() =>
      import('../components/PreviewInPageInstancesPanel')
    ),
    'craftercms.components.PreviewDropTargetsPanel': lazy(() => import('../components/PreviewDropTargetsPanel')),
    'craftercms.components.LegacySiteToolsFrame': lazy(() => import('../components/LegacySiteToolsFrame')),
    'craftercms.components.LegacyDashboardFrame': lazy(() => import('../components/LegacyDashboardFrame')),
    'craftercms.components.PreviewSettingsPanel': lazy(() => import('../components/PreviewSettingsPanel')),
    'craftercms.components.PluginManagement': lazy(() => import('../components/PluginManagement')),
    'craftercms.component.EmptyState': lazy(() => import('../components/SystemStatus/EmptyState')),
    'craftercms.components.SiteEncryptTool': lazy(() => import('../components/SiteEncryptTool')),
    'craftercms.components.SiteConfigurationManagement': lazy(() =>
      import('../components/SiteConfigurationManagement')
    ),
    'craftercms.components.SiteAuditManagement': lazy(() => import('../components/SiteAuditManagement')),
    'craftercms.components.LogConsole': lazy(() => import('../components/LogConsole')),
    'craftercms.components.PublishingDashboard': lazy(() => import('../components/PublishingDashboard')),
    'craftercms.components.SiteGraphiQL': lazy(() => import('../components/SiteGraphiQL')),
    'craftercms.components.SiteToolsApp': lazy(() => import('../components/SiteToolsApp')),
    'craftercms.components.RemoteRepositoriesManagement': lazy(() =>
      import('../components/RemoteRepositoriesManagement')
    ),
    'craftercms.components.ItemStatesManagement': lazy(() => import('../components/ItemStatesManagement')),
    'craftercms.components.AwaitingApprovalDashlet': lazy(() => import('../components/AwaitingApprovalDashlet')),
    'craftercms.components.RecentlyPublishedDashlet': lazy(() => import('../components/RecentlyPublishedDashlet')),
    'craftercms.components.ApprovedScheduledDashlet': lazy(() => import('../components/ApprovedScheduledDashlet')),
    'craftercms.components.RecentActivityDashlet': lazy(() => import('../components/RecentActivityDashlet')),
    'craftercms.compnents.IconGuideDashlet': lazy(() => import('../components/IconGuideDashlet')),
    'craftercms.components.PublishingStatusButton': lazy(() => import('../components/PublishingStatusButton')),
    'craftercms.components.QuickCreate': lazy(() => import('../modules/Preview/QuickCreate')),
    'craftercms.components.EditModeSwitch': lazy(() => import('../components/EditModeSwitch')),
    'craftercms.components.PreviewAddressBar': lazy(() => import('../components/PreviewAddressBar')),
    'craftercms.components.SiteSwitcherSelect': lazy(() => import('../components/SiteSwitcherSelect')),
    'craftercms.components.Dashboard': lazy(() => import('../components/Dashboard'))
  }).forEach(([id, component]) => {
    components.set(id, component);
  });
};
