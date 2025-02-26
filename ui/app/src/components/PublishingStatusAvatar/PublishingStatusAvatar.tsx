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

import Avatar from '@mui/material/Avatar';
import CloudUploadOutlined from '@mui/icons-material/CloudUploadOutlined';
import * as React from 'react';
import { PublishingStatus } from '../../models/Publishing';
import { getPublishingStatusCodeColor } from './util';
import { PartialSxRecord } from '../../models';
import { SxProps } from '@mui/system';
import { Theme } from '@mui/material';
import { SystemStyleObject } from '@mui/system/styleFunctionSx/styleFunctionSx';

export type PublishingStatusAvatarClassKey = 'root' | 'icon';

export interface PublishingStatusAvatarProps extends Pick<PublishingStatus, 'enabled'> {
	status: string;
	className?: string;
	classes?: Partial<Record<PublishingStatusAvatarClassKey, string>>;
	sx?: SxProps<Theme>;
	sxs?: PartialSxRecord<PublishingStatusAvatarClassKey>;
	variant?: 'background' | 'icon';
}

const targets: { [prop in PublishingStatusAvatarProps['variant']]: 'backgroundColor' | 'color' } = {
	background: 'backgroundColor',
	icon: 'color'
};

export const PublishingStatusAvatar = React.forwardRef<HTMLDivElement, PublishingStatusAvatarProps>((props, ref) => {
	const { status, enabled, variant = 'icon', sx, sxs } = props;
	const stylingTarget = targets[variant] ?? 'backgroundColor';

	return (
		<Avatar
			ref={ref}
			variant="circular"
			className={[props.className, enabled ? status : enabled === false ? 'stopped' : '', props.classes?.root].join(
				' '
			)}
			sx={(theme) => ({
				...(stylingTarget === 'color' && {
					background: 'none',
					color: theme.palette.text.secondary
				}),
				'&.ready': {
					[stylingTarget]: getPublishingStatusCodeColor('ready', theme)
				},
				'&.publishing': {
					[stylingTarget]: getPublishingStatusCodeColor('publishing', theme)
				},
				'&.stopped': {
					[stylingTarget]: getPublishingStatusCodeColor('stopped', theme)
				},
				...(sx as SystemStyleObject<Theme>),
				...(sxs?.root as SystemStyleObject<Theme>)
			})}
		>
			<CloudUploadOutlined className={props.classes?.icon} sx={sxs?.icon} />
		</Avatar>
	);
});

export default PublishingStatusAvatar;
