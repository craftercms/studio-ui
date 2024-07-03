/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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

import { PublishingStatus, PublishingStatusCodes } from '../../models/Publishing';
import { defineMessages, IntlShape } from 'react-intl';
import { capitalize } from '@mui/material';
import { nou } from '../../utils/object';

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
  readyWithErrors: { defaultMessage: 'Ready' },
  disabled: {
    id: 'words.disabled',
    defaultMessage: 'Disabled'
  },
  unknown: {
    id: 'words.unknown',
    defaultMessage: 'Unknown'
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
  disabledMessage: {
    id: 'publishingStatusMessages.isDisabledMessage',
    defaultMessage: 'The publisher is disabled.'
  },
  yes: {
    id: 'words.yes',
    defaultMessage: 'Yes'
  },
  no: {
    id: 'words.no',
    defaultMessage: 'No'
  },
  confirmUnlockPublisher: {
    id: 'publishingStatusMessages.confirmUnlockPublisher',
    defaultMessage: 'Confirm you wish to unlock the publisher?'
  }
});

export function getPublishingStatusText(
  status: Pick<PublishingStatus, 'status' | 'enabled'>,
  formatMessage: IntlShape['formatMessage']
): string {
  if (!status.enabled) {
    return formatMessage(publishingStatusMessages.disabled);
  }
  return formatMessage(publishingStatusMessages[status.status] ?? publishingStatusMessages.unknown);
}

export function getPublishingStatusMessage(
  props: Pick<
    PublishingStatus,
    'status' | 'numberOfItems' | 'totalItems' | 'publishingTarget' | 'submissionId' | 'enabled'
  >,
  formatMessage: IntlShape['formatMessage']
): string {
  if (nou(props.enabled)) {
    return formatMessage({ defaultMessage: 'The publisher status details did not load correctly.' });
  } else if (!props.enabled) {
    return formatMessage(publishingStatusMessages.disabledMessage);
  }
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
    case 'readyWithErrors':
      return formatMessage(publishingStatusMessages.readyWithErrors);
    default:
      return capitalize(props.status);
  }
  // region Compiler hints
  // Var below is for typescript to complain if we ever add/remove codes.
  // eslint-disable-next-line no-unreachable,@typescript-eslint/no-unused-vars
  const control: Record<PublishingStatusCodes, any> = {
    error: undefined,
    processing: undefined,
    publishing: undefined,
    queued: undefined,
    ready: undefined,
    readyWithErrors: undefined,
    stopped: undefined
  };
  // endregion
}
