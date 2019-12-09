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

import React, { useEffect, useRef, useState } from 'react';
import {
  ASSET_DRAG_ENDED,
  ASSET_DRAG_STARTED,
  CLEAR_SELECTED_ZONES,
  COMPONENT_DRAG_STARTED,
  EDIT_MODE_CHANGED,
  EditingStatus,
  GUEST_CHECK_IN,
  HOST_CHECK_IN,
  ICE_ZONE_SELECTED,
  INSTANCE_DRAG_BEGUN,
  TRASHED,
  not,
  isNullOrUndefined,
  notNullOrUndefined,
  pluckProps, COMPONENT_DRAG_ENDED, INSTANCE_DRAG_ENDED
} from '../util';
import { zip, Subject } from 'rxjs';
import { debounceTime, delay, filter, map, take, tap, throttleTime } from 'rxjs/operators';
import iceRegistry from '../classes/ICERegistry';
import contentController from '../classes/ContentController';
import { ElementRegistry } from '../classes/ElementRegistry';
import $ from 'jquery/dist/jquery';
import { GuestContext } from './GuestContext';
import CrafterCMSPortal from './CrafterCMSPortal';
import { ZoneMarker } from './ZoneMarker';
import { DropMarker } from './DropMarker';
import { appendStyleSheet } from '../styles';
import { fromTopic, message$, post } from '../communicator';

// TODO: Temp. To be removed.
document.domain = 'authoring.sample.com';

