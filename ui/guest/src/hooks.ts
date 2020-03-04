/*
/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { foo, isNullOrUndefined, notNullOrUndefined } from './util';
import { useContext, useEffect, useRef, useState } from 'react';
import contentController from './classes/ContentController';
import { GuestContext } from './components/GuestContext';
import { skip } from 'rxjs/operators';
import { ContentInstance } from './models/ContentInstance';

const fooEvents = {
  ref: foo,
  onMouseMove: foo,
  onMouseOver: foo,
  onMouseOut: foo,
  onClick: foo,
  onDragOver: foo,
  onDragStart: foo,
  onDragEnd: foo,
  onDrop: foo,
};

export function useICE(props) {
  if (isNullOrUndefined(props.modelId)) {
    throw new Error(`No model id was provided to useICE`);
  }

  // region State

  const { modelId, fieldId, index, label } = props;

  const { current: persistence } = useRef({
    id: null,
    label: null,
    element: null,
    refTimeout: null,
    contentReady: false
  });

  const context = useContext(GuestContext),
    {

      onEvent,
      register,
      deregister,

      inEditMode,

      dragged,
      editable,
      draggable,
      highlighted,

      // ICE_GUEST_INIT

    } = context;

  const handlers = {
    ...fooEvents,
    ...(props.handlers ? props.handlers : {})
  };

  const state = notNullOrUndefined(persistence.id) ? (
    (function (id) {
      return {
        inEditMode,
        draggable: draggable[id],
        contentEditable: editable[id],
        isBeingDragged: dragged[id],
        isHighlighted: highlighted[id]
      };
    })(persistence.id)
  ) : {
    inEditMode: false,
    draggable: false,
    contentEditable: false,
    isBeingDragged: false,
    isHighlighted: false
  };

  // endregion

  useEffect(onModelChanged, [modelId, fieldId, index]);

  useEffect(() => componentWillUnmount, []);

  // region Internal

  function onModelChanged(): void {
    // Refs setting will call onModelChanged too for the element registration.
    if (persistence.id != null) {
      deregister(persistence.id);
      persistence.id = null;
    }
    persistence.id = register({
      label,
      index,
      fieldId,
      modelId,
      id: persistence.id,
      element: persistence.element
    });
  }

  function componentWillUnmount(): void {
    deregister(persistence.id);
  }

  // endregion

  // region Ref

  function ref(element: HTMLElement): void {
    clearTimeout(persistence.refTimeout);

    try {
      if (typeof handlers.ref === 'function') {
        handlers.ref(element);
      } else {
        handlers.ref.current = element;
      }
    } catch (e) {
      console.log(e);
    }

    if (
      notNullOrUndefined(element) &&
      isNullOrUndefined(persistence.element)
    ) {
      // Clean Registration
      persistence.element = element;
      onModelChanged();
    } else if (
      isNullOrUndefined(element) &&
      notNullOrUndefined(persistence.element)
    ) {
      // During React update cycles, it may momentarily set the ref to
      // null and then back to the original element.
      // The timeout avoids going through the internal registration cycles
      // multiple times when these quick calls occur but there's nothing to
      // change internally.
      persistence.refTimeout = setTimeout(() => {
        if (element === persistence.element) {
          throw new Error('useICE: The new element & persisted element are the same.');
        }
        if (notNullOrUndefined(element)) {
          persistence.element = element;
          onModelChanged();
        }
      }, 10);
    } else {
      if (element !== persistence.element) {
        throw new Error('A new element was created but registration is not updating.');
      }
    }

  }

  // endregion

  function onClick(e: Event): void {
    if (onEvent(e, persistence.id)) {
      handlers.onClick(e);
    }
  }

  // region MouseOver Events

  function onMouseOver(e: Event): void {
    if (onEvent(e, persistence.id)) {
      handlers.onMouseOver(e);
    }
  }

  function onMouseOut(e: Event): void {
    if (onEvent(e, persistence.id)) {
      handlers.onMouseOut(e);
    }
  }

  // endregion

  // region Dragging Events

  function onDragStart(e: Event): void {
    if (onEvent(e, persistence.id)) {
      handlers.onDragStart(e);
    }
  }

  function onDragOver(e: Event): void {
    if (onEvent(e, persistence.id)) {
      handlers.onDragOver(e);
    }
  }

  function onDrop(e: Event): void {
    if (onEvent(e, persistence.id)) {
      handlers.onDrop(e);
    }
  }

  function onDragEnd(e: Event): void {
    if (onEvent(e, persistence.id)) {
      handlers.onDragEnd(e);
    }
  }

  function onDragLeave(e: Event): void {
    if (onEvent(e, persistence.id)) {
      handlers.onDragLeave(e);
    }
  }

  // endregion

  return {
    ...state,
    props: {
      ...(state.draggable ? { draggable: true } : {}),
      ref,
      // contentEditable: state.contentEditable,
      // suppressContentEditableWarning: state.contentEditable,
      onClick,
      onMouseOver,
      onMouseOut,
      onDragStart,
      onDragOver,
      onDrop,
      onDragEnd,
      onDragLeave
    }
  };

}

function useModel({ modelId }): ContentInstance {
  const [model, setModel] = useState(
    contentController.getCachedModel(modelId) || { craftercms: null }
  ); // Use react-cache resource here?
  useEffect(
    () => {
      const cached = contentController.getCachedModel(modelId);
      let model$ = contentController.getModel$(modelId);
      if (notNullOrUndefined(cached)) {
        model$ = model$.pipe(skip(1));
      }
      const sub = model$.subscribe((model) => setModel(model));
      return () => sub.unsubscribe();
    },
    [modelId]
  );
  return model;
}
