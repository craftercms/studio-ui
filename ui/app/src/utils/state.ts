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

export function setStoredClipboard(site: string, user: string, value: object) {
  return window.localStorage.setItem(
    `craftercms.${user}.clipboard.${site}`,
    JSON.stringify({ ...value, timestamp: Date.now() })
  );
}

export function getStoredClipboard(site: string, user: string) {
  return JSON.parse(window.localStorage.getItem(`craftercms.${user}.clipboard.${site}`));
}

export function removeStoredClipboard(site: string, user: string) {
  return window.localStorage.removeItem(`craftercms.${user}.clipboard.${site}`);
}

export function setStoredPreviewToolsPanelPage(site: string, user: string, value: object) {
  return window.localStorage.setItem(`craftercms.${user}.previewToolsPanelPage.${site}`, JSON.stringify(value));
}

export function getStoredPreviewToolsPanelPage(site: string, user: string) {
  return JSON.parse(window.localStorage.getItem(`craftercms.${user}.previewToolsPanelPage.${site}`));
}

export function removeStoredPreviewToolsPanelPage(site: string, user: string) {
  return window.localStorage.removeItem(`craftercms.${user}.previewToolsPanelPage.${site}`);
}

export function setStoredPathNavigator(site: string, user: string, id: string, value: object) {
  return window.localStorage.setItem(`craftercms.${user}.pathNavigator.${site}.${id}`, JSON.stringify(value));
}

export function getStoredPathNavigator(site: string, user: string, id: string) {
  return JSON.parse(window.localStorage.getItem(`craftercms.${user}.pathNavigator.${site}.${id}`));
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
