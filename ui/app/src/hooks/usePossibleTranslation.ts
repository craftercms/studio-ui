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

import TranslationOrText from '../models/TranslationOrText';
import { MessageDescriptor, useIntl } from 'react-intl';
import { FormatXMLElementFn, PrimitiveType } from 'intl-messageformat';
import { ReactNode } from 'react';
import { getPossibleTranslation } from '../utils/i18n';

export function usePossibleTranslation(title: string): string;
export function usePossibleTranslation(title: string, values: Record<string, PrimitiveType>): string;
export function usePossibleTranslation(
  title: string,
  // TODO: Fix FormatXMLElementFn generics
  values?: Record<string, PrimitiveType | FormatXMLElementFn<any, any>>
): string;
export function usePossibleTranslation(descriptor: MessageDescriptor): string;
export function usePossibleTranslation(descriptor: MessageDescriptor, values: Record<string, PrimitiveType>): string;
export function usePossibleTranslation(
  descriptor: MessageDescriptor,
  // TODO: Fix FormatXMLElementFn generics
  values?: Record<string, PrimitiveType | FormatXMLElementFn<any, any>>
): string | ReactNode[];
export function usePossibleTranslation(titleOrDescriptor: TranslationOrText): string;
export function usePossibleTranslation(
  titleOrDescriptor: TranslationOrText,
  values: Record<string, PrimitiveType>
): string;
export function usePossibleTranslation(
  titleOrDescriptor: TranslationOrText,
  // TODO: Fix FormatXMLElementFn generics
  values?: Record<string, PrimitiveType | FormatXMLElementFn<any, any>>
): string | ReactNode[];
export function usePossibleTranslation(
  titleOrDescriptor: TranslationOrText,
  // TODO: Fix FormatXMLElementFn generics
  values?: Record<string, PrimitiveType | FormatXMLElementFn<any, any>>
): string | ReactNode[] {
  const { formatMessage } = useIntl();
  return getPossibleTranslation(titleOrDescriptor, formatMessage, values);
}

export default usePossibleTranslation;
