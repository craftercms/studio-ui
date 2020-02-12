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
import { fromEvent, interval } from 'rxjs';
import { filter, switchMap, take, takeUntil } from 'rxjs/operators';

export const foo = (...args: any[]) => void null;
export const
  X_AXIS = 'X',
  Y_AXIS = 'Y',
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
export const INSERT_INSTANCE_OPERATION = 'INSERT_INSTANCE_OPERATION';
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
export const NAVIGATION_REQUEST = 'NAVIGATION_REQUEST';
export const RELOAD_REQUEST = 'RELOAD_REQUEST';
export const DESKTOP_ASSET_DROP = 'DESKTOP_ASSET_DROP';
export const DESKTOP_ASSET_UPLOAD_COMPLETE = 'DESKTOP_ASSET_UPLOAD_COMPLETE';
export const COMPONENT_INSTANCE_DRAG_STARTED = 'COMPONENT_INSTANCE_DRAG_STARTED';
export const COMPONENT_INSTANCE_DRAG_ENDED = 'COMPONENT_INSTANCE_DRAG_ENDED';
export const COMPONENT_INSTANCE_HTML_REQUEST = 'COMPONENT_INSTANCE_HTML_REQUEST';
export const COMPONENT_INSTANCE_HTML_RESPONSE = 'COMPONENT_INSTANCE_HTML_RESPONSE';
export const CONTENT_TYPE_RECEPTACLES_REQUEST = 'CONTENT_TYPE_RECEPTACLES_REQUEST';
export const CONTENT_TYPE_RECEPTACLES_RESPONSE = 'CONTENT_TYPE_RECEPTACLES_RESPONSE';
export const SCROLL_TO_RECEPTACLE = 'SCROLL_TO_RECEPTACLE';
export const CLEAR_HIGHLIGHTED_RECEPTACLES = 'CLEAR_HIGHLIGHTED_RECEPTACLES';

// endregion

export const EditingStatus = {
  OFF: 'OFF',
  LISTENING: 'LISTENING',
  SORTING_COMPONENT: 'SORTING_COMPONENT',
  PLACING_NEW_COMPONENT: 'PLACING_NEW_COMPONENT',
  PLACING_DETACHED_COMPONENT: 'PLACING_DETACHED_COMPONENT',
  PLACING_DETACHED_ASSET: 'PLACING_DETACHED_ASSET',
  EDITING_COMPONENT: 'EDITING_COMPONENT',
  EDITING_COMPONENT_INLINE: 'EDITING_COMPONENT_INLINE',
  UPLOAD_ASSET_FROM_DESKTOP: 'UPLOAD_ASSET_FROM_DESKTOP',
  SHOW_RECEPTACLES: 'SHOW_RECEPTACLES'
};

export function notNullOrUndefined(value: any): boolean {
  return value != null;
}

export function isNullOrUndefined(value: any): boolean {
  return value == null;
}

export function not(condition) {
  return !condition;
}

export function sibling(element: HTMLElement, next: boolean) {
  return (next)
    ? element.nextElementSibling
    : element.previousElementSibling;
}

export function forEach(array: any[], fn: Function, emptyReturnValue?) {
  if (notNullOrUndefined(emptyReturnValue) && array.length === 0) {
    return emptyReturnValue;
  }
  for (let i = 0, l = array.length; i < l; i++) {
    const result = fn(array[i], i, array);
    if (result === 'continue') {

    } else if (result === 'break') {
      break;
    } else if (result !== undefined) {
      return result;
    }
  }
  return emptyReturnValue;
}

