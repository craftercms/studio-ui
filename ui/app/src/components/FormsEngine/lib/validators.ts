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

type ValidatorFunctionDef = (
	field: ContentTypeField,
	currentValue: unknown,
	messages: FieldValidityState['messages']
) => boolean;
export const validatorsMap: Partial<Record<BuiltInControlType, ValidatorFunctionDef>> = {
	repeat: null,
	'auto-filename': null,
	'aws-file-upload': null,
	'checkbox-group': (field, currentValue, messages) => {
		const minSelected = (field.validations.minSize?.value as number) ?? 0;
		const isValid = Array.isArray(currentValue) ? currentValue.length >= minSelected : true;
		if (!isValid)
			messages.push(defineMessage({ defaultMessage: 'Please select at least the minimum required items.' }));
		return isValid;
	},
	checkbox: null,
	'date-time': null,
	disabled: null,
	dropdown: null,
	'file-name': null,
	forcehttps: null,
	'image-picker': null,
	input: null,
	'internal-name': null,
	label: null,
	'link-input': null,
	'link-textarea': null,
	'linked-dropdown': null,
	'locale-selector': null,
	'node-selector': null,
	'numeric-input': null,
	'page-nav-order': null,
	rte: null,
	textarea: null,
	time: null,
	'transcoded-video-picker': null,
	uuid: null,
	'video-picker': null,
	colorPicker: undefined
};

export interface FieldValidityState {
	isValid: boolean;
	messages: (string | MessageDescriptor)[];
}

export function validateFieldValue(field: ContentTypeField, currentValue: unknown): FieldValidityState {
	let isValid = false;
	const messages: FieldValidityState['messages'] = [];
	const isRequired = isFieldRequired(field);
	const isEmpty = isEmptyValue(field, currentValue);
	if (!isRequired) {
		// If it's not required, we still need to check for validator.
		if (validatorsMap[field.type]) {
			isValid = validatorsMap[field.type](field, currentValue, messages);
		} else {
			// If it's not required and there's no validator, then it's valid.
			isValid = true;
		}
		// If it's required and empty, then it's invalid.
	} else if (isRequired && isEmpty) {
		messages.push(defineMessage({ defaultMessage: 'This field is required.' }));
	} else {
		isValid = true;
	}
	return {
		isValid,
		messages
	};
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

export default validateFieldValue;
