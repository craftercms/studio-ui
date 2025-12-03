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
import { nnou, nou } from '../../../utils/object';
import { checkPathExistence } from '../../../services/content';
import { getBasePath, getFileNamePath, isPagePath } from './formUtils';
import { firstValueFrom } from 'rxjs';
import { withIndex } from '../../../utils/path';
import { FormsEngineItemMetaContextProps } from './formsEngineContext';

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
	'file-name': undefined,
	forcehttps: undefined,
	'image-picker': undefined,
	input: undefined,
	'internal-name': undefined,
	label: undefined,
	'link-input': undefined,
	'link-textarea': undefined,
	'linked-dropdown': undefined,
	'locale-selector': undefined,
	'node-selector': undefined,
	'numeric-input': undefined,
	'page-nav-order': undefined,
	rte: undefined,
	textarea: undefined,
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

export async function validateFieldValue(
	field: ContentTypeField,
	currentValue: unknown,
	meta: ValidatorMetaData
): Promise<FieldValidityState> {
	const validateValue = field.id === 'file-name' ? meta.fileName : currentValue;
	const messages: FieldValidityState['messages'] = [];
	const isRequired = isFieldRequired(field);
	const isEmpty = isEmptyValue(field, validateValue);

	// If it's required, and the value is empty, then it's invalid.
	if ((isRequired || field.id === 'file-name') && isEmpty) {
		messages.push(defineMessage({ defaultMessage: 'This field is required.' }));
		return Promise.resolve({ isValid: false, messages });
	}
	const validator = validatorsMap[field.type as BuiltInControlType];
	// If there's a validator, run it. If not, it's valid.
	const isValid = nnou(validator) ? await validator(field, validateValue, messages, meta) : true;
	return Promise.resolve({ isValid, messages });
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
