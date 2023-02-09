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

import * as React from 'react';
import { AlertDialogContainerProps } from './utils';
import questionGraphicUrl from '../../assets/question.svg';
import useUnmount from '../../hooks/useUnmount';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import DialogContentText from '@mui/material/DialogContentText';
import { getStyles } from './styles';
import Box from '@mui/material/Box';
import { DialogFooter } from '../DialogFooter';
import { nnou } from '../../utils/object';

export function AlertDialogContainer(props: AlertDialogContainerProps) {
  const { onClosed, body, title, children, imageUrl = questionGraphicUrl, buttons } = props;
  const sx = getStyles();

  useUnmount(onClosed);
  return (
    <>
      <DialogContent id="confirmDialogBody" sx={sx.dialogBody}>
        <Box component="img" src={imageUrl} alt="" sx={sx.dialogImage} />
        {title && (
          <Typography variant="body1" component="h2" sx={sx.dialogTitle}>
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
      <DialogFooter sx={sx.dialogFooter}>{nnou(buttons) && buttons}</DialogFooter>
    </>
  );
}

export default AlertDialogContainer;
