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

import React, { ReactNode } from 'react';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Fab from '@mui/material/Fab';
import crack from '../../assets/warning.svg';
import { nnou } from '../../utils/object';
import { PartialSxRecord } from '../../models';
import Box from '@mui/material/Box';

type ErrorStateClassKey = 'root' | 'image' | 'title' | 'message' | 'button';

export type ErrorStateProps = React.PropsWithChildren<{
	title?: ReactNode;
	message?: string;
	imageUrl?: string;
	buttonIcon?: ReactNode;
	buttonText?: string;
	onButtonClick?(event: React.MouseEvent): any;
	classes?: Partial<Record<ErrorStateClassKey, string>>;
	sxs?: PartialSxRecord<ErrorStateClassKey>;
}>;

export function ErrorState(props: ErrorStateProps) {
	const {
		title,
		message,
		buttonText = 'Back',
		buttonIcon = <ArrowBackIcon />,
		onButtonClick,
		imageUrl = crack,
		children,
		sxs
	} = props;
	return (
		<Box
			component="section"
			className={props.classes?.root}
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				padding: (theme) => theme.spacing(1),
				paddingBottom: '0',
				...sxs?.root
			}}
		>
			<Box
				component="img"
				className={props.classes?.image}
				sx={{
					maxWidth: '100%',
					marginBottom: (theme) => theme.spacing(1),
					...sxs?.image
				}}
				src={imageUrl}
				alt=""
			/>
			{nnou(title) && (
				<Typography
					variant="body1"
					component="h3"
					className={props.classes?.title}
					sx={{ marginBottom: (theme) => theme.spacing(1), ...sxs?.title }}
					children={title}
				/>
			)}
			{nnou(message) && (
				<Typography
					variant="body2"
					component="p"
					className={props.classes?.message}
					sx={{
						textAlign: 'center',
						marginBottom: (theme) => theme.spacing(1),
						wordBreak: 'break-all',
						...sxs?.message
					}}
					children={message}
				/>
			)}
			{children}
			{onButtonClick && (
				<Fab
					onClick={onButtonClick}
					aria-label={buttonText}
					className={props.classes?.message}
					sx={{
						color: (theme) => theme.palette.text.secondary,
						background: (theme) => theme.palette.background.default,
						marginBottom: (theme) => theme.spacing(1),
						...sxs?.button
					}}
					children={buttonIcon}
				/>
			)}
		</Box>
	);
}

export default ErrorState;
