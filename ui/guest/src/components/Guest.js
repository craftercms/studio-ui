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
  CLEAR_HIGHLIGHTED_RECEPTACLES,
  CLEAR_SELECTED_ZONES,
  COMPONENT_DRAG_ENDED,
  COMPONENT_DRAG_STARTED,
  COMPONENT_INSTANCE_DRAG_ENDED,
  COMPONENT_INSTANCE_DRAG_STARTED,
  CONTENT_TYPE_RECEPTACLES_REQUEST,
  CONTENT_TYPE_RECEPTACLES_RESPONSE,
  DESKTOP_ASSET_DROP,
  DESKTOP_ASSET_UPLOAD_COMPLETE,
  EDIT_MODE_CHANGED,
  EditingStatus,
  forEach,
  GUEST_CHECK_IN,
  GUEST_CHECK_OUT,
  HOST_CHECK_IN,
  ICE_ZONE_SELECTED,
  INSTANCE_DRAG_BEGUN,
  INSTANCE_DRAG_ENDED,
  isElementInView,
  isNullOrUndefined,
  NAVIGATION_REQUEST,
  not,
  notNullOrUndefined,
  pluckProps,
  RELOAD_REQUEST,
  SCROLL_TO_RECEPTACLE,
  TRASHED
} from '../util';
import { fromEvent, interval, Subject, zip } from 'rxjs';
import { debounceTime, delay, filter, map, share, switchMap, take, takeUntil, tap, throttleTime } from 'rxjs/operators';
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
import Cookies from 'js-cookie';
// TinyMCE makes the build quite large. Temporarily, importing this externally via
// the site's ftl. Need to evaluate whether to include the core as part of guest build or not
// import tinymce from 'tinymce';

const clearAndListen$ = new Subject();
const escape$ = fromEvent(document, 'keydown').pipe(
  filter(e => e.keyCode === 27)
);

