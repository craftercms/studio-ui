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
* [services] Removed services associated with v1 APIs:
  * `fetchLegacyGetGoLiveItems`
  * `fetchLegacyUserActivities`
  * `fetchLegacyScheduledItems`
  * `fetchPendingApprovalPackageItems`
  * `fetchLegacyDeploymentHistory`
  * `getUserPermissions`
    * Use `fetchMyPermissions` instead
  * [services/contentTypes] Add `fetchContentType` service
* Removed deprecated `aws-file-upload` and `aws-video` upload controls.

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
