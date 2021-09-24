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

import { DetailedItem } from '../../models/Item';
import StandardAction from '../../models/StandardAction';
import { EnhancedDialogState } from '../../utils/hooks/useEnhancedDialogState';
import { EnhancedDialogProps } from '../EnhancedDialog';

export interface ChangeContentTypeDialogBaseProps {
  item: DetailedItem;
  rootPath: string;
  compact: boolean;
  selectedContentType: string;
}

export interface ChangeContentTypeDialogProps extends ChangeContentTypeDialogBaseProps, EnhancedDialogProps {
  onContentTypeSelected?(response?: any): any;
}

export interface ChangeContentTypeDialogStateProps extends ChangeContentTypeDialogBaseProps, EnhancedDialogState {
  onContentTypeSelected?: StandardAction;
  onClose?: StandardAction;
  onClosed?: StandardAction;
}

export interface ChangeContentTypeDialogContainerProps
  extends ChangeContentTypeDialogBaseProps,
    Pick<ChangeContentTypeDialogProps, 'onContentTypeSelected'> {}
