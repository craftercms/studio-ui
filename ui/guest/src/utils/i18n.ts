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

import { createIntl, createIntlCache, IntlShape } from 'react-intl';
import { Subject } from 'rxjs';
import { BundledLocaleCodes, getCurrentLocale } from '@craftercms/studio-ui/utils/i18n';
import LookupTable from '@craftercms/studio-ui/src/models/LookupTable';

/* private */
const currentTranslations = { en: {} };

const fetchedLocales: Partial<Record<BundledLocaleCodes, boolean>> = { en: true };

/* private */
const intl$$ = new Subject<IntlShape>();

/* public */
export const intl$ = intl$$.asObservable();

/* private */
let intl = createIntl({ locale: 'en', messages: currentTranslations.en }, createIntlCache());

if (getCurrentLocale() !== 'en') {
	createIntlInstance(getCurrentLocale()).then((newIntl) => {
		intl = newIntl;
		intl$$.next(newIntl);
	});
}

async function fetchLocale(locale: string): Promise<LookupTable<string>> {
	let translations;
	switch (locale) {
		case 'de':
			translations = await import('../translations/de.json');
			break;
		case 'es':
			translations = await import('../translations/es.json');
			break;
		case 'ko':
			translations = await import('../translations/ko.json');
			break;
		default:
			translations = Promise.resolve({});
			break;
	}
	return translations.default ?? translations;
}

async function createIntlInstance(localeCode: string): Promise<IntlShape> {
	if (
		!fetchedLocales[localeCode] &&
		// Nothing to fetch point if we don't have the locale
		['de', 'es', 'ko'].includes(localeCode)
	) {
		const fetchedTranslations = await fetchLocale(localeCode as BundledLocaleCodes);
		// Plugins may have added translations to a locale that hasn't been fetched.
		currentTranslations[localeCode] = { ...currentTranslations[localeCode], ...fetchedTranslations };
		fetchedLocales[localeCode] = true;
	}
	return createIntl(
		{
			locale: localeCode,
			messages: currentTranslations[localeCode] || currentTranslations.en
		},
		createIntlCache()
	);
}

export function getCurrentIntl(): IntlShape {
	return intl;
}
