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

import React, { PropsWithChildren } from 'react';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/CloseRounded';
import Dialog from '@mui/material/Dialog';
import StandardAction from '../../models/StandardAction';
import { ApiResponse } from '../../models/ApiResponse';
import ApiResponseErrorState from '../ApiResponseErrorState';
import { useUnmount } from '../../hooks/useUnmount';
import Box from '@mui/material/Box';

interface ErrorDialogBaseProps {
	open: boolean;
	error: ApiResponse;
}

export type ErrorDialogProps = PropsWithChildren<
	ErrorDialogBaseProps & {
		onClose?(): void;
		onClosed?(): void;
		onDismiss?(): void;
	}
>;

export interface ErrorDialogStateProps extends ErrorDialogBaseProps {
	onClose?: StandardAction;
	onClosed?: StandardAction;
	onDismiss?: StandardAction;
}

function ErrorDialogBody(props: ErrorDialogProps) {
	const { onDismiss, error } = props;
	useUnmount(props.onClosed);
	return (
		<Box sx={{ padding: (theme) => theme.spacing(2) }}>
			<IconButton
				aria-label="close"
				sx={(theme) => ({
					position: 'absolute',
					right: theme.spacing(1),
					top: theme.spacing(1)
				})}
				onClick={() => onDismiss()}
				size="large"
			>
				<CloseIcon />
			</IconButton>
			{error && <ApiResponseErrorState error={error} />}
		</Box>
	);
}

export function ErrorDialog(props: ErrorDialogProps) {
	return (
		<Dialog open={props.open} onClose={props.onClose}>
			<ErrorDialogBody {...props} />
		</Dialog>
	);
}

export default ErrorDialog;
