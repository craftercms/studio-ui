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
import { Coordinates } from '../models/Positioning';

const TOLERANCE_PERCENTS = { x: 5, y: 5 };

function capitalize(str: string): string {
  return `${str.charAt(0).toUpperCase()}${str.substr(1)}`;
}

export const
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical';

export class Markers {

  static draggedElement = null;
  static draggedComponent = null;

  static initDragAndDrop(element: HTMLElement, mousePosition: DOMRect) {

    // If no valid element hovered
    if (!element) {
      return false;
    }

    let $element = $(element);
    if ($element.is('html')) {
      $element = $element.find('body');
    }

    if (
      !Markers.hierarchyOk(
        Markers.draggedElement,
        element)
    ) {
      return;
    }

    const //
      innerBox = TOLERANCE_PERCENTS, /* Percentages */
      percents = this.getRelativePointerPositionPercentages(
        mousePosition,
        $element[0].getBoundingClientRect()
      );

    if (
      /* Verify the pointer is within the designated inner box */
      percents.x > innerBox.x &&
      percents.y > innerBox.y &&
      percents.x < (100 - innerBox.x) &&
      percents.y < (100 - innerBox.y)
    ) {

      const
        $clone = $element.clone(),
        $children = $clone.children();

      $clone.find('.craftercms-drop-marker').remove();

      // this.place($element, 'inside');

      if (
        // Element that's being dragged over is empty
        $clone.html().trim() === '' && !this.isVoidElement($clone)
      ) {
        this.place($element, 'inside');
      } else if (
        // No children but text nodes present
        $children.length === 0
      ) {
        this.selectPlacement($element, percents);
      } else if (
        // Only 1 child element detected
        $children.length === 1
      ) {
        this.selectPlacement(
          $element
            .children(':not(.craftercms-drop-marker,[craftercms-zone-marker])')
            .first(),
          percents
        );
      } else {
        // Multiple children
        if ($element.get(0) !== Markers.draggedElement) {
          const positionAndElement = this.findNearestElement(
            $element,
            mousePosition.x,
            mousePosition.y
          );
          this.selectPlacement(
            positionAndElement.el,
            percents,
            mousePosition
          );
        }
      }

    } else if (
      /* Pointer is out of the designated inner box
         from the left or top sides of the box */
      percents.x <= innerBox.x ||
      percents.y <= innerBox.y
    ) {

      let $validElement = (percents.y <= percents.x)
        ? this.findValidParent($element, 'top')
        : this.findValidParent($element, 'left');

      if ($validElement.is('body,html')) {
        $validElement = $(document.body)
          .children(':not(.craftercms-drop-marker, [craftercms-zone-marker])')
          .first();
      }

      this.selectPlacement($validElement, percents, mousePosition);

    } else if (
      /* Pointer is out of the designated inner box from
         the right or bottom sides of the box */
      percents.x >= (100 - innerBox.x) ||
      percents.y >= (100 - innerBox.y)
    ) {

      let validElement = (percents.y >= percents.x)
        ? this.findValidParent($element, 'bottom')
        : this.findValidParent($element, 'right');

      if (validElement.is('body,html')) {
        validElement = $(document.body)
          .children(':not(.craftercms-drop-marker,[craftercms-zone-marker])')
          .last();
      }

      this.selectPlacement(validElement, percents, mousePosition);
    }

  }

  static markZone(element: HTMLElement) {

    // If no valid element hovered
    if (!element) {
      return false;
    }

    let $element = $(element);
    if ($element.is('html')) {
      $element = $element.find('body');
    }

    // this.removeZoneMarkers();
    return this.insertZoneMarker($element, 'inside');

  }

  // Checks that an element is not getting dragged
  // inside of one of his children
  static hierarchyOk(dragged: HTMLElement, draggedOver: HTMLElement): boolean {
    return !Markers.isChildOrSelf(dragged, draggedOver);
  }

  static isChildOrSelf(element: HTMLElement, potentialChildOrSelf: HTMLElement): boolean {
    if (element === potentialChildOrSelf) {
      return true;
    } else {
      return Markers.isChildOf(element, potentialChildOrSelf);
    }
  }

  static isChildOf(element: HTMLElement, potentialChild: HTMLElement): boolean {
    if (element) {
      const children = Array.from(element.querySelectorAll('*'));
      if (children.includes(potentialChild)) {
        return true;
      }
    }
    return false;
  }

