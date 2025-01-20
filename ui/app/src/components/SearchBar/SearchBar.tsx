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
import IconButton from '@mui/material/IconButton';
import InputBase, { inputBaseClasses, InputBaseProps } from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/SearchRounded';
import CloseIcon from '@mui/icons-material/Close';
import { defineMessages, useIntl } from 'react-intl';
import { Paper } from '@mui/material';
import { PartialSxRecord } from '../../models';

const messages = defineMessages({
  placeholder: {
    id: 'searchBar.placeholder',
    defaultMessage: 'Filter...'
  }
});

export type SearchBarClassKey = 'root' | 'inputRoot' | 'inputInput' | 'actionIcon';

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
  classes?: Partial<Record<SearchBarClassKey, string>>;
  sxs?: PartialSxRecord<SearchBarClassKey>;
  onBlur?(): void;
  onClick?(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
  onChange(value: string, event: React.SyntheticEvent): void;
  onKeyPress?(key: string): void;
  onKeyDown?: InputBaseProps['onKeyDown'];
  onActionButtonClick?(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, input: HTMLInputElement): void;
  onDecoratorButtonClick?(): void;
}

export function SearchBar(props: SearchBarProps) {
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
    onClick,
    sxs
  } = props;
  const [focus, setFocus] = useState(false);
  const { formatMessage } = useIntl();
  const finalPlaceholder = placeholder || formatMessage(messages.placeholder);
  const inputRef = useRef<HTMLInputElement>(undefined);
  return (
    <Paper
      onClick={onClick}
      variant={focus ? 'elevation' : 'outlined'}
      elevation={focus ? 4 : 0}
      className={[focus && 'focus', showActionButton && 'noPadded', props.classes?.root].filter(Boolean).join(' ')}
      sx={{
        position: 'relative',
        background: (theme) => props.backgroundColor ?? theme.palette.background.default,
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        borderRadius: '5px',
        '&.focus': {
          backgroundColor: (theme) => theme.palette.background.paper,
          border: '1px solid transparent'
        },
        '&.noPadded': {
          padding: '0 0 0 12px'
        },
        ...sxs?.root
      }}
    >
      {showDecoratorIcon && onDecoratorButtonClick ? (
        <IconButton onClick={onDecoratorButtonClick} size="large">
          <DecoratorIcon sx={{ color: (theme) => theme.palette.text.secondary }} />
        </IconButton>
      ) : (
        <DecoratorIcon sx={{ color: (theme) => theme.palette.text.secondary }} />
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
          root: props.classes?.inputRoot,
          input: props.classes?.inputInput
        }}
        sx={{
          flexGrow: 1,
          background: 'transparent',
          '&:focus': {
            backgroundColor: (theme) => theme.palette.background.paper
          },
          ...sxs?.inputRoot,
          [`& .${inputBaseClasses.input}`]: {
            background: 'none',
            border: 'none',
            width: '100%',
            padding: '10px 5px',
            '&:focus': {
              boxShadow: 'none'
            },
            ...sxs?.inputInput
          }
        }}
        inputProps={{
          'aria-label': finalPlaceholder,
          ref: inputRef
        }}
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
          sx={{ padding: '6px' }}
          size="large"
        >
          <ActionButtonIcon
            className={props.classes?.actionIcon}
            sx={{
              fontSize: '25px',
              color: (theme) => theme.palette.text.secondary,
              cursor: 'pointer',
              ...sxs?.actionIcon
            }}
          />
        </IconButton>
      )}
    </Paper>
  );
}

export default SearchBar;
