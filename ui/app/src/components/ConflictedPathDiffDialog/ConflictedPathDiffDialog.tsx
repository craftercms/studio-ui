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
import Dialog from '@mui/material/Dialog';
import DialogHeader from '../DialogHeader';
import DialogBody from '../DialogBody/DialogBody';
import DialogFooter from '../DialogFooter/DialogFooter';
import { FormattedMessage, useIntl } from 'react-intl';
import { diffConflictedFile } from '../../services/repositories';
import ApiResponse from '../../models/ApiResponse';
import { FileDiff } from '../../models/Repository';
import ConflictedPathDiffDialogUI from './ConflictedPathDiffDialogUI';
import SecondaryButton from '../SecondaryButton';
import ConfirmDropdown from '../ConfirmDropdown';
import { messages } from '../GitManagement/RepoStatus/translations';

import Tab, { tabClasses } from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { ApiResponseErrorState } from '../ApiResponseErrorState';
import { LoadingState } from '../LoadingState';

export interface RemoteRepositoriesDiffDialogProps {
	open: boolean;
	path: string;
	onResolveConflict(strategy: string, path: string): void;
	onClose(): void;
}

export function ConflictedPathDiffDialog(props: RemoteRepositoriesDiffDialogProps) {
	const { open, path, onResolveConflict, onClose } = props;
	const siteId = useActiveSiteId();
	const [tab, setTab] = useState(0);
	const [fileDiff, setFileDiff] = useState<FileDiff>(null);
	const [fetching, setFetching] = useState(false);
	const [error, setError] = useState<ApiResponse>();
	const { formatMessage } = useIntl();

	useEffect(() => {
		if (path) {
			setFetching(true);
			diffConflictedFile(siteId, path).subscribe({
				next(fileDiff) {
					setFileDiff(fileDiff);
					setFetching(false);
				},
				error({ response }) {
					setError(response);
					setFetching(false);
				}
			});
		}
	}, [path, siteId]);

	const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
		setTab(newValue);
	};

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
			<DialogHeader
				title={
					<>
						<FormattedMessage id="words.diff" defaultMessage="Diff" />: {path}
					</>
				}
				onCloseButtonClick={onClose}
				sxs={{
					root: {
						paddingBottom: 0
					},
					subtitleWrapper: {
						padding: 0
					}
				}}
			>
				<Tabs
					value={tab}
					indicatorColor="primary"
					textColor="primary"
					onChange={handleTabChange}
					sx={{
						minHeight: 'inherit',
						[`& .${tabClasses.root}`]: {
							minWidth: '80px',
							minHeight: '0',
							padding: '0 0 5px 0',
							marginRight: '20px',
							opacity: 1,
							'& span': {
								textTransform: 'none'
							}
						}
					}}
				>
					<Tab label={<FormattedMessage id="words.diff" defaultMessage="Diff" />} />
					<Tab label={<FormattedMessage id="repositories.splitView" defaultMessage="Split View" />} />
				</Tabs>
			</DialogHeader>
			<DialogBody sx={{ padding: 0 }}>
				{error ? (
					<ApiResponseErrorState error={error} />
				) : fetching ? (
					<LoadingState />
				) : fileDiff ? (
					<ConflictedPathDiffDialogUI fileDiff={fileDiff} tab={tab} />
				) : null}
			</DialogBody>
			<DialogFooter>
				<SecondaryButton onClick={onClose}>
					<FormattedMessage id="words.close" defaultMessage="Close" />
				</SecondaryButton>
				<ConfirmDropdown
					sx={{
						button: {
							color: (theme) => theme.palette.warning.dark,
							borderColor: (theme) => theme.palette.warning.main
						}
					}}
					text={formatMessage(messages.acceptRemote)}
					cancelText={formatMessage(messages.no)}
					confirmText={formatMessage(messages.yes)}
					confirmHelperText={formatMessage(messages.acceptRemoteHelper)}
					onConfirm={() => onResolveConflict('theirs', path)}
				/>
				<ConfirmDropdown
					sx={{
						button: {
							color: (theme) => theme.palette.warning.dark,
							borderColor: (theme) => theme.palette.warning.main
						}
					}}
					text={formatMessage(messages.keepLocal)}
					cancelText={formatMessage(messages.no)}
					confirmText={formatMessage(messages.yes)}
					confirmHelperText={formatMessage(messages.keepLocalHelper)}
					onConfirm={() => onResolveConflict('ours', path)}
				/>
			</DialogFooter>
		</Dialog>
	);
}

export default ConflictedPathDiffDialog;