  static highlightElement(element: HTMLElement): JQuery {
    const $element = $(element);
    return this.insertZoneMarker($element, 'inside');
  }

  static getRelativePointerPositionPercentages(mousePosition: Coordinates, rect: DOMRect): Coordinates {

    const
      x = (
        (
          /* mouse X distance from rect left edge */
          (mousePosition.x - rect.left) /
          /* width */
          rect.width
        ) * 100
      ),
      y = (
        (
          /* mouse X distance from rect top edge */
          (mousePosition.y - rect.top) /
          /* height */
          (rect.height)
        ) * 100
      );

    return { x, y };
  }

  static selectPlacement($element: JQuery, mousePercents: Coordinates, mousePosition?: DOMRect): void {
    if (mousePosition) {
      mousePercents = this.getRelativePointerPositionPercentages(
        $element[0].getBoundingClientRect(),
        mousePosition
      );
    }

    let isInline = Markers.isInlineElement($element);

    if ($element.is('br')) {
      isInline = false;
    }

    if (
      (isInline)
        ? (mousePercents.x < 50)
        : (mousePercents.y < 50)
    ) {
      this.place($element, 'before');
    } else {
      this.place($element, 'after');
    }

  }

  static place($element: JQuery, where: string): void {
    const $dropMarker = this.createDropMaker();
    switch (where) {
      case 'inside': {

        this.removeDropMarkers();
        // $dropMarker.addClass(HORIZONTAL).css({ width: $element.width() });
        this.insertDropMarker($element, 'inside-append', $dropMarker);

        this.removeZoneMarkers();
        this.insertZoneMarker($element, 'inside');

        break;
      }
      case 'after':
      case 'before': {

        let inlinePlaceholder = Markers.isInlineElement($element);

        if ($element.is('br')) {
          inlinePlaceholder = false;
        } /*else if ($element.is('td,th')) {
            $dropMarker
              .addClass(HORIZONTAL)
              .css('width', $element.width() + 'px');

            if (where === 'before') {
              this.removeDropMarkers();
              this.insertDropMarker($element, 'inside-prepend', $dropMarker);

              this.removeZoneMarkers();
              this.insertZoneMarker($element, 'inside');

            } else {
              this.removeDropMarkers();
              this.insertDropMarker($element, 'inside-append', $dropMarker);

              this.removeZoneMarkers();
              this.insertZoneMarker($element, 'inside');
            }
          }*/

        if (inlinePlaceholder) {
          $dropMarker
            .addClass(VERTICAL)
            .css('height', $element.innerHeight() + 'px');
        } else {
          $dropMarker
            .addClass(HORIZONTAL)
            .css('width', $element.parent().width() + 'px');
        }

        this.removeDropMarkers();
        this.insertDropMarker($element, where, $dropMarker);

        this.removeZoneMarkers();
        this.insertZoneMarker($element, 'sibling');

        break;
      }
      default:
        console.log('Unrecognized place position');
    }
  }

  static isInlineElement($el: JQuery): boolean {
    return (
      $el.css('display') === 'inline' ||
      $el.css('display') === 'inline-flex' ||
      $el.css('display') === 'inline-block'
    );
  }

  static isVoidElement($element: JQuery): boolean {
    const VOID_ELEMENTS = [
      'i',
      'area',
      'base',
      'br',
      'col',
      'command',
      'embed',
      'hr',
      'img',
      'input',
      'keygen',
      'link',
      'meta',
      'param',
      'video',
      'iframe',
      'source',
      'track',
      'wbr',
      'svg'
    ];
    const selector = VOID_ELEMENTS.join(',');
    return $element.is(selector);
  }

  static calculateDistance(elementData: DOMRect, mouseX: number, mouseY: number) {
    return Math.sqrt(
      Math.pow(elementData.x - mouseX, 2) +
      Math.pow(elementData.y - mouseY, 2)
    );
  }

  static findValidParent($element: JQuery, direction: string): JQuery {
    let elementRect, $parentElement, parentElemRect, result;
    do {
      if ($element.is('body')) {
        return $element;
      }
      elementRect = $element.get(0).getBoundingClientRect();
      $parentElement = $element.parent();
      parentElemRect = $parentElement.get(0).getBoundingClientRect();
      result = parentElemRect[direction] - elementRect[direction];
      if (Math.abs(result) === 0) {
        $element = $element.parent();
      } else {
        return $element;
      }
    } while (true);
  }

