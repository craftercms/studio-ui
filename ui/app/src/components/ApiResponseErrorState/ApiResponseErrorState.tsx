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

import { ApiResponse } from '../../models/ApiResponse';
import { nnou } from '../../utils/object';
import Button from '@material-ui/core/Button';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import ErrorState, { ErrorStateProps } from '../ErrorState/ErrorState';

let UND;

export type ApiResponseErrorStateProps = Omit<ErrorStateProps, 'title' | 'message'> & {
  error: ApiResponse;
};

const messages = defineMessages({
  moreInfo: {
    id: 'common.moreInfo',
    defaultMessage: 'More info'
  },
  error: {
    id: 'words.error',
    defaultMessage: 'Error'
  },
  back: {
    id: 'words.back',
    defaultMessage: 'Back'
  }
});

export function createErrorStatePropsFromApiResponse(
  apiResponse: ApiResponse,
  formatMessage
): Partial<ErrorStateProps> {
  const { code, message = '', remedialAction, documentationUrl } = apiResponse;
  return {
    title: nnou(code) ? `${formatMessage(messages.error)}${code ? ` ${code}` : ''}` : '',
    message:
      message +
      (message.endsWith('.') || !remedialAction ? '' : '.') +
      (remedialAction ? ` ${remedialAction}` : '') +
      (remedialAction && message ? (remedialAction.endsWith('.') ? '' : '.') : ''),
    children: documentationUrl ? (
      <Button href={documentationUrl} target="_blank" rel="noreferrer" variant="text">
        {formatMessage(messages.moreInfo)} <OpenInNewIcon />
      </Button>
    ) : (
      UND
    )
  };
}

export default function ApiResponseErrorState(props: ApiResponseErrorStateProps) {
  const { error } = props;
  const { formatMessage } = useIntl();
  return <ErrorState {...props} {...createErrorStatePropsFromApiResponse(error, formatMessage)} />;
}
