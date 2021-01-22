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

const NEW_MASK = 0b0000000000000000000000000000000000000000000000000000000000000001;
const MODIFIED_MASK = 0b0000000000000000000000000000000000000000000000000000000000000010;
const DELETED_MASK = 0b0000000000000000000000000000000000000000000000000000000000000100;
const LOCKED_MASK = 0b0000000000000000000000000000000000000000000000000000000000001000;
const SYSTEM_PROCESSING_MASK = 0b0000000000000000000000000000000000000000000000000000000000010000;
const IN_WORKFLOW_MASK = 0b0000000000000000000000000000000000000000000000000000000000100000;
const SCHEDULED_MASK = 0b0000000000000000000000000000000000000000000000000000000001000000;
const STAGED_MASK = 0b0000000000000000000000000000000000000000000000000000000010000000;
const LIVE_MASK = 0b0000000000000000000000000000000000000000000000000000000100000000;
const TRANSLATION_UP_TO_DATE_MASK = 0b0000000000000000000000000000000000000000000000000000001000000000;
const TRANSLATION_PENDING_MASK = 0b0000000000000000000000000000000000000000000000000000010000000000;
const TRANSLATION_IN_PROGRESS_MASK = 0b0000000000000000000000000000000000000000000000000000100000000000;
const SUBMITTED_MASK = 0b0000000000000000000000000000000000000000000000000001000000000000;

export const isNew = (value: number) => Boolean(value & NEW_MASK);
export const isModified = (value: number) => Boolean(value & MODIFIED_MASK);
export const isDeleted = (value: number) => Boolean(value & DELETED_MASK);
export const isLocked = (value: number) => Boolean(value & LOCKED_MASK);
export const isSystemProcessing = (value: number) => Boolean(value & SYSTEM_PROCESSING_MASK);
export const isInWorkflow = (value: number) => Boolean(value & IN_WORKFLOW_MASK);
export const isScheduled = (value: number) => Boolean(value & SCHEDULED_MASK);
export const isStaged = (value: number) => Boolean(value & STAGED_MASK);
export const isLive = (value: number) => Boolean(value & LIVE_MASK);
export const isSubmitted = (value: number) => Boolean(value & SUBMITTED_MASK);
export const isTranslationUpToDate = (value: number) => Boolean(value & TRANSLATION_UP_TO_DATE_MASK);
export const isTranslationPending = (value: number) => Boolean(value & TRANSLATION_PENDING_MASK);
export const isTranslationInProgress = (value: number) => Boolean(value & TRANSLATION_IN_PROGRESS_MASK);

export const getStateMap = (status: number) => {
  return {
    new: isNew(status),
    modified: isModified(status),
    deleted: isDeleted(status),
    userLocked: isLocked(status),
    systemProcessing: isSystemProcessing(status),
    inWorkflow: isInWorkflow(status),
    scheduled: isScheduled(status),
    staged: isStaged(status),
    live: isLive(status),
    submitted: isSubmitted(status),
    translationUpToDate: isTranslationUpToDate(status),
    translationPending: isTranslationPending(status),
    translationInProgress: isTranslationInProgress(status)
  };
};
