/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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
import { FormattedMessage } from 'react-intl';
import { CopyTokenProps } from './utils';
import { CopyTokenContainer } from './CopyTokenContainer';
import EnhancedDialog from '../EnhancedDialog';

export function CopyTokenDialog(props: CopyTokenProps) {
  const { token, onCopy, ...rest } = props;
  return (
    <EnhancedDialog
      title={<FormattedMessage id="copyTokenDialog.title" defaultMessage="Access Token Created" />}
      maxWidth="xs"
      {...rest}
    >
      <CopyTokenContainer token={token} onCopy={onCopy} />
    </EnhancedDialog>
  );
}

export default CopyTokenDialog;
