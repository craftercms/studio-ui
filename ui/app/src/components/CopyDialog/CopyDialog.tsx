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

import React from 'react';
import { CopyDialogBody } from './CopyDialogBody';
import EnhancedDialog, { EnhancedDialogProps } from '../EnhancedDialog/EnhancedDialog';
import { CopyDialogBaseProps, CopyDialogCallbacks, messages } from './utils';
import { useIntl } from 'react-intl';

export interface CopyDialogProps extends EnhancedDialogProps, CopyDialogBaseProps, CopyDialogCallbacks {}

export function CopyDialog(props: CopyDialogProps) {
  const { item, site, onOk, ...rest } = props;
  const { formatMessage } = useIntl();
  return (
    <EnhancedDialog
      {...rest}
      dialogHeaderProps={{
        title: formatMessage(messages.copyDialogTitle),
        subtitle: formatMessage(messages.copyDialogSubtitle)
      }}
    >
      <CopyDialogBody item={item} site={site} onOk={onOk} onClose={props.onClose} disabled={props.isSubmitting} />
    </EnhancedDialog>
  );
}

export default CopyDialog;
