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

import { EventHandler, MutableRefObject, SyntheticEvent, useEffect, useRef, useState } from 'react';
import { ContentInstance } from '@craftercms/studio-ui/models/ContentInstance';
import { useGuestContext } from './components/GuestContext';
import registry from './classes/ElementRegistry';
import { nnou, nou, pluckProps } from './utils/object';
import { ICEProps } from './models/InContextEditing';
import { getModel$, models$ } from './classes/ContentController';
import { distinctUntilChanged, map, withLatestFrom } from 'rxjs/operators';
import { denormalizeModel } from './utils/content';
import Model from './utils/model';

// region Typings

interface ICEHandlers {
  onMouseOver: EventHandler<SyntheticEvent<HTMLElement, MouseEvent>>;
  onMouseLeave: EventHandler<SyntheticEvent<HTMLElement, MouseEvent>>;
  onDragStart: EventHandler<SyntheticEvent<HTMLElement, MouseEvent>>;
  onDragOver: EventHandler<SyntheticEvent<HTMLElement, MouseEvent>>;
  onDragLeave: EventHandler<SyntheticEvent<HTMLElement, MouseEvent>>;
  onDrop: EventHandler<SyntheticEvent<HTMLElement, MouseEvent>>;
  onDragEnd: EventHandler<SyntheticEvent<HTMLElement, MouseEvent>>;
  onClick: EventHandler<SyntheticEvent<HTMLElement, MouseEvent>>;
  onDoubleClick: EventHandler<SyntheticEvent<HTMLElement, MouseEvent>>;
}

interface UseICEProps extends Omit<ICEProps, 'modelId'>, Partial<ICEHandlers> {
  ref?: (node: HTMLElement) => void | MutableRefObject<HTMLElement>;
  model: ContentInstance;
  noRef?: boolean;
}

interface ICEMaterials {
  model: ContentInstance;
  props: Partial<ICEHandlers> & {
    ref?: (node: HTMLElement) => void;
  };
}

interface UseModelProps extends Omit<ICEProps, 'modelId'> {
  model: ContentInstance;
}

// endregion

const handlerMap = {
  mouseover: 'onMouseOver',
  mouseleave: 'onMouseLeave',
  dragstart: 'onDragStart',
  dragover: 'onDragOver',
  dragleave: 'onDragLeave',
  drop: 'onDrop',
  dragend: 'onDragEnd',
  click: 'onClick',
  dblclick: 'onDoubleClick'
};

function bypassICE(props: UseICEProps): ICEMaterials {
  return {
    model: props.model,
    props: pluckProps(
      props,
      'ref',
      'onMouseOver',
      'onMouseLeave',
      'onDragStart',
      'onDragOver',
      'onDragLeave',
      'onDrop',
      'onDragEnd',
      'onClick',
      'onDoubleClick'
    )
  };
}

export function useICE(props: UseICEProps): ICEMaterials {
  const context = useGuestContext();
  const inAuthoring = Boolean(context) && Boolean(context.hasHost);
  const { onEvent, draggable } = context ?? {};
  const elementRef = useRef<HTMLElement>();
  const elementRegistryId = useRef<number>();
  const refTimeout = useRef<any>();
  const model = useHotReloadModel(props);

  if (inAuthoring) {
    // prettier-ignore
    const isDraggable = (
      nnou(draggable[elementRegistryId.current]) &&
      draggable[elementRegistryId.current] !== false
    );
    const handler = (event: SyntheticEvent) => {
      // Registering here would be elegant (lazy registration) however
      // it would take a toll on the ContentTree panel
      if (onEvent(event, elementRegistryId.current)) {
        event.persist();
      } else {
        props[handlerMap[event.type]]?.();
      }
    };
    const ref: ICEMaterials['props']['ref'] = (node) => {
      if (node) {
        clearTimeout(refTimeout.current);
        if (elementRef.current !== node) {
          elementRef.current = node;
          elementRegistryId.current = registry.register({
            element: elementRef.current,
            modelId: props.model.craftercms.id,
            fieldId: props.fieldId,
            index: props.index
          });
        }
      } else {
        // During React update cycles, it may momentarily set the ref to
        // null and then back to the previous element. The timeout avoids going
        // through the internal registration cycles multiple times when these quick
        // calls occur but there's nothing to change internally.
        clearTimeout(refTimeout.current);
        elementRegistryId.current &&
          (refTimeout.current = setTimeout(() => {
            elementRegistryId.current && registry.deregister(elementRegistryId.current);
            elementRegistryId.current = null;
          }, 50));
      }
      if (props.ref) {
        if (typeof props.ref === 'function') {
          props.ref(node);
        } else {
          (props.ref as MutableRefObject<HTMLElement>).current = node;
        }
      }
    };
    return {
      model,
      props: {
        ...(props.noRef !== true ? { ref } : {}),
        ...(isDraggable ? { draggable: true } : {}),
        onMouseOver: handler,
        onMouseLeave: handler,
        onDragStart: handler,
        onDragOver: handler,
        onDragLeave: handler,
        onDrop: handler,
        onDragEnd: handler,
        onClick: handler,
        onDoubleClick: handler
      }
    };
  } else {
    return bypassICE(props);
  }
}

export function useHotReloadModel(props: UseModelProps): any {
  const context = useGuestContext();
  const inAuthoring = Boolean(context) && Boolean(context.hasHost);
  const [model, setModel] = useState(props.model);
  useEffect(() => {
    if (inAuthoring) {
      const s = getModel$(props.model.craftercms.id)
        .pipe(
          distinctUntilChanged((prev, next) => {
            if (nou(props.fieldId)) {
              return prev === next;
            } /*if (nnou(props.index) && nnou(props.fieldId)) {
              return prev[props.fieldId] === next[props.fieldId];
            } else*/ else {
              return prev[props.fieldId] === next[props.fieldId];
            }
          }),
          withLatestFrom(models$()),
          map(([model, models]) => denormalizeModel(model, models))
        )
        .subscribe(setModel);
      return () => s.unsubscribe();
    }
  }, [inAuthoring, props.fieldId, props.model.craftercms.id]);
  return model;
}

export function useFieldValue(props: UseModelProps): any {
  const { model, fieldId } = props;
  return Model.value(model, fieldId);
}

// TODO: Future authoring-less version of the hooks for live
// if (process.env.NODE_ENV === 'craftercms_live') {
//   export { bypassICE as useICE }
// } else {
//   export { useICE }
// }
