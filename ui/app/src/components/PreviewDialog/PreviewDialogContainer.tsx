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

import React, { useEffect, useState } from 'react';
import AsyncVideoPlayer from '../AsyncVideoPlayer/AsyncVideoPlayer';
import LoadingState, { ConditionalLoadingState } from '../LoadingState/LoadingState';
import IFrame from '../IFrame/IFrame';
import { nou } from '../../utils/object';
import AceEditor from '../AceEditor/AceEditor';
import { backgroundModes, PreviewDialogContainerProps } from './utils';
import DialogFooter from '../DialogFooter';
import SecondaryButton from '../SecondaryButton';
import { FormattedMessage } from 'react-intl';
import PrimaryButton from '../PrimaryButton';
import { DialogBody } from '../DialogBody';
import { useDispatch } from 'react-redux';
import { closePreviewDialog, showCodeEditorDialog } from '../../state/actions/dialogs';
import { batchActions } from '../../state/actions/misc';
import { hasEditAction, isBlobUrl } from '../../utils/content';
import { useSelection } from '../../hooks/useSelection';
import useItemsByPath from '../../hooks/useItemsByPath';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { fetchSandboxItem } from '../../state/actions/content';
import useItemsBeingFetchedByPath from '../../hooks/useItemsBeingFetchedByPath';
import palette from '../../styles/palette';

export function PreviewDialogContainer(props: PreviewDialogContainerProps) {
	const { title, content, mode, url, path, onClose, type, mimeType, backgroundModeIndex, showEdit = true } = props;
	const siteId = useActiveSiteId();
	const items = useItemsByPath();
	const itemsBeingFetchedByPath = useItemsBeingFetchedByPath();
	const item = items?.[path];
	const dispatch = useDispatch();
	const guestBase = useSelection<string>((state) => state.env.guestBase);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (type === 'editor' && path && !items[path] && !itemsBeingFetchedByPath[path]) {
			dispatch(fetchSandboxItem({ path }));
		}
	}, [siteId, items, path, type, dispatch, itemsBeingFetchedByPath]);

	const renderPreview = () => {
		switch (type) {
			case 'image':
				return <img src={url} alt="" />;
			case 'video':
				return (
					<AsyncVideoPlayer playerOptions={{ src: url, autoplay: true, ...(mimeType ? { type: mimeType } : {}) }} />
				);
			case 'page':
				return (
					<>
						{isLoading && <LoadingState />}
						<IFrame
							url={url}
							title={title}
							width={isLoading ? 0 : 960}
							height={isLoading ? 0 : 600}
							onLoadComplete={() => setIsLoading(false)}
						/>
					</>
				);
			case 'editor': {
				return (
					<ConditionalLoadingState isLoading={nou(content)}>
						<AceEditor
							value={content}
							sxs={{
								editorRoot: {
									position: 'absolute',
									backgroundColor: (theme) =>
										theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.grey['300'],
									'& .ace_gutter': {
										backgroundColor: (theme) => (theme.palette.mode === 'dark' ? theme.palette.background.paper : null)
									}
								}
							}}
							mode={`ace/mode/${mode}`}
							readOnly
							highlightActiveLine={false}
							highlightGutterLine={false}
							highlightSelectedWord={false}
						/>
					</ConditionalLoadingState>
				);
			}
			case 'pdf': {
				return <IFrame url={isBlobUrl(url) ? url : `${guestBase}${url}`} title={title} width="100%" height="100vh" />;
			}
			case 'audio': {
				return (
					<audio controls autoPlay>
						<source src={url} type={mimeType} />
					</audio>
				);
			}
			default:
				break;
		}
	};

	const onEdit = () => {
		dispatch(
			batchActions([
				closePreviewDialog(),
				showCodeEditorDialog({
					path: url,
					mode
				})
			])
		);
	};

	return (
		<>
			<DialogBody
				sx={(theme) => {
					let backgroundStyles;
					switch (backgroundModes[backgroundModeIndex]?.mode) {
						case 'squaredLight':
							backgroundStyles = {
								backgroundSize: '30px 30px',
								backgroundColor: theme.palette.common.white,
								backgroundPosition: '0px 0px, 0px 15px, 15px -15px, -15px 0px',
								backgroundImage: `linear-gradient(45deg, ${theme.palette.grey[200]} 25%, transparent 25%), linear-gradient(-45deg, ${theme.palette.grey[200]} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${theme.palette.grey[200]} 75%), linear-gradient(-45deg, transparent 75%, ${theme.palette.grey[200]} 75%)`
							};
							break;
						case 'squaredDark':
							backgroundStyles = {
								backgroundSize: '30px 30px',
								backgroundColor: theme.palette.common.black,
								backgroundPosition: '0px 0px, 0px 15px, 15px -15px, -15px 0px',
								backgroundImage: `linear-gradient(45deg, ${palette.gray.dark4} 25%, transparent 25%), linear-gradient(-45deg, ${palette.gray.dark4} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${palette.gray.dark4} 75%), linear-gradient(-45deg, transparent 75%, ${palette.gray.dark4} 75%)`
							};
							break;
						case 'inverse':
							backgroundStyles = {
								backgroundColor: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black
							};
							break;
						default:
							backgroundStyles = {};
							break;
					}

					return {
						padding: 0,
						height: '100%',
						display: 'flex',
						maxWidth: '100%',
						minWidth: '500px',
						minHeight: '60vh',
						position: 'relative',
						justifyContent: 'center',
						alignItems: 'center',
						'& img': {
							maxWidth: '100%'
						},
						...backgroundStyles
					};
				}}
			>
				{renderPreview()}
			</DialogBody>
			{type === 'editor' && (
				<DialogFooter>
					<SecondaryButton onClick={(e) => onClose(e, null)}>
						<FormattedMessage id="words.close" defaultMessage="Close" />
					</SecondaryButton>
					{showEdit && item && hasEditAction(item.availableActions) && (
						<PrimaryButton sx={{ marginLeft: '15px' }} onClick={onEdit}>
							<FormattedMessage id="words.edit" defaultMessage="Edit" />
						</PrimaryButton>
					)}
				</DialogFooter>
			)}
		</>
	);
}
