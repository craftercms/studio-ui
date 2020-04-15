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
import makeStyles from '@material-ui/core/styles/makeStyles';
import { IconButton, InputBase, Theme } from '@material-ui/core';
import { palette } from '../styles/theme';
import SearchIcon from '@material-ui/icons/SearchRounded';
import CloseIcon from '@material-ui/icons/Close';
import clsx from 'clsx';
import { defineMessages, useIntl } from 'react-intl';

const useStyles = makeStyles((theme: Theme) => ({
  search: {
    position: 'relative',
    background: (props: any) => props.background,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px',
    borderRadius: '5px',
    '&.focus': {
      backgroundColor: palette.white,
      boxShadow: '0px 0px 3px rgba(65, 69, 73, 0.15), 0px 4px 4px rgba(65, 69, 73, 0.15)'
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
}));

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
  autofocus?: boolean;
  backgroundColor?: string;
  placeholder?: string;
  disabled?: boolean;
  classes?: {
    root?: any;
  };

  onChange(value: string): void;

  onKeyPress?(key: string): void;

  onActionButtonClick?(): void;
}

export default function SearchBar(props: SearchBarProps) {
  const classes = useStyles({ background: props.backgroundColor || palette.gray.light5 });
  const {
    onChange,
    onKeyPress,
    keyword,
    showActionButton = false,
    actionButtonIcon: ActionButtonIcon = CloseIcon,
    autofocus = false,
    placeholder,
    disabled = false,
    showDecoratorIcon = false,
    decoratorIcon: DecoratorIcon = SearchIcon,
    onActionButtonClick
  } = props;
  const [focus, setFocus] = useState(false);
  const { formatMessage } = useIntl();
  return (
    <div className={clsx(classes.search, focus && 'focus', props.classes?.root)}>
      {
        showDecoratorIcon &&
        <DecoratorIcon className={classes.searchIcon}/>
      }
      <InputBase
        onChange={e => onChange(e.target.value)}
        onKeyPress={(e) => onKeyPress && onKeyPress(e.key)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        placeholder={placeholder || formatMessage(messages.placeholder)}
        autoFocus={autofocus}
        disabled={disabled}
        value={keyword}
        classes={{
          root: classes.inputRoot,
          input: classes.inputInput
        }}
        inputProps={{ 'aria-label': 'search' }}
      />
      {
        showActionButton &&
        <IconButton onClick={onActionButtonClick? onActionButtonClick: () => onChange('') } className={classes.icon}>
          <ActionButtonIcon className={classes.closeIcon}/>
        </IconButton>
      }
    </div>
  );
}
