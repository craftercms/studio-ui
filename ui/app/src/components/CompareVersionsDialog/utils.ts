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
import ContentInstance from '../../models/ContentInstance';
import { ElementType, ReactNode } from 'react';
import { LookupTable } from '../../models';
import RepeatGroupItems, { ItemDiffState } from './FieldsTypesDiffViews/RepeatGroupItems';
import { fromString, serialize } from '../../utils/xml';
import TextDiffView from './FieldsTypesDiffViews/TextDiffView';
import ContentInstanceComponents from './FieldsTypesDiffViews/ContentInstanceComponents';
import CheckboxGroupDiffView from './FieldsTypesDiffViews/CheckboxGroupDiffView';
import ImageDiffView from './FieldsTypesDiffViews/ImageDiffView';
import VideoDiffView from './FieldsTypesDiffViews/VideoDiffView';
import TimeDiffView from './FieldsTypesDiffViews/TimeDiffView';
import DateTimeDiffView from './FieldsTypesDiffViews/DateTimeDiffView';
import BooleanDiffView from './FieldsTypesDiffViews/BooleanDiffView';
import { NumberDiffView } from './FieldsTypesDiffViews/NumberDiffView';
import FileNameDiffView from './FieldsTypesDiffViews/FileNameDiffView';

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

export interface DiffViewComponentBaseProps {
  aXml: string;
  bXml: string;
  field: ContentTypeField;
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

export const getContentInstanceXmlItemFromIndex = (xml: string, index: number): string => {
  const doc = fromString(xml).querySelectorAll('item')[index];
  return doc ? serialize(doc) : '';
};

export const typesDiffMap: Record<string, ElementType> = {
  'file-name': FileNameDiffView,
  text: TextDiffView,
  textarea: TextDiffView,
  html: TextDiffView,
  'node-selector': ContentInstanceComponents,
  'checkbox-group': CheckboxGroupDiffView,
  repeat: RepeatGroupItems,
  image: ImageDiffView,
  'video-picker': VideoDiffView,
  time: TimeDiffView,
  'date-time': DateTimeDiffView,
  boolean: BooleanDiffView,
  'numeric-input': NumberDiffView,
  dropdown: TextDiffView
};
