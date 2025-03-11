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

import { useItemContext, useItemMetaContext, useStableGlobalApiContext } from '../lib/formsEngineContext';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import AddRounded from '@mui/icons-material/AddRounded';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import HelpOutline from '@mui/icons-material/HelpOutline';
import SearchRounded from '@mui/icons-material/SearchRounded';
import { FormsEngineField } from '../components/FormsEngineField';
import { ControlProps } from '../types';
import { MediaItem, Primitive } from '../../../models';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemButton from '@mui/material/ListItemButton';
import { FormattedMessage } from 'react-intl';
import LinkOffRoundedIcon from '@mui/icons-material/LinkOffRounded';
import Tooltip from '@mui/material/Tooltip';
import useContentTypes from '../../../hooks/useContentTypes';
import {
	lazy,
	MouseEvent as ReactMouseEvent,
	ReactNode,
	RefObject,
	Suspense,
	SyntheticEvent,
	useEffect,
	useMemo,
	useRef,
	useState
} from 'react';
import { BrowseFilesDialogProps } from '../../BrowseFilesDialog';
import Menu from '@mui/material/Menu';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import LookupTable from '../../../models/LookupTable';
import AllowedContentTypesData from '../../../models/AllowedContentTypesData';
import { asArray } from '../../../utils/array';
import ListItemIcon, { listItemIconClasses } from '@mui/material/ListItemIcon';
import TravelExploreOutlined from '@mui/icons-material/TravelExploreOutlined';
import { svgIconClasses } from '@mui/material/SvgIcon';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Grid from '@mui/material/Grid';
import ContentType from '../../../models/ContentType';
import { fetchLegacyContentTypes } from '../../../services/contentTypes';
import useActiveSiteId from '../../../hooks/useActiveSiteId';
import { forkJoin } from 'rxjs';
import Dialog from '@mui/material/Dialog';
import { DialogHeader } from '../../DialogHeader';
import { DialogFooter } from '../../DialogFooter';
import PrimaryButton from '../../PrimaryButton';
import SecondaryButton from '../../SecondaryButton';
import { DialogBody } from '../../DialogBody';
import Typography from '@mui/material/Typography';
import { useDispatch } from 'react-redux';
import { nanoid } from 'nanoid';
import useUpdateRefs from '../../../hooks/useUpdateRefs';
import { SearchProps } from '../../Search';
import useFetchContentItems from '../../../hooks/useFetchContentItems';
import useItemsByPath from '../../../hooks/useItemsByPath';
import ItemDisplay from '../../ItemDisplay';
import useActiveUser from '../../../hooks/useActiveUser';
import { processPathMacros } from '../../../utils/path';
import { ensureSingleSlash } from '../../../utils/string';
import { popDialog, pushDialog, pushNonDialog } from '../../../state/actions/dialogStack';
import FieldBox from '../components/FieldBox';
import { isTouchDevice, KeyDownEvent, sortableListKeyDownHandler } from '../lib/sortableListUtil';
import SortableListSkeleton from '../components/SortableListSkeleton';
import { EmptyState } from '../../EmptyState';
import { XmlKeys } from '../lib/formConsts';
import useConsolidatedItemPickerData, {
	ConsolidatedItemPickerData
} from '../dataSourceHooks/useConsolidatedItemPickerData';
import { useExtractItemPickerDataSources } from '../dataSourceHooks/useExtractItemPickerDataSources';
import { Dispatch as ReduxDispatch } from 'redux';

const SortableList = lazy(() => import('../components/SortableList'));
const TouchSortableList = lazy(() => import('../components/TouchSortableList'));

// TODO: process path macros

export interface NodeSelectorProps extends ControlProps {
	value: NodeSelectorItem[];
}

export interface NodeSelectorItem {
	key: string;
	value: string;
	include?: string;
	disableFlattening?: boolean;
	component?: Record<string, Primitive>;
}

export type DataSourcePickerType = 'search' | 'browse' | 'create';

export type AllowedContentTypesDataWithDestinations = AllowedContentTypesData & { createPaths?: string[] };

