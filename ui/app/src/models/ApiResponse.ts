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

export interface ApiResponse {
  code?: number | string;
  message?: string;
  remedialAction?: string;
  documentationUrl?: string;
}

export type Api2ResponseFormat<T> = {
  response: ApiResponse;
} & T;

export type Api2BulkResponseFormat<T> = {
  limit: number;
  offset: number;
  total: number;
  response: ApiResponse;
} & T;

export default ApiResponse;
