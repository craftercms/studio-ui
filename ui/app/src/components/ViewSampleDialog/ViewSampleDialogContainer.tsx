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
import ConfirmDropdown from '../Controls/ConfirmDropdown';
import useStyles from './styles';

export default function ViewSampleDialogContainer(props: ViewSampleDialogProps) {
  const { content, onClose, onUseSampleClick } = props;
  const classes = useStyles();
  return (
    <>
      <DialogHeader
        title={<FormattedMessage id="viewSampleDialog.title" defaultMessage="Sample File" />}
        onDismiss={onClose}
      />
      <DialogBody style={{ height: '60vh', padding: 0 }}>
        <AceEditor
          className={classes.editor}
          value={content}
          mode="ace/mode/yaml"
          theme="ace/theme/textmate"
          autoFocus={true}
          readOnly={true}
        />
      </DialogBody>
      <DialogFooter>
        <ConfirmDropdown
          text={<FormattedMessage id="viewSampleDialog.useSampleContent" defaultMessage="Use Sample Content" />}
          cancelText={
            <FormattedMessage id="viewSampleDialog.replaceContent" defaultMessage="Replace current content" />
          }
          confirmText={
            <FormattedMessage id="viewSampleDialog.appendContent" defaultMessage="Append after current content" />
          }
          onConfirm={() => onUseSampleClick('append')}
          onCancel={() => onUseSampleClick('replace')}
        />
      </DialogFooter>
    </>
  );
}
