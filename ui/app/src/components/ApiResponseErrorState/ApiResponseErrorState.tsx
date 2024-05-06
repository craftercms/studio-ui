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

import { Api2ResponseFormat, ApiResponse } from '../../models/ApiResponse';
import Button from '@mui/material/Button';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import React from 'react';
import { useIntl } from 'react-intl';
import ErrorState, { ErrorStateProps } from '../ErrorState/ErrorState';

export type ApiResponseErrorStateProps = Omit<ErrorStateProps, 'title' | 'message'> & {
  error: ApiResponse;
  validationErrors?: Api2ResponseFormat<any>['validationErrors'];
};

export function createErrorStatePropsFromApiResponse(
  apiResponse: ApiResponse,
  formatMessage,
  validationErrors?: Api2ResponseFormat<any>['validationErrors']
): Partial<ErrorStateProps> {
  const {
    code,
    message = '',
    remedialAction,
    documentationUrl
  } = apiResponse ?? {
    code: '',
    message: formatMessage({
      defaultMessage: 'The server is unreachable or your are offline.'
    })
  };
  return {
    title: [
      formatMessage({
        id: 'words.error',
        defaultMessage: 'Error'
      }),
      code
    ]
      .filter(Boolean)
      .join(' '),
    message:
      message +
      (message.endsWith('.') || !remedialAction ? '' : '.') +
      (remedialAction ? ` ${remedialAction}` : '') +
      (remedialAction && message ? (remedialAction.endsWith('.') ? '' : '.') : ''),
    children: (
      <>
        {validationErrors?.map(({ field, message }, index) => (
          <div key={`${field}_${index}`}>{message}</div>
        ))}
        {documentationUrl && (
          <Button href={documentationUrl} target="_blank" rel="noreferrer" variant="text">
            {formatMessage({
              id: 'common.moreInfo',
              defaultMessage: 'More info'
            })}{' '}
            <OpenInNewIcon />
          </Button>
        )}
      </>
    )
  };
}

export function ApiResponseErrorState(props: ApiResponseErrorStateProps) {
  const { error, validationErrors } = props;
  const { formatMessage } = useIntl();
  return <ErrorState {...props} {...createErrorStatePropsFromApiResponse(error, formatMessage, validationErrors)} />;
}

export default ApiResponseErrorState;
