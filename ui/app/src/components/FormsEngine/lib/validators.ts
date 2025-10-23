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

import type { ElementType } from 'react';
import type { ContentTypeField } from '../../../models/ContentType';
import type { BuiltInControlType } from './controlMap';
import LookupTable from '../../../models/LookupTable';
import { XmlKeys } from './formConsts';
import { defineMessage, type MessageDescriptor } from 'react-intl';
import type { FormatXMLElementFn, PrimitiveType } from 'intl-messageformat';
import { nnou } from '../../../utils/object';
import { getValidationValue } from './formUtils';

type ValidatorFunctionDef = (
	field: ContentTypeField,
	currentValue: unknown,
	messages: FieldValidityState['messages']
) => boolean;
export const validatorsMap: Partial<Record<BuiltInControlType, ValidatorFunctionDef>> = {
	repeat: undefined,
	'auto-filename': undefined,
	'aws-file-upload': undefined,
	'checkbox-group': undefined,
	checkbox: undefined,
	'date-time': undefined,
	disabled: undefined,
	dropdown: undefined,
	'file-name': undefined,
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

export function validateFieldValue(field: ContentTypeField, currentValue: unknown): FieldValidityState {
	const messages: FieldValidityState['messages'] = [];
	const isRequired = isFieldRequired(field);
	const isEmpty = isEmptyValue(field, currentValue);

	// If it's required, and the value is empty, then it's invalid.
	if (isRequired && isEmpty) {
		messages.push(defineMessage({ defaultMessage: 'This field is required.' }));
		return { isValid: false, messages };
	}
	const validator = validatorsMap[field.type as BuiltInControlType];
	// If there's a validator, run it. If not, it's valid.
	const isValid = typeof validator === 'function' ? validator(field, currentValue, messages) : true;
	return { isValid, messages };
}

export function isEmptyValue(field: ContentTypeField, currentValue: unknown): boolean {
	return (
		currentValue == null ||
		(typeof currentValue === 'string' && currentValue.trim() === '') ||
		(Array.isArray(currentValue) && currentValue.length === 0)
	);
}

export function isFieldRequired(field: ContentTypeField): boolean {
	return Boolean(field.validations?.required?.value);
}

export function checkMinimumSaveRequirementsFulfilled(values: LookupTable<unknown>): boolean {
	return (
		[values[XmlKeys.fileName], values[XmlKeys.folderName]].join('').trim() !== '' &&
		values[XmlKeys.internalName].toString().trim() !== ''
	);
}

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

export function numericInputValidator(
	field: ContentTypeField,
	currentValue: number,
	messages: FieldValidityMessage[]
): boolean {
	let isValid = true;
	const pattern = field.validations.pattern?.value as string;
	const maxValue = field.validations.maxValue?.value;
	const minValue = field.validations.minValue?.value;

	if (nnou(currentValue)) {
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
	}
	return isValid;
}

export default validateFieldValue;
