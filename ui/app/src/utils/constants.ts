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

export const STATE_MASK_NEW_MASK = 0b1;
export const STATE_MASK_MODIFIED_MASK = 0b10;
export const STATE_MASK_DELETED_MASK = 0b100;
export const STATE_MASK_LOCKED_MASK = 0b1000;
export const STATE_MASK_SYSTEM_PROCESSING_MASK = 0b10000;
export const STATE_MASK_IN_WORKFLOW_MASK = 0b100000;
export const STATE_MASK_SCHEDULED_MASK = 0b1000000;
export const STATE_MASK_STAGED_MASK = 0b10000000;
export const STATE_MASK_LIVE_MASK = 0b100000000;
export const STATE_MASK_TRANSLATION_UP_TO_DATE_MASK = 0b1000000000;
export const STATE_MASK_TRANSLATION_PENDING_MASK = 0b10000000000;
export const STATE_MASK_TRANSLATION_IN_PROGRESS_MASK = 0b100000000000;
export const STATE_MASK_SUBMITTED_MASK = 0b1000000000000;
