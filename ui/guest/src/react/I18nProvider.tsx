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

import React, { PropsWithChildren, useEffect, useState } from 'react';
import { IntlShape, RawIntlProvider } from 'react-intl';
import { getCurrentIntl, intl$ } from '../utils/i18n';

export function I18nProvider(props: PropsWithChildren<{}>) {
  const [intl, setIntl] = useState<IntlShape>(() => getCurrentIntl());
  useEffect(() => {
    const sub = intl$.subscribe(setIntl);
    return () => sub.unsubscribe();
  }, []);
  return <RawIntlProvider children={props.children} value={intl} />;
}
