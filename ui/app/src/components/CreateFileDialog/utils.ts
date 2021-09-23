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
import { EnhancedDialogProps } from '../EnhancedDialog';
import { EnhancedDialogState } from '../../utils/hooks/useEnhancedDialogState';

export interface CreateFileBaseProps {
  type: 'controller' | 'template';
  path: string;
  allowBraces?: boolean;
}

export interface CreateFileProps extends CreateFileBaseProps, EnhancedDialogProps {
  onCreated?(response: { path: string; fileName: string; mode: string; openOnSuccess: boolean }): void;
}

export interface CreateFileStateProps extends CreateFileBaseProps, EnhancedDialogState {
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onCreated?: StandardAction;
}

export interface CreateFileContainerProps
  extends CreateFileBaseProps,
    Pick<CreateFileProps, 'isSubmitting' | 'onCreated' | 'onClose'> {}

export const getExtension = (type: string) => (type === 'controller' ? `groovy` : `ftl`);

export const getName = (type: string, name: string) =>
  `${name}.${getExtension(type)}`.replace(/(\.groovy)(\.groovy)|(\.ftl)(\.ftl)/g, '$1$3').replace(/\.{2,}/g, '.');
