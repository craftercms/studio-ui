/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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

import { EventHandler, MutableRefObject, SyntheticEvent, useRef } from 'react';
import { ContentInstance } from '@craftercms/studio-ui/models/ContentInstance';
import { useGuestContext } from './components/GuestContext';

interface UseICEProps {
  model: ContentInstance;
}

interface ICEMaterials {
  ref: MutableRefObject<(el: HTMLElement) => void>;
  // setRef: MutableRefObject<HTMLElement>;
  // onMouseMove: EventHandler<SyntheticEvent<HTMLElement, MouseEvent>>;
  onMouseOver: EventHandler<SyntheticEvent<HTMLElement, MouseEvent>>;
  onMouseLeave: EventHandler<SyntheticEvent<HTMLElement, MouseEvent>>;
  onDragStart: EventHandler<SyntheticEvent<HTMLElement, MouseEvent>>;
  onDragOver: EventHandler<SyntheticEvent<HTMLElement, MouseEvent>>;
  onDragLeave: EventHandler<SyntheticEvent<HTMLElement, MouseEvent>>;
  onDrop: EventHandler<SyntheticEvent<HTMLElement, MouseEvent>>;
  onDragEnd: EventHandler<SyntheticEvent<HTMLElement, MouseEvent>>;
  onClick: EventHandler<SyntheticEvent<HTMLElement, MouseEvent>>;
  onDblClick: EventHandler<SyntheticEvent<HTMLElement, MouseEvent>>;
}

export function useICE(props: UseICEProps): ICEMaterials {
  const ref: ICEMaterials['ref'] = useRef((el) => {
    console.log(el)
  });
  const { onEvent } = useGuestContext();
  return {
    ref,
    onMouseOver: onEvent,
    onMouseLeave: onEvent,
    onDragStart: onEvent,
    onDragOver: onEvent,
    onDragLeave: onEvent,
    onDrop: onEvent,
    onDragEnd: onEvent,
    onClick: onEvent,
    onDblClick: onEvent
  };
}
