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

import { ItemStateMap, LegacyItem } from '../models/Item';
import { FilterSystemTypeGroups, LookupTable, WidgetDescriptor } from '../models';
import { nanoid as uuid } from 'nanoid';
import TranslationOrText from '../models/TranslationOrText';
import { LegacyDashboardPreferences } from '../models/Dashboard';
import ToolsPanelTarget from '../models/ToolsPanelTarget';
import { EnhancedDialogState } from '../hooks/useEnhancedDialogState';
import { HighlightMode } from '../models/GlobalState';
import { PathNavInitPayload } from '../state/actions/pathNavigator';

export function setStoredGlobalMenuSiteViewPreference(value: 'grid' | 'list', user: string) {
  window.localStorage.setItem(`craftercms.${user}.globalMenuSiteViewPreference`, value);
}

export function getStoredGlobalMenuSiteViewPreference(user: string): 'grid' | 'list' {
  return window.localStorage.getItem(`craftercms.${user}.globalMenuSiteViewPreference`) as 'grid' | 'list';
}

export function removeStoredGlobalMenuSiteViewPreference(user: string) {
  window.localStorage.removeItem(`craftercms.${user}.globalMenuSiteViewPreference`);
}

export function getStateMapFromLegacyItem(item: LegacyItem): ItemStateMap {
  return {
    new: item.isNew,
    modified: item.isInProgress,
    deleted: Boolean(item.isDeleted),
    locked: Boolean(item.lockOwner),
    systemProcessing: false,
    submitted: Boolean(item.isSubmitted),
    scheduled: Boolean(item.isScheduled),
    publishing: false,
    submittedToStaging: item.submittedToEnvironment === 'staging',
    submittedToLive: item.submittedToEnvironment === 'live',
    staged: item.isStaged,
    live: item.isLive,
    disabled: item.disabled,
    translationInProgress: false,
    translationPending: false,
    translationUpToDate: false
  };
}

export function setStoredEditModeChoice(value: string, user: string): void {
  window.localStorage.setItem(`craftercms.${user}.editModeChoice`, value);
}

export function getStoredEditModeChoice(user: string): boolean {
  const value = window.localStorage.getItem(`craftercms.${user}.editModeChoice`);
  return value ? value === 'true' : null;
}

export function removeStoredEditModeChoice(user: string): void {
  window.localStorage.removeItem(`craftercms.${user}.editModeChoice`);
}

export function setStoredHighlightModeChoice(value: HighlightMode, user: string): void {
  window.localStorage.setItem(`craftercms.${user}.highlightModeChoice`, value);
}

export function getStoredHighlightModeChoice(user: string): HighlightMode {
  return window.localStorage.getItem(`craftercms.${user}.highlightModeChoice`) as HighlightMode;
}

export function removeStoredHighlightModeChoice(user: string): void {
  window.localStorage.removeItem(`craftercms.${user}.highlightModeChoice`);
}

export function setStoredEditModePadding(value: string, user: string): void {
  window.localStorage.setItem(`craftercms.${user}.editModePadding`, value);
}

export function getStoredEditModePadding(user: string): boolean {
  const value = window.localStorage.getItem(`craftercms.${user}.editModePadding`);
  return value ? value === 'true' : null;
}

export function removeStoredEditModePadding(user: string): void {
  window.localStorage.removeItem(`craftercms.${user}.editModePadding`);
}

export function setStoredClipboard(siteIdentifier: string, user: string, value: object): void {
  window.localStorage.setItem(
    `craftercms.${user}.clipboard.${siteIdentifier}`,
    JSON.stringify({ ...value, timestamp: Date.now() })
  );
}

export function getStoredClipboard(siteIdentifier: string, user: string) {
  return JSON.parse(window.localStorage.getItem(`craftercms.${user}.clipboard.${siteIdentifier}`));
}

export function removeStoredClipboard(siteIdentifier: string, user: string) {
  return window.localStorage.removeItem(`craftercms.${user}.clipboard.${siteIdentifier}`);
}

export function setStoredPreviewToolsPanelPage(siteIdentifier: string, user: string, value: WidgetDescriptor): void {
  window.localStorage.setItem(`craftercms.${user}.previewToolsPanelPage.${siteIdentifier}`, JSON.stringify(value));
}

