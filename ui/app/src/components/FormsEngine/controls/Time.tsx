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
	const [hours, minutes, seconds] = time.split(':').map(Number);
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

export function Time(props: TimeProps) {
	const { field, value, setValue, readonly, autoFocus } = props;
	const dateValue = parseTimeToDate(value);
	const htmlId = useId();
	const allowPastDate = field.properties.allowPastDate?.value ?? false;
	const useCustomTimezone = field.properties.useCustomTimezone?.value ?? false;
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
		console.log('timeString', timeString);
		setValue(timeString);
	};
	const clearValue = () => setValue(null);

	return (
		<FormsEngineField htmlFor={htmlId} field={field} length={value?.length}>
			<DateTimeTimezonePicker
				value={dateValue}
				disablePast={!allowPastDate}
				disabled={readonly}
				onChange={handleChange}
				disableTimezoneSelection={!useCustomTimezone}
				pickers={['time']}
				sxs={{
					root: { flexDirection: 'row', gap: 2 },
					dateTimePicker: { flex: 1 },
					timezoneAutocomplete: { flex: 1 }
				}}
			/>
			<Box display="flex" gap={2} justifyContent="flex-end">
				<SecondaryButton onClick={setNow}>
					<FormattedMessage defaultMessage="Set now" />
				</SecondaryButton>
				<SecondaryButton onClick={clearValue}>
					<FormattedMessage defaultMessage="Clear value" />
				</SecondaryButton>
			</Box>
		</FormsEngineField>
	);
}

export default Time;
