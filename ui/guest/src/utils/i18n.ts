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
import { hostCheckIn } from '@craftercms/studio-ui/state/actions/preview';
import { fromTopic } from './communicator';

type BundledLocaleCodes = 'en' | 'es' | 'de' | 'ko';

type ImportsLookup = Record<string, () => Promise<{ default: Record<string, string> }>>;
const importsLookup: ImportsLookup = {
	de: () => import('../translations/de.json'),
	es: () => import('../translations/es.json'),
	ko: () => import('../translations/ko.json')
};

/* private */
let currentTranslations: Record<string, Record<string, string>> = { en: {} };

/* private */
let fetchedLocales: Partial<Record<BundledLocaleCodes, boolean>> = { en: true };

/* private */
const intl$$ = new Subject<IntlShape>();

/* public */
export const intl$ = intl$$.asObservable();

/* private */
// Default to English; Studio sends the authoring locale via hostCheckIn.
let intl = createIntl({ locale: 'en', messages: currentTranslations.en }, createIntlCache());

async function fetchLocale(locale: string): Promise<Record<string, string>> {
	const importFn = importsLookup[locale];
	if (!importFn) {
		return {};
	}
	const translations = await importFn();
	return translations.default;
}

async function createIntlInstance(localeCode: string): Promise<IntlShape> {
	if (!fetchedLocales[localeCode] && ['de', 'es', 'ko'].includes(localeCode)) {
		const fetchedTranslations = await fetchLocale(localeCode);
		currentTranslations[localeCode] = { ...currentTranslations[localeCode], ...fetchedTranslations };
		fetchedLocales[localeCode as BundledLocaleCodes] = true;
	}
	return createIntl(
		{
			locale: localeCode,
			messages: currentTranslations[localeCode] || currentTranslations.en
		},
		createIntlCache()
	);
}

let requestedLocale = intl.locale;
// Do not read localStorage here — guest may run for example in a Next.js app.
fromTopic(hostCheckIn.type).subscribe(({ payload }) => {
	const locale = payload?.locale;
	if (locale) {
		requestedLocale = locale;
	}
	if (locale && locale !== intl.locale) {
		createIntlInstance(locale).then(
			(newIntl) => {
				if (locale !== requestedLocale) return;
				intl = newIntl;
				intl$$.next(newIntl);
			},
			(error) => {
				if (locale !== requestedLocale) return;
				console.error(`[Guest] Failed to load locale "${locale}". Falling back to English.`, error);
				const fallbackIntl = createIntl(
					{ locale: 'en', messages: currentTranslations.en },
					createIntlCache()
				);
				intl = fallbackIntl;
				intl$$.next(fallbackIntl);
			}
		);
	}
});

export function getCurrentIntl(): IntlShape {
	return intl;
}
