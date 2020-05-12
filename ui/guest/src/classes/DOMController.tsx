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
import contentController from './ContentController';
import {
  findClosestRect,
  forEach,
  getChildArrangement,
  getInRectStats,
  HORIZONTAL,
  insertDropMarker,
  isNullOrUndefined,
  not,
  notNullOrUndefined,
  VERTICAL
} from '../util';
import iceRegistry from './ICERegistry';
// import { Markers } from './Markers';
import { ComponentEditor } from './ComponentEditor';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, delay, filter } from 'rxjs/operators';
import { ModelHelper } from './ModelHelper';
import { render } from 'react-dom';
import { DZStats, IceZone, Stats } from '../models/InContextEditing';

const hostTrashed$ = new Subject();

export class DOMController {

  static zoneIds = 0;

  // Keeps track of all registered zones
  static zones: IceZone[];

  // Used for mouseover/mouseout cycles
  // to control/clean zone manipulation
  static activeElement: Element;

  // Object that tracks relevant values
  // for during drag & drop.
  static dragStats: Stats;

  // Used for suspending or debouncing expensive processes
  // and resume them once the scroll stopped.
  static scrolling$/*: BehaviourSubject<boolean>*/;

  static addZone(zone: IceZone): number {
    let { element, field, modelId, index, label } = zone;

    if (!element) {
      throw new Error(`Unable to add zone for ${element}`);
    } else if (!modelId) {
      throw new Error('modelId not provided');
    }

    const recordIds = (Array.isArray(field) ? field : [field])
      .map((fld) => iceRegistry.register({
        index,
        modelId,
        fieldId: (
          (typeof fld === 'object')
            ? fld.id
            : fld
        )
      }));

    const records = recordIds.map((id) => iceRegistry.getReferentialEntries(id));

    const fieldObjects = isNullOrUndefined(field) ? [] : (
      Array.isArray(field)
        ? records.map((record) => record.field)
        : [records[0].field]
    ).filter((something) => !!something);

    this.zones.push({
      id: this.zoneIds++,
      element,
      recordIds,
      label: notNullOrUndefined(label)
        ? label
        : (fieldObjects.length > 1)
          ? fieldObjects.map(f => f.name).join(', ')
          : (fieldObjects.length > 0)
            ? fieldObjects[0].name
            : records[0].contentType.name
    });

    return this.zoneIds;

  }

  static removeZone(element: Element): void {
    const index = this.findIndexOf(element);
    if (index !== -1) {
      this.zones.splice(index, 1);
    }
  }

  static includes(element: Element): boolean {
    return this.zones.some((zone) => zone.element === element);
  }

  static getFieldFor(element: Element): unknown {
    const index = this.findIndexOf(element);
    return this.zones[index].recordIds.map((id) => iceRegistry.getReferentialEntries(id).field);
  }

  static getZoneFor(element: Element): IceZone {
    const index = this.findIndexOf(element);
    return this.zones[index];
  }

  static findIndexOf(element: Element): number {
    return this.zones.findIndex((zone) => zone.element === element);
  }

  static findZoneElement(element: Element): Element {
    const

      body = document.body,

      // Needed? Unlikely that'll get
      // to the html element.
      html = document.querySelector('html');

    let
      includes,
      elem = element;

    while (
      !(includes = this.includes(elem)) &&
      (
        (elem = elem.parentElement) != null
      ) &&
      (elem !== body) &&
      (elem !== html)
      ) ;

    return includes ? elem : null;
  }

  static isDraggable(element: Element, zone: IceZone = this.getZoneFor(element)): boolean {
    if (!zone) {
      return false;
    } else {
      return !!forEach(
        zone.recordIds,
        (id) => {
          if (iceRegistry.isMovable(id)) {
            return true;
          }
        }
      );
    }
  }

  static updateDragStats(): void {
    const stats = DOMController.dragStats;
    const { currentDZ, currentDZChildren, dropZones } = stats;
    stats.dropZoneRects = dropZones.map((dz) => {
      const rect = dz.getBoundingClientRect();
      if (dz === currentDZ) {
        stats.currentDZElementRect = currentDZ.getBoundingClientRect();
      }
      return rect;
    });
    stats.currentDZChildrenRects = currentDZChildren.map((child) => child.getBoundingClientRect());
  }

  static onMouseMove(element: Element): void {

  }

  static onMouseOver(element: Element): boolean {

    const elem = this.findZoneElement(element);

    if (elem) {
      this.activeElement = elem;

      const zone = this.getZoneFor(elem);

      if (this.isDraggable(elem, zone)) {
        $(elem).attr('draggable', 'true');
      }


      // @ts-ignore
      Markers.removeZoneMarkers();
      // @ts-ignore
      Markers.markZone(elem);

    }

    return false;

  }

  static onMouseOut(): void {

    const elem = this.activeElement;

    if (elem) {
      // @ts-ignore
      Markers.removeZoneMarkers();
      $(elem)
        .attr('draggable', 'false')
        .removeAttr('draggable');
    }

  }

