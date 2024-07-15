/*
 * Copyright (C) 2007-2024 Crafter Software Corporation. All Rights Reserved.
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

import ApiResponse from './ApiResponse';

/**
 * Essentially a redeclaration of `Omit<AjaxError, 'request' | 'xhr'>`. Mainly removes
 * non-serializables from AjaxError and allows typing of the `response` property.
 **/
export interface SimpleAjaxError<T = ApiResponse> {
  message: string;
  name: string;
  response: T;
  responseType: string;
  status: number;
}

export default SimpleAjaxError;
