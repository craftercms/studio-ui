/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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
import { lazy } from 'react';
import * as auditService from '../services/audit';
import * as authService from '../services/auth';
import * as awsService from '../services/aws';
import * as boxService from '../services/box';
import * as cmisService from '../services/cmis';
import * as configurationService from '../services/configuration';
import * as contentService from '../services/content';
import * as contentTypesService from '../services/contentTypes';
import * as dashboardService from '../services/dashboard';
import * as dependenciesService from '../services/dependencies';
import * as environmentService from '../services/environment';
import * as groupsService from '../services/groups';
import * as logsService from '../services/logs';
import * as marketplaceService from '../services/marketplace';
import * as monitoringService from '../services/monitoring';
import * as pluginService from '../services/plugin';
import * as publishingService from '../services/publishing';
import * as repositoriesService from '../services/repositories';
import * as searchService from '../services/search';
import * as securityService from '../services/security';
import * as sitesService from '../services/sites';
import * as tokensService from '../services/tokens';
import * as translationService from '../services/translation';
import * as usersService from '../services/users';
import * as webdavService from '../services/webdav';
import * as workflowService from '../services/workflow';
import * as ajaxUtil from '../utils/ajax';
import * as arrayUtil from '../utils/array';
import * as authUtil from '../utils/auth';
import * as constantsUtil from '../utils/constants';
import * as contentUtil from '../utils/content';
import * as contentTypeUtil from '../utils/contentType';
import * as datetimeUtil from '../utils/datetime';
import * as domUtil from '../utils/dom';
import * as i18nUtil from '../utils/i18n';
import * as itemActionsUtil from '../utils/itemActions';
import * as mimeTypesUtil from '../utils/mimeTypes';
import * as modelUtil from '../utils/model';
import * as objectUtil from '../utils/object';
import * as pathUtil from '../utils/path';
import * as stateUtil from '../utils/state';
import * as stringUtil from '../utils/string';
import * as subjectsUtil from '../utils/subjects';
import * as systemUtil from '../utils/system';
export const components = {
  AboutCrafterCMSView: lazy(() => import('../components/AboutCrafterCMSView')),
  AccountManagement: lazy(() => import('../components/AccountManagement')),
  AceEditor: lazy(() => import('../components/AceEditor')),
  ActionsBar: lazy(() => import('../components/ActionsBar')),
  ActionsGroup: lazy(() => import('../components/ActionsGroup')),
  ActivityDashlet: lazy(() => import('../components/ActivityDashlet')),
  AlertDialog: lazy(() => import('../components/AlertDialog')),
  ApiResponseErrorState: lazy(() => import('../components/ApiResponseErrorState')),
  AsyncVideoPlayer: lazy(() => import('../components/AsyncVideoPlayer')),
  AuditGrid: lazy(() => import('../components/AuditGrid')),
  AuditGridFilterPopover: lazy(() => import('../components/AuditGridFilterPopover')),
  AuditLogEntryParametersDialog: lazy(() => import('../components/AuditLogEntryParametersDialog')),
  AuditManagement: lazy(() => import('../components/AuditManagement')),
  AuthBoundary: lazy(() => import('../components/AuthBoundary')),
  AuthMonitor: lazy(() => import('../components/AuthMonitor')),
  BasePathSelector: lazy(() => import('../components/BasePathSelector')),
  BrowseFilesDialog: lazy(() => import('../components/BrowseFilesDialog')),
  ChangeContentTypeDialog: lazy(() => import('../components/ChangeContentTypeDialog')),
  CharCountStatus: lazy(() => import('../components/CharCountStatus')),
  CodeEditorDialog: lazy(() => import('../components/CodeEditorDialog')),
  CommitResolutionDialog: lazy(() => import('../components/CommitResolutionDialog')),
  CompareVersionsDialog: lazy(() => import('../components/CompareVersionsDialog')),
  ConditionalSuspense: lazy(() => import('../components/ConditionalSuspense')),
  ConfigurationSamplePreviewDialog: lazy(() => import('../components/ConfigurationSamplePreviewDialog')),
  ConfirmDialog: lazy(() => import('../components/ConfirmDialog')),
  ConfirmDropdown: lazy(() => import('../components/ConfirmDropdown')),
  ConflictedPathDiffDialog: lazy(() => import('../components/ConflictedPathDiffDialog')),
  ContentLocalizationDialog: lazy(() => import('../components/ContentLocalizationDialog')),
  ContentTypeFilter: lazy(() => import('../components/ContentTypeFilter')),
  ContentTypeManagement: lazy(() => import('../components/ContentTypeManagement')),
  ContextMenu: lazy(() => import('../components/ContextMenu')),
  CopyDialog: lazy(() => import('../components/CopyDialog')),
  CopyTokenDialog: lazy(() => import('../components/CopyTokenDialog')),
  CrafterCMSNextBridge: lazy(() => import('../components/CrafterCMSNextBridge')),
  CrafterThemeProvider: lazy(() => import('../components/CrafterThemeProvider')),
  CreateFileDialog: lazy(() => import('../components/CreateFileDialog')),
  CreateFolderDialog: lazy(() => import('../components/CreateFolderDialog')),
  CreateSiteDialog: lazy(() => import('../components/CreateSiteDialog')),
  CreateTokenDialog: lazy(() => import('../components/CreateTokenDialog')),
  CreateUserDialog: lazy(() => import('../components/CreateUserDialog')),
  DashletCard: lazy(() => import('../components/DashletCard')),
  DataSourcesActionsList: lazy(() => import('../components/DataSourcesActionsList')),
  DateTimePicker: lazy(() => import('../components/DateTimePicker')),
  DeleteContentTypeDialog: lazy(() => import('../components/DeleteContentTypeDialog')),
  DeleteDialog: lazy(() => import('../components/DeleteDialog')),
  DeletePluginDialog: lazy(() => import('../components/DeletePluginDialog')),
  DependenciesDialog: lazy(() => import('../components/DependenciesDialog')),
  DependencySelection: lazy(() => import('../components/DependencySelection')),
  DevContentOpsDashlet: lazy(() => import('../components/DevContentOpsDashlet')),
  DialogBody: lazy(() => import('../components/DialogBody')),
  DialogFooter: lazy(() => import('../components/DialogFooter')),
  DialogHeader: lazy(() => import('../components/DialogHeader')),
  DialogHeaderAction: lazy(() => import('../components/DialogHeaderAction')),
  DialogTitle: lazy(() => import('../components/DialogTitle')),
  DraggablePanelListItem: lazy(() => import('../components/DraggablePanelListItem')),
  DropDownMenuButton: lazy(() => import('../components/DropDownMenuButton')),
  EditFormPanel: lazy(() => import('../components/EditFormPanel')),
  EditGroupDialog: lazy(() => import('../components/EditGroupDialog')),
  EditModeSwitch: lazy(() => import('../components/EditModeSwitch')),
  EditModesSwitcher: lazy(() => import('../components/EditModesSwitcher')),
  EditSiteDialog: lazy(() => import('../components/EditSiteDialog')),
  EditUserDialog: lazy(() => import('../components/EditUserDialog')),
  EmbeddedSearchIframe: lazy(() => import('../components/EmbeddedSearchIframe')),
  EmptyState: lazy(() => import('../components/EmptyState')),
  EncryptTool: lazy(() => import('../components/EncryptTool')),
  EnhancedDialog: lazy(() => import('../components/EnhancedDialog')),
  ErrorBoundary: lazy(() => import('../components/ErrorBoundary')),
  ErrorDialog: lazy(() => import('../components/ErrorDialog')),
  ErrorState: lazy(() => import('../components/ErrorState')),
  ExpiringDashlet: lazy(() => import('../components/ExpiringDashlet')),
  FolderBrowserTreeView: lazy(() => import('../components/FolderBrowserTreeView')),
  FormEngineControls: lazy(() => import('../components/FormEngineControls')),
  Gears: lazy(() => import('../components/Gears')),
  GitAuthForm: lazy(() => import('../components/GitAuthForm')),
  GitManagement: lazy(() => import('../components/GitManagement')),
  PublishCommitDialog: lazy(() => import('../components/GitManagement/PublishCommitDialog')),
  PullDialog: lazy(() => import('../components/GitManagement/PullDialog')),
  PushDialog: lazy(() => import('../components/GitManagement/PushDialog')),
  RepoGrid: lazy(() => import('../components/GitManagement/RepoGrid')),
  RepoStatus: lazy(() => import('../components/GitManagement/RepoStatus')),
  GlobalApp: lazy(() => import('../components/GlobalApp')),
  GlobalAppGridCell: lazy(() => import('../components/GlobalAppGridCell')),
  GlobalAppGridRow: lazy(() => import('../components/GlobalAppGridRow')),
  GlobalAppToolbar: lazy(() => import('../components/GlobalAppToolbar')),
  GlobalConfigManagement: lazy(() => import('../components/GlobalConfigManagement')),
  GlobalDialogManager: lazy(() => import('../components/GlobalDialogManager')),
  GlobalStyles: lazy(() => import('../components/GlobalStyles')),
  GraphiQL: lazy(() => import('../components/GraphiQL')),
  GroupManagement: lazy(() => import('../components/GroupManagement')),
  GroupsGrid: lazy(() => import('../components/GroupsGrid')),
  HistoryDialog: lazy(() => import('../components/HistoryDialog')),
  Host: lazy(() => import('../components/Host')),
  I18nProvider: lazy(() => import('../components/I18nProvider')),
  ICEToolsPanel: lazy(() => import('../components/ICEToolsPanel')),
  IFrame: lazy(() => import('../components/IFrame')),
  IconGuideDashlet: lazy(() => import('../components/IconGuideDashlet')),
  ItemActionsMenu: lazy(() => import('../components/ItemActionsMenu')),
  ItemActionsSnackbar: lazy(() => import('../components/ItemActionsSnackbar')),
  ItemDisplay: lazy(() => import('../components/ItemDisplay')),
  ItemMegaMenu: lazy(() => import('../components/ItemMegaMenu')),
  ItemPublishingTargetIcon: lazy(() => import('../components/ItemPublishingTargetIcon')),
  ItemStateIcon: lazy(() => import('../components/ItemStateIcon')),
  ItemStatesGrid: lazy(() => import('../components/ItemStatesGrid')),
  ItemTypeIcon: lazy(() => import('../components/ItemTypeIcon')),
  KeyboardShortcutsDialog: lazy(() => import('../components/KeyboardShortcutsDialog')),
  Launcher: lazy(() => import('../components/Launcher')),
  LauncherGlobalNav: lazy(() => import('../components/LauncherGlobalNav')),
  LauncherLinkTile: lazy(() => import('../components/LauncherLinkTile')),
  LauncherOpenerButton: lazy(() => import('../components/LauncherOpenerButton')),
  LauncherPublishingStatusTile: lazy(() => import('../components/LauncherPublishingStatusTile')),
  LauncherSection: lazy(() => import('../components/LauncherSection')),
  LauncherSiteCard: lazy(() => import('../components/LauncherSiteCard')),
  LauncherTile: lazy(() => import('../components/LauncherTile')),
  LegacyComponentsPanel: lazy(() => import('../components/LegacyComponentsPanel')),
  LegacyConcierge: lazy(() => import('../components/LegacyConcierge')),
  LegacyDashboardFrame: lazy(() => import('../components/LegacyDashboardFrame')),
  LegacyFormDialog: lazy(() => import('../components/LegacyFormDialog')),
  LegacyIFrame: lazy(() => import('../components/LegacyIFrame')),
  LegacySiteDashboard: lazy(() => import('../components/LegacySiteDashboard')),
  LegacyApprovedScheduledDashlet: lazy(
    () => import('../components/LegacySiteDashboard/LegacyApprovedScheduledDashlet')
  ),
  LegacyApprovedScheduledDashletGrid: lazy(
    () => import('../components/LegacySiteDashboard/LegacyApprovedScheduledDashletGrid')
  ),
  LegacyAwaitingApprovalDashlet: lazy(() => import('../components/LegacySiteDashboard/LegacyAwaitingApprovalDashlet')),
  LegacyAwaitingApprovalDashletGrid: lazy(
    () => import('../components/LegacySiteDashboard/LegacyAwaitingApprovalDashletGrid')
  ),
  LegacyDashletCard: lazy(() => import('../components/LegacySiteDashboard/LegacyDashletCard')),
  LegacyInReviewDashlet: lazy(() => import('../components/LegacySiteDashboard/LegacyInReviewDashlet')),
  LegacyRecentActivityDashlet: lazy(() => import('../components/LegacySiteDashboard/LegacyRecentActivityDashlet')),
  LegacyRecentActivityDashletGrid: lazy(
    () => import('../components/LegacySiteDashboard/LegacyRecentActivityDashletGrid')
  ),
  LegacyRecentlyPublishedDashlet: lazy(
    () => import('../components/LegacySiteDashboard/LegacyRecentlyPublishedDashlet')
  ),
  LegacyUnpublishedDashlet: lazy(() => import('../components/LegacySiteDashboard/LegacyUnpublishedDashlet')),
  LegacySiteToolsFrame: lazy(() => import('../components/LegacySiteToolsFrame')),
  LoadingState: lazy(() => import('../components/LoadingState')),
  LogConsole: lazy(() => import('../components/LogConsole')),
  LogConsoleDetailsDialog: lazy(() => import('../components/LogConsoleDetailsDialog')),
  LogConsoleGrid: lazy(() => import('../components/LogConsoleGrid')),
  LogLevelManagement: lazy(() => import('../components/LogLevelManagement')),
  LogLevelGrid: lazy(() => import('../components/LogLevelManagement/LogLevelGrid')),
  LoginForm: lazy(() => import('../components/LoginForm')),
  LoginView: lazy(() => import('../components/LoginView')),
  LogoAndMenuBundleButton: lazy(() => import('../components/LogoAndMenuBundleButton')),
  MarketplaceDialog: lazy(() => import('../components/MarketplaceDialog')),
  MediaCard: lazy(() => import('../components/MediaCard')),
  MinimizedBar: lazy(() => import('../components/MinimizedBar')),
  MinimizedBarPortal: lazy(() => import('../components/MinimizedBarPortal')),
  MobileStepper: lazy(() => import('../components/MobileStepper')),
  MultiChoiceSaveButton: lazy(() => import('../components/MultiChoiceSaveButton')),
  NewContentDialog: lazy(() => import('../components/NewContentDialog')),
  NewRemoteRepositoryDialog: lazy(() => import('../components/NewRemoteRepositoryDialog')),
  NewRemoteRepositoryForm: lazy(() => import('../components/NewRemoteRepositoryForm')),
  NonReactWidget: lazy(() => import('../components/NonReactWidget')),
  PackageDetailsDialog: lazy(() => import('../components/PackageDetailsDialog')),
  PaddingModeSwitchListItem: lazy(() => import('../components/PaddingModeSwitchListItem')),
  PagesSearchAhead: lazy(() => import('../components/PagesSearchAhead')),
  Pagination: lazy(() => import('../components/Pagination')),
  PasswordRequirementsDisplay: lazy(() => import('../components/PasswordRequirementsDisplay')),
  PasswordStrengthDisplay: lazy(() => import('../components/PasswordStrengthDisplay')),
  PasswordStrengthDisplayPopper: lazy(() => import('../components/PasswordStrengthDisplayPopper')),
  PasswordTextField: lazy(() => import('../components/PasswordTextField')),
  PathNavigator: lazy(() => import('../components/PathNavigator')),
  PathNavigatorTree: lazy(() => import('../components/PathNavigatorTree')),
  PathSelectionDialog: lazy(() => import('../components/PathSelectionDialog')),
  PathSelectionInput: lazy(() => import('../components/PathSelectionInput')),
  PendingApprovalDashlet: lazy(() => import('../components/PendingApprovalDashlet')),
  PluginCard: lazy(() => import('../components/PluginCard')),
  PluginConfigDialog: lazy(() => import('../components/PluginConfigDialog')),
  PluginDetailsView: lazy(() => import('../components/PluginDetailsView')),
  PluginDocumentation: lazy(() => import('../components/PluginDocumentation')),
  PluginFormBuilder: lazy(() => import('../components/PluginFormBuilder')),
  PluginHostIFrame: lazy(() => import('../components/PluginHostIFrame')),
  PluginManagement: lazy(() => import('../components/PluginManagement')),
  PluginParametersForm: lazy(() => import('../components/PluginParametersForm')),
  Preview: lazy(() => import('../components/Preview')),
  PreviewAddressBar: lazy(() => import('../components/PreviewAddressBar')),
  PreviewAssetsPanel: lazy(() => import('../components/PreviewAssetsPanel')),
  PreviewAudiencesPanel: lazy(() => import('../components/PreviewAudiencesPanel')),
  PreviewBackButton: lazy(() => import('../components/PreviewBackButton')),
  PreviewBrowseComponentsPanel: lazy(() => import('../components/PreviewBrowseComponentsPanel')),
  PreviewCompatibilityDialog: lazy(() => import('../components/PreviewCompatibilityDialog')),
  PreviewComponentsPanel: lazy(() => import('../components/PreviewComponentsPanel')),
  PreviewConcierge: lazy(() => import('../components/PreviewConcierge')),
  PreviewDialog: lazy(() => import('../components/PreviewDialog')),
  PreviewDropTargetsPanel: lazy(() => import('../components/PreviewDropTargetsPanel')),
  PreviewForwardButton: lazy(() => import('../components/PreviewForwardButton')),
  PreviewInPageInstancesPanel: lazy(() => import('../components/PreviewInPageInstancesPanel')),
  PreviewPageExplorerPanel: lazy(() => import('../components/PreviewPageExplorerPanel')),
  PreviewSearchPanel: lazy(() => import('../components/PreviewSearchPanel')),
  PreviewSettingsPanel: lazy(() => import('../components/PreviewSettingsPanel')),
  PreviewSimulatorPanel: lazy(() => import('../components/PreviewSimulatorPanel')),
  PrimaryButton: lazy(() => import('../components/PrimaryButton')),
  ProgressBar: lazy(() => import('../components/ProgressBar')),
  PublishDialog: lazy(() => import('../components/PublishDialog')),
  PublishOnDemandForm: lazy(() => import('../components/PublishOnDemandForm')),
  PublishOnDemandWidget: lazy(() => import('../components/PublishOnDemandWidget')),
  PublishingDashboard: lazy(() => import('../components/PublishingDashboard')),
  PublishingQueue: lazy(() => import('../components/PublishingQueue')),
  PublishingStatusAvatar: lazy(() => import('../components/PublishingStatusAvatar')),
  PublishingStatusButton: lazy(() => import('../components/PublishingStatusButton')),
  PublishingStatusDialog: lazy(() => import('../components/PublishingStatusDialog')),
  PublishingStatusDisplay: lazy(() => import('../components/PublishingStatusDisplay')),
  PublishingStatusTile: lazy(() => import('../components/PublishingStatusTile')),
  PublishingStatusWidget: lazy(() => import('../components/PublishingStatusWidget')),
  QuickCreate: lazy(() => import('../components/QuickCreate')),
  RecentlyPublishedDashlet: lazy(() => import('../components/RecentlyPublishedDashlet')),
  RejectDialog: lazy(() => import('../components/RejectDialog')),
  RenameAssetDialog: lazy(() => import('../components/RenameAssetDialog')),
  ResetPasswordDialog: lazy(() => import('../components/ResetPasswordDialog')),
  ResizeBar: lazy(() => import('../components/ResizeBar')),
  ResizeableDrawer: lazy(() => import('../components/ResizeableDrawer')),
  RubbishBin: lazy(() => import('../components/RubbishBin')),
  ScheduledDashlet: lazy(() => import('../components/ScheduledDashlet')),
  Search: lazy(() => import('../components/Search')),
  SearchBar: lazy(() => import('../components/SearchBar')),
  SearchUI: lazy(() => import('../components/SearchUI')),
  SecondaryButton: lazy(() => import('../components/SecondaryButton')),
  SetWorkflowStateDialog: lazy(() => import('../components/SetWorkflowStateDialog')),
  SingleFileUpload: lazy(() => import('../components/SingleFileUpload')),
  SingleFileUploadDialog: lazy(() => import('../components/SingleFileUploadDialog')),
  SingleItemSelector: lazy(() => import('../components/SingleItemSelector')),
  SiteAuditManagement: lazy(() => import('../components/SiteAuditManagement')),
  SiteCard: lazy(() => import('../components/SiteCard')),
  SiteCardSkeleton: lazy(() => import('../components/SiteCard/SiteCardSkeleton')),
  SiteConfigurationManagement: lazy(() => import('../components/SiteConfigurationManagement')),
  SiteDashboard: lazy(() => import('../components/SiteDashboard')),
  SiteEncryptTool: lazy(() => import('../components/SiteEncryptTool')),
  SiteGraphiQL: lazy(() => import('../components/SiteGraphiQL')),
  SiteManagement: lazy(() => import('../components/SiteManagement')),
  SiteSearchFilter: lazy(() => import('../components/SiteSearchFilter')),
  SiteSearchFilterCheckboxes: lazy(() => import('../components/SiteSearchFilterCheckboxes')),
  SiteSearchFilterRadios: lazy(() => import('../components/SiteSearchFilterRadios')),
  SiteSearchFilters: lazy(() => import('../components/SiteSearchFilters')),
  SiteSearchPathSelector: lazy(() => import('../components/SiteSearchPathSelector')),
  SiteSearchRangeSelector: lazy(() => import('../components/SiteSearchRangeSelector')),
  SiteSearchSortBy: lazy(() => import('../components/SiteSearchSortBy')),
  SiteSearchSortOrder: lazy(() => import('../components/SiteSearchSortOrder')),
  SiteSearchToolbar: lazy(() => import('../components/SiteSearchToolbar')),
  SiteSwitcherSelect: lazy(() => import('../components/SiteSwitcherSelect')),
  SiteTools: lazy(() => import('../components/SiteTools')),
  EmbeddedSiteTools: lazy(() => import('../components/SiteTools/EmbeddedSiteTools')),
  UrlDrivenSiteTools: lazy(() => import('../components/SiteTools/UrlDrivenSiteTools')),
  SiteToolsPanel: lazy(() => import('../components/SiteToolsPanel')),
  SitesGrid: lazy(() => import('../components/SitesGrid')),
  SitesGridSkeleton: lazy(() => import('../components/SitesGrid/SitesGridSkeleton')),
  SnackbarCloseButton: lazy(() => import('../components/SnackbarCloseButton')),
  Spinner: lazy(() => import('../components/Spinner')),
  SplitButton: lazy(() => import('../components/SplitButton')),
  StoreProvider: lazy(() => import('../components/StoreProvider')),
  Suspencified: lazy(() => import('../components/Suspencified')),
  SystemIcon: lazy(() => import('../components/SystemIcon')),
  TextFieldWithMax: lazy(() => import('../components/TextFieldWithMax')),
  TokenManagement: lazy(() => import('../components/TokenManagement')),
  ToolBar: lazy(() => import('../components/ToolBar')),
  ToolPanel: lazy(() => import('../components/ToolPanel')),
  ToolsPanel: lazy(() => import('../components/ToolsPanel')),
  ToolsPanelEmbeddedAppViewButton: lazy(() => import('../components/ToolsPanelEmbeddedAppViewButton')),
  ToolsPanelListItemButton: lazy(() => import('../components/ToolsPanelListItemButton')),
  ToolsPanelPage: lazy(() => import('../components/ToolsPanelPage')),
  ToolsPanelPageButton: lazy(() => import('../components/ToolsPanelPageButton')),
  TransferList: lazy(() => import('../components/TransferList')),
  TransferListColumn: lazy(() => import('../components/TransferListColumn')),
  UIBlocker: lazy(() => import('../components/UIBlocker')),
  UnlockPublisherDialog: lazy(() => import('../components/UnlockPublisherDialog')),
  UnpublishedDashlet: lazy(() => import('../components/UnpublishedDashlet')),
  UploadDialog: lazy(() => import('../components/UploadDialog')),
  UppyDashboard: lazy(() => import('../components/UppyDashboard')),
  UserGroupMembershipEditor: lazy(() => import('../components/UserGroupMembershipEditor')),
  UserManagement: lazy(() => import('../components/UserManagement')),
  UsersGrid: lazy(() => import('../components/UsersGrid')),
  VersionList: lazy(() => import('../components/VersionList')),
  VideoPlayer: lazy(() => import('../components/VideoPlayer')),
  ViewToolbar: lazy(() => import('../components/ViewToolbar')),
  ViewVersionDialog: lazy(() => import('../components/ViewVersionDialog')),
  Widget: lazy(() => import('../components/Widget')),
  WidgetDialog: lazy(() => import('../components/WidgetDialog')),
  WidgetDialogIconButton: lazy(() => import('../components/WidgetDialogIconButton')),
  WidgetsGrid: lazy(() => import('../components/WidgetsGrid')),
  WorkflowCancellationDialog: lazy(() => import('../components/WorkflowCancellationDialog')),
  WorkflowStateManagement: lazy(() => import('../components/WorkflowStateManagement'))
};
export const icons = {
  About: lazy(() => import('../icons/About')),
  BrokenLink: lazy(() => import('../icons/BrokenLink')),
  Component: lazy(() => import('../icons/Component')),
  ContentTypeField: lazy(() => import('../icons/ContentTypeField')),
  CrafterCMSIcon: lazy(() => import('../icons/CrafterCMSIcon')),
  CrafterCMSLogo: lazy(() => import('../icons/CrafterCMSLogo')),
  Css: lazy(() => import('../icons/Css')),
  CustomMenu: lazy(() => import('../icons/CustomMenu')),
  Docs: lazy(() => import('../icons/Docs')),
  Freemarker: lazy(() => import('../icons/Freemarker')),
  Git: lazy(() => import('../icons/Git')),
  GitFilled: lazy(() => import('../icons/GitFilled')),
  GraphQL: lazy(() => import('../icons/GraphQL')),
  Groovy: lazy(() => import('../icons/Groovy')),
  Html: lazy(() => import('../icons/Html')),
  Js: lazy(() => import('../icons/Js')),
  Json: lazy(() => import('../icons/Json')),
  LevelDescriptor: lazy(() => import('../icons/LevelDescriptor')),
  Lock: lazy(() => import('../icons/Lock')),
  NodeSelector: lazy(() => import('../icons/NodeSelector')),
  OpenRubbishBinTiltedLeft: lazy(() => import('../icons/OpenRubbishBinTiltedLeft')),
  OpenRubbishBinTiltedLeftFilled: lazy(() => import('../icons/OpenRubbishBinTiltedLeftFilled')),
  OpenRubbishBinTiltedRight: lazy(() => import('../icons/OpenRubbishBinTiltedRight')),
  OpenRubbishBinTiltedRightFilled: lazy(() => import('../icons/OpenRubbishBinTiltedRightFilled')),
  Page: lazy(() => import('../icons/Page')),
  PageExplorer: lazy(() => import('../icons/PageExplorer')),
  PaperPlane: lazy(() => import('../icons/PaperPlane')),
  Preview: lazy(() => import('../icons/Preview')),
  RepeatGroup: lazy(() => import('../icons/RepeatGroup')),
  RepeatGroupItem: lazy(() => import('../icons/RepeatGroupItem')),
  SiteExplorer: lazy(() => import('../icons/SiteExplorer')),
  Sites: lazy(() => import('../icons/Sites')),
  Sleep: lazy(() => import('../icons/Sleep'))
};
export const services = {
  audit: auditService,
  auth: authService,
  aws: awsService,
  box: boxService,
  cmis: cmisService,
  configuration: configurationService,
  content: contentService,
  contentTypes: contentTypesService,
  dashboard: dashboardService,
  dependencies: dependenciesService,
  environment: environmentService,
  groups: groupsService,
  logs: logsService,
  marketplace: marketplaceService,
  monitoring: monitoringService,
  plugin: pluginService,
  publishing: publishingService,
  repositories: repositoriesService,
  search: searchService,
  security: securityService,
  sites: sitesService,
  tokens: tokensService,
  translation: translationService,
  users: usersService,
  webdav: webdavService,
  workflow: workflowService
};
export const utils = {
  ajax: ajaxUtil,
  array: arrayUtil,
  auth: authUtil,
  constants: constantsUtil,
  content: contentUtil,
  contentType: contentTypeUtil,
  datetime: datetimeUtil,
  dom: domUtil,
  i18n: i18nUtil,
  itemActions: itemActionsUtil,
  mimeTypes: mimeTypesUtil,
  model: modelUtil,
  object: objectUtil,
  path: pathUtil,
  state: stateUtil,
  string: stringUtil,
  subjects: subjectsUtil,
  system: systemUtil
};
