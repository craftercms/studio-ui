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

import React from 'react';
import { ErrorState, ErrorStateProps } from './ErrorState';
import { isAjaxError, isApiResponse } from '../../utils/object';
import { ApiResponseErrorState } from '../ApiResponseErrorState';

export function renderErrorState(error: any, errorStateProps?: ErrorStateProps): JSX.Element {
  const errorObj = error.response ?? error;
  return isApiResponse(errorObj) ? (
    <ApiResponseErrorState error={errorObj} {...errorStateProps} />
  ) : isAjaxError(errorObj) ? (
    <ErrorState title={`${errorObj.name} ${errorObj.status}`} message={errorObj.message} {...errorStateProps} />
  ) : (
    <ErrorState message={errorObj.message ?? errorObj} {...errorStateProps} />
  );
}