  static getCurrentDZStats(dzElement: Element): DZStats {
    const
      currentDZ = dzElement,
      currentDZElementRect = currentDZ.getBoundingClientRect(),
      currentDZChildren = Array.from(currentDZ.children),
      currentDZChildrenRects = currentDZChildren.map((child) =>
        child.getBoundingClientRect()
      );
    return {
      currentDZ,
      currentDZChildren,
      currentDZElementRect,
      currentDZChildrenRects
    };
  }

  static setCurrentDZStats(dzElement: Element): void {
    Object.assign(
      this.dragStats,
      this.getCurrentDZStats(dzElement));
  }

  static onDragStart({ element }: { element: Element }) {
    const zone = this.getZoneFor(element);
    // Images, links, annumberd selections are draggable
    // by default in HTML.
    if (!zone) {
      throw new Error(
        'DOMController.onDragStart received an event by a non registered element.'
      );
    }

    // region Constants
    const
      recordId = zone.recordIds[0],
      record = iceRegistry.getReferentialEntries(recordId),
      receptacles = iceRegistry.getRecordReceptacles(recordId),
      receptacleZones = receptacles.map(({ id: number }) =>
        this.zones.find((zn: IceZone) => zn.recordIds.includes(id))
      ),
      dropZones = receptacleZones.map(z => z.element);

    const
      originDropZone = element.parentElement,
      {
        currentDZ,
        currentDZElementRect,
        currentDZChildren,
        currentDZChildrenRects
      } = this.getCurrentDZStats(originDropZone),
      dropZoneRects = dropZones.map(dz => (dz === originDropZone)
        ? currentDZElementRect
        : dz.getBoundingClientRect()
      ),
      draggedElement = element,
      draggedElementIndex = currentDZChildren.findIndex(child => child === element),
      childArrangement = getChildArrangement(currentDZChildren, currentDZChildrenRects),

      // @ts-ignore
      $dropMarker = Markers.createDropMaker(),
      scrolling$ = new BehaviorSubject(false);
    // endregion

    $dropMarker.addClass(childArrangement === HORIZONTAL ? VERTICAL : HORIZONTAL);

    // region scrolling$, trashed$
    const
      trashSub = hostTrashed$.subscribe(
        () => {
          // The dragend event executes (twice actually) before this gets called.
          console.log('Trashed');
        }
      );

    scrolling$
      .pipe(
        filter(is => is),
        debounceTime(200),
        delay(50)
      )
      .subscribe(
        () => {
          DOMController.updateDragStats();
          scrolling$.next(false);
        },
        // Not quite the right place to do this...
        () => trashSub.unsubscribe()
      );

    this.scrolling$ = scrolling$;
    // endregion

    $(document).bind('scroll', this.onScroll);

    // @ts-ignore
    dropZones.forEach((e) => Markers.markZone(e));

    this.dragStats = {
      record,
      receptacles,
      $dropMarker,
      dropZones,
      draggedElement,
      childArrangement,
      currentDZ,
      dropZoneRects,
      currentDZChildren,
      originDropZone,
      draggedElementIndex,
      currentDZElementRect,
      currentDZChildrenRects
    };

    return this.dragStats;

  }

  static onDragOver({ element, mousePosition }): void {
    if (this.scrolling$.value) {
      return;
    }

    const {
      $dropMarker,
      dropZones,
      childArrangement,
      currentDZ,
      currentDZChildren,
      dropZoneRects,
      currentDZElementRect,
      currentDZChildrenRects
    } = this.dragStats;

    if (element === currentDZ) {

      if (element.children.length > 0) {

        const
          closestChildIndex = findClosestRect(
            currentDZElementRect,
            currentDZChildrenRects,
            mousePosition
          ),
          closestRect = currentDZChildrenRects[closestChildIndex],
          closestChild = currentDZChildren[closestChildIndex],
          before = (childArrangement === HORIZONTAL)
            ? (
              // Is it to the left of the center of the rect?
              mousePosition.x <= (closestRect.left + (closestRect.width / 2))
            ) : (
              // Is it to the north of the center of the rect?
              mousePosition.y <= (closestRect.top + (closestRect.height / 2))
            )
        ;

        // setDropMarkerPosition({
        //   $dropMarker,
        //   arrangement: childArrangement,
        //   insertPosition: before ? 'before' : 'after',
        //   refElement: closestChild,
        //   refElementRect: closestRect,
        //   nextOrPrevRect: before
        //     ? currentDZChildrenRects[closestChildIndex - 1]
        //     : currentDZChildrenRects[closestChildIndex + 1]
        // });

        insertDropMarker({
          $dropMarker,
          refElement: closestChild as HTMLElement,
          insertPosition: before ? 'before' : 'after'
        });

      } else {
        // ...
        console.log('Unhandled case');
      }

    } else {

      const
        DZRectStats = getInRectStats(
          currentDZElementRect,
          mousePosition
        );

      let index;

      if (DZRectStats.inRect) {

        let //
          i = 0,
          rectStats = null,
          currentElement = null,
          currentElementRect = null;

        for (let l = currentDZChildren.length; i < l; i++) {
          rectStats = getInRectStats(currentDZChildrenRects[i], mousePosition);
          currentElement = currentDZChildren[i];
          currentElementRect = currentDZChildrenRects[i];
          if (rectStats.inRect) {
            break;
          }
        }

        if (rectStats.inRect) {

          const
            insertPosition = (
              childArrangement === HORIZONTAL &&
              rectStats.percents.x >= 50
            ) || (
              childArrangement === VERTICAL &&
              rectStats.percents.y >= 50
            ) ? 'after' : 'before'
          ;

          // setDropMarkerPosition({
          //   $dropMarker,
          //   insertPosition,
          //   arrangement: childArrangement,
          //   refElement: currentElement,
          //   refElementRect: currentElementRect,
          //   nextOrPrevRect: insertPosition === 'before'
          //     ? currentDZChildrenRects[i - 1]
          //     : currentDZChildrenRects[i + 1]
          // });

          insertDropMarker({
            $dropMarker,
            insertPosition,
            refElement: currentElement
          });

        }

      } else if (
        (index = dropZoneRects.findIndex((rect) =>
          getInRectStats(rect, mousePosition).inRect
        )) !== -1
      ) {

        this.setCurrentDZStats(dropZones[index]);

      } else {
        $dropMarker.detach();
      }

    }

  }

