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
import { useDispatch } from 'react-redux';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import StandardAction from '../../models/StandardAction';
import { emitSystemEvent, itemCreated } from '../../state/actions/system';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import { validateActionPolicy } from '../../services/sites';
import ConfirmDialog from './ConfirmDialog';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { useUnmount } from '../../utils/hooks/useUnmount';

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
    onCreated?(response: { path: string; fileName: string; mode: string; openOnSuccess: boolean }): void;
  }
>;

export interface CreateFileUIProps extends CreateFileProps {
  submitted: boolean;
  inProgress: boolean;
  setState(values: object): void;
}

export interface CreateFileStateProps extends CreateFileBaseProps {
  onClose?: StandardAction;
  onClosed?: StandardAction;
  onCreated?: StandardAction;
}

export const translations = defineMessages({
  placeholder: {
    id: 'createFileDialog.placeholder',
    defaultMessage: 'Please type a name'
  },
  createPolicy: {
    id: 'createFileDialog.createPolicy',
    defaultMessage:
      'The supplied name goes against site policies. Suggested modified name is: "{name}". Would you like to use the suggested name?'
  },
  policyError: {
    id: 'createFileDialog.policyError',
    defaultMessage: 'The supplied name goes against site policies.'
  },
  openOnSuccess: {
    id: 'createFileDialog.openOnSuccess',
    defaultMessage: 'Open file'
  },
  openOnSuccessTitle: {
    id: 'createFileDialog.openOnSuccessTip',
    defaultMessage: 'Open for edit after creation'
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
      <CreateFileDialogUI {...props} submitted={state.submitted} inProgress={state.inProgress} setState={setState} />
    </Dialog>
  );
}

const getExtension = (type: string) => (type === 'controller' ? `groovy` : `ftl`);

const getName = (type: string, name: string) =>
  `${name}.${getExtension(type)}`.replace(/(\.groovy)(\.groovy)|(\.ftl)(\.ftl)/g, '$1$3').replace(/\.{2,}/g, '.');

function CreateFileDialogUI(props: CreateFileUIProps) {
  const { onClosed, onClose, submitted, inProgress, setState, onCreated, type, path, allowBraces } = props;
  const [name, setName] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [openOnSuccess, setOpenOnSuccess] = useState(true);
  const dispatch = useDispatch();
  const site = useActiveSiteId();
  const { formatMessage } = useIntl();

  useUnmount(onClosed);

  const onCreateFile = (site: string, path: string, fileName: string) => {
    createFile(site, path, fileName).subscribe(
      () => {
        onCreated?.({ path, fileName, mode: getExtension(type), openOnSuccess });
        dispatch(emitSystemEvent(itemCreated({ target: `${path}/${fileName}` })));
      },
      (response) => {
        setState({ inProgress: false, submitted: true });
        dispatch(showErrorDialog({ error: response }));
      }
    );
  };

  const onCreate = () => {
    setState({ inProgress: true, submitted: true });
    if (name) {
      validateActionPolicy(site, {
        type: 'CREATE',
        target: `${path}/${name}`
      }).subscribe(({ allowed, modifiedValue }) => {
        if (allowed) {
          if (modifiedValue) {
            setConfirm({
              body: formatMessage(translations.createPolicy, { name: modifiedValue.replace(`${path}/`, '') })
            });
          } else {
            const fileName = getName(type, name);
            onCreateFile(site, path, fileName);
          }
        } else {
          setConfirm({
            error: true,
            body: formatMessage(translations.policyError)
          });
        }
      });
    }
  };

  const onConfirm = () => {
    const fileName = getName(type, name);
    onCreateFile(site, path, fileName);
  };

  const onConfirmCancel = () => {
    setConfirm(null);
    setState({ inProgress: false, submitted: true });
  };

  return (
    <>
      <DialogHeader
        title={
          type === 'controller' ? (
            <FormattedMessage id="createFileDialog.controller" defaultMessage="New Controller" />
          ) : (
            <FormattedMessage id="createFileDialog.template" defaultMessage="New Template" />
          )
        }
        onDismiss={inProgress === null ? onClose : null}
      />
      <DialogBody>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onCreate();
          }}
        >
          <TextField
            label={<FormattedMessage id="createFileDialog.fileName" defaultMessage="File Name" />}
            value={name}
            fullWidth
            autoFocus
            required
            error={!name && submitted}
            placeholder={formatMessage(translations.placeholder)}
            helperText={
              !name && submitted ? (
                <FormattedMessage id="createFileDialog.fileNameRequired" defaultMessage="File name is required." />
              ) : (
                <FormattedMessage
                  id="createFileDialog.helperText"
                  defaultMessage="Consisting of letters, numbers, dot (.), dash (-) and underscore (_)."
                />
              )
            }
            disabled={inProgress}
            margin="normal"
            InputLabelProps={{
              shrink: true
            }}
            onChange={(event) =>
              setName(
                event.target.value
                  .replace(allowBraces ? /[^a-zA-Z0-9-_{}.]/g : /[^a-zA-Z0-9-_.]/g, '')
                  .replace(/\.{1,}/g, '.')
              )
            }
          />
        </form>
      </DialogBody>
      <DialogFooter>
        <FormControlLabel
          style={{ marginRight: 'auto' }}
          label={formatMessage(translations.openOnSuccess)}
          title={formatMessage(translations.openOnSuccessTitle)}
          control={
            <Checkbox checked={openOnSuccess} onChange={(e) => setOpenOnSuccess(e.target.checked)} color="primary" />
          }
        />
        <SecondaryButton onClick={onClose} disabled={inProgress}>
          <FormattedMessage id="words.close" defaultMessage="Close" />
        </SecondaryButton>
        <PrimaryButton onClick={onCreate} disabled={inProgress || name === ''} loading={inProgress}>
          <FormattedMessage id="words.create" defaultMessage="Create" />
        </PrimaryButton>
      </DialogFooter>
      <ConfirmDialog
        open={Boolean(confirm)}
        body={confirm?.body}
        onOk={confirm?.error ? onConfirmCancel : onConfirm}
        onCancel={confirm?.error ? null : onConfirmCancel}
      />
    </>
  );
}
