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

export const USER_FIRST_NAME_MIN_LENGTH = 2;
export const USER_LAST_NAME_MIN_LENGTH = 2;
export const USER_USERNAME_MIN_LENGTH = 2;
export const USER_USERNAME_MAX_LENGTH = 255;
export const USER_PASSWORD_MAX_LENGTH = 128;
export const USER_FIRST_NAME_MAX_LENGTH = 32;
export const USER_LAST_NAME_MAX_LENGTH = 32;
export const USER_EMAIL_MAX_LENGTH = 255;

export const minLengthMap = {
  username: USER_USERNAME_MIN_LENGTH,
  firstName: USER_FIRST_NAME_MIN_LENGTH,
  lastName: USER_LAST_NAME_MIN_LENGTH
};

export const isInvalidEmail = (email: string) => {
  // From https://emailregex.com/, according to the RFC 5322 standard
  const emailRegex =
    // Linter shows a couple of warnings, but the regex is correct
    // eslint-disable-next-line
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/gm;
  return Boolean(email) && !emailRegex.test(email);
};

export const isInvalidUsername = (username: string) => {
  const usernameRegex = /^[a-zA-Z][\w.\-@+]+$/g;
  return Boolean(username) && !usernameRegex.test(username);
};

export const validateFieldMinLength = (key: string, value: string) => {
  return value.trim() !== '' && value.trim().length < minLengthMap[key];
};

export const validateRequiredField = (field: string) => {
  return field.trim() === '';
};
