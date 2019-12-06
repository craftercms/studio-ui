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

import $ from 'jquery/dist/jquery.slim';
import { Markers } from './classes/Markers';

export const foo = () => void null;
export const
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
  TOLERANCE_PERCENTS = { x: 5, y: 5 },
  DEFAULT_RECORD_DATA = { fieldId: null, index: null, refCount: 1 };

// region Accommodation Actions
// To be moved to a common file for sharing across apps

export const HOST_CHECK_IN = 'HOST_CHECK_IN';
export const GUEST_CHECK_IN = 'GUEST_CHECK_IN';
export const GUEST_CHECK_OUT = 'GUEST_CHECK_OUT';
export const SORT_ITEM_OPERATION = 'SORT_ITEM_OPERATION';
export const INSERT_COMPONENT_OPERATION = 'INSERT_COMPONENT_OPERATION';
export const INSERT_ITEM_OPERATION = 'INSERT_ITEM_OPERATION';
export const MOVE_ITEM_OPERATION = 'MOVE_ITEM_OPERATION';
export const DELETE_ITEM_OPERATION = 'DELETE_ITEM_OPERATION';
export const UPDATE_FIELD_VALUE_OPERATION = 'UPDATE_FIELD_VALUE_OPERATION';
export const ICE_ZONE_SELECTED = 'ICE_ZONE_SELECTED';
export const CLEAR_SELECTED_ZONES = 'CLEAR_SELECTED_ZONES';
export const EDIT_MODE_CHANGED = 'EDIT_MODE_CHANGED';
export const ASSET_DRAG_STARTED = 'ASSET_DRAG_STARTED';
export const ASSET_DRAG_ENDED = 'ASSET_DRAG_ENDED';
export const COMPONENT_DRAG_STARTED = 'COMPONENT_DRAG_STARTED';
export const COMPONENT_DRAG_ENDED = 'COMPONENT_DRAG_ENDED';
export const TRASHED = 'TRASHED';
export const CONTENT_TYPES_REQUEST = 'CONTENT_TYPES_REQUEST';
export const CONTENT_TYPES_RESPONSE = 'CONTENT_TYPES_RESPONSE';
export const INSTANCE_DRAG_BEGUN = 'INSTANCE_DRAG_BEGUN';
export const INSTANCE_DRAG_ENDED = 'INSTANCE_DRAG_ENDED';
export const GUEST_MODELS_RECEIVED = 'GUEST_MODELS_RECEIVED';

// endregion

export const EditingStatus = {
  OFF: 'OFF',
  LISTENING: 'LISTENING',
  SORTING_COMPONENT: 'SORTING_COMPONENT',
  PLACING_NEW_COMPONENT: 'PLACING_NEW_COMPONENT',
  PLACING_DETACHED_COMPONENT: 'PLACING_DETACHED_COMPONENT',
  PLACING_DETACHED_ASSET: 'PLACING_DETACHED_ASSET',
  EDITING_COMPONENT: 'EDITING_COMPONENT',
  EDITING_COMPONENT_INLINE: 'EDITING_COMPONENT_INLINE'
};

export function notNullOrUndefined(value) {
  return value != null;
}

export function isNullOrUndefined(value) {
  return value == null;
}

export function not(condition) {
  return !condition;
}

export function sibling(element, next) {
  return (next)
    ? element.nextElementSibling
    : element.previousElementSibling;
}

export function forEach(array, fn, emptyReturnValue) {
  if (notNullOrUndefined(emptyReturnValue) && array.length === 0) {
    return emptyReturnValue;
  }
  for (let i = 0, l = array.length; i < l; i++) {
    const result = fn(array[i], i, array);
    if (result === 'continue') {
      continue;
    } else if (result === 'break') {
      break;
    } else if (result !== undefined) {
      return result;
    }
  }
  return emptyReturnValue;
}

export function findComponentContainerFields(fields) {
  if (!Array.isArray(fields)) {
    fields = Object.values(fields)
  }
  return fields.filter((field) => {
    if (field.type === 'node-selector') {
      return true;
    } else if (field.type === 'repeat') {
      // TODO Should repeats be considered containers?
      return false;
    } else {
      return false;
    }
  });
}

// export function findContainerField(model, fields, modelId) {
//   return forEach(fields, (field) => {
//     const value = ModelHelper.value(model, field.id);
//     if (
//       (field.type === 'node-selector' && value === modelId) ||
//       (field.type === 'array' && value.includes(modelId))
//     ) {
//       return field;
//     } else if (field.type === 'repeat') {
//       // TODO ...
//     }
//   });
// }

