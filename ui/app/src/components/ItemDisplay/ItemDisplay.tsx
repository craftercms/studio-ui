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

import * as React from 'react';
import { ElementType, forwardRef } from 'react';
import { DetailedItem, SandboxItem } from '../../models/Item';
import palette from '../../styles/palette';
import Typography, { TypographyProps } from '@mui/material/Typography';
import { isPreviewable } from '../PathNavigator/utils';
import ItemStateIcon, { ItemStateIconProps } from '../ItemStateIcon';
import ItemTypeIcon, { ItemTypeIconProps } from '../ItemTypeIcon';
import ItemPublishingTargetIcon, { ItemPublishingTargetIconProps } from '../ItemPublishingTargetIcon';
import { isInWorkflow } from './utils';
import Box from '@mui/material/Box';
import { PartialSxRecord } from '../../models';
import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';

export type ItemDisplayClassKey = 'root' | 'label' | 'labelPreviewable' | 'icon' | 'typeIcon';

export interface ItemDisplayProps<LabelTypographyComponent extends React.ElementType = 'span'>
	extends React.HTMLAttributes<HTMLSpanElement> {
	showPublishingTarget?: boolean;
	showWorkflowState?: boolean;
	showItemType?: boolean;
	showNavigableAsLinks?: boolean;
	classes?: Partial<Record<ItemDisplayClassKey, string>>;
	sxs?: PartialSxRecord<ItemDisplayClassKey>;
	item: DetailedItem | SandboxItem;
	labelTypographyProps?: TypographyProps<LabelTypographyComponent, { component?: LabelTypographyComponent }>;
	isNavigableFn?: (item: DetailedItem | SandboxItem) => boolean;
	labelComponent?: ElementType;
	labelDisplayProp?: 'label' | 'path' | 'previewUrl';
	titleDisplayProp?: 'label' | 'path' | 'previewUrl';
	stateIconProps?: Partial<ItemStateIconProps>;
	publishingTargetIconProps?: Partial<ItemPublishingTargetIconProps>;
	itemTypeIconProps?: Partial<ItemTypeIconProps>;
	sx?: SxProps<Theme>;
	component?: ElementType;
}

const ItemDisplay = forwardRef<HTMLSpanElement, ItemDisplayProps>((props, ref) => {
	// region const { ... } = props;
	const {
		item,
		// @see https://github.com/craftercms/craftercms/issues/5442
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		showPublishingTarget = true,
		showWorkflowState = true,
		showItemType = true,
		showNavigableAsLinks = true,
		isNavigableFn = isPreviewable,
		labelTypographyProps,
		labelComponent = 'span',
		labelDisplayProp = 'label',
		titleDisplayProp = 'label',
		stateIconProps,
		publishingTargetIconProps,
		itemTypeIconProps,
		component = 'span',
		classes,
		sxs,
		...rest
	} = props;
	// endregion
	if (!item) {
		// Prevents crashing if the item is nullish
		return null;
	}
	const inWorkflow = isInWorkflow(item.stateMap) || item.systemType === 'folder';
	return (
		<Box
			component="span"
			ref={ref}
			{...rest}
			className={[classes?.root, rest?.className].filter(Boolean).join(' ')}
			sx={{
				display: 'inline-flex',
				alignItems: 'center',
				placeContent: 'left center',
				maxWidth: '100%',
				...sxs?.root
			}}
		>
			{/* @see https://github.com/craftercms/craftercms/issues/5442 */}
			{inWorkflow
				? showWorkflowState && (
						<ItemStateIcon
							{...stateIconProps}
							item={item}
							className={[classes?.icon, stateIconProps?.className].filter(Boolean).join(' ')}
							sxs={{
								root: {
									fontSize: '1.1rem',
									...sxs?.icon
								}
							}}
						/>
					)
				: showPublishingTarget && (
						<ItemPublishingTargetIcon
							{...publishingTargetIconProps}
							item={item}
							className={[classes?.icon, publishingTargetIconProps?.className].filter(Boolean).join(' ')}
							sxs={{
								root: {
									fontSize: '1.1rem',
									...sxs?.icon
								}
							}}
						/>
					)}
			{showItemType && (
				<ItemTypeIcon
					{...itemTypeIconProps}
					item={item}
					className={[classes?.icon, itemTypeIconProps?.className].filter(Boolean).join(' ')}
					sx={{ fontSize: '1.1rem', ...sxs?.icon }}
				/>
			)}
			<Typography
				noWrap
				component={labelComponent}
				{...labelTypographyProps}
				className={[classes?.label, labelTypographyProps?.className].filter(Boolean).join(' ')}
				sx={{
					marginLeft: '2px',
					display: 'inline-block',
					color:
						showNavigableAsLinks && isNavigableFn(item)
							? (theme) => (theme.palette.mode === 'dark' ? palette.teal.tint : palette.teal.shade)
							: null,
					...sxs?.label
				}}
				title={item[titleDisplayProp]}
				children={item[labelDisplayProp]}
			/>
		</Box>
	);
});

export default ItemDisplay;
