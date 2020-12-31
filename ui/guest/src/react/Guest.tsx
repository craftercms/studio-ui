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

import React, { PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react';
import $ from 'jquery';
import { fromEvent, interval, merge } from 'rxjs';
import { filter, pluck, share, switchMap, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import * as iceRegistry from '../classes/ICERegistry';
import { contentTypes$ } from '../classes/ContentController';
import * as elementRegistry from '../classes/ElementRegistry';
import { GuestContextProvider } from './GuestContext';
import CrafterCMSPortal from './CrafterCMSPortal';
import ZoneMarker from './ZoneMarker';
import DropMarker from './DropMarker';
import { appendStyleSheet, GuestStyleConfig } from '../styles/styles';
import { fromTopic, message$, post } from '../utils/communicator';
import Cookies from 'js-cookie';
import { HighlightData } from '../models/InContextEditing';
import AssetUploaderMask from './AssetUploaderMask';
import {
  ASSET_DRAG_ENDED,
  ASSET_DRAG_STARTED,
  CLEAR_CONTENT_TREE_FIELD_SELECTED,
  CLEAR_HIGHLIGHTED_RECEPTACLES,
  CLEAR_SELECTED_ZONES,
  COMPONENT_DRAG_ENDED,
  COMPONENT_DRAG_STARTED,
  COMPONENT_INSTANCE_DRAG_ENDED,
  COMPONENT_INSTANCE_DRAG_STARTED,
  CONTENT_TREE_FIELD_SELECTED,
  CONTENT_TREE_SWITCH_FIELD_INSTANCE,
  CONTENT_TYPE_RECEPTACLES_REQUEST,
  DESKTOP_ASSET_DRAG_ENDED,
  DESKTOP_ASSET_DRAG_STARTED,
  DESKTOP_ASSET_UPLOAD_COMPLETE,
  DESKTOP_ASSET_UPLOAD_PROGRESS,
  EDIT_MODE_CHANGED,
  EditingStatus,
  GUEST_CHECK_IN,
  GUEST_CHECK_OUT,
  HIGHLIGHT_MODE_CHANGED,
  HighlightMode,
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
import { isNullOrUndefined, nnou } from '../utils/object';
import { scrollToReceptacle } from '../utils/dom';
import { dragOk } from '../store/util';
import SnackBar, { Snack } from './SnackBar';
import { createLocationArgument } from '../utils/util';
import FieldInstanceSwitcher from './FieldInstanceSwitcher';
// TinyMCE makes the build quite large. Temporarily, importing this externally via
// the site's ftl. Need to evaluate whether to include the core as part of guest build or not
// import tinymce from 'tinymce';

const initialDocumentDomain = document.domain;
const editModeClass = 'craftercms-ice-on';

type GuestProps = PropsWithChildren<{
  documentDomain?: string;
  path?: string;
  styleConfig?: GuestStyleConfig;
  isAuthoring?: boolean; // boolean | Promise<boolean> | () => boolean | Promise<boolean>
  scrollElement?: string;
}>;

function Guest(props: GuestProps) {
  // TODO: support path driven Guest.
  // TODO: consider supporting developer to provide the data source (promise/observable?)
  const { path, styleConfig, children, documentDomain, scrollElement = 'html, body' } = props;

  const [snack, setSnack] = useState<Partial<Snack>>();
  const dispatch = useDispatch();
  const state = useSelector<GuestState, GuestState>((state) => state);
  const editMode = state.editMode;
  const highlightMode = state.highlightMode;
  const status = state.status;
  const hasHost = state.hostCheckedIn;
  const draggable = state.draggable;
  const refs = useRef({ contentReady: false });
  // TODO: Avoid double re-render when draggable changes without coupling to redux on useICE
  const context = useMemo(
    () => ({
      hasHost,
      editMode,
      draggable,
      highlightMode,
      onEvent(event: Event, dispatcherElementRecordId: number) {
        if (hasHost && editMode && refs.current.contentReady) {
          const { type } = event;
          const record = elementRegistry.get(dispatcherElementRecordId);
          if (isNullOrUndefined(record)) {
            console.error('No record found for dispatcher element');
          } else {
            // HighlightMode validations helps to dont stop the event propagation
            if (
              ['click', 'dblclick'].includes(type) &&
              (highlightMode === HighlightMode.ALL || (highlightMode === HighlightMode.MOVABLE && !draggable))
            ) {
              event.preventDefault();
              event.stopPropagation();
            }
            dispatch({ type: type, payload: { event, record } });
            return true;
          }
        }
        return false;
      }
    }),
    [dispatch, hasHost, draggable, editMode, highlightMode]
  );

  // Sets document domain
  useEffect(() => {
    if (documentDomain) {
      try {
        document.domain = documentDomain;
      } catch (e) {
        console.error(e);
      }
    } else if (document.domain !== initialDocumentDomain) {
      document.domain = initialDocumentDomain;
    }
  }, [documentDomain]);

  // Add/remove edit on class
  useEffect(() => {
    if (editMode === false) {
      $('html').removeClass(editModeClass);
      document.dispatchEvent(new CustomEvent(editModeClass, { detail: false }));
    } else {
      $('html').addClass(editModeClass);
      document.dispatchEvent(new CustomEvent(editModeClass, { detail: true }));
    }
  }, [editMode]);

  // Appends the Guest stylesheet
  useEffect(() => {
    const stylesheet = appendStyleSheet(styleConfig);
    return () => {
      stylesheet.detach();
    };
  }, [styleConfig]);

  // Subscribes to host messages and routes them.
  useEffect(() => {
    const sub = message$.subscribe(function(action) {
      const { type, payload } = action;
      switch (type) {
        case HIGHLIGHT_MODE_CHANGED:
        case EDIT_MODE_CHANGED:
          dispatch(action);
          break;
        case ASSET_DRAG_STARTED:
          dispatch({ type, payload: { asset: payload } });
          break;
        case ASSET_DRAG_ENDED:
          dragOk(status) && dispatch(action);
          break;
        case COMPONENT_DRAG_STARTED:
          dispatch({ type, payload: { contentType: payload } });
          break;
        case COMPONENT_DRAG_ENDED:
          dragOk(status) && dispatch(action);
          break;
        case COMPONENT_INSTANCE_DRAG_STARTED:
          dispatch({ type, payload });
          break;
        case COMPONENT_INSTANCE_DRAG_ENDED:
          dragOk(status) && dispatch(action);
          break;
        case TRASHED:
          dispatch({ type, payload: { iceId: payload } });
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
            type,
            payload: { contentTypeId: payload }
          });
          break;
        }
        case SCROLL_TO_RECEPTACLE:
          scrollToReceptacle([payload], scrollElement, (id: number) => elementRegistry.fromICEId(id).element);
          break;
        case CLEAR_HIGHLIGHTED_RECEPTACLES:
          dispatch(action);
          break;
        case CONTENT_TREE_FIELD_SELECTED: {
          dispatch({
            type,
            payload: {
              iceProps: {
                modelId: payload.parentId || payload.modelId,
                fieldId: payload.fieldId,
                index: payload.index
              },
              scrollElement,
              name: payload.name
            }
          });
          break;
        }
        case CLEAR_CONTENT_TREE_FIELD_SELECTED:
          clearAndListen$.next();
          dispatch({ type });
          break;
        case DESKTOP_ASSET_UPLOAD_PROGRESS:
          dispatch(action);
          break;
        case DESKTOP_ASSET_UPLOAD_COMPLETE:
          dispatch(action);
          break;
      }
    });
    return () => {
      sub.unsubscribe();
    };
  }, [dispatch, scrollElement, status]);

  // Host detection
  useEffect(() => {
    if (!hasHost) {
      // prettier-ignore
      interval(1000).pipe(
        takeUntil(
          merge(fromTopic(HOST_CHECK_IN), fromTopic('LEGACY_CHECK_IN')).pipe(
            tap(dispatch),
            take(1)
          )
        ),
        take(1)
      ).subscribe(() => setSnack({
        duration: 8000,
        message: 'In-context editing is disabled: page running out of Crafter CMS frame.'
      }));
    }
  }, [dispatch, hasHost]);

  // Load dependencies (tinymce)
  useEffect(() => {
    if (hasHost && !window.tinymce) {
      const script = document.createElement('script');
      script.src = '/studio/static-assets/modules/editors/tinymce/v5/tinymce/tinymce.min.js';
      // script.onload = () => ...;
      document.head.appendChild(script);
    }
  }, [hasHost]);

  // Check out (dismount, beforeunload)
  useEffect(() => {
    // Notice this is not executed when the iFrame url is changed abruptly.
    // This only triggers when navigation occurs from within the guest page.
    const handler = () => post({ type: GUEST_CHECK_OUT });
    window.addEventListener('beforeunload', handler, false);

    return () => {
      post(GUEST_CHECK_OUT);
      window.removeEventListener('beforeunload', handler);
    };
  }, []);

  // Registers parent zone, check in, checkout (when model is changed)
  useEffect(() => {
    let iceId;
    const location = createLocationArgument();
    const site = Cookies.get('crafterSite');

    fromTopic('FETCH_GUEST_MODEL_COMPLETE')
      .pipe(
        filter(({ payload }) => payload.path === path),
        pluck('payload', 'model'),
        withLatestFrom(contentTypes$),
        take(1)
      )
      .subscribe(([model]) => {
        iceId = iceRegistry.register({ modelId: model.craftercms.id });
        refs.current.contentReady = true;
      });

    post(GUEST_CHECK_IN, { location, path, site, documentDomain });

    return () => {
      post(GUEST_CHECK_OUT);
      nnou(iceId) && iceRegistry.deregister(iceId);
    };
  }, [documentDomain, path]);

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
  const dragContextDropZoneElementRecordId = state.dragContext?.dropZone?.elementRecordId;
  useEffect(() => {
    if (nnou(dragContextDropZoneIceId)) {
      dispatch({
        type: 'drop_zone_enter',
        payload: { elementRecordId: dragContextDropZoneElementRecordId }
      });
      return () => {
        dispatch({
          type: 'drop_zone_leave',
          payload: { elementRecordId: dragContextDropZoneElementRecordId }
        });
      };
    }
  }, [dispatch, dragContextDropZoneIceId]);

  const draggableItemElemRecId = Object.entries(state.draggable ?? {}).find(([, ice]) => ice !== false)?.[0];

  return (
    <GuestContextProvider value={context}>
      {children}
      {editMode && (
        <CrafterCMSPortal>
          {draggableItemElemRecId && (
            <craftercms-dragged-element>
              {elementRegistry.get(parseInt(draggableItemElemRecId))?.label}
            </craftercms-dragged-element>
          )}
          {Object.values(state.uploading).map((highlight: HighlightData) => (
            <AssetUploaderMask key={highlight.id} {...highlight} />
          ))}
          {state.fieldSwitcher && (
            <FieldInstanceSwitcher
              onNext={() =>
                dispatch({
                  type: CONTENT_TREE_SWITCH_FIELD_INSTANCE,
                  payload: { type: 'next', scrollElement }
                })
              }
              onPrev={() =>
                dispatch({
                  type: CONTENT_TREE_SWITCH_FIELD_INSTANCE,
                  payload: { type: 'prev', scrollElement }
                })
              }
              registryEntryIds={state.fieldSwitcher.registryEntryIds}
              currentElement={state.fieldSwitcher.currentElement}
            />
          )}

          {Object.values(state.highlighted).map((highlight: HighlightData, index, array) => (
            <ZoneMarker
              key={highlight.id}
              {...highlight}
              classes={{
                label: array.length > 1 && 'craftercms-zone-marker-label__multi-mode',
                marker: Object.values(highlight.validations).length
                  ? Object.values(highlight.validations).some(({ level }) => level === 'required')
                    ? 'craftercms-required-validation-failed'
                    : 'craftercms-suggestion-validation-failed'
                  : null
              }}
            />
          ))}
          {/* prettier-ignore */}
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
        </CrafterCMSPortal>
      )}
      {snack && (
        <SnackBar open={true} onClose={() => setSnack(null)} {...snack}>
          {snack.message}
        </SnackBar>
      )}
    </GuestContextProvider>
  );
}

export default function CrafterCMSGuest(props: GuestProps) {
  const { isAuthoring, children } = props;
  const store = useMemo(() => isAuthoring && createGuestStore(), [isAuthoring]);
  return isAuthoring ? (
    <Provider store={store}>
      <Guest {...props} />
    </Provider>
  ) : (
    (children as JSX.Element)
  );
}
