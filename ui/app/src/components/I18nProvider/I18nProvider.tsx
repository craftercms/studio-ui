/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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
import { getCurrentIntl, intl$ } from '../../utils/i18n';
import { delay } from 'rxjs/operators';

export function I18nProvider(props: PropsWithChildren<{}>) {
  const [intl, setIntl] = useState<IntlShape>(getCurrentIntl());
  useEffect(() => {
    // When plugins load and register translations, react may be
    // in the middle of a render cycle (via Widget) and throws
    // if we dispatch this immediately — hence the delay.
    const sub = intl$.pipe(delay(0)).subscribe(setIntl);
    return () => sub.unsubscribe();
  }, []);
  return <RawIntlProvider children={props.children} value={intl} />;
}

export default I18nProvider;
