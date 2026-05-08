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

import React, { CSSProperties, ElementType, forwardRef, Ref, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import InputBase, { inputBaseClasses, InputBaseProps } from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/SearchRounded';
import CloseIcon from '@mui/icons-material/Close';
import { defineMessages, useIntl } from 'react-intl';
import Paper, { PaperProps } from '@mui/material/Paper';
import { PartialSxRecord } from '../../models';
import { consolidateSx } from '../../utils/system';

const messages = defineMessages({
	placeholder: {
		id: 'searchBar.placeholder',
		defaultMessage: 'Filter...'
	}
});

export type SearchBarClassKey = 'root' | 'inputRoot' | 'inputInput' | 'actionIcon';

export interface SearchBarProps {
	sx?: PaperProps['sx'];
	dense?: boolean;
	keyword: string[] | string;
	showActionButton?: boolean;
	actionButtonIcon?: ElementType;
	showDecoratorIcon?: boolean;
	decoratorIcon?: ElementType;
	autoFocus?: boolean;
	backgroundColor?: string;
	placeholder?: string;
	disabled?: boolean;
	inputRef?: Ref<HTMLInputElement>;
	classes?: Partial<Record<SearchBarClassKey, string>>;
	sxs?: PartialSxRecord<SearchBarClassKey>;
	styles?: Partial<Record<SearchBarClassKey, CSSProperties>>;
	onBlur?(): void;
	onClick?(e: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
	onChange(value: string, event: React.SyntheticEvent): void;
	onKeyPress?(key: string): void;
	onKeyDown?: InputBaseProps['onKeyDown'];
	onActionButtonClick?(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, input: HTMLInputElement | null): void;
	onDecoratorButtonClick?(): void;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>((props, ref) => {
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
		sxs,
		dense
	} = props;
	const [focus, setFocus] = useState(false);
	const { formatMessage } = useIntl();
	const finalPlaceholder = placeholder || formatMessage(messages.placeholder);
	return (
		<Paper
			onClick={onClick}
			variant={focus ? 'elevation' : 'outlined'}
			elevation={focus ? 4 : 0}
			className={[focus && 'focus', showActionButton && 'noPadded', props.classes?.root].filter(Boolean).join(' ')}
			sx={consolidateSx(
				{
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
					minHeight: '40px',
					...sxs?.root
				},
				props.sx
			)}
		>
			{showDecoratorIcon && onDecoratorButtonClick ? (
				<IconButton
					onClick={onDecoratorButtonClick}
					size="large"
					aria-label={formatMessage({ defaultMessage: 'Filter' })}
				>
					<DecoratorIcon sx={{ color: (theme) => theme.palette.text.secondary }} />
				</IconButton>
			) : (
				<DecoratorIcon sx={{ color: (theme) => theme.palette.text.secondary }} fontSize="small" />
			)}
			<InputBase
				size="small"
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
				sx={consolidateSx(
					{
						flexGrow: 1,
						background: 'transparent',
						'&:focus': {
							backgroundColor: (theme) => theme.palette.background.paper
						}
					},
					sxs?.inputRoot,
					{
						[`& .${inputBaseClasses.input}`]: consolidateSx(
							{
								background: 'none',
								border: 'none',
								width: '100%',
								padding: 0,
								paddingLeft: 5,
								'&:focus': {
									boxShadow: 'none'
								}
							},
							sxs?.inputInput
						)
					}
				)}
				inputProps={{
					'aria-label': finalPlaceholder,
					ref
				}}
			/>
			{showActionButton && (
				<IconButton
					onClick={(e) => {
						(
							onActionButtonClick ??
							((e, inputEl) => {
								onChange('', e);
								inputEl?.focus();
							})
						)(e, typeof ref === 'object' && ref !== null ? ref.current : null);
					}}
					sx={{ padding: '6px' }}
					size="small"
					aria-label={formatMessage({ defaultMessage: 'Clear' })}
				>
					<ActionButtonIcon
						fontSize="small"
						className={props.classes?.actionIcon}
						sx={consolidateSx(
							{
								fontSize: '25px',
								color: (theme) => theme.palette.text.secondary,
								cursor: 'pointer'
							},
							sxs?.actionIcon
						)}
					/>
				</IconButton>
			)}
		</Paper>
	);
});

export default SearchBar;
