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

import React, { useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/SearchRounded';
import CloseIcon from '@material-ui/icons/Close';
import clsx from 'clsx';
import { defineMessages, useIntl } from 'react-intl';
import { Paper } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    search: {
      flex: 1,
      position: 'relative',
      background: (props: any) => props.background ?? theme.palette.background.default,
      display: 'flex',
      alignItems: 'center',
      padding: '0 12px',
      borderRadius: '5px',
      '&.focus': {
        backgroundColor: theme.palette.background.paper,
        border: '1px solid transparent'
      },
      '&.noPadded': {
        padding: '0 0 0 12px'
      }
    },
    searchIcon: {
      color: theme.palette.text.secondary
    },
    icon: {
      padding: '6px'
    },
    closeIcon: {
      fontSize: '25px',
      color: theme.palette.text.secondary,
      cursor: 'pointer'
    },
    inputRoot: {
      flexGrow: 1
    },
    inputInput: {
      background: 'none',
      border: 'none',
      width: '100%',
      padding: '10px 5px',
      '&:focus': {
        boxShadow: 'none'
      }
    }
  })
);

const messages = defineMessages({
  placeholder: {
    id: 'searchBar.placeholder',
    defaultMessage: 'Search...'
  }
});

interface SearchBarProps {
  keyword: string[] | string;
  showActionButton?: boolean;
  actionButtonIcon?: any;
  showDecoratorIcon?: boolean;
  decoratorIcon?: any;
  autoFocus?: boolean;
  backgroundColor?: string;
  placeholder?: string;
  disabled?: boolean;
  classes?: {
    root?: any;
    inputRoot?: any;
    inputInput?: any;
    actionIcon?: any;
  };
  onBlur?(): void;
  onChange(value: string): void;
  onKeyPress?(key: string): void;
  onActionButtonClick?(): void;
}

export default function SearchBar(props: SearchBarProps) {
  const classes = useStyles({ background: props.backgroundColor });
  const {
    onChange,
    onKeyPress,
    keyword,
    showActionButton = false,
    actionButtonIcon: ActionButtonIcon = CloseIcon,
    autoFocus = false,
    placeholder,
    disabled = false,
    showDecoratorIcon = true,
    decoratorIcon: DecoratorIcon = SearchIcon,
    onActionButtonClick,
    onBlur
  } = props;
  const [focus, setFocus] = useState(false);
  const { formatMessage } = useIntl();
  return (
    <Paper
      variant={focus ? 'elevation' : 'outlined'}
      elevation={focus ? 4 : 0}
      className={clsx(classes.search, focus && 'focus', showActionButton && 'noPadded', props.classes?.root)}
    >
      {showDecoratorIcon && <DecoratorIcon className={classes.searchIcon} />}
      <InputBase
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={(e) => onKeyPress && onKeyPress(e.key)}
        onFocus={() => setFocus(true)}
        onBlur={() => {
          setFocus(false);
          onBlur?.();
        }}
        placeholder={placeholder || formatMessage(messages.placeholder)}
        autoFocus={autoFocus}
        disabled={disabled}
        value={keyword}
        classes={{
          root: clsx(classes.inputRoot, props.classes?.inputRoot),
          input: clsx(classes.inputInput, props.classes?.inputInput)
        }}
        inputProps={{ 'aria-label': 'search' }}
      />
      {showActionButton && (
        <IconButton onClick={onActionButtonClick ? onActionButtonClick : () => onChange('')} className={classes.icon}>
          <ActionButtonIcon className={clsx(classes.closeIcon, props.classes?.actionIcon)} />
        </IconButton>
      )}
    </Paper>
  );
}