export interface AllowedPathsData {
	path: string;
	title: string;
	allowedContentTypes: string[];
}

type ContentCreationStrategy = 'embedded' | 'shared';

interface CreateDataSourcePickerData {
	path: string;
	strategy: ContentCreationStrategy;
	contentTypeId: string;
}

const oppositeStrategy: Record<ContentCreationStrategy, ContentCreationStrategy> = {
	embedded: 'shared',
	shared: 'embedded'
};

// Internal/private component
function CreateDataSourcePicker(props: {
	siteId: string;
	contentTypesLookup: LookupTable<ContentType>;
	allowedCreateTypes: LookupTable<AllowedContentTypesDataWithDestinations>;
	allowedCreatePaths: string[];
	onChange(e, choice: CreateDataSourcePickerData): void;
}) {
	const { siteId, allowedCreatePaths, contentTypesLookup, onChange } = props;
	const [allowedTypes, setAllowedTypes] = useState<string[]>();
	const [allowedCreateTypes, setAllowedCreateTypes] = useState<LookupTable<AllowedContentTypesDataWithDestinations>>(
		props.allowedCreateTypes
	);
	const [value, setValue] = useState<CreateDataSourcePickerData>(() => {
		for (const key in allowedCreateTypes) {
			return {
				path: allowedCreateTypes[key].createPaths?.[0] ?? '',
				strategy: allowedCreateTypes[key].embedded ? 'embedded' : 'shared',
				contentTypeId: key
			};
		}
		return null;
	});
	const refs = useUpdateRefs({ value, onChange });
	const [allowedStrategies, setAllowedStrategies] = useState({ embedded: false, shared: false });
	const handleTypeChange = (event: SyntheticEvent) => {
		const newValue = { ...value, contentTypeId: (event.target as HTMLInputElement).value };
		setValue(newValue);
		onChange?.(event, newValue);
	};
	const handleStrategyChange = (event: SyntheticEvent) => {
		const newValue = { ...value, strategy: (event.target as HTMLInputElement).value as ContentCreationStrategy };
		setValue(newValue);
		onChange?.(event, newValue);
	};
	const handlePathChange = (event: SyntheticEvent) => {
		const newValue = { ...value, path: (event.target as HTMLInputElement).value };
		setValue(newValue);
		onChange?.(event, newValue);
	};
	useEffect(() => {
		const allowedCreateTypes = props.allowedCreateTypes;
		if (allowedCreatePaths.length) {
			// Find out all the types that can be created on the allowed creation paths (coming from shared-content DS).
			const sub = forkJoin(allowedCreatePaths.map((path) => fetchLegacyContentTypes(siteId, path))).subscribe(
				(responses) => {
					const result = [
						...new Set(
							responses.flatMap((types) => types.map((type) => type.name)).concat(Object.keys(allowedCreateTypes))
						)
					];
					const allowedLookup = { ...allowedCreateTypes };
					result.forEach((contentTypeId) => {
						allowedLookup[contentTypeId] = { ...allowedLookup[contentTypeId] };
						allowedLookup[contentTypeId].shared = true;
					});
					setAllowedTypes(result);
					setAllowedCreateTypes(allowedLookup);
					const value: CreateDataSourcePickerData = {
						path: allowedLookup[result[0]].createPaths[0] ?? '',
						strategy: allowedLookup[result[0]].embedded ? 'embedded' : 'shared',
						contentTypeId: result[0]
					};
					setValue(value);
				}
			);
			return () => sub.unsubscribe();
		} else {
			const result = Object.keys(allowedCreateTypes);
			setAllowedTypes(result);
			const value: CreateDataSourcePickerData = {
				path: allowedCreateTypes[result[0]].createPaths[0] ?? '',
				strategy: allowedCreateTypes[result[0]].embedded ? 'embedded' : 'shared',
				contentTypeId: result[0]
			};
			setValue(value);
		}
	}, [allowedCreatePaths, props.allowedCreateTypes, refs, siteId]);
	useEffect(() => {
		if (value.contentTypeId) {
			const newValue: CreateDataSourcePickerData = { ...refs.current.value };
			const strategy = refs.current.value.strategy;
			if (!allowedCreateTypes[value.contentTypeId][strategy]) {
				newValue.strategy = oppositeStrategy[strategy];
			}
			newValue.path = allowedCreateTypes[value.contentTypeId].createPaths?.[0] ?? '';
			setValue(newValue);
			setAllowedStrategies({
				shared: allowedCreateTypes[value.contentTypeId].shared,
				embedded: allowedCreateTypes[value.contentTypeId].embedded
			});
		}
	}, [allowedCreateTypes, refs, value.contentTypeId]);
	useEffect(() => {
		refs.current.onChange?.(null, value);
	}, [refs, value]);
	return (
		<Grid container spacing={2} justifyContent="center">
			<Grid item sx={{ display: 'flex', flexDirection: 'column' }}>
				<FormControl>
					<FormLabel id="contentTypeLabel" sx={{ minHeight: 28, display: 'flex', alignItems: 'center' }}>
						<FormattedMessage defaultMessage="Content Type" />
					</FormLabel>
					<RadioGroup aria-labelledby="contentTypeLabel" name="contentType" value={value.contentTypeId}>
						{allowedTypes?.map((contentTypeId) => (
							<FormControlLabel
								key={contentTypeId}
								value={contentTypeId}
								control={<Radio />}
								label={contentTypesLookup[contentTypeId].name}
								onChange={handleTypeChange}
							/>
						))}
					</RadioGroup>
				</FormControl>
				{props.allowedCreateTypes[value.contentTypeId]?.createPaths?.length > 1 && (
					<FormControl sx={{ mt: 1 }}>
						<FormLabel>
							<FormattedMessage defaultMessage="Creation Path" />
						</FormLabel>
						<RadioGroup aria-labelledby="creationPathLabel" name="creationPath" value={value.path} sx={{}}>
							{props.allowedCreateTypes[value.contentTypeId].createPaths.map((path) => (
								<FormControlLabel
									key={path}
									value={path}
									control={<Radio />}
									onChange={handlePathChange}
									label={<Typography noWrap maxWidth="100%" component="div" title={path} children={path} />}
									disableTypography
								/>
							))}
						</RadioGroup>
					</FormControl>
				)}
			</Grid>
			<Grid item>
				<FormControl sx={{ mb: 1, shrink: 0 }}>
					<Box alignItems="center" display="flex">
						<FormLabel id="creationStrategyLabel">
							<FormattedMessage defaultMessage="Creation Strategy" />
						</FormLabel>
						<IconButton size="small" sx={{ ml: 1 }} color="primary" component="a" href="/studio" target="_blank">
							<HelpOutline fontSize="inherit" />
						</IconButton>
					</Box>
					<RadioGroup aria-labelledby="creationStrategyLabel" name="creationStrategy" value={value.strategy}>
						<FormControlLabel
							value="embedded"
							disabled={!allowedStrategies.embedded}
							control={<Radio onChange={handleStrategyChange} />}
							label={<FormattedMessage defaultMessage="Embedded" />}
						/>
						<FormControlLabel
							disabled={!allowedStrategies.shared}
							value="shared"
							control={<Radio onChange={handleStrategyChange} />}
							label={<FormattedMessage defaultMessage="Shared" />}
						/>
					</RadioGroup>
				</FormControl>
			</Grid>
		</Grid>
	);
}

