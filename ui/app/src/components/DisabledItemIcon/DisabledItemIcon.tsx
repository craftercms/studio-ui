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

import { ItemDisplayProps } from '../ItemDisplay';
import { getItemTypeText } from '../ItemTypeIcon';
import Tooltip from '@mui/material/Tooltip';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import ComponentIconSolid from '@mui/icons-material/Extension';
import PageIconSolid from '@mui/icons-material/InsertDriveFile';
import TaxonomyIconSolid from '@mui/icons-material/LocalOffer';
import LevelDescriptorIcon from '../../icons/LevelDescriptor';
import UnknownStateIcon from '@mui/icons-material/HelpOutlineRounded';
import Box from '@mui/material/Box';

export interface DisabledItemIconProps {
	item: ItemDisplayProps['item'];
	itemTypeIconProps: ItemDisplayProps['itemTypeIconProps'];
	sxs?: ItemDisplayProps['sxs'];
	classes?: ItemDisplayProps['classes'];
}

export function DisabledItemIcon(props: DisabledItemIconProps) {
	const { item, itemTypeIconProps, sxs, classes } = props;
	const { formatMessage } = useIntl();

	let DisabledTypeIcon = UnknownStateIcon;
	switch (item.systemType) {
		case 'component':
			DisabledTypeIcon = ComponentIconSolid;
			break;
		case 'page':
			DisabledTypeIcon = PageIconSolid;
			break;
		case 'taxonomy':
			DisabledTypeIcon = TaxonomyIconSolid;
			break;
		case 'levelDescriptor':
			DisabledTypeIcon = LevelDescriptorIcon;
			break;
	}

	return (
		<Tooltip
			title={
				<>
					<FormattedMessage defaultMessage="Disabled" /> {getItemTypeText(item, formatMessage)}
				</>
			}
		>
			<Box component="span" sx={{ display: 'flex', position: 'relative' }}>
				<DisabledTypeIcon
					{...itemTypeIconProps}
					className={[classes?.icon, itemTypeIconProps?.className].filter(Boolean).join(' ')}
					aria-label={getItemTypeText(item, formatMessage)}
					aria-hidden={false}
					sx={{
						fontSize: '1.1rem',
						position: 'absolute',
						top: '-5px',
						left: '-3px',
						padding: '3px',
						...sxs?.icon
					}}
				/>
				<BlockRoundedIcon
					className={[classes?.icon, itemTypeIconProps?.className].filter(Boolean).join(' ')}
					aria-label={formatMessage({ defaultMessage: 'Disabled' })}
					aria-hidden={false}
					sx={{
						fontSize: '1.1rem',
						color: (theme) => theme.palette.error.main,
						...sxs?.icon
					}}
				/>
			</Box>
		</Tooltip>
	);
}

export default DisabledItemIcon;
