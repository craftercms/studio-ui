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

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material';

export type PartialRecord<K extends string | number | symbol, V> = Partial<Record<K, V>>;

export type PartialSxRecord<K extends string | number | symbol> = PartialRecord<K, SxProps<Theme>>;

export type PartialClassRecord<K extends string | number | symbol> = PartialRecord<K, string>;

export type FullSxRecord<K extends string | number | symbol> = Record<K, SxProps<Theme>>;

export type FullClassRecord<K extends string | number | symbol> = Record<K, string>;

export default PartialRecord;
