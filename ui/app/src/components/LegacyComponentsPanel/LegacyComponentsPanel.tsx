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
import React, { useEffect, useState } from 'react';
import Switch from '@material-ui/core/Switch';
import { getHostToGuestBus } from '../../modules/Preview/previewContext';
import { fetchConfigurationJSON } from '../../services/configuration';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { useSelection } from '../../utils/hooks/useSelection';
import { usePreviewState } from '../../utils/hooks/usePreviewState';

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
  const [open, setOpen] = useState(false);
  const hostToGuest$ = getHostToGuestBus();
  const [config, setConfig] = useState<{ browse: Browse[]; components: Components[] }>(null);
  const { guest } = usePreviewState();
  const { models, modelId } = guest ?? {};
  const model = models?.[modelId];
  const contentTypesBranch = useSelection((state) => state.contentTypes);
  let contentType = model ? contentTypesBranch.byId[model.craftercms.contentTypeId] : null;

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

  const onOpenComponentsMenu = () => {
    setOpen(!open);
    if (!open) {
      hostToGuest$.next({
        type: 'START_DRAG_AND_DROP',
        payload: {
          browse: config.browse,
          components: config.components,
          contentModel: contentType,
          translation: {
            addComponent: 'Add Component',
            components: 'Components',
            done: 'done'
          }
        }
      });
    } else {
      hostToGuest$.next({
        type: 'STOP_DRAG_AND_DROP'
      });
    }
  };

  return (
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
  );
}
