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
  * `DropDownMenuButton` component:
    * Internal structure changed so that ListItem wraps the ListItemButton
    * `listItemProps` are routed to the list `ListItem` component instead of the `ListItemButton`
    * Added `listItemButtonProps` property
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
* Removed `PreviewPageExplorerPanel` component.
* Removed `pages/QuickCreateMenu` component.

## 4.1.5
* [common-api.js]
  * `CStudioAuthoring.Utils.showConfirmDialog`: Added function overload to receive a `props` style object as first and only argument. The props argument would contain all ConfirmDialog props. Original set of arguments still supported for backward compatibility.

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
