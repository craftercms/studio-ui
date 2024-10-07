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

import { DialogHeaderStateAction } from '../DialogHeader';
import StandardAction from '../../models/StandardAction';
import ApiResponse from '../../models/ApiResponse';
import { ItemHistoryEntry, VersionsStateProps } from '../../models/Version';
import { EntityState } from '../../models/EntityState';
import ContentType, { ContentTypeField } from '../../models/ContentType';
import { EnhancedDialogProps } from '../EnhancedDialog';
import { EnhancedDialogState } from '../../hooks/useEnhancedDialogState';
import { DialogHeaderActionProps } from '../DialogHeaderAction';
import { areObjectsEqual } from '../../utils/object';
import ContentInstance, { Primitive } from '../../models/ContentInstance';
import { ReactNode } from 'react';
import { LookupTable } from '../../models';
import { ItemDiffState } from './FieldsTypesDiffViews/RepeatGroupItems';

export interface CompareVersionsDialogBaseProps {
  error: ApiResponse;
  isFetching: boolean;
  disableItemSwitching?: boolean;
}

export interface SelectionContentVersion {
  xml: string;
  content: ContentInstance;
}

export interface CompareVersionsDialogProps extends CompareVersionsDialogBaseProps, EnhancedDialogProps {
  subtitle?: ReactNode;
  versionsBranch?: VersionsStateProps;
  selectedA?: ItemHistoryEntry;
  selectedB?: ItemHistoryEntry;
  selectionContent?: {
    a: SelectionContentVersion;
    b: SelectionContentVersion;
  };
  fields?: LookupTable<ContentTypeField>;
  contentTypesBranch?: EntityState<ContentType>;
  leftActions?: DialogHeaderActionProps[];
  rightActions?: DialogHeaderActionProps[];
}

export interface CompareVersionsDialogStateProps extends CompareVersionsDialogBaseProps, EnhancedDialogState {
  leftActions?: DialogHeaderStateAction[];
  rightActions?: DialogHeaderStateAction[];
  onClose?: StandardAction;
  onClosed?: StandardAction;
}

export interface CompareVersionsDialogContainerProps
  extends CompareVersionsDialogBaseProps,
    Pick<
      CompareVersionsDialogProps,
      | 'contentTypesBranch'
      | 'versionsBranch'
      | 'selectedA'
      | 'selectedB'
      | 'disableItemSwitching'
      | 'selectionContent'
      | 'fields'
    > {
  compareXml: boolean;
}

export type ContentInstanceComponentsDiffResult = {
  count: number;
  added: boolean;
  removed: boolean;
  value: string[];
};

/**
 * Determines the ItemDiffState, based on the result object given by jsdiff.diffArrays.
 *
 * @param {ContentInstanceComponentsDiffResult} diff - The diff result of the content.
 * @returns {ItemDiffState} - The status of the item difference: 'new', 'deleted', or 'unchanged'.
 */
export const getItemDiffStatus = (diff: ContentInstanceComponentsDiffResult): ItemDiffState => {
  if (diff.added) {
    return 'new';
  }
  if (diff.removed) {
    return 'deleted';
  }
  return 'unchanged';
};

/**
 * Removes all HTML tags from the given content string.
 *
 * @param {string} content - The content string from which to remove HTML tags.
 * @returns {string} - The content string without HTML tags.
 */
export function removeTags(content: string): string {
  return content.replace(/<[^>]*>?/gm, '');
}

/**
 * Checks if a field has changed between two content instances. Values may be of different types (Primitive) so the
 * comparison depends on the field type.
 *
 * @param {ContentTypeField} field - The field to check.
 * @param {Primitive} contentA - The content value A.
 * @param {Primitive} contentB - The content value B.
 * @returns {boolean} - True if the field has changed, false otherwise.
 */
export const hasFieldChanged = (field: ContentTypeField, contentA: Primitive, contentB: Primitive): boolean => {
  const fieldType = field.type;
  switch (fieldType) {
    case 'text':
    case 'html':
    case 'image':
    case 'textarea':
      return contentA !== contentB;
    case 'node-selector':
    case 'checkbox-group':
    case 'repeat':
      return !areObjectsEqual(contentA ?? {}, contentB ?? {});
    default:
      return contentA !== contentB;
  }
};
