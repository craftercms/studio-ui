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

import React, { useEffect, useMemo } from 'react';
import { addRemote } from '../../services/repositories';
import NewRemoteRepositoryDialogUI from './NewRemoteRepositoryDialogUI';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { useSpreadState } from '../../hooks/useSpreadState';
import { inputsInitialState, isFormValid, NewRemoteRepositoryDialogContainerProps } from './utils';
import useUpdateRefs from '../../hooks/useUpdateRefs';
import { useEnhancedDialogContext } from '../EnhancedDialog';

export function NewRemoteRepositoryDialogContainer(props: NewRemoteRepositoryDialogContainerProps) {
	const { onClose, onCreateSuccess, onCreateError, isSubmitting } = props;
	const siteId = useActiveSiteId();
	const [inputs, setInputs] = useSpreadState(inputsInitialState);
	const isValid = useMemo(() => isFormValid(inputs), [inputs]);
	const { updateSubmittingOrHasPendingChanges } = useEnhancedDialogContext();
	const functionRefs = useUpdateRefs({
		updateSubmittingOrHasPendingChanges
	});

	const createRemote = () => {
		setInputs({ submitted: true });
		if (isValid) {
			functionRefs.current.updateSubmittingOrHasPendingChanges({
				isSubmitting: true
			});
			addRemote({
				siteId,
				remoteName: inputs.remoteName,
				remoteUrl: inputs.remoteUrl,
				authenticationType: inputs.repoAuthentication,
				...(inputs.repoAuthentication === 'basic'
					? { remoteUsername: inputs.repoUsername, remotePassword: inputs.repoPassword }
					: inputs.repoAuthentication === 'token'
						? { remoteToken: inputs.repoToken }
						: inputs.repoAuthentication === 'private_key'
							? { remotePrivateKey: inputs.repoKey }
							: {})
			}).subscribe({
				next: () => {
					functionRefs.current.updateSubmittingOrHasPendingChanges({
						isSubmitting: false,
						hasPendingChanges: false
					});
					onCreateSuccess?.();
				},
				error: (e) => {
					functionRefs.current.updateSubmittingOrHasPendingChanges({
						isSubmitting: false
					});
					onCreateError?.(e);
				}
			});
		}
	};

	useEffect(() => {
		const { remoteName, remoteUrl, repoKey, repoPassword, repoToken, repoUsername } = inputs;
		updateSubmittingOrHasPendingChanges({
			hasPendingChanges: Boolean(remoteName || remoteUrl || repoKey || repoPassword || repoToken || repoUsername)
		});
	}, [inputs, updateSubmittingOrHasPendingChanges]);

	const onCloseButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onClose(e, null);

	return (
		<NewRemoteRepositoryDialogUI
			inputs={inputs}
			setInputs={setInputs}
			isValid={isValid}
			isSubmitting={isSubmitting}
			onCreate={createRemote}
			onCloseButtonClick={onCloseButtonClick}
		/>
	);
}

export default NewRemoteRepositoryDialogContainer;
