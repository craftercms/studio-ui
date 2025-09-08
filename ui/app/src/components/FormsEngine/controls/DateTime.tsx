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
export interface DateTimeProps extends ControlProps {
	value: string;
}

const validatePopulateDateExp = (expr: string): boolean => {
	return Boolean(expr.replace(/ /g, '').match(/(now)?(\+|\-)\d+((days)|(weeks)|(years)|(hours)|(minutes))/gi));
};

const processPopulateExpression = (expr: string): Date => {
	const date = new Date();
	const daysInWeek = 7;
	let modifier = 1;

	if (validatePopulateDateExp(expr)) {
		if (expr === 'now') {
			date.setSeconds(59, 0);
		} else {
			const populateDateExp = expr.replace(/ /g, '');
			const action = populateDateExp.match(/(\+|\-)/gi)[0];
			const expValue = parseInt(populateDateExp.match(/\d+/gi)[0]);
			const type = populateDateExp.match(/((days)|(weeks)|(years)|(hours)|(minutes))/gi)[0];
			if (action == '-') {
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
		date.setSeconds(59, 0);
	}
	return date;
};

export function DateTime(props: DateTimeProps) {
	const { field, value: valueProp, setValue, readonly: formReadonly, autoFocus } = props;
	const htmlId = useId();

	// region field properties/validations
	const allowPastDate = field.properties.allowPastDate?.value ?? false;
	const useCustomTimezone = field.properties.useCustomTimezone?.value ?? false;
	const showTime = field.properties.showTime?.value ?? false;
	const readonly = formReadonly || (field.properties.readonly?.value as boolean);
	const showClear = field.properties.showClear?.value ?? false;
	const showSetNow = field.properties.showNowLink?.value ?? false;
	const populate = field.properties.populate?.value ?? false;
	const populateDateExp = field.properties.populateDateExp?.value as string;
	// endregion

	const value = useMemo(() => {
		if (populate && populateDateExp && !valueProp) {
			return processPopulateExpression(populateDateExp).toISOString();
		}
		return valueProp;
	}, [valueProp, populate, populateDateExp]);

	const handleChange: DateTimeTimezonePickerProps['onChange'] = (value) => setValue(value);
	const setNow = () => setValue(new Date());
	const clearValue = () => setValue(null);
	const pickers: DateTimeTimezonePickerProps['pickers'] = useMemo(() => {
		const pickers: DateTimeTimezonePickerProps['pickers'] = ['date'];
		if (showTime) {
			pickers.push('time');
		}
		return pickers;
	}, [showTime]);

	return (
		<FormsEngineField htmlFor={htmlId} field={field} length={valueProp?.length}>
			<DateTimeTimezonePicker
				value={value}
				disablePast={!allowPastDate}
				disabled={readonly}
				autoFocus={autoFocus}
				onChange={handleChange}
				disableTimezoneSelection={!useCustomTimezone}
				pickers={pickers}
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

export default DateTime;
