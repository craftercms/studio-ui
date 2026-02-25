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

import { keyframes } from '@mui/material/styles';
import type { TItem } from './SortableList';
import List from '@mui/material/List';
import { ListItem } from '@mui/material';
import ListItemIcon from '@mui/material/ListItemIcon';
import DragIndicator from '@mui/icons-material/DragIndicatorRounded';
import ListItemText from '@mui/material/ListItemText';

const pulseKeyframe = keyframes`
  0% { opacity: 0.4; }
  50% { opacity: 1; }
  100% { opacity: 0.4; }
`;

export function SortableListSkeleton({ items }: { items: TItem[] }) {
	return (
		<List
			sx={{
				animation: `${pulseKeyframe} 2s ease-in-out 0.25s infinite`,
				cursor: 'wait',
				display: 'flex',
				flexDirection: 'column',
				gap: 0.5,
				px: 1
			}}
		>
			{items.map((item, index) => (
				<ListItem key={index}>
					<ListItemIcon>
						<DragIndicator fontSize="small" />
					</ListItemIcon>
					<ListItemText primary={item.value} />
				</ListItem>
			))}
		</List>
	);
}

export default SortableListSkeleton;