  static onDrop(): void {
    const {
      $dropMarker,
      draggedElement,
      draggedElementIndex,
      originDropZone,
      currentDZ,
      record,
      receptacles
    } = this.dragStats;

    if (
      $dropMarker.prev().get(0) === draggedElement &&
      $dropMarker.next().get(0) === draggedElement
    ) {
      return;
    }

    // Insert new component

    // @ts-ignore
    if (Markers.draggedComponent) {
      const newComponent = document.createElement('div');
      $dropMarker.after(newComponent);
      // noinspection JSXNamespaceValidation
      render(
        // @ts-ignore
        // eslint-disable-next-line react/jsx-no-undef,react/react-in-jsx-scope
        <DroppedComponentPlaceholder
          // @ts-ignore
          component={Markers.draggedComponent}
          node={newComponent}
        />,
        newComponent);
      return;
    }

    // noinspection JSCheckFunctionSignatures
    if (
      // @ts-ignore
      notNullOrUndefined(Markers.draggedElement) &&
      // jQuery contains' first param is type Element, document doesn't match
      // @ts-ignore
      not($.contains(document, $dropMarker[0]))
    ) {
      return;
    }

    // Move a component

    let targetIndex = $dropMarker
      .parent()
      .children()
      .index($dropMarker[0]);

    const containerRecord = iceRegistry.recordOf(
      (iceRegistry.isRepeatGroup(record.id))
        ? (
          receptacles.find((id) =>
            record.modelId === iceRegistry.recordOf(id).modelId
          )
        ) : (
          receptacles.find((id) => {
            const entries = iceRegistry.getReferentialEntries(id);
            const value = ModelHelper.value(entries.model, entries.fieldId);
            return value.includes(record.modelId);
          })
        )
    );

    if (currentDZ === originDropZone) {

      // If moving the item down the array of items, need
      // to account all the - orginally - subsequent items
      // moving up.
      if (draggedElementIndex < targetIndex) {
        // Hence the final target index in reality is
        // the drop marker's index minus 1
        --targetIndex;
      }

      contentController.sortItem(
        containerRecord.modelId,
        containerRecord.fieldId,
        draggedElementIndex,
        targetIndex
      );

    } else {

      const zone = this.getZoneFor(currentDZ);
      const rec = iceRegistry.recordOf(zone.recordIds[0]);

      // Chrome didn't trigger the dragend event
      // without the set timeout.
      setTimeout(
        () => contentController.moveItem(
          containerRecord.modelId,
          containerRecord.fieldId,
          draggedElementIndex,
          rec.modelId,
          rec.fieldId,
          targetIndex
        ),
        20
      );

    }

  }

  static clearDragStats(): void {
    $(document).unbind('scroll', this.onScroll);

    // this.dragStats.$dropMarker.remove();
    // this.dragStats = null;

    this.scrolling$.complete();
    this.scrolling$.unsubscribe();
    this.scrolling$ = null;
  }

  static onDragEnd(): void {
    if (!this.dragStats) {
      return;
    }
    this.clearDragStats();
  }

  static onClick(element): void {
    const elem = this.findZoneElement(element);
    if (elem) {
      const field = this.getFieldFor(elem)[0];
      new ComponentEditor({ element: elem, field });
    }
  }

  static onScroll(): void {
    DOMController.dragStats.$dropMarker.detach();
    DOMController.scrolling$.next(true);
  }

}
