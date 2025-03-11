/*
 * Copyright (C) 2007-2024 Crafter Software Corporation. All Rights Reserved.
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

import EnhancedDialog, { EnhancedDialogProps } from '../EnhancedDialog';
import React from 'react';
import FormsEngine, { FormsEngineProps } from './FormsEngine';
import { dialogClasses } from '@mui/material/Dialog';

export interface FormsEngineDialogProps extends EnhancedDialogProps {
	formProps: FormsEngineProps;
}

export function FormsEngineDialog(props: FormsEngineDialogProps) {
	const { formProps, ...rest } = props;
	return (
		<EnhancedDialog
			sx={{
				[`& > .${dialogClasses.container} > .${dialogClasses.paper}`]: {
					height: '100vh'
				}
			}}
			{...rest}
			omitHeader
			maxWidth="xl"
			title="Content Form"
			data-area-id="forms-engine-dialog-root"
		>
			<FormsEngine
				onMinimize={props.onMinimize}
				onFullScreen={props.onFullScreen}
				onCancelFullScreen={props.onCancelFullScreen}
				{...formProps}
				isDialog
			/>
		</EnhancedDialog>
	);
}

export default FormsEngineDialog;
