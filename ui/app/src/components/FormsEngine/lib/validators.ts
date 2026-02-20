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

import ContentType, { ContentTypeField } from '../../../models/ContentType';
import type { BuiltInControlType } from './controlMap';
import LookupTable from '../../../models/LookupTable';
import { XmlKeys } from './formConsts';
import { defineMessage, type MessageDescriptor } from 'react-intl';
import type { FormatXMLElementFn, PrimitiveType } from 'intl-messageformat';
import { nnou, nou } from '../../../utils/object';
import { checkPathExistence } from '../../../services/content';
import { computePathFromFileName, getBasePath, getPropertyValue, isPagePath } from './formUtils';
import { firstValueFrom } from 'rxjs';
import { withIndex } from '../../../utils/path';
import { FormsEngineItemMetaContextProps } from './formsEngineContext';
import { validateDatePopulateExpression } from './controlHelpers';
import type { DescriptorControlType } from '../../ContentTypeManagement/controlMap';
import { NodeSelectorItem } from '../controls/NodeSelector';

interface ValidatorMetaData {
	siteId: string;
	fileName: string;
	itemMeta: FormsEngineItemMetaContextProps;
	contentTypesById: LookupTable<ContentType>;
}
type ValidatorFunctionDef = (
	field: ContentTypeField,
	currentValue: unknown,
	messages: FieldValidityState['messages'],
	meta: ValidatorMetaData
) => Promise<boolean> | boolean;
export const validatorsMap: Partial<Record<BuiltInControlType | DescriptorControlType, ValidatorFunctionDef>> = {
	repeat: undefined,
	'auto-filename': undefined,
	'aws-file-upload': undefined,
	'checkbox-group': undefined,
	checkbox: undefined,
	'date-time': (field, currentValue, messages) => dateTimeValidator(field, currentValue as string, messages),
	disabled: undefined,
	dropdown: undefined,
	'file-name': (field, currentValue, messages, meta) =>
		fileNameValidator(field, currentValue as string, messages, meta),
	forcehttps: undefined,
	'image-picker': undefined,
	input: undefined,
	'internal-name': undefined,
	label: undefined,
	'link-input': undefined,
	'link-textarea': undefined,
	'linked-dropdown': undefined,
	'locale-selector': undefined,
	'node-selector': (field, currentValue, messages, meta) =>
		nodeSelectorValidator(field, currentValue as Array<NodeSelectorItem>, messages, meta),
	'numeric-input': undefined,
	'page-nav-order': undefined,
	rte: undefined,
	textarea: undefined,
	time: undefined,
	'transcoded-video-picker': undefined,
	uuid: undefined,
	'video-picker': undefined,
	colorPicker: undefined,
	'date-time-expression-input': (field, currentValue, messages) =>
		dateTimeExpressionInputValidator(field, currentValue as string, messages)
};

// TODO: Fix FormatXMLElementFn generics
export type FieldValidityMessage =
	| string
	| MessageDescriptor
	| [MessageDescriptor, values?: Record<string, PrimitiveType | FormatXMLElementFn<any, any>>];

export interface FieldValidityState {
	isValid: boolean;
	messages: FieldValidityMessage[];
}

/**
 * Validates the uniqueness of a file name within a specific site and path.
 *
 * @param {ContentTypeField} field - The field metadata for the file name being validated.
 * @param {string} _ - Unused parameter, representing the current value of the field.
 * @param {FieldValidityState['messages']} messages - An array to store validation messages.
 * @param {ValidatorMetaData} meta - Metadata containing site ID, file name, and item context.
 * @returns {Promise<boolean> | boolean} - A promise resolving to `true` if the file name is valid,
 * or `false` if it is invalid.
 *
 */
export async function fileNameValidator(
	field: ContentTypeField,
	_: string,
	messages: FieldValidityState['messages'],
	meta: ValidatorMetaData
): Promise<boolean> {
	const siteId: string = meta.siteId;
	const currentValue = meta.fileName;

	if (nou(currentValue)) return false;

	const initialPath = meta.itemMeta.path ?? meta.itemMeta.pathInSite;
	const isPage = isPagePath(withIndex(initialPath));
	const basePath = nnou(meta.itemMeta.path) ? getBasePath(initialPath, isPage) : meta.itemMeta.pathInSite;
	const newPath = computePathFromFileName(currentValue, isPage, basePath);

	if (initialPath === newPath || nou(siteId)) return true;

	try {
		const exists = await firstValueFrom(checkPathExistence(siteId, newPath));
		if (exists) {
			messages?.push([defineMessage({ defaultMessage: 'An item with that name already exists.' })]);
		}
		return !exists;
	} catch {
		return false;
	}
}

/**
 * Validates the value of a field based on its type, requirements, and metadata.
 *
 * @param {ContentTypeField} field - The field metadata, including its type and validation rules.
 * @param {unknown} currentValue - The current value of the field to be validated.
 * @param {ValidatorMetaData} meta - Metadata containing additional context such as site ID and file name.
 * @returns {Promise<FieldValidityState>} - A promise resolving to the validity state of the field,
 * including whether it is valid and any associated validation messages.
 *
 */
