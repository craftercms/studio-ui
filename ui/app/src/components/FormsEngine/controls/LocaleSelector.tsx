/*
 * Copyright (C) 2007-2026 Crafter Software Corporation. All Rights Reserved.
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

import { ControlProps } from '../types';
import React, { useEffect, useState } from 'react';
import { fetchSiteLocales } from '../../../services/translation';
import useActiveSiteId from '../../../hooks/useActiveSiteId';
import { pushErrorDialog } from '../../../utils/system';
import { useDispatch } from 'react-redux';
import { extractErrorPayload } from '../../../utils/ajax';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import FormsEngineField from '../components/FormsEngineField';
import MenuItem from '@mui/material/MenuItem';
import useUpdateRefs from '../../../hooks/useUpdateRefs';
import Skeleton from '@mui/material/Skeleton';

export interface LocaleSelectorProps extends ControlProps {
	value: string;
}

export function LocaleSelector(props: LocaleSelectorProps) {
	const { field, value, setValue, autoFocus } = props;
	const [isFetching, setIsFetching] = useState(false);
	const [localeData, setLocaleData] = useState<{
		localeCodes: {
			code: string;
			label: string;
		}[];
		defaultLocaleCode: string;
	}>();
	const siteId = useActiveSiteId();
	const dispatch = useDispatch();
	const handleChange = (event: SelectChangeEvent) => setValue(event.target.value);
	const refs = useUpdateRefs({ value });

	useEffect(() => {
		setIsFetching(true);
		const subscription = fetchSiteLocales(siteId).subscribe({
			next: ({ localeCodes, defaultLocaleCode }) => {
				setIsFetching(false);
				if (localeCodes) {
					setLocaleData({
						localeCodes: localeCodes.map((code) => ({
							code,
							label: getLocaleLabel(code)
						})),
						defaultLocaleCode
					});
				}
				if (!refs.current.value && defaultLocaleCode) {
					setValue(defaultLocaleCode);
				}
			},
			error: (e) => {
				setIsFetching(false);
				dispatch(pushErrorDialog({ props: { error: extractErrorPayload(e) } }));
			}
		});

		return () => {
			subscription.unsubscribe?.();
		};
	}, [siteId, dispatch, refs, setValue, setIsFetching]);

	if (!isFetching && !localeData) return null;

	return (
		<FormsEngineField field={field}>
			{isFetching ? (
				<Skeleton variant="rounded" width="100%" height={50} />
			) : (
				<Select value={value} onChange={handleChange} autoFocus={autoFocus}>
					{localeData.localeCodes.map((locale) => (
						<MenuItem key={locale.code} value={locale.code}>
							{locale.label}
						</MenuItem>
					))}
				</Select>
			)}
		</FormsEngineField>
	);
}

function getLocaleLabel(localeCode: string) {
	const parts = localeCode.split('_');
	const lang = parts[0];
	const region = parts[1];
	const locale: string = region ? `${lang}-${region.toUpperCase()}` : lang;
	let languageLabel: string;
	let regionLabel: string | undefined;
	try {
		const languageNames = new Intl.DisplayNames([locale], { type: 'language' });
		languageLabel = languageNames.of(lang) || lang;
		if (region) {
			const regionNames = new Intl.DisplayNames([locale], { type: 'region' });
			regionLabel = regionNames.of(region.toUpperCase()) || region.toUpperCase();
		}
	} catch {
		languageLabel = lang;
		if (region) {
			regionLabel = region.toUpperCase();
		}
	}
	return regionLabel ? `${languageLabel} (${regionLabel})` : languageLabel;
}

export default LocaleSelector;
