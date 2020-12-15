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

import { Filter as FilterType } from '../../models/Search';
import { defineMessages, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import React, { useState } from 'react';
import {
  closePathSelectionDialog,
  pathSelectionDialogClosed,
  showPathSelectionDialog
} from '../../state/actions/dialogs';
import { dispatchDOMEvent } from '../../state/actions/misc';
import clsx from 'clsx';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/SearchRounded';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core';
import palette from '../../styles/palette';

const useStyles = makeStyles((theme: Theme) => ({
  pathSelectorInputRoot: {
    flexGrow: 1
  },
  pathSelectorSearchIcon: {
    marginRight: '3px 5px 3px 3px',
    color: palette.gray.medium4
  },
  pathSelectorWrapper: {
    display: 'flex',
    padding: '10px 0px 10px 12px',
    border: `1px solid  ${palette.gray.light1}`,
    borderRadius: '5px',
    '&.disabled': {
      opacity: 0.7
    },
    '&:not(.disabled):hover': {
      borderColor: palette.gray.light6
    }
  },
  invisibleInput: {
    padding: 0,
    border: 0,
    background: 'none',
    height: '100%',
    '&:focus': {
      borderColor: 'none',
      boxShadow: 'inherit'
    }
  }
}));

const messages = defineMessages({
  searchIn: {
    id: 'searchFilter.searchIn',
    defaultMessage: 'Search in:'
  }
});

interface PathSelectorProps {
  value: string;
  disabled: boolean;
  handleFilterChange(filter: FilterType, isFilter?: boolean): any;
}

export default function PathSelector(props: PathSelectorProps) {
  const { handleFilterChange, value, disabled } = props;
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const classes = useStyles({});
  const [keyword, setKeyword] = useState(value ?? '');
  const rootPath = keyword.split('/')[1] ? `/${keyword.split('/')[1]}` : null;
  const idSuccess = 'pathSelectionSuccess';
  const idCancel = 'pathSelectionCancel';

  const keywordToFilter = (keyword) => {
    if (keyword) {
      if (keyword.endsWith('/')) {
        return `${keyword}.+`;
      } else {
        return `${keyword}/.+`;
      }
    } else {
      return undefined;
    }
  };

  const onClean = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setKeyword('');
    handleFilterChange({
      name: 'path',
      value: undefined
    });
  };

  const onOpenPathSelectionDialog = () => {
    dispatch(
      showPathSelectionDialog({
        rootPath: rootPath ?? '/',
        initialPath: rootPath ? keyword : null,
        showCreateFolder: false,
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
      const keyword = e.detail.path;
      setKeyword(keyword);
      handleFilterChange({
        name: 'path',
        value: keywordToFilter(keyword)
      });
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

  return (
    <div
      className={clsx(classes.pathSelectorWrapper, disabled && 'disabled')}
      onClick={disabled ? null : onOpenPathSelectionDialog}
    >
      <InputBase
        classes={{ root: classes.pathSelectorInputRoot, input: classes.invisibleInput }}
        disabled={disabled}
        readOnly
        value={keyword}
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
    </div>
  );
}
