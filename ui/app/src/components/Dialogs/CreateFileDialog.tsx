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

import React, { PropsWithChildren, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogHeader from './DialogHeader';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import DialogBody from './DialogBody';
import DialogFooter from './DialogFooter';
import TextField from '@material-ui/core/TextField';
import { createFile } from '../../services/content';
import { useActiveSiteId, useUnmount } from '../../utils/hooks';
import { useDispatch } from 'react-redux';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import CircularProgress from '@material-ui/core/CircularProgress';
import StandardAction from '../../models/StandardAction';
import { emitSystemEvent, itemCreated } from '../../state/actions/system';
import { SecondaryButton } from '../SecondaryButton';
import { PrimaryButton } from '../PrimaryButton';

interface CreateFileBaseProps {
  open: boolean;
  type: 'controller' | 'template';
  path: string;
  allowBraces?: boolean;
}

export type CreateFileProps = PropsWithChildren<
  CreateFileBaseProps & {
    onClose(): void;
    onClosed?(): void;
    onCreated?(response: { path: string; fileName: string; type: string }): void;
  }
>;

export interface CreateFileStateProps extends CreateFileBaseProps {
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onCreated?: StandardAction;
}

export const translations = defineMessages({
  placeholder: {
    id: 'createFile.placeholder',
    defaultMessage: 'Please type a name'
  }
});

export default function CreateFileDialog(props: CreateFileProps) {
  const { open, onClose } = props;
  const [state, setState] = useState({
    submitted: null,
    inProgress: null
  });
  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="xs"
      onClose={onClose}
      onEscapeKeyDown={onClose}
      onExited={() => setState({ inProgress: null, submitted: null })}
    >
      <CreateFileUI {...props} submitted={state.submitted} inProgress={state.inProgress} setState={setState} />
    </Dialog>
  );
}

interface CreateFileUIProps extends CreateFileProps {
  submitted: boolean;
  inProgress: boolean;
  setState(values: object): void;
}

function CreateFileUI(props: CreateFileUIProps) {
  const { onClosed, onClose, submitted, inProgress, setState, onCreated, type, path, allowBraces } = props;
  const [name, setName] = useState('');
  const dispatch = useDispatch();
  const site = useActiveSiteId();
  const { formatMessage } = useIntl();

  useUnmount(onClosed);

  const onOk = () => {
    setState({ inProgress: true, submitted: true });

    if (name) {
      const fileName = type === 'controller' ? `${encodeURIComponent(name)}.groovy` : `${encodeURIComponent(name)}.ftl`;
      createFile(site, path, fileName).subscribe(
        () => {
          onCreated?.({ path, fileName, type });
          dispatch(emitSystemEvent(itemCreated({ target: `${path}/${fileName}` })));
        },
        (response) => {
          setState({ inProgress: false, submitted: true });
          dispatch(showErrorDialog({ error: response }));
        }
      );
    }
  };
  return (
    <>
      <DialogHeader
        title={
          type === 'controller' ? (
            <FormattedMessage id="newFile.controller" defaultMessage="Create a New Controller" />
          ) : (
            <FormattedMessage id="newFile.template" defaultMessage="Create a New Template" />
          )
        }
        onDismiss={inProgress === null ? onClose : null}
      />
      <DialogBody>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onOk();
          }}
        >
          <TextField
            label={
              type === 'controller' ? (
                <FormattedMessage id="newFile.controllerName" defaultMessage="Controller Name" />
              ) : (
                <FormattedMessage id="newFile.templateName" defaultMessage="Template Name" />
              )
            }
            value={name}
            fullWidth
            autoFocus
            required
            error={!name && submitted}
            placeholder={formatMessage(translations.placeholder)}
            helperText={
              !name && submitted ? (
                type === 'controller' ? (
                  <FormattedMessage id="newFile.controllerRequired" defaultMessage="Controller name is required." />
                ) : (
                  <FormattedMessage id="newFile.templateRequired" defaultMessage="Template name is required." />
                )
              ) : (
                <FormattedMessage
                  id="newFile.helperText"
                  defaultMessage="Consisting of: letters, numbers, dot (.), dash (-) and underscore (_)."
                />
              )
            }
            disabled={inProgress}
            margin="normal"
            InputLabelProps={{
              shrink: true
            }}
            onChange={(event) =>
              setName(event.target.value.replace(allowBraces ? /[^a-zA-Z0-9-_{}]/g : /[^a-zA-Z0-9-_]/g, ''))
            }
          />
        </form>
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={onClose} disabled={inProgress}>
          <FormattedMessage id="words.close" defaultMessage="Close" />
        </SecondaryButton>
        <PrimaryButton onClick={onOk} disabled={inProgress || name === ''}>
          {inProgress ? <CircularProgress size={15} /> : <FormattedMessage id="words.create" defaultMessage="Create" />}
        </PrimaryButton>
      </DialogFooter>
    </>
  );
}
