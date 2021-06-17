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
import ToolsPanelEmbeddedAppViewButton from '../components/ToolsPanelEmbeddedAppViewButton';
import ToolsPanelPageButton from '../components/ToolsPanelPageButton';
import PathNavigator from '../components/PathNavigator';
import PathNavigatorTree from '../components/PathNavigatorTree';
import ToolsPanelPageComponent from '../components/ToolsPanelPage/ToolsPanelPage';
import PreviewSearchPanel from '../components/PreviewSearchPanel';
import PreviewComponentsPanel from '../components/PreviewComponentsPanel';
import PreviewAssetsPanel from '../components/PreviewAssetsPanel';
import PreviewAudiencesPanel from '../components/PreviewAudiencesPanel';
import PreviewPageExplorerPanel from '../components/PreviewPageExplorerPanel';
import PreviewSimulatorPanel from '../components/PreviewSimulatorPanel';
import PreviewBrowseComponentsPanel from '../components/PreviewBrowseComponentsPanel';
import PreviewInPageInstancesPanel from '../components/PreviewInPageInstancesPanel';
import PreviewDropTargetsPanel from '../components/PreviewDropTargetsPanel';
import LegacySiteToolsFrame from '../components/LegacySiteToolsFrame';
import LegacyDashboardFrame from '../components/LegacyDashboardFrame';
import PreviewSettingsPanel from '../components/PreviewSettingsPanel';
import PluginManagement from '../components/PluginManagement';
import EmptyState from '../components/SystemStatus/EmptyState';
import SiteEncryptTool from '../components/SiteEncryptTool';
import SiteConfigurationManagement from '../components/SiteConfigurationManagement';
import SiteAuditManagement from '../components/SiteAuditManagement';
import LogConsole from '../components/LogConsole';
import PublishingDashboard from '../components/PublishingDashboard';
import SiteGraphiQL from '../components/SiteGraphiQL';
import SiteToolsApp from '../components/SiteToolsApp';
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
import RemoteRepositoriesManagement from '../components/RemoteRepositoriesManagement';
import ItemStatesManagement from '../components/ItemStatesManagement';
import AwaitingApprovalDashlet from '../components/AwaitingApprovalDashlet';
import RecentlyPublishedDashlet from '../components/RecentlyPublishedDashlet';
import PublishingStatusButton from '../components/PublishingStatusButton';
import QuickCreate from '../modules/Preview/QuickCreate';
import EditModeSwitch from '../components/EditModeSwitch';
import PreviewAddressBar from '../components/PreviewAddressBar';
import SiteSwitcherSelect from '../components/SiteSwitcherSelect';

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
    'craftercms.components.SiteAuditManagement': SiteAuditManagement,
    'craftercms.components.LogConsole': LogConsole,
    'craftercms.components.PublishingDashboard': PublishingDashboard,
    'craftercms.components.SiteGraphiQL': SiteGraphiQL,
    'craftercms.components.SiteToolsApp': SiteToolsApp,
    'craftercms.components.RemoteRepositoriesManagement': RemoteRepositoriesManagement,
    'craftercms.components.ItemStatesManagement': ItemStatesManagement,
    'craftercms.components.AwaitingApprovalDashlet': AwaitingApprovalDashlet,
    'craftercms.components.RecentlyPublishedDashlet': RecentlyPublishedDashlet,
    'craftercms.components.PublishingStatusButton': PublishingStatusButton,
    'craftercms.components.QuickCreate': QuickCreate,
    'craftercms.components.EditModeSwitch': EditModeSwitch,
    'craftercms.components.PreviewAddressBar': PreviewAddressBar,
    'craftercms.components.SiteSwitcherSelect': SiteSwitcherSelect
  }).forEach(([id, component]) => {
    components.set(id, component);
  });
};
