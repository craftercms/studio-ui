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
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Paper from '@mui/material/Paper';
import SiteExplorer from '../../icons/SiteExplorer';
import { popDialog, pushDialog } from '../../state/actions/dialogStack';
import { nanoid } from 'nanoid';
import { createComponentId } from '../../utils/system';

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
	/** The minimum outer path allowed */
	rootPath?: string;
	onPathSelected(path: string): void;
}

export function PathSelector(props: PathSelectorProps) {
	const { onPathSelected, value, disabled = false, stripXmlIndex = true, rootPath } = props;
	const { formatMessage } = useIntl();
	const dispatch = useDispatch();
	const [path, setPath] = useState<string>(value ?? '');

	useEffect(() => {
		setPath(value ?? '');
	}, [value]);

	const onClean = (e) => {
		e.stopPropagation();
		e.preventDefault();
		let cleanPath = rootPath ?? '';
		setPath(cleanPath);
		onPathSelected(cleanPath);
	};

	const onOpenPathSelectionDialog = () => {
		const dialogId = nanoid();
		dispatch(
			pushDialog({
				id: dialogId,
				component: createComponentId('PathSelectionDialog'),
				props: {
					rootPath: rootPath ?? `/${path.split('/')[1] ?? ''}`,
					initialPath: path,
					showCreateFolderOption: false,
					allowSwitchingRootPath: !Boolean(rootPath),
					stripXmlIndex,
					onClosed: () => dispatch(popDialog({ id: dialogId })),
					onOk: ({ path }) => {
						setPath(path);
						onPathSelected(path);
						dispatch(popDialog({ id: dialogId }));
					}
				}
			})
		);
	};

	return (
		<Paper
			variant="outlined"
			onClick={disabled ? null : onOpenPathSelectionDialog}
			sx={{
				flex: 1,
				minHeight: 40,
				display: 'flex',
				cursor: disabled ? 'default' : 'pointer',
				padding: '0 0 0 10px',
				opacity: disabled ? 0.7 : 1,
				'&:hover:not(.disabled)': {
					borderColor: (theme) => theme.palette.action.active
				}
			}}
		>
			<InputBase
				sx={{ flexGrow: 1 }}
				inputProps={{
					sx: {
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
				}}
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
