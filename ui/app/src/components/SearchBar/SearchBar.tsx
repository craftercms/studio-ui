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

import React, { useRef, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import IconButton from '@mui/material/IconButton';
import InputBase, { InputBaseProps } from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/SearchRounded';
import CloseIcon from '@mui/icons-material/Close';
import { defineMessages, useIntl } from 'react-intl';
import { Paper } from '@mui/material';

const useStyles = makeStyles<{ background: string }>()((theme, { background } = {} as any) => ({
  search: {
    position: 'relative',
    background: background ?? theme.palette.background.default,
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
    flexGrow: 1,
    background: 'transparent',
    '&:focus': {
      backgroundColor: theme.palette.background.paper
    }
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
    defaultMessage: 'Filter...'
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
  onClick?(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
  onChange(value: string, event: React.SyntheticEvent): void;
  onKeyPress?(key: string): void;
  onKeyDown?: InputBaseProps['onKeyDown'];
  onActionButtonClick?(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, input: HTMLInputElement): void;
  onDecoratorButtonClick?(): void;
}

export function SearchBar(props: SearchBarProps) {
  const { classes, cx } = useStyles({ background: props.backgroundColor });
  const {
    onChange,
    onKeyPress,
    onKeyDown,
    keyword,
    showActionButton = false,
    actionButtonIcon: ActionButtonIcon = CloseIcon,
    autoFocus = false,
    placeholder,
    disabled = false,
    showDecoratorIcon = true,
    decoratorIcon: DecoratorIcon = SearchIcon,
    onActionButtonClick,
    onDecoratorButtonClick,
    onBlur,
    onClick
  } = props;
  const [focus, setFocus] = useState(false);
  const { formatMessage } = useIntl();
  const finalPlaceholder = placeholder || formatMessage(messages.placeholder);
  const inputRef = useRef<HTMLInputElement>();
  return (
    <Paper
      onClick={onClick}
      variant={focus ? 'elevation' : 'outlined'}
      elevation={focus ? 4 : 0}
      className={cx(classes.search, focus && 'focus', showActionButton && 'noPadded', props.classes?.root)}
    >
      {showDecoratorIcon && onDecoratorButtonClick ? (
        <IconButton onClick={onDecoratorButtonClick} size="large">
          <DecoratorIcon className={classes.searchIcon} />
        </IconButton>
      ) : (
        <DecoratorIcon className={classes.searchIcon} />
      )}
      <InputBase
        onChange={(e) => onChange(e.target.value, e)}
        onKeyDown={onKeyDown}
        onKeyPress={(e) => onKeyPress?.(e.key)}
        onFocus={() => setFocus(true)}
        onBlur={() => {
          setFocus(false);
          onBlur?.();
        }}
        placeholder={finalPlaceholder}
        autoFocus={autoFocus}
        disabled={disabled}
        value={keyword}
        classes={{
          root: cx(classes.inputRoot, props.classes?.inputRoot),
          input: cx(classes.inputInput, props.classes?.inputInput)
        }}
        inputProps={{ 'aria-label': finalPlaceholder, ref: inputRef }}
      />
      {showActionButton && (
        <IconButton
          onClick={(e) => {
            (
              onActionButtonClick ??
              ((e, inputRef) => {
                onChange('', e);
                inputRef?.focus();
              })
            )(e, inputRef.current);
          }}
          className={classes.icon}
          size="large"
        >
          <ActionButtonIcon className={cx(classes.closeIcon, props.classes?.actionIcon)} />
        </IconButton>
      )}
    </Paper>
  );
}

export default SearchBar;
