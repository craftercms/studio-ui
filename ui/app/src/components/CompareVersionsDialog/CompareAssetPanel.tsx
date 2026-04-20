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

import React, { ReactNode, useMemo } from 'react';
import { isImage } from '../PathNavigator/utils';
import TextDiffView from './FieldsTypesDiffViews/TextDiffView';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ImageView from '../ViewVersionDialog/FieldTypesViews/ImageView';
import VideoView from '../ViewVersionDialog/FieldTypesViews/VideoView';
import { PDFView } from '../ViewVersionDialog/AssetTypesViews/PDFView';
import { ContentItem } from '../../models';
import { FormattedMessage } from 'react-intl';
import { isPdfDocument, isVideo } from '../../utils/content';

const typesDiffMap = {
	image: ImageView,
	video: VideoView,
	text: TextDiffView,
	pdf: PDFView
};

export interface AssetDiffViewProps {
	aContent?: string;
	bContent?: string;
	type: 'image' | 'video' | 'pdf' | 'text';
	renderContent: (xml: string) => ReactNode;
	noContent?: ReactNode;
}

function AssetDiffView(props: AssetDiffViewProps) {
	const {
		aContent,
		bContent,
		type,
		renderContent,
		noContent = (
			<Box>
				<Typography color="textSecondary">
					<FormattedMessage defaultMessage="No content set" />
				</Typography>
			</Box>
		)
	} = props;
	const verticalLayout = type === 'image' || type === 'video';
	return (
		<Box
			sx={{
				display: 'flex',
				height: '100%',
				p: 2,
				alignItems: verticalLayout ? 'center' : 'flex-start',
				justifyContent: 'space-around',
				flexDirection: verticalLayout ? 'column' : 'row',
				'> div': {
					flexGrow: verticalLayout && 1
				}
			}}
		>
			{aContent ? renderContent(aContent) : noContent}
			{verticalLayout && <Divider sx={{ width: '100%', mt: 1, mb: 1 }} />}
			{bContent ? renderContent(bContent) : noContent}
		</Box>
	);
}

export interface CompareAssetPanelProps {
	a: AssetDiffViewProps['aContent'];
	b: AssetDiffViewProps['bContent'];
	item: ContentItem;
}

export function CompareAssetPanel(props: CompareAssetPanelProps) {
	const { a, b, item } = props;
	const assetType = useMemo(() => {
		if (isImage(item)) {
			return 'image';
		} else if (isVideo(item)) {
			return 'video';
		} else if (isPdfDocument(item.mimeType)) {
			return 'pdf';
		} else {
			return 'text';
		}
	}, [item]);
	const ViewComponent = typesDiffMap[assetType];
	const isVerticalLayout = assetType === 'image' || assetType === 'video';
	const viewComponentProps = {
		...(isVerticalLayout ? { sxs: { image: { maxHeight: '100%' } } } : {})
	};

	if (assetType === 'text') {
		return <TextDiffView aXml={a} bXml={b} />;
	} else {
		return (
			<AssetDiffView
				aContent={a}
				bContent={b}
				type={assetType}
				renderContent={(content) => (
					<Box sx={{ height: isVerticalLayout ? 'calc(50% - 9px)' : '100%', width: '50%', textAlign: 'center' }}>
						<ViewComponent content={content} {...viewComponentProps} />
					</Box>
				)}
			/>
		);
	}
}

export default CompareAssetPanel;
