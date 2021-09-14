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

import * as React from 'react';
import { PropsWithChildren, useEffect } from 'react';
import { useOnClose } from '../../utils/hooks/useOnClose';
import { useDispatch } from 'react-redux';
import { maximizeDialog, minimizeDialog, popDialog, pushDialog } from '../../state/reducers/dialogs/minimizedDialogs';
import MuiDialog, { DialogProps as MuiDialogProps } from '@material-ui/core/Dialog';
import { closeConfirmDialog, showConfirmDialog } from '../../state/actions/dialogs';
import translations from '../CodeEditorDialog/translations';
import { useIntl } from 'react-intl';
import TranslationOrText from '../../models/TranslationOrText';
import { getPossibleTranslation } from '../../utils/i18n';
import { batchActions, dispatchDOMEvent } from '../../state/actions/misc';
import { createCustomDocumentEventListener } from '../../utils/dom';

export interface DialogProps extends PropsWithChildren<Omit<MuiDialogProps, 'title'>> {
  title?: TranslationOrText;
  minimized?: boolean;
  hasPendingChanges?: boolean;
  isSubmitting?: boolean;
  onClosed?(): void;
}

export function Dialog(props: DialogProps) {
  const { id, open, isSubmitting, hasPendingChanges, minimized, title, ...dialogProps } = props;
  const onMinimize = () => dispatch(minimizeDialog({ id }));
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const onClose = useOnClose({
    onClose(e, reason) {
      if (hasPendingChanges) {
        const customEventId = 'dialogDismissConfirm';
        dispatch(
          showConfirmDialog({
            title: formatMessage(translations.pendingChanges),
            onOk: batchActions([dispatchDOMEvent({ id: customEventId, type: 'success' }), closeConfirmDialog()]),
            onCancel: batchActions([dispatchDOMEvent({ id: customEventId, type: 'cancel' }), closeConfirmDialog()])
          })
        );
        createCustomDocumentEventListener(customEventId, ({ type }) => {
          type === 'success' && dialogProps.onClose(e, reason);
        });
      } else {
        dialogProps.onClose(e, reason);
      }
    },
    disableBackdropClick: isSubmitting,
    disableEscapeKeyDown: isSubmitting
  });
  useEffect(() => {
    if (minimized) {
      dispatch(
        pushDialog({
          id,
          onMaximized: maximizeDialog({ id }),
          minimized,
          title: getPossibleTranslation(title, formatMessage)
        })
      );
      return () => {
        dispatch(popDialog({ id }));
      };
    }
  }, [dispatch, formatMessage, id, minimized, title]);
  return (
    <MuiDialog
      open={open && !minimized}
      keepMounted={minimized}
      fullWidth
      maxWidth="md"
      {...dialogProps}
      onClose={onClose}
    >
      {React.Children.map(props.children, (child) =>
        React.cloneElement(child as React.ReactElement, { onMinimize, onClose })
      )}
    </MuiDialog>
  );
}

export default Dialog;
