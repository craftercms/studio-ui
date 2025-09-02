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

export function DateTime(props: DateTimeProps) {
	const { field, value, setValue, readonly, autoFocus } = props;
	const htmlId = useId();
	const allowPastDate = field.properties.allowPastDate?.value ?? false;
	const useCustomTimezone = field.properties.useCustomTimezone?.value ?? false;
	const showTime = field.properties.showTime?.value ?? false;
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
		<FormsEngineField htmlFor={htmlId} field={field} length={value?.length}>
			<DateTimeTimezonePicker
				value={value}
				disablePast={!allowPastDate}
				disabled={readonly}
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

export default DateTime;
