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

export const GROUP_NAME_MAX_LENGTH = 512;
export const GROUP_DESCRIPTION_MAX_LENGTH = 1024;
export const GROUP_NAME_MIN_LENGTH = 3;

export const validateGroupNameMinLength = (value: string) => {
  return value.trim() !== '' && value.trim().length < GROUP_NAME_MIN_LENGTH;
};

export const validateRequiredField = (value: string, isDirty: boolean) => {
  return isDirty && value.trim() === '';
};
