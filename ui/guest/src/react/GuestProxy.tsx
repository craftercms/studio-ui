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

import React, { useEffect, useRef } from 'react';
import { useGuestContext, useSelector } from './GuestContext';
import * as ElementRegistry from '../classes/ElementRegistry';
import { getParentElementFromICEProps } from '../classes/ElementRegistry';
import * as iceRegistry from '../classes/ICERegistry';
import $ from 'jquery';
import {
  contentTypes$,
  getCachedContentType,
  getCachedModel,
  models$,
  operations$,
  paths$
} from '../classes/ContentController';
import { zip } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import * as ContentType from '@craftercms/studio-ui/utils/contentType';
import { message$ } from '../utils/communicator';
import { Operation } from '../models/Operations';
import {
  deleteItemOperation,
  insertComponentOperation,
  insertInstanceOperation,
  moveItemOperation,
  sortItemOperation,
  updateFieldValueOperation
} from '@craftercms/studio-ui/state/actions/preview';
import { GuestState } from '../store/models/GuestStore';
import { notNullOrUndefined } from '@craftercms/studio-ui/utils/object';
import { forEach } from '@craftercms/studio-ui/utils/array';
import { popPiece, removeLastPiece } from '@craftercms/studio-ui/utils/string';
import { addAnimation } from '../utils/dom';

export function GuestProxy() {
  const draggable = useSelector<GuestState['draggable']>((state) => state.draggable);
  const { onEvent } = useGuestContext();
  const persistenceRef = useRef({ draggableElement: null, onEvent });

  persistenceRef.current.onEvent = onEvent;

  // Initial registration of elements.
  useEffect(() => {
    // Registers a single element
    const registerElement = (element: Element): void => {
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
      collection: Element[],
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
      if (type === 'insert' || type === 'delete') {
        const itemsToReRegister = collection.slice(newIndex);
        itemsToReRegister.forEach((el, i) => {
          const elementNewIndex = appendIndex(originalNewIndex, i);
          if (type === 'insert' && String(originalNewIndex) === String(elementNewIndex)) {
            addAnimation($(el), 'craftercms-content-tree-locate');
          }
          $(el).attr('data-craftercms-index', elementNewIndex);
          const elementRecord = ElementRegistry.fromElement(el);
          ElementRegistry.deregister(elementRecord.id);
        });
        itemsToReRegister.forEach((el) => registerElement(el));
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

          // TODO: Pending to check if fieldId may have dotted notation. (repeat inside repeat)
          el.querySelectorAll(
            `[data-craftercms-field-id^="${fieldId}."][data-craftercms-index^="${currentElementIndex}"]`
          ).forEach((element) => {
            const position = $(element).attr('data-craftercms-field-id').split('.').indexOf(fieldId);
            const elementIndex = $(element).attr('data-craftercms-index');
            const splitIndex = elementIndex.split('.');
            splitIndex[position] = elementNewIndex.toString();

            $(element).attr('data-craftercms-index', splitIndex.join('.'));

            childrenToRegister.push(element);

            const elementRecord = ElementRegistry.fromElement(element);
            ElementRegistry.deregister(elementRecord.id);
          });

          if (originalOldIndex === elementNewIndex) {
            addAnimation($(el), 'craftercms-content-tree-locate');
          }
          const elementRecord = ElementRegistry.fromElement(el);
          ElementRegistry.deregister(elementRecord.id);
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
        document.querySelectorAll('[data-craftercms-model-id]').forEach(registerElement);
      });

    const handler: JQuery.EventHandlerBase<any, any> = (e: Event): void => {
      let record = ElementRegistry.fromElement(e.currentTarget as Element);
      if (notNullOrUndefined(record)) {
        persistenceRef.current.onEvent(e, record.id);
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
      .on('dblclick', '[data-craftercms-model-id]', handler);

    const sub = operations$.subscribe((op: Operation) => {
      switch (op.type) {
        case sortItemOperation.type: {
          let [modelId, fieldId, index, newIndex] = op.args;
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
          const [
            modelId /* : string */,
            fieldId /* : string */,
            index /* : number */,
            targetModelId /* : string */,
            targetFieldId /* : string */,
            targetIndex
          ] = op.args;

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

          addAnimation($(moveTargetPhyRecord.element), 'craftercms-content-tree-locate');

          break;
        }
        case deleteItemOperation.type: {
          const [modelId, fieldId, index] = op.args;

          const iceId = iceRegistry.exists({ modelId, fieldId, index });
          const phyRecord = ElementRegistry.fromICEId(iceId);

          ElementRegistry.deregister(phyRecord.id);

          // Immediate removal of the element causes the dragend event not
          // to fire leaving the state corrupt - in a state of "SORTING".
          setTimeout(() => {
            const $daddy: JQuery<Element> = $(phyRecord.element).parent();
            $(phyRecord.element).remove();
            updateElementRegistrations(Array.from($daddy.children()), 'delete', index);
          });

          break;
        }
        case insertComponentOperation.type:
        case insertInstanceOperation.type: {
          const { modelId, fieldId, targetIndex, instance } = op.args;

          const $spinner = $(`
            <svg class="craftercms-placeholder-spinner" width=50 height=50 viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
              <circle class="path" fill="none" stroke-width=5 stroke-linecap="round" cx="25" cy="25" r="20"/>
            </svg>
          `);

          const $daddy = getParentElementFromICEProps(modelId, fieldId, targetIndex);

          insertElement($spinner, $daddy, targetIndex);

          message$
            .pipe(
              filter(
                (e) =>
                  e.type === 'INSERT_OPERATION_COMPLETE' && e.payload.instance.craftercms.id === instance.craftercms.id
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
                updateElementRegistrations(Array.from($daddy.children()), 'insert', targetIndex);
                $component.find('[data-craftercms-model-id]').each((i, el) => registerElement(el));
                ifrm.remove();
              };
            });

          break;
        }
        case updateFieldValueOperation.type:
          const { modelId, fieldId, index = 0, value } = op.args;
          const updatedField: JQuery<any> = $(
            `[data-craftercms-model-id="${modelId}"][data-craftercms-field-id="${fieldId}"]`
          );
          const model = getCachedModel(modelId);
          const contentType = getCachedContentType(model.craftercms.contentTypeId);
          const fieldType = ContentType.getField(contentType, fieldId).type;

          if (fieldType === 'image') {
            const tagName = updatedField.eq(index).prop('tagName').toLowerCase();
            if (tagName === 'img') {
              updatedField.eq(index).attr('src', value);
            } else {
              updatedField.eq(index).css('background-image', `url(${value})`);
            }
          } else if (fieldType === 'video-picker') {
            updatedField.eq(index).find('source').attr('src', value);
            updatedField.eq(index)[0].load();
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
