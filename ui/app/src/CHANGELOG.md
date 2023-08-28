## 4.1.1

* SandboxItem and DetailedItem changes:
  * Update `creator` and `modifier` props to be of type `Person`.
  * Add `submitter` prop of type `Person`.
  * Add `dateSubmitted` prop of type string.
* Update PendingApprovalDashlet and ScheduledDashlet to use new `submitter` and `dateSubmitted` props.
* Update return type of configuration/fetchHistory and content/fetchItemHistory to `ItemHistoryEntry[]`.
* Update content/fetchItemHistory service to use new `/studio/api/2/content/item_history` API.
