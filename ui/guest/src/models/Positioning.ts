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

export interface Coordinates {
  x: number;
  y: number;
}

export interface DropMarkerPositionArgs {
  arrangement: string;
  insertPosition: string;
  refElementRect: DOMRect;
  nextOrPrevRect: DOMRect;
  refElement: Element;
}

export interface DropMarkerPosition {
  height?: number;
  width?: number;
  top: number;
  left: number;
}

export interface Highlight {
  id: number;
  rect: DOMRect;
  label: string;
}

export interface InRectStats {
  inRectTop: boolean;
  inRectRight: boolean;
  inRectBottom: boolean;
  inRectLeft: boolean;
  inRect: boolean;
  inInnerRectTop: boolean;
  inInnerRectRight: boolean;
  inInnerRectBottom: boolean;
  inInnerRectLeft: boolean;
  inInnerRect: boolean;
  percents: Coordinates;
}