export function findComponentContainerFields(fields) {   // TODO: fields type? LookupTable<ContentTypeField>?
  if (!Array.isArray(fields)) {
    fields = Object.values(fields);
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

export function getDropMarkerPosition(args) {   //TODO: pending
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

// noinspection DuplicatedCode
export function splitRect(rect, axis = X_AXIS) {   //TODO: pending types
  // x, y, width, height, top, right, bottom, left
  let rect1: any = {}, rect2: any = {};

  // noinspection DuplicatedCode
  if (axis === X_AXIS) {

    const half = rect.height / 2;

    rect1.x = rect.x;
    rect1.y = rect.y;
    rect1.width = rect.width;
    rect1.height = half;
    rect1.top = rect.top;
    rect1.right = rect.right;
    rect1.bottom = rect.top + half;
    rect1.left = rect.left;

    rect2.x = rect.x;
    rect2.y = rect.y + half;
    rect2.width = rect.width;
    rect2.height = half;
    rect2.top = rect2.y;
    rect2.right = rect.right;
    rect2.bottom = rect.bottom;
    rect2.left = rect.left;

  } else if (axis === Y_AXIS) {

    const half = rect.width / 2;

    rect1.x = rect.x;
    rect1.y = rect.y;
    rect1.width = half;
    rect1.height = rect.height;
    rect1.top = rect.top;
    rect1.right = rect.left + half;
    rect1.bottom = rect.bottom;
    rect1.left = rect.left;

    rect2.x = rect.x + half;
    rect2.y = rect.y;
    rect2.width = half;
    rect2.height = rect.height;
    rect2.top = rect.top;
    rect2.right = rect.right;
    rect2.bottom = rect.bottom;
    rect2.left = rect.left + half;

  } else {
    throw new Error(`Invalid axis suplied. Valid values are "${X_AXIS}" or "${Y_AXIS}".`);
  }
  return [rect1, rect2];
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

export function getChildArrangement(children, childrenRects, selfRect) {
  if (children.length === 0) {
    // If width is big enough, we may assume it may potentially have multiple
    // columns and HORIZONTAL arrangement may be better guess; however,
    // using the larger space to display the drop marker makes it more visible.
    // Vertical arrangement (stacked), will cause the drop marker to be across
    // the X axis, so logic is sort of flipped in the sense that it's said to be
    // vertical so that drop marker displays horizontally
    return (selfRect.width > selfRect.height)
      ? VERTICAL
      : HORIZONTAL;
  }

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
  return (object == null)
    ? null
    : (!prop)
      ? object
      : prop.split('.').reduce((value, prop) => value[prop], object);
}

export function setProperty(object, prop, value) {
  if (object) {
    const props = prop.split('.');
    const propToSet = props.pop();
    let target = retrieveProperty(object, props.join('.'));
    if (!target) {
      setProperty(object, props.join('.'), {});
      target = retrieveProperty(object, props.join('.'));
    }
    target[propToSet] = value;
    return true;
  }
  return false;
}

export function createLookupTable(list, idProp = 'id') {
  const table = {};
  list.forEach((item) => {
    table[retrieveProperty(item, idProp)] = item;
  });
  return table;
}

// Regular click gets triggered even after loooong mouse downs or
// when mousing-down and dragging cursor - without actually being on
// a drag and drop of an element - and then mousing-up some other place.
// This causes the ice zone selection to occur and the UX feels awkward.
// This is a custom click event with a more opinionated click behaviour
// that could be used instead of the regular click. The trade-of is that,
// as is, won't handle preventDefault/stopPropagation correctly as it's a
// delegate on the document (i.e. the event as bubbled all the way up).
// Would need to add additional logic to set the delegation in a way that
// events can still be stopped (see jQuery).
export function addClickListener(element, type, handler) {

  if (element === document) {
    // TODO: set up as delegate, control event propagation & stopping accordingly
  }

  const mouseDown$ = fromEvent(element, 'mousedown');
  const mouseUp$ = fromEvent(element, 'mouseup');
  return mouseDown$.pipe(
    switchMap(() => mouseUp$.pipe(
      takeUntil(interval(300)),
      take(1)
    )),
    filter((e) => (
      e.target.hasAttribute('data-craftercms-model-id') ||
      forEach(e.path, (el) => (
        (
          (el !== window) &&
          (el !== document) &&
          (el.hasAttribute('data-craftercms-model-id'))
        ) ? true : 'continue'
      ), false)
    ))
  ).subscribe(handler);

}

export function isElementInView(element, fullyInView) {
  var pageTop = $(window).scrollTop();
  var pageBottom = pageTop + $(window).height();
  var elementTop = $(element).offset().top;
  var elementBottom = elementTop + $(element).height();

  if (fullyInView === true) {
    return ((pageTop < elementTop) && (pageBottom > elementBottom));
  } else {
    return ((elementTop <= pageBottom) && (elementBottom >= pageTop));
  }
}

export function removeLastPiece(str, splitChar = '.') {
  return str.substr(0, str.lastIndexOf(splitChar));
}

export function popPiece(str, splitChar = '.') {
  return str.substr(str.lastIndexOf(splitChar) + 1);
}

export function isBlank(str) {
  return str === '';
}
