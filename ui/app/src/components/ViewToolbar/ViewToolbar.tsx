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

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import React, { PropsWithChildren } from 'react';
import { PartialSxRecord } from '../../models';
import { Theme } from '@mui/material';
import { SystemStyleObject } from '@mui/system/styleFunctionSx/styleFunctionSx';

export type ViewToolbarClassKey = 'appBar' | 'toolbar';

type ViewToolbarProps = PropsWithChildren<{
	elevation?: number;
	classes?: Partial<Record<ViewToolbarClassKey, string>>;
	sxs?: PartialSxRecord<ViewToolbarClassKey>;
}>;

export const ViewToolbar = React.memo<ViewToolbarProps>(function (props) {
	const { children, elevation = 0, sxs } = props;
	return (
		<AppBar
			color="inherit"
			position="relative"
			elevation={elevation}
			className={props.classes?.appBar}
			sx={(theme) => ({
				borderBottom: `1px solid ${theme.palette.divider}`,
				background: theme.palette.background.paper,
				color: theme.palette.text.primary,
				...(sxs?.appBar as SystemStyleObject<Theme>)
			})}
		>
			<Toolbar
				className={props.classes?.toolbar}
				sx={(theme) => ({
					paddingLeft: `${theme.spacing(1.5)} !important`,
					paddingRight: `${theme.spacing(1.5)} !important`,
					placeContent: 'center space-between',
					'& > section': {
						display: 'flex',
						alignItems: 'center'
					},
					...(sxs?.toolbar as SystemStyleObject<Theme>)
				})}
			>
				{children}
			</Toolbar>
		</AppBar>
	);
});

export default ViewToolbar;
