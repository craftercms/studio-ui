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
import { AlertDialogProps } from './utils';
import useOnClose from '../../hooks/useOnClose';
import { Dialog } from '@mui/material';
import AlertDialogContainer from './AlertDialogContainer';
import { FullSxRecord, PartialSxRecord } from '../../models';

type AlertDialogClassKey = 'root' | 'image' | 'body' | 'title' | 'footer';
type AlertDialogFullSx = FullSxRecord<AlertDialogClassKey>;
type AlertDialogPartialSx = PartialSxRecord<AlertDialogClassKey>;

function getStyles(sx?: AlertDialogPartialSx): AlertDialogFullSx {
  return {
    root: {
      '& .MuiPaper-root': {
        borderRadius: '20px'
      },
      ...sx?.root
    },
    image: {
      paddingBottom: '35px',
      ...sx?.image
    },
    body: {
      textAlign: 'center',
      padding: '40px 20px 25px !important',
      ...sx?.body
    },
    title: {
      paddingBottom: '5px',
      ...sx?.title
    },
    footer: {
      borderTop: 'none !important',
      display: 'flex',
      flexDirection: 'column',
      padding: '0 40px 35px !important',
      mt: 2,
      '& button': {
        fontWeight: 600,
        letterSpacing: '0.46px'
      },
      '& > :not(:first-child)': {
        marginTop: '10px',
        marginLeft: 0
      },
      ...sx?.footer
    }
  };
}

export function AlertDialog(props: AlertDialogProps) {
  const {
    open,
    disableBackdropClick,
    disableEnforceFocus,
    hideBackdrop,
    maxWidth,
    disableEscapeKeyDown,
    onClose,
    sxs,
    ...rest
  } = props;
  const sx = getStyles(sxs);

  const onCloseHandler = useOnClose({
    onClose: onClose,
    disableBackdropClick: disableBackdropClick,
    disableEscapeKeyDown: disableEscapeKeyDown
  });

  return (
    <Dialog
      open={open}
      onClose={onCloseHandler}
      aria-labelledby="alertDialogTitle"
      aria-describedby="alertDialogBody"
      disableEnforceFocus={disableEnforceFocus}
      hideBackdrop={hideBackdrop}
      sx={sx.root}
      maxWidth={maxWidth ?? 'xs'}
      fullWidth
    >
      <AlertDialogContainer {...rest} sxs={sx} />
    </Dialog>
  );
}

export default AlertDialog;
