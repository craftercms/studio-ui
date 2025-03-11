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

import { useSpreadState } from '../../hooks/useSpreadState';
import React, { SyntheticEvent, useEffect, useMemo, useState } from 'react';
import { PublishingTarget, PublishParams } from '../../models/Publishing';
import LookupTable from '../../models/LookupTable';
import { InternalDialogState, PublishDialogContainerProps, usePublishState } from './utils';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { useDispatch } from 'react-redux';
import { calculatePackage, publish } from '../../services/publishing';
import { FormattedMessage } from 'react-intl';
import { isBlank } from '../../utils/string';
import { updatePublishDialog } from '../../state/actions/dialogs';
import { ContentItem, LightItem } from '../../models';
import { createAtLeastHalfHourInFutureDate } from '../../utils/datetime';
import { batchActions } from '../../state/actions/misc';
import { showErrorDialog } from '../../state/reducers/dialogs/error';
import useUpdateRefs from '../../hooks/useUpdateRefs';
import DialogBody from '../DialogBody';
import { ApiResponseErrorState } from '../ApiResponseErrorState';
import { LoadingState } from '../LoadingState';
import Grid from '@mui/material/Grid2';
import Alert from '@mui/material/Alert';
import { Fade, Typography } from '@mui/material';
import { DateTimeTimezonePickerProps } from '../DateTimeTimezonePicker';
import { EmptyState } from '../EmptyState';
import DialogFooter from '../DialogFooter';
import SecondaryButton from '../SecondaryButton';
import PrimaryButton from '../PrimaryButton';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { createLookupTable } from '../../utils/object';
import PublishPackageItemsView from './PublishPackageItemsView';
import PublishReferencesLegend from './PublishReferencesLegend';
import { PublishDialogForm } from './PublishDialogForm';
import useActiveUser from '../../hooks/useActiveUser';

export type DependencyType = 'soft' | 'hard';
export type DependencyMap = Record<string, DependencyType>;
export type DependencyDataState = {
	paths: string[];
	typeByPath: DependencyMap;
	itemsByPath: LookupTable<LightItem>;
	items: LightItem[];
};

export function DependencyChip({ type }: { type: DependencyType }) {
	if (!type) return null;
	const isSoft = type === 'soft';
	return (
		<Chip
			size="small"
			variant="outlined"
			color={isSoft ? 'info' : 'warning'}
			label={isSoft ? <FormattedMessage defaultMessage="Optional" /> : <FormattedMessage defaultMessage="Required" />}
		/>
	);
}