// Internal/private component
function DataSourcePicker(props: { allowedPaths: AllowedPathsData[]; onChange(e, choice: AllowedPathsData): void }) {
	const { allowedPaths, onChange } = props;
	const handleChange = (event: SyntheticEvent) =>
		onChange?.(event, allowedPaths[(event.target as HTMLInputElement).value]);
	return (
		<FormControl>
			<FormLabel id="dataSourcePickerLabel">
				<FormattedMessage defaultMessage="Available Settings" />
			</FormLabel>
			<RadioGroup aria-labelledby="dataSourcePickerLabel" name="dataSourceConfig">
				{allowedPaths?.map((data, index) => (
					<FormControlLabel
						disableTypography
						key={index}
						value={index}
						control={<Radio />}
						label={
							<Box display="flex" flexDirection="column">
								<Typography component="span" children={data.title} />
								<Typography variant="body2" color="textSecondary" component="span" children={data.path} />
							</Box>
						}
						onChange={handleChange}
					/>
				))}
			</RadioGroup>
		</FormControl>
	);
}

const createAddMenuOptions = ({
	refs,
	readonly,
	itemPickerDataSourceData
}: {
	refs: RefObject<{
		handleDataSourceOptionClick(event: ReactMouseEvent<HTMLLIElement, MouseEvent>, option: DataSourcePickerType): void;
	}>;
	itemPickerDataSourceData: ConsolidatedItemPickerData;
	readonly: boolean;
}): ReactNode[] => {
	const { allowedCreateTypes, allowedBrowsePaths, allowedSearchPaths } = itemPickerDataSourceData;
	const createAllowed = Object.keys(allowedCreateTypes).length > 0;
	const menuOptions = [];

	if (allowedSearchPaths.length > 0) {
		menuOptions.push(
			<MenuItem
				key="search"
				disabled={readonly}
				onClick={(event) => refs.current.handleDataSourceOptionClick(event, 'search')}
			>
				<ListItemIcon sx={{ mr: 0 }}>
					<SearchRounded fontSize="small" />
				</ListItemIcon>
				<ListItemText children={<FormattedMessage defaultMessage="Search" />} />
			</MenuItem>
		);
	}
	if (allowedBrowsePaths.length > 0) {
		menuOptions.push(
			<MenuItem
				key="browse"
				disabled={readonly}
				onClick={(event) => refs.current.handleDataSourceOptionClick(event, 'browse')}
			>
				<ListItemIcon sx={{ mr: 0 }}>
					<TravelExploreOutlined fontSize="small" />
				</ListItemIcon>
				<ListItemText children={<FormattedMessage defaultMessage="Browse" />} />
			</MenuItem>
		);
	}
	if (createAllowed) {
		menuOptions.push(
			<MenuItem
				key="create"
				disabled={readonly}
				onClick={(event) => refs.current.handleDataSourceOptionClick(event, 'create')}
			>
				<ListItemIcon sx={{ mr: 0 }}>
					<AddRounded fontSize="small" />
				</ListItemIcon>
				<ListItemText children={<FormattedMessage defaultMessage="Create" />} />
			</MenuItem>
		);
	}

	return menuOptions;
};