  static findNearestElement($container: JQuery, clientX: number, clientY: number): any {

    let
      previousElData = null,
      $children: JQuery = $container.children(':not(.craftercms-drop-marker,[craftercms-zone-marker])');

    if ($children.length > 0) {
      $children.each(function (): any {
        if ($(this).is('.craftercms-drop-marker')) {
          return;
        }

        let
          offset = this.getBoundingClientRect(),
          distance = 0,
          distance1,
          distance2 = null,
          position = '',
          xPosition1 = offset.left,
          xPosition2 = offset.right,
          yPosition1 = offset.top,
          yPosition2 = offset.bottom,
          corner1 = null,
          corner2 = null;

        if (clientY > yPosition1 && clientY < yPosition2) {
          // Parallel to Y axis and intersecting with X axis
          if (clientX < xPosition1 && clientY < xPosition2) {
            corner1 = { x: xPosition1, y: clientY, position: 'before' };
          } else {
            corner1 = { x: xPosition2, y: clientY, position: 'after' };
          }
        } else if (clientX > xPosition1 && clientX < xPosition2) {
          // Parallel to X Axis and intersecting with Y axis
          if (clientY < yPosition1 && clientY < yPosition2) {
            corner1 = { x: clientX, y: yPosition1, position: 'before' };
          } else {
            corner1 = { x: clientX, y: yPosition2, position: 'after' };
          }
        } else {
          // No element was found
          if (clientX < xPosition1 && clientX < xPosition2) {
            corner1 = { x: xPosition1, y: yPosition1, position: 'before' }; // Left top
            corner2 = { x: xPosition1, y: yPosition2, position: 'after' }; // Left bottom
          } else if (clientX > xPosition1 && clientX > xPosition2) {
            corner1 = { x: xPosition2, y: yPosition1, position: 'before' }; // Right top
            corner2 = { x: xPosition2, y: yPosition2, position: 'after' }; // Right Bottom
          } else if (clientY < yPosition1 && clientY < yPosition2) {
            corner1 = { x: xPosition1, y: yPosition1, position: 'before' }; // Top Left
            corner2 = { x: xPosition2, y: yPosition1, position: 'after' }; // Top Right
          } else if (clientY > yPosition1 && clientY > yPosition2) {
            corner1 = { x: xPosition1, y: yPosition2, position: 'before' }; // Left bottom
            corner2 = { x: xPosition2, y: yPosition2, position: 'after' }; // Right Bottom
          }
        }

        distance1 = Markers.calculateDistance(corner1, clientX, clientY);

        if (corner2 !== null) {
          distance2 = Markers.calculateDistance(corner2, clientX, clientY);
        }

        if (distance1 < distance2 || distance2 === null) {
          distance = distance1;
          position = corner1.position;
        } else {
          distance = distance2;
          position = corner2.position;
        }

        if ((previousElData !== null) && (previousElData.distance < distance)) {
          return true; // continue;
        }

        previousElData = {
          el: this,
          distance,
          xPosition1,
          xPosition2,
          yPosition1,
          yPosition2,
          position
        };
      });

      if (previousElData !== null) {
        // noinspection JSObjectNullOrUndefined
        const position = previousElData.position;
        return { el: $(previousElData.el), position };
      } else {
        return false;
      }
    }

  }

  static createDropMaker(): JQuery {
    return $('<span class="craftercms-drop-marker"/>');
  }

  static removeDropMarkers(): void {
    $('.craftercms-drop-marker').remove();
  }

  static insertDropMarker($element: JQuery, position: string, $dropMarker: JQuery): void {
    if (!$dropMarker) {
      $dropMarker = this.createDropMaker();
    }
    switch (position) {
      case 'before':
        $dropMarker
          .find('.message')
          .html($element.parent().data('craftercms-dnd-error'));
        $element.before($dropMarker);
        break;
      case 'after':
        $dropMarker
          .find('.message')
          .html($element.parent().data('craftercms-dnd-error'));
        $element.after($dropMarker);
        break;
      case 'inside-prepend':
        $dropMarker.find('.message').html($element.data('craftercms-dnd-error'));
        $element.prepend($dropMarker);
        break;
      case 'inside-append':
        $dropMarker.find('.message').html($element.data('craftercms-dnd-error'));
        $element.append($dropMarker);
        break;
    }
  }

