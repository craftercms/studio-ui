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

import React, { useEffect, useRef } from 'react';
import { useGuestContext, useSelector } from './GuestContext';
import * as ElementRegistry from '../elementRegistry';
import { getParentElementFromICEProps } from '../elementRegistry';
import * as iceRegistry from '../iceRegistry';
import $ from 'jquery';
import {
  contentTypes$,
  getCachedContentType,
  getCachedModel,
  getModelIdFromInheritedField,
  models$,
  operations$,
  paths$
} from '../contentController';
import { zip } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import * as ContentType from '@craftercms/studio-ui/utils/contentType';
import { message$ } from '../utils/communicator';
import { Operation } from '../models/Operations';
import {
  deleteItemOperation,
  duplicateItemOperation,
  duplicateItemOperationComplete,
  insertComponentOperation,
  insertItemOperation,
  insertItemOperationComplete,
  insertOperationComplete,
  moveItemOperation,
  sortItemOperation,
  updateFieldValueOperation
} from '@craftercms/studio-ui/state/actions/preview';
import { GuestState } from '../store/models/GuestStore';
import { notNullOrUndefined } from '@craftercms/studio-ui/utils/object';
import { forEach } from '@craftercms/studio-ui/utils/array';
import { isSimple, popPiece, removeLastPiece } from '@craftercms/studio-ui/utils/string';
import { addAnimation } from '../utils/dom';
import { emptyCollectionClass } from '../constants';