export function getDropMarkerPosition(args) {
  const
    {
      // refElement,
      arrangement,
      insertPosition,
      refElementRect,
      nextOrPrevRect
    } = args,

    horizontal = (arrangement === HORIZONTAL),
    before = (insertPosition === 'before'),

    // $elementToInsert = $(refElement),

    // This vars are just for mental clarity; to work with
    // the right semantics in the code below.
    // If inserting before the element, will be working with
    // the previous element's rect (prev rect). If inserting
    // after, will be working with the next element's rect.
    nextRect = nextOrPrevRect,
    prevRect = nextOrPrevRect;

  // If there is not next/prev rect, no need to account for it
  // in the position calculation - set difference to 0.
  const difference = (!nextOrPrevRect) ? (0) : (
    // Account for whether the previous rect inline with current rect...
    // Only matters when working with horizontally laid-out elements
    (horizontal && nextOrPrevRect.top !== refElementRect.top) ? (0) : (
      // Calculate the middle point between the two adjacent rects.
      // This avoids the drop marker moving by millimeters when switching from
      // inserting after nodes[i] to before node[i+1]
      (before)
        ? (
          // Inserting before
          (horizontal)
            // Smaller number fronted to obtain a negative
            // value since wish to subtract from the position
            ? ((prevRect.right - refElementRect.left) / 2)
            : ((prevRect.bottom - refElementRect.top) / 2)
        )
        : (
          // Inserting after
          (horizontal)
            // Bigger number fronted to obtain a positive
            // value to add to the position
            ? ((nextRect.left - refElementRect.right) / 2)
            : ((nextRect.top - refElementRect.bottom) / 2)
        )
    )
  );

  return (
    (horizontal)
      ? {
        height: refElementRect.height,
        top: refElementRect.top,
        left: (before)
          ? (refElementRect.left + difference)
          : (refElementRect.right + difference)
      } : {
        width: refElementRect.width,
        top: before
          ? refElementRect.top + difference
          : refElementRect.bottom + difference,
        left: (refElementRect.left)
      }
  );

}

export function insertDropMarker({ $dropMarker, insertPosition, refElement }) {
  if (insertPosition === 'after') {
    $dropMarker.insertAfter(refElement);
  } else {
    $dropMarker.insertBefore(refElement);
  }
}

export function getDistanceBetweenPoints(p1, p2) {
  const div = document.createElement('div');
  return Math.sqrt(
    Math.pow(p2.x - p1.x, 2) +
    Math.pow(p2.y - p1.y, 2)
  );
}

export function findClosestRect(parentRect, subRects, coordinates) {
  let //
    index = -1,
    distances = []
  ;

  subRects.forEach((rect, i) => {
    const stats = getInRectStats(rect, coordinates);

    (stats.inRect) && (index = i);

    distances.push(
      getDistanceBetweenPoints(
        coordinates,
        {
          x: rect.left + (rect.width / 2),
          y: rect.top + (rect.height / 2)
        }
      )
    );

    return stats;
  });

  if (index === -1) {
    index = distances.indexOf(
      Math.min(...distances)
    );
  }

  return index;
}

export function getChildArrangement(children, childrenRects) {
  let //
    topValues = [],
    alignedTop = false;

  for (
    let
      i = 0,
      l = children.length,
      topValue,
      marginTop;
    i < l;
    i++
  ) {

    marginTop = parseInt(
      // jQuery is kind enough to always provide the value in pixels :)
      $(children[i]).css('margin-top').replace(/px/i, '') || '',
      10
    );

    topValue = childrenRects[i].top - marginTop;

    if (topValues.includes(topValue)) {
      alignedTop = true;
      break;
    } else {
      topValues.push(topValue);
    }

  }

  return alignedTop ? HORIZONTAL : VERTICAL;
}

export function getInRectStats(rect, coordinates, tolerancePercents = TOLERANCE_PERCENTS) {
  const
    percents = Markers.getRelativePointerPositionPercentages(
      coordinates,
      rect
    ),

    inRectTop = (coordinates.y >= rect.top),
    inRectRight = (coordinates.x <= rect.right),
    inRectBottom = (coordinates.y <= rect.bottom),
    inRectLeft = (coordinates.x >= rect.left),
    inRect = (
      inRectLeft &&
      inRectRight &&
      inRectTop &&
      inRectBottom
    ),
    inInnerRectTop = percents.y >= tolerancePercents.y,
    inInnerRectRight = percents.x <= (100 - tolerancePercents.x),
    inInnerRectBottom = percents.y <= (100 - tolerancePercents.y),
    inInnerRectLeft = percents.x >= tolerancePercents.x,
    inInnerRect = (
      inInnerRectLeft && // left
      inInnerRectRight && // right
      inInnerRectTop && // top
      inInnerRectBottom // bottom
    )
  ;

  return {
    inRectTop,
    inRectRight,
    inRectBottom,
    inRectLeft,
    inRect,
    inInnerRectTop,
    inInnerRectRight,
    inInnerRectBottom,
    inInnerRectLeft,
    inInnerRect,
    percents
  };
}

export function pluckProps(source, ...props) {
  const object = {};
  if (isNullOrUndefined(source)) {
    return object;
  }
  props.forEach((prop) => {
    if (notNullOrUndefined(source[prop])) {
      object[prop] = source[prop];
    }
  });
  return object;
}

export function reversePluckProps(source, ...props) {
  const object = {};
  if (isNullOrUndefined(source)) {
    return object;
  }
  for (let key in source) {
    if (!props.includes(key) && source.hasOwnProperty(key)) {
      object[key] = source[key];
    }
  }
  return object;
}

export function capitalize(str) {
  return `${str.charAt(0).toUpperCase()}${str.substr(1)}`;
}

export function retrieveProperty(object, prop) {
  return (object == null) ? null : prop.split('.').reduce((value, prop) => value[prop], object);
}

export function createLookupTable(list, idProp = 'id') {
  const table = {};
  list.forEach((item) => {
    table[retrieveProperty(item, idProp)] = item;
  });
  return table;
}

export function addClickListener() {

  const mouseDown$ = fromEvent(document, 'mousedown');
  const mouseDownTimer$ = mouseDown$.pipe(delay(300), share());
  const mouseUp$ = fromEvent(document, 'mouseup');
  const click$ = mouseDown$.pipe(
    switchMap(() => mouseUp$.pipe(
      takeUntil(mouseDownTimer$),
      take(1)
    ))
  );

  mouseDownTimer$.subscribe((e) => void null);

  click$.subscribe((e) => {
    console.log('Click!', e);
  });

}