const showBrowseFilesDialog = ({
	dispatch,
	onSuccess,
	path,
	contentTypes
}: {
	path: string;
	contentTypes: string[];
	dispatch: ReduxDispatch;
	onSuccess: BrowseFilesDialogProps['onSuccess'];
}): void => {
	const id = nanoid();
	dispatch(
		pushDialog({
			id,
			component: 'craftercms.components.BrowseFilesDialog',
			props: {
				path,
				multiSelect: true,
				allowUpload: false,
				contentTypes: contentTypes ?? [],
				onClose: () => dispatch(popDialog({ id })),
				onSuccess(items) {
					dispatch(popDialog({ id }));
					onSuccess(items);
				}
			} as Partial<BrowseFilesDialogProps>
		})
	);
};

const showSearchDialog = ({
	dispatch,
	path,
	contentTypes,
	onAcceptSelection
}: {
	path: string;
	contentTypes: string[];
	dispatch: ReduxDispatch;
	onAcceptSelection: SearchProps['onAcceptSelection'];
}): void => {
	const id = nanoid();
	dispatch(
		pushNonDialog({
			id,
			component: 'craftercms.components.Search',
			props: {
				mode: 'select',
				embedded: true,
				initialParameters: {
					path,
					sortBy: 'internalName',
					filters: { 'content-type': contentTypes }
				},
				onClose: () => dispatch(popDialog({ id })),
				onAcceptSelection(paths, items) {
					dispatch(popDialog({ id }));
					onAcceptSelection(paths, items);
				}
			} as Partial<SearchProps>
		})
	);
};