// TODO:
// - add "modePreview" and bypass all
export function Guest(props) {

  // TODO: support path driven Guest.
  // TODO: consider supporting developer to provide the data source (promise/observable?)
  const {
    path,
    styles,
    modelId,
    children,
    documentDomain,
    isAuthoring = true,
    scrollElement = 'html, body',
    editModeOnIndicatorClass = 'craftercms-ice-on'
  } = props;
  const { current: persistence } = useRef({
    contentReady: false,
    mouseOverTimeout: null
  });

  const [, forceUpdate] = useState({});
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
    forceUpdate({});
  };

  const fn = {

    onEditModeChanged(inEditMode) {

      const status = inEditMode ? EditingStatus.LISTENING : EditingStatus.OFF;

      $('html')[inEditMode ? 'addClass' : 'removeClass'](editModeOnIndicatorClass);

      setState({
        ...stateRef.current,
        common: {
          ...stateRef.current.common,
          status,
          inEditMode
        }
      });

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

        const { field } = iceRegistry.getReferentialEntries(record.iceIds[0]);
        const type = field?.type;

        switch (type) {
          case 'html':
          case 'text':
          case 'textarea': {

            const plugins = ['paste'];

            (type === 'html') && plugins.push('quickbars');

            // eslint-disable-next-line no-undef
            if (!tinymce) {
              return alert('Looks like tinymce is not added on the page. Please add tinymce on to the page to enable editing.');
            }

            const elementDisplay = $(record.element).css('display');
            if (elementDisplay === 'inline') {
              $(record.element).css('display', 'inline-block');
            }

            // eslint-disable-next-line no-undef
            tinymce.init({
              mode: 'none',
              target: record.element,
              plugins,
              paste_as_text: true,
              toolbar: false,
              menubar: false,
              inline: true,
              base_url: '/studio/static-assets/modules/editors/tinymce/v5/tinymce',
              suffix: '.min',
              setup(editor) {

                editor.on('init', function () {

                  let changed = false;
                  let originalContent = getContent();

                  editor.focus();
                  editor.selection.select(editor.getBody(), true);
                  editor.selection.collapse(false);

                  // In some cases the 'blur' event is getting caught somewhere along
                  // the way. Focusout seems to be more reliable.
                  editor.on('focusout', (e) => {
                    e.stopImmediatePropagation();
                    save();
                    cancel();
                  });

                  editor.once('change', () => {
                    changed = true;
                  });

                  editor.on('keydown', (e) => {
                    if (e.keyCode === 27) {
                      e.stopImmediatePropagation();
                      editor.setContent(originalContent);
                      cancel();
                    }
                  });

                  function save() {

                    const content = getContent();

                    if (changed) {
                      contentController.updateField(
                        record.modelId,
                        field.id,
                        record.index,
                        content
                      );
                    }

                  }

                  function getContent() {
                    return (type === 'html')
                      ? editor.getContent()
                      : editor.getContent({ format: 'text' });
                  }

                  function destroyEditor() {
                    editor.destroy(false);
                  }

                  function cancel() {

                    setState({
                      ...stateRef.current,
                      common: {
                        ...stateRef.current.common,
                        status: EditingStatus.LISTENING,
                        highlighted: {}
                      }
                    });

                    const content = getContent();
                    destroyEditor();

                    // In case the user did some text bolding or other formatting which won't
                    // be honoured on plain text, revert the content to the edited plain text
                    // version of the input.
                    (changed) && (type === 'text') && $(record.element).html(content);

                    if (elementDisplay === 'inline') {
                      $(record.element).css('display', '');
                    }

                  }

                });

              }
            });

            setState({
              ...stateRef.current,
              common: {
                ...stateRef.current.common,
                status: EditingStatus.EDITING_COMPONENT_INLINE,
                draggable: {},
                highlighted: {}
              }
            });

            break;
          }
          default: {

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

            escape$.pipe(takeUntil(clearAndListen$)).subscribe(() => {
              post(CLEAR_SELECTED_ZONES);
              fn.clearAndListen();
            });

            break;
          }
        }

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

      const highlighted = getHighlighted(dropZones);

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

    onHostInstanceDragStarted(instance) {
      let players = [];
      let siblings = [];
      let containers = [];
      let dropZones = [];

      const receptacles = iceRegistry.getContentTypeReceptacles(instance.craftercms.contentType);

      if (receptacles.length === 0) {
        // TODO: If there are no receptacles, the component should it even be listed as an option (?)
        return;
      }

      const validatedReceptacles = receptacles.filter((id) => {
        // TODO: min/max count validations
        return true;
      });

      //scrollToReceptacle(validatedReceptacles);

      validatedReceptacles.forEach(({ id }) => {

        const dropZone = ElementRegistry.compileDropZone(id);
        dropZone.origin = null;
        dropZones.push(dropZone);

        siblings = siblings.concat(dropZone.children);
        players = players.concat(dropZone.children).concat(dropZone.element);
        containers.push(dropZone.element);

      });

      const highlighted = getHighlighted(dropZones);

      fn.initializeSubjects();

      setState({
        dragContext: {
          players,
          siblings,
          dropZones,
          containers,
          instance,
          inZone: false,
          dragged: null,
          targetIndex: null,
        },
        common: {
          ...stateRef.current.common,
          status: EditingStatus.PLACING_DETACHED_COMPONENT,
          highlighted,
          register,
          deregister,
          onEvent
        }
      });

    },

    onHostInstanceDragEnd() {
      fn.dragOk() && fn.onDragEnd();
    },

    onHostComponentDragStarted(contentType) {

      let players = [];
      let siblings = [];
      let containers = [];
      let dropZones = [];

      const receptacles = iceRegistry.getContentTypeReceptacles(contentType);

      if (receptacles.length === 0) {
        // TODO: If there are no receptacles, the component should it even be listed as an option (?)
        return;
      }

      const validatedReceptacles = receptacles.filter((id) => {
        // TODO: min/max count validations
        return true;
      });

      // scrollToReceptacle(validatedReceptacles);

      validatedReceptacles.forEach(({ id }) => {

        const dropZone = ElementRegistry.compileDropZone(id);
        dropZone.origin = null;
        dropZones.push(dropZone);

        siblings = siblings.concat(dropZone.children);
        players = players.concat(dropZone.children).concat(dropZone.element);
        containers.push(dropZone.element);

      });

      const highlighted = getHighlighted(dropZones);

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

    drop(e, record) {
      if (fn.dragOk()) {
        e.preventDefault();
        e.stopPropagation();
        fn.onDrop(e, record);
      }
    },

    onDrop(e, record) {

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
            record.index,
            dragContext.dragged.path
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
          if (notNullOrUndefined(dragContext.targetIndex)) {
            fn.insertInstance();
          }
          break;
        }
        case EditingStatus.UPLOAD_ASSET_FROM_DESKTOP: {
          if (stateRef.current.dragContext.inZone) {
            const file = e.originalEvent.dataTransfer.files[0];
            const reader = new FileReader();
            reader.onload = (function (aImg) {
              message$.pipe(
                filter((e) =>
                  (e.data?.type === DESKTOP_ASSET_UPLOAD_COMPLETE) &&
                  (e.data.payload.id === file.name)
                ),
                map(e => e.data),
                take(1)
              ).subscribe(function ({ payload }) {
                contentController.updateField(
                  record.modelId,
                  record.fieldId[0],
                  record.index,
                  payload.path
                )
              });

              return function (event) {
                post(DESKTOP_ASSET_DROP, {
                  dataUrl: event.target.result,
                  name: file.name,
                  type: file.type,
                  modelId: record.modelId
                });
                aImg.src = event.target.result;
              };
            })(record.element);
            fn.onDragEnd();
            reader.readAsDataURL(file);
          }
          break;
        }
        default:
          break;
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

      if (typeof draggedElementIndex === 'string') {
        // If the index is a string, it's a nested index with dot notation.
        // At this point, we only care for the last index piece, which is
        // the index of this item in the collection that's being manipulated.
        draggedElementIndex = parseInt(draggedElementIndex.substr(draggedElementIndex.lastIndexOf('.') + 1), 10);
      }

      const containerRecord = iceRegistry.recordOf(originDropZone.iceId);

      // Determine whether the component is to be sorted or moved.
      if (currentDZ === originDropZone.element) {
        // Same drop zone: Sort identified

        // If moving the item down the array of items, need to account
        // for all the originally subsequent items shifting up.
        if (draggedElementIndex < targetIndex) {
          // Hence the final target index in reality is
          // the drop marker's index minus 1
          --targetIndex;
        }

        if (draggedElementIndex !== targetIndex) {
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
        // Different drop zone: Move identified

        const rec = iceRegistry.recordOf(dropZone.iceId);

        // Chrome didn't trigger the dragend event
        // without the set timeout.
        setTimeout(() => {
          contentController.moveItem(
            containerRecord.modelId,
            containerRecord.fieldId,
            containerRecord.fieldId.includes('.')
              ? `${containerRecord.index}.${draggedElementIndex}`
              : draggedElementIndex,
            rec.modelId,
            rec.fieldId,
            rec.fieldId.includes('.') ? `${rec.index}.${targetIndex}` : targetIndex
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
          record.fieldId.includes('.') ? `${record.index}.${targetIndex}` : targetIndex,
          contentType
        );
      });

    },

    insertInstance() {
      const { targetIndex, instance, dropZone } = stateRef.current.dragContext;
      const record = iceRegistry.recordOf(dropZone.iceId);

      setTimeout(() => {
        contentController.insertInstance(
          record.modelId,
          record.fieldId,
          record.fieldId.includes('.') ? `${record.index}.${targetIndex}` : targetIndex,
          instance
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
        fn.onDragLeave();
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
        dropZones = [],
        type;

      if (asset.mimeType.includes('image/')) {
        type = 'image';
      } else if (asset.mimeType.includes('video/')) {
        type = 'video-picker';
      }
      const validatedReceptacles = iceRegistry.getMediaReceptacles(type);
      // scrollToReceptacle(validatedReceptacles);

      validatedReceptacles
        .forEach(({ id }) => {

          const dropZone = ElementRegistry.compileDropZone(id);
          dropZone.origin = false;
          dropZones.push(dropZone);

          players = [...players, dropZone.element];
          containers.push(dropZone.element);

        });

      const highlighted = getHighlighted(dropZones);

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
      const { id } = dragContext.dragged;
      let { modelId, fieldId, index } = iceRegistry.recordOf(id);
      contentController.deleteItem(modelId, fieldId, index);
    },

    dragOk() {
      return [
        EditingStatus.SORTING_COMPONENT,
        EditingStatus.PLACING_NEW_COMPONENT,
        EditingStatus.PLACING_DETACHED_ASSET,
        EditingStatus.PLACING_DETACHED_COMPONENT,
        EditingStatus.UPLOAD_ASSET_FROM_DESKTOP,
      ].includes(stateRef.current.common.status);
    },

    clearAndListen() {
      clearAndListen$.next();
      setState({
        ...stateRef.current,
        common: {
          ...stateRef.current.common,
          status: EditingStatus.LISTENING,
          highlighted: {}
        }
      });
    },

    onDesktopAssetDragStarted(asset) {
      let
        players = [],
        siblings = [],
        containers = [],
        dropZones = [],
        type;

      if (asset.type.includes('image/')) {
        type = 'image';
      } else if (asset.type.includes('video/')) {
        type = 'video-picker';
      }
      const validatedReceptacles = iceRegistry.getMediaReceptacles(type);
      // scrollToReceptacle(validatedReceptacles);

      validatedReceptacles
        .forEach(({ id }) => {

          const dropZone = ElementRegistry.compileDropZone(id);
          dropZone.origin = false;
          dropZones.push(dropZone);

          players = [...players, dropZone.element];
          containers.push(dropZone.element);

        });

      const highlighted = getHighlighted(dropZones);

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
          status: EditingStatus.UPLOAD_ASSET_FROM_DESKTOP,
          highlighted,
          register,
          deregister,
          onEvent
        }
      });
    }
  };

  function register(payload) {
    return ElementRegistry.register(payload);
  }

  function deregister(id) {
    return ElementRegistry.deregister(id);
  }

  function onEvent(event, dispatcher) {
    if (
      persistence.contentReady &&
      stateRef.current.common.inEditMode
    ) {

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

  function scrollToReceptacle(receptacles) {
    let elementInView;
    let element;
    elementInView = forEach(receptacles, ({ id }) => {
      let elem = ElementRegistry.fromICEId(id).element;
      if (isElementInView(elem)) {
        elementInView = true;
        element = elem;
        return 'break';
      }
    }, false);

    if (!elementInView) {
      // TODO: Do this relative to the scroll position. Don't move if things are already in viewport. Be smarter.
      let element = ElementRegistry.fromICEId(receptacles[0].id).element;
      $(scrollElement).animate({
        scrollTop: $(element).offset().top - 100
      }, 300);
    }
  }

  function getHighlighted(dropZones) {
    return dropZones.reduce((object, { physicalRecordId: id }) => {
      object[id] = ElementRegistry.getHoverData(id);
      return object;
    }, {});
  }

  // 1. Subscribes to accommodation messages and routes them.
  // 2. Appends the Guest stylesheet
  // 3. Sets document domain
  useEffect(() => {

    if (documentDomain) {
      try {
        document.domain = documentDomain;
      } catch (e) {
        console.log(e);
      }
    }

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
          return fn.onHostComponentDragStarted(payload);
        case COMPONENT_DRAG_ENDED:
          return fn.onHostComponentDragEnd();
        case COMPONENT_INSTANCE_DRAG_STARTED:
          return fn.onHostInstanceDragStarted(payload);
        case COMPONENT_INSTANCE_DRAG_ENDED:
          return fn.onHostInstanceDragEnd();
        case TRASHED:
          return fn.onTrashDrop(payload);
        case CLEAR_SELECTED_ZONES:
          fn.clearAndListen();
          break;
        case RELOAD_REQUEST: {
          post({ type: GUEST_CHECK_OUT });
          return window.location.reload();
        }
        case NAVIGATION_REQUEST: {
          post({ type: GUEST_CHECK_OUT });
          return window.location.href = payload.url;
        }
        case CONTENT_TYPE_RECEPTACLES_REQUEST: {
          const highlighted = {};
          let receptacles = iceRegistry.getContentTypeReceptacles(payload).map((item) => {
            let { physicalRecordId } = ElementRegistry.compileDropZone(item.id);
            let highlight = ElementRegistry.getHoverData(physicalRecordId);
            highlighted[physicalRecordId] = highlight;
            return {
              modelId: item.modelId,
              fieldId: item.fieldId,
              label: highlight.label,
              id: item.id,
              contentType: payload
            };
          });
          setState({
            dragContext: {
              ...stateRef.current.dragContext,
              inZone: false,
            },
            common: {
              ...stateRef.current.common,
              status: EditingStatus.SHOW_RECEPTACLES,
              highlighted
            }
          });

          post({ type: CONTENT_TYPE_RECEPTACLES_RESPONSE, payload: { contentType: payload, receptacles } });
          break;
        }
        case SCROLL_TO_RECEPTACLE:
          scrollToReceptacle([payload]);
          break;
        case CLEAR_HIGHLIGHTED_RECEPTACLES:
          setState({
            ...stateRef.current,
            common: {
              ...stateRef.current.common,
              status: EditingStatus.LISTENING,
              highlighted: {}
            }
          });
          break;
        default:
          console.warn(`[message$] Unhandled host message "${type}".`);
      }
    });

    const stylesheet = appendStyleSheet({ styles });

    return () => {
      stylesheet.detach();
      sub.unsubscribe();
    };

  }, [documentDomain, styles]);

  // Registers zones
  useEffect(() => {

    const iceId = iceRegistry.register({ modelId });
    const location = window.location.href;
    const origin = window.location.origin;
    const url = location.replace(origin, '');
    const site = Cookies.get('crafterSite');

    post(GUEST_CHECK_IN, { url, location, origin, modelId, path, site });

    let timeout = setTimeout(() => {
      hostDetectionSubscription.unsubscribe();
      console.log('No Host was detected. In-Context Editing is off.');
    }, 700);

    const hostDetectionSubscription = fromTopic(HOST_CHECK_IN).pipe(take(1)).subscribe(() => {
      clearTimeout(timeout);
    });

    zip(
      contentController.models$(modelId),
      contentController.contentTypes$()
    ).pipe(
      take(1)
    ).subscribe(() => {
      persistence.contentReady = true;
    });

    fn.onEditModeChanged(stateRef.current.common.inEditMode);

    return () => {
      iceRegistry.deregister(iceId);
    };

  }, [modelId, path]);

  useEffect(() => {
    const subscription = fromEvent(document, 'dragenter').pipe(
      filter((e) => e.dataTransfer?.types.includes('Files'))
    ).subscribe((e) => {
      e.preventDefault();
      e.stopPropagation();
      fn.onDesktopAssetDragStarted(e.dataTransfer.items[0]);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (EditingStatus.UPLOAD_ASSET_FROM_DESKTOP === stateRef.current.common.status) {
      const dropSubscription = fromEvent(document, 'drop').subscribe((e) => {
        e.preventDefault();
        e.stopPropagation();
        fn.dragend(e);
      });
      const dragover$ = fromEvent(document, 'dragover').pipe(
        tap((e) => {
          e.preventDefault();
          e.stopPropagation();
        }),
        share()
      );
      const dragoverSubscription = dragover$.subscribe();
      const dragleaveSubscription = fromEvent(document, 'dragleave').pipe(
        switchMap(() => interval(100).pipe(takeUntil(dragover$)))
      ).subscribe(fn.onDragEnd);
      return () => {
        dragoverSubscription.unsubscribe();
        dragleaveSubscription.unsubscribe();
        dropSubscription.unsubscribe();
      };
    }
  }, [stateRef.current.common.status]);

  return (
    isAuthoring ? (
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
    ) : children
  );

}

// Notice this is not executed when the iFrame url is changed abruptly.
// This only triggers when navigation occurs from within the guest page.
window.addEventListener('beforeunload', () => {
  post({ type: GUEST_CHECK_OUT });
}, false);
