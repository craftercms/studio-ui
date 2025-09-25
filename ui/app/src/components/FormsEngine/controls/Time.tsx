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

export interface TimeProps extends ControlProps {
	value: string | null;
}

const parseTimeToDate = (time: string): Date | null => {
	if (!time) return null;
	const [h, m = '0', s = '0'] = time.split(':');
	const hours = Number(h);
	const minutes = Number(m);
	const seconds = Number(s);

	// Check time ranges
	if (
		!Number.isFinite(hours) ||
		!Number.isFinite(minutes) ||
		!Number.isFinite(seconds) ||
		hours < 0 ||
		hours > 23 ||
		minutes < 0 ||
		minutes > 59 ||
		seconds < 0 ||
		seconds > 59
	) {
		return null;
	}

	const date = new Date();
	date.setHours(hours, minutes, seconds, 0);
	return date;
};

const parseDateToTime = (date: Date | null): string | null => {
	if (!date || Number.isNaN(date.valueOf())) return null;
	return date.toLocaleTimeString('en-US', { hour12: false });
};

const validatePopulateDateExp = (expr: string): boolean => {
	const trimmed = (expr ?? '').replace(/ /g, '').toLowerCase();
	if (trimmed === 'now') return true;
	return /(now)?(\+|\-)\d+((hours)|(minutes))$/i.test(trimmed);
};

const processPopulateExpression = (expr: string): Date => {
	const date = new Date();
	if (validatePopulateDateExp(expr)) {
		if (expr === 'now') {
			// This is to allow setting the time to the end of the current minute to avoid the time being in the past
			// when seconds are > 0 and allowPastDate is false
			date.setSeconds(59, 0);
			return date;
		} else {
			let modifier = 1;
			const dateExp = expr.replace(/ /g, '');
			const action = dateExp.match(/[+-]/)![0];
			const expValue = parseInt(dateExp.match(/\d+/)![0], 10);
			const type = dateExp.match(/(hours|minutes)/)![0];
			if (action === '-') {
				modifier = modifier * -1;
			}

			if (type === 'hours') {
				date.setTime(date.getTime() + modifier * (expValue * 60 * 60 * 1000));
			} else if (type === 'minutes') {
				date.setTime(date.getTime() + modifier * expValue * 60000);
			}
			return date;
		}
	} else {
		date.setSeconds(59, 0);
		return date;
	}
};

// TODO: How are we going to handle the timezone selector?. FE1 uses an extra `_tz` field to store the timezone value.
export function Time(props: TimeProps) {
	const { field, value: valueProp, setValue, readonly: formReadonly, autoFocus } = props;
	const htmlId = useId();
	const stableFormContext = useContext(StableFormContext);
	const isCreateMode = Boolean(stableFormContext?.props?.create);

	// region field properties/validations
	const allowPastDate = Boolean(field.properties?.allowPastDate?.value);
	const useCustomTimezone = Boolean(field.properties?.useCustomTimezone?.value);
	const showClear = Boolean(field.properties?.showClear?.value);
	const showSetNow = Boolean(field.properties?.showNowLink?.value);
	const populate = Boolean(field.properties?.populate?.value);
	const populateDateExp = (field.properties?.populateDateExp?.value as string) ?? '';
	const readonlyEdit = Boolean(field.properties?.readonlyEdit?.value);
	// There are 3 scenarios for the field to be readonly:
	// 1. The form is in readonly mode (formReadonly is true)
	// 2. The field is set to readonly in TB (field.properties.readonly.value is true)
	// 3. The field is set to readonly for edit mode only, and the form is not in create mode (readonlyEdit is true and isCreateMode is false)
	const readonly =
		formReadonly || Boolean(field.properties?.readonly?.value as boolean) || (readonlyEdit && !isCreateMode);
	// endregion

	// If populate is true and there is no value, set it to the current time
	const value = useMemo(() => {
		if (populate && populateDateExp && !valueProp) {
			return parseDateToTime(processPopulateExpression(populateDateExp));
		}
		return valueProp;
	}, [valueProp, populate, populateDateExp]);
	const dateValue = parseTimeToDate(value);

	React.useEffect(() => {
		// If populate is true, and populateDateExp is valid, and valueProp is empty, set the value to the result of the populate expression.
		if (!readonly && populate && populateDateExp && !valueProp) {
			const computed = parseDateToTime(processPopulateExpression(populateDateExp));
			if (computed != null) setValue(computed);
		}
	}, [readonly, populate, populateDateExp, valueProp, setValue]);

	const handleChange: DateTimeTimezonePickerProps['onChange'] = (date) => {
		setValue(parseDateToTime(date));
	};
	const setNow = () => {
		// get only the time part from the current date (as a string)
		const now = new Date();
		// This is to allow setting the time to the end of the current minute to avoid the time being in the past
		// when seconds are > 0 and allowPastDate is false
		now.setSeconds(59, 0);
		const timeString = parseDateToTime(now);
		setValue(timeString);
	};
	const clearValue = () => setValue(null);

	return (
		<FormsEngineField htmlFor={htmlId} field={field} length={value?.length}>
			<DateTimeTimezonePicker
				value={dateValue}
				disablePast={!allowPastDate}
				disabled={readonly}
				autoFocus={autoFocus}
				onChange={handleChange}
				disableTimezoneSelection={!useCustomTimezone}
				pickers={['time']}
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
	);
}

export default Time;
