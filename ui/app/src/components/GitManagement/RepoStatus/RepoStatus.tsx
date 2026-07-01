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

import React, { useState } from 'react';
import RepoStatusSkeleton from './RepoStatusSkeleton';
import { RepositoryStatus } from '../../../models/Repository';
import RepoStatusUI from './RepoStatusUI';
import CommitResolutionDialog from '../../CommitResolutionDialog/CommitResolutionDialog';
import { bulkResolveConflict, cancelFailedPull, resolveConflict } from '../../../services/repositories';
import { useDispatch } from 'react-redux';
import { showSystemNotification } from '../../../state/actions/system';
import { FormattedMessage, useIntl } from 'react-intl';
import { useActiveSiteId } from '../../../hooks/useActiveSiteId';
import { messages } from './translations';
import { ConfirmDialog } from '../../ConfirmDialog';
import { createComponentId, pushErrorDialog } from '../../../utils/system';
import { popDialog, pushDialog } from '../../../state/actions/dialogStack';
import { nanoid } from 'nanoid';

export interface RepoStatusProps {
	status: RepositoryStatus;
	openConfirmDialog?: boolean;
	onCommitSuccess?(status: RepositoryStatus): void;
	onConflictResolved?(status: RepositoryStatus): void;
	onFailedPullCancelled?(status: RepositoryStatus): void;
	onRevertSuccess?(): void;
	onConfirmDialogOk?(): void;
	onConfirmDialogCancel?(): void;
}

export function RepoStatus(props: RepoStatusProps) {
	const {
		status,
		openConfirmDialog = false,
		onCommitSuccess: onCommitSuccessProp,
		onRevertSuccess,
		onFailedPullCancelled,
		onConflictResolved,
		onConfirmDialogOk
	} = props;
	const siteId = useActiveSiteId();
	const [openCommitResolutionDialog, setOpenCommitResolutionDialog] = useState(false);
	const dispatch = useDispatch();
	const [fetching, setFetching] = useState(false);
	const { formatMessage } = useIntl();
	const [diffDialogId] = useState(() => nanoid());

	if (!props.status || fetching) {
		return <RepoStatusSkeleton />;
	}

	const onRevertPull = () => {
		setFetching(true);
		cancelFailedPull(siteId).subscribe({
			next(status) {
				onFailedPullCancelled?.(status);
				setFetching(false);
				onRevertSuccess?.();
				dispatch(
					showSystemNotification({
						message: formatMessage(messages.revertPullSuccessMessage)
					})
				);
			},
			error({ response }) {
				dispatch(pushErrorDialog({ props: { error: response } }));
			}
		});
	};

	const onCommitSuccess = (status: RepositoryStatus) => {
		onCommitSuccessProp?.(status);
		setFetching(false);
		setOpenCommitResolutionDialog(false);
		dispatch(
			showSystemNotification({
				message: formatMessage(messages.commitSuccessMessage)
			})
		);
	};

	const onResolveConflictsSuccess = (status: RepositoryStatus) => {
		onConflictResolved?.(status);
		setFetching(false);
		dispatch(popDialog({ id: diffDialogId }));
	};

	const onResolveConflictsError = (response) => {
		dispatch(pushErrorDialog({ props: { error: response } }));
		setFetching(false);
	};

	const onResolveConflict = (resolution: string, path: string) => {
		setFetching(true);
		resolveConflict(siteId, path, resolution).subscribe({
			next(status) {
				onResolveConflictsSuccess(status);
			},
			error({ response }) {
				onResolveConflictsError(response);
			}
		});
	};

	const onBulkResolveConflict = (resolution: string) => {
		setFetching(true);
		bulkResolveConflict(siteId, status.conflicting, resolution).subscribe({
			next(status) {
				onResolveConflictsSuccess(status);
			},
			error({ response }) {
				onResolveConflictsError(response);
			}
		});
	};

	const onCommitError = (response) => {
		dispatch(pushErrorDialog({ props: { error: response } }));
	};

	const openDiffDialog = (path) => {
		dispatch(
			pushDialog({
				id: diffDialogId,
				component: createComponentId('ConflictedPathDiffDialog'),
				allowFullScreen: true,
				allowMinimize: true,
				props: {
					path,
					onResolveConflict: onResolveConflict
				}
			})
		);
	};

	const onBulkAction = (e, action) => {
		switch (action) {
			case 'acceptAll':
				onBulkResolveConflict('theirs');
				break;
			case 'keepAll':
				onBulkResolveConflict('ours');
				break;
			case 'revertAll':
				onRevertPull();
				break;
		}
	};

	return (
		<>
			<RepoStatusUI
				status={status}
				onCommitClick={() => setOpenCommitResolutionDialog(true)}
				onResolveConflict={onResolveConflict}
				onDiffClick={openDiffDialog}
				onBulkAction={onBulkAction}
			/>
			<CommitResolutionDialog
				open={openCommitResolutionDialog}
				onClose={() => setOpenCommitResolutionDialog(false)}
				onCommitRequestSent={() => setFetching(true)}
				onCommitSuccess={onCommitSuccess}
				onCommitError={onCommitError}
			/>
			<ConfirmDialog
				open={openConfirmDialog}
				body={<FormattedMessage defaultMessage="A resolution is required before continuing" />}
				okButtonText={<FormattedMessage defaultMessage="Stay and continue resolution" />}
				cancelButtonText={<FormattedMessage defaultMessage="Revert all and close" />}
				onOk={onConfirmDialogOk}
				onCancel={() => onRevertPull()}
			/>
		</>
	);
}

export default RepoStatus;