export function getStoredPreviewToolsPanelPage(siteIdentifier: string, user: string): WidgetDescriptor {
  return JSON.parse(window.localStorage.getItem(`craftercms.${user}.previewToolsPanelPage.${siteIdentifier}`));
}

export function removeStoredPreviewToolsPanelPage(siteIdentifier: string, user: string) {
  return window.localStorage.removeItem(`craftercms.${user}.previewToolsPanelPage.${siteIdentifier}`);
}

export type StoredPathNavState = Pick<PathNavInitPayload, 'collapsed' | 'currentPath' | 'keyword' | 'offset' | 'limit'>;

export interface StoredPathNavTree {
  expanded: string[];
  collapsed: boolean;
  keywordByPath: LookupTable<string>;
}

export function setStoredPathNavigator(
  siteIdentifier: string,
  user: string,
  id: string,
  value: StoredPathNavState
): void {
  window.localStorage.setItem(`craftercms.${user}.pathNavigator.${siteIdentifier}.${id}`, JSON.stringify(value));
}

export function getStoredPathNavigator(siteIdentifier: string, user: string, id: string): StoredPathNavState {
  return JSON.parse(window.localStorage.getItem(`craftercms.${user}.pathNavigator.${siteIdentifier}.${id}`));
}

export function removeStoredPathNavigator(siteIdentifier: string, user: string, id: string): void {
  window.localStorage.removeItem(`craftercms.${user}.pathNavigator.${siteIdentifier}.${id}`);
}

export function setStoredPathNavigatorTree(siteIdentifier: string, user: string, id: string, value: StoredPathNavTree) {
  window.localStorage.setItem(`craftercms.${user}.pathNavigatorTree.${siteIdentifier}.${id}`, JSON.stringify(value));
}

export function getStoredPathNavigatorTree(siteIdentifier: string, user: string, id: string): StoredPathNavTree {
  return JSON.parse(window.localStorage.getItem(`craftercms.${user}.pathNavigatorTree.${siteIdentifier}.${id}`));
}

export function removeStoredPathNavigatorTree(siteIdentifier: string, user: string, id: string): void {
  window.localStorage.removeItem(`craftercms.${user}.pathNavigatorTree.${siteIdentifier}.${id}`);
}

export function setStoredGlobalAppOpenSidebar(user: string, value: boolean) {
  window.localStorage.setItem(`craftercms.${user}.globalAppOpenSidebar`, JSON.stringify(value));
}

export function getStoredGlobalAppOpenSidebar(user: string): string {
  return window.localStorage.getItem(`craftercms.${user}.globalAppOpenSidebar`);
}

export function removeStoredGlobalAppOpenSidebar(user: string) {
  window.localStorage.removeItem(`craftercms.${user}.globalAppOpenSidebar`);
}

export function createToolsPanelPage(
  title: TranslationOrText,
  widgets: WidgetDescriptor[],
  target?: ToolsPanelTarget
): WidgetDescriptor {
  return createWidgetDescriptor({
    id: 'craftercms.components.ToolsPanelPage',
    configuration: {
      title,
      target,
      widgets
    }
  });
}

export function createWidgetDescriptor(widget: WidgetDescriptor): WidgetDescriptor {
  return {
    ...widget,
    // When rendering widgets dynamically and changing pages on the tools panel, if there are duplicate react key
    // props across pages, react may no swap the components correctly, incurring in unexpected behaviours.
    // We need a unique key for each widget.
    uiKey: uuid()
  };
}

export function setStoredDashboardPreferences(
  value: LegacyDashboardPreferences,
  user: string,
  siteIdentifier: string,
  dashletId: string
): void {
  window.localStorage.setItem(`craftercms.dashboard.${dashletId}.${siteIdentifier}.${user}`, JSON.stringify(value));
}

export function getStoredDashboardPreferences(
  user: string,
  siteIdentifier: string,
  dashletId: string
): LegacyDashboardPreferences {
  return JSON.parse(
    window.localStorage.getItem(`craftercms.dashboard.${dashletId}.${siteIdentifier}.${user}`)
  ) as LegacyDashboardPreferences;
}

export function removeStoredDashboardPreferences(user: string, siteIdentifier: string, dashletId: string): void {
  window.localStorage.removeItem(`craftercms.dashboard.${dashletId}.${siteIdentifier}.${user}`);
}

