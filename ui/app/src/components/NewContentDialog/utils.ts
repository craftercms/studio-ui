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

import { LegacyContentType } from '../../models/ContentType';
import { DetailedItem } from '../../models/Item';
import StandardAction from '../../models/StandardAction';
import { EnhancedDialogProps } from '../EnhancedDialog';
import { EnhancedDialogState } from '../../hooks/useEnhancedDialogState';

export interface ContentTypesGridProps {
  contentTypes: LegacyContentType[];
  isCompact: boolean;
  selectedContentType?: string;
  onTypeOpen(data: LegacyContentType): void;
}

export interface NewContentDialogBaseProps {
  item: DetailedItem;
  rootPath: string;
  compact: boolean;
}

export interface NewContentDialogProps extends NewContentDialogBaseProps, EnhancedDialogProps {
  onContentTypeSelected?(response: {
    authoringBase: string;
    path: string;
    isNewContent: boolean;
    contentTypeId: string;
    onSaveSuccess: StandardAction;
  }): void;
}

export interface NewContentDialogStateProps extends NewContentDialogBaseProps, EnhancedDialogState {
  onContentTypeSelected?: StandardAction;
  onClose?: StandardAction;
  onClosed?: StandardAction;
}

export interface NewContentDialogContainerProps
  extends NewContentDialogBaseProps,
    Pick<NewContentDialogProps, 'onContentTypeSelected'> {}
