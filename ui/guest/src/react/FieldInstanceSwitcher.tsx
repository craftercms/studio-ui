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

import React from 'react';

interface FieldInstanceSwitcherProps {
  currentElement: number;
  registryEntryIds: number[];
  onNext(): void;
  onPrev(): void;
}

export function FieldInstanceSwitcher(props: FieldInstanceSwitcherProps) {
  const { onNext, onPrev, registryEntryIds, currentElement } = props;
  return (
    <craftercms-field-instance-switcher>
      <span>
        {currentElement + 1}/{registryEntryIds.length}
      </span>
      <i onClick={onPrev} className={currentElement === 0 ? 'disable' : ''}>
        <svg focusable="false" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14.71 6.71a.9959.9959 0 00-1.41 0L8.71 11.3c-.39.39-.39 1.02 0 1.41l4.59 4.59c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L10.83 12l3.88-3.88c.39-.39.38-1.03 0-1.41z"></path>
        </svg>
      </i>
      <i onClick={onNext} className={currentElement + 1 === registryEntryIds.length ? 'disable' : ''}>
        <svg focusable="false" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9.29 6.71c-.39.39-.39 1.02 0 1.41L13.17 12l-3.88 3.88c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l4.59-4.59c.39-.39.39-1.02 0-1.41L10.7 6.7c-.38-.38-1.02-.38-1.41.01z"></path>
        </svg>
      </i>
    </craftercms-field-instance-switcher>
  );
}

export default FieldInstanceSwitcher;