export function setStoredLegacyComponentPanel(value: object, user: string): void {
  window.localStorage.setItem(`craftercms.${user}.legacyComponentPanel`, JSON.stringify(value));
}

export function getStoredLegacyComponentPanel(user: string): object {
  return JSON.parse(window.localStorage.getItem(`craftercms.${user}.legacyComponentPanel`));
}

export function removeStoredLegacyComponentPanel(user: string): void {
  window.localStorage.removeItem(`craftercms.${user}.legacyComponentPanel`);
}

export function setStoredShowToolsPanel(siteIdentifier: string, user: string, value: boolean): void {
  window.localStorage.setItem(`craftercms.${user}.openToolsPanel.${siteIdentifier}`, JSON.stringify(value));
}

export function getStoredShowToolsPanel(siteIdentifier: string, user: string): boolean {
  return JSON.parse(window.localStorage.getItem(`craftercms.${user}.openToolsPanel.${siteIdentifier}`));
}

export function removeStoredShowToolsPanel(siteIdentifier: string, user: string): void {
  window.localStorage.removeItem(`craftercms.${user}.openToolsPanel.${siteIdentifier}`);
}

export function setStoredPreviewToolsPanelWidth(siteIdentifier: string, user: string, value: number): void {
  window.localStorage.setItem(`craftercms.${user}.previewToolsPanelWidth.${siteIdentifier}`, value.toString());
}

export function getStoredPreviewToolsPanelWidth(siteIdentifier: string, user: string): number {
  const value = window.localStorage.getItem(`craftercms.${user}.previewToolsPanelWidth.${siteIdentifier}`);
  return value === null ? (value as null) : parseInt(value);
}

export function removeStoredPreviewToolsPanelWidth(siteIdentifier: string, user: string): void {
  window.localStorage.removeItem(`craftercms.${user}.previewToolsPanelWidth.${siteIdentifier}`);
}

export function setStoredICEToolsPanelWidth(siteIdentifier: string, user: string, value: number): void {
  window.localStorage.setItem(`craftercms.${user}.iceToolsPanelWidth.${siteIdentifier}`, value.toString());
}

export function getStoredICEToolsPanelWidth(siteIdentifier: string, user: string): number {
  const value = window.localStorage.getItem(`craftercms.${user}.iceToolsPanelWidth.${siteIdentifier}`);
  return value === null ? (value as null) : parseInt(value);
}

export function removeStoredICEToolsPanelWidth(siteIdentifier: string, user: string): void {
  window.localStorage.removeItem(`craftercms.${user}.iceToolsPanelWidth.${siteIdentifier}`);
}

export function setStoredICEToolsPanelPage(siteIdentifier: string, user: string, value: WidgetDescriptor): void {
  window.localStorage.setItem(`craftercms.${user}.ICEToolsPanel.${siteIdentifier}`, JSON.stringify(value));
}

export function getStoredICEToolsPanelPage(siteIdentifier: string, user: string): WidgetDescriptor {
  return JSON.parse(window.localStorage.getItem(`craftercms.${user}.ICEToolsPanel.${siteIdentifier}`));
}

export function removeStoredICEToolsPanelPage(siteIdentifier: string, user: string): void {
  window.localStorage.removeItem(`craftercms.${user}.ICEToolsPanel.${siteIdentifier}`);
}

export function commonDialogProps<T>(specificProps: T): EnhancedDialogState & T {
  return {
    open: false,
    isSubmitting: null,
    isMinimized: null,
    hasPendingChanges: null,
    ...specificProps
  };
}

export function setStoredSaveButtonSubAction(user: string, id: string, value: string): void {
  window.localStorage.setItem(`craftercms.${user}.saveButtonSubAction.${id}`, value);
}

export function getStoredSaveButtonSubAction(user: string, id: string): string {
  return window.localStorage.getItem(`craftercms.${user}.saveButtonSubAction.${id}`);
}

export function removeStoredSaveButtonSubAction(user: string, id: string): void {
  window.localStorage.removeItem(`craftercms.${user}.saveButtonSubAction.${id}`);
}

export function setStoredPushBranch(siteId: string, username: string, branchName: string): void {
  localStorage.setItem(`craftercms.${username}.${siteId}.pushBranch`, branchName);
}

export function getStoredPushBranch(siteId: string, username: string): string {
  return localStorage.getItem(`craftercms.${username}.${siteId}.pushBranch`);
}

