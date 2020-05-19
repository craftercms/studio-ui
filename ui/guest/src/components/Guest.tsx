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
import { fromEvent, interval, zip } from 'rxjs';
import { filter, share, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import iceRegistry from '../classes/ICERegistry';
import contentController from '../classes/ContentController';
import ElementRegistry from '../classes/ElementRegistry';
import { GuestContextProvider } from './GuestContext';
import CrafterCMSPortal from './CrafterCMSPortal';
import ZoneMarker from './ZoneMarker';
import DropMarker from './DropMarker';
import { appendStyleSheet } from '../styles';
import { fromTopic, message$, post } from '../communicator';
import Cookies from 'js-cookie';
import { HighlightData } from '../models/InContextEditing';
import AssetUploaderMask from './AssetUploaderMask';
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
  DESKTOP_ASSET_DRAG_ENDED,
  DESKTOP_ASSET_DRAG_STARTED,
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
import { clearAndListen$ } from '../store/subjects';
import { GuestState } from '../store/models/GuestStore';
import { EditingStatus } from '../models/ICEStatus';
import { isNullOrUndefined, nnou } from '../utils/object';
import { scrollToNode, scrollToReceptacle } from '../utils/dom';
import { dragOk } from '../store/util';
import SnackBar, { Snack } from './SnackBar';
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

function Guest(props: GuestProps) {
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

  const [snack, setSnack] = useState<Partial<Snack>>();
  const dispatch = useDispatch();
  const state = useSelector<GuestState, GuestState>((state) => state);
  const status = state.status;
  const context = useMemo(
    () => ({
      onEvent(event: Event, dispatcherElementRecordId: number) {
        if (persistenceRef.current.contentReady && state.inEditMode) {
          const { type } = event;

          const record = ElementRegistry.get(dispatcherElementRecordId);
          if (isNullOrUndefined(record)) {
            throw new Error('No record found for dispatcher element');
          }

          dispatch({ type: type, payload: { event, record } });
        }
      }
    }),
    [dispatch, state.inEditMode]
  );

  // region Stuff to remove
  const persistenceRef = useRef({
    contentReady: false,
    mouseOverTimeout: null,
    dragover$: null,
    scrolling$: null,
    onScroll: null
  });
  // endregion

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

  // Subscribes to host messages and routes them.
  useEffect(() => {
    const sub = message$.subscribe(function ({ type, payload }) {
      switch (type) {
        case EDIT_MODE_CHANGED:
          dispatch({
            type: EDIT_MODE_CHANGED,
            payload: { inEditMode: payload.inEditMode, editModeOnIndicatorClass }
          });
          break;
        case ASSET_DRAG_STARTED:
          dispatch({ type: ASSET_DRAG_STARTED, payload: { asset: payload } });
          break;
        case ASSET_DRAG_ENDED:
          dragOk(status) && dispatch({ type: ASSET_DRAG_ENDED });
          break;
        case COMPONENT_DRAG_STARTED:
          dispatch({ type: COMPONENT_DRAG_STARTED, payload: { contentType: payload } });
          break;
        case COMPONENT_DRAG_ENDED:
          dragOk(status) && dispatch({ type: COMPONENT_DRAG_ENDED });
          break;
        case COMPONENT_INSTANCE_DRAG_STARTED:
          dispatch({ type: COMPONENT_INSTANCE_DRAG_STARTED, payload: { instance: payload } });
          break;
        case COMPONENT_INSTANCE_DRAG_ENDED:
          dragOk(status) && dispatch({ type: COMPONENT_INSTANCE_DRAG_ENDED });
          break;
        case TRASHED:
          dispatch({ type: TRASHED, payload: { iceId: payload } });
          break;
        case CLEAR_SELECTED_ZONES:
          clearAndListen$.next();
          dispatch({ type: 'start_listening' });
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
          dispatch({
            type: CONTENT_TYPE_RECEPTACLES_REQUEST,
            payload: { contentTypeId: payload }
          });
          break;
        }
        case SCROLL_TO_RECEPTACLE:
          scrollToReceptacle([payload], scrollElement, (id: number) => ElementRegistry.fromICEId(id).element);
          break;
        case CLEAR_HIGHLIGHTED_RECEPTACLES:
          dispatch({ type: CLEAR_HIGHLIGHTED_RECEPTACLES });
          break;
        case CONTENT_TREE_FIELD_SELECTED: {
          scrollToNode(payload, scrollElement);
          break;
        }
        case DESKTOP_ASSET_UPLOAD_PROGRESS:
          dispatch({ type: DESKTOP_ASSET_UPLOAD_PROGRESS, payload: payload });
          break;
        case DESKTOP_ASSET_UPLOAD_COMPLETE:
          dispatch({ type: DESKTOP_ASSET_UPLOAD_COMPLETE, payload: payload });
          break;
      }
    });
    return () => {
      sub.unsubscribe();
    };
  }, [dispatch, editModeOnIndicatorClass, scrollElement, status]);

  // Check in & host detection
  useEffect(() => {
    const location = window.location.href;
    const origin = window.location.origin;
    const url = location.replace(origin, '');
    const site = Cookies.get('crafterSite');
    interval(1000)
      .pipe(takeUntil(fromTopic(HOST_CHECK_IN).pipe(take(1))), take(1))
      .subscribe(() => {
        setSnack({
          duration: 8000,
          message: 'Crafter CMS not detected. In-Context Editing is is disabled.'
        });
      });
    post(GUEST_CHECK_IN, { url, location, origin, modelId, path, site });
  }, [modelId, path]);

  // Registers parent zone
  useEffect(() => {
    const iceId = iceRegistry.register({ modelId });
    zip(contentController.models$(modelId), contentController.contentTypes$())
      .pipe(take(1))
      .subscribe(() => {
        persistenceRef.current.contentReady = true;
      });
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
        dispatch({
          type: DESKTOP_ASSET_DRAG_STARTED,
          payload: { asset: e.dataTransfer.items[0] }
        });
      });
    return () => subscription.unsubscribe();
  }, [dispatch]);

  // Listen for drag events for desktop asset drag & drop
  useEffect(() => {
    if (EditingStatus.UPLOAD_ASSET_FROM_DESKTOP === status) {
      const dropSubscription = fromEvent(document, 'drop').subscribe((e) => {
        e.preventDefault();
        e.stopPropagation();
        dragOk(status) && dispatch({ type: DESKTOP_ASSET_DRAG_ENDED });
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
        .subscribe(() => {
          dragOk(status) && dispatch({ type: DESKTOP_ASSET_DRAG_ENDED });
        });
      return () => {
        dropSubscription.unsubscribe();
        dragoverSubscription.unsubscribe();
        dragleaveSubscription.unsubscribe();
      };
    }
  }, [dispatch, status]);

  // Listen for mouse switching between drop zones
  const dragContextDropZoneIceId = state.dragContext?.dropZone?.iceId;

  useEffect(() => {
    if (nnou(dragContextDropZoneIceId)) {
      console.log({ type: 'drop_zone_enter' }, dragContextDropZoneIceId);
      dispatch({ type: 'drop_zone_enter', payload: { iceId: dragContextDropZoneIceId } });
      return () => {
        console.log({ type: 'drop_zone_leave' }, dragContextDropZoneIceId);
        dispatch({ type: 'drop_zone_leave', payload: { iceId: dragContextDropZoneIceId } });
      };
    }
  }, [dispatch, dragContextDropZoneIceId]);

  return (
    <GuestContextProvider value={context}>
      {children}
      {status !== EditingStatus.OFF && (
        <CrafterCMSPortal>
          {Object.values(state.uploading).map((highlight: HighlightData) => (
            <AssetUploaderMask key={highlight.id} {...highlight} />
          ))}
          {Object.values(state.highlighted).map((highlight: HighlightData, index, array) => (
            <ZoneMarker
              key={highlight.id}
              {...highlight}
              classes={{
                label: (array.length > 1) && 'craftercms-zone-marker-label__multi-mode',
                marker: Object.values(highlight.validations).length
                  ? Object.values(highlight.validations).some(({ level }) => level === 'required')
                    ? 'craftercms-required-validation-failed'
                    : 'craftercms-suggestion-validation-failed'
                  : null
              }}
            />
          ))}
          {[
            EditingStatus.SORTING_COMPONENT,
            EditingStatus.PLACING_NEW_COMPONENT,
            EditingStatus.PLACING_DETACHED_COMPONENT
          ].includes(status) &&
          state.dragContext.inZone &&
          !state.dragContext.invalidDrop && (
            <DropMarker
              onDropPosition={(payload) => dispatch({ type: 'set_drop_position', payload })}
              dropZone={state.dragContext.dropZone}
              over={state.dragContext.over}
              prev={state.dragContext.prev}
              next={state.dragContext.next}
              coordinates={state.dragContext.coordinates}
            />
          )}
          {snack && (
            <SnackBar open={true} onClose={() => setSnack(null)} {...snack}>
              {snack.message}
            </SnackBar>
          )}
        </CrafterCMSPortal>
      )}
    </GuestContextProvider>
  );
}

export default function (props: GuestProps) {
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
