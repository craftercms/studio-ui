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

import React from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { FormattedMessage } from 'react-intl';
import Button from '@mui/material/Button';
import ListRoundedIcon from '@mui/icons-material/ListRounded';
import TreeOutlined from '../../icons/TreeOutlined';
import { buttonClasses } from '@mui/material';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import UnfoldMoreRoundedIcon from '@mui/icons-material/UnfoldMoreRounded';
import UnfoldLessRoundedIcon from '@mui/icons-material/UnfoldLessRounded';

export interface PackageItemsActionsProps {
	isTreeView: boolean;
	onSetIsTreeView(value: boolean): void;
	setExpandedPaths(value: string[] | undefined): void;
	disableTreeView: boolean;
	maxTreeItems: number;
}

export function PackageItemsActions(props: PackageItemsActionsProps) {
	const { isTreeView, onSetIsTreeView, disableTreeView, maxTreeItems, setExpandedPaths } = props;
	return (
		<Box display="flex" justifyContent="space-between" alignItems="center" mr={1} ml={1}>
			<Box display="flex" py={0.5}>
				<Tooltip
					title={
						disableTreeView ? (
							<FormattedMessage
								defaultMessage="Tree view is disabled for packages with more than {maxTreeItems} items due to performance considerations."
								values={{
									maxTreeItems
								}}
							/>
						) : (
							''
						)
					}
				>
					<Box component="span">
						<Button
							size="small"
							startIcon={!disableTreeView && isTreeView ? <ListRoundedIcon /> : <TreeOutlined />}
							sx={{ [`.${buttonClasses.startIcon}`]: { mr: 0.5 } }}
							onClick={() => onSetIsTreeView(!isTreeView)}
							disabled={disableTreeView}
						>
							{!disableTreeView && isTreeView ? (
								<FormattedMessage defaultMessage="List View" />
							) : (
								<FormattedMessage defaultMessage="Tree View" />
							)}
						</Button>
					</Box>
				</Tooltip>
				{!disableTreeView && isTreeView && (
					<>
						<Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />
						<IconButton size="small" color="primary" onClick={() => setExpandedPaths(undefined)}>
							<UnfoldMoreRoundedIcon fontSize="small" />
						</IconButton>
						<IconButton size="small" color="primary" onClick={() => setExpandedPaths([])}>
							<UnfoldLessRoundedIcon fontSize="small" />
						</IconButton>
					</>
				)}
			</Box>
		</Box>
	);
}

export default PackageItemsActions;
