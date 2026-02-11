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
import { createIntlInstance, getCurrentLocale, ImportsLookup } from '@craftercms/studio-ui/utils/i18n';

const importsLookup: ImportsLookup = {
	de: () => import('../translations/de.json'),
	es: () => import('../translations/es.json'),
	ko: () => import('../translations/ko.json')
};

/* private */
const intl$$ = new Subject<IntlShape>();

/* public */
export const intl$ = intl$$.asObservable();

/* private */
let intl = createIntl({ locale: 'en', messages: {} }, createIntlCache());

if (getCurrentLocale() !== 'en') {
	createIntlInstance(getCurrentLocale(), importsLookup).then((newIntl) => {
		intl = newIntl;
		intl$$.next(newIntl);
	});
}

export function getCurrentIntl(): IntlShape {
	return intl;
}
