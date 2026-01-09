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

import type { ContentTypeField } from '../../../models/ContentType';
import type { BuiltInControlType } from './controlMap';
import LookupTable from '../../../models/LookupTable';
import { XmlKeys } from './formConsts';
import { defineMessage, type MessageDescriptor } from 'react-intl';
import type { FormatXMLElementFn, PrimitiveType } from 'intl-messageformat';
import { checkPathExistence } from '../../../services/content';
import { getBasePath, computePathFromFileName, isPagePath } from './formUtils';
import { firstValueFrom } from 'rxjs';
import { withIndex } from '../../../utils/path';
import { FormsEngineItemMetaContextProps } from './formsEngineContext';
import { nnou, nou } from '../../../utils/object';
import { getValidationValue } from './formUtils';

interface ValidatorMetaData {
	siteId: string;
	fileName: string;
	itemMeta: FormsEngineItemMetaContextProps;
}
type ValidatorFunctionDef = (
	field: ContentTypeField,
	currentValue: unknown,
	messages: FieldValidityState['messages'],
	meta: ValidatorMetaData
) => Promise<boolean> | boolean;
export const validatorsMap: Partial<Record<BuiltInControlType, ValidatorFunctionDef>> = {
	repeat: undefined,
	'auto-filename': undefined,
	'aws-file-upload': undefined,
	'checkbox-group': undefined,
	checkbox: undefined,
	'date-time': undefined,
	disabled: undefined,
	dropdown: undefined,
	'file-name': (field, currentValue, messages, meta) =>
		fileNameValidator(field, currentValue as string, messages, meta),
	forcehttps: undefined,
	'image-picker': undefined,
	input: (field, currentValue, messages) => inputValidator(field, currentValue as string, messages),
	'internal-name': undefined,
	label: undefined,
	'link-input': undefined,
	'link-textarea': undefined,
	'linked-dropdown': undefined,
	'locale-selector': undefined,
	'node-selector': undefined,
	'numeric-input': (field, currentValue, messages) => numericInputValidator(field, currentValue as number, messages),
	'page-nav-order': undefined,
	rte: undefined,
	textarea: (field, currentValue, messages) => inputValidator(field, currentValue as string, messages),
	time: undefined,
	'transcoded-video-picker': undefined,
	uuid: undefined,
	'video-picker': undefined,
	colorPicker: undefined
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
	const validator = validatorsMap[field.type as BuiltInControlType];
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

/**
 * Validates the input value of a field based on its pattern and maximum length.
 *
 * @param {ContentTypeField} field - The metadata of the field being validated, including its validation rules.
 * @param {string} currentValue - The current value of the field to validate.
 * @param {FieldValidityMessage[]} [messages] - An optional array to store validation messages if the value is invalid.
 * @returns {boolean} - Returns `true` if the input value is valid; otherwise, `false`.
 *
 */
export function inputValidator(
	field: ContentTypeField,
	currentValue: string,
	messages?: FieldValidityMessage[]
): boolean {
	let isValid = true;
	// Skip validation if value is empty and field is not required
	if (currentValue == null || (typeof currentValue === 'string' && currentValue.trim() === '')) {
		return isValid;
	}
	const pattern = field.validations.pattern?.value as string;
	const maxLength: number | undefined = getValidationValue(field.validations, 'maxLength');
	// If there's a pattern and it doesn't match, it's invalid.
	if (pattern && !String(currentValue).match(pattern)) {
		messages?.push([defineMessage({ defaultMessage: 'The value does not match the required pattern.' })]);
		isValid = false;
	}

	if (nnou(maxLength) && currentValue.length > maxLength) {
		messages?.push([
			defineMessage({ defaultMessage: `The value is greater than the allowed maximum ({maxLength}).` }),
			{ maxLength }
		]);
		isValid = false;
	}
	return isValid;
}

/**
 * Validates a numeric input value based on its pattern, maximum value, and minimum value.
 *
 * @param {ContentTypeField} field - The metadata of the field being validated, including its validation rules.
 * @param {number} currentValue - The current numeric value of the field to validate.
 * @param {FieldValidityMessage[]} messages - An array to store validation messages if the value is invalid.
 * @returns {boolean} - Returns `true` if the numeric value is valid; otherwise, `false`.
 *
 */
export function numericInputValidator(
	field: ContentTypeField,
	currentValue: number,
	messages: FieldValidityMessage[]
): boolean {
	let isValid = true;
	const pattern: string = getValidationValue(field.validations, 'pattern');
	const maxValue: number = getValidationValue(field.validations, 'maxValue');
	const minValue: number = getValidationValue(field.validations, 'minValue');

	if (nou(currentValue) || Number.isNaN(Number(currentValue))) {
		return isValid;
	}

	// If there's a pattern and it doesn't match
	if (pattern && !String(currentValue).match(pattern)) {
		messages.push([defineMessage({ defaultMessage: 'The value does not match the required pattern.' })]);
		isValid = false;
	}
	// If there's a max and the value is greater than the max
	if (maxValue != null && Number(currentValue) > Number(maxValue)) {
		messages.push([
			defineMessage({ defaultMessage: `The value is greater than the allowed maximum ({maxValue}).` }),
			{ maxValue }
		]);
		isValid = false;
	}
	// If there's a min and the value is less than the min
	if (minValue != null && Number(currentValue) < Number(minValue)) {
		messages.push([
			defineMessage({ defaultMessage: 'The value is less than the minimum ({minValue}).' }),
			{ minValue }
		]);
		isValid = false;
	}
	return isValid;
}

export default validateFieldValue;
