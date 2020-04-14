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
import {
  COMPONENT_INSTANCE_HTML_REQUEST,
  COMPONENT_INSTANCE_HTML_RESPONSE,
  DELETE_ITEM_OPERATION,
  forEach,
  INSERT_COMPONENT_OPERATION,
  INSERT_INSTANCE_OPERATION,
  notNullOrUndefined,
  popPiece,
  removeLastPiece,
  UPDATE_FIELD_VALUE_OPERATION
} from '../util';
import { useGuestContext } from './GuestContext';
import { ElementRegistry } from '../classes/ElementRegistry';
import iceRegistry from '../classes/ICERegistry';
import $ from 'jquery';
import contentController, { ContentController } from '../classes/ContentController';
import { zip } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { ContentTypeHelper } from '../classes/ContentTypeHelper';
import { message$, post } from '../communicator';
import { ContentTypeField } from '../models/ContentType';
import { ContentInstance } from '../models/ContentInstance';
import { Operation } from '../models/Operations';

export function GuestProxy(props) {

  const context = useGuestContext();
  const { current: persistence } = useRef({
    draggable: null,
    editable: null
  });

  useEffect(() => {

    const registerElement = (element: Element): void => {

      let
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

      context.register({ element, modelId, fieldId, index, label });

    };

    const appendIndex = (index: string | number, value: number): string | number => {
      return (typeof index === 'string') ? `${removeLastPiece(index)}.${parseInt(popPiece(index)) + value}` : index + value;
    };

    const generateIndex = (index, value): string | number => {
      return (typeof index === 'string') ? `${removeLastPiece(index)}.${value}` : value;
    };

    const updateElementRegistrations = (collection: Element[], type: string, newIndex: string | number, oldIndex?: string | number): void => {
      let originalNewIndex = newIndex;
      let originalOldIndex = oldIndex;
      newIndex = (typeof newIndex === 'string') ? parseInt(popPiece(newIndex)) : newIndex;
      oldIndex = (typeof oldIndex === 'string') ? parseInt(popPiece(oldIndex)) : oldIndex;
      if (type === 'insert' || type === 'delete') {
        collection.slice(newIndex).forEach((el, i) => {
          $(el).attr('data-craftercms-index', appendIndex(originalNewIndex, i));
          const pr = ElementRegistry.fromElement(el);
          pr && context.deregister(pr.id);
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
          $(el).attr('data-craftercms-index', appendIndex(index, i));
          const pr = ElementRegistry.fromElement(el);
          pr && context.deregister(pr.id);
          registerElement(el);
        });
      }
    };

    const getDropzoneElement = (modelId: string, fieldId: string, targetIndex: string | number): JQuery<Element> => {
      const dropZoneId = iceRegistry.exists({
        modelId,
        fieldId,
        index: fieldId.includes('.')
          ? removeLastPiece(targetIndex as string)
          : null
      });
      return $(ElementRegistry.fromICEId(dropZoneId).element);
    };

    const insertElement = ($element: JQuery<any>, $daddy: JQuery<any>, targetIndex: string | number): void => {
      const index = (typeof targetIndex === 'string') ? parseInt(popPiece(targetIndex)) : targetIndex;
      const $siblings = $daddy.find('> *');
      if ($siblings.length === index) {
        $daddy.append($element);
      } else {
        $element.insertBefore($siblings.eq(index));
      }
    };

    zip(
      contentController.models$(),
      contentController.contentTypes$()
    ).pipe(take(1)).subscribe(() =>
      document
        .querySelectorAll('[data-craftercms-model-id]')
        .forEach(registerElement)
    );

    const handler = (e: Event): void => {
      let record = ElementRegistry.fromElement(e.currentTarget as Element);
      if (notNullOrUndefined(record)) {
        if (['click', 'dblclick'].includes(e.type)) {
          e.preventDefault();
          e.stopPropagation();
        }
        context.onEvent(e, record.id);
      }
    };

    $(document)
      .on('mouseover', '[data-craftercms-model-id]', handler)
      .on('mouseout', '[data-craftercms-model-id]', handler)
      .on('dragstart', '[data-craftercms-model-id]', handler)
      .on('dragover', '[data-craftercms-model-id]', handler)
      .on('dragleave', '[data-craftercms-model-id]', handler)
      .on('drop', '[data-craftercms-model-id]', handler)
      .on('dragend', '[data-craftercms-model-id]', handler)
      .on('click', '[data-craftercms-model-id]', handler)
      .on('dblclick', '[data-craftercms-model-id]', handler);

    const sub = ContentController.operations.subscribe((op: Operation) => {
      switch (op.type) {
        case 'sort': {

          let [modelId, fieldId, index, newIndex] = op.args;
          // This works only for repeat groups
          let iceId = iceRegistry.exists({ modelId, fieldId, index });
          // This would work for both repeat groups and node-selectors. Just use this?
          if (iceId === -1) {
            const model = contentController.getCachedModel(modelId);
            // By this point - on the operations subscriber - the operation has already gone through.
            // Hence, need to use the "newIndex" to retrieve the model in question. The registration
            // hasn't been updated yet so still using the old index.
            iceId = iceRegistry.exists({ modelId: model[fieldId][newIndex], index });
          }

          const phyRecord = ElementRegistry.fromICEId(iceId);
          const $el = $(phyRecord.element);
          const $targetSibling = $el.parent().children().eq(newIndex);

          // Move...
          if (index < newIndex) {
            $el.insertAfter($targetSibling);
          } else {
            $el.insertBefore($targetSibling);
          }

          updateElementRegistrations(Array.from($el.parent().children()), 'sort', newIndex, index);
          break;

        }
        case 'move': {

          const [
            modelId/*: string*/,
            fieldId/*: string*/,
            index/*: number*/,
            targetModelId/*: string*/,
            targetFieldId/*: string*/,
            targetIndex
          ] = op.args;

          const currentDropZoneICEId = iceRegistry.exists({ modelId, fieldId, index: null });
          const currentDropZonePhyRecord = ElementRegistry.fromICEId(currentDropZoneICEId);

          const targetDropZoneICEId = iceRegistry.exists({
            modelId: targetModelId,
            fieldId: targetFieldId,
            index: null
          });
          const targetDropZonePhyRecord = ElementRegistry.fromICEId(targetDropZoneICEId);

          const moveTargetICEId = iceRegistry.exists({ modelId, fieldId, index });
          const moveTargetPhyRecord = ElementRegistry.fromICEId(moveTargetICEId);

          const $targetDropZone = $(targetDropZonePhyRecord.element);

          if (targetIndex === 0) {
            $targetDropZone.prepend(moveTargetPhyRecord.element);
          } else if ($targetDropZone.children().length === targetIndex) {
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

          [
            currentDropZonePhyRecord,
            targetDropZonePhyRecord
          ].forEach((record) => {
            let newIndex = record === currentDropZonePhyRecord ? index : targetIndex;
            $(record.element).find('> [data-craftercms-index]').each((i, elem) => {
              ElementRegistry.deregister(ElementRegistry.fromElement(elem).id);
              $(elem).attr('data-craftercms-model-id', record.modelId);
              $(elem).attr('data-craftercms-field-id', record.fieldId);
              $(elem).attr('data-craftercms-index', generateIndex(newIndex, i));

              registerElement(elem);
            });
          });

          break;

        }
        case DELETE_ITEM_OPERATION: {
          const [modelId, fieldId, index] = op.args;

          const iceId = iceRegistry.exists({ modelId, fieldId, index });
          const phyRecord = ElementRegistry.fromICEId(iceId);

          context.deregister(phyRecord.id);

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
          const { modelId, fieldId, targetIndex, contentType, instance, shared } = op.args;

          const $daddy = getDropzoneElement(modelId, fieldId, targetIndex);
          let $clone = $daddy.children(':first').clone();
          if ($clone.length) {
            const processFields = function (instance: ContentInstance, fields: ContentTypeField): void {
              Object.entries(fields).forEach(([id, field]) => {
                switch (field.type) {
                  case 'repeat':
                  case 'node-selector': {
                    throw new Error('Not implemented.');
                  }
                  default:
                    $clone.find(`[data-craftercms-field-id="${id}"]`).html(instance[id]);
                }
              });
            };
            processFields(instance, contentType.fields);
          } else {
            $clone = $(`<div  data-craftercms-model-id="${modelId}" data-craftercms-field-id="${fieldId}">${instance.craftercms.label}</div>`);
          }

          insertElement($clone, $daddy, targetIndex);

          updateElementRegistrations(Array.from($daddy.children()), 'insert', targetIndex);

          break;
        }
        case INSERT_INSTANCE_OPERATION: {
          const { modelId, fieldId, targetIndex, instance } = op.args;

          const $spinner = $(`
            <svg class="craftercms-placeholder-spinner" width=50 height=50 viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
              <circle class="path" fill="none" stroke-width=5 stroke-linecap="round" cx="25" cy="25" r="20"/>
            </svg>
          `);

          const $daddy = getDropzoneElement(modelId, fieldId, targetIndex);

          insertElement($spinner, $daddy, targetIndex);

          const id = Date.now();

          message$.pipe(
            filter((e: MessageEvent) => (e.data?.type === COMPONENT_INSTANCE_HTML_RESPONSE) && (e.data?.payload.id === id)),
            map(e => e.data),
            take(1)
          ).subscribe(function ({ payload }) {
            const $root = $('<div/>').html(payload.response);
            const $component = ($root.children().length > 1) ? $root : $($root.children()[0]);
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
          const updatedField: JQuery<any> = $(`[data-craftercms-model-id="${modelId}"][data-craftercms-field-id="${fieldId}"]`);
          const model = contentController.getCachedModel(modelId);
          const contentType = contentController.getCachedContentType(model.craftercms.contentType);
          const fieldType = ContentTypeHelper.getField(contentType, fieldId).type;

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
      // clickSubscription.unsubscribe();
    };

  }, []);

  useEffect(() => {

    if (context.editable !== persistence.editable) {

      persistence.editable && Object.values(persistence.editable).forEach(({ element }: any) => {
          $(element).attr('contenteditable', 'false').removeAttr('contenteditable')
        }
      );

      persistence.editable = context.editable;

      persistence.editable && Object.values(persistence.editable).forEach(({ element }: any) => {
        (persistence.editable === null) && (persistence.editable = []);
        $(element).attr('contenteditable', 'true');
      });

    }

    if (notNullOrUndefined(persistence.draggable)) {
      $(persistence.draggable)
        .attr('draggable', 'false')
        .removeAttr('draggable');
    }

    forEach(
      Object.entries(context.draggable),
      ([phyId, iceId]) => {
        if (iceId !== false) {
          const record = ElementRegistry.get(phyId);
          // Item deletion incurs in a brief moment where a record has been removed
          // but the context draggable table hasn't been cleaned up.
          if (record != null) {
            persistence.draggable = record.element;
            $(record.element).attr('draggable', 'true');
          }
        }
      }
    );

    // context$.next(
    //   pluckProps(
    //     context,
    //     'inEditMode',
    //     'status',
    //     'dragged',
    //     'editable',
    //     'draggable',
    //     'highlighted'
    //   )
    // );

  });

  return (<></>);
}