export function GuestProxy() {
  const draggable = useSelector<GuestState['draggable']>((state) => state.draggable);
  const { onEvent } = useGuestContext();
  const persistenceRef = useRef({ draggableElement: null, onEvent });

  persistenceRef.current.onEvent = onEvent;

  // Initial registration of elements.
  useEffect(() => {
    // Registers a single element
    const registerElement = (element: HTMLElement): void => {
      let path = element.getAttribute('data-craftercms-model-path');
      let modelId = element.getAttribute('data-craftercms-model-id');
      let fieldId = element.getAttribute('data-craftercms-field-id');
      let index: string | number = element.getAttribute('data-craftercms-index');
      let label = element.getAttribute('data-craftercms-label');

      if (notNullOrUndefined(index) && !index.includes('.')) {
        // TODO: Need to assess the impact of index being a string with dot notation
        // Unsure if somewhere, the system relies on the index being an integer/number.
        // Affected inventory:
        // - Guest.moveComponent() - string type handled
        index = parseInt(index, 10);
      }

      ElementRegistry.register({ element, modelId, fieldId, index, label, path });
    };

    // Used to assign new indexes to a given collection when one items get shifted (move up/down, insert, delete).
    // Inspects the supplied index, if it has dot notation it process it accordingly.
    const appendIndex = (index: string | number, value: number): string | number => {
      return typeof index === 'string'
        ? `${removeLastPiece(index)}.${parseInt(popPiece(index)) + value}`
        : index + value;
    };

    const generateIndex = (index, value): string | number => {
      return typeof index === 'string' ? `${removeLastPiece(index)}.${value}` : value;
    };

    const updateElementRegistrations = (
      collection: HTMLElement[],
      type: string,
      newIndex: string | number,
      oldIndex?: string | number,
      fieldId?: string
    ): void => {
      let originalNewIndex = newIndex;
      let originalOldIndex = oldIndex;
      newIndex = typeof newIndex === 'string' ? parseInt(popPiece(newIndex)) : newIndex;
      oldIndex = typeof oldIndex === 'string' ? parseInt(popPiece(oldIndex)) : oldIndex;
      // Note for the loops below:
      // Because more than one item may change their index, we need to deregister all items before
      // proceeding to registering again. Registering immediately after de-registering on the same
      // loop causes misjudging ICE records refCounts due to displaced collection items.

      function updateRepeatGroupsItems(element, fieldId, index, newIndex, elements) {
        element
          .querySelectorAll(`[data-craftercms-field-id^="${fieldId}."][data-craftercms-index^="${index}"]`)
          .forEach((element) => {
            let position = $(element)
              .attr('data-craftercms-field-id')
              .split('.')
              .indexOf(isSimple(fieldId) ? fieldId : popPiece(fieldId));
            let elementIndex = $(element).attr('data-craftercms-index');
            let splitIndex = elementIndex.split('.');
            splitIndex[position] = isSimple(fieldId) ? newIndex.toString() : popPiece(newIndex.toString());

            $(element).attr('data-craftercms-index', splitIndex.join('.'));

            elements.push(element);

            const elementRecord = ElementRegistry.fromElement(element);
            elementRecord && ElementRegistry.deregister(elementRecord.id);
          });
      }

      if (type === 'insert' || type === 'delete') {
        const itemsToReRegister = collection.slice(newIndex);
        const childrenToRegister = [];
        itemsToReRegister.forEach((el, i) => {
          const currentElementIndex = $(el).attr('data-craftercms-index');
          const elementNewIndex = appendIndex(originalNewIndex, i);
          if (type === 'insert' && String(originalNewIndex) === String(elementNewIndex)) {
            addAnimation($(el), 'craftercms-content-tree-locate');
          }
          $(el).attr('data-craftercms-index', elementNewIndex);

          updateRepeatGroupsItems(el, fieldId, currentElementIndex, elementNewIndex, childrenToRegister);

          const elementRecord = ElementRegistry.fromElement(el);
          elementRecord && ElementRegistry.deregister(elementRecord.id);
        });
        itemsToReRegister.concat(childrenToRegister).forEach((el) => registerElement(el));
      } else if (type === 'sort') {
        let from;
        let to;
        let index;
        if (oldIndex < newIndex) {
          from = oldIndex;
          to = newIndex + 1;
          index = originalOldIndex;
        } else {
          from = newIndex;
          to = oldIndex + 1;
          index = originalNewIndex;
        }
        const itemsToReRegister = collection.slice(from, to);
        const childrenToRegister = [];
        itemsToReRegister.forEach((el, i) => {
          const currentElementIndex = $(el).attr('data-craftercms-index');
          const elementNewIndex = appendIndex(index, i);

          $(el).attr('data-craftercms-index', elementNewIndex);

          updateRepeatGroupsItems(el, fieldId, currentElementIndex, elementNewIndex, childrenToRegister);

          if (originalOldIndex === elementNewIndex) {
            addAnimation($(el), 'craftercms-content-tree-locate');
          }
          const elementRecord = ElementRegistry.fromElement(el);
          elementRecord && ElementRegistry.deregister(elementRecord.id);
        });
        itemsToReRegister.concat(childrenToRegister).forEach((el) => registerElement(el));
      }
    };

    const insertElement = ($element: JQuery<any>, $daddy: JQuery<any>, targetIndex: string | number): void => {
      const index = typeof targetIndex === 'string' ? parseInt(popPiece(targetIndex)) : targetIndex;
      const $siblings = $daddy.find('> *');
      if ($siblings.length === index) {
        $daddy.append($element);
      } else {
        $element.insertBefore($siblings.eq(index));
      }
    };

    zip(models$, contentTypes$, paths$)
      .pipe(take(1))
      .subscribe(() => {
        document.querySelectorAll<HTMLElement>('[data-craftercms-model-id]').forEach(registerElement);
      });

    let stopDragScroll = false;
    const handler: JQuery.EventHandlerBase<any, any> = (e: Event): void => {
      if (e.type === 'dragover') {
        onDragHandler(e);
      }
      let record = ElementRegistry.fromElement(e.currentTarget as Element);
      if (notNullOrUndefined(record)) {
        persistenceRef.current.onEvent(e, record.id);
      }
    };
    const onDragHandler: JQuery.EventHandlerBase<any, any> = (e): void => {
      const dragScroll = function (step) {
        var scrollY = $(window).scrollTop();
        $(window).scrollTop(scrollY + step);
        if (!stopDragScroll) {
          setTimeout(function () {
            dragScroll(step);
          }, 20);
        }
      };

      stopDragScroll = true;
      if (e.originalEvent.clientY < 150) {
        stopDragScroll = false;
        dragScroll(-1);
      }
      const windowHeight = document.querySelector('html').clientHeight;
      const windowWidth = document.querySelector('html').clientWidth;
      if (e.originalEvent.clientX <= windowWidth && e.originalEvent.clientY > windowHeight - 150) {
        stopDragScroll = false;
        dragScroll(1);
      }
    };

    $(document)
      .on('mouseover', '[data-craftercms-model-id]', handler)
      .on('mouseleave', '[data-craftercms-model-id]', handler)
      .on('dragstart', '[data-craftercms-model-id]', handler)
      .on('dragover', '[data-craftercms-model-id]', handler)
      .on('dragleave', '[data-craftercms-model-id]', handler)
      .on('drop', '[data-craftercms-model-id]', handler)
      .on('dragend', '[data-craftercms-model-id]', handler)
      .on('click', '[data-craftercms-model-id]', handler)
      .on('dblclick', '[data-craftercms-model-id]', handler)
      .on('drag', '[data-craftercms-model-id]', (e) => onDragHandler(e, window, stopDragScroll))
      .on('dragend', '[data-craftercms-model-id]', () => (stopDragScroll = true));

    const sub = operations$.subscribe((op: Operation) => {
      switch (op.type) {
        case sortItemOperation.type: {
          let { modelId, fieldId, currentIndex: index, targetIndex: newIndex } = op.payload;
          const currentIndexParsed = typeof index === 'number' ? index : parseInt(popPiece(index));
          const targetIndexParsed = typeof newIndex === 'number' ? newIndex : parseInt(popPiece(newIndex));
          // This works only for repeat groups
          let iceId = iceRegistry.exists({ modelId, fieldId, index });
          // This would work for both repeat groups and node-selectors. Just use this?
          if (iceId === null) {
            const model = getCachedModel(modelId);
            // By this point - on the operations subscriber - the operation has already gone through.
            // Hence, need to use the "newIndex" to retrieve the model in question. The registration
            // hasn't been updated yet so still using the old index.
            iceId = iceRegistry.exists({ modelId: model[fieldId][newIndex], index });
          }

          const phyRecord = ElementRegistry.fromICEId(iceId);
          const $el = $(phyRecord.element);
          const $targetSibling = $el.parent().children().eq(targetIndexParsed);

          // Move...
          if (currentIndexParsed < targetIndexParsed) {
            $el.insertAfter($targetSibling);
          } else {
            $el.insertBefore($targetSibling);
          }

          updateElementRegistrations(Array.from($el.parent().children()), 'sort', index, newIndex, fieldId);
          break;
        }
        case moveItemOperation.type: {
          const {
            originalModelId: modelId /* : string */,
            originalFieldId: fieldId /* : string */,
            originalIndex: index /* : number */,
            targetModelId /* : string */,
            targetFieldId /* : string */,
            targetIndex
          } = op.payload;

          const targetIndexParsed = typeof targetIndex === 'number' ? targetIndex : parseInt(popPiece(targetIndex));
          const currentDropZoneICEId = iceRegistry.exists({
            modelId,
            fieldId,
            index: fieldId.includes('.') ? parseInt(removeLastPiece(index as string)) : null
          });
          const currentDropZonePhyRecord = ElementRegistry.fromICEId(currentDropZoneICEId);

          const targetDropZoneICEId = iceRegistry.exists({
            modelId: targetModelId,
            fieldId: targetFieldId,
            index: targetFieldId.includes('.') ? parseInt(removeLastPiece(targetIndex as string)) : null
          });
          const targetDropZonePhyRecord = ElementRegistry.fromICEId(targetDropZoneICEId);

          const moveTargetICEId = iceRegistry.exists({ modelId, fieldId, index });
          const moveTargetPhyRecord = ElementRegistry.fromICEId(moveTargetICEId);

          const $sourceDropZone = $(currentDropZonePhyRecord.element);
          const $targetDropZone = $(targetDropZonePhyRecord.element);

          if (targetIndexParsed === 0) {
            $targetDropZone.prepend(moveTargetPhyRecord.element);
          } else if ($targetDropZone.children().length === targetIndexParsed) {
            $targetDropZone.append(moveTargetPhyRecord.element);
          } else {
            const targetIndexOccupantICEId = iceRegistry.exists({
              modelId: targetModelId,
              fieldId: targetFieldId,
              index: targetIndex
            });
            const targetIndexOccupantPhyRecord = ElementRegistry.fromICEId(targetIndexOccupantICEId);

            $(moveTargetPhyRecord.element).insertBefore(targetIndexOccupantPhyRecord.element);
          }

          [currentDropZonePhyRecord, targetDropZonePhyRecord].forEach((record) => {
            let newIndex = record === currentDropZonePhyRecord ? index : targetIndex;
            $(record.element)
              .find('> [data-craftercms-index]')
              .each((i, elem) => {
                ElementRegistry.deregister(ElementRegistry.fromElement(elem).id);
                $(elem).attr('data-craftercms-model-id', record.modelId);
                $(elem).attr('data-craftercms-field-id', record.fieldId);
                $(elem).attr('data-craftercms-index', generateIndex(newIndex, i));

                registerElement(elem);
              });
          });

          $targetDropZone.removeClass(emptyCollectionClass);
          if ($sourceDropZone.children().length === 0) {
            $sourceDropZone.addClass(emptyCollectionClass);
          }

          addAnimation($(moveTargetPhyRecord.element), 'craftercms-content-tree-locate');

          break;
        }
        case deleteItemOperation.type: {
          const { modelId, fieldId, index } = op.payload;

          const iceId = iceRegistry.exists({ modelId, fieldId, index });
          const phyRecord = ElementRegistry.fromICEId(iceId);

          ElementRegistry.deregister(phyRecord.id);

          // Immediate removal of the element causes the dragend event not
          // to fire leaving the state corrupt - in a state of "SORTING".
          setTimeout(() => {
            const $daddy: JQuery<Element> = $(phyRecord.element).parent();
            $(phyRecord.element).remove();
            if ($daddy.children().length === 0) {
              $daddy.addClass(emptyCollectionClass);
            }
            updateElementRegistrations(Array.from($daddy.children()), 'delete', index, null, fieldId);
          });

          break;
        }
        case insertItemOperation.type: {
          message$
            .pipe(
              filter((e) => e.type === insertItemOperationComplete.type),
              take(1)
            )
            .subscribe({
              next() {
                window.location.reload();
              }
            });
          break;
        }
        case duplicateItemOperation.type: {
          message$
            .pipe(
              filter((e) => e.type === duplicateItemOperationComplete.type),
              take(1)
            )
            .subscribe({
              next() {
                window.location.reload();
              }
            });
          break;
        }
        case insertComponentOperation.type: {
          const { modelId, fieldId, targetIndex, instance } = op.payload;

          const $spinner = $(`
            <div style="text-align: center">
              <svg class="craftercms-placeholder-spinner" width=50 height=50 viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                <circle class="path" fill="none" stroke-width=5 stroke-linecap="round" cx="25" cy="25" r="20"/>
              </svg>
            </div>
          `);

          const $daddy = getParentElementFromICEProps(modelId, fieldId, targetIndex);

          // If $daddy has children, get the closest  one to the one that is being added, and get its width to set it
          // to the spinner container.
          const childrenLength = $daddy.children().length;
          if (childrenLength) {
            const index = typeof targetIndex === 'number' ? targetIndex : parseInt(popPiece(targetIndex));
            const child = $daddy.children()[index < childrenLength ? index : childrenLength - 1];
            const daddyDisplay = $daddy.css('display');
            // set spinner styles according to the parent display
            $spinner.css(
              daddyDisplay === 'flex'
                ? {
                    display: 'flex',
                    width: `${child.offsetWidth}px`,
                    'align-items': 'center',
                    'justify-content': 'center'
                  }
                : {
                    display: 'inline-block',
                    width: `${child.offsetWidth}px`
                  }
            );
          }

          $daddy.removeClass(emptyCollectionClass);
          insertElement($spinner, $daddy, targetIndex);

          message$
            .pipe(
              filter(
                (e) =>
                  e.type === insertOperationComplete.type && e.payload.instance.craftercms.id === instance.craftercms.id
              ),
              take(1)
            )
            .subscribe(function ({ payload }) {
              const { modelId, fieldId, targetIndex, currentFullUrl } = payload;
              let ifrm = document.createElement('iframe');
              ifrm.setAttribute('src', currentFullUrl);
              ifrm.style.width = '0';
              ifrm.style.height = '0';
              document.body.appendChild(ifrm);

              ifrm.onload = function () {
                $spinner.remove();
                const itemElement = ifrm.contentWindow.document.documentElement.querySelector(
                  `[data-craftercms-model-id="${modelId}"][data-craftercms-field-id="${fieldId}"][data-craftercms-index="${targetIndex}"]`
                );
                const $component = $(itemElement?.outerHTML);
                insertElement($component, $daddy, targetIndex);
                updateElementRegistrations(Array.from($daddy.children()), 'insert', targetIndex, null, fieldId);
                $component.find('[data-craftercms-model-id]').each((i, el) => registerElement(el));
                ifrm.remove();
              };
            });

          break;
        }
        case updateFieldValueOperation.type:
          let { modelId, fieldId, index, value } = op.payload;
          const modelIdToEdit = getModelIdFromInheritedField(modelId, fieldId);
          // TODO: consider index 'path'
          // If index has a value, filter by `data-craftercms-index`
          let updatedField: JQuery<any> = $(
            // Even though it may be an inherited field, the modelId used in the markup is the one that inherits the field.
            `[data-craftercms-model-id="${modelId}"][data-craftercms-field-id="${fieldId}"]${
              notNullOrUndefined(index) ? `[data-craftercms-index="${index}"]` : ''
            }`
          );
          const model = getCachedModel(modelIdToEdit);
          const contentType = getCachedContentType(model.craftercms.contentTypeId);
          const fieldType = ContentType.getField(contentType, fieldId).type;

          if (fieldType === 'image') {
            // At this time all the items in updatedField have the same tagName, use first item
            const tagName = updatedField.eq(0).prop('tagName').toLowerCase();
            if (tagName === 'img') {
              updatedField.attr('src', value);
            } else {
              updatedField.css('background-image', `url(${value})`);
            }
          } else if (fieldType === 'video-picker') {
            updatedField.find('source').attr('src', value);
            updatedField.each((index, element) => {
              element.load();
            });
          }

          break;
      }
    });

    return () => {
      sub.unsubscribe();
      $(document)
        .off('mouseover', '[data-craftercms-model-id]', handler)
        .off('mouseleave', '[data-craftercms-model-id]', handler)
        .off('dragstart', '[data-craftercms-model-id]', handler)
        .off('dragover', '[data-craftercms-model-id]', handler)
        .off('dragleave', '[data-craftercms-model-id]', handler)
        .off('drop', '[data-craftercms-model-id]', handler)
        .off('dragend', '[data-craftercms-model-id]', handler)
        .off('click', '[data-craftercms-model-id]', handler)
        .off('dblclick', '[data-craftercms-model-id]', handler);
    };
  }, []);

  // Updates in draggability of elements.
  useEffect(() => {
    const persistence = persistenceRef.current;
    if (notNullOrUndefined(persistence.draggableElement)) {
      $(persistence.draggableElement).attr('draggable', 'false').removeAttr('draggable');
    }
    forEach(Object.entries(draggable), ([elemId, iceId]) => {
      if (iceId !== false) {
        // @ts-ignore TODO: Fix type
        const record = ElementRegistry.get(elemId);
        // Item deletion incurs in a brief moment where a record has been removed
        // but the context draggable table hasn't been cleaned up.
        if (record != null) {
          persistence.draggableElement = record.element;
          $(record.element).attr('draggable', 'true');
        }
      }
    });
  }, [draggable]);

  return <></>;
}

export default GuestProxy;
