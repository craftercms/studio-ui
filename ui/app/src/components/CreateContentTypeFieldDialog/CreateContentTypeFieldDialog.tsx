/*
 * Copyright (C) 2007-2023 Crafter Software Corporation. All Rights Reserved.
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

import { EnhancedDialog, EnhancedDialogProps } from '../EnhancedDialog';
import { FormattedMessage } from 'react-intl';
import CreateContentTypeFieldDialogContainer from './CreateContentTypeFieldDialogContainer';

export interface CreateContentTypeFieldDialogProps extends EnhancedDialogProps {}

export function CreateContentTypeFieldDialog(props: CreateContentTypeFieldDialogProps) {
  const { ...rest } = props;

  return (
    <EnhancedDialog
      maxWidth="sm"
      title={<FormattedMessage id="createContentTypeDialog.headerTitle" defaultMessage="Create Field" />}
      {...rest}
    >
      <CreateContentTypeFieldDialogContainer />
    </EnhancedDialog>
  );
}

export default CreateContentTypeFieldDialog;
