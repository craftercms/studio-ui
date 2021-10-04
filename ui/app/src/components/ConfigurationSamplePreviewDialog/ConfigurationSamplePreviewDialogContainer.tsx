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

import { ConfigurationSamplePreviewDialogProps } from './ConfigurationSamplePreviewDialog';
import AceEditor from '../AceEditor';
import React from 'react';
import DialogBody from '../Dialogs/DialogBody';
import DialogHeader from '../DialogHeader/DialogHeader';
import { FormattedMessage } from 'react-intl';
import DialogFooter from '../Dialogs/DialogFooter';
import ConfirmDropdown from '../Controls/ConfirmDropdown';
import useStyles from './styles';
import { useUnmount } from '../../utils/hooks/useUnmount';

export default function ConfigurationSamplePreviewDialogContainer(props: ConfigurationSamplePreviewDialogProps) {
  const { content, onClose, onClosed, onUseSampleClick } = props;
  const classes = useStyles();

  useUnmount(onClosed);

  return (
    <>
      <DialogHeader
        title={<FormattedMessage id="configurationSamplePreviewDialog.title" defaultMessage="Sample File" />}
        onCloseButtonClick={onClose}
      />
      <DialogBody style={{ height: '60vh', padding: 0 }}>
        <AceEditor
          classes={{ editorRoot: classes.editor }}
          value={content}
          mode="ace/mode/yaml"
          theme="ace/theme/textmate"
          autoFocus={true}
          readOnly={true}
        />
      </DialogBody>
      <DialogFooter>
        <ConfirmDropdown
          text={
            <FormattedMessage
              id="configurationSamplePreviewDialog.useSampleContent"
              defaultMessage="Use Sample Content"
            />
          }
          cancelText={
            <FormattedMessage
              id="configurationSamplePreviewDialog.replaceContent"
              defaultMessage="Replace current content"
            />
          }
          confirmText={
            <FormattedMessage
              id="configurationSamplePreviewDialog.appendContent"
              defaultMessage="Append after current content"
            />
          }
          onConfirm={() => onUseSampleClick('append')}
          onCancel={() => onUseSampleClick('replace')}
        />
      </DialogFooter>
    </>
  );
}
