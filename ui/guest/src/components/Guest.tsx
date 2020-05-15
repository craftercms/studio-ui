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

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  EditingStatus,
  getHighlighted,
  isNullOrUndefined,
  scrollToNode,
  scrollToReceptacle
} from '../util';
import { fromEvent, interval, zip } from 'rxjs';
import { filter, share, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import iceRegistry from '../classes/ICERegistry';
import contentController from '../classes/ContentController';
import { ElementRegistry } from '../classes/ElementRegistry';
import $ from 'jquery';
import { GuestContextProvider } from './GuestContext';
import CrafterCMSPortal from './CrafterCMSPortal';
import { ZoneMarker } from './ZoneMarker';
import { DropMarker } from './DropMarker';
import { appendStyleSheet } from '../styles';
import { fromTopic, message$, post } from '../communicator';
import Cookies from 'js-cookie';
import { Asset, ContentType } from '../models/ContentType';
import { ContentInstance } from '../models/ContentInstance';
import { HoverData } from '../models/InContextEditing';
import { LookupTable } from '../models/LookupTable';
import { AssetUploaderMask } from './AssetUploaderMask';
import {
  ASSET_DRAG_ENDED,
  ASSET_DRAG_STARTED,
  CLEAR_HIGHLIGHTED_RECEPTACLES,
  CLEAR_SELECTED_ZONES,
  COMPONENT_DRAG_ENDED,
  COMPONENT_DRAG_STARTED,
  COMPONENT_INSTANCE_DRAG_ENDED,
  COMPONENT_INSTANCE_DRAG_STARTED,
  CONTENT_TREE_FIELD_SELECTED,
  CONTENT_TYPE_RECEPTACLES_REQUEST,
  CONTENT_TYPE_RECEPTACLES_RESPONSE,
  DESKTOP_ASSET_UPLOAD_COMPLETE,
  DESKTOP_ASSET_UPLOAD_PROGRESS,
  EDIT_MODE_CHANGED,
  GUEST_CHECK_IN,
  GUEST_CHECK_OUT,
  HOST_CHECK_IN,
  NAVIGATION_REQUEST,
  RELOAD_REQUEST,
  SCROLL_TO_RECEPTACLE,
  TRASHED
} from '../constants';
import { createGuestStore } from '../store/store';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { clearAndListen$, initializeDragSubjects } from '../store/subjects';
import { dragOk } from '../store/util';
import { GuestState } from '../store/models/GuestStore';
// TinyMCE makes the build quite large. Temporarily, importing this externally via
// the site's ftl. Need to evaluate whether to include the core as part of guest build or not
// import tinymce from 'tinymce';

const initialDocumentDomain = document.domain;

interface GuestProps {
  modelId: string;
  documentDomain?: string;
  path?: string;
  styles?: any;
  children?: any;
  isAuthoring?: boolean;
  scrollElement?: string;
  editModeOnIndicatorClass?: string;
}

declare global {
  interface Window {
    tinymce: any;
  }
}

export function Guest(props: GuestProps) {
  // TODO: support path driven Guest.
  // TODO: consider supporting developer to provide the data source (promise/observable?)
  const {
    path,
    styles,
    modelId,
    children,
    documentDomain,
    scrollElement = 'html, body',
    editModeOnIndicatorClass = 'craftercms-ice-on'
  } = props;

  const fnRef = useRef<any>();
  const persistenceRef = useRef({
    contentReady: false,
    mouseOverTimeout: null,
    dragover$: null,
    scrolling$: null,
    onScroll: null
  });
  const dispatch = useDispatch();
  const state = useSelector<GuestState, GuestState>((state) => state);

  const highlightedInitialData: LookupTable<HoverData> = {};

  const [, forceUpdate] = useState({});
  const stateRef = useRef({
    dragContext: null,
    common: {
      ICE_GUEST_INIT: true,
      status: EditingStatus.LISTENING,
      inEditMode: true,
      editable: {},
      draggable: {},
      highlighted: highlightedInitialData,
      uploading: highlightedInitialData
    }
  });

  const setState = (nextState) => {
    stateRef.current = nextState;
    forceUpdate({});
  };

  const fn = {
    onEditModeChanged(inEditMode): void {
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

    onHostInstanceDragStarted(instance: ContentInstance): void {
      let players = [];
      let siblings = [];
      let containers = [];
      let dropZones = [];

      const receptacles = iceRegistry.getContentTypeReceptacles(instance.craftercms.contentTypeId);

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

      initializeDragSubjects();

      setState({
        dragContext: {
          players,
          siblings,
          dropZones,
          containers,
          instance,
          inZone: false,
          dragged: null,
          targetIndex: null
        },
        common: {
          ...stateRef.current.common,
          status: EditingStatus.PLACING_DETACHED_COMPONENT,
          highlighted
        }
      });
    },

    onHostInstanceDragEnd(): void {
      dragOk(state.status) && dispatch({ type: 'computed_dragend' });
    },

    onHostComponentDragStarted(contentType: ContentType): void {
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

      initializeDragSubjects();

      setState({
        dragContext: {
          players,
          siblings,
          dropZones,
          containers,
          contentType,
          inZone: false,
          dragged: null,
          targetIndex: null
        },
        common: {
          ...stateRef.current.common,
          status: EditingStatus.PLACING_NEW_COMPONENT,
          highlighted
        }
      });
    },

    onHostComponentDragEnd(): void {
      dragOk(state.status) && dispatch({ type: 'computed_dragend' });
    },

    moveComponent(): void {
      let { dragged, dropZone, dropZones, targetIndex } = stateRef.current.dragContext,
        record = dragged,
        draggedElementIndex = record.index,
        originDropZone = dropZones.find((dropZone) => dropZone.origin),
        currentDZ = dropZone.element;

      if (typeof draggedElementIndex === 'string') {
        // If the index is a string, it's a nested index with dot notation.
        // At this point, we only care for the last index piece, which is
        // the index of this item in the collection that's being manipulated.
        draggedElementIndex = parseInt(
          draggedElementIndex.substr(draggedElementIndex.lastIndexOf('.') + 1),
          10
        );
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
              containerRecord.fieldId.includes('.')
                ? `${containerRecord.index}.${draggedElementIndex}`
                : draggedElementIndex,
              containerRecord.fieldId.includes('.')
                ? `${containerRecord.index}.${targetIndex}`
                : targetIndex
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

    insertComponent(): void {
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

    insertInstance(): void {
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

    onScroll(): void {
      setState({
        dragContext: {
          ...stateRef.current.dragContext,
          over: null,
          inZone: false,
          targetIndex: null,
          scrolling: true
        },
        common: {
          ...stateRef.current.common
        }
      });
    },

    onScrollStopped(): void {
      const dragContext = stateRef.current.dragContext;
      setState({
        dragContext: {
          ...stateRef.current.dragContext,
          scrolling: false,
          dropZones: dragContext?.dropZones?.map((dropZone) => ({
            ...dropZone,
            rect: dropZone.element.getBoundingClientRect(),
            childrenRects: dropZone.children.map((child) => child.getBoundingClientRect())
          }))
        },
        common: {
          ...stateRef.current.common
        }
      });
    },

    onAssetDragStarted(asset: Asset): void {
      let players = [],
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

      validatedReceptacles.forEach(({ id }) => {
        const dropZone = ElementRegistry.compileDropZone(id);
        dropZone.origin = false;
        dropZones.push(dropZone);

        players = [...players, dropZone.element];
        containers.push(dropZone.element);
      });

      const highlighted = getHighlighted(dropZones);

      initializeDragSubjects();

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
          highlighted
        }
      });
    },

    onAssetDragEnded(): void {
      dispatch({ type: 'computed_dragend' });
    },

    onSetDropPosition(payload): void {
      setState({
        ...stateRef.current,
        dragContext: {
          ...stateRef.current.dragContext,
          targetIndex: payload.targetIndex
        },
        common: {
          ...stateRef.current.common
        }
      });
    },

    // onDrop doesn't execute when trashing on host side
    // Consider behaviour when running Host Guest-side
    onTrashDrop(): void {
      const { dragContext } = stateRef.current;
      const { id } = dragContext.dragged;
      let { modelId, fieldId, index } = iceRegistry.recordOf(id);
      contentController.deleteItem(modelId, fieldId, index);
    },

    dragOk(): boolean {
      return [
        EditingStatus.SORTING_COMPONENT,
        EditingStatus.PLACING_NEW_COMPONENT,
        EditingStatus.PLACING_DETACHED_ASSET,
        EditingStatus.PLACING_DETACHED_COMPONENT,
        EditingStatus.UPLOAD_ASSET_FROM_DESKTOP
      ].includes(stateRef.current.common.status);
    },

    clearAndListen(): void {
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

    onDesktopAssetDragStarted(asset: DataTransferItem): void {
      let players = [],
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

      validatedReceptacles.forEach(({ id }) => {
        const dropZone = ElementRegistry.compileDropZone(id);
        dropZone.origin = false;
        dropZones.push(dropZone);

        players = [...players, dropZone.element];
        containers.push(dropZone.element);
      });

      const highlighted = getHighlighted(dropZones);

      initializeDragSubjects();

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
          highlighted
        }
      });
    }
  };

  fnRef.current = fn;

  function getElementRegistry(id: number): Element {
    return ElementRegistry.fromICEId(id).element;
  }

  const context = useMemo(() => ({
    onEvent(event: Event, dispatcherElementRecordId: number): boolean {
      if (persistenceRef.current.contentReady && stateRef.current.common.inEditMode) {
        const { type } = event;

        const record = ElementRegistry.get(dispatcherElementRecordId);
        if (isNullOrUndefined(record)) {
          throw new Error('No record found for dispatcher element');
        }

        dispatch({ type: type, payload: { event, record } });

      } else {
        return true;
      }
    }
  }), [dispatch]);

  // Sets document domain
  useEffect(() => {
    if (documentDomain) {
      try {
        document.domain = documentDomain;
      } catch (e) {
        console.error(e);
      }
    } else {
      document.domain = initialDocumentDomain;
    }
  }, [documentDomain]);

  // Appends the Guest stylesheet
  useEffect(() => {
    const stylesheet = appendStyleSheet(styles);
    return () => {
      stylesheet.detach();
    };
  }, [styles]);

  // Subscribes to accommodation messages and routes them.
  useEffect(() => {
    const fn = fnRef.current;

    const sub = message$.subscribe(function({ type, payload }) {
      switch (type) {
        case EDIT_MODE_CHANGED:
          return fn.onEditModeChanged(payload.inEditMode);
        case ASSET_DRAG_STARTED:
          return fn.onAssetDragStarted(payload);
        case ASSET_DRAG_ENDED:
          return fn.onAssetDragEnded();
        case COMPONENT_DRAG_STARTED:
          return fn.onHostComponentDragStarted(payload);
        case COMPONENT_DRAG_ENDED:
          return fn.onHostComponentDragEnd();
        case COMPONENT_INSTANCE_DRAG_STARTED:
          return fn.onHostInstanceDragStarted(payload);
        case COMPONENT_INSTANCE_DRAG_ENDED:
          return fn.onHostInstanceDragEnd();
        case TRASHED:
          return fn.onTrashDrop();
        case CLEAR_SELECTED_ZONES:
          fn.clearAndListen();
          break;
        case RELOAD_REQUEST: {
          post({ type: GUEST_CHECK_OUT });
          return window.location.reload();
        }
        case NAVIGATION_REQUEST: {
          post({ type: GUEST_CHECK_OUT });
          return (window.location.href = payload.url);
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
              contentTypeId: payload
            };
          });
          setState({
            dragContext: {
              ...stateRef.current.dragContext,
              inZone: false
            },
            common: {
              ...stateRef.current.common,
              status: EditingStatus.SHOW_RECEPTACLES,
              highlighted
            }
          });

          post({
            type: CONTENT_TYPE_RECEPTACLES_RESPONSE,
            payload: { contentTypeId: payload, receptacles }
          });
          break;
        }
        case SCROLL_TO_RECEPTACLE:
          scrollToReceptacle([payload], scrollElement, getElementRegistry);
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
        case CONTENT_TREE_FIELD_SELECTED: {
          scrollToNode(payload, scrollElement);
          break;
        }
        case DESKTOP_ASSET_UPLOAD_PROGRESS:
        case DESKTOP_ASSET_UPLOAD_COMPLETE:
          // dispatch(type.toLowerCase())
          break;
        // default:
        //   console.warn(`[message$] Unhandled host message "${type}".`);
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, [scrollElement]);

  // Registers zones
  useEffect(() => {
    const fn = fnRef.current;
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

    const hostDetectionSubscription = fromTopic(HOST_CHECK_IN)
      .pipe(take(1))
      .subscribe(() => {
        clearTimeout(timeout);
      });

    zip(contentController.models$(modelId), contentController.contentTypes$())
      .pipe(take(1))
      .subscribe(() => {
        persistenceRef.current.contentReady = true;
      });

    fn.onEditModeChanged(stateRef.current.common.inEditMode);

    return () => {
      iceRegistry.deregister(iceId);
    };
  }, [modelId, path]);

  // Listen for desktop asset drag & drop
  useEffect(() => {
    const subscription = fromEvent<DragEvent>(document, 'dragenter')
      .pipe(filter((e) => e.dataTransfer?.types.includes('Files')))
      .subscribe((e) => {
        e.preventDefault();
        e.stopPropagation();
        fnRef.current.onDesktopAssetDragStarted(e.dataTransfer.items[0]);
      });
    return () => subscription.unsubscribe();
  }, []);

  // Listen for drag events for desktop asset drag & drop
  useEffect(() => {
    const fn = fnRef.current;
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
      const dragleaveSubscription = fromEvent(document, 'dragleave')
        .pipe(switchMap(() => interval(100).pipe(takeUntil(dragover$))))
        .subscribe(fn.onDragEnd);
      return () => {
        dropSubscription.unsubscribe();
        dragoverSubscription.unsubscribe();
        dragleaveSubscription.unsubscribe();
      };
    }
  }, [stateRef.current.common.status]);

  return (
    <GuestContextProvider value={context}>
      {children}
      {state.status !== EditingStatus.OFF && (
        <CrafterCMSPortal>
          {Object.values(state.uploading).map((highlight: HoverData) => (
            <AssetUploaderMask key={highlight.id} {...highlight} />
          ))}
          {Object.values(state.highlighted).map((highlight: HoverData) => (
            <ZoneMarker key={highlight.id} {...highlight} />
          ))}
          {[
            EditingStatus.SORTING_COMPONENT,
            EditingStatus.PLACING_NEW_COMPONENT,
            EditingStatus.PLACING_DETACHED_COMPONENT
          ].includes(state.status) &&
            state.dragContext.inZone && (
              <DropMarker
                onDropPosition={fn.onSetDropPosition}
                dropZone={state.dragContext.dropZone}
                over={state.dragContext.over}
                prev={state.dragContext.prev}
                next={state.dragContext.next}
                coordinates={state.dragContext.coordinates}
              />
            )}
        </CrafterCMSPortal>
      )}
    </GuestContextProvider>
  );
}

export default function(props: GuestProps) {
  const { isAuthoring = true, children } = props;
  const store = useMemo(() => createGuestStore(), []);
  return isAuthoring ? (
    <Provider store={store}>
      <Guest {...props}>{children}</Guest>
    </Provider>
  ) : (
    children
  );
}

// Notice this is not executed when the iFrame url is changed abruptly.
// This only triggers when navigation occurs from within the guest page.
window.addEventListener(
  'beforeunload',
  () => {
    post({ type: GUEST_CHECK_OUT });
  },
  false
);
