# Changelog

## 4.2.0

* [utils/xml] Upgrade prettier to v3x which changed from sync apis to async
  * `serialize` no longer formats code
  * `beautify` is now async
* [components]
  * HostUI removed, merged with Host (its container component)
  * EditModeSwitcherUI removed, merged with EditModeSwitcher (its container component)
  * Removed Legacy Dashboard components:
    * `LegacyApprovedScheduledDashlet`
    * `LegacyAwaitingApprovalDashlet`
    * `LegacyInReviewDashlet`
    * `LegacyRecentActivityDashlet`
    * `LegacyRecentActivityDashlet`
    * `LegacyRecentlyPublishedDashlet`
    * `LegacyUnpublishedDashlet`
  * Removed `documentDomain` property from ExperienceBuilder component and its usage in `PreviewConcierge` component
  * `WorkflowCancellationDialogUI`: prop `items` type changed from an async Resource to sync SandboxItem array.
  * `AuthorFilter` removed, merged with ActivityDashlet
  * `UsersAutocomplete` removed
  * `UploadDialog`: Added `autoProceed` prop to enable/disable automatic upload after file selection
  * `DropDownMenuButton` component:
    * Internal structure changed so that ListItem wraps the ListItemButton
    * `listItemProps` are routed to the list `ListItem` component instead of the `ListItemButton`
    * Added `listItemButtonProps` property
  * `DraggablePanelListItem` prop `onMenu` send the pointer event as its first and only argument instead of the anchor element attached to the event. Can get element through `event.currentTarget`.
* [services] Removed services associated with v1 APIs:
  * `fetchLegacyGetGoLiveItems`
  * `fetchLegacyUserActivities`
  * `fetchLegacyScheduledItems`
  * `fetchPendingApprovalPackageItems`
  * `fetchLegacyDeploymentHistory`
  * `getUserPermissions`
    * Use `fetchMyPermissions` instead
  * [services/contentTypes] Add `fetchContentType` service
* [state]
  * `actions/dialogs`: Renamed `updateEditConfig` action to `updateEditDialogConfig`
* [hooks]
  * `usePreviewUrlControl`: Removed `history` prop. Retrieval of search and navigate (previously called 'push') is now done internally.
* Removed deprecated `aws-file-upload` and `aws-video` upload controls.
* Migrated the Studio UI build to Vite/SWC
* Rollup's XB build to use SWC
* Upgraded target compilation to ES2022, dropping many code transforms for features that are supported by most modern browsers such as nullish coalescing, optional chaining, object spreading and destructuring.
* The `allowedContentTypes` ContentTypeField validation changed from being an array to a Record<contentTypeId, { embedded?: true; shared?: true; sharedExisting?: true; }>
* Remove legacy `browseCMIS` dialog and `openCMISBrowse` function from common-api.
* Remove `CMIS-repo`, `CMIS-upload`, `img-cmis-repo`, `img-CMIS-upload`, `video-cmis-repo` and `video-CMIS-upload` datasources. 
* `ICEConfig` TypeScript `interface` changed to be `type`. It now accepts either the (model) or (modelId & path).
* The `acecode` TinyMCE plugin (for code-highlighted Rich Text Editor code editing), renders the code exactly as Tiny provides without decoding entities.
* `compareVersion` action creator was removed as the action is no longer in use and handled.
* Many dependencies and peerDependencies have been updated to in most cases a newer **major** release.
  * [@craftercms/studio-ui] @craftercms/uppy@4.2.0, @graphiql/plugin-explorer@^3.0.1, @mui/x-data-grid@^7.13.0, @mui/x-date-pickers@^7.13.0, @mui/x-tree-view@^7.13.0, @prettier/plugin-xml@3.3.0, @reduxjs/toolkit@^2.2.5, @types/ace@^0.0.52, @types/react@^18.3.2, @types/react-dom@^18.3.0, @types/react-swipeable-views@^0.13.5, @types/video.js@^7.3.58, clsx@^2.1.1, fast-xml-parser@^4.3.6, graphiql@^3.2.2, graphql@^16.8.1, graphql-ws@^5.16.0, marked@^12.0.2, marked-highlight@^2.1.1, moment-timezone@^0.5.45, nanoid@^5.0.7, prettier@^3.2.5, react-hotkeys-hook@^4.5.0, tss-react@^4.9.10, query-string@^9.0.0, react-redux@^9.1.2, react-router-dom@^6.0.0, redux@^5.0.1, redux-observable@^3.0.0-rc.2, video.js@^8.12.0
  * [@craftercms/experience-builder] @craftercms/classes@4.2.0, @craftercms/content@4.2.0, @craftercms/ice@4.2.0, @craftercms/search@4.2.0, @craftercms/studio-ui@4.2.0, @reduxjs/toolkit@^2.2.5, @rollup/plugin-alias@^5.1.0, @types/react-dom@^18.3.0, react-hotkeys-hook@^4.5.0, react-is@^18.3.1, uuid@^10.0.0, react-redux@^9.1.2, redux@^5.0.1, redux-observable@^3.0.0-rc.2
  * [@craftercms/search] uuid@^10.0.0
  * [@craftercms/redux] @reduxjs/toolkit@^2.2.2, redux@^5.0.1, redux-observable@^3.0.0-rc.2
  * [@craftercms/classes] query-string@^9.1.0