export function PublishDialogContainer(props: PublishDialogContainerProps) {
	const { items: initialItems, scheduling = 'now', onSuccess, onClose, isSubmitting } = props;
	const siteId = useActiveSiteId();
	const { permissionsBySite } = useActiveUser();
	const dispatch = useDispatch();
	const [contentItems, setContentItems] = useState<ContentItem[]>();
	const [isFetchingItems, setIsFetchingItems] = useState(false);
	const [state, setState] = useSpreadState<InternalDialogState>({
		packageTitle: '',
		requestApproval: false,
		publishingTarget: null,
		submissionComment: '',
		scheduling,
		scheduledDateTime: createAtLeastHalfHourInFutureDate(),
		error: null,
		fetchingItems: false
	});
	const [mainItems, setMainItems] = useState<LightItem[]>(initialItems);
	const [published, setPublished] = useState<boolean>(null);
	const [publishingTargets, setPublishingTargets] = useState<PublishingTarget[]>(null);
	const {
		itemsDataSummary,
		dependencyData,
		setDependencyData,
		selectedDependenciesMap,
		setSelectedDependenciesMap,
		selectedDependenciesPaths,
		trees,
		parentTreeNodePaths,
		itemsAndDependenciesPaths,
		itemsAndDependenciesMap
	} = usePublishState({ mainItems });
	const effectRefs = useUpdateRefs({ initialItems, state });
	const hasPublishPermission = permissionsBySite[siteId].includes('publish_approve');
	const publishingTarget = useMemo(() => {
		let target: InternalDialogState['publishingTarget'] = '';
		if (mainItems) {
			if (mainItems.length === 0) {
				return target;
			}
			// If there aren't any available target (or they haven't loaded), dialog should not have a selected target.
			if (publishingTargets?.length && target === '') {
				// If we haven't found a target by this point, we wish to default the dialog to
				// staging (as long as that target is enabled in the system, which is checked next).
				target = publishingTargets.find((target) => target.name === 'staging')?.name ?? publishingTargets[0].name;
			}
		}

		return target;
	}, [publishingTargets, mainItems]);
	const isRequestPublish = !hasPublishPermission || state.requestApproval;
	const showRequestApproval = hasPublishPermission;
	const submitLabel =
		state.scheduling === 'custom' ? (
			<FormattedMessage id="words.schedule" defaultMessage="Schedule" />
		) : !hasPublishPermission || state.requestApproval ? (
			<FormattedMessage id="publishDialog.requestPublish" defaultMessage="Request Publish" />
		) : (
			<FormattedMessage id="words.publish" defaultMessage="Publish" />
		);
	const disabled = isSubmitting;

	// Submit button should be disabled when:
	const submitDisabled =
		// Detailed items haven't loaded
		isFetchingItems ||
		!contentItems ||
		// While submitting
		isSubmitting ||
		// If package title is blank
		isBlank(state.packageTitle) ||
		// If package comment is blank
		isBlank(state.submissionComment) ||
		// When there are no available/loaded publishing targets
		!publishingTargets?.length ||
		// When there are selected dependencies not applied.
		Boolean(selectedDependenciesPaths?.length) ||
		// When no publishing target is selected
		!state.publishingTarget ||
		// When there's an error
		Boolean(state.error) ||
		// The scheduled date is in the past
		state.scheduledDateTime < new Date();

	useEffect(() => {
		setState({ fetchingItems: true });
		if (state.publishingTarget) {
			calculatePackage(siteId, {
				publishingTarget: state.publishingTarget,
				paths: itemsDataSummary.itemPaths.map((path) => ({ path, includeChildren: false, includeSoftDeps: false })),
				commitIds: [] // TODO: there's a bug where the API fails if commitsIds is not provided. Needs to be fixed.
			}).subscribe({
				next(dependenciesByType) {
					const itemsList = [...dependenciesByType.hardDependencies, ...dependenciesByType.softDependencies];
					const depMap: DependencyMap = {};
					const depLookup: LookupTable<LightItem> = createLookupTable(itemsList, 'path');
					dependenciesByType.hardDependencies.forEach(({ path }) => {
						depMap[path] = 'hard';
					});
					dependenciesByType.softDependencies.forEach(({ path }) => {
						depMap[path] = 'soft';
					});
					setState({ fetchingItems: false });
					setDependencyData({
						typeByPath: depMap,
						paths: Object.keys(depMap),
						itemsByPath: depLookup,
						items: itemsList
					});
				},
				error() {
					setState({ fetchingItems: false });
					setDependencyData(null);
				}
			});
		}
	}, [
		itemsDataSummary.itemPaths,
		setState,
		siteId,
		setSelectedDependenciesMap,
		state.publishingTarget,
		setDependencyData
	]);

	useEffect(() => {
		scheduling !== effectRefs.current.state.scheduling && setState({ scheduling });
	}, [effectRefs, scheduling, setState]);

	useEffect(() => {
		const partialState: Partial<InternalDialogState> = {
			publishingTarget: publishingTarget || effectRefs.current.state.publishingTarget,
			scheduling: scheduling !== 'now' ? 'custom' : 'now'
		};
		setState(partialState);
	}, [setState, scheduling, effectRefs, publishingTarget]);

	useEffect(() => {
		setContentItems(effectRefs.current.initialItems);
	}, [effectRefs, itemsDataSummary, siteId, setState, dispatch]);

	const handleSubmit = (e?: SyntheticEvent) => {
		e?.preventDefault();

		const { publishingTarget, scheduling: schedule } = state;
		const { itemPaths, itemMap } = itemsDataSummary;
		const { requestApproval, packageTitle, submissionComment, scheduling, scheduledDateTime } = state;
		const data: PublishParams = {
			publishingTarget: state.publishingTarget,
			paths: itemPaths.map((path: string) => ({
				path,
				includeChildren: false,
				includeSoftDeps: false
			})),
			schedule: scheduling === 'custom' ? scheduledDateTime.toISOString() : null,
			requestApproval,
			title: packageTitle,
			comment: submissionComment
		};

		dispatch(updatePublishDialog({ isSubmitting: true }));

		publish(siteId, data).subscribe({
			next() {
				dispatch(updatePublishDialog({ isSubmitting: false, hasPendingChanges: false }));
				onSuccess?.({
					schedule: schedule,
					publishingTarget,
					// @ts-expect-error: TODO: Not quite sure if users of this dialog are making use of the `environment` prop name. Should remove (keep publishingTarget only).
					environment: publishingTarget,
					type: !hasPublishPermission || state.requestApproval ? 'submit' : 'publish',
					items: itemPaths.map((path) => itemMap[path])
				});
			},
			error({ response }) {
				dispatch(
					batchActions([updatePublishDialog({ isSubmitting: false }), showErrorDialog({ error: response.response })])
				);
			}
		});
	};

	const onPublishingArgumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let value: unknown;
		dispatch(updatePublishDialog({ hasPendingChanges: true }));
		switch (e.target.type) {
			case 'checkbox':
				value = e.target.checked;
				break;
			case 'text':
			case 'textarea':
			case 'radio':
			case 'dateTimePicker':
				value = e.target.value;
				break;
			default:
				console.error('Publishing argument change event ignored.');
				return;
		}
		setState({ [e.target.name]: value });
	};

	const onCloseButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => onClose(e, null);

	const onDependencyCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, checked: boolean, path: string) => {
		setSelectedDependenciesMap({ ...selectedDependenciesMap, [path]: checked });
	};

	const onApplyDependenciesChanges = () => {
		// Update the list of mainItems for the dependencies to be re-calculated. Also clear the current set of selected
		// dependencies.
		setMainItems([...mainItems, ...selectedDependenciesPaths.map((path) => dependencyData.itemsByPath[path])]);
		setSelectedDependenciesMap({});
	};

	const handleDateTimePickerChange: DateTimeTimezonePickerProps['onChange'] = (date) => {
		onPublishingArgumentChange({
			target: {
				name: 'scheduledDateTime',
				type: 'dateTimePicker',
				// @ts-expect-error: We're formating this as a change event so ignoring "Type 'Date' is not assignable to type 'string'".
				value: date
			}
		});
	};

	return (
		<>
			<DialogBody sx={{ px: 4, minHeight: 'calc(100vh * 0.5)' }}>
				{state.error ? (
					<ApiResponseErrorState error={state.error} />
				) : isFetchingItems ? (
					<LoadingState sx={{ flexGrow: 1 }} />
				) : contentItems ? (
					contentItems.length ? (
						<Grid container spacing={2} sx={{ flex: 1 }}>
							<Grid size={{ xs: 12, sm: 5 }}>
								<PublishDialogForm
									formState={state}
									onSubmit={handleSubmit}
									onInputChange={onPublishingArgumentChange}
									onDateTimePickerChange={handleDateTimePickerChange}
									showRequestApproval={showRequestApproval}
									isRequestPublish={isRequestPublish}
									disabled={disabled}
									onFetchedPublishedTargets={({ targets, published }) => {
										setPublished(published);
										setPublishingTargets(targets);
									}}
								/>
								<Divider />
								<PublishReferencesLegend />
							</Grid>
							<Grid size={{ xs: 12, sm: 7 }}>
								{published ? (
									<Paper
										elevation={1}
										sx={{
											bgcolor: (theme) =>
												theme.palette.mode === 'dark' ? theme.palette.background.default : 'background.paper',
											display: 'flex',
											flexDirection: 'column',
											height: '100%'
										}}
									>
										<PublishPackageItemsView
											itemMap={itemsAndDependenciesMap}
											defaultExpandedPaths={parentTreeNodePaths}
											itemsAndDependenciesPaths={itemsAndDependenciesPaths}
											dependencyTypeMap={dependencyData?.typeByPath}
											selectedDependenciesPaths={selectedDependenciesPaths}
											selectedDependenciesMap={selectedDependenciesMap}
											trees={trees}
											onCheckboxChange={onDependencyCheckboxChange}
										/>
										{Boolean(selectedDependenciesPaths.length) && (
											<Fade in={Boolean(selectedDependenciesPaths?.length)}>
												<Alert
													severity="info"
													action={
														<Button color="inherit" size="small" onClick={onApplyDependenciesChanges}>
															<FormattedMessage defaultMessage="Apply" />
														</Button>
													}
													sx={{ borderTopRightRadius: 0, borderTopLeftRadius: 0 }}
												>
													<FormattedMessage defaultMessage="Changes in the item selection must be applied" />
												</Alert>
											</Fade>
										)}
									</Paper>
								) : (
									<Alert severity="warning">
										<FormattedMessage
											id="publishDialog.firstPublish"
											defaultMessage="The entire project will be published since this is the first publish request"
										/>
									</Alert>
								)}
							</Grid>
						</Grid>
					) : (
						<EmptyState
							title={
								<FormattedMessage id="publishDialog.noItemsSelected" defaultMessage="No items have been selected" />
							}
						/>
					)
				) : (
					<Typography>
						<FormattedMessage defaultMessage="Nothing to display." />
					</Typography>
				)}
			</DialogBody>
			<DialogFooter>
				<SecondaryButton onClick={onCloseButtonClick} disabled={isSubmitting}>
					<FormattedMessage id="requestPublishDialog.cancel" defaultMessage="Cancel" />
				</SecondaryButton>
				<PrimaryButton onClick={handleSubmit} disabled={submitDisabled} loading={isSubmitting}>
					{submitLabel}
				</PrimaryButton>
			</DialogFooter>
		</>
	);
}

export default PublishDialogContainer;
