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

import { ViewPackagesDialogProps } from './ViewPackagesDialog';
import React, { useEffect } from 'react';
import { fetchAffectedPackages } from '../../services/workflow';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { useSpreadState } from '../../hooks/useSpreadState';
import { useDispatch } from 'react-redux';
import { showPackageDetailsDialog } from '../../state/actions/dialogs';
import { ApiResponseErrorState } from '../ApiResponseErrorState';
import { LoadingState } from '../LoadingState';
import { EmptyState } from '../EmptyState';
import { FormattedMessage } from 'react-intl';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ListItemText from '@mui/material/ListItemText';
import DialogBody from '../DialogBody/DialogBody';
import DialogFooter from '../DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import ListItemButton from '@mui/material/ListItemButton';
import ItemDisplay from '../ItemDisplay';

export interface ViewPackagesDialogContainerProps
	extends Pick<ViewPackagesDialogProps, 'item' | 'onContinue' | 'onClose'> {}

export function ViewPackagesDialogContainer(props: ViewPackagesDialogContainerProps) {
	const { item, onContinue, onClose } = props;
	const siteId = useActiveSiteId();
	const dispatch = useDispatch();
	const [state, setState] = useSpreadState({
		packages: null,
		fetching: false,
		error: null
	});

	const onShowPackageDetails = (packageId: number) => {
		dispatch(showPackageDetailsDialog({ packageId }));
	};

	const onContinueClick = (e) => {
		onClose(e, null);
		onContinue();
	};

	useEffect(() => {
		setState({ fetching: true, error: null });
		fetchAffectedPackages(siteId, item.path).subscribe({
			next(packages) {
				setState({ packages, fetching: false });
			},
			error({ response }) {
				setState({ fetching: false, error: response.response });
			}
		});
	}, [siteId, item, setState]);

	return (
		<>
			{state.error ? (
				<ApiResponseErrorState error={state.error} />
			) : state.fetching ? (
				<LoadingState />
			) : state.packages?.length ? (
				<>
					<DialogBody>
						<Box sx={{ display: 'flex', mb: 2 }}>
							<Typography sx={{ mr: 1 }}>
								<FormattedMessage defaultMessage="Packages containing" />:
							</Typography>
							<ItemDisplay
								item={item}
								showPublishingTarget={false}
								showWorkflowState={false}
								showNavigableAsLinks={false}
							/>
						</Box>
						<List
							sx={(theme) => ({
								height: '100%',
								border: `1px solid ${theme.palette.divider}`,
								background: theme.palette.background.paper,
								padding: 0
							})}
						>
							{state.packages?.map((pkg) => (
								<ListItemButton key={pkg.id} onClick={() => onShowPackageDetails?.(pkg.id)}>
									<ListItemText
										primary={`${pkg.id} - ${pkg.title}`}
										secondary={pkg.submitterComment}
										secondaryTypographyProps={{ noWrap: true, title: pkg.title }}
									/>
									<Tooltip title={<FormattedMessage defaultMessage="View package details" />}>
										<IconButton onClick={() => onShowPackageDetails?.(pkg.id)}>
											<ChevronRightRoundedIcon />
										</IconButton>
									</Tooltip>
								</ListItemButton>
							))}
						</List>
					</DialogBody>
					{onContinue && (
						<DialogFooter>
							{onClose && (
								<SecondaryButton onClick={(e) => onClose(e, null)}>
									<FormattedMessage id="workflowCancellation.cancel" defaultMessage="Cancel" />
								</SecondaryButton>
							)}
							{onContinue && (
								<PrimaryButton onClick={onContinueClick} autoFocus>
									<FormattedMessage id="workflowCancellation.continue" defaultMessage="Continue" />
								</PrimaryButton>
							)}
						</DialogFooter>
					)}
				</>
			) : (
				<EmptyState title={<FormattedMessage defaultMessage="There are no packages in workflow." />} />
			)}
		</>
	);
}

export default ViewPackagesDialogContainer;
