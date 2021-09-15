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

export function setStoredGlobalMenuSiteViewPreference(value: 'grid' | 'list', user: string) {
  return window.localStorage.setItem(`craftercms.${user}.globalMenuSiteViewPreference`, value);
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

export function getStoredEditModeChoice(user: string): string {
  return window.localStorage.getItem(`craftercms.${user}.editModeChoice`);
}

export function setStoredEditModeChoice(value: string, user: string) {
  return window.localStorage.setItem(`craftercms.${user}.editModeChoice`, value);
}

export function getStoredHighlightModeChoice(user: string): string {
  return window.localStorage.getItem(`craftercms.${user}.highlightModeChoice`);
}

export function setStoredHighlightModeChoice(value: string, user: string) {
  return window.localStorage.setItem(`craftercms.${user}.highlightModeChoice`, value);
}

export function setStoredClipboard(siteIdentifier: string, user: string, value: object) {
  return window.localStorage.setItem(
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

export function setStoredPreviewToolsPanelPage(siteIdentifier: string, user: string, value: WidgetDescriptor) {
  return window.localStorage.setItem(
    `craftercms.${user}.previewToolsPanelPage.${siteIdentifier}`,
    JSON.stringify(value)
  );
}

export function getStoredPreviewToolsPanelPage(siteIdentifier: string, user: string): WidgetDescriptor {
  return JSON.parse(window.localStorage.getItem(`craftercms.${user}.previewToolsPanelPage.${siteIdentifier}`));
}

export function removeStoredPreviewToolsPanelPage(siteIdentifier: string, user: string) {
  return window.localStorage.removeItem(`craftercms.${user}.previewToolsPanelPage.${siteIdentifier}`);
}

export function setStoredPathNavigator(siteIdentifier: string, user: string, id: string, value: object) {
  return window.localStorage.setItem(`craftercms.${user}.pathNavigator.${siteIdentifier}.${id}`, JSON.stringify(value));
}

export function getStoredPathNavigator(siteIdentifier: string, user: string, id: string) {
  return JSON.parse(window.localStorage.getItem(`craftercms.${user}.pathNavigator.${siteIdentifier}.${id}`));
}

export function setStoredPathNavigatorTree(siteIdentifier: string, user: string, id: string, value: object) {
  return window.localStorage.setItem(
    `craftercms.${user}.pathNavigatorTree.${siteIdentifier}.${id}`,
    JSON.stringify(value)
  );
}

export function getStoredPathNavigatorTree(siteIdentifier: string, user: string, id: string) {
  return JSON.parse(window.localStorage.getItem(`craftercms.${user}.pathNavigatorTree.${siteIdentifier}.${id}`));
}

export function setStoredGlobalAppOpenSidebar(user: string, value: boolean) {
  return window.localStorage.setItem(`craftercms.${user}.globalAppOpenSidebar`, JSON.stringify(value));
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
) {
  return window.localStorage.setItem(
    `craftercms.dashboard.${dashletId}.${siteIdentifier}.${user}`,
    JSON.stringify(value)
  );
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

export function getStoredLegacyComponentPanel(user: string): object {
  return JSON.parse(window.localStorage.getItem(`craftercms.${user}.legacyComponentPanel`));
}

export function setStoredLegacyComponentPanel(value: object, user: string) {
  return window.localStorage.setItem(`craftercms.${user}.legacyComponentPanel`, JSON.stringify(value));
}

export function setStoredShowToolsPanel(siteIdentifier: string, user: string, value: boolean) {
  return window.localStorage.setItem(`craftercms.${user}.openToolsPanel.${siteIdentifier}`, JSON.stringify(value));
}

export function getStoredShowToolsPanel(siteIdentifier: string, user: string): boolean {
  return JSON.parse(window.localStorage.getItem(`craftercms.${user}.openToolsPanel.${siteIdentifier}`));
}

export function getStoredPreviewToolsPanelWidth(siteIdentifier: string, user: string): number {
  return parseInt(window.localStorage.getItem(`craftercms.${user}.previewToolsPanelWidth.${siteIdentifier}`));
}

export function setStoredPreviewToolsPanelWidth(siteIdentifier: string, user: string, value: number) {
  return window.localStorage.setItem(`craftercms.${user}.previewToolsPanelWidth.${siteIdentifier}`, value.toString());
}

export function getStoredICEToolsPanelWidth(siteIdentifier: string, user: string): number {
  return parseInt(window.localStorage.getItem(`craftercms.${user}.iceToolsPanelWidth.${siteIdentifier}`));
}

export function setStoredICEToolsPanelWidth(siteIdentifier: string, user: string, value: number) {
  return window.localStorage.setItem(`craftercms.${user}.iceToolsPanelWidth.${siteIdentifier}`, value.toString());
}
