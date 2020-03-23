/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
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
import { InputBase, Theme } from '@material-ui/core';
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
  closeIcon: {
    marginLeft: '10px',
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
  closeIcon?: boolean;
  showDecoratorIcon?: boolean;
  decoratorIcon?: any;
  persistentCloseIcon?: boolean;
  autofocus?: boolean;
  backgroundColor?: string;
  placeholder?: string;
  disabled?: boolean;
  classes?: {
    root?: any;
  };

  onChange(value: string): any;
}

export default function SearchBar(props: SearchBarProps) {
  const classes = useStyles({ background: props.backgroundColor || palette.gray.light5 });
  const {
    onChange,
    keyword,
    closeIcon = false,
    autofocus = false,
    placeholder,
    disabled = false,
    persistentCloseIcon = false,
    showDecoratorIcon = false,
    decoratorIcon: DecoratorIcon = SearchIcon
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
        (closeIcon && (persistentCloseIcon || keyword)) &&
        <CloseIcon className={classes.closeIcon} onClick={() => onChange('')}/>
      }
    </div>
  )
}
