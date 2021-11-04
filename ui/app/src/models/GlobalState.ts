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
import { ErrorDialogStateProps } from '../components/SystemStatus/ErrorDialog';
import { MinimizedDialogsStateProps } from './MinimizedTab';
import { NewContentDialogStateProps } from '../components/NewContentDialog/utils';
import { EntityState } from './EntityState';
import { ApiResponse } from './ApiResponse';
import { VersionsStateProps } from './Version';
import QuickCreateItem from './content/QuickCreateItem';
import { PathNavigatorStateProps } from '../components/PathNavigator';
import { DetailedItem } from './Item';
import { CopyDialogStateProps } from '../components/Dialogs/CopyDialog';
import { PathSelectionDialogStateProps } from '../components/Dialogs/PathSelectionDialog';
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
import { WidgetDialogStateProps } from '../components/WidgetDialog/utils';
import { CodeEditorDialogStateProps } from '../components/CodeEditorDialog/utils';
import { SystemLinkId } from '../utils/system';
import { PublishDialogStateProps } from '../components/PublishDialog/utils';
import { DeleteDialogStateProps } from '../components/DeleteDialog/utils';
import { CreateFolderStateProps } from '../components/CreateFolderDialog/utils';
import { DependenciesDialogStateProps } from '../components/DependenciesDialog/utils';
import { HistoryDialogStateProps } from '../components/HistoryDialog/utils';
import { ViewVersionDialogStateProps } from '../components/ViewVersionDialog/utils';
import { CompareVersionsDialogStateProps } from '../components/CompareVersionsDialog/utils';
import { ConfirmDialogStateProps } from '../components/ConfirmDialog/utils';
import { ChangeContentTypeDialogStateProps } from '../components/ChangeContentTypeDialog/utils';
import { WorkflowCancellationDialogStateProps } from '../components/WorkflowCancellationDialog/utils';
import { RejectDialogStateProps } from '../components/RejectDialog/utils';
import { CreateFileStateProps } from '../components/CreateFileDialog/utils';
import { UploadDialogStateProps } from '../components/UploadDialog/util';
import { PreviewDialogStateProps } from '../components/PreviewDialog/utils';
import { EditSiteDialogStateProps } from '../components/EditSiteDialog/utils';
import { LegacyFormDialogStateProps } from '../components/LegacyFormDialog/utils';
import { SingleFileUploadDialogStateProps } from '../components/SingleFileUploadDialog';
import { BrowseFilesDialogStateProps } from '../components/BrowseFilesDialog';

export type HighlightMode = 'all' | 'move';

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
    highlightMode: HighlightMode;
    showToolsPanel: boolean;
    toolsPanelPageStack: WidgetDescriptor[];
    toolsPanelWidth: number;
    icePanelWidth: number;
    icePanelStack: WidgetDescriptor[];
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
    icePanel: {
      widgets: WidgetDescriptor[];
    };
    richTextEditor: LookupTable;
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
    minimizedTabs: MinimizedDialogsStateProps;
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
    singleFileUpload: SingleFileUploadDialogStateProps;
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
    browseFiles: BrowseFilesDialogStateProps;
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
      localeCode: string;
      dateTimeFormatOptions: Intl.DateTimeFormatOptions;
    };
    publishing: {
      publishCommentRequired: boolean;
      deleteCommentRequired: boolean;
      bulkPublishCommentRequired: boolean;
      publishByCommitCommentRequired: boolean;
      submissionCommentMaxLength: number;
    };
    cdataEscapedFieldPatterns: string[];
    useLegacyPreviewLookup: LookupTable<boolean>;
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
  globalNavigation: {
    error: AjaxError;
    items: Array<{ icon: SystemIconDescriptor; id: string; label: string }>;
    isFetching: boolean;
  };
}

export default GlobalState;
