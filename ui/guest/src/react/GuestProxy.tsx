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
import { useGuestContext } from './GuestContext';
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
import * as ContentType from '../utils/contentType';
import { message$, post } from '../utils/communicator';
import { Operation } from '../models/Operations';
import {
  COMPONENT_INSTANCE_HTML_REQUEST,
  COMPONENT_INSTANCE_HTML_RESPONSE,
  DELETE_ITEM_OPERATION,
  INSERT_COMPONENT_OPERATION,
  INSERT_INSTANCE_OPERATION,
  MOVE_ITEM_OPERATION,
  SORT_ITEM_OPERATION,
  UPDATE_FIELD_VALUE_OPERATION
} from '../constants';
import { useSelector } from 'react-redux';
import { GuestState } from '../store/models/GuestStore';
import { notNullOrUndefined } from '../utils/object';
import { forEach } from '../utils/array';
import { popPiece, removeLastPiece } from '../utils/string';
import { addAnimation } from '../utils/dom';

export default function GuestProxy() {
  const draggable = useSelector<GuestState, GuestState['draggable']>((state) => state.draggable);
  const { onEvent } = useGuestContext();
  const persistenceRef = useRef({ draggableElement: null, onEvent });

  // onEvent ref updated (persistenceRef.current.onEvent).
  useEffect(() => {
    persistenceRef.current.onEvent = onEvent;
  }, [onEvent]);

  // Initial registration of elements.
  useEffect(() => {
    const registerElement = (element: Element): void => {
      let //
        path = element.getAttribute('data-craftercms-model-path'),
        modelId = element.getAttribute('data-craftercms-model-id'),
        fieldId = element.getAttribute('data-craftercms-field-id'),
        index: string | number = element.getAttribute('data-craftercms-index'),
        label = element.getAttribute('data-craftercms-label');

      if (notNullOrUndefined(index) && !index.includes('.')) {
        // TODO: Need to assess the impact of index being a string with dot notation
        // Unsure if somewhere, the system relies on the index being an integer/number.
        // Affected inventory:
        // - Guest.moveComponent() - string type handled
        index = parseInt(index, 10);
      }

      ElementRegistry.register({ element, modelId, fieldId, index, label, path });
    };

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
      oldIndex?: string | number
    ): void => {
      let originalNewIndex = newIndex;
      let originalOldIndex = oldIndex;
      newIndex = typeof newIndex === 'string' ? parseInt(popPiece(newIndex)) : newIndex;
      oldIndex = typeof oldIndex === 'string' ? parseInt(popPiece(oldIndex)) : oldIndex;
      if (type === 'insert' || type === 'delete') {
        collection.slice(newIndex).forEach((el, i) => {
          const elementNewIndex = appendIndex(originalNewIndex, i);
          if (originalNewIndex === elementNewIndex && type === 'insert') {
            addAnimation($(el), 'craftercms-content-tree-locate');
          }
          $(el).attr('data-craftercms-index', elementNewIndex);
          const pr = ElementRegistry.fromElement(el);
          pr && ElementRegistry.deregister(pr.id);
          registerElement(el);
        });
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
        collection.slice(from, to).forEach((el, i) => {
          const elementNewIndex = appendIndex(index, i);
          $(el).attr('data-craftercms-index', elementNewIndex);
          if (originalOldIndex === elementNewIndex) {
            addAnimation($(el), 'craftercms-content-tree-locate');
          }
          const pr = ElementRegistry.fromElement(el);
          pr && ElementRegistry.deregister(pr.id);
          registerElement(el);
        });
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
        case SORT_ITEM_OPERATION: {
          let [modelId, fieldId, index, newIndex] = op.args;
          const currentIndexParsed = typeof index === 'number' ? index : parseInt(popPiece(index));
          const targetIndexParsed = typeof newIndex === 'number' ? newIndex : parseInt(popPiece(newIndex));
          // This works only for repeat groups
          let iceId = iceRegistry.exists({ modelId, fieldId, index });
          // This would work for both repeat groups and node-selectors. Just use this?
          if (iceId === -1) {
            const model = getCachedModel(modelId);
            // By this point - on the operations subscriber - the operation has already gone through.
            // Hence, need to use the "newIndex" to retrieve the model in question. The registration
            // hasn't been updated yet so still using the old index.
            iceId = iceRegistry.exists({ modelId: model[fieldId][newIndex], index });
          }

          const phyRecord = ElementRegistry.fromICEId(iceId);
          const $el = $(phyRecord.element);
          const $targetSibling = $el
            .parent()
            .children()
            .eq(targetIndexParsed);

          // Move...
          if (currentIndexParsed < targetIndexParsed) {
            $el.insertAfter($targetSibling);
          } else {
            $el.insertBefore($targetSibling);
          }

          updateElementRegistrations(Array.from($el.parent().children()), 'sort', index, newIndex);
          break;
        }
        case MOVE_ITEM_OPERATION: {
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
        case DELETE_ITEM_OPERATION: {
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
        case INSERT_COMPONENT_OPERATION: {
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
            .subscribe(function({ payload }) {
              const { modelId, fieldId, targetIndex, currentUrl } = payload;
              let ifrm = document.createElement('iframe');
              ifrm.setAttribute('src', `${currentUrl}`);
              ifrm.style.width = '0';
              ifrm.style.height = '0';
              document.body.appendChild(ifrm);

              ifrm.onload = function() {
                $spinner.remove();
                const htmlString = ifrm.contentWindow.document.documentElement.querySelector(
                  `[data-craftercms-model-id="${modelId}"][data-craftercms-field-id="${fieldId}"][data-craftercms-index="${targetIndex}"]`
                );
                const $component = $(htmlString?.outerHTML);
                insertElement($component, $daddy, targetIndex);
                updateElementRegistrations(Array.from($daddy.children()), 'insert', targetIndex);
                $component.find('[data-craftercms-model-id]').each((i, el) => registerElement(el));
                ifrm.remove();
              };
            });

          break;
        }
        case INSERT_INSTANCE_OPERATION: {
          const { modelId, fieldId, targetIndex, instance } = op.args;

          const $spinner = $(`
            <svg class="craftercms-placeholder-spinner" width=50 height=50 viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
              <circle class="path" fill="none" stroke-width=5 stroke-linecap="round" cx="25" cy="25" r="20"/>
            </svg>
          `);

          const $daddy = getParentElementFromICEProps(modelId, fieldId, targetIndex);

          insertElement($spinner, $daddy, targetIndex);

          const id = Date.now();

          message$
            .pipe(
              filter((e) => e.type === COMPONENT_INSTANCE_HTML_RESPONSE && e.payload.id === id),
              take(1)
            )
            .subscribe(function({ payload }) {
              const $root = $('<div/>').html(payload.response);
              const $component = $root.children().length > 1 ? $root : $($root.children()[0]);
              $component.attr('data-craftercms-model-id', modelId);
              $component.attr('data-craftercms-field-id', fieldId);
              $spinner.remove();
              insertElement($component, $daddy, targetIndex);
              updateElementRegistrations(Array.from($daddy.children()), 'insert', targetIndex);
              $component.find('[data-craftercms-model-id]').each((i, el) => registerElement(el));
            });

          post(COMPONENT_INSTANCE_HTML_REQUEST, { id, path: instance.craftercms.path });

          break;
        }
        case UPDATE_FIELD_VALUE_OPERATION:
          const { modelId, fieldId, index = 0, value } = op.args;
          const updatedField: JQuery<any> = $(
            `[data-craftercms-model-id="${modelId}"][data-craftercms-field-id="${fieldId}"]`
          );
          const model = getCachedModel(modelId);
          const contentType = getCachedContentType(model.craftercms.contentTypeId);
          const fieldType = ContentType.getField(contentType, fieldId).type;

          if (fieldType === 'image') {
            const tagName = updatedField
              .eq(index)
              .prop('tagName')
              .toLowerCase();
            if (tagName === 'img') {
              updatedField.eq(index).attr('src', value);
            } else {
              updatedField.eq(index).css('background-image', `url(${value})`);
            }
          } else if (fieldType === 'video-picker') {
            updatedField
              .eq(index)
              .find('source')
              .attr('src', value);
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
      $(persistence.draggableElement)
        .attr('draggable', 'false')
        .removeAttr('draggable');
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
