/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import { DetailedItem } from '../models/Item';

export function getDateScheduled(item: DetailedItem): string {
  if (item.stateMap.submittedToStaging) {
    return item.staging?.dateScheduled;
  } else if (item.stateMap.submittedToLive) {
    return item.live?.dateScheduled;
  } else {
    return null;
  }
}

export function getDatePublished(item: DetailedItem): string {
  if (item.stateMap.staged) {
    return item.staging?.datePublished;
  } else if (item.stateMap.live) {
    return item.live?.datePublished;
  } else {
    return null;
  }
}
