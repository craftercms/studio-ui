/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software) you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http)//www.gnu.org/licenses/>.
 */

import { ItemStateMap } from '../../models/Item';
import {
  PUBLISHING_LIVE_MASK,
  PUBLISHING_STAGED_MASK,
  STATE_DELETED_MASK,
  STATE_LOCKED_MASK,
  STATE_MODIFIED_MASK,
  STATE_NEW_MASK,
  STATE_SCHEDULED_MASK,
  STATE_SUBMITTED_MASK,
  STATE_SYSTEM_PROCESSING_MASK
} from '../../utils/constants';

export function getStateBitmap(stateMap: ItemStateMap): number {
  let mask = 0;
  if (stateMap.new) {
    mask += STATE_NEW_MASK;
  }
  if (stateMap.modified) {
    mask += STATE_MODIFIED_MASK;
  }
  if (stateMap.deleted) {
    mask += STATE_DELETED_MASK;
  }
  if (stateMap.locked) {
    mask += STATE_LOCKED_MASK;
  }
  if (stateMap.systemProcessing) {
    mask += STATE_SYSTEM_PROCESSING_MASK;
  }
  if (stateMap.submitted) {
    mask += STATE_SUBMITTED_MASK;
  }
  if (stateMap.scheduled) {
    mask += STATE_SCHEDULED_MASK;
  }
  if (stateMap.staged) {
    mask += PUBLISHING_STAGED_MASK;
  }
  if (stateMap.live) {
    mask += PUBLISHING_LIVE_MASK;
  }
  return mask;
}