function NodeSelector(props: NodeSelectorProps) {
	const { field, contentType, value, setValue, readonly, autoFocus } = props;
	useFetchContentItems(value.flatMap((item) => item.include ?? []));
	const [sortMode, setSortMode] = useState(false);
	const useTouchSorting = useMemo(() => isTouchDevice(), []);
	const handleCancelReorder = () => setSortMode(false);
	const onReorder = () => setSortMode(true);
	const itemsByPath = useItemsByPath();
	const user = useActiveUser();
	const contextItem = useItemContext();
	const { id, pathInSite } = useItemMetaContext();
	const api = useStableGlobalApiContext();
	const hasContent = Boolean(value.length);
	const [addMenuOpen, setAddMenuOpen] = useState(false);
	const [pickerType, setPickerType] = useState<DataSourcePickerType>(null);
	const [pickerDialogOpen, setPickerDialogOpen] = useState(false);
	const [createPickerChoice, setCreatePickerChoice] = useState<CreateDataSourcePickerData>(null);
	const dispatch = useDispatch();
	const addMenuButtonRef = useRef<HTMLButtonElement>(undefined);
	const contentTypes = useContentTypes();
	const siteId = useActiveSiteId();
	const dataSourceSummary = useConsolidatedItemPickerData(useExtractItemPickerDataSources(contentType, field));
	const handleRemoveItem = (event: ReactMouseEvent, index: number) => {
		event.stopPropagation();
		const nextValue = value.concat();
		nextValue.splice(index, 1);
		setValue(nextValue);
	};
	const handleOpenItem = (event: { stopPropagation(): void }, index: number, edit: boolean = false) => {
		event.stopPropagation();
		const item: NodeSelectorItem = value[index];
		if (item.component || item.include) {
			const isEmbedded = Boolean(item.component);
			api.pushForm({
				readonly: !edit,
				update: {
					path: item.include ?? contextItem.path,
					// In the case of shared, item.component === undefined.
					// The form interprets as a shared when modelId and values are not supplied and fetches.
					modelId: item.component?.objectId as string | undefined,
					values: item.component
				},
				onSave({ values }) {
					const key = isEmbedded
						? ((values[XmlKeys.fileName] || values.objectId) as string)
						: // TODO: What if it was moved? i.e. changed its file-name/folder-name
							item.include;
					const newItem: NodeSelectorItem = {
						key,
						value: values[XmlKeys.internalName] as string,
						[isEmbedded ? 'component' : 'include']: isEmbedded ? (values as LookupTable<Primitive>) : key,
						disableFlattening: (field.properties.disableFlattening?.value as boolean) ?? false
					};
					const nextValue = value.concat();
					nextValue.splice(index, 1, newItem);
					setValue(nextValue);
					return Promise.resolve({ close: true });
				}
			});
		} else {
			// TODO: Handle files?
			console.log('Edit file requested', item);
		}
	};
	const handleItemKeyDown = (e: KeyDownEvent, index: number) => {
		sortableListKeyDownHandler(
			e,
			value,
			index,
			(newList) => setValue(newList),
			(index, edit) => handleOpenItem(e, index, edit && !readonly)
		);
	};
	const executeDataSourceOption = (
		optionType: DataSourcePickerType,
		choice: AllowedPathsData | CreateDataSourcePickerData
	) => {
		// TODO: Test cases with paths macros; ensure behaviour is consistent with FE1
		const processPath = (path: string) =>
			processPathMacros({ path, objectId: id, fullParentPath: contextItem?.path ?? pathInSite });
		switch (optionType) {
			case 'browse': {
				// Open browse dialog
				const pickerChoice = choice as AllowedPathsData;
				showBrowseFilesDialog({
					dispatch,
					path: processPath(pickerChoice.path),
					contentTypes: pickerChoice.allowedContentTypes,
					onSuccess(items: MediaItem | MediaItem[]) {
						const nextValue = value.concat();
						asArray(items).forEach((item) => {
							nextValue.push({
								key: item.path,
								value: item.name,
								include: item.path,
								disableFlattening: Boolean(field.properties?.disableFlattening?.value)
							});
						});
						setValue(nextValue);
					}
				});
				break;
			}
			case 'search': {
				// Open search dialog
				const pickerChoice = choice as AllowedPathsData;
				showSearchDialog({
					dispatch,
					path: ensureSingleSlash(`${processPath(pickerChoice.path)}/.+`),
					contentTypes: pickerChoice.allowedContentTypes,
					onAcceptSelection(paths, items) {
						const nextValue = value.concat();
						items?.forEach((item) => {
							nextValue.push({
								key: item.path,
								value: item.name,
								include: item.path,
								disableFlattening: Boolean(field.properties?.disableFlattening?.value)
							});
						});
						setValue(nextValue);
					}
				});
				break;
			}
			case 'create': {
				const pickerChoice = choice as CreateDataSourcePickerData;
				const isEmbedded = pickerChoice.strategy === 'embedded';
				const destinationPath = processPath(pickerChoice.path);
				// Push to form stack a new form in create mode with the selected content type
				api.pushForm({
					create: {
						contentTypeId: pickerChoice.contentTypeId,
						path: pickerChoice.strategy === 'embedded' ? contextItem.path : processPath(pickerChoice.path)
					},
					onSave(result) {
						const key = isEmbedded
							? ((result.values[XmlKeys.fileName] || result.values.objectId) as string)
							: ensureSingleSlash(`${destinationPath}/${result.values[XmlKeys.fileName]}`);
						const newItem: NodeSelectorItem = {
							key,
							value: result.values[XmlKeys.internalName] as string,
							[isEmbedded ? 'component' : 'include']: isEmbedded ? (result.values as LookupTable<Primitive>) : key,
							disableFlattening: (field.properties.disableFlattening?.value as boolean) ?? false
						};
						const nextValue = value.concat();
						nextValue.push(newItem);
						setValue(nextValue);
						return Promise.resolve({ close: true });
					}
				});
				break;
			}
		}
	};
	const handleCloseDataSourcePickerDialog = () => setPickerDialogOpen(false);
	const handleDataSourceOptionClick = (
		event: ReactMouseEvent<HTMLLIElement, MouseEvent>,
		option: DataSourcePickerType
	) => {
		setAddMenuOpen(false);
		switch (option) {
			case 'browse': {
				if (allowedBrowsePaths.length === 1) {
					executeDataSourceOption('browse', allowedBrowsePaths[0]);
				} else {
					// Open browse picker
					setPickerType('browse');
					setPickerDialogOpen(true);
				}
				break;
			}
			case 'search': {
				if (allowedSearchPaths.length === 1) {
					executeDataSourceOption('search', allowedSearchPaths[0]);
				} else {
					// Open search picker
					setPickerType('search');
					setPickerDialogOpen(true);
				}
				break;
			}
			case 'create': {
				const allowedCreateTypesIds = Object.keys(allowedCreateTypes);
				const contentTypeId = allowedCreateTypesIds[0];
				// If there's only one option, use that option, otherwise, will show the picker.
				if (
					// Only one content type is allowed
					allowedCreateTypesIds.length === 1 &&
					// Only one strategy is allowed
					[
						allowedCreateTypes[contentTypeId].shared,
						allowedCreateTypes[contentTypeId].embedded,
						allowedCreateTypes[contentTypeId].sharedExisting
					].filter(Boolean).length === 1 &&
					// When strategy is shared, only one destination path is allowed
					(!allowedCreateTypes[contentTypeId].shared || allowedCreateTypes[contentTypeId].createPaths.length === 1)
				) {
					const strategy = allowedCreateTypes[contentTypeId].embedded ? 'embedded' : 'shared';
					// Open create dialog
					executeDataSourceOption('create', {
						path: strategy === 'embedded' ? '' : allowedCreateTypes[contentTypeId].createPaths[0],
						strategy: strategy,
						contentTypeId
					});
				} else {
					// Open create picker
					setPickerType('create');
					setPickerDialogOpen(true);
				}
				break;
			}
		}
	};
	const handleDataSourcePickerDialogChange = (event, choice: AllowedPathsData | CreateDataSourcePickerData) => {
		switch (pickerType) {
			case 'search':
			case 'browse':
				executeDataSourceOption(pickerType, choice);
				setPickerDialogOpen(false);
				break;
			case 'create':
				setCreatePickerChoice(choice as CreateDataSourcePickerData);
				break;
		}
	};
	const handleDataSourcePickerDialogAccept = () => {
		setPickerDialogOpen(false);
		executeDataSourceOption('create', createPickerChoice);
	};
	const memoRefs = useUpdateRefs({ handleDataSourceOptionClick });
	const menuOptions = useMemo(
		() => createAddMenuOptions({ refs: memoRefs, itemPickerDataSourceData: dataSourceSummary, readonly }),
		[memoRefs, readonly, dataSourceSummary]
	);
	const { allowedCreateTypes, allowedCreatePaths, allowedBrowsePaths, allowedSearchPaths } = dataSourceSummary;
	const maxLimitReached = value.length >= field.validations.maxCount?.value;
	const isAddDisabled = readonly || maxLimitReached || !menuOptions.length;
	return (
		<>
			<Menu
				anchorEl={addMenuButtonRef.current}
				open={addMenuOpen}
				onClose={() => {
					setAddMenuOpen(false);
				}}
				children={menuOptions}
			/>
			<Dialog open={pickerDialogOpen} onClose={handleCloseDataSourcePickerDialog} fullWidth maxWidth="sm">
				<DialogHeader
					title={<FormattedMessage defaultMessage="Choose how to proceed" />}
					onCloseButtonClick={handleCloseDataSourcePickerDialog}
				/>
				<DialogBody>
					{
						{
							browse: (
								<DataSourcePicker allowedPaths={allowedBrowsePaths} onChange={handleDataSourcePickerDialogChange} />
							),
							search: (
								<DataSourcePicker allowedPaths={allowedSearchPaths} onChange={handleDataSourcePickerDialogChange} />
							),
							create: (
								<CreateDataSourcePicker
									siteId={siteId}
									allowedCreateTypes={allowedCreateTypes}
									allowedCreatePaths={allowedCreatePaths}
									contentTypesLookup={contentTypes}
									onChange={handleDataSourcePickerDialogChange}
								/>
							)
						}[pickerType]
					}
				</DialogBody>
				{pickerType === 'create' && (
					<DialogFooter>
						<SecondaryButton onClick={handleCloseDataSourcePickerDialog}>
							<FormattedMessage defaultMessage="Cancel" />
						</SecondaryButton>
						<PrimaryButton onClick={handleDataSourcePickerDialogAccept}>
							<FormattedMessage defaultMessage="Accept" />
						</PrimaryButton>
					</DialogFooter>
				)}
			</Dialog>
			<Dialog open={sortMode} onClose={handleCancelReorder} maxWidth="xs" fullWidth>
				<DialogHeader
					title={field.name}
					rightActions={[{ text: <FormattedMessage defaultMessage="Done" />, onClick: handleCancelReorder }]}
				/>
				{useTouchSorting ? (
					<TouchSortableList items={value} onChange={setValue} />
				) : (
					<Suspense
						fallback={<SortableListSkeleton items={value} />}
						children={<SortableList items={value} onChange={setValue} />}
					/>
				)}
			</Dialog>
			<FormsEngineField
				field={field}
				min={field.validations.minCount?.value}
				max={field.validations.maxCount?.value}
				length={value.length}
				action={
					<Tooltip
						title={
							isAddDisabled ? (
								maxLimitReached ? (
									<FormattedMessage defaultMessage="Maximum amount of items reached" />
								) : (
									''
								)
							) : (
								<FormattedMessage defaultMessage="Add items" />
							)
						}
					>
						<span>
							<IconButton
								autoFocus={autoFocus}
								ref={addMenuButtonRef}
								disabled={isAddDisabled}
								size="small"
								color="primary"
								onClick={() => {
									setAddMenuOpen(true);
								}}
							>
								<AddRounded fontSize="small" />
							</IconButton>
						</span>
					</Tooltip>
				}
				menuOptions={
					readonly ? undefined : [{ id: 'reorder', text: <FormattedMessage defaultMessage="Reorder Items" /> }]
				}
				onMenuOptionClick={(_, __, closeMenu) => {
					onReorder();
					closeMenu();
				}}
			>
				<FieldBox dashed={!hasContent}>
					{hasContent ? (
						<List dense>
							{value.map((item, index) => {
								const isEmbedded = Boolean(item.component);
								const Icon = isEmbedded ? DeleteOutlined : LinkOffRoundedIcon;
								const iconTooltip = isEmbedded ? (
									<FormattedMessage defaultMessage="Delete" />
								) : (
									<FormattedMessage defaultMessage="Unlink" />
								);
								const isComponent = item.include || item.component;
								const canBeEdited =
									isComponent &&
									(isEmbedded ||
										(itemsByPath[item.include]?.availableActionsMap.edit &&
											(itemsByPath[item.include]?.lockOwner == null ||
												user.username === itemsByPath[item.include]?.lockOwner.username)));
								return (
									<ListItemButton
										key={item.key}
										divider={index !== value.length - 1}
										onClick={(e) => handleOpenItem(e, index, false)}
										onKeyDown={(e) => handleItemKeyDown(e, index)}
									>
										<ListItemText
											primary={
												isEmbedded ? (
													<ItemDisplay
														item={{ ...contextItem, label: item.value, systemType: 'component' }}
														showNavigableAsLinks={false}
													/>
												) : itemsByPath[item.include] ? (
													<ItemDisplay item={itemsByPath[item.include]} showNavigableAsLinks={false} />
												) : (
													item.value
												)
											}
											secondary={
												isEmbedded ? (
													<em>
														<FormattedMessage defaultMessage="Embedded" />
													</em>
												) : (
													(item.include ?? item.key)
												)
											}
										/>
										{(canBeEdited || !readonly) && (
											<ListItemSecondaryAction sx={{ position: 'static', display: 'flex', transform: 'none' }}>
												{canBeEdited && (
													<Tooltip title="Edit">
														<IconButton size="small" onClick={(e) => handleOpenItem(e, index, !readonly)}>
															<EditOutlined fontSize="small" />
														</IconButton>
													</Tooltip>
												)}
												{!readonly && (
													<Tooltip title={iconTooltip}>
														<IconButton size="small" onClick={(e) => handleRemoveItem(e, index)}>
															<Icon fontSize="small" />
														</IconButton>
													</Tooltip>
												)}
											</ListItemSecondaryAction>
										)}
									</ListItemButton>
								);
							})}
						</List>
					) : (
						<Box
							children={
								menuOptions.length ? (
									menuOptions
								) : (
									<EmptyState
										key="emptyState"
										title={<FormattedMessage defaultMessage="No options are available for this control" />}
										subtitle={
											<FormattedMessage defaultMessage="Update the content type definition to add options to this control" />
										}
									/>
								)
							}
							sx={{
								p: 1,
								gap: 1,
								py: 0.5,
								display: 'flex',
								flexDirection: 'row',
								flexWrap: 'wrap',
								color: 'primary.main',
								justifyContent: 'center',
								[`.${svgIconClasses.root}`]: {
									color: 'primary.main'
								},
								[`.${menuItemClasses.root}`]: {
									flexDirection: 'column',
									justifyContent: 'center',
									borderRadius: 1
								},
								[`.${listItemIconClasses.root}`]: {
									justifyContent: 'center'
								}
							}}
						/>
					)}
				</FieldBox>
			</FormsEngineField>
		</>
	);
}

export default NodeSelector;
