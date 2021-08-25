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
import { useSelection } from '../../utils/hooks/useSelection';
import { usePreviewState } from '../../utils/hooks/usePreviewState';
import { getGuestToHostBus, getHostToGuestBus } from '../../modules/Preview/previewContext';
import { getStoredLegacyComponentPanel, setStoredLegacyComponentPanel } from '../../utils/state';
import { useActiveUser } from '../../utils/hooks/useActiveUser';
import { useEditMode } from '../../utils/hooks/useEditMode';
import { useIntl } from 'react-intl';
import { translations } from './translations';
import BrowseFilesDialog from '../BrowseFilesDialog';
import { MediaItem } from '../../models/Search';

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

export default function LegacyComponentsPanel(props: LegacyComponentsPanelProps) {
  const { title, icon } = props;
  const siteId = useActiveSiteId();
  const user = useActiveUser();
  const [open, setOpen] = useState(false);
  const hostToGuest$ = getHostToGuestBus();
  const guestToHost$ = getGuestToHostBus();
  const editMode = useEditMode();
  const [config, setConfig] = useState<{ browse: Browse[]; components: Components[] }>(null);
  const { guest } = usePreviewState();
  const { models, modelId } = guest ?? {};
  const model = models?.[modelId];
  const contentTypesBranch = useSelection((state) => state.contentTypes);
  let contentType = model ? contentTypesBranch.byId[model.craftercms.contentTypeId] : null;
  const { formatMessage } = useIntl();
  const [browsePath, setBrowsePath] = useState(null);

  const startDnD = useCallback(() => {
    hostToGuest$.next({
      type: 'START_DRAG_AND_DROP',
      payload: {
        browse: config.browse,
        components: config.components,
        contentModel: contentType,
        translation: {
          addComponent: formatMessage(translations.addComponent),
          components: formatMessage(translations.components),
          done: formatMessage(translations.done)
        }
      }
    });
  }, [config, contentType, formatMessage, hostToGuest$]);

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
    const { open } = (getStoredLegacyComponentPanel(user.username) as { open: boolean }) ?? { open: false };
    if (config !== null && open) {
      startDnD();
    }
  }, [config, startDnD, user.username]);

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
        default:
          break;
      }
    });
    return () => {
      guestToHostSubscription.unsubscribe();
    };
  }, [editMode, guestToHost$, hostToGuest$, open, user.username]);
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
