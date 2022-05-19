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

import { PropsWithChildren, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { decrementMinimizedBarCount, incrementMinimizedBarCount } from './minimizedBarCounter';

let portalEl;

function createPortalEl() {
  if (!portalEl) {
    portalEl = document.createElement('div');
    portalEl.setAttribute('class', 'minimized-bar-portal-root');
    document.body.appendChild(portalEl);
  }
  return portalEl;
}

export function MinimizedBarPortal(props: PropsWithChildren<{}>) {
  const el = createPortalEl();
  useEffect(() => {
    incrementMinimizedBarCount();
    return () => decrementMinimizedBarCount();
  }, []);
  return createPortal(props.children, el) as JSX.Element;
}

export default MinimizedBarPortal;
