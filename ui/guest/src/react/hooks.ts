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

import { EventHandler, SyntheticEvent, useEffect, useRef, useState } from 'react';
import { ContentInstance } from '@craftercms/studio-ui/models/ContentInstance';
import { useGuestContext, useIsAuthoring } from './GuestContext';
import { deregister, register } from '../elementRegistry';
import { nnou, nou, pluckProps } from '@craftercms/studio-ui/utils/object';
import { ICEProps } from '../models/InContextEditing';
import { byPathFetchIfNotLoaded, model$, models$ } from '../contentController';
import { distinctUntilChanged, map, withLatestFrom } from 'rxjs/operators';
import { denormalizeModel } from '@craftercms/studio-ui/utils/content';
import * as Model from '@craftercms/studio-ui/utils/model';
import { MutableRef } from '@craftercms/studio-ui/models';

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
  ref?: MutableRef<any>;
  model: ContentInstance;
  noRef?: boolean;
}

interface ICEMaterials {
  model: ContentInstance;
  props: Partial<ICEHandlers> & {
    ref?: MutableRef<any>;
  };
}

interface UseModelProps extends Omit<ICEProps, 'modelId'> {
  model: ContentInstance;
}

// endregion

const handlerMap = {
  mouseover: 'onMouseOver',
  mouseout: 'onMouseLeave',
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
  const inAuthoring = useIsAuthoring();
  const { onEvent, draggable } = context ?? {};
  const elementRef = useRef<HTMLElement>();
  const elementRegistryId = useRef<number>();
  const model = useHotReloadModel(props);
  const modelId = props.model?.craftercms.id;

  // Register
  useEffect(() => {
    if (inAuthoring) {
      elementRegistryId.current = register({
        element: elementRef.current,
        modelId: modelId,
        fieldId: props.fieldId,
        index: props.index
      });
      return () => {
        // Deregister
        deregister(elementRegistryId.current);
      };
    }
  }, [props.index, props.fieldId, modelId, inAuthoring]);

  const ref: ICEMaterials['props']['ref'] = (node) => {
    // During React update cycles, it may momentarily set the ref to
    // null and then back to the previous element. We're only paying attention
    // to the times that there is an element. Final de-registration occurs
    // at unmount time.
    if (node) {
      elementRef.current = node;
    }
    if (props.ref) {
      if (typeof props.ref === 'function') {
        props.ref(node);
      } else {
        props.ref.current = node;
      }
    }
  };

  if (inAuthoring && model) {
    const isDraggable = nnou(draggable[elementRegistryId.current]) && draggable[elementRegistryId.current] !== false;
    const handler = (event: SyntheticEvent) => {
      // Registering here would be elegant (lazy registration) however
      // it would take a toll on the ContentTree panel
      if (onEvent(event, elementRegistryId.current)) {
        event.persist();
      } else {
        props[handlerMap[event.type]]?.();
      }
    };
    return {
      model,
      props:
        props.noRef !== true
          ? {
              ref,
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
          : null
    };
  } else {
    return bypassICE({ ...props, ref });
  }
}

export function useHotReloadModel(props: UseModelProps): any {
  const context = useGuestContext();
  const inAuthoring = Boolean(context) && Boolean(context.hasHost);
  const [model, setModel] = useState(props.model);
  const id = props.model?.craftercms.id;
  const path = props.model?.craftercms.path;
  useEffect(() => {
    if (inAuthoring) {
      // Insure the model gets loaded.
      path && byPathFetchIfNotLoaded(path).subscribe();
      const s = model$(id)
        .pipe(
          distinctUntilChanged((prev, next) => {
            if (nou(props.fieldId)) {
              return prev === next;
            } /* if (nnou(props.index) && nnou(props.fieldId)) {
              return prev[props.fieldId] === next[props.fieldId];
            } else */ else {
              // Accounting for multiple (comma separated) fields
              return !props.fieldId
                .replace(/\s/g, '')
                .split(',')
                .some((field) => prev[field] !== next[field]);
            }
          }),
          withLatestFrom(models$),
          map(([model, models]) => denormalizeModel(model, models))
        )
        .subscribe(setModel);
      return () => s.unsubscribe();
    }
  }, [inAuthoring, props.fieldId, id, path]);
  return model;
}

export function useFieldValue(props: UseModelProps): any {
  const { model, fieldId } = props;
  return Model.value(model, fieldId);
}

// TODO: Future authoring-less version of the hooks for live?
// if (process.env.NODE_ENV === 'craftercms_live') {
//   export { bypassICE as useICE }
// } else {
//   export { useICE }
// }
