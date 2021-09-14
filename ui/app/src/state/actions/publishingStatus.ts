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

import { createAction } from '@reduxjs/toolkit';
import { PublishingStatusDialogStateProps } from '../../components/PublishingStatusDialog';
import { PublishingStatus } from '../../models/Publishing';

export const updatePublishingStatus = /*#__PURE__*/ createAction<Partial<PublishingStatusDialogStateProps>>(
  'UPDATE_PUBLISHING_STATUS'
);

export const fetchPublishingStatus = /*#__PURE__*/ createAction('FETCH_PUBLISHING_STATUS');

export const fetchPublishingStatusComplete = /*#__PURE__*/ createAction<PublishingStatus>(
  'FETCH_PUBLISHING_STATUS_COMPLETE'
);

export const fetchPublishingStatusProcessingComplete = /*#__PURE__*/ createAction<PublishingStatus>(
  'FETCH_PUBLISHING_STATUS_PROCESSING_COMPLETE'
);

export const fetchPublishingStatusFailed = /*#__PURE__*/ createAction('FETCH_PUBLISHING_STATUS_FAILED');

export const startPublishingStatusFetcher = /*#__PURE__*/ createAction('START_PUBLISHING_STATUS_FETCHER');

export const stopPublishingStatusFetcher = /*#__PURE__*/ createAction('STOP_PUBLISHING_STATUS_FETCHER');