export function removeStoredPushBranch(siteId: string, username: string): void {
  localStorage.removeItem(`craftercms.${username}.${siteId}.pushBranch`);
}

export function setStoredPullBranch(siteId: string, username: string, branchName: string): void {
  localStorage.setItem(`craftercms.${username}.${siteId}.pullBranch`, branchName);
}

export function getStoredPullBranch(siteId: string, username: string): string {
  return localStorage.getItem(`craftercms.${username}.${siteId}.pullBranch`);
}

export function removeStoredPullBranch(siteId: string, username: string): void {
  localStorage.removeItem(`craftercms.${username}.${siteId}.pullBranch`);
}

export function setStoredPullMergeStrategy(siteId: string, username: string, mergeStrategy: string): void {
  localStorage.setItem(`craftercms.${username}.${siteId}.pullMergeStrategy`, mergeStrategy);
}

export function getStoredPullMergeStrategy(siteId: string, username: string): string {
  return localStorage.getItem(`craftercms.${username}.${siteId}.pullMergeStrategy`);
}

export function removeStoredPullMergeStrategy(siteId: string, username: string): void {
  localStorage.removeItem(`craftercms.${username}.${siteId}.pullMergeStrategy`);
}

export function setStoredPreviewBackgroundMode(username: string, mode: number): void {
  localStorage.setItem(`craftercms.${username}.previewDialog.backgroundMode`, JSON.stringify(mode));
}

export function getStoredPreviewBackgroundMode(username: string): number {
  return JSON.parse(localStorage.getItem(`craftercms.${username}.previewDialog.backgroundMode`));
}

export function removeStoredPreviewBackgroundMode(username: string): void {
  localStorage.removeItem(`craftercms.${username}.previewDialog.backgroundMode`);
}

export function setStoredBrowseDialogCompactMode(username: string, compact: boolean): void {
  localStorage.setItem(`craftercms.${username}.browseDialog.compactMode`, String(compact));
}

export function getStoredBrowseDialogCompactMode(username: string): boolean {
  return JSON.parse(localStorage.getItem(`craftercms.${username}.browseDialog.compactMode`)) ?? false;
}

export function removeStoredBrowseDialogCompactMode(username: string): void {
  localStorage.removeItem(`craftercms.${username}.browseDialog.compactMode`);
}

export function getStoredOutdatedXBValidationDate(siteId: string, username: string): Date {
  const dateString = localStorage.getItem(`craftermcs.${username}.${siteId}.outdatedXBValidationDate`);
  return dateString ? new Date(dateString) : null;
}

export function setStoredOutdatedXBValidationDate(siteId: string, username: string, date: Date): void {
  const dateString = date.toDateString();
  localStorage.setItem(`craftermcs.${username}.${siteId}.outdatedXBValidationDate`, dateString);
}

export function removeStoredOutdatedXBValidationDate(siteId: string, username: string): void {
  localStorage.removeItem(`craftermcs.${username}.${siteId}.outdatedXBValidationDate`);
}

// Gets the stored list of system type groups used by a dashlet (identified by storageKey) for filtering
export function getDashletFilterSystemTypeGroups(siteIdentifier: string, storageKey: string): FilterSystemTypeGroups[] {
  const typeGroups = localStorage.getItem(`craftercms.${siteIdentifier}.${storageKey}.dashletFilterTypeGroups`);
  return typeGroups?.split(',') as FilterSystemTypeGroups[];
}

// Stores a list of system group types (from where we retrieve the system types) for dashlet filtering.
export function setDashletFilterSystemTypeGroups(
  siteIdentifier: string,
  storageKey: string,
  typeGroups: FilterSystemTypeGroups[]
): void {
  localStorage.setItem(`craftercms.${siteIdentifier}.${storageKey}.dashletFilterTypeGroups`, typeGroups.join(','));
}

export function removeDashletFilterSystemTypeGroups(siteIdentifier: string, storageKey: string): void {
  localStorage.removeItem(`craftercms.${siteIdentifier}.${storageKey}.dashletFilterTypeGroups`);
}

export function removeStoredItems(match: (key: string) => boolean): void {
  Object.keys(localStorage)
    .filter((key) => match(key))
    .forEach((key) => {
      localStorage.removeItem(key);
    });
}
