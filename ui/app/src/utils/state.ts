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

export function getStoredEditModeChoice(site: string): string {
  return window.localStorage.getItem(`craftercms.editModeChoice.${site}`);
}

export function setStoredEditModeChoice(site: string, value: string) {
  return window.localStorage.setItem(`craftercms.editModeChoice.${site}`, value);
}

export function createToolsPanelPage(title: string, widgets: WidgetDescriptor[]): WidgetDescriptor {
  return {
    id: 'craftercms.components.ToolsPanelPage',
    uiKey: `uiKey_${Date.now()}`,
    configuration: {
      title,
      widgets
    }
  };
}

const state = {
  getStateMapFromLegacyItem,
  getStoredPreviewChoice,
  setStoredPreviewChoice,
  createToolsPanelPage
};

export default state;
