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

import React, { PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react';
import $ from 'jquery';
import { fromEvent, interval, merge } from 'rxjs';
import { filter, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import * as iceRegistry from '../iceRegistry';
import {
  contentTypes$,
  flushRequestedPaths,
  getCachedModels,
  getCachedSandboxItems,
  modelHierarchyMap,
  operations$
} from '../contentController';
import * as elementRegistry from '../elementRegistry';
import { GuestContextProvider, GuestReduxContext, useDispatch, useSelector } from './GuestContext';
import CrafterCMSPortal from './CrafterCMSPortal';
import ZoneMarker from './ZoneMarker';
import DropMarker from './DropMarker';
import { GuestStylesSx, styleSxDefaults, useGuestTheme } from '../styles/styles';
import { fromTopic, message$, post } from '../utils/communicator';
import Cookies from 'js-cookie';
import { HighlightData } from '../models/InContextEditing';
import AssetUploaderMask from './AssetUploaderMask';
import {
  EditingStatus,
  editModeClass,
  editModeEvent,
  editModeIceBypassEvent,
  editModePaddingClass,
  editOnClass,
  HighlightMode,
  iceBypassKeyClass,
  moveModeClass
} from '../constants';
import {
  assetDragEnded,
  assetDragStarted,
  clearContentTreeFieldSelected,
  clearHighlightedDropTargets,
  clearSelectedZones,
  componentDragEnded,
  componentDragStarted,
  componentInstanceDragEnded,
  componentInstanceDragStarted,
  contentTreeFieldSelected,
  contentTreeSwitchFieldInstance,
  contentTypeDropTargetsRequest,
  fetchGuestModelComplete,
  guestCheckIn,
  guestCheckOut,
  highlightModeChanged,
  hostCheckIn,
  hotKey,
  navigationRequest,
  reloadRequest,
  scrollToDropTarget,
  setEditModePadding,
  setPreviewEditMode,
  trashed,
  updateRteConfig
} from '@craftercms/studio-ui/state/actions/preview';
import { createGuestStore } from '../store/store';
import { Provider } from 'react-redux';
import { clearAndListen$, guestCheckIn$ } from '../store/subjects';
import { GuestState } from '../store/models/GuestStore';
import { nnou, nullOrUndefined } from '@craftercms/studio-ui/utils/object';
import { scrollToDropTargets } from '../utils/dom';
import { checkIfLockedOrModified, dragOk } from '../store/util';
import { createLocationArgument, isEditActionAvailable } from '../utils/util';
import FieldInstanceSwitcher from './FieldInstanceSwitcher';
import LookupTable from '@craftercms/studio-ui/models/LookupTable';
import { Snackbar, SnackbarProps, ThemeOptions, ThemeProvider } from '@mui/material';
import { deepmerge } from '@mui/utils';
import { DeepPartial } from 'redux';
import ZoneMenu from './ZoneMenu';
import {
  contentReady,
  desktopAssetDragStarted,
  desktopAssetUploadComplete,
  desktopAssetUploadProgress,
  documentDragEnd,
  documentDragLeave,
  documentDragOver,
  documentDrop,
  dropzoneEnter,
  dropzoneLeave,
  setDropPosition,
  startListening
} from '../store/actions';
import DragGhostElement from './DragGhostElement';
import GuestGlobalStyles, { GuestGlobalStylesProps } from './GuestGlobalStyles';
import { useHotkeys } from 'react-hotkeys-hook';
import { ContentInstance } from '@craftercms/studio-ui/models';
import { prop } from '@craftercms/studio-ui/utils/model';
import {
  sharedWorkerConnect,
  sharedWorkerDisconnect,
  sharedWorkerToken
} from '@craftercms/studio-ui/state/actions/auth';
import { setJwt } from '@craftercms/studio-ui/utils/auth';
import { SHARED_WORKER_NAME } from '@craftercms/studio-ui/utils/constants';
import useUnmount from '@craftercms/studio-ui/hooks/useUnmount';
import { emitSystemEvent } from '@craftercms/studio-ui/state/actions/system';
import { getParentModelId } from '../utils/ice';

// TODO: add themeOptions and global styles customising
interface BaseXBProps {
  documentDomain?: string;
  themeOptions?: ThemeOptions;
  sxOverrides?: DeepPartial<GuestStylesSx>;
  globalStyleOverrides?: GuestGlobalStylesProps['styles'];
  isAuthoring: boolean; // boolean | Promise<boolean> | () => boolean | Promise<boolean>
  scrollElement?: string;
  isHeadlessMode?: boolean; // Templates & controllers become irrelevant
}

type InternalGuestProps = PropsWithChildren<
  BaseXBProps & {
    path: string;
  }
>;

type CompleteGuestProps = PropsWithChildren<
  BaseXBProps & {
    path?: string;
    model?: ContentInstance;
  }
>;

type GenericXBProps<T> = PropsWithChildren<BaseXBProps & T>;

export type ExperienceBuilderProps = GenericXBProps<{ model: ContentInstance } | { path: string }>;

const initialDocumentDomain = typeof document === 'undefined' ? void 0 : document.domain;

function bypassKeyStroke(e, refs) {
  const isKeyDown = e.type === 'keydown';
  refs.current.keysPressed['z'] = isKeyDown;
  $('html')[isKeyDown ? 'addClass' : 'removeClass'](iceBypassKeyClass);
  document.dispatchEvent(new CustomEvent(editModeIceBypassEvent, { detail: isKeyDown }));
}

function ExperienceBuilderInternal(props: InternalGuestProps) {
  // TODO: consider supporting developer to provide the data source (promise/observable?)
  const {
    path,
    themeOptions,
    sxOverrides,
    children,
    documentDomain,
    scrollElement = 'html, body',
    isHeadlessMode = false,
    globalStyleOverrides
  } = props;

  const theme = useGuestTheme(themeOptions);
  const [snack, setSnack] = useState<Partial<SnackbarProps>>();
  const dispatch = useDispatch();
  const state = useSelector<GuestState>((state) => state);
  const { editMode, highlightMode, editModePadding, status, hostCheckedIn: hasHost, draggable, authoringBase } = state;
  const refs = useRef({
    contentReady: false,
    firstRender: true,
    keysPressed: {} as LookupTable<boolean>,
    hasChanges: false
  });
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
          if (nullOrUndefined(record)) {
            console.error('[Guest] No record found for dispatcher element');
          } else {
            if (
              !isEditActionAvailable({
                record,
                models: getCachedModels(),
                sandboxItemsByPath: getCachedSandboxItems(),
                parentModelId: getParentModelId(record.modelId, getCachedModels(), modelHierarchyMap)
              })
            ) {
              return false;
            }
            if (refs.current.keysPressed.z && type === 'click') {
              return false;
            }
            // Click & dblclick require stopping as early as possible to avoid
            // navigation or other click defaults.
            if (['click', 'dblclick'].includes(type)) {
              event.preventDefault();
              event.stopPropagation();
            }
            // Doing a dblclick already do two clicks, one for start editing and another one for leave editing
            // returning false on dblclick prevents issues related to normal editing flow
            if (type === 'dblclick') {
              return false;
            }
            dispatch({ type, payload: { event, record } });
            return true;
          }
        }
        return false;
      }
    }),
    [dispatch, hasHost, draggable, editMode, highlightMode]
  );

  useUnmount(() => {
    clearAndListen$.next();
    dispatch(clearContentTreeFieldSelected());
  });

  // Connect to shared worker & socket
  useEffect(() => {
    if (hasHost && authoringBase) {
      const worker = new SharedWorker(`${authoringBase}/static-assets/next/shared-worker.js`, {
        name: SHARED_WORKER_NAME,
        credentials: 'same-origin'
      });
      worker.port.start();
      worker.port.postMessage(sharedWorkerConnect());
      const unload = () => worker.port.postMessage(sharedWorkerDisconnect());
      window.addEventListener('beforeunload', unload);
      const subscription = fromEvent<MessageEvent>(worker.port, 'message').subscribe((event) => {
        if (event.data?.type) {
          const { type, payload } = event.data;
          switch (type) {
            case sharedWorkerToken.type: {
              setJwt(payload.token);
              break;
            }
            case emitSystemEvent.type: {
              dispatch(payload);
              break;
            }
          }
        }
      });
      return () => {
        unload();
        subscription.unsubscribe();
        window.removeEventListener('beforeunload', unload);
        worker.port.close();
      };
    }
  }, [authoringBase, hasHost, dispatch]);

  const sxStylesConfig = useMemo(() => deepmerge(styleSxDefaults, sxOverrides), [sxOverrides]);

  // region Hotkeys

  // This requires maintenance as key shortcuts evolve/change.
  useHotkeys(
    'a,r,m,e,p,shift+/,shift+e',
    (e) => {
      post(hotKey({ key: e.key, type: 'keyup', shiftKey: e.shiftKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey }));
    },
    { keyup: true, keydown: false }
  );

  // ICE bypass key
  useHotkeys(
    'z',
    (e) => {
      bypassKeyStroke(e, refs);
    },
    { keyup: true, keydown: true }
  );

  useEffect(() => {
    const bypassHandler = (e) => {
      // check if 'z' key is pressed, if so, 'uncheck' it.
      if (refs.current.keysPressed['z']) {
        bypassKeyStroke(e, refs);
      }
    };

    // If you're pressing 'z' key and leave current tab, the system stays as if it was still pressed (bypassed).
    window.addEventListener('blur', bypassHandler, false);

    return () => {
      window.removeEventListener('blur', bypassHandler);
    };
  }, []);

  // endregion

  // Add/remove edit mode highlight mode classes
  useEffect(() => {
    const $html = $('html');
    const cls = highlightMode === HighlightMode.MOVE_TARGETS ? moveModeClass : editModeClass;
    if (editMode) {
      $html.addClass(cls);
      return () => {
        $html.removeClass(cls);
      };
    }
  }, [editMode, highlightMode]);

  // Add/remove edit mode padding mode classes
  useEffect(() => {
    const $html = $('html');
    if (editMode && editModePadding) {
      $html.addClass(editModePaddingClass);
      return () => {
        $html.removeClass(editModePaddingClass);
      };
    }
  }, [editMode, editModePadding]);

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
      $('html').removeClass(editOnClass);
      document.dispatchEvent(new CustomEvent(editModeEvent, { detail: false }));
      // Refreshing the page for now. Will revisit on a later release.
      if (!refs.current.firstRender && refs.current.hasChanges) {
        window.location.reload();
      }
    } else {
      $('html').addClass(editOnClass);
      document.dispatchEvent(new CustomEvent(editModeEvent, { detail: true }));
    }
    if (refs.current.firstRender) {
      refs.current.firstRender = false;
    }
  }, [editMode]);

  // Subscribes to host messages and routes them.
  useEffect(() => {
    const sub = message$.subscribe(function (action) {
      const { type, payload } = action;
      switch (type) {
        case highlightModeChanged.type:
        case setPreviewEditMode.type:
          if (status === EditingStatus.FIELD_SELECTED && action.payload.highlightMode !== 'move') {
            clearAndListen$.next();
          }
          dispatch(action);
          break;
        case assetDragStarted.type:
          dispatch(assetDragStarted({ asset: payload }));
          break;
        case assetDragEnded.type:
          dragOk(status) && dispatch(action);
          break;
        case componentDragStarted.type:
          dispatch(componentDragStarted({ contentType: payload }));
          break;
        case componentDragEnded.type:
          dragOk(status) && dispatch(action);
          break;
        case componentInstanceDragEnded.type:
          dragOk(status) && dispatch(action);
          break;
        case trashed.type:
          dispatch(trashed({ iceId: payload }));
          break;
        case clearSelectedZones.type:
          clearAndListen$.next();
          dispatch(startListening());
          break;
        case reloadRequest.type: {
          post(guestCheckOut({ path }));
          return window.location.reload();
        }
        case navigationRequest.type: {
          post(guestCheckOut({ path }));
          return (window.location.href = payload.url);
        }
        case contentTypeDropTargetsRequest.type: {
          dispatch(contentTypeDropTargetsRequest({ contentTypeId: payload }));
          break;
        }
        case scrollToDropTarget.type:
          scrollToDropTargets([payload], scrollElement, (id: number) => elementRegistry.fromICEId(id).element);
          break;
        case contentTreeFieldSelected.type: {
          dispatch(
            contentTreeFieldSelected({
              iceProps: {
                modelId: payload.parentId || payload.modelId,
                fieldId: payload.fieldId,
                index: payload.index
              },
              scrollElement,
              name: payload.name
            })
          );
          break;
        }
        case clearContentTreeFieldSelected.type:
          clearAndListen$.next();
          dispatch({ type });
          break;
        // region actions whitelisted
        case fetchGuestModelComplete.type:
        case componentInstanceDragStarted.type:
        case clearHighlightedDropTargets.type:
        case desktopAssetUploadProgress.type:
        case desktopAssetUploadComplete.type:
        case updateRteConfig.type:
        case setEditModePadding.type:
          dispatch(action);
          break;
        // endregion
        case hotKey.type:
          if (payload.key === 'z') {
            bypassKeyStroke(payload, refs);
          }
          break;
      }
    });
    return () => {
      sub.unsubscribe();
    };
  }, [dispatch, path, scrollElement, status]);

  // Host detection
  useEffect(() => {
    if (!hasHost) {
      // prettier-ignore
      interval(1000).pipe(
        takeUntil(
          merge(fromTopic(hostCheckIn.type), fromTopic('LEGACY_CHECK_IN')).pipe(
            tap(dispatch),
            take(1)
          )
        ),
        take(1)
      ).subscribe(() => setSnack({
        autoHideDuration: 8000,
        message: 'In-context editing is disabled: page running out of CrafterCMS frame.'
      }));
    }
  }, [dispatch, hasHost]);

  // Load dependencies (tinymce, ace)
  useEffect(() => {
    if (hasHost && !window.tinymce) {
      const script = document.createElement('script');
      script.src = '/studio/static-assets/modules/editors/tinymce/v5/tinymce/tinymce.min.js';
      // script.onload = () => ...;
      document.head.appendChild(script);
    }
    if (hasHost && !window.ace) {
      const script = document.createElement('script');
      script.src = '/studio/static-assets/libs/ace/ace.js';
      document.head.appendChild(script);

      const styleSheet = document.createElement('link');
      styleSheet.rel = 'stylesheet';
      styleSheet.href = '/studio/static-assets/styles/tinymce-ace.css';
      document.head.appendChild(styleSheet);
    }
  }, [hasHost]);

  // Check out (dismount, beforeunload)
  useEffect(() => {
    // Notice this is not executed when the iFrame url is changed abruptly.
    // This only triggers when navigation occurs from within the guest page.
    const handler = () => post(guestCheckOut({ path }));
    window.addEventListener('beforeunload', handler, false);
    return () => {
      post(guestCheckOut({ path }));
      window.removeEventListener('beforeunload', handler);
    };
  }, [path]);

  // Registers parent zone, check in, checkout (when model is changed), content ready subscription
  useEffect(() => {
    let iceId;
    const location = createLocationArgument();
    const site = Cookies.get('crafterSite');
    const operationsSubscription = operations$.pipe(take(1)).subscribe(() => (refs.current.hasChanges = true));

    refs.current.hasChanges = false;

    fromTopic(fetchGuestModelComplete.type)
      .pipe(
        filter(({ payload }) => payload.path === path),
        withLatestFrom(contentTypes$),
        take(1)
      )
      .subscribe(([action]) => {
        iceId = iceRegistry.register({ modelId: action.payload.model.craftercms.id });
        refs.current.contentReady = true;
        dispatch(contentReady());
      });

    post(guestCheckIn({ location, path, site, documentDomain, version: process.env.VERSION }));
    guestCheckIn$.next(true);

    return () => {
      post(guestCheckOut({ path }));
      nnou(iceId) && iceRegistry.deregister(iceId);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      refs.current.contentReady = false;
      flushRequestedPaths();
      operationsSubscription.unsubscribe();
      guestCheckIn$.next(false);
    };
  }, [dispatch, documentDomain, path]);

  // Listen for desktop asset drag & drop
  const shouldNotBypass = hasHost && editMode;
  useEffect(() => {
    if (shouldNotBypass) {
      const subscription = fromEvent<DragEvent>(document, 'dragenter')
        .pipe(filter((e) => e.dataTransfer?.types.includes('Files') && refs.current.contentReady))
        .subscribe((e) => {
          e.preventDefault();
          e.stopPropagation();
          if (/^(video|image)/.test(e.dataTransfer.items[0].type) && e.dataTransfer.items[0].kind === 'file') {
            dispatch(desktopAssetDragStarted({ asset: e.dataTransfer.items[0] }));
          }
        });
      return () => subscription.unsubscribe();
    }
  }, [dispatch, shouldNotBypass]);

  // Listen for drag events for desktop asset drag & drop
  useEffect(() => {
    if (
      [
        EditingStatus.UPLOAD_ASSET_FROM_DESKTOP,
        EditingStatus.SORTING_COMPONENT,
        EditingStatus.PLACING_NEW_COMPONENT,
        EditingStatus.PLACING_DETACHED_COMPONENT,
        EditingStatus.PLACING_DETACHED_ASSET
      ].includes(status)
    ) {
      const dropSubscription = fromEvent(document, 'drop').subscribe((event) => {
        dispatch(documentDrop({ event }));
      });
      const dragendSubscription = fromEvent(document, 'dragend').subscribe((event) => {
        dispatch(documentDragEnd({ event }));
      });
      const dragoverSubscription = fromEvent(document, 'dragover').subscribe((event) =>
        dispatch(documentDragOver({ event }))
      );
      const dragleaveSubscription = fromEvent(document, 'dragleave').subscribe((event) => {
        dispatch(documentDragLeave({ event }));
      });
      return () => {
        dropSubscription.unsubscribe();
        dragendSubscription.unsubscribe();
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
      dispatch(dropzoneEnter({ elementRecordId: dragContextDropZoneElementRecordId }));
      return () => {
        dispatch(dropzoneLeave({ elementRecordId: dragContextDropZoneElementRecordId }));
      };
    }
  }, [dispatch, dragContextDropZoneElementRecordId, dragContextDropZoneIceId]);

  const draggableItemElemRecId =
    state.draggable && Object.entries(state.draggable).find(([, ice]) => ice !== false)?.[0];

  const hasZoneMarker =
    [
      EditingStatus.SORTING_COMPONENT,
      EditingStatus.PLACING_NEW_COMPONENT,
      EditingStatus.PLACING_DETACHED_COMPONENT
    ].includes(status) &&
    state.dragContext.inZone &&
    !state.dragContext.invalidDrop;

  const isMoveMode = HighlightMode.MOVE_TARGETS === highlightMode;
  const isFieldSelectedMode = status === EditingStatus.FIELD_SELECTED;

  return (
    <GuestContextProvider value={context}>
      {children}
      <ThemeProvider theme={theme}>
        {editMode && (
          <CrafterCMSPortal>
            {/* region DraggedElementGhost */}
            {draggableItemElemRecId && (
              <DragGhostElement
                sx={sxStylesConfig.ghostElement}
                label={elementRegistry.get(parseInt(draggableItemElemRecId))?.label}
              />
            )}
            {/* endregion */}
            {/* region AssetUploaderMask */}
            {Object.values(state.uploading).map((highlight: HighlightData) => (
              <AssetUploaderMask key={highlight.id} {...highlight} />
            ))}
            {/* endregion */}
            {/* region fieldSwitcher */}
            {state.fieldSwitcher && (
              <FieldInstanceSwitcher
                onNext={() => dispatch(contentTreeSwitchFieldInstance({ type: 'next', scrollElement }))}
                onPrev={() => dispatch(contentTreeSwitchFieldInstance({ type: 'prev', scrollElement }))}
                registryEntryIds={state.fieldSwitcher.registryEntryIds}
                currentElement={state.fieldSwitcher.currentElement}
              />
            )}
            {/* endregion */}
            {/* region ZoneMarker */}
            {Object.values(state.highlighted).map((highlight: HighlightData) => {
              const validations = Object.values(highlight.validations);
              const hasValidations = Boolean(validations.length);
              const hasFailedRequired = validations.some(({ level }) => level === 'required');
              const elementRecord = elementRegistry.get(highlight.id);
              const { isLocked, isExternallyModified, path } = checkIfLockedOrModified(state, elementRecord);
              return (
                <ZoneMarker
                  key={highlight.id}
                  label={highlight.label}
                  rect={highlight.rect}
                  inherited={highlight.inherited}
                  lockInfo={state.lockedPaths[path]?.user}
                  isStale={isExternallyModified}
                  onPopperClick={
                    isMoveMode && isFieldSelectedMode
                      ? (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }
                      : null
                  }
                  menuItems={
                    isFieldSelectedMode && !isExternallyModified ? (
                      <ZoneMenu
                        record={elementRecord}
                        dispatch={dispatch}
                        isHeadlessMode={isHeadlessMode}
                        isLockedItem={isLocked}
                      />
                    ) : (
                      void 0
                    )
                  }
                  sx={deepmerge(
                    deepmerge(
                      sxStylesConfig.zoneMarker.base,
                      isMoveMode
                        ? sxStylesConfig.zoneMarker.moveModeHighlight
                        : sxStylesConfig.zoneMarker.selectModeHighlight,
                      { clone: true }
                    ),
                    hasValidations || isLocked || isExternallyModified
                      ? hasFailedRequired || isExternallyModified
                        ? sxStylesConfig.zoneMarker.errorHighlight
                        : sxStylesConfig.zoneMarker.warnHighlight
                      : null,
                    { clone: true }
                  )}
                />
              );
            })}
            {/* endregion */}
            {/* region DropMarker */}
            {hasZoneMarker && (
              <DropMarker
                onDropPosition={(payload) => dispatch(setDropPosition(payload))}
                dropZone={state.dragContext.dropZone}
                over={state.dragContext.over}
                prev={state.dragContext.prev}
                next={state.dragContext.next}
                coordinates={state.dragContext.coordinates}
                sx={deepmerge(
                  sxStylesConfig.dropMarker.base,
                  isMoveMode
                    ? sxStylesConfig.dropMarker.moveModeHighlight
                    : sxStylesConfig.dropMarker.selectModeHighlight,
                  { clone: true }
                )}
              />
            )}
            {/* endregion */}
          </CrafterCMSPortal>
        )}
        <Snackbar open={Boolean(snack)} onClose={() => setSnack(null)} {...snack} />
        <GuestGlobalStyles styles={globalStyleOverrides} />
      </ThemeProvider>
    </GuestContextProvider>
  );
}

export function ExperienceBuilder(props: GenericXBProps<{ model: ContentInstance }>): JSX.Element;
export function ExperienceBuilder(props: GenericXBProps<{ path: string }>): JSX.Element;
export function ExperienceBuilder(props: ExperienceBuilderProps): JSX.Element {
  let { children, isAuthoring = false, path, model } = props as CompleteGuestProps;
  let store = useMemo(() => isAuthoring && createGuestStore(), [isAuthoring]);
  path = path || prop(model, 'path');
  return isAuthoring && path ? (
    <Provider store={store} context={GuestReduxContext}>
      <ExperienceBuilderInternal {...props} path={path} />
    </Provider>
  ) : (
    (children as JSX.Element)
  );
}

export default ExperienceBuilder;
