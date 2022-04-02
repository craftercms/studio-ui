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

import { UNDEFINED } from '../../utils/constants';
import Person from '../../models/Person';
import { Dispatch, SetStateAction } from 'react';
import { useSpreadState } from '../../hooks';

export interface CommonDashletProps {
  contentHeight?: number | string;
  borderLeftColor?: string;
}

export function parseDashletContentHeight(contentHeight: string | number): number {
  return contentHeight ? parseInt(`${contentHeight}`.replace('px', '')) : UNDEFINED;
}

export function getPersonFullName(person: Person): string {
  return `${person.firstName} ${person.lastName}`;
}

export interface WithSelectedStateItem {
  id: string | number;
}

export interface WithSelectedState<ItemType extends WithSelectedStateItem = { id: string | number }> {
  items: ItemType[];
  isAllSelected: boolean;
  selected: Record<string | number, boolean>;
}

export function useSpreadStateWithSelected<S extends WithSelectedState>(
  initialState: S
): [
  S,
  Dispatch<SetStateAction<Partial<S>>>,
  (e, item: WithSelectedStateItem) => void,
  (e) => void,
  <T extends WithSelectedStateItem>(item: T) => boolean
] {
  const [state, setState] = useSpreadState<S>(initialState);
  const { items, selected } = state;
  const onSelectAll = (e) => {
    const nextState: Partial<S> = {};
    if (e.target.checked) {
      // Check all
      nextState.selected = items.reduce((state, item) => {
        state[item.id] = true;
        return state;
      }, {});
      nextState.isAllSelected = true;
    } else {
      // Uncheck all
      nextState.selected = {};
      nextState.isAllSelected = false;
    }
    setState(nextState);
  };
  const onSelectItem = (e, item) => {
    let isChecked = e.target.checked;
    // @ts-ignore
    let nextState: Partial<S> = { selected: { ...selected, [item.id]: isChecked } };
    if (isChecked) {
      let checkedOnly = Object.values(nextState.selected).filter(Boolean);
      if (checkedOnly.length === items.length) {
        nextState.isAllSelected = true;
      }
    } else {
      nextState.isAllSelected = false;
    }
    setState(nextState);
  };
  const isSelected = (item) => {
    return selected[item.id] ?? false;
  };
  return [state, setState, onSelectItem, onSelectAll, isSelected];
}
