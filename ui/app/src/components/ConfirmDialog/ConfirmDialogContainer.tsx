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

import { ConfirmDialogContainerProps } from './utils';
import questionGraphicUrl from '../../assets/question.svg';
import { useIntl } from 'react-intl';
import { useUnmount } from '../../utils/hooks/useUnmount';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import DialogContentText from '@mui/material/DialogContentText';
import DialogFooter from '../Dialogs/DialogFooter';
import PrimaryButton from '../PrimaryButton';
import translations from './translations';
import SecondaryButton from '../SecondaryButton';
import React from 'react';

export function ConfirmDialogContainer(props: ConfirmDialogContainerProps) {
  const {
    onOk,
    onCancel,
    onClosed,
    body,
    title,
    children,
    classes,
    imageUrl = questionGraphicUrl,
    disableOkButton = false,
    disableCancelButton = false
  } = props;
  const { formatMessage } = useIntl();
  useUnmount(onClosed);
  return (
    <>
      <DialogContent id="confirmDialogBody" className={classes.dialogBody}>
        <img src={imageUrl} alt="" className={classes.dialogImage} />
        {title && (
          <Typography variant="body1" component="h2" className={classes.dialogTitle}>
            {title}
          </Typography>
        )}
        {body && (
          <DialogContentText color="textPrimary" variant="body2">
            {body}
          </DialogContentText>
        )}
        {children}
      </DialogContent>
      <DialogFooter className={classes.dialogFooter}>
        {onOk && (
          <PrimaryButton onClick={onOk} autoFocus fullWidth size="large" disabled={disableOkButton}>
            {formatMessage(translations.accept)}
          </PrimaryButton>
        )}
        {onCancel && (
          <SecondaryButton onClick={onCancel} fullWidth size="large" disabled={disableCancelButton}>
            {formatMessage(translations.cancel)}
          </SecondaryButton>
        )}
      </DialogFooter>
    </>
  );
}

export default ConfirmDialogContainer;
