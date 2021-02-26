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

import React, { useEffect, useRef, useState } from 'react';
import { foo, HORIZONTAL, VERTICAL, X_AXIS, Y_AXIS } from '../utils/util';
import { Coordinates } from '../models/Positioning';
import { DropZone, ElementRecord } from '../models/InContextEditing';
import { notNullOrUndefined } from '../utils/object';
import { forEach } from '../utils/array';
import { findClosestRect, getDropMarkerPosition, getInRectStats, splitRect } from '../utils/dom';

export interface DropMarkerProps {
  over: ElementRecord;
  prev: DOMRect;
  next: DOMRect;
  dropZone: DropZone;
  coordinates: Coordinates;
  onDropPosition: Function;
}

export function DropMarker(props: DropMarkerProps) {
  const //
    { over, prev, next, dropZone, coordinates, onDropPosition } = props,
    { current: r } = useRef({ targetIndex: null }),
    [style, setStyle] = useState({}),
    { element } = over;

  // TODO: Check missing reason for missing dependencies
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(dragOver, [prev, next, coordinates.x, coordinates.y]);

  return (
    // @ts-ignore
    <craftercms-drop-marker style={style} class={`${dropZone.arrangement === HORIZONTAL ? VERTICAL : HORIZONTAL}`} />
  );

  function dragOver(): void {
    let nextStyle = null,
      targetIndex;

    if (element === dropZone.element) {
      if (element.children.length > 0) {
        const closestChildIndex = findClosestRect(dropZone.rect, dropZone.childrenRects, coordinates),
          closestRect = dropZone.childrenRects[closestChildIndex],
          closestChild = dropZone.children[closestChildIndex],
          before =
            dropZone.arrangement === HORIZONTAL
              ? // Is it to the left of the center of the rect?
                coordinates.x <= closestRect.left + closestRect.width / 2
              : // Is it to the north of the center of the rect?
                coordinates.y <= closestRect.top + closestRect.height / 2;

        nextStyle = getDropMarkerPosition({
          arrangement: dropZone.arrangement,
          insertPosition: before ? 'before' : 'after',
          refElement: closestChild,
          refElementRect: closestRect,
          nextOrPrevRect: before
            ? dropZone.childrenRects[closestChildIndex - 1]
            : dropZone.childrenRects[closestChildIndex + 1]
        });

        targetIndex = before ? closestChildIndex : closestChildIndex + 1;
      } else {
        // Drop zone is empty
        // onDropPosition({ targetIndex: 0 });

        const virtualRects = splitRect(
          dropZone.rect,
          // Using the larger space to display the drop marker makes it more visible
          dropZone.rect.width > dropZone.rect.height ? X_AXIS : Y_AXIS
        );

        nextStyle = getDropMarkerPosition({
          arrangement: dropZone.arrangement,
          insertPosition: 'after',
          refElement: dropZone.element,
          refElementRect: virtualRects[0],
          nextOrPrevRect: virtualRects[1]
        });

        targetIndex = 0;
      }
    } else {
      let //
        prevRect = prev,
        nextRect = next,
        rect = element.getBoundingClientRect(),
        rectStats = getInRectStats(rect, coordinates);

      if (rectStats.inRect) {
        const insertPosition =
            (dropZone.arrangement === HORIZONTAL && rectStats.percents.x >= 50) ||
            (dropZone.arrangement === VERTICAL && rectStats.percents.y >= 50)
              ? 'after'
              : 'before',
          before = insertPosition === 'before';

        nextStyle = getDropMarkerPosition({
          insertPosition,
          arrangement: dropZone.arrangement,
          refElement: element,
          refElementRect: rect,
          nextOrPrevRect: before ? prevRect : nextRect
        });

        targetIndex = dropZone.children.findIndex((e) => e === element);
        if (!before) {
          ++targetIndex;
        }
      } else {
        console.log('DropMarker:dragOver unhandled path');
      }
    }

    if (notNullOrUndefined(nextStyle)) {
      forEach(Object.keys(nextStyle), (key) => {
        if (style[key] !== nextStyle[key]) {
          setStyle(nextStyle);
          return 'break';
        }
      });
    }

    if (r.targetIndex !== targetIndex) {
      r.targetIndex = targetIndex;
      onDropPosition({ targetIndex });
    }
  }
}

DropMarker.defaultProps = {
  onDropPosition: foo
};

export default DropMarker;
