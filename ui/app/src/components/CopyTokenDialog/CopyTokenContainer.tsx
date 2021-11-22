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

import React, { useCallback, useEffect, useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import DialogBody from '../DialogBody/DialogBody';
import FormHelperText from '@mui/material/FormHelperText';
import InputBase from '@mui/material/InputBase';
import DialogFooter from '../DialogFooter/DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import { CopyTokenContainerProps } from './utils';
import makeStyles from '@mui/styles/makeStyles';
import createStyles from '@mui/styles/createStyles';

const useStyles = makeStyles(() =>
  createStyles({
    footer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    input: {
      marginTop: '16px',
      marginBottom: '8px'
    }
  })
);

export function CopyTokenContainer(props: CopyTokenContainerProps) {
  const { onClose, token, onCopy } = props;
  const classes = useStyles();
  const inputRef = useRef<HTMLInputElement>();

  const copyToken = useCallback(() => {
    const el = inputRef.current;
    el.select();
    document.execCommand('copy');
  }, []);

  const onCopyToken = useCallback(() => {
    copyToken();
    onCopy();
  }, [copyToken, onCopy]);

  useEffect(() => {
    if (inputRef.current && token) {
      copyToken();
    }
  }, [copyToken, onCopyToken, token]);

  return (
    <>
      <DialogBody>
        <FormHelperText>
          <FormattedMessage
            id="copyTokenDialog.helperText"
            defaultMessage="Token created successfully. Please copy the token and store it securely as you won’t be able to see it’s value again."
          />
        </FormHelperText>
        <InputBase inputRef={inputRef} autoFocus value={token?.token ?? ''} readOnly className={classes.input} />
      </DialogBody>
      <DialogFooter className={classes.footer}>
        <SecondaryButton onClick={onCopyToken}>
          <FormattedMessage id="words.copy" defaultMessage="Copy" />
        </SecondaryButton>
        <PrimaryButton onClick={(e) => onClose(e, null)}>
          <FormattedMessage id="words.done" defaultMessage="Done" />
        </PrimaryButton>
      </DialogFooter>
    </>
  );
}

export default CopyTokenContainer;
