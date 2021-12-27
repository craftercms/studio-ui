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

import StandardAction from '../../models/StandardAction';
import { defineMessages } from 'react-intl';
import { DetailedItem } from '../../models';
import { EnhancedDialogState } from '../../hooks';

export interface CopyDialogBaseProps {
  site: string;
  item: DetailedItem;
}

export interface CopyDialogCallbacks {
  onOk?(response: { paths: string[] }): void;
}

export interface CopyDialogStateProps extends CopyDialogBaseProps, EnhancedDialogState {
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onOk?: StandardAction;
}

export const messages = defineMessages({
  copy: {
    id: 'copyItems.copy',
    defaultMessage: 'Copy'
  },
  cancel: {
    id: 'copyItems.cancel',
    defaultMessage: 'Cancel'
  },
  selectAll: {
    id: 'copyItems.selectAll',
    defaultMessage: 'Select All'
  },
  deselectAll: {
    id: 'copyItems.deselectAll',
    defaultMessage: 'Deselect All'
  },
  fetching: {
    id: 'words.fetching',
    defaultMessage: 'Fetching'
  },
  copyDialogTitle: {
    id: 'itemActions.copyDialogTitle',
    defaultMessage: 'Copy'
  },
  copyDialogSubtitle: {
    id: 'itemActions.copyDialogSubtitle',
    defaultMessage:
      'Please select any of the sub-pages you would like to batch copy. When pasting, any selected sub-pages and their positional heirarchy will be retained.'
  }
});
