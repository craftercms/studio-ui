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

import IconButton from '@mui/material/IconButton';
import Button, { ButtonProps } from '@mui/material/Button';
import React, { ReactNode } from 'react';
import Tooltip from '@mui/material/Tooltip';
import SystemIcon, { SystemIconDescriptor } from '../SystemIcon';

export interface DialogHeaderActionProps extends ButtonProps {
	icon?: SystemIconDescriptor;
	text?: ReactNode;
	tooltip?: string;
}

export function DialogHeaderAction(props: DialogHeaderActionProps) {
	const { icon, text, tooltip, disabled = false, ...rest } = props;
	const button = text ? (
		<Button
			size="large"
			startIcon={icon ? <SystemIcon icon={icon} /> : undefined}
			{...rest}
			disabled={disabled}
			children={text}
		/>
	) : (
		<IconButton size="large" children={<SystemIcon icon={icon} />} {...rest} disabled={disabled} />
	);
	return tooltip ? <Tooltip title={disabled ? '' : tooltip} children={button} /> : button;
}

export default DialogHeaderAction;
