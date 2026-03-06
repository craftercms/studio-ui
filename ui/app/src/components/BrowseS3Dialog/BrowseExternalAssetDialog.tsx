/*
 * Copyright (C) 2007-2026 Crafter Software Corporation. All Rights Reserved.
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

import React, { useCallback, useState } from 'react';
import { EnhancedDialog, EnhancedDialogProps } from '../EnhancedDialog';
import { FormattedMessage, useIntl } from 'react-intl';
import ApiResponse from '../../models/ApiResponse';
import { MediaItem } from '../../models';
import LookupTable from '../../models/LookupTable';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import { list as listAws } from '../../services/aws';
import { list as listWebdav } from '../../services/webdav';
import { parseExternalItemToMediaItem } from './utils';
import { DialogBody } from '../DialogBody';
import Box from '@mui/material/Box';
import MediaCard, { MediaCardViewModes } from '../MediaCard';
import { EmptyState } from '../EmptyState';
import { DialogFooter } from '../DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import SearchBar from '../SearchBar';
import ListViewIcon from '@mui/icons-material/ViewStreamRounded';
import ReorderRoundedIcon from '@mui/icons-material/ReorderRounded';
import GridViewIcon from '@mui/icons-material/GridOnRounded';
import { getStoredBrowseDialogViewMode, setStoredBrowseDialogViewMode } from '../../utils/state';
import useActiveUser from '../../hooks/useActiveUser';
import { viewModes } from '../BrowseFilesDialog';
import { SimpleTreeView } from '@mui/x-tree-view';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import BrowseFilesDialogContainerSkeleton from '../BrowseFilesDialog/BrowseFilesDialogContainerSkeleton';
import useUpdateRefs from '../../hooks/useUpdateRefs';
import { nou } from '../../utils/object';
import Checkbox from '@mui/material/Checkbox';
import useEnv from '../../hooks/useEnv';

export interface BrowseExternalAssetDialogProps extends EnhancedDialogProps {
	path: string;
	profileId: string;
	profileType?: 'aws' | 'webdav';
	multiSelect?: boolean;
	type?: string;
	preselectedPaths?: string[];
	onSuccess?(items: MediaItem | MediaItem[]): void;
}

export interface BrowseExternalAssetDialogContainerProps extends Pick<
	BrowseExternalAssetDialogProps,
	'path' | 'profileId' | 'multiSelect' | 'type' | 'preselectedPaths' | 'onClose' | 'onSuccess' | 'profileType'
> {}

function BrowseExternalAssetDialogBody(props: BrowseExternalAssetDialogContainerProps) {
	const { path, profileId, multiSelect, preselectedPaths = [], profileType = 'aws', onClose, onSuccess } = props;
	const [isFetchingItems, setIsFetchingItems] = useState(false);
	const [error, setError] = useState<ApiResponse>(null);
	const [items, setItems] = useState<MediaItem[]>();
	const [foldersByPath, setFoldersByPath] = useState<LookupTable<MediaItem[]>>({});
	const [selectedCard, setSelectedCard] = useState<MediaItem>();
	const [selectedLookup, setSelectedLookup] = useState<LookupTable<MediaItem>>({});
	const selectedArray = Object.keys(selectedLookup).filter((key) => selectedLookup[key]);
	const allItemsSelected = items?.length && items.every((item) => selectedLookup[item.path]);
	const someItemsSelected = items?.length && items.some((item) => selectedLookup[item.path]) && !allItemsSelected;
	const siteId = useActiveSiteId();
	const { formatMessage } = useIntl();
	const { username } = useActiveUser();
	const [keyword, setKeyword] = useState('');
	const [viewMode, setViewMode] = useState<MediaCardViewModes>(getStoredBrowseDialogViewMode(username) ?? viewModes[0]);
	const filteredItems = items?.filter((item) => item.name.toLowerCase().includes(keyword.toLowerCase()));
	const [prevProfileId, setPrevProfileId] = useState(undefined);
	const refs = useUpdateRefs({ foldersByPath });
	const disableSubmit = isFetchingItems || (!selectedArray.length && !selectedCard);
	const { guestBase } = useEnv();

	const fetchItems = useCallback(
		(path) => {
			const fetchService = profileType === 'aws' ? listAws : listWebdav;

			setIsFetchingItems(true);
			fetchService(siteId, profileId, {
				path
			}).subscribe({
				next: (items) => {
					setIsFetchingItems(false);

					const folders = [];
					const files = [];
					items.forEach((item) => {
						if (item.folder) {
							folders.push(parseExternalItemToMediaItem(item));
						} else {
							files.push(parseExternalItemToMediaItem(item));
						}
					});
					setItems(files);

					if (multiSelect) {
						const preSelectedLookup = {};
						files.forEach((file) => {
							preSelectedLookup[file.path] = preselectedPaths.includes(file.path) ? file : null;
						});
						setSelectedLookup(preSelectedLookup);
					} else {
						const preSelectedFile = files.find((file) => preselectedPaths.includes(file.path));
						if (preSelectedFile) {
							setSelectedCard(preSelectedFile);
						}
					}

					if (nou(refs.current.foldersByPath?.[path])) {
						setFoldersByPath((prev) => ({ ...prev, [path]: folders }));
					}
				},
				error: (error) => {
					setIsFetchingItems(false);
					setError(error);
				}
			});
		},
		[profileId, siteId, refs, setSelectedLookup, setSelectedCard, multiSelect, preselectedPaths, profileType]
	);

	if (profileId !== prevProfileId) {
		setPrevProfileId(profileId);
		fetchItems(path);
	}

	const onCardSelected = (item: MediaItem) => {
		if (multiSelect) {
			setSelectedLookup((prev) => {
				const isSelected = !!prev[item.path];
				const updated = { ...prev };
				if (isSelected) {
					delete updated[item.path];
				} else {
					updated[item.path] = item;
				}
				return updated;
			});
		} else {
			setSelectedCard(selectedCard?.path === item.path ? null : item);
		}
	};

	const onSelectAll = () => {
		if (multiSelect) {
			const newSelectedLookup = { ...selectedLookup };
			items.forEach((item) => {
				newSelectedLookup[item.path] = allItemsSelected ? null : item;
			});
			setSelectedLookup(newSelectedLookup);
		}
	};

	function handleSearchKeyword(keyword: string) {
		setKeyword(keyword);
	}

	const onCloseButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onClose(e, null);

	const onRefresh = () => fetchItems(path);

	const switchViewMode = () => {
		const currentIndex = viewModes.indexOf(viewMode);
		let nextIndex;

		if (currentIndex === viewModes.length - 1) {
			nextIndex = 0;
		} else {
			nextIndex = currentIndex + 1;
		}
		setStoredBrowseDialogViewMode(username, viewModes[nextIndex]);
		setViewMode(viewModes[nextIndex]);
	};

	const onSelectButtonClick = () => {
		onSuccess?.(multiSelect ? Object.values(selectedLookup).filter(Boolean) : selectedCard);
	};

	return (
		<>
			<DialogBody sx={{ padding: 0 }}>
				<Box sx={{ display: 'flex', overflow: 'hidden', minHeight: '60vh' }}>
					<Box
						sx={{
							width: '270px',
							minWidth: '270px',
							padding: '16px',
							overflow: 'auto',
							rowGap: (theme) => theme.spacing(1)
						}}
					>
						<SimpleTreeView disableSelection>
							<ExternalAssetFoldersTreeView
								foldersByPath={foldersByPath}
								path={path}
								onFolderClick={(e, folderPath) => {
									e.stopPropagation();
									fetchItems(folderPath);
								}}
							/>
						</SimpleTreeView>
					</Box>
					{isFetchingItems ? (
						<BrowseFilesDialogContainerSkeleton />
					) : (
						<Box
							component="section"
							sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '16px', overflow: 'auto' }}
						>
							<>
								<Paper
									sx={{
										paddingLeft: (theme) => theme.spacing(1),
										marginBottom: (theme) => theme.spacing(3),
										borderRadius: 4
									}}
								>
									<Toolbar disableGutters variant="dense">
										<Box sx={{ flexGrow: 1, display: 'flex' }}>
											{multiSelect && (
												<>
													<Tooltip title={<FormattedMessage defaultMessage="Select All on this page" />}>
														<Checkbox
															checked={allItemsSelected}
															indeterminate={someItemsSelected}
															onChange={onSelectAll}
														/>
													</Tooltip>
													<Divider orientation="vertical" flexItem sx={{ marginTop: '-3px', marginBottom: '-3px' }} />
												</>
											)}
											<Tooltip title={<FormattedMessage defaultMessage="Refresh" />}>
												<IconButton
													onClick={onRefresh}
													aria-label={formatMessage({ id: 'word.refresh', defaultMessage: 'Refresh' })}
												>
													<RefreshIcon />
												</IconButton>
											</Tooltip>
											<Divider orientation="vertical" flexItem sx={{ marginTop: '-3px', marginBottom: '-3px' }} />
											<SearchBar
												keyword={keyword}
												onChange={handleSearchKeyword}
												showDecoratorIcon
												showActionButton={Boolean(keyword)}
												sxs={{
													root: {
														maxWidth: '200px',
														background: 'none !important',
														border: 'none !important',
														borderRadius: 0,
														boxShadow: 'none'
													},
													inputInput: { padding: '8px 5px' }
												}}
											/>
										</Box>
										<Box sx={{ display: 'flex', flexGrow: 0 }}>
											<IconButton
												onClick={switchViewMode}
												sx={{ mr: 1 }}
												aria-label={formatMessage({ defaultMessage: 'Switch view mode' })}
											>
												{viewMode === 'card' ? (
													<ListViewIcon />
												) : viewMode === 'compact' ? (
													<ReorderRoundedIcon />
												) : (
													<GridViewIcon />
												)}
											</IconButton>
										</Box>
									</Toolbar>
								</Paper>
								{filteredItems?.length ? (
									<Box
										sx={[
											{
												display: 'grid',
												gridTemplateColumns: 'repeat(auto-fit, minmax(200px, max-content))',
												gridGap: '16px',
												padding: 'initial'
											},
											viewMode === 'row' && { display: 'flex !important', flexFlow: 'wrap' }
										]}
									>
										{filteredItems.map((item: MediaItem) => (
											<MediaCard
												key={item.previewUrl}
												viewMode={viewMode}
												item={{ ...item, path: item.previewUrl }}
												previewAppBaseUri={guestBase}
												onClick={!multiSelect ? () => onCardSelected(item) : null}
												selected={multiSelect ? [...selectedArray] : []}
												onSelect={multiSelect ? () => onCardSelected(item) : null}
												onPreview={null}
												sxs={{
													root: {
														cursor: 'pointer',
														...(item.path === selectedCard?.path
															? {
																	boxShadow: (theme) => `0px 0px 4px 4px ${theme.palette.primary.main}`
																}
															: {})
													}
												}}
											/>
										))}
									</Box>
								) : (
									<EmptyState
										title={<FormattedMessage defaultMessage="No items found." />}
										sxs={{ root: { flexGrow: 1 } }}
									/>
								)}
							</>
						</Box>
					)}
				</Box>
			</DialogBody>
			<DialogFooter>
				<SecondaryButton onClick={onCloseButtonClick}>
					<FormattedMessage defaultMessage="Cancel" />
				</SecondaryButton>
				<PrimaryButton disabled={disableSubmit} onClick={onSelectButtonClick}>
					<FormattedMessage defaultMessage="Select" />
				</PrimaryButton>
			</DialogFooter>
		</>
	);
}

export function BrowseExternalAssetDialog(props: BrowseExternalAssetDialogProps) {
	const { path, profileId, onClose, onSuccess, multiSelect, preselectedPaths, profileType, ...rest } = props;

	return (
		<EnhancedDialog
			title={<FormattedMessage defaultMessage="Select an item" />}
			onClose={onClose}
			maxWidth="lg"
			{...rest}
		>
			<BrowseExternalAssetDialogBody
				path={path}
				profileId={profileId}
				multiSelect={multiSelect}
				preselectedPaths={preselectedPaths}
				profileType={profileType}
				onClose={onClose}
				onSuccess={onSuccess}
			/>
		</EnhancedDialog>
	);
}

function ExternalAssetFoldersTreeView({
	foldersByPath,
	path,
	folder,
	onFolderClick
}: {
	foldersByPath: LookupTable<MediaItem[]>;
	path?: string;
	folder?: MediaItem;
	onFolderClick(e, folderPath: string): void;
}) {
	const label = folder?.name ?? path ?? '/';
	return (
		<>
			<TreeItem itemId={path} label={<Box onClick={(e) => onFolderClick(e, path)}>{label}</Box>}>
				{foldersByPath[path]?.map((folder) => (
					<ExternalAssetFoldersTreeView
						foldersByPath={foldersByPath}
						path={folder.path}
						folder={folder}
						onFolderClick={onFolderClick}
					/>
				))}
			</TreeItem>
		</>
	);
}

export default BrowseExternalAssetDialog;
