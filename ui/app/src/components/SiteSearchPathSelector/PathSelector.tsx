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
import { dispatchDOMEvent } from '../../state/actions/misc';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/SearchRounded';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { makeStyles } from 'tss-react/mui';
import Paper from '@mui/material/Paper';
import palette from '../../styles/palette';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Typography from '@mui/material/Typography';

const useStyles = makeStyles()((theme) => ({
  pathSelectorInputRoot: {
    flexGrow: 1
  },
  pathSelectorSearchIcon: {
    marginRight: '3px 5px 3px 3px',
    color: palette.gray.medium4
  },
  pathSelectorWrapper: {
    flex: 1,
    minHeight: 40,
    display: 'flex',
    cursor: 'pointer',
    padding: '0 0 0 10px',
    backgroundColor: theme.palette.background.default,
    '&:hover': {
      backgroundColor: theme.palette.action.hover
    },
    '&.disabled': {
      opacity: 0.7,
      cursor: 'default',
      backgroundColor: theme.palette.action.disabled
    },
    '&:not(.disabled):hover': {}
  },
  invisibleInput: {
    border: 0,
    padding: 0,
    height: '100%',
    cursor: 'pointer',
    background: 'none',
    '&:focus': {
      borderColor: 'none',
      boxShadow: 'inherit'
    }
  },
  basePathSelectorContainer: {
    padding: `0 ${theme.spacing(1)} ${theme.spacing(2)}`
  }
}));

const messages = defineMessages({
  searchIn: {
    id: 'searchFilter.searchIn',
    defaultMessage: 'Search in:'
  },
  content: {
    id: 'words.content',
    defaultMessage: 'Content'
  },
  assets: {
    id: 'words.assets',
    defaultMessage: 'Assets'
  },
  templates: {
    id: 'words.templates',
    defaultMessage: 'Templates'
  },
  scripts: {
    id: 'words.scripts',
    defaultMessage: 'Scripts'
  },
  anyPath: {
    id: 'searchFilter.anyPath',
    defaultMessage: 'Any Path'
  }
});

const basePaths = [
  {
    id: 'content',
    path: '/site'
  },
  {
    id: 'assets',
    path: '/static-assets'
  },
  {
    id: 'templates',
    path: '/templates'
  },
  {
    id: 'scripts',
    path: '/scripts'
  }
];

export interface PathSelectorProps {
  value: string;
  disabled: boolean;
  onPathSelected(path: string): void;
}

export function PathSelector(props: PathSelectorProps) {
  const { onPathSelected, value, disabled } = props;
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { classes, cx } = useStyles();
  const [path, setPath] = useState<string>(value ?? '');
  const idSuccess = 'pathSelectionSuccess';
  const idCancel = 'pathSelectionCancel';
  const radioBasePath = path.split('/')[1] ? `/${path.split('/')[1]}` : '';

  useEffect(() => {
    setPath(value ?? '');
  }, [value]);

  const onClean = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setPath('');
    onPathSelected(undefined);
  };

  const onOpenPathSelectionDialog = () => {
    const rootPath = path.split('/')[1] ? `/${path.split('/')[1]}` : '/site';
    dispatch(
      showPathSelectionDialog({
        rootPath,
        initialPath: path || rootPath,
        showCreateFolderOption: false,
        onClosed: {
          type: 'BATCH_ACTIONS',
          payload: [dispatchDOMEvent({ id: idCancel }), pathSelectionDialogClosed()]
        },
        onOk: {
          type: 'BATCH_ACTIONS',
          payload: [dispatchDOMEvent({ id: idSuccess }), closePathSelectionDialog()]
        }
      })
    );

    const successCallback = (e) => {
      const path = e.detail.path;
      setPath(path);
      onPathSelected(path);

      document.removeEventListener(idSuccess, successCallback, false);
      document.removeEventListener(idCancel, cancelCallback, false);
    };

    const cancelCallback = () => {
      document.removeEventListener(idCancel, cancelCallback, false);
      document.removeEventListener(idSuccess, successCallback, false);
    };

    document.addEventListener(idSuccess, successCallback, false);
    document.addEventListener(idCancel, cancelCallback, false);
  };

  const handleBasePathChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onPathSelected((event.target as HTMLInputElement).value);
  };

  return (
    <>
      <FormControl className={classes.basePathSelectorContainer}>
        <RadioGroup value={radioBasePath} onChange={handleBasePathChange}>
          <FormControlLabel value="" control={<Radio size="small" />} label={formatMessage(messages.anyPath)} />
          {basePaths.map((basePath) => (
            <FormControlLabel
              value={basePath.path}
              control={<Radio size="small" />}
              label={
                <>
                  {messages[basePath.id] ? formatMessage(messages[basePath.id]) : basePath.id}:{' '}
                  <Typography color="text.secondary" variant="body2" component="span">
                    {basePath.path}
                  </Typography>
                </>
              }
            />
          ))}
        </RadioGroup>
      </FormControl>
      {radioBasePath && (
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
            startAdornment={<SearchIcon className={classes.pathSelectorSearchIcon} />}
            endAdornment={
              !disabled && value ? (
                <IconButton onClick={onClean} size="small">
                  <CloseIcon />
                </IconButton>
              ) : null
            }
          />
        </Paper>
      )}
    </>
  );
}

export default PathSelector;
