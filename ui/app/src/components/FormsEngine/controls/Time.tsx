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

import React, { useId, useMemo } from 'react';
import { FormsEngineField } from '../components/FormsEngineField';
import { ControlProps } from '../types';
import { DateTimeTimezonePicker, type DateTimeTimezonePickerProps } from '../../DateTimeTimezonePicker';
import SecondaryButton from '../../SecondaryButton';
import { FormattedMessage } from 'react-intl';
import Box from '@mui/material/Box';

export interface TimeProps extends ControlProps {
	value: string;
}

const parseTimeToDate = (time: string): Date => {
	if (!time) {
		return null;
	}
	const [h, m = '0', s = '0'] = time.split(':');
	const hours = Number(h);
	const minutes = Number(m);
	const seconds = Number(s);
	const date = new Date();
	date.setHours(hours, minutes, seconds, 0);
	return date;
};

const parseDateToTime = (date: Date): string => {
	if (!date) {
		return null;
	}
	return date.toLocaleTimeString('en-US', { hour12: false });
};

const validatePopulateDateExp = (expr: string): boolean => {
	return Boolean(expr.replace(/ /g, '').match(/(now)?(\+|\-)\d+((hours)|(minutes))/gi));
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
			const action = dateExp.match(/(\+|\-)/gi)[0];
			const expValue = parseInt(dateExp.match(/\d+/gi)[0]);
			const type = dateExp.match(/((hours)|(minutes))/gi)[0];
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

export function Time(props: TimeProps) {
	const { field, value: valueProp, setValue, readonly: formReadonly, autoFocus } = props;
	const htmlId = useId();

	// region field properties/validations
	const allowPastDate = field.properties.allowPastDate?.value ?? false;
	const useCustomTimezone = field.properties.useCustomTimezone?.value ?? false;
	const readonly = formReadonly || (field.properties.readonly?.value as boolean);
	const showClear = field.properties.showClear?.value ?? false;
	const showSetNow = field.properties.showNowLink?.value ?? false;
	const populate = field.properties.populate?.value ?? false;
	const populateDateExp = field.properties.populateDateExp?.value as string;
	// endregion

	// If populate is true and there is no value, set it to the current time
	const value = useMemo(() => {
		if (populate && populateDateExp && !valueProp) {
			return parseDateToTime(processPopulateExpression(populateDateExp));
		}
		return valueProp;
	}, [valueProp, populate, populateDateExp]);
	const dateValue = parseTimeToDate(value);

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
