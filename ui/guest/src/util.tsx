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

import $ from 'jquery';
import { Markers } from './classes/Markers';
import { fromEvent, interval, Subscription } from 'rxjs';
import { filter, switchMap, take, takeUntil } from 'rxjs/operators';
import {
  Coordinates,
  DropMarkerPosition,
  DropMarkerPositionArgs,
  InRectStats
} from './models/Positioning';
import { LookupTable } from './models/LookupTable';
import { ContentTypeField, ContentTypeReceptacle } from './models/ContentType';
import { RenderTree } from './models/ContentTree';
import { DropZone, HoverData, Record } from './models/InContextEditing';
import { ElementRegistry } from './classes/ElementRegistry';

export const foo = (...args: any[]) => void null;
export const
  X_AXIS = 'X',
  Y_AXIS = 'Y',
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
  TOLERANCE_PERCENTS = { x: 5, y: 5 },
  DEFAULT_RECORD_DATA = { fieldId: null, index: null, refCount: 1 };

export enum EditingStatus {
  OFF = 'OFF',
  LISTENING = 'LISTENING',
  SORTING_COMPONENT = 'SORTING_COMPONENT',
  PLACING_NEW_COMPONENT = 'PLACING_NEW_COMPONENT',
  PLACING_DETACHED_COMPONENT = 'PLACING_DETACHED_COMPONENT',
  PLACING_DETACHED_ASSET = 'PLACING_DETACHED_ASSET',
  EDITING_COMPONENT = 'EDITING_COMPONENT',
  EDITING_COMPONENT_INLINE = 'EDITING_COMPONENT_INLINE',
  UPLOAD_ASSET_FROM_DESKTOP = 'UPLOAD_ASSET_FROM_DESKTOP',
  SHOW_RECEPTACLES = 'SHOW_RECEPTACLES'
};

export function notNullOrUndefined(value: any): boolean {
  return value != null;
}

export function isNullOrUndefined(value: any): boolean {
  return value == null;
}

export function not(condition: boolean): boolean {
  return !condition;
}

export function sibling(element: HTMLElement, next: boolean): Element {
  return (next)
    ? element.nextElementSibling
    : element.previousElementSibling;
}

export function forEach(array: any[], fn: (item: any, index?: number, array?: any[]) => any, emptyReturnValue?: any): any {
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

export function findComponentContainerFields(fields: LookupTable<ContentTypeField> | ContentTypeField[]): ContentTypeField[] {
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

export function getDropMarkerPosition(args: DropMarkerPositionArgs): DropMarkerPosition {
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
export function splitRect(rect: DOMRect, axis: string = X_AXIS): DOMRect[] {
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

export function insertDropMarker({ $dropMarker, insertPosition, refElement }:
                                   { $dropMarker: JQuery<any>, insertPosition: string, refElement: HTMLElement | JQuery | string }): void {
  if (insertPosition === 'after') {
    $dropMarker.insertAfter(refElement);
  } else {
    $dropMarker.insertBefore(refElement);
  }
}

export function getDistanceBetweenPoints(p1: Coordinates, p2: Coordinates): number {
  const div = document.createElement('div');

  return Math.sqrt(
    Math.pow(p2.x - p1.x, 2) +
    Math.pow(p2.y - p1.y, 2)
  );
}

export function findClosestRect(parentRect: DOMRect, subRects: DOMRect[], coordinates: Coordinates): number {
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

export function getChildArrangement(children: Element[], childrenRects: DOMRect[], selfRect?: DOMRect): string {
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

export function getInRectStats(rect: DOMRect, coordinates: Coordinates, tolerancePercents: Coordinates = TOLERANCE_PERCENTS): InRectStats {
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

export function pluckProps(source: object, ...props: string[]): object {
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

export function reversePluckProps(source: object, ...props: string[]): object {
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

export function capitalize(str: string): string {
  return `${str.charAt(0).toUpperCase()}${str.substr(1)}`;
}

export function retrieveProperty(object: object, prop: string): any {
  return (object == null)
    ? null
    : (!prop)
      ? object
      : prop.split('.').reduce((value, prop) => value[prop], object);
}

export function deleteProperty<T, P extends keyof T>(object: T, prop: P): Omit<T, P> {
  delete object[prop];
  return object;
}

export function setProperty(object: object, prop: string, value: any): boolean {
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

export function createLookupTable<T>(list: T[], idProp: string = 'id'): LookupTable<T> {
  const table = {};
  list.forEach((item) => {
    table[retrieveProperty(item as any, idProp)] = item;
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
export function addClickListener(element: HTMLElement | Document, type: string, handler: (e: Event) => any): Subscription {

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
    filter((e: any) => (
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

export function isElementInView(element: Element | JQuery, fullyInView?: boolean): boolean {
  const pageTop = $(window).scrollTop();
  const pageBottom = pageTop + $(window).height();
  const elementTop = $(element).offset().top;
  const elementBottom = elementTop + $(element).height();

  if (fullyInView === true) {
    return ((pageTop < elementTop) && (pageBottom > elementBottom));
  } else {
    return ((elementTop <= pageBottom) && (elementBottom >= pageTop));
  }
}

export function removeLastPiece(str: string, splitChar: string = '.'): string {
  return str.substr(0, str.lastIndexOf(splitChar));
}

export function popPiece(str: string, splitChar: string = '.'): string {
  return str.substr(str.lastIndexOf(splitChar) + 1);
}

export function isBlank(str: string): boolean {
  return str === '';
}

export function addAnimation($element: JQuery<Element> | JQuery<HTMLElement>, animationClass: string): void {
  const END_EVENT = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
  $element.addClass(animationClass);
  // @ts-ignore
  $element.one(END_EVENT, function () {
    $element.removeClass(animationClass);
  });
}

export function scrollToNode(node: RenderTree, scrollElement: string): void {
  let $element: JQuery;
  if (node.index !== undefined) {
    $element = $(`[data-craftercms-model-id="${node.parentId || node.modelId}"][data-craftercms-field-id="${node.fieldId}"][data-craftercms-index="${node.index}"]`);
  } else {
    $element = $(`[data-craftercms-model-id="${node.modelId}"][data-craftercms-field-id="${node.fieldId}"]:not([data-craftercms-index])`);
  }
  if ($element.length) {
    if (!isElementInView($element)) {
      $(scrollElement).animate({
        scrollTop: $element.offset().top - 100
      }, 300, function () {
        addAnimation($element, 'craftercms-contentTree-pulse');
      });
    } else {
      addAnimation($element, 'craftercms-contentTree-pulse');
    }
  }
}

export function scrollToReceptacle(receptacles: ContentTypeReceptacle[] | Record[], scrollElement: string, getElementRegistry: (id: number) => Element) {
  let elementInView: boolean;
  let element: Element;
  elementInView = forEach(receptacles, ({ id }) => {
    let elem = getElementRegistry(id);
    if (isElementInView(elem)) {
      elementInView = true;
      element = elem;
      return 'break';
    }
  }, false);

  if (!elementInView) {
    // TODO: Do this relative to the scroll position. Don't move if things are already in viewport. Be smarter.
    let element = getElementRegistry(receptacles[0].id);
    $(scrollElement).animate({
      scrollTop: $(element).offset().top - 100
    }, 300);
  }
}

export function getHighlighted(dropZones: DropZone[]): LookupTable<HoverData> {
  return dropZones.reduce((object, { physicalRecordId: id }) => {
    object[id] = ElementRegistry.getHoverData(id);
    return object;
  }, {});
}
