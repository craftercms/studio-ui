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

import MuiDialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';
import palette from '../../styles/palette';
import { PartialSxRecord } from '../../models';
import Box from '@mui/material/Box';

export interface DialogTitleProps {
	title: string;
	subtitle?: string;
	onClose?(): void;
	sxs?: PartialSxRecord<'root' | 'title' | 'subtitle' | 'closeIcon'>;
}

export function DialogTitle(props: DialogTitleProps) {
	const { onClose, title, subtitle, sxs } = props;
	return (
		<MuiDialogTitle sx={{ margin: 0, padding: '13px 20px 11px', background: palette.white, ...sxs?.root }}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', ...sxs?.title }}>
				<Typography variant="h6">{title}</Typography>
				{onClose ? (
					<IconButton aria-label="close" onClick={onClose} sx={sxs?.closeIcon} size="large">
						<CloseIcon />
					</IconButton>
				) : null}
			</Box>
			{subtitle && (
				<Typography
					variant="subtitle1"
					sx={{ fontSize: '14px', lineHeight: '18px', paddingRight: '35px', ...sxs?.subtitle }}
				>
					{subtitle}
				</Typography>
			)}
		</MuiDialogTitle>
	);
}

export default DialogTitle;
