/*
 * Copyright (C) 2007-2025 Crafter Software Corporation. All Rights Reserved.
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

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';

// TODO: This layout pattern could be useful in other parts of the application.

export interface MainProps {
	open?: boolean;
	drawerWidth?: number;
}

export const Main = styled(Box, {
	shouldForwardProp: (prop) => !['open', 'drawerWidth'].includes(prop as string)
})<MainProps>((args) => {
	const { theme, drawerWidth } = args;
	return {
		flexGrow: 1,
		marginRight: 0,
		transition: theme.transitions.create('margin', {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen
		}),
		variants: [
			{
				props: ({ open }) => open,
				style: {
					marginRight: `${drawerWidth}px`,
					transition: theme.transitions.create('margin', {
						easing: theme.transitions.easing.easeOut,
						duration: theme.transitions.duration.enteringScreen
					})
				}
			}
		]
	};
});

export default Main;