## 4.1.6
* `ICEConfig` TypeScript `interface` changed to be `type`. It now accepts either the (model) or (modelId & path).

## 4.1.5
* [common-api.js]
  * `CStudioAuthoring.Utils.showConfirmDialog`: Added function overload to receive a `props` style object as first and only argument. The props argument would contain all ConfirmDialog props. Original set of arguments still supported for backward compatibility.
* Removed `item` property from EditModeSwitch component and its usage in `PreviewSettingsPanel` component
* `pathNavigatorTreeFetchPathChildrenFailed` action creator payload requires a `path` property.

## 4.1.4
  * `UploadDialog`: Added props `endpoint`, `method`, `headers`, `meta`, `allowedMetaFields`, `useFormData`, `fieldName` and `onFileAdded` for additional control over the upload process.

## 4.1.3

* HostUI removed and merged into Host
* Upgraded yarn
* Upgrade to the latest version to date of the following libraries:
  * @mui/*
  * jquery
  * moment
  * ace
  * bootstrap
* Replace Navigators to work with new bulk children fetcher api
* `utils/content/parseContentXML` & `utils/content/parseElementByContentType`: new argument added to the bottom of the arguments list: `unflattenedPaths`. The argument should be an object that will be populated by the method with `path: object` pairs for the unflattened content items whose data is incomplete while processing.
  * This argument is likely to be required in next versions of the package.
* **Breaking Changes**
  * `services/content/insertComponent`: function now requires the parent document content type and the path argument moves to being earlier in the argument list.
    The shifting of the arguments seeks a more coherent argument order, grouping parent-related arguments first, followed by inserted instance related arguments, and finally supportive arguments last.
    * **Previously**: siteId, parentModelId, parentFieldId, targetIndex, **_insertedItemContentType_**, **_insertedContentInstance_**, _**parentDocPath**_, isSharedInstance, shouldSerializeValueFn?
    * **Now**: siteId, _**parentDocPath**_, parentModelId, parentFieldId, targetIndex, _**parentContentType**_, _**insertedContentInstance**_, _**insertedItemContentType**_, isSharedInstance, shouldSerializeValueFn?
  * `services/content/insertInstance`: function now requires the parent document content type and the path argument moves to being earlier in the argument list.
    The shifting of the arguments seeks a more coherent argument order, grouping parent-related arguments first, followed by inserted instance related arguments, and finally supportive arguments last.
    * **Previously**: siteId, parentModelId, parentFieldId, targetIndex, insertedInstance, _**parentDocPath**_, datasource?
    * **Now**: siteId, _**parentDocPath**_, parentModelId, parentFieldId, targetIndex, _**parentContentType**_, insertedInstance, datasource?
  * `components/LegacyComponentsPanel/utils/fetchAndInsertContentInstance`: the function now requires the parent content type id as its last argument. Note this whole component module is likely to be removed in the future.

## 4.1.2

* Update return type of configuration/fetchHistory and content/fetchItemHistory to `ItemHistoryEntry[]`.
* Update content/fetchItemHistory service to use new `/studio/api/2/content/item_history` API.
* Removed deprecated `Guest` component. Use `ExperienceBuilder`.
* Removed deprecated RenderField prop `format`. Use `render`.

## 4.1.1

* SandboxItem and DetailedItem changes:
  * Update `creator` and `modifier` props to be of type `Person`.
  * Add `submitter` prop of type `Person`.
  * Add `dateSubmitted` prop of type string.
* Update PendingApprovalDashlet and ScheduledDashlet to use new `submitter` and `dateSubmitted` props.
