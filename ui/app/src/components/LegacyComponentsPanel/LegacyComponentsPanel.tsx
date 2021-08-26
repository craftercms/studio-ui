/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import SystemIcon, { SystemIconDescriptor } from '../SystemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { usePossibleTranslation } from '../../utils/hooks/usePossibleTranslation';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import React, { useCallback, useEffect, useState } from 'react';
import Switch from '@material-ui/core/Switch';
import { fetchConfigurationJSON } from '../../services/configuration';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { usePreviewState } from '../../utils/hooks/usePreviewState';
import { getGuestToHostBus, getHostToGuestBus } from '../../modules/Preview/previewContext';
import { getStoredLegacyComponentPanel, setStoredLegacyComponentPanel } from '../../utils/state';
import { useActiveUser } from '../../utils/hooks/useActiveUser';
import { useEditMode } from '../../utils/hooks/useEditMode';
import { useIntl } from 'react-intl';
import { translations } from './translations';
import BrowseFilesDialog from '../BrowseFilesDialog';
import { MediaItem } from '../../models/Search';
import {
  deleteItem,
  fetchContentDOM,
  fetchContentInstance,
  fetchLegacyItem,
  insertInstance,
  sortItem
} from '../../services/content';
import { useDispatch } from 'react-redux';
import { showConfirmDialog } from '../../state/actions/dialogs';
import { dragAndDropMessages } from '../../utils/i18n-legacy';
import { LegacyLoadFormDefinition, legacyXmlModelToMap } from './utils';
import LookupTable from '../../models/LookupTable';
import { getPathFromPreviewURL } from '../../utils/path';
import { useContentTypes } from '../../utils/hooks/useContentTypes';
import { filter, switchMap } from 'rxjs/operators';
import { showSystemNotification } from '../../state/actions/system';
import { guestMessages } from '../../modules/Preview/PreviewConcierge';
import { nou } from '../../utils/object';

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
  zones: LookupTable<Array<any>>;
  compPath: string;
  conComp: boolean;
  datasource: string;
}

export default function LegacyComponentsPanel(props: LegacyComponentsPanelProps) {
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
  const [legacyContentModel, setLegacyContentModel] = useState(null);

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
      const { isNew, zones, compPath, conComp } = props;
      fetchContentDOM(siteId, guestPath).subscribe((content) => {
        let contentModel = legacyXmlModelToMap(content.documentElement);
        let fieldId = Object.keys(zones)[0];
        let index = null;
        let indexByKey = {};
        zones[fieldId].forEach((item, i) => {
          indexByKey[item.key] = i;
        });
        contentModel[fieldId].forEach((item, i) => {
          if (nou(indexByKey[item.key]) && index === null) {
            index = i;
          }
        });

        deleteItem(siteId, compPath ? compPath : guestPath, fieldId, index).subscribe(() => {
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
      const { type, path, isNew, trackingNumber, zones, compPath, conComp, datasource } = props;
      // if isNew is false it means it is a sort, if it is new it means it a dnd for new component
      // if is 'existing' it means it is a browse component

      if (isNew) {
        if (isNew === true) {
          if (!path) {
            // embeddedComponent
          } else {
            // sharedComponent
          }
        } else {
          // Browse component
          let fieldId;
          let index;

          Object.keys(zones).forEach((key) => {
            zones[key].forEach((zone, i) => {
              if (zone === trackingNumber) {
                fieldId = key;
                index = i;
              }
            });
          });

          fetchContentInstance(siteId, path, contentTypesLookup)
            .pipe(
              switchMap((contentInstance) =>
                insertInstance(
                  siteId,
                  compPath ? compPath : guestPath,
                  fieldId,
                  index,
                  contentInstance,
                  null,
                  datasource
                )
              )
            )
            .subscribe(() => {
              dispatch(
                showSystemNotification({
                  message: formatMessage(guestMessages.insertOperationComplete)
                })
              );
              hostToGuest$.next({
                type: 'REFRESH_PREVIEW'
              });
            });
        }
      } else {
        fetchContentDOM(siteId, guestPath).subscribe((content) => {
          let contentModel = legacyXmlModelToMap(content.documentElement);
          let zonesKeys = Object.keys(zones);
          if (zonesKeys.length === 1) {
            let fieldId = zonesKeys[0];
            let currentIndex = null;
            let targetIndex = null;
            let indexByKey = {};
            contentModel[fieldId].forEach((item, i) => {
              indexByKey[item.key] = i;
            });
            zones[fieldId].forEach((item, i) => {
              if (indexByKey[item.key] !== i && currentIndex === null) {
                currentIndex = indexByKey[item.key];
                targetIndex = i;
              }
            });
            sortItem(siteId, compPath ? compPath : guestPath, fieldId, currentIndex, targetIndex).subscribe(() => {
              dispatch(
                showSystemNotification({
                  message: formatMessage(guestMessages.sortOperationComplete)
                })
              );
            });
          }
        });
      }
    },
    [contentTypesLookup, dispatch, formatMessage, guestPath, hostToGuest$, siteId]
  );

  useEffect(() => {
    fetchConfigurationJSON(siteId, '/preview-tools/components-config.xml', 'studio').subscribe((dom) => {
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
    });
  }, [siteId]);

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
        case 'SET_SESSION_STORAGE_ITEM': {
          if (payload['key'] === 'components-on') {
            let value = payload['value'] === 'true';
            setStoredLegacyComponentPanel({ open: value }, user.username);
            if (!value && editMode) {
              getHostToGuestBus().next({ type: 'ICE_TOOLS_ON' });
              // TODO: Review this
              setTimeout(() => {
                getHostToGuestBus().next({ type: 'REPAINT_PENCILS' });
              }, 1000);
            }
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
          LegacyLoadFormDefinition(siteId, contentType).subscribe((config) => {
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
    user.username
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

  const onCloseBrowseDialog = () => {
    setBrowsePath(null);
  };

  const onBrowseDialogItemSelected = (item: MediaItem) => {
    setBrowsePath(null);
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
      <ListItem ContainerComponent="div">
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
        open={Boolean(browsePath)}
        path={browsePath}
        onClose={onCloseBrowseDialog}
        onSuccess={onBrowseDialogItemSelected}
      />
    </>
  );
}
