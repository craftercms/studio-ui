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

import Button, { ButtonProps } from '@mui/material/Button';
import { ReactNode } from 'react';
import Avatar, { avatarClasses } from '@mui/material/Avatar';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import { styled } from '@mui/material/styles';
import { alpha } from '@mui/material';

const StackedButton = styled(Button)(({ theme }) => ({
	display: 'flex',
	flexDirection: 'column',
	textDecoration: 'underline',
	[`& .${avatarClasses.root}`]: {
		backgroundColor: theme.palette.action.selected,
		color: alpha(theme.palette.action.selected, 1)
	}
}));

export interface FeaturedButtonProps extends ButtonProps {
	icon: ReactNode;
}

export function FeaturedButton({ children, ...rest }: FeaturedButtonProps) {
	return (
		<StackedButton {...rest}>
			<Avatar variant="circular">
				<UploadFileOutlinedIcon />
			</Avatar>
			{children}
		</StackedButton>
	);
}

export default FeaturedButton;
