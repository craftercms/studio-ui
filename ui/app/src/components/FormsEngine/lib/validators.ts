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

export const validatorsMap: Record<BuiltInControlType, ElementType> = {
	repeat: null,
	'auto-filename': null,
	'aws-file-upload': null,
	'checkbox-group': null,
	checkbox: null,
	'date-time': null,
	disabled: null,
	dropdown: null,
	'file-name': null,
	forcehttps: null,
	'image-picker': null,
	input: (field, currentValue, messages) => {
		let isValid = true;
		const pattern = field.validations.pattern?.value as string;
		// If there's a pattern and it doesn't match, it's invalid.
		if (pattern && !String(currentValue).match(pattern)) {
			messages.push(defineMessage({ defaultMessage: 'The value does not match the required pattern.' }));
			isValid = false;
		}
		return isValid;
	},
	'internal-name': null,
	label: null,
	'link-input': null,
	'link-textarea': null,
	'linked-dropdown': null,
	'locale-selector': null,
	'node-selector': null,
	'numeric-input': (field, currentValue, messages) => {
		let isValid = true;
		const pattern = field.validations.pattern?.value as string;
		const maxValue = field.validations.maxValue?.value;
		const minValue = field.validations.minValue?.value;

		if (currentValue !== null) {
			// If there's a pattern and it doesn't match
			if (pattern && !String(currentValue).match(pattern)) {
				messages.push(defineMessage({ defaultMessage: 'The value does not match the required pattern.' }));
				isValid = false;
			}
			// If there's a max and the value is greater than the max
			if (maxValue != null && Number(currentValue) > Number(maxValue)) {
				messages.push(defineMessage({ defaultMessage: `The value is greater than the maximum allowed.` }));
				isValid = false;
			}
			// If there's a min and the value is less than the min
			if (minValue != null && Number(currentValue) < Number(minValue)) {
				messages.push(defineMessage({ defaultMessage: 'The value is less than the minimum allowed.' }));
				isValid = false;
			}
		}

		return isValid;
	},
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
	messages: string[];
}

export function validateFieldValue(field: ContentTypeField, currentValue: unknown): FieldValidityState {
	let isValid = false;
	const isRequired = isFieldRequired(field);
	const isEmpty = isEmptyValue(field, currentValue);
	if (!isRequired && isEmpty) {
		// If not required and its empty, then it's valid.
		isValid = true;
	} else if (!isEmpty) {
		// FE2 TODO: Add other validation types (max length, etc)...
		isValid = true;
	}
	return {
		isValid,
		messages: isValid ? null : ['This field is required.']
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