export async function validateFieldValue(
	field: ContentTypeField,
	currentValue: unknown,
	meta: ValidatorMetaData
): Promise<FieldValidityState> {
	const validateValue = field.id === 'file-name' ? meta.fileName : currentValue;
	const messages: FieldValidityState['messages'] = [];
	const isRequired = isFieldRequired(field);
	const isEmpty = isEmptyValue(field, validateValue);

	// If it's required, and the value is empty, then it's invalid. For file-name, if path is root it's ok to be empty.
	if ((isRequired || (field.id === 'file-name' && meta.itemMeta.path !== '/site/website/index.xml')) && isEmpty) {
		messages.push(defineMessage({ defaultMessage: 'This field is required.' }));
		return Promise.resolve({ isValid: false, messages });
	}
	const validator = validatorsMap[field.type as BuiltInControlType | DescriptorControlType];
	// If there's a validator, run it. If not, it's valid.
	const isValid = nnou(validator) ? await validator(field, validateValue, messages, meta) : true;
	return Promise.resolve({ isValid, messages });
}

/**
 * Checks if the given value for a field is considered empty.
 *
 * @param {ContentTypeField} field - The metadata of the field being validated.
 * @param {unknown} currentValue - The current value of the field to check.
 * @returns {boolean} - Returns `true` if the value is null, undefined, an empty string,
 * or an empty array; otherwise, returns `false`.
 *
 */
export function isEmptyValue(field: ContentTypeField, currentValue: unknown): boolean {
	return (
		currentValue == null ||
		(typeof currentValue === 'string' && currentValue.trim() === '') ||
		(Array.isArray(currentValue) && currentValue.length === 0)
	);
}

/**
 * Determines if a field is required based on its validation metadata.
 *
 * @param {ContentTypeField} field - The metadata of the field, including validation rules.
 * @returns {boolean} - Returns `true` if the field is marked as required; otherwise, `false`.
 *
 */
export function isFieldRequired(field: ContentTypeField): boolean {
	return Boolean(field.validations?.required?.value);
}

/**
 * Checks if the minimum save requirements are fulfilled.
 *
 * @param {Promise<FieldValidityState>} fileNameValidation - A promise resolving to the validity state of the file name.
 * @param {LookupTable<unknown>} values - A lookup table containing field values, including the internal name.
 * @returns {Promise<boolean>} - A promise resolving to `true` if the file name is valid and the internal name requirements are fulfilled; otherwise, `false`.
 *
 */
export async function checkMinimumSaveRequirementsFulfilled(
	fileNameValidation: Promise<FieldValidityState>,
	values: LookupTable<unknown>
): Promise<boolean> {
	const { isValid: isFileNameValid } = await fileNameValidation;
	return isFileNameValid && isInternalNameValid(values);
}

/**
 * Checks if the internal name is valid.
 *
 * @param {LookupTable<unknown>} values - A lookup table containing field values, including the internal name.
 * @returns {boolean} - Returns `true` if the internal name is not empty or consists only of whitespace; otherwise, `false`.
 *
 */
export function isInternalNameValid(values: LookupTable<unknown>): boolean {
	return (values[XmlKeys.internalName]?.toString() ?? '').trim() !== '';
}

export function dateTimeValidator(
	field: ContentTypeField,
	currentValue: string,
	messages: FieldValidityMessage[]
): boolean {
	let isValid = true;
	const allowPastDate: boolean = getPropertyValue(field.properties, 'allowPastDate') as boolean;
	const fieldDate = new Date(currentValue as string);
	const currentDate = new Date();
	if (!allowPastDate && !isNaN(fieldDate.valueOf()) && fieldDate < currentDate) {
		messages.push(defineMessage({ defaultMessage: 'The date cannot be in the past.' }));
		isValid = false;
	}
	return isValid;
}

export function dateTimeExpressionInputValidator(field, currentValue: string, messages) {
	const isValid = validateDatePopulateExpression(currentValue);
	if (!isValid) {
		messages.push(defineMessage({ defaultMessage: 'The expression is not valid.' }));
	}
	return isValid;
}

export async function nodeSelectorValidator(
	field: ContentTypeField,
	currentValue: Array<NodeSelectorItem>,
	messages: FieldValidityState['messages'],
	meta: ValidatorMetaData
): Promise<boolean> {
	let isValid = true;
	const embeddedContent = currentValue.filter((item) => nnou(item.component));

	if (embeddedContent.length === 0) return isValid;

	const validationPromises: Promise<FieldValidityState>[] = [];

	embeddedContent.forEach(({ component }) => {
		const contentTypeId = component['content-type'] as string;
		const contentType = meta.contentTypesById[contentTypeId];
		if (!contentType) return;
		const fields = contentType.fields;
		if (!fields) return;
		Object.values(fields).forEach((field) => {
			const value = component[field.id];
			const validationPromise = validateFieldValue(field, value, meta);
			validationPromises.push(validationPromise);
		});
	});

	const results = await Promise.all(validationPromises);
	let invalidEmbedded = false;
	results.forEach((result) => {
		if (!result.isValid) {
			invalidEmbedded = true;
			isValid = false;
		}
	});
	if (invalidEmbedded) {
		messages.push(defineMessage({ defaultMessage: 'One or more embedded content items are invalid.' }));
	}
	return isValid;
}

export default validateFieldValue;
