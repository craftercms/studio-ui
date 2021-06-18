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

import SearchIcon from '@material-ui/icons/SearchRounded';
import ExtensionOutlinedIcon from '@material-ui/icons/ExtensionOutlined';
import Asset from '@material-ui/icons/ImageOutlined';
import Audiences from '@material-ui/icons/EmojiPeopleRounded';
import Simulator from '@material-ui/icons/DevicesRounded';
import BrushOutlinedIcon from '@material-ui/icons/BrushOutlined';
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined';
import DashboardRoundedIcon from '@material-ui/icons/DashboardRounded';
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
import PageExplorer from '../components/Icons/PageExplorerRounded';
import SiteExplorer from '../components/Icons/SiteExplorerRounded';
import Component from '../components/Icons/Component';
import GraphQL from '../components/Icons/GraphQL';
import { components } from '../services/plugin';
import LauncherLinkTile from '../components/LauncherLinkTile';
import LauncherPublishingStatusTile from '../components/LauncherPublishingStatusTile';
import LauncherSection from '../components/LauncherSection';
import LauncherGlobalNav from '../components/LauncherGlobalNav';
import PreviewIcon from '../components/Icons/Preview';
import About from '../components/Icons/About';
import Docs from '../components/Icons/Docs';
import SitesRounded from '../components/Icons/SitesRounded';
import BuildIcon from '@material-ui/icons/BuildRounded';
import AccountCircleRounded from '@material-ui/icons/AccountCircleRounded';
import PeopleRounded from '@material-ui/icons/PeopleRounded';
import SupervisedUserCircleRounded from '@material-ui/icons/SupervisedUserCircleRounded';
import StorageRounded from '@material-ui/icons/StorageRounded';
import SubjectRounded from '@material-ui/icons/SubjectRounded';
import SettingsApplicationsRounded from '@material-ui/icons/SettingsApplicationsRounded';
import FormatAlignCenterRounded from '@material-ui/icons/FormatAlignCenterRounded';
import LockRounded from '@material-ui/icons/LockRounded';
import VpnKeyRounded from '@material-ui/icons/VpnKeyRounded';
import PublicRounded from '@material-ui/icons/PublicRounded';
import VideocamOutlinedIcon from '@material-ui/icons/VideocamOutlined';
import { lazy } from 'react';

export const registerComponents = () => {
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
    'craftercms.components.LauncherLinkTile': LauncherLinkTile,
    'craftercms.components.LauncherPublishingStatusTile': LauncherPublishingStatusTile,
    'craftercms.components.LauncherSection': LauncherSection,
    'craftercms.components.LauncherGlobalNav': LauncherGlobalNav,
    'craftercms.icons.Preview': PreviewIcon,
    'craftercms.icons.CrafterIcon': About,
    'craftercms.icons.Docs': Docs,
    'craftercms.icons.Sites': SitesRounded,
    '@material-ui/icons/BuildRounded': BuildIcon,
    '@material-ui/icons/AccountCircleRounded': AccountCircleRounded,
    '@material-ui/icons/PeopleRounded': PeopleRounded,
    '@material-ui/icons/SupervisedUserCircleRounded': SupervisedUserCircleRounded,
    '@material-ui/icons/StorageRounded': StorageRounded,
    '@material-ui/icons/SubjectRounded': SubjectRounded,
    '@material-ui/icons/SettingsApplicationsRounded': SettingsApplicationsRounded,
    '@material-ui/icons/FormatAlignCenterRounded': FormatAlignCenterRounded,
    '@material-ui/icons/LockRounded': LockRounded,
    '@material-ui/icons/VpnKeyRounded': VpnKeyRounded,
    '@material-ui/icons/PublicRounded': PublicRounded,
    '@material-ui/icons/VideocamOutlined': VideocamOutlinedIcon,
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
