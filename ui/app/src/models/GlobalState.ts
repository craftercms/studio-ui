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

import { LookupTable } from './LookupTable';
import { EnhancedUser } from './User';
import { Site } from './Site';
import ContentType from './ContentType';
import { WidthAndHeight } from './WidthAndHeight';
import { ElasticParams, MediaItem } from './Search';
import ContentInstance from './ContentInstance';
import { ContentTypeDropTarget } from './ContentTypeDropTarget';
import { ConfirmDialogStateProps } from '../components/Dialogs/ConfirmDialog';
import { ErrorDialogStateProps } from '../components/SystemStatus/ErrorDialog';
import { MinimizedDialogsStateProps } from './MinimizedDialog';
import { NewContentDialogStateProps } from '../modules/Content/Authoring/NewContentDialog';
import { HistoryDialogStateProps } from '../modules/Content/History/HistoryDialog';
import { PublishDialogStateProps } from '../modules/Content/Publish/PublishDialog';
import { DependenciesDialogStateProps } from '../modules/Content/Dependencies/DependenciesDialog';
import { DeleteDialogStateProps } from '../modules/Content/Delete/DeleteDialog';
import { EntityState } from './EntityState';
import { ApiResponse } from './ApiResponse';
import { ViewVersionDialogStateProps } from '../modules/Content/History/ViewVersionDialog';
import { CompareVersionsDialogStateProps } from '../modules/Content/History/CompareVersionsDialog';
import { VersionsStateProps } from './Version';
import QuickCreateItem from './content/QuickCreateItem';
import { WorkflowCancellationDialogStateProps } from '../components/Dialogs/WorkflowCancellationDialog';
import { RejectDialogStateProps } from '../components/Dialogs/RejectDialog';
import { PathNavigatorStateProps } from '../components/PathNavigator';
import { LegacyFormDialogStateProps } from '../components/Dialogs/LegacyFormDialog';
import { DetailedItem } from './Item';
import { CreateFolderStateProps } from '../components/Dialogs/CreateFolderDialog';
import { CopyDialogStateProps } from '../components/Dialogs/CopyDialog';
import { CreateFileStateProps } from '../components/Dialogs/CreateFileDialog';
import { UploadDialogStateProps } from '../components/Dialogs/UploadDialog';
import { PreviewDialogStateProps } from '../components/Dialogs/PreviewDialog';
import { EditSiteDialogStateProps } from '../modules/System/Sites/Edit/EditSiteDialog';
import { PathSelectionDialogStateProps } from '../components/Dialogs/PathSelectionDialog';
import { ChangeContentTypeDialogStateProps } from '../modules/Content/Authoring/ChangeContentTypeDialog';
import { WidgetDescriptor } from '../components/Widget';
import { ItemMenuStateProps } from '../components/ItemActionsMenu';
import { ItemMegaMenuStateProps } from '../components/ItemMegaMenu';
import { LauncherStateProps } from '../components/Launcher';
import { PublishingStatusDialogStateProps } from '../components/PublishingStatusDialog';
import TranslationOrText from './TranslationOrText';
import { SystemIconDescriptor } from '../components/SystemIcon';
import { AjaxError } from 'rxjs/ajax';
import { PathNavigatorTreeStateProps } from '../components/PathNavigatorTree';
import { UnlockPublisherDialogStateProps } from '../components/UnlockPublisherDialog';
import { WidgetDialogStateProps } from '../components/WidgetDialog';
import { CodeEditorDialogStateProps } from '../components/CodeEditorDialog';
import { SystemLinkId } from '../utils/system';
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;

export interface PagedEntityState<T = any> extends EntityState<T> {
  page: any;
  pageNumber: number;
  count: number;
  query: ElasticParams;
}

export interface EditSelection {
  modelId: string;
  fieldId: string[];
  index: string | number;
  coordinates: { x: number; y: number };
}

export interface GuestData {
  url: string;
  origin: string;
  models: LookupTable<ContentInstance>;
  childrenMap: LookupTable<string[]>;
  modelIdByPath: LookupTable<string>;
  modelId: string;
  path: string;
  selected: EditSelection[];
  itemBeingDragged: boolean;
}

// TODO:
//   Assess extracting these props from `GuestData` to avoid reloading models
//   that were already fetched on previews pages as Guest checks in and out.
// export interface GuestModels {
//   models: LookupTable<ContentInstance>;
//   childrenMap: LookupTable<string[]>;
//   modelIdByPath: LookupTable<string>;
// }

export interface Clipboard {
  type: 'CUT' | 'COPY';
  paths: string[];
  sourcePath: string;
}