  static createZoneMarker(): JQuery {
    return $(
      '<div craftercms-zone-marker>' +
      /**/'<span craftercms-zone-marker-label/>' +
      '</div>'
    );
  }

  static removeZoneMarkers(): void {
    $('[craftercms-zone-marker]').remove();
  }

  static insertZoneMarker($element: JQuery, position: string): JQuery {
    const $zoneMarker = this.createZoneMarker();
    if ($element.is('html,body')) {
      position = 'inside';
      $element = $('body');
    }

    const $parentMarker = $('[data-parent-marker]');

    switch (position) {
      case 'inside': {
        this.setZoneMarkerRect($zoneMarker, $element);

        if ($element.hasClass('craftercms-invalid-drop-zone')) {
          $zoneMarker.addClass('invalid');
        }

        const name = this.getZoneLabel($element);

        $zoneMarker
          .find('[craftercms-zone-marker-label]')
          .html(name);

        if ($parentMarker.length !== 0) {
          $parentMarker
            .first()
            .before($zoneMarker);
        } else {
          $('body').append($zoneMarker);
        }

        break;
      }
      case 'sibling': {
        this.setZoneMarkerRect($zoneMarker, $element.parent());
        if ($element.parent().hasClass('craftercms-invalid-drop-zone')) {
          $zoneMarker.addClass('invalid');
        }
        const name = this.getZoneLabel($element.parent());
        $zoneMarker.find('[craftercms-zone-marker-label]').html(name);
        $zoneMarker.attr('craftercms-zone-marker', name.toLowerCase());
        if ($parentMarker.length !== 0) {
          $parentMarker
            .first()
            .before($zoneMarker);
        } else {
          $('body').append($zoneMarker);
        }
        break;
      }
    }

    return $zoneMarker;
  }

  static setZoneMarkerRect($marker: JQuery, $element: JQuery, extra?: number): void {
    const //
      rect = $element.get(0).getBoundingClientRect(),
      markerStyle = Markers.getZoneMarkerStyle(rect, extra),
      labelStyle = Markers.getZoneMarkerLabelStyle(rect);

    $marker.css(markerStyle);

    if (Object.values(labelStyle).length) {
      $marker
        .find('[craftercms-zone-marker-label]')
        .css(labelStyle);
    }
  }

  static getZoneMarkerLabelStyle(rect: DOMRect) {
    const $body = $('body');
    return ((rect.top + $body.scrollTop()) <= 0) ? {
      top: 0,
      left: '50%',
      marginLeft: -60,
      position: 'fixed'
    } : {};
  }

  static getZoneMarkerStyle(rect: DOMRect, padding: number = 0) {
    const $window = $(window);
    return {
      height: rect.height + padding,
      width: rect.width + padding,
      top: (
        rect.top +
        $window.scrollTop() -
        (padding / 2)
      ),
      left: (
        rect.left +
        $window.scrollLeft() -
        (padding / 2)
      )
    };
  }

  static getZoneLabel($element: JQuery, type: string = 'user'): string {
    // @ts-ignore
    const zone = DOMController.getZoneFor($element[0]);
    if (zone) {
      return zone.label;
    }
    const
      tag = $element.prop('tagName').toLowerCase();
    switch (type) {
      case 'user':
        return (
          ({
            a: 'Link',
            button: 'Button',
            h1: 'Heading Level 1',
            h2: 'Heading Level 2',
            h3: 'Heading Level 3',
            h4: 'Heading Level 4',
            h5: 'Heading Level 5',
            img: 'Image',
            p: 'Paragraph',
            video: 'Video',
            body: 'Body',
            html: 'HTML',
            td: 'Table Cell',
            th: 'Heading Cell',
            tr: 'Table Row',
            div: 'Block'
          })[tag] || capitalize(
            /**/$element.attr('class') || ''
          ).split(' ')[0].replace(/-/g, ' ') ||
          capitalize(tag)
        );
      case 'developer':
        const
          id = $element.attr('id'),
          classes = ($element.attr('class') || '').replace(/\s/g, '.'),
          label = [tag];
        if (id) {
          label.push(`#${id}`);
        }
        if (classes) {
          label.push(`.${classes}`);
        }
        return label.join('');
    }
  }

}
