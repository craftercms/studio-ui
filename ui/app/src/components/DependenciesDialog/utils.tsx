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

import { FormattedMessage } from 'react-intl';
import { DetailedItem, SandboxItem } from '../../models/Item';
import { isAsset, isCode } from '../../utils/content';
import React from 'react';
import { Resource } from '../../models/Resource';
import StandardAction from '../../models/StandardAction';
import { EnhancedDialogProps } from '../EnhancedDialog';
import { EnhancedDialogState } from '../../hooks/useEnhancedDialogState';

export interface DependenciesDialogBaseProps {
  item?: DetailedItem;
  rootPath: string;
  dependenciesShown?: string;
}

export interface DependenciesDialogProps extends DependenciesDialogBaseProps, EnhancedDialogProps {}

export interface DependenciesDialogStateProps extends DependenciesDialogBaseProps, EnhancedDialogState {
  onClose?: StandardAction;
  onClosed?: StandardAction;
}

export interface DependenciesDialogContainerProps extends DependenciesDialogBaseProps {}

export interface DependenciesListProps {
  resource: Resource<DetailedItem[]>;
  compactView: boolean;
  showTypes: string;

  handleContextMenuClick(event: React.MouseEvent<HTMLButtonElement>, dependency: DetailedItem): void;
}

export interface DependenciesDialogUIProps {
  resource: Resource<DetailedItem[]>;
  item: DetailedItem;
  rootPath: string;
  setItem: Function;
  compactView: boolean;
  setCompactView: Function;
  showTypes: string;
  setShowTypes: Function;
  dependenciesShown: string;
  setDependenciesShown: Function;
  isEditableItem: Function;
  handleEditorDisplay(item: DetailedItem): void;
  handleHistoryDisplay(item: DetailedItem): void;
  contextMenu: any;

  handleContextMenuClick(event: React.MouseEvent<HTMLButtonElement>, dependency: DetailedItem): void;

  handleContextMenuClose(): void;
}

export const dialogInitialState = {
  dependantItems: null,
  dependencies: null,
  compactView: false,
  showTypes: 'all-deps'
};

export const assetsTypes = {
  'all-deps': {
    label: <FormattedMessage id="dependenciesDialog.allDeps" defaultMessage="Show all dependencies" />,
    filter: () => true
  },
  'content-items': {
    label: <FormattedMessage id="dependenciesDialog.contentItems" defaultMessage="Content items only" />,
    filter: (dependency: SandboxItem) => dependency.systemType === 'component' || dependency.systemType === 'page'
  },
  assets: {
    label: <FormattedMessage id="dependenciesDialog.assets" defaultMessage="Assets only" />,
    filter: (dependency: SandboxItem) => isAsset(dependency.path)
  },
  code: {
    label: <FormattedMessage id="dependenciesDialog.code" defaultMessage="Code only" />,
    filter: (dependency: SandboxItem) => isCode(dependency.path)
  }
};
