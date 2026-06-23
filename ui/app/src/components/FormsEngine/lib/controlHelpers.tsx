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

import { ControlProps } from '../types';
import Alert from '@mui/material/Alert';
import { FormattedMessage } from 'react-intl';
import React, {
	ComponentType,
	ElementType,
	lazy,
	LazyExoticComponent,
	memo,
	MouseEvent as ReactMouseEvent,
	Suspense
} from 'react';
import useActiveSiteId from '../../../hooks/useActiveSiteId';
import { Atom, useAtom } from 'jotai/index';
import { buildFileUrl } from '../../../services/plugin';
import { controlMap } from './controlMap';
import { UnknownControl } from '../components/UnknownControl';
import ErrorBoundary from '../../ErrorBoundary';
import { ControlSkeleton } from '../components/ControlSkeleton';
import { ContentTypeField } from '../../../models';
import ContentType from '../../../models/ContentType';
import FormsEngineField from '../components/FormsEngineField';
import { FormsEngineAtoms } from './formsEngineContext';
import type { ConsolidatedMediaPickerData } from '../dataSourceHooks/useConsolidatedImagePickerData';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import TravelExploreOutlined from '@mui/icons-material/TravelExploreOutlined';
import SearchRounded from '@mui/icons-material/SearchRounded';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import { getFileNameFromPath } from '../../../utils/path';
import { ensureSingleSlash } from '../../../utils/string';
import { Dispatch as ReduxDispatch } from 'redux';
import { BrowseFilesDialogProps } from '../../BrowseFilesDialog';
import { nanoid } from 'nanoid';
import { popDialog, pushDialog, pushNonDialog } from '../../../state/actions/dialogStack';
import { createComponentId } from '../../../utils/system';
import { SearchProps } from '../../Search';
import type { ImageRestrictions } from '../../ImageEditorDialog/types';
import type { SingleFileUploadDialogProps } from '../../SingleFileUploadDialog';
import type { FileUploadResult } from '../../SingleFileUpload';
import { ImagePickerType } from '../controls/ImagePicker';

// Note: These persist past the closing of the form.
const lazyControlMap = new Map<string, LazyExoticComponent<ComponentType>>();

function addLazyControl(url: string): void {
	lazyControlMap.set(
		url,
		lazy(() =>
			import(/* @vite-ignore */ url)
				.then((m) => {
					if (m.default) return m;
					else return { default: ControlPluginNoDefaultExportError };
				})
				.catch((reason) => {
					console.error(
						// TODO: Docs or internal URL
						`An error occurred loading the control. The form attempted to load the control from \`${url}\`. Forms Engine v1 controls are not compatible with this version. If you haven't migrated this control, please check the migration guide at https://docs.craftercms.org/.\n\n`,
						reason
					);
					return { default: ControlPluginError };
				})
		)
	);
}

export interface ControlWrapperProps {
	field: ContentTypeField;
	autoFocus: boolean;
	readonly: boolean;
	contentType: ContentType;
	atom: Atom<unknown>;
	customControlMap?: Record<string, ElementType>;
}

export const ControlWrapper = memo(function (props: ControlWrapperProps) {
	const siteId = useActiveSiteId();
	const { field, autoFocus, readonly, contentType, atom, customControlMap } = props;
	const [value, setValue] = useAtom(atom);
	const fieldId = field.id;
	let Control: ElementType<ControlProps>;
	if (field.properties?.plugin) {
		const url = buildFileUrl(
			siteId,
			field.properties.plugin.type,
			field.properties.plugin.name,
			field.properties.plugin.filename,
			field.properties.plugin.pluginId
		);
		if (!lazyControlMap.has(url)) addLazyControl(url);
		Control = lazyControlMap.get(url);
	} else {
		Control = customControlMap?.[field.type] ?? controlMap[field.type] ?? UnknownControl;
	}
	return (
		<ErrorBoundary key={fieldId}>
			<Suspense fallback={<ControlSkeleton label={field.name} />}>
				<Control
					// Only auto-focus on controls that are not readonly.
					// Focus might not work consistently on disabled controls anyway.
					autoFocus={autoFocus && !readonly}
					value={value}
					setValue={setValue}
					field={field}
					contentType={contentType}
					readonly={readonly}
				/>
			</Suspense>
		</ErrorBoundary>
	);
});

