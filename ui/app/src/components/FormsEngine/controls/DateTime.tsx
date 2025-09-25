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

import React, { useContext, useId, useMemo } from 'react';
import { FormsEngineField } from '../components/FormsEngineField';
import { ControlProps } from '../types';
import { DateTimeTimezonePicker, type DateTimeTimezonePickerProps } from '../../DateTimeTimezonePicker';
import SecondaryButton from '../../SecondaryButton';
import { FormattedMessage } from 'react-intl';
import Box from '@mui/material/Box';
import { StableFormContext } from '../lib/formsEngineContext';

export interface DateTimeProps extends ControlProps {
	value: string;
}

const validatePopulateDateExp = (expr: string): boolean => {
	const normalized = expr.replace(/ /g, '');
	return /^(now|((now)?[+-]\d+(days|weeks|years|hours|minutes)))$/i.test(normalized);
};

const processPopulateExpression = (expr: string, allowPastDate: boolean): Date => {
	const date = new Date();
	const daysInWeek = 7;
	let modifier = 1;

	const populateDateExp = expr.replace(/ /g, '');
	const normalized = populateDateExp.toLowerCase();

	if (validatePopulateDateExp(expr)) {
		if (normalized === 'now') {
			if (!allowPastDate) date.setSeconds(59, 0);
		} else {
			const action = normalized.match(/(\+|\-)/gi)[0];
			const expValue = parseInt(normalized.match(/\d+/gi)[0]);
			const type = normalized.match(/((days)|(weeks)|(years)|(hours)|(minutes))/gi)[0];
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
};

export function DateTime(props: DateTimeProps) {
	const { field, value: valueProp, setValue, readonly: formReadonly, autoFocus } = props;
	const htmlId = useId();
	const stableFormContext = useContext(StableFormContext);
	const isCreateMode = Boolean(stableFormContext?.props?.create);

	// region field properties/validations
	const allowPastDate = Boolean(field.properties?.allowPastDate?.value);
	const useCustomTimezone = Boolean(field.properties?.useCustomTimezone?.value);
	const showTime = Boolean(field.properties?.showTime?.value);
	const showClear = Boolean(field.properties?.showClear?.value);
	const showSetNow = Boolean(field.properties?.showNowLink?.value);
	const populate = Boolean(field.properties?.populate?.value);
	const populateDateExp = field.properties?.populateDateExp?.value as string;
	const readonlyEdit = Boolean(field.properties?.readonlyEdit?.value);
	// There are 3 scenarios for the field to be readonly:
	// 1. The form is in readonly mode (formReadonly is true)
	// 2. The field is set to readonly in TB (field.properties.readonly.value is true)
	// 3. The field is set to readonly for edit mode only, and the form is not in create mode (readonlyEdit is true and isCreateMode is false)
	const readonly =
		formReadonly || Boolean(field.properties?.readonly?.value as boolean) || (readonlyEdit && !isCreateMode);
	// endregion

	const value = useMemo(() => {
		if (populate && populateDateExp && !valueProp) {
			return processPopulateExpression(populateDateExp, allowPastDate).toISOString();
		}
		return valueProp;
	}, [valueProp, populate, populateDateExp, allowPastDate]);

	const handleChange: DateTimeTimezonePickerProps['onChange'] = (value) => setValue(value);
	const setNow = () => {
		const date = new Date();
		// If allowPastDate is false, set it to the end of the current minute to avoid setting it to a past date.
		if (!allowPastDate) date.setSeconds(59, 0);
		setValue(date);
	};
	const clearValue = () => setValue(null);
	const pickers: DateTimeTimezonePickerProps['pickers'] = useMemo(() => {
		const pickers: DateTimeTimezonePickerProps['pickers'] = ['date'];
		if (showTime) {
			pickers.push('time');
		}
		return pickers;
	}, [showTime]);

	return (
		<>
			<FormsEngineField htmlFor={htmlId} field={field} length={valueProp?.length}>
				<DateTimeTimezonePicker
					value={value}
					disablePast={!allowPastDate}
					disabled={readonly}
					autoFocus={autoFocus}
					onChange={handleChange}
					disableTimezoneSelection={!useCustomTimezone}
					pickers={pickers}
					size="medium"
					sxs={{
						root: { flexDirection: 'row', gap: 2 },
						dateTimePicker: { flex: 1 },
						timezoneAutocomplete: { flex: 1 }
					}}
				/>
				<Box display="flex" gap={2} justifyContent="flex-end">
					{showSetNow && (
						<SecondaryButton onClick={setNow} disabled={readonly}>
							<FormattedMessage defaultMessage="Set now" />
						</SecondaryButton>
					)}
					{showClear && (
						<SecondaryButton onClick={clearValue} disabled={readonly}>
							<FormattedMessage defaultMessage="Clear value" />
						</SecondaryButton>
					)}
				</Box>
			</FormsEngineField>
		</>
	);
}

export default DateTime;
