/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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

import { defineMessages, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import React, { useEffect, useState } from 'react';
import {
  closePathSelectionDialog,
  pathSelectionDialogClosed,
  showPathSelectionDialog
} from '../../state/actions/dialogs';
import { batchActions, dispatchDOMEvent } from '../../state/actions/misc';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { makeStyles } from 'tss-react/mui';
import Paper from '@mui/material/Paper';
import SiteExplorer from '../../icons/SiteExplorer';
import { createCustomDocumentEventListener } from '../../utils/dom';

const useStyles = makeStyles()((theme, a, b) => ({
  pathSelectorInputRoot: {
    flexGrow: 1
  },
  pathSelectorWrapper: {
    flex: 1,
    minHeight: 40,
    display: 'flex',
    cursor: 'pointer',
    padding: '0 0 0 10px',
    '&:hover:not(.disabled)': {
      borderColor: theme.palette.action.active
    },
    '&.disabled': {
      opacity: 0.7,
      cursor: 'default'
    }
  },
  invisibleInput: {
    border: 0,
    padding: '0 0 0 5px',
    height: '100%',
    cursor: 'pointer',
    background: 'none',
    '&:focus': {
      borderColor: 'none',
      boxShadow: 'inherit'
    },
    '&:disabled': {
      cursor: 'default'
    }
  }
}));

const messages = defineMessages({
  searchIn: {
    id: 'pathSelector.inputPlaceholderText',
    defaultMessage: 'Select path'
  }
});

export interface PathSelectorProps {
  value: string;
  disabled?: boolean;
  stripXmlIndex?: boolean;
  onPathSelected(path: string): void;
}

export function PathSelector(props: PathSelectorProps) {
  const { onPathSelected, value, disabled = false, stripXmlIndex = true } = props;
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { classes, cx } = useStyles();
  const [path, setPath] = useState<string>(value ?? '');

  useEffect(() => {
    setPath(value ?? '');
  }, [value]);

  const onClean = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setPath('');
    onPathSelected('');
  };

  const onOpenPathSelectionDialog = () => {
    const callbackId = 'pathSelectionDialogCallback';
    const callbackAccept = 'accept';
    dispatch(
      showPathSelectionDialog({
        rootPath: `/${path.split('/')[1] ?? ''}`,
        initialPath: path,
        showCreateFolderOption: false,
        stripXmlIndex,
        onClosed: batchActions([dispatchDOMEvent({ id: callbackId, action: 'close' }), pathSelectionDialogClosed()]),
        onOk: batchActions([dispatchDOMEvent({ id: callbackId, action: callbackAccept }), closePathSelectionDialog()])
      })
    );
    createCustomDocumentEventListener(callbackId, (detail) => {
      if (detail.action === callbackAccept) {
        const path = detail.path;
        setPath(path);
        onPathSelected(path);
      }
    });
  };

  return (
    <Paper
      variant="outlined"
      onClick={disabled ? null : onOpenPathSelectionDialog}
      className={cx(classes.pathSelectorWrapper, disabled && 'disabled')}
    >
      <InputBase
        classes={{ root: classes.pathSelectorInputRoot, input: classes.invisibleInput }}
        disabled={disabled}
        readOnly
        value={path}
        placeholder={formatMessage(messages.searchIn)}
        startAdornment={disabled ? null : <SiteExplorer sx={{ color: 'text.secondary' }} />}
        endAdornment={
          !disabled && value ? (
            <IconButton onClick={onClean} size="small">
              <CloseIcon />
            </IconButton>
          ) : null
        }
      />
    </Paper>
  );
}

export default PathSelector;
