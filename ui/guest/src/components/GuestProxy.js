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

import React from 'react';
import { useEffect, useRef } from 'react';
import { notNullOrUndefined, forEach, INSERT_COMPONENT_OPERATION, DELETE_ITEM_OPERATION } from '../util';
import { useGuestContext } from './GuestContext';
import { PhysicalRegistry } from '../classes/PhysicalRegistry';
import iceRegistry from '../classes/ICERegistry';
import $ from 'jquery/dist/jquery.slim';
import contentController, { ContentController } from '../classes/ContentController';
import { fromEvent, zip, interval } from 'rxjs';
import { switchMap, take, takeUntil, filter } from 'rxjs/operators';

export function GuestProxy(props) {

  const context = useGuestContext();
  const { current: persistence } = useRef({
    draggable: null,
    editable: null
  });

  useEffect(() => {

    const registerElement = (element) => {

      let
        modelId = element.getAttribute('data-craftercms-model-id'),
        fieldId = element.getAttribute('data-craftercms-field-id'),
        index = element.getAttribute('data-craftercms-index'),
        label = element.getAttribute('data-craftercms-label');

      if (notNullOrUndefined(index)) {
        index = parseInt(index, 10);
      }

      context.register({ element, modelId, fieldId, index, label });

    };

    zip(
      contentController.models$(),
      contentController.contentTypes$()
    ).pipe(take(1)).subscribe(() =>
      document
        .querySelectorAll('[data-craftercms-model-id]')
        .forEach(registerElement)
    );

    const handler = (e) => {
      let record = PhysicalRegistry.fromElement(e.currentTarget);
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

    const sub = ContentController.operations.subscribe((op) => {
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

          const phyRecord = PhysicalRegistry.fromICEId(iceId);
          const $el = $(phyRecord.element);
          const $targetSibling = $el.parent().children().eq(newIndex);

          // Move...
          if (index < newIndex) {
            $el.insertAfter($targetSibling);
          } else {
            $el.insertBefore($targetSibling);
          }

          // De register element
          // context.deregister(phyRecord.id);

          // Update attribute(s)
          // $el.attr('data-craftercms-index', newIndex);

          forEach(
            $el.parent().children(),
            (el, i) => {

              $(el).attr('data-craftercms-index', i);

              const pr = PhysicalRegistry.fromElement(el);

              context.deregister(pr.id);
              registerElement(el);

              if (
                (newIndex > index && i >= newIndex) ||
                (newIndex < index && i >= index)
              ) {
                console.log(
                  `(newIndex > index && i >= newIndex) ${(newIndex > index && i >= newIndex)}`,
                  `(newIndex < index && i >= index) ${(newIndex < index && i >= index)}`
                );
                return 'break';
              }

            });

          // Re-register with updates
          // registerElement(phyRecord.element);

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
          const currentDropZonePhyRecord = PhysicalRegistry.fromICEId(currentDropZoneICEId);

          const targetDropZoneICEId = iceRegistry.exists({
            modelId: targetModelId,
            fieldId: targetFieldId,
            index: null
          });
          const targetDropZonePhyRecord = PhysicalRegistry.fromICEId(targetDropZoneICEId);

          const moveTargetICEId = iceRegistry.exists({ modelId, fieldId, index });
          const moveTargetPhyRecord = PhysicalRegistry.fromICEId(moveTargetICEId);

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
            const targetIndexOccupantPhyRecord = PhysicalRegistry.fromICEId(targetIndexOccupantICEId);

            $(moveTargetPhyRecord.element).insertBefore(targetIndexOccupantPhyRecord.element);

          }

          [
            currentDropZonePhyRecord,
            targetDropZonePhyRecord
          ].forEach((record) => {
            $(record.element).find('> [data-craftercms-index]').each((i, elem) => {
              PhysicalRegistry.deregister(PhysicalRegistry.fromElement(elem).id);

              $(elem).attr('data-craftercms-model-id', record.modelId);
              $(elem).attr('data-craftercms-field-id', record.fieldId);
              $(elem).attr('data-craftercms-index', i);

              registerElement(elem);
            });
          });

          break;

        }
        case DELETE_ITEM_OPERATION: {
          const [modelId, fieldId, index] = op.args;

          const iceId = iceRegistry.exists({ modelId, fieldId, index });
          const phyRecord = PhysicalRegistry.fromICEId(iceId);

          context.deregister(phyRecord.id);

          // Immediate removal of the element causes the dragend event not
          // to fire leaving the state corrupt - in a state of "SORTING".
          setTimeout(() => {
            const $daddy = $(phyRecord.element).parent();
            $(phyRecord.element).remove();
            forEach(
              $daddy.children(),
              (el, i) => {

                $(el).attr('data-craftercms-index', i);

                const pr = PhysicalRegistry.fromElement(el);

                context.deregister(pr.id);
                registerElement(el);

              }
            );
          });

          break;
        }
        case INSERT_COMPONENT_OPERATION: {
          const { modelId, fieldId, targetIndex, contentType, instance, shared } = op.args;

          const $clone = $(`[data-craftercms-field-id="${fieldId}"][data-craftercms-index]:first`).clone();

          const processFields = function (instance, fields) {
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

          const $daddy = $(`[data-craftercms-model-id="${modelId}"][data-craftercms-field-id="${fieldId}"]:not([data-craftercms-index])`);

          const $siblings = $daddy.find('> *');

          if ($siblings.length === targetIndex) {
            $daddy.append($clone);
          } else {
            $clone.insertBefore($siblings.eq(targetIndex));
          }

          forEach(
            $daddy.children(),
            (el, i) => {

              $(el).attr('data-craftercms-index', i);

              const pr = PhysicalRegistry.fromElement(el);

              pr && context.deregister(pr.id);
              registerElement(el);

            }
          );

          break;
        }
      }
    });

    return () => {
      sub.unsubscribe();
      // clickSubscription.unsubscribe();
    };

  }, []);

  useEffect(() => {

    if (context.editable !== persistence.editable) {

      persistence.editable && Object.values(persistence.editable).forEach(({ element }) =>
        $(element).attr('contenteditable', false).removeAttr('contenteditable')
      );

      persistence.editable = context.editable;

      persistence.editable && Object.values(persistence.editable).forEach(({ element }) => {
        (persistence.editable === null) && (persistence.editable = []);
        $(element).attr('contenteditable', true);
      });

    }

    if (notNullOrUndefined(persistence.draggable)) {
      $(persistence.draggable)
        .attr('draggable', false)
        .removeAttr('draggable');
    }

    forEach(
      Object.entries(context.draggable),
      ([phyId, iceId]) => {
        if (iceId !== false) {
          const record = PhysicalRegistry.get(phyId);
          // Item deletion incurs in a brief moment where a record has been removed
          // but the context draggable table hasn't been cleaned up.
          if (record != null) {
            persistence.draggable = record.element;
            $(record.element).attr('draggable', true);
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

