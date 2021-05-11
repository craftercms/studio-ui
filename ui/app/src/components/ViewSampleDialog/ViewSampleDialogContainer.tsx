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

import { ViewSampleDialogProps } from './ViewSampleDialog';
import AceEditor from '../AceEditor';
import React from 'react';
import DialogBody from '../Dialogs/DialogBody';
import DialogHeader from '../Dialogs/DialogHeader';
import { FormattedMessage } from 'react-intl';
import DialogFooter from '../Dialogs/DialogFooter';
import PrimaryButton from '../PrimaryButton';

export default function ViewSampleDialogContainer(props: ViewSampleDialogProps) {
  const { content, onClose, onUseSampleClick } = props;
  return (
    <>
      <DialogHeader
        title={<FormattedMessage id="viewSampleDialog.title" defaultMessage="Sample File" />}
        onDismiss={onClose}
      />
      <DialogBody style={{ height: '60vh' }}>
        <AceEditor value={content} mode="ace/mode/yaml" theme="ace/theme/textmate" autoFocus={true} readOnly={true} />
      </DialogBody>
      <DialogFooter>
        <PrimaryButton onClick={onUseSampleClick}>
          <FormattedMessage id="viewSampleDialog.useSample" defaultMessage="Use Sample Content" />
        </PrimaryButton>
      </DialogFooter>
    </>
  );
}