function ControlPluginError({ field }: ControlProps) {
	return (
		<FormsEngineField field={field} menu={false}>
			<Alert
				severity="error"
				variant="standard"
				sx={(theme) => ({ border: 'none', strong: { fontWeight: theme.typography.fontWeightMedium } })}
			>
				<FormattedMessage
					defaultMessage="Unable to load the {name} ({id}) control. The control may be absent or contain errors in the code. Check the browser console for error details."
					values={{
						name: field.name,
						id: field.id
					}}
				/>
			</Alert>
		</FormsEngineField>
	);
}

function ControlPluginNoDefaultExportError({ field }: ControlProps) {
	return (
		<FormsEngineField field={field} menu={false}>
			<Alert
				severity="error"
				variant="standard"
				sx={(theme) => ({ border: 'none', strong: { fontWeight: theme.typography.fontWeightMedium } })}
			>
				<FormattedMessage
					defaultMessage="Unable to render {name} ({id}) control. No default export found. A control's JavaScript file should export a React component as `default`. Please check <docs>the documentation</docs>."
					values={{
						name: field.name,
						id: field.id,
						// TODO: Docs or internal link
						docs: (str) => (
							<a href="https://docs.craftercms.org" target="_blank">
								{str}
							</a>
						)
					}}
				/>
			</Alert>
		</FormsEngineField>
	);
}

export function renderFieldControl(
	field: ContentTypeField,
	atoms: FormsEngineAtoms['valueByFieldId'],
	autoFocus: boolean,
	readonly: boolean,
	contentType: ContentType,
	customControlsMap?: ControlWrapperProps['customControlMap']
) {
	const fieldId = field.id;
	return (
		<ControlWrapper
			key={fieldId}
			field={field}
			atom={atoms[fieldId]}
			readonly={readonly}
			autoFocus={autoFocus}
			contentType={contentType}
			customControlMap={customControlsMap}
		/>
	);
}

/** Returns menu options for media controls based on allowed paths. The options are categorized into "Browse", "Search",
 * and "Upload".
 *
 * @param dataSourceSummary - Summary of allowed paths for browsing, searching, and uploading media.
 * @param handleDataSourceOptionClick - Callback function to handle clicks on the menu options.
 * @param readonly - If true, the menu options will be disabled.
 * @returns An array of JSX elements representing the menu options.
 * */
export function createMediaMenuOptions(
	dataSourceSummary: ConsolidatedMediaPickerData,
	handleDataSourceOptionClick: (option: ImagePickerType) => void,
	readonly: boolean = false
) {
	const { allowedBrowsePaths, allowedUploadPaths, allowedSearchPaths } = dataSourceSummary;
	const menuOptions = [];
	const availableOptions: ImagePickerType[] = [];

	if (allowedBrowsePaths.length > 0) {
		availableOptions.push('browse');
		menuOptions.push(
			<MenuItem key="browse" onClick={(event) => handleDataSourceOptionClick('browse')} disabled={readonly}>
				<ListItemIcon sx={{ mr: 0 }}>
					<TravelExploreOutlined fontSize="small" />
				</ListItemIcon>
				<ListItemText>
					<FormattedMessage defaultMessage="Browse" />
				</ListItemText>
			</MenuItem>
		);
	}
	if (allowedSearchPaths.length > 0) {
		availableOptions.push('search');
		menuOptions.push(
			<MenuItem key="search" onClick={(event) => handleDataSourceOptionClick('search')} disabled={readonly}>
				<ListItemIcon sx={{ mr: 0 }}>
					<SearchRounded fontSize="small" />
				</ListItemIcon>
				<ListItemText>
					<FormattedMessage defaultMessage="Search" />
				</ListItemText>
			</MenuItem>
		);
	}
	if (allowedUploadPaths.length > 0) {
		availableOptions.push('upload');
		menuOptions.push(
			<MenuItem key="upload" onClick={(event) => handleDataSourceOptionClick('upload')} disabled={readonly}>
				<ListItemIcon sx={{ mr: 0 }}>
					<UploadFileOutlinedIcon fontSize="small" />
				</ListItemIcon>
				<ListItemText>
					<FormattedMessage defaultMessage="Upload" />
				</ListItemText>
			</MenuItem>
		);
	}
	return { menuOptions, availableOptions };
}

