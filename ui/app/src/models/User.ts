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

import { LookupTable } from './LookupTable';

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  authType: string;
  rolesBySite: LookupTable<string[]>;
  sites: string[];
  preferences: LookupTable;
}

export interface Credentials {
  username: string;
  password: string;
}

export interface LegacyUser extends Omit<User, 'authType'> {
  authenticationType: string;
}
