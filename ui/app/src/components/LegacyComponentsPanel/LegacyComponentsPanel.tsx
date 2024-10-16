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

import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import SystemIcon, { SystemIconDescriptor } from '../SystemIcon';
import ListItemText from '@mui/material/ListItemText';
import { usePossibleTranslation } from '../../hooks/usePossibleTranslation';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import React, { useCallback, useEffect, useState } from 'react';
import Switch from '@mui/material/Switch';
import { fetchConfigurationJSON } from '../../services/configuration';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { usePreviewState } from '../../hooks/usePreviewState';
import { getGuestToHostBus, getHostToGuestBus } from '../../utils/subjects';
import { getStoredLegacyComponentPanel, setStoredLegacyComponentPanel } from '../../utils/state';
import { useActiveUser } from '../../hooks/useActiveUser';
import { useEditMode } from '../../hooks/useEditMode';
import { useIntl } from 'react-intl';
import { translations } from './translations';
import BrowseFilesDialog from '../BrowseFilesDialog';
import { MediaItem } from '../../models/Search';
import { deleteItem, fetchContentDOM, fetchLegacyItem, sortItem } from '../../services/content';
import { useDispatch } from 'react-redux';
import { showConfirmDialog, showEditDialog } from '../../state/actions/dialogs';
import { dragAndDropMessages } from '../../env/i18n-legacy';
import { fetchAndInsertContentInstance, legacyLoadFormDefinition, legacyXmlModelToMap } from './utils';
import LookupTable from '../../models/LookupTable';
import { getPathFromPreviewURL } from '../../utils/path';
import { useContentTypes } from '../../hooks/useContentTypes';
import { filter } from 'rxjs/operators';
import { showSystemNotification } from '../../state/actions/system';
import { nou } from '../../utils/object';
import { forEach } from '../../utils/array';
import { useEnv } from '../../hooks/useEnv';
import { createCustomDocumentEventListener } from '../../utils/dom';
import { guestMessages } from '../../assets/guestMessages';
import { useEnhancedDialogState } from '../../hooks/useEnhancedDialogState';

export interface LegacyComponentsPanelProps {
  title: string;
  icon: SystemIconDescriptor;
}

interface Browse {
  label: string;
  path: string;
}

interface Components {
  label: string;
  component: {
    label: string;
    type: string;
  };
}

interface ComponentDropProps {
  type: string;
  path: string;
  isNew: boolean | 'existing';
  trackingNumber: string;
  zones: LookupTable<Array<{ key: string } | string>>;
  compPath: string;
  conComp: boolean;
  datasource: string;
  isInsert: boolean;
}