// TODO:
// - add "modePreview" and bypass all
export function Guest(props) {

  // TODO: support path driven Guest.
  // TODO: consider supporting developer to provide the data source (promise or observable)
  const { children, modelId, path, isAuthoring = true, scrollElement = 'html, body' } = props;
  const { current: persistence } = useRef({
    contentReady: false,
    dragLeaveTimeout: null,
    mouseOverTimeout: null
  });

  const [, notify] = useState({});
  const stateRef = useRef({
    dragContext: null,
    common: {

      ICE_GUEST_INIT: true,

      status: EditingStatus.LISTENING,
      inEditMode: true,

      players: [],
      siblings: [],
      containers: [],

      dragged: {},
      editable: {},
      draggable: {},
      highlighted: {},

      register,
      deregister,
      onEvent

    }
  });

  const setState = (nextState) => {
    stateRef.current = nextState;
    notify({});
  };

  const fn = {

    onEditModeChanged(inEditMode) {

      const
        status = inEditMode
          ? EditingStatus.LISTENING
          : EditingStatus.OFF;

      if (inEditMode) {
        setState({
          ...stateRef.current,
          common: {
            ...stateRef.current.common,
            status,
            inEditMode
          }
        });
      } else {
        setState({
          ...stateRef.current,
          common: {
            ...stateRef.current.common,
            status,
            inEditMode
          }
        });
      }

    },

    initializeSubjects() {

      const
        dragover$ = new Subject(),
        scrolling$ = new Subject();

      persistence.dragover$ = dragover$;
      persistence.scrolling$ = scrolling$;
      persistence.onScroll = () => scrolling$.next(true);

      dragover$
        .pipe(throttleTime(100))
        .subscribe((value) => {
          const { e, record } = value;
          fn.onDragOver(e, record);
        });

      scrolling$
        .pipe(
          tap(() =>
            stateRef?.current?.dragContext?.inZone &&
            fn.onScroll()
          ),
          filter(is => is),
          debounceTime(200),
          delay(50)
        )
        .subscribe(
          () => {
            scrolling$.next(false);
            fn.onScrollStopped();
          }
        );

      $(document).bind('scroll', persistence.onScroll);


    },

    destroySubjects() {

      persistence.dragover$.complete();
      persistence.dragover$.unsubscribe();
      persistence.dragover$ = null;

      persistence.scrolling$.complete();
      persistence.scrolling$.unsubscribe();
      persistence.scrolling$ = null;

      $(document).unbind('scroll', persistence.onScroll);
      persistence.onScroll = null;

    },

    /*onClick*/
    click(e, record) {
      if (stateRef.current.common.status === EditingStatus.LISTENING) {

        const highlight = ElementRegistry.getHoverData(record.id);

        post(ICE_ZONE_SELECTED, pluckProps(record, 'modelId', 'index', 'fieldId'));

        setState({
          ...stateRef.current,
          common: {
            ...stateRef.current.common,
            status: EditingStatus.EDITING_COMPONENT,
            draggable: {},
            highlighted: { [record.id]: highlight }
          }
        });

      }
    },

    dblclick(e, record) {
      if (stateRef.current.common.status === EditingStatus.LISTENING) {

        setState({
          ...stateRef.current,
          common: {
            ...stateRef.current.common,
            status: EditingStatus.EDITING_COMPONENT_INLINE,
            editable: {
              [record.id]: record
            }
          }
        });

      }
    },

    /*onMouseOver*/
    mouseover(e, record) {
      if (stateRef.current.common.status === EditingStatus.LISTENING) {
        clearTimeout(persistence.mouseOverTimeout);
        e.stopPropagation();

        let
          highlight = ElementRegistry.getHoverData(record.id),
          draggable = ElementRegistry.getDraggable(record.id);

        setState({
          ...stateRef.current,
          common: {
            ...stateRef.current.common,
            draggable: { [record.id]: draggable },
            highlighted: { [record.id]: highlight }
          }
        });

      }
    },

    /*onMouseOut*/
    mouseout(e) {
      if (stateRef.current.common.status === EditingStatus.LISTENING) {
        e.stopPropagation();
        clearTimeout(persistence.mouseOverTimeout);
        persistence.mouseOverTimeout = setTimeout(() => {
          clearTimeout(persistence.mouseOverTimeout);
          fn.onPermMouseOut();
        }, 100);
      }
    },

    /*onDragStart*/
    dragstart(e, physicalRecord) {

      e.stopPropagation();
      (e.dataTransfer || e.originalEvent.dataTransfer).setData('text/plain', null);

      // onMouseOver pre-populates the draggable record
      const iceId = stateRef.current.common.draggable[physicalRecord.id];
      if (isNullOrUndefined(iceId)) {
        throw new Error('No ice id found for this drag instance.');
      } else if (not(iceId)) {
        // Items that browser make draggable by default (images, etc)
        return;
      }

      post({ type: INSTANCE_DRAG_BEGUN });

      let players = [];
      let siblings = [];
      let containers = [];
      let dropZones = [];

      const receptacles = iceRegistry.getRecordReceptacles(iceId);
      const validatedReceptacles = receptacles.filter((id) => {
        // TODO: min/max count validations
        return true;
      });

      validatedReceptacles.forEach((id) => {

        const dropZone = ElementRegistry.compileDropZone(id);
        dropZone.origin = dropZone.children.includes(physicalRecord.element);
        dropZones.push(dropZone);

        siblings = [...siblings, ...dropZone.children];
        players = [...players, ...dropZone.children, dropZone.element];
        containers.push(dropZone.element);

      });

      const highlighted = dropZones.reduce((object, { physicalRecordId: id }) => {
        object[id] = ElementRegistry.getHoverData(id);
        return object;
      }, {});

      fn.initializeSubjects();

      setState({
        dragContext: {
          players,
          siblings,
          dropZones,
          containers,
          inZone: false,
          targetIndex: null,
          dragged: iceRegistry.recordOf(iceId)
        },
        common: {
          ...stateRef.current.common,
          status: EditingStatus.SORTING_COMPONENT,
          highlighted,
          register,
          deregister,
          onEvent
        }
      });

    },

    onComponentDragStarted(contentType) {

      let players = [];
      let siblings = [];
      let containers = [];
      let dropZones = [];

      const receptacles = iceRegistry.getContentTypeReceptacles(contentType);

      if (receptacles.length === 0) {
        // TODO: If there are no receptacles, the component should it even be listed as an option (?)
        return;
      }

      const firstReceptaclePhyRecord = ElementRegistry.fromICEId(receptacles[0].id);
      // Scroll the doc to the closest drop zone
      // TODO: Do this relative to the scroll position. Don't move if things are already in viewport. Be smarter.
      $(scrollElement).animate({
        scrollTop: $(firstReceptaclePhyRecord.element).offset().top - 100
      }, 300);

      const validatedReceptacles = receptacles.filter((id) => {
        // TODO: min/max count validations
        return true;
      });

      validatedReceptacles.forEach(({ id }) => {

        const dropZone = ElementRegistry.compileDropZone(id);
        dropZone.origin = null;
        dropZones.push(dropZone);

        siblings = siblings.concat(dropZone.children);
        players = players.concat(dropZone.children).concat(dropZone.element);
        containers.push(dropZone.element);

      });

      const highlighted = dropZones.reduce((object, { physicalRecordId: id }) => {
        object[id] = ElementRegistry.getHoverData(id);
        return object;
      }, {});

      fn.initializeSubjects();

      setState({
        dragContext: {
          players,
          siblings,
          dropZones,
          containers,
          contentType,
          inZone: false,
          dragged: null,
          targetIndex: null,
        },
        common: {
          ...stateRef.current.common,
          status: EditingStatus.PLACING_NEW_COMPONENT,
          highlighted,
          register,
          deregister,
          onEvent
        }
      });

    },

    onHostComponentDragEnd() {
      fn.dragOk() && fn.onDragEnd();
    },

    dragover(e, record) {
      let element = record.element;
      if (
        fn.dragOk() &&
        stateRef.current.dragContext.players.includes(element)
      ) {
        e.preventDefault();
        e.stopPropagation();
        persistence.dragover$.next({ e, record });
      }
    },

    onDragOver(e, physicalRecord) {
      const dragContext = stateRef.current.dragContext;
      if (persistence.scrolling$.value) {
        return null;
      }

      let element = physicalRecord.element;
      if (dragContext.players.includes(element)) {
        clearTimeout(persistence.dragLeaveTimeout);

        let
          { next, prev } =
            // No point finding siblings for the drop zone element
            stateRef.current.dragContext.containers.includes(element)
              ? {}
              : ElementRegistry.getSiblingRects(physicalRecord.id);

        setState({
          dragContext: {
            ...stateRef.current.dragContext,
            next,
            prev,
            inZone: true,
            over: physicalRecord,
            coordinates: { x: e.clientX, y: e.clientY },
            dropZone: dragContext.dropZones.find((dz) =>
              dz.element === element || dz.children.includes(element)
            )
          },
          common: {
            ...stateRef.current.common,
            register,
            deregister,
            onEvent
          }
        });

      }

    },

    drop(e) {
      if (fn.dragOk()) {

        e.preventDefault();
        e.stopPropagation();

        fn.onDrop();

      }
    },

    onDrop(e) {

      const state = stateRef.current;
      const status = state.common.status;
      const dragContext = state.dragContext;

      // Asset replacement
      switch (status) {
        case EditingStatus.PLACING_DETACHED_ASSET: {

          const { dropZone } = dragContext;
          if (!dropZone || !dragContext.inZone) {
            return;
          }

          const record = iceRegistry.recordOf(dropZone.iceId);

          contentController.updateField(
            record.modelId,
            record.fieldId,
            dragContext.dragged.url
          );

          break;
        }
        case EditingStatus.SORTING_COMPONENT: {
          if (notNullOrUndefined(dragContext.targetIndex)) {
            fn.moveComponent();
          }
          break;
        }
        case EditingStatus.PLACING_NEW_COMPONENT: {
          if (notNullOrUndefined(dragContext.targetIndex)) {
            fn.insertComponent();
          }
          break;
        }
        case EditingStatus.PLACING_DETACHED_COMPONENT: {
          // TODO: Insert detached component
          break;
        }
      }

    },

    moveComponent() {

      let
        {
          dragged,
          dropZone,
          dropZones,
          targetIndex
        } = stateRef.current.dragContext,
        record = dragged,
        draggedElementIndex = record.index,
        originDropZone = dropZones.find((dropZone) => dropZone.origin),
        currentDZ = dropZone.element;

      // Move a component

      const containerRecord = iceRegistry.recordOf(originDropZone.iceId);

      if (currentDZ === originDropZone.element) {

        // If moving the item down the array of items, need
        // to account all the - originally - subsequent items
        // moving up.
        if (draggedElementIndex < targetIndex) {
          // Hence the final target index in reality is
          // the drop marker's index minus 1
          --targetIndex;
        }

        if (record.index !== targetIndex) {
          setTimeout(() => {
            contentController.sortItem(
              containerRecord.modelId,
              containerRecord.fieldId,
              draggedElementIndex,
              targetIndex
            );
          });
        }

      } else {

        const rec = iceRegistry.recordOf(dropZone.iceId);

        // Chrome didn't trigger the dragend event
        // without the set timeout.
        setTimeout(() => {
          contentController.moveItem(
            containerRecord.modelId,
            containerRecord.fieldId,
            draggedElementIndex,
            rec.modelId,
            rec.fieldId,
            targetIndex
          );
        }, 20);

      }

    },

    insertComponent() {

      const { targetIndex, contentType, dropZone } = stateRef.current.dragContext;
      const record = iceRegistry.recordOf(dropZone.iceId);

      setTimeout(() => {
        contentController.insertComponent(
          record.modelId,
          record.fieldId,
          targetIndex,
          contentType
        );
      });

    },

    // onDragEnd doesn't execute when dropping from Host
    // consider behaviour when running Host Guest-side
    /*onDragEnd*/
    dragend(e) {
      if (fn.dragOk()) {
        e.stopPropagation();
        post({ type: INSTANCE_DRAG_ENDED });
        fn.onDragEnd();
      }
    },

    onDragEnd() {

      fn.destroySubjects();

      setState({
        dragContext: null,
        common: {
          ...stateRef.current.common,
          status: EditingStatus.LISTENING,
          highlighted: {},
          register,
          deregister,
          onEvent
        }
      });

    },

    dragleave() {
      if (fn.dragOk()) {
        clearTimeout(persistence.dragLeaveTimeout);
        persistence.dragLeaveTimeout = setTimeout(() => {
          fn.onDragLeave();
        }, 100);
      }
    },

    onDragLeave() {
      setState({
        dragContext: {
          ...stateRef.current.dragContext,
          over: null,
          inZone: false,
          targetIndex: null
        },
        common: {
          ...stateRef.current.common,
          register,
          deregister,
          onEvent
        }
      });
    },

    onPermMouseOut() {
      setState({
        ...stateRef.current,
        common: {
          ...stateRef.current.common,
          highlighted: {},
          draggable: {},
          register,
          deregister,
          onEvent
        }
      });
    },

    onScroll() {
      setState({
        dragContext: {
          ...stateRef.current.dragContext,
          over: null,
          inZone: false,
          targetIndex: null,
          scrolling: true
        },
        common: {
          ...stateRef.current.common,
          register,
          deregister,
          onEvent
        }
      });
    },

    onScrollStopped() {
      const dragContext = stateRef.current.dragContext;
      setState({
        dragContext: {
          ...stateRef.current.dragContext,
          scrolling: false,
          dropZones: dragContext.dropZones.map((dropZone) => ({
            ...dropZone,
            rect: dropZone.element.getBoundingClientRect(),
            childrenRects: dropZone.children.map((child) => child.getBoundingClientRect())
          }))
        },
        common: {
          ...stateRef.current.common,
          register,
          deregister,
          onEvent
        }
      });
    },

    onAssetDragStarted(asset) {

      let
        players = [],
        siblings = [],
        containers = [],
        dropZones = [];

      const receptacles = iceRegistry.getMediaReceptacles();
      const validReceptacles = receptacles.filter((id) => {

        const
          record = iceRegistry.getReferentialEntries(id),
          validations = record.field.validations;

        if (isNullOrUndefined(validations)) {
          return false;
        } else if (notNullOrUndefined(validations.mimeTypes)) {
          const values = validations.mimeTypes.value;
          return (
            (
              values.includes('image/*') &&
              asset.type.includes('image/')
            ) || (
              values.includes(asset.type)
            )
          );
        }

      });

      validReceptacles
        .forEach((id) => {

          const dropZone = ElementRegistry.compileDropZone(id);
          dropZone.origin = false;
          dropZones.push(dropZone);

          siblings = [...siblings, ...dropZone.children];
          players = [...players, ...dropZone.children, dropZone.element];
          containers.push(dropZone.element);

        });

      const highlighted = dropZones
        .reduce(
          (object, { physicalRecordId: id }) => {
            object[id] = ElementRegistry.getHoverData(id);
            return object;
          },
          {}
        );

      fn.initializeSubjects();

      setState({
        dragContext: {
          players,
          siblings,
          dropZones,
          containers,
          inZone: false,
          targetIndex: null,
          dragged: asset
        },
        common: {
          ...stateRef.current.common,
          status: EditingStatus.PLACING_DETACHED_ASSET,
          highlighted,
          register,
          deregister,
          onEvent
        }
      });

    },

    onAssetDragEnded() {
      fn.onDragEnd();
    },

    onSetDropPosition(payload) {
      setState({
        ...stateRef.current,
        dragContext: {
          ...stateRef.current.dragContext,
          targetIndex: payload.targetIndex
        },
        common: {
          ...stateRef.current.common,
          register,
          deregister,
          onEvent
        }
      });
    },

    // onDrop doesn't execute when trashing on host side
    // Consider behaviour when running Host Guest-side
    onTrashDrop() {
      const { dragContext } = stateRef.current;
      const { dropZones } = dragContext;
      const { id } = dragContext.dragged;
      let { modelId, fieldId, index } = iceRegistry.recordOf(
        iceRegistry.isRepeatGroup(id)
          ? id
          : dropZones.find(d => d.origin).iceId
      );
      contentController.deleteItem(modelId, fieldId, index);
    },

    dragOk() {
      return [
        EditingStatus.SORTING_COMPONENT,
        EditingStatus.PLACING_NEW_COMPONENT,
        EditingStatus.PLACING_DETACHED_ASSET,
        EditingStatus.PLACING_DETACHED_COMPONENT
      ].includes(stateRef.current.common.status);
    }

  };

  function register(payload) {
    return ElementRegistry.register(payload);
  }

  function deregister(id) {
    return ElementRegistry.deregister(id);
  }

  function onEvent(event, dispatcher) {
    if (persistence.contentReady && stateRef.current.common.inEditMode) {

      const { type } = event;

      const handler = fn[type];
      if (isNullOrUndefined(handler)) {
        throw new Error(`No handler implemented for ${type}`);
      }

      const record = ElementRegistry.get(dispatcher);
      if (isNullOrUndefined(record)) {
        throw new Error('No record found for dispatcher element');
      }

      handler(event, record);

    } else {
      return true;
    }
  }

  // 1. Subscribes to accommodation messages and routes them.
  // 2. Appends the Guest stylesheet
  useEffect(() => {

    const sub = message$.pipe(
      filter((e) => (e.data?.type) != null),
      map(e => e.data)
    ).subscribe(function ({ type, payload }) {
      switch (type) {
        case EDIT_MODE_CHANGED:
          return fn.onEditModeChanged(payload.inEditMode);
        case ASSET_DRAG_STARTED:
          return fn.onAssetDragStarted(payload);
        case ASSET_DRAG_ENDED:
          return fn.onAssetDragEnded(payload);
        case COMPONENT_DRAG_STARTED:
          return fn.onComponentDragStarted(payload);
        case COMPONENT_DRAG_ENDED:
          return fn.onHostComponentDragEnd();
        case TRASHED:
          return fn.onTrashDrop(payload);
        case CLEAR_SELECTED_ZONES:
          setState({
            ...stateRef.current,
            common: {
              ...stateRef.current.common,
              status: EditingStatus.LISTENING,
              highlighted: {}
            }
          });
          break;
      }
    });

    const stylesheet = appendStyleSheet();

    return () => {
      stylesheet.detach();
      sub.unsubscribe();
    };

  }, []);

  // Registers zones
  useEffect(() => {

    const iceId = iceRegistry.register({ modelId });

    contentController
      .models$(modelId)
      .pipe(take(1))
      .subscribe((models) => {

        const url = window.location.href;
        const origin = window.location.origin;

        let timeout;

        const hostDetectionSubscription = fromTopic(HOST_CHECK_IN).pipe(take(1)).subscribe(() => {
          clearTimeout(timeout);
        });

        post(GUEST_CHECK_IN, { url, origin, models, modelId, path });

        timeout = setTimeout(() => {
          hostDetectionSubscription.unsubscribe();
          console.log('No Host was detected. In-Context Editing is off.');
        }, 700);

      });

    zip(
      contentController.models$(modelId),
      contentController.contentTypes$()
    ).pipe(
      take(1)
    ).subscribe(() => {
      persistence.contentReady = true;
    });

    return () => {
      iceRegistry.deregister(iceId);
    };

  }, [modelId]);

  return (
    <GuestContext.Provider value={stateRef.current.common}>
      {children}
      {
        (stateRef.current.common.status !== EditingStatus.OFF) &&
        <CrafterCMSPortal>
          {
            Object.values(stateRef.current.common.highlighted).map((highlight) =>
              <ZoneMarker key={highlight.id} {...highlight} />
            )
          }
          {
            [
              EditingStatus.SORTING_COMPONENT,
              EditingStatus.PLACING_NEW_COMPONENT,
              EditingStatus.PLACING_DETACHED_COMPONENT
            ].includes(stateRef.current.common.status) &&
            stateRef.current.dragContext.inZone &&
            <DropMarker
              onDropPosition={fn.onSetDropPosition}
              dropZone={stateRef.current.dragContext.dropZone}
              over={stateRef.current.dragContext.over}
              prev={stateRef.current.dragContext.prev}
              next={stateRef.current.dragContext.next}
              coordinates={stateRef.current.dragContext.coordinates}
            />
          }
        </CrafterCMSPortal>
      }
    </GuestContext.Provider>
  );

}