export function downloadMedia(base: string, url: string) {
	const link = document.createElement('a');
	link.href = ensureSingleSlash(`${base}${url}`);
	link.download = getFileNameFromPath(url); // Extracts the file name from the URL
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

export const showBrowseFilesDialog = ({
	dispatch,
	onSuccess,
	path,
	contentTypes,
	multiSelect = true,
	preselectedPaths = [],
	initialParameters = {}
}: {
	path: string;
	dispatch: ReduxDispatch;
	onSuccess: BrowseFilesDialogProps['onSuccess'];
	contentTypes?: string[];
	multiSelect?: boolean;
	preselectedPaths?: string[];
	initialParameters?: BrowseFilesDialogProps['initialParameters'];
}): void => {
	const id = nanoid();
	dispatch(
		pushDialog({
			id,
			component: createComponentId('BrowseFilesDialog'),
			props: {
				path,
				multiSelect,
				allowUpload: false,
				contentTypes: contentTypes ?? [],
				preselectedPaths,
				initialParameters,
				onClose: () => dispatch(popDialog({ id })),
				onSuccess(items) {
					dispatch(popDialog({ id }));
					onSuccess(items);
				}
			} as Partial<BrowseFilesDialogProps>
		})
	);
};

export const showSearchDialog = ({
	dispatch,
	path,
	preselectedPaths = [],
	contentTypes,
	onAcceptSelection,
	initialParameters
}: {
	path: string;
	contentTypes?: string[];
	preselectedPaths?: string[];
	initialParameters?: SearchProps['initialParameters'];
	dispatch: ReduxDispatch;
	onAcceptSelection: SearchProps['onAcceptSelection'];
}): void => {
	const id = nanoid();
	dispatch(
		pushNonDialog({
			id,
			component: createComponentId('Search'),
			props: {
				mode: 'select',
				embedded: true,
				initialParameters: {
					path,
					sortBy: 'internalName',
					...initialParameters,
					...(contentTypes && {
						filters: {
							...(initialParameters?.filters ?? {}),
							'content-type': contentTypes
						}
					})
				},
				preselectedPaths,
				onClose: () => dispatch(popDialog({ id })),
				onAcceptSelection(paths, items) {
					dispatch(popDialog({ id }));
					onAcceptSelection(paths, items);
				}
			} as Partial<SearchProps>
		})
	);
};

export const showSingleFileUploadDialog = ({
	dispatch,
	siteId,
	path,
	fileTypes,
	onFileAdded,
	onUploadComplete
}: {
	dispatch: ReduxDispatch;
	siteId: string;
	path: string;
	fileTypes?: string[];
	onFileAdded?: SingleFileUploadDialogProps['onFileAdded'];
	onUploadComplete?: SingleFileUploadDialogProps['onUploadComplete'];
}): void => {
	const id = nanoid();
	dispatch(
		pushDialog({
			id,
			component: createComponentId('SingleFileUploadDialog'),
			props: {
				site: siteId,
				path,
				fileTypes,
				onFileAdded,
				onUploadComplete: (result: FileUploadResult) => {
					dispatch(popDialog({ id }));
					onUploadComplete?.(result);
				}
			} as SingleFileUploadDialogProps
		})
	);
};

export const showImageCropDialog = ({
	dispatch,
	path,
	mimeType,
	restrictions,
	writeContent,
	onCrop
}: {
	dispatch: ReduxDispatch;
	path: string;
	mimeType?: string;
	restrictions?: ImageRestrictions;
	writeContent?: boolean;
	onCrop: (blob: Blob, newPath?: string) => void;
}): void => {
	const dialogId = nanoid();
	const imageRestrictionMessages = getImageRestrictionMessages(restrictions);
	dispatch(
		pushDialog({
			id: dialogId,
			component: createComponentId('ImageEditorDialog'),
			props: {
				path,
				mimeType,
				subtitle: (
					<FormattedMessage
						defaultMessage="The image does not meet the width & height constraints (Width: {width}. Height: {height})."
						values={{
							width: imageRestrictionMessages.width,
							height: imageRestrictionMessages.height
						}}
					/>
				),
				restrictions,
				writeContent,
				onCrop: (blob: Blob, newPath: string) => {
					dispatch(popDialog({ id: dialogId }));
					onCrop?.(blob, newPath);
				}
			}
		})
	);
};

/** Generates user-friendly messages for image width and height restrictions.
 *
 * @param restrictions - An object containing image dimension restrictions.
 * @returns An object with formatted width and height restriction messages.
 */
export const getImageRestrictionMessages = (restrictions: ImageRestrictions) => {
	const width = [
		restrictions.width ? ` equal to ${restrictions.width}px` : null,
		restrictions.minWidth ? ` minimum ${restrictions.minWidth}px` : null,
		restrictions.maxWidth ? ` maximum ${restrictions.maxWidth}px` : null
	]
		.filter(Boolean)
		.join(',');
	const height = [
		restrictions.height ? ` equal to ${restrictions.height}px` : null,
		restrictions.minHeight ? ` minimum ${restrictions.minHeight}px` : null,
		restrictions.maxHeight ? ` maximum ${restrictions.maxHeight}px` : null
	]
		.filter(Boolean)
		.join(',');
	return { width, height };
};

/**
 * Checks if the populate time expression is valid.
 *
 * @param expr {string} The populate time expression to validate.
 * @returns true if the expression is valid, false otherwise.
 */
export function validateTimePopulateExpression(expr: string): boolean {
	const trimmed = (expr ?? '').replace(/ /g, '').toLowerCase();
	if (trimmed === 'now') return true;
	return /^(now)?[+-]\d+(hours|minutes)$/i.test(trimmed);
}

/**
 * Checks if the populate date expression is valid.
 *
 * @param expr {string} The populate date expression to validate.
 * @returns true if the expression is valid, false otherwise.
 */
export function validateDatePopulateExpression(expr: string): boolean {
	const normalized = expr.replace(/ /g, '');
	return /^(now|((now)?[+-]\d+(days|weeks|years|hours|minutes)))$/i.test(normalized);
}

/**
 * Takes an expression like "now", "now+5days", "now-3weeks", "now+2years", "now-4hours", "now+30minutes"
 * and returns a Date object representing the calculated date. If the expression is invalid, it returns the
 * current date.
 *
 * @param params {Object} - The parameters for processing the date expression.
 * @param params.expression {string}  - The date expression to process ('now[+ or -][number][days or weeks or years or hours or minutes]'
 * 																			e.g. 'now', 'now+5hours', 'now-30minutes', 'now+10days', 'now-2weeks', 'now+1years').
 * @param params.validatePopulateExpression {Function} - A function to validate the expression. If the expression is invalid, the current date is returned.
 * @param [params.allowPastDate=false] {boolean} - If `false`, sets "now" expression to the end of the current minute. Note: This does not prevent past dates for other expressions (e.g., "now-5days"); the calling control is responsible for that validation.
 *
 * @returns {Date} The calculated date based on the expression.
 */

export function processPopulateExpression({
	expression,
	validatePopulateExpression,
	allowPastDate = false
}: {
	expression: string;
	validatePopulateExpression(expr: string): boolean;
	allowPastDate?: boolean;
}): Date {
	const date = new Date();
	const daysInWeek = 7;
	let modifier = 1;

	const populateDateExp = expression.replace(/ /g, '');
	const normalized = populateDateExp.toLowerCase();

	if (validatePopulateExpression(expression)) {
		if (normalized === 'now') {
			if (!allowPastDate) date.setSeconds(59, 0);
		} else {
			const action = normalized.match(/[+-]/)![0];
			const expValue = parseInt(normalized.match(/\d+/)![0], 10);
			const type = normalized.match(/(days|weeks|years|hours|minutes)/)![0];
			if (action === '-') {
				modifier = modifier * -1;
			}
			if (type === 'years') {
				date.setFullYear(date.getFullYear() + modifier * expValue);
			} else if (type === 'weeks') {
				date.setDate(date.getDate() + modifier * expValue * daysInWeek);
			} else if (type === 'days') {
				date.setDate(date.getDate() + modifier * expValue);
			} else if (type === 'hours') {
				date.setTime(date.getTime() + modifier * (expValue * 3600000));
			} else if (type === 'minutes') {
				date.setTime(date.getTime() + modifier * expValue * 60000);
			}
		}
	} else {
		if (!allowPastDate) date.setSeconds(59, 0);
	}
	return date;
}
