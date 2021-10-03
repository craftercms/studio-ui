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

import { PublishingStatus } from '../../models/Publishing';
import { defineMessages, IntlShape } from 'react-intl';
import { capitalize } from '@mui/material';

export const publishingStatusMessages = defineMessages({
  ready: {
    id: 'words.ready',
    defaultMessage: 'Ready'
  },
  processing: {
    id: 'words.processing',
    defaultMessage: 'Processing'
  },
  publishing: {
    id: 'words.publishing',
    defaultMessage: 'Publishing'
  },
  queued: {
    id: 'words.queued',
    defaultMessage: 'Queued'
  },
  stopped: {
    id: 'words.stopped',
    defaultMessage: 'Stopped'
  },
  error: {
    id: 'words.error',
    defaultMessage: 'Error'
  },
  processingMessage: {
    id: 'publishingStatusMessages.processingMessage',
    defaultMessage: 'Preparing items for publishing. {numberOfItems} out of {totalItems} processed so far.'
  },
  publishingMessage: {
    id: 'publishingStatusMessages.publishingMessage',
    defaultMessage:
      'Publishing items. Published {numberOfItems} {numberOfItems, plural, one {item} other {items}} out of {totalItems} to {publishingTarget}. Package id is {submissionId}.'
  },
  queuedMessage: {
    id: 'publishingStatusMessages.queuedMessage',
    defaultMessage: 'Items are scheduled for publishing.'
  },
  stoppedMessage: {
    id: 'publishingStatusMessages.stoppedMessage',
    defaultMessage: 'The publisher was stopped by an administrator.'
  },
  errorMessage: {
    id: 'publishingStatusMessages.errorMessage',
    defaultMessage: 'The publisher was stopped due to an error.'
  },
  refresh: {
    id: 'words.refresh',
    defaultMessage: 'Refresh'
  },
  unlock: {
    id: 'words.unlock',
    defaultMessage: 'Unlock'
  },
  start: {
    id: 'words.start',
    defaultMessage: 'Start'
  },
  stop: {
    id: 'words.stop',
    defaultMessage: 'Stop'
  },
  publishingStatus: {
    id: 'publishingStatusMessages.publishingStatus',
    defaultMessage: 'Publishing Status'
  },
  lockOwner: {
    id: 'publishingStatusMessages.lockOwnerDisplayMessage',
    defaultMessage: 'Locked by {lockOwner}'
  },
  lockTTL: {
    id: 'publishingStatusMessages.lockTTLMessage',
    defaultMessage: 'TTL {lockTTL}'
  },
  disabled: {
    id: 'publishingStatusMessages.isDisabledMessage',
    defaultMessage: 'The publisher is disabled.'
  }
});

export function getPublishingStatusText(
  status: PublishingStatus['status'],
  formatMessage: IntlShape['formatMessage']
): string {
  return publishingStatusMessages[status] ? formatMessage(publishingStatusMessages[status]) : capitalize(status);
}

export function getPublishingStatusMessage(
  props: Pick<
    PublishingStatus,
    'status' | 'numberOfItems' | 'totalItems' | 'publishingTarget' | 'submissionId' | 'enabled'
  >,
  formatMessage: IntlShape['formatMessage']
): string {
  switch (props.status) {
    case 'ready':
      return formatMessage(publishingStatusMessages.ready);
    case 'processing':
      return formatMessage(publishingStatusMessages.processingMessage, props);
    case 'publishing':
      return formatMessage(publishingStatusMessages.publishingMessage, props);
    case 'queued':
      return formatMessage(publishingStatusMessages.queuedMessage);
    case 'stopped':
      return formatMessage(publishingStatusMessages.stoppedMessage);
    case 'error':
      return formatMessage(publishingStatusMessages.errorMessage);
    default:
      return capitalize(props.status);
  }
}
