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

import React, { PropsWithChildren } from 'react';
import Dialog from '@material-ui/core/Dialog';
import { BrowseFilesDialogContainer } from './BrowseFilesDialogContainer';
import StandardAction from '../../models/StandardAction';
import { MediaItem } from '../../models/Search';

export interface BrowseFilesDialogBaseProps {
  open: boolean;
  path: string;
  multiSelect?: boolean;
  contentTypes?: string[];
  mimeTypes?: string[];
  rowsPerPageOptions?: number[];
  numOfLoaderItems?: number;
}

export type BrowseFilesDialogProps = PropsWithChildren<
  BrowseFilesDialogBaseProps & {
    onClose(): void;
    onSuccess?(items: MediaItem | MediaItem[]): void;
    onClosed?(): void;
  }
>;

export interface BrowseFilesDialogPropsStateProps extends BrowseFilesDialogBaseProps {
  onClose?: StandardAction;
  onSuccess?: StandardAction;
  onClosed?: StandardAction;
}

export default function BrowseFilesDialog(props: BrowseFilesDialogProps) {
  const {
    path,
    onClosed,
    onSuccess,
    contentTypes,
    multiSelect,
    mimeTypes,
    rowsPerPageOptions,
    numOfLoaderItems,
    ...rest
  } = props;

  return (
    <Dialog fullWidth maxWidth="md" {...rest}>
      <BrowseFilesDialogContainer
        path={path}
        contentTypes={contentTypes}
        mimeTypes={mimeTypes}
        multiSelect={multiSelect}
        rowsPerPageOptions={rowsPerPageOptions}
        onClose={props.onClose}
        onClosed={onClosed}
        onSuccess={onSuccess}
        numOfLoaderItems={numOfLoaderItems}
      />
    </Dialog>
  );
}