export interface GlobalState {
  auth: {
    error: ApiResponse;
    active: boolean;
    expiresAt: number;
    isFetching: boolean;
  };
  user: EnhancedUser;
  sites: {
    active: string;
    isFetching: boolean;
    byId: LookupTable<Site>;
  };
  content: {
    quickCreate: {
      error: ApiResponse;
      isFetching: boolean;
      items: QuickCreateItem[];
    };
    itemsByPath: LookupTable<DetailedItem>;
    clipboard: Clipboard;
    itemsBeingFetchedByPath: LookupTable<boolean>;
  };
  contentTypes: EntityState<ContentType>;
  env: {
    authoringBase: string;
    logoutUrl: string;
    guestBase: string;
    xsrfHeader: string;
    xsrfArgument: string;
    siteCookieName: string;
    previewLandingBase: string;
    version: string;
    packageBuild: string;
    packageVersion: string;
    packageBuildDate: string;
  };
  preview: {
    editMode: boolean;
    highlightMode: string;
    showToolsPanel: boolean;
    toolsPanelPageStack: WidgetDescriptor[];
    toolsPanelWidth: number;
    pageBuilderPanelWidth: number;
    pageBuilderPanelStack: WidgetDescriptor[];
    hostSize: WidthAndHeight;
    guest: GuestData;
    assets: PagedEntityState<MediaItem>;
    audiencesPanel: {
      isFetching: boolean;
      isApplying: boolean;
      error: ApiResponse;
      model: ContentInstance;
      applied: boolean;
    };
    components: PagedEntityState<ContentInstance>;
    dropTargets: {
      selectedContentType: string;
      byId: LookupTable<ContentTypeDropTarget>;
    };
    toolsPanel: {
      widgets: WidgetDescriptor[];
    };
    toolbar: {
      leftSection: {
        widgets: WidgetDescriptor[];
      };
      middleSection: {
        widgets: WidgetDescriptor[];
      };
      rightSection: {
        widgets: WidgetDescriptor[];
      };
    };
    pageBuilderPanel: {
      widgets: WidgetDescriptor[];
    };
  };
  previewNavigation: {
    currentUrlPath: string;
    historyBackStack: string[];
    historyForwardStack: string[];
    // Flags when the back/forwards buttons were pressed (null otherwise) to determinate how to modify history stacks.
    historyNavigationType: 'back' | 'forward';
  };
  versions: VersionsStateProps;
  dialogs: {
    confirm: ConfirmDialogStateProps;
    error: ErrorDialogStateProps;
    minimizedDialogs: MinimizedDialogsStateProps;
    newContent: NewContentDialogStateProps;
    history: HistoryDialogStateProps;
    viewVersion: ViewVersionDialogStateProps;
    compareVersions: CompareVersionsDialogStateProps;
    publish: PublishDialogStateProps;
    dependencies: DependenciesDialogStateProps;
    delete: DeleteDialogStateProps;
    edit: LegacyFormDialogStateProps;
    codeEditor: CodeEditorDialogStateProps;
    workflowCancellation: WorkflowCancellationDialogStateProps;
    reject: RejectDialogStateProps;
    createFolder: CreateFolderStateProps;
    createFile: CreateFileStateProps;
    copy: CopyDialogStateProps;
    upload: UploadDialogStateProps;
    preview: PreviewDialogStateProps;
    editSite: EditSiteDialogStateProps;
    pathSelection: PathSelectionDialogStateProps;
    changeContentType: ChangeContentTypeDialogStateProps;
    itemMenu: ItemMenuStateProps;
    itemMegaMenu: ItemMegaMenuStateProps;
    launcher: LauncherStateProps;
    publishingStatus: PublishingStatusDialogStateProps;
    unlockPublisher: UnlockPublisherDialogStateProps;
    widget: WidgetDialogStateProps;
  };
  uiConfig: {
    error: ApiResponse;
    isFetching: boolean;
    currentSite: string;
    siteLocales: {
      error: ApiResponse;
      isFetching: boolean;
      localeCodes: string[];
      defaultLocaleCode: string;
    };
    locale: {
      error: ApiResponse;
      isFetching: boolean;
      localeCode: string;
      dateTimeFormatOptions?: DateTimeFormatOptions;
    };
    references: LookupTable;
    xml: string;
  };
  pathNavigator: {
    [id: string]: PathNavigatorStateProps;
  };
  pathNavigatorTree: {
    [id: string]: PathNavigatorTreeStateProps;
  };
  launcher: {
    widgets: WidgetDescriptor[];
    /**
     * Whether to render the global nav before or after
     * the additional widgets coming from configuration
     **/
    globalNavigationPosition?: 'before' | 'after';
    siteCardMenuLinks: Array<{
      title: TranslationOrText;
      systemLinkId: SystemLinkId;
      icon?: SystemIconDescriptor;
      permittedRoles?: string[];
    }>;
  };
  dashboard: {
    widgets: WidgetDescriptor[];
  };
  publishing: {
    submissionCommentMaxLength: number;
  };
  globalNavigation: {
    error: AjaxError;
    items: Array<{ icon: SystemIconDescriptor; id: string; label: string }>;
    isFetching: boolean;
  };
}

export default GlobalState;
