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

import { ItemStateMap, LegacyItem } from '../models/Item';
import { WidgetDescriptor } from '../components/Widget';
import { nanoid as uuid } from 'nanoid';
import TranslationOrText from '../models/TranslationOrText';
import { DashboardPreferences } from '../models/Dashboard';
import ToolsPanelTarget from '../models/ToolsPanelTarget';
import { EnhancedDialogState } from './hooks/useEnhancedDialogState';
import { HighlightMode } from '../models/GlobalState';

export function setStoredGlobalMenuSiteViewPreference(value: 'grid' | 'list', user: string) {
  window.localStorage.setItem(`craftercms.${user}.globalMenuSiteViewPreference`, value);
}

export function getStoredGlobalMenuSiteViewPreference(user: string): 'grid' | 'list' {
  return window.localStorage.getItem(`craftercms.${user}.globalMenuSiteViewPreference`) as 'grid' | 'list';
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

export function setStoredHighlightModeChoice(value: HighlightMode, user: string): void {
  window.localStorage.setItem(`craftercms.${user}.highlightModeChoice`, value);
}

export function getStoredHighlightModeChoice(user: string): HighlightMode {
  return window.localStorage.getItem(`craftercms.${user}.highlightModeChoice`) as HighlightMode;
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

export function setStoredPathNavigator(siteIdentifier: string, user: string, id: string, value: object): void {
  window.localStorage.setItem(`craftercms.${user}.pathNavigator.${siteIdentifier}.${id}`, JSON.stringify(value));
}

export function getStoredPathNavigator(siteIdentifier: string, user: string, id: string) {
  return JSON.parse(window.localStorage.getItem(`craftercms.${user}.pathNavigator.${siteIdentifier}.${id}`));
}

export function setStoredPathNavigatorTree(siteIdentifier: string, user: string, id: string, value: object) {
  window.localStorage.setItem(`craftercms.${user}.pathNavigatorTree.${siteIdentifier}.${id}`, JSON.stringify(value));
}

export function getStoredPathNavigatorTree(siteIdentifier: string, user: string, id: string) {
  return JSON.parse(window.localStorage.getItem(`craftercms.${user}.pathNavigatorTree.${siteIdentifier}.${id}`));
}

export function setStoredGlobalAppOpenSidebar(user: string, value: boolean) {
  window.localStorage.setItem(`craftercms.${user}.globalAppOpenSidebar`, JSON.stringify(value));
}

export function getStoredGlobalAppOpenSidebar(user: string): string {
  return window.localStorage.getItem(`craftercms.${user}.globalAppOpenSidebar`);
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
  value: DashboardPreferences,
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
): DashboardPreferences {
  return JSON.parse(
    window.localStorage.getItem(`craftercms.dashboard.${dashletId}.${siteIdentifier}.${user}`)
  ) as DashboardPreferences;
}

export function setStoredLegacyComponentPanel(value: object, user: string): void {
  window.localStorage.setItem(`craftercms.${user}.legacyComponentPanel`, JSON.stringify(value));
}

export function getStoredLegacyComponentPanel(user: string): object {
  return JSON.parse(window.localStorage.getItem(`craftercms.${user}.legacyComponentPanel`));
}

export function setStoredShowToolsPanel(siteIdentifier: string, user: string, value: boolean): void {
  window.localStorage.setItem(`craftercms.${user}.openToolsPanel.${siteIdentifier}`, JSON.stringify(value));
}

export function getStoredShowToolsPanel(siteIdentifier: string, user: string): boolean {
  return JSON.parse(window.localStorage.getItem(`craftercms.${user}.openToolsPanel.${siteIdentifier}`));
}

export function setStoredPreviewToolsPanelWidth(siteIdentifier: string, user: string, value: number): void {
  window.localStorage.setItem(`craftercms.${user}.previewToolsPanelWidth.${siteIdentifier}`, value.toString());
}

export function getStoredPreviewToolsPanelWidth(siteIdentifier: string, user: string): number {
  const value = window.localStorage.getItem(`craftercms.${user}.previewToolsPanelWidth.${siteIdentifier}`);
  return value === null ? (value as null) : parseInt(value);
}

export function setStoredICEToolsPanelWidth(siteIdentifier: string, user: string, value: number): void {
  window.localStorage.setItem(`craftercms.${user}.iceToolsPanelWidth.${siteIdentifier}`, value.toString());
}

export function getStoredICEToolsPanelWidth(siteIdentifier: string, user: string): number {
  const value = window.localStorage.getItem(`craftercms.${user}.iceToolsPanelWidth.${siteIdentifier}`);
  return value === null ? (value as null) : parseInt(value);
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