export function LegacyComponentsPanel(props: LegacyComponentsPanelProps) {
  const { title, icon } = props;
  const siteId = useActiveSiteId();
  const user = useActiveUser();
  const [open, setOpen] = useState(false);
  const hostToGuest$ = getHostToGuestBus();
  const guestToHost$ = getGuestToHostBus();
  const editMode = useEditMode();
  const [config, setConfig] = useState<{ browse: Browse[]; components: Components[] }>(null);
  const contentTypesLookup = useContentTypes();
  const { guest } = usePreviewState();
  const guestPath = guest?.path;
  const { formatMessage } = useIntl();
  const [browsePath, setBrowsePath] = useState(null);
  const dispatch = useDispatch();
  const { authoringBase, activeEnvironment } = useEnv();
  const [legacyContentModel, setLegacyContentModel] = useState(null);
  const browseFilesDialogState = useEnhancedDialogState();

  const startDnD = useCallback(
    (path?: string) => {
      fetchContentDOM(siteId, path ? path : guestPath).subscribe((content) => {
        let contentModel = legacyXmlModelToMap(content.documentElement);
        setLegacyContentModel(contentModel);
        hostToGuest$.next({
          type: 'START_DRAG_AND_DROP',
          payload: {
            browse: config.browse,
            components: config.components,
            contentModel,
            translation: {
              addComponent: formatMessage(translations.addComponent),
              components: formatMessage(translations.components),
              done: formatMessage(translations.done)
            }
          }
        });
      });
    },
    [siteId, guestPath, hostToGuest$, config, formatMessage]
  );

  const onComponentDelete = useCallback(
    (props: Partial<ComponentDropProps>) => {
      const { zones, compPath } = props;
      // compPath is the parent path
      fetchContentDOM(siteId, compPath ? compPath : guestPath).subscribe((content) => {
        let contentModel = legacyXmlModelToMap(content.documentElement);
        let fieldId = Object.keys(zones)[0];
        let index = null;
        let indexByKey = {};
        zones[fieldId].forEach((item, i) => {
          indexByKey[(item as { key: string }).key] = i;
        });
        contentModel[fieldId].forEach((item, i) => {
          if (nou(indexByKey[item.key]) && index === null) {
            index = i;
          }
        });

        deleteItem(siteId, null, fieldId, index, compPath ? compPath : guestPath).subscribe(() => {
          dispatch(
            showSystemNotification({
              message: formatMessage(guestMessages.deleteOperationComplete)
            })
          );
        });
      });
    },
    [dispatch, formatMessage, guestPath, siteId]
  );

  const onComponentDrop = useCallback(
    (props: ComponentDropProps) => {
      const { type, path, isNew, trackingNumber, zones, compPath, datasource, isInsert } = props;
      // path is the component path(shared component) and conComp is the parent path
      // if isNew is false it means it is a sort, if it is new it means it a dnd for new component
      // if is 'existing' it means it is a browse component
      let zonesKeys = Object.keys(zones);
      let fieldId = zonesKeys[0];
      let zone = zones[fieldId];
      const parentPath = compPath ?? guestPath;
      const parentModelId = guest?.modelIdByPath[parentPath];
      const model = guest?.models[parentModelId];
      const parentContentTypeId = model?.craftercms.contentTypeId;

      if (isNew) {
        if (isNew === true) {
          if (!path) {
            // region embedded component
            let index = 0;
            zone.forEach((zone, i) => {
              if (zone === trackingNumber) {
                index = i;
              }
            });
            const editDialogSuccess = 'editDialogSuccess';
            const editDialogCancel = 'editDialogCancel';
            dispatch(
              showEditDialog({
                site: siteId,
                authoringBase,
                path: compPath ? compPath : guestPath,
                isHidden: true,
                newEmbedded: {
                  contentType: type,
                  index,
                  fieldId,
                  datasource
                },
                onSaveSuccess: {
                  type: 'DISPATCH_DOM_EVENT',
                  payload: { id: editDialogSuccess }
                },
                onClosed: {
                  type: 'BATCH_ACTIONS',
                  payload: [
                    {
                      type: 'DISPATCH_DOM_EVENT',
                      payload: { id: editDialogCancel }
                    },
                    {
                      type: 'EDIT_DIALOG_CLOSED'
                    }
                  ]
                }
              })
            );
            let unsubscribe, cancelUnsubscribe;

            unsubscribe = createCustomDocumentEventListener(editDialogSuccess, (response) => {
              dispatch(
                showSystemNotification({
                  message: formatMessage(guestMessages.insertOperationComplete)
                })
              );
              hostToGuest$.next({
                type: 'REFRESH_PREVIEW'
              });
              cancelUnsubscribe();
            });

            cancelUnsubscribe = createCustomDocumentEventListener(editDialogCancel, () => {
              hostToGuest$.next({
                type: 'REFRESH_PREVIEW'
              });
              unsubscribe();
            });
            // endregion
          } else {
            // region shared component
            let index = 0;
            const editDialogSuccess = 'editDialogSuccess';
            const editDialogCancel = 'editDialogCancel';
            dispatch(
              showEditDialog({
                authoringBase,
                path,
                contentTypeId: type,
                isNewContent: true,
                onSaveSuccess: {
                  type: 'DISPATCH_DOM_EVENT',
                  payload: { id: editDialogSuccess }
                },
                onClosed: {
                  type: 'BATCH_ACTIONS',
                  payload: [
                    {
                      type: 'DISPATCH_DOM_EVENT',
                      payload: { id: editDialogCancel }
                    },
                    {
                      type: 'EDIT_DIALOG_CLOSED'
                    }
                  ]
                }
              })
            );
            let unsubscribe, cancelUnsubscribe;

            unsubscribe = createCustomDocumentEventListener(editDialogSuccess, (response) => {
              zone.forEach((zone, i) => {
                if (zone === trackingNumber) {
                  index = i;
                }
              });
              fetchAndInsertContentInstance(
                siteId,
                parentPath,
                response.item.uri,
                fieldId,
                index,
                datasource,
                contentTypesLookup,
                parentModelId,
                parentContentTypeId
              ).subscribe(() => {
                dispatch(
                  showSystemNotification({
                    message: formatMessage(guestMessages.insertOperationComplete)
                  })
                );
                hostToGuest$.next({
                  type: 'REFRESH_PREVIEW'
                });
              });
              cancelUnsubscribe();
            });

            cancelUnsubscribe = createCustomDocumentEventListener(editDialogCancel, () => {
              hostToGuest$.next({
                type: 'REFRESH_PREVIEW'
              });
              unsubscribe();
            });
            // endregion
          }
        } else {
          // region browse component
          let index = 0;

          forEach(zone, (item, i) => {
            if (item === trackingNumber) {
              index = i;
              return 'break';
            }
          });

          fetchAndInsertContentInstance(
            siteId,
            parentPath,
            path,
            fieldId,
            index,
            datasource,
            contentTypesLookup,
            parentModelId,
            parentContentTypeId
          ).subscribe(() => {
            dispatch(
              showSystemNotification({
                message: formatMessage(guestMessages.insertOperationComplete)
              })
            );
            hostToGuest$.next({
              type: 'REFRESH_PREVIEW'
            });
          });
          // endregion
        }
      } else {
        // region sort/move components
        fetchContentDOM(siteId, compPath ? compPath : guestPath).subscribe((content) => {
          let contentModel = legacyXmlModelToMap(content.documentElement);
          let contentModelZone = contentModel[fieldId];

          if (isInsert) {
            // region insert
            let index = 0;
            let indexByKey = {};

            if (contentModelZone) {
              contentModelZone.forEach((item, i) => {
                indexByKey[item.key] = i;
              });
              forEach(zone as { key: string }[], (item, i) => {
                if (!indexByKey[item.key]) {
                  index = 1;
                  return 'break';
                }
              });
            }

            fetchAndInsertContentInstance(
              siteId,
              parentPath,
              path,
              fieldId,
              index,
              datasource,
              contentTypesLookup,
              parentModelId,
              parentContentTypeId
            ).subscribe(() => {
              dispatch(
                showSystemNotification({
                  message: formatMessage(guestMessages.moveOperationComplete)
                })
              );
            });
            // endregion
          } else {
            if (zones[fieldId].length === contentModel[fieldId].length) {
              // region sort
              let currentIndex = null;
              let targetIndex = null;
              let indexByKey = {};

              contentModelZone.forEach((item, i) => {
                indexByKey[item.key] = i;
              });

              forEach(zone as { key: string }[], (item, i) => {
                if (indexByKey[item.key] !== i && currentIndex === null) {
                  currentIndex = indexByKey[item.key];
                  targetIndex = i;
                  return 'break';
                }
              });

              sortItem(siteId, null, fieldId, currentIndex, targetIndex, compPath ? compPath : guestPath).subscribe(
                () => {
                  dispatch(
                    showSystemNotification({
                      message: formatMessage(guestMessages.sortOperationComplete)
                    })
                  );
                }
              );
              // endregion
            } else {
              // region delete
              let index = null;
              let indexByKey = {};

              zone.forEach((item, i) => {
                indexByKey[(item as { key: string }).key] = i;
              });

              forEach(contentModelZone, (item, i) => {
                if (indexByKey[item.key] === undefined && index === null) {
                  index = i;
                  return 'break';
                }
              });
              deleteItem(siteId, null, fieldId, index, compPath ? compPath : guestPath).subscribe(() => {});
              // endregion
            }
          }
        });
        // endregion
      }
    },
    [
      authoringBase,
      contentTypesLookup,
      dispatch,
      formatMessage,
      guestPath,
      hostToGuest$,
      siteId,
      guest?.modelIdByPath,
      guest?.models
    ]
  );

  useEffect(() => {
    fetchConfigurationJSON(siteId, '/preview-tools/components-config.xml', 'studio', activeEnvironment).subscribe(
      (dom) => {
        let config = {
          browse: [],
          components: []
        };
        if (dom.config.browse) {
          config.browse = Array.isArray(dom.config.browse) ? dom.config.browse : [dom.config.browse];
        }
        if (dom.config.category) {
          config.components = Array.isArray(dom.config.category)
            ? dom.config.category.map(({ component, label }) => ({
                components: component,
                label
              }))
            : [
                {
                  components: dom.config.category.component,
                  label: dom.config.category.label
                }
              ];
        }
        setConfig(config);
      }
    );
  }, [siteId, activeEnvironment]);

  useEffect(() => {
    if (!editMode && open) {
      hostToGuest$.next({
        type: 'DND_COMPONENTS_PANEL_OFF'
      });
    }
  }, [editMode, hostToGuest$, open]);

  useEffect(() => {
    const guestToHostSubscription = guestToHost$
      .pipe(filter((action) => action.type === 'GUEST_SITE_LOAD'))
      .subscribe(({ payload }) => {
        const { open } = (getStoredLegacyComponentPanel(user.username) as { open: boolean }) ?? { open: false };
        const path = getPathFromPreviewURL(payload.url);
        if (config !== null && open) {
          startDnD(path);
        }
      });
    return () => {
      guestToHostSubscription.unsubscribe();
    };
  }, [config, guestPath, guestToHost$, startDnD, user.username]);

  // region subscriptions
  useEffect(() => {
    const guestToHostSubscription = guestToHost$.subscribe((action) => {
      const { type, payload } = action;
      switch (type) {
        case 'DRAG_AND_DROP_COMPONENTS_PANEL_CLOSED': {
          if (editMode) {
            getHostToGuestBus().next({
              type: 'ICE_TOOLS_ON'
            });
          }
          break;
        }
        case 'SET_SESSION_STORAGE_ITEM': {
          if (payload['key'] === 'components-on') {
            let value = payload['value'] === 'true';
            setStoredLegacyComponentPanel({ open: value }, user.username);
            setOpen(value);
          }
          break;
        }
        case 'REQUEST_SESSION_STORAGE_ITEM': {
          if (payload.includes('pto-on') || payload.includes('ice-on')) {
            hostToGuest$.next({
              type: 'REQUEST_SESSION_STORAGE_ITEM_REPLY',
              payload: Array.isArray(payload)
                ? { 'ice-on': editMode ? 'on' : null, ptoOn: open ? 'on' : null }
                : { key: 'pto-on', value: open ? 'on' : null }
            });
          }
          break;
        }
        case 'OPEN_BROWSE': {
          setBrowsePath(payload.path);
          browseFilesDialogState.onOpen();
          break;
        }
        case 'START_DIALOG': {
          const { messageKey, message } = payload;
          dispatch(
            showConfirmDialog({
              body: messageKey ? formatMessage(dragAndDropMessages[messageKey]) : message
            })
          );
          break;
        }
        case 'REQUEST_FORM_DEFINITION': {
          const { contentType } = payload;
          legacyLoadFormDefinition(siteId, contentType).subscribe((config) => {
            hostToGuest$.next({
              type: 'REQUEST_FORM_DEFINITION_RESPONSE',
              payload: config
            });
          });
          break;
        }
        case 'COMPONENT_DROPPED': {
          onComponentDrop(payload);
          break;
        }
        case 'SAVE_DRAG_AND_DROP': {
          onComponentDelete(payload);
          break;
        }
        case 'LOAD_MODEL_REQUEST': {
          if (payload.aNotFound) {
            fetchContentDOM(siteId, payload.aNotFound.path).subscribe((content) => {
              let contentModel = legacyXmlModelToMap(content.documentElement);
              hostToGuest$.next({
                type: 'DND_COMPONENTS_MODEL_LOAD',
                payload: contentModel
              });
            });
          }
          break;
        }
        default:
          break;
      }
    });
    return () => {
      guestToHostSubscription.unsubscribe();
    };
  }, [
    dispatch,
    editMode,
    formatMessage,
    guestToHost$,
    hostToGuest$,
    onComponentDelete,
    onComponentDrop,
    open,
    siteId,
    user.username,
    browseFilesDialogState
  ]);
  // endregion

  const onOpenComponentsMenu = () => {
    if (!open) {
      startDnD();
    } else {
      hostToGuest$.next({
        type: 'DND_COMPONENTS_PANEL_OFF'
      });
    }
  };

  const onBrowseDialogClosed = () => {
    setBrowsePath(null);
  };

  const onBrowseDialogItemSelected = (item: MediaItem) => {
    browseFilesDialogState.onClose();
    fetchLegacyItem(siteId, item.path).subscribe((legacyItem) => {
      hostToGuest$.next({
        type: 'DND_CREATE_BROWSE_COMP',
        payload: {
          component: legacyItem,
          initialContentModel: legacyContentModel
        }
      });
    });
  };

  return (
    <>
      <ListItem component="div">
        <ListItemIcon>
          <SystemIcon icon={icon} fontIconProps={{ fontSize: 'small' }} />
        </ListItemIcon>
        <ListItemText
          primary={usePossibleTranslation(title)}
          primaryTypographyProps={{ noWrap: true }}
          secondaryTypographyProps={{ noWrap: true }}
        />
        <ListItemSecondaryAction style={{ right: '5px' }}>
          <Switch color="primary" checked={open} onClick={onOpenComponentsMenu} />
        </ListItemSecondaryAction>
      </ListItem>
      <BrowseFilesDialog
        open={browseFilesDialogState.open}
        path={browsePath}
        onClose={browseFilesDialogState.onClose}
        onClosed={onBrowseDialogClosed}
        onSuccess={onBrowseDialogItemSelected}
        hasPendingChanges={browseFilesDialogState.hasPendingChanges}
        isMinimized={browseFilesDialogState.isMinimized}
        isSubmitting={browseFilesDialogState.isSubmitting}
      />
    </>
  );
}

export default LegacyComponentsPanel;
