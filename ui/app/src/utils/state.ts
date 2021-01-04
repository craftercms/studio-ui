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

import { LegacyItem } from '../models/Item';
import { WidgetDescriptor } from '../components/Widget';
import uuid from 'uuid/v4';
import { MessageDescriptor } from 'react-intl';

export function getStateMapFromLegacyItem(item: LegacyItem) {
  return {
    ...(item.isDeleted && { deleted: true }),
    ...(item.isSubmitted && { submitted: true }),
    ...(item.isScheduled && { scheduled: true })
  };
}

export function getStoredPreviewChoice(site: string) {
  return window.localStorage.getItem(`craftercms.previewCompatChoice.${site}`);
}

export function setStoredPreviewChoice(site: string, value: string) {
  return window.localStorage.setItem(`craftercms.previewCompatChoice.${site}`, value);
}

export function getStoredEditModeChoice(): string {
  return window.localStorage.getItem(`craftercms.editModeChoice`);
}

export function setStoredEditModeChoice(value: string) {
  return window.localStorage.setItem(`craftercms.editModeChoice`, value);
}

export function getStoredhighlightModeChoice(): string {
  return window.localStorage.getItem(`craftercms.highlightModeChoice`);
}

export function setStoredhighlightModeChoice(value: string) {
  return window.localStorage.setItem(`craftercms.highlightModeChoice`, value);
}

export function setStoredClipboard(site: string, value: object) {
  return window.localStorage.setItem(
    `craftercms.clipboard.${site}`,
    JSON.stringify({ ...value, timestamp: Date.now() })
  );
}

export function getStoredClipboard(site: string) {
  return JSON.parse(window.localStorage.getItem(`craftercms.clipboard.${site}`));
}

export function removeStoredClipboard(site: string) {
  return window.localStorage.removeItem(`craftercms.clipboard.${site}`);
}

export function setStoredPreviewToolsPanelPage(site: string, value: object) {
  return window.localStorage.setItem(`craftercms.previewToolsPanelPage.${site}`, JSON.stringify(value));
}

export function getStoredPreviewToolsPanelPage(site: string) {
  return JSON.parse(window.localStorage.getItem(`craftercms.previewToolsPanelPage.${site}`));
}

export function removeStoredPreviewToolsPanelPage(site: string) {
  return window.localStorage.removeItem(`craftercms.previewToolsPanelPage.${site}`);
}

export function setStoredPathNavigator(site: string, id: string, value: object) {
  return window.localStorage.setItem(`craftercms.pathNavigator.${site}.${id}`, JSON.stringify(value));
}

export function getStoredPathNavigator(site: string, id: string) {
  return JSON.parse(window.localStorage.getItem(`craftercms.pathNavigator.${site}.${id}`));
}

export function createToolsPanelPage(title: string | MessageDescriptor, widgets: WidgetDescriptor[]): WidgetDescriptor {
  return createWidgetDescriptor({
    id: 'craftercms.components.ToolsPanelPage',
    configuration: {
      title,
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
