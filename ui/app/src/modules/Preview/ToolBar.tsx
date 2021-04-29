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

import React from 'react';
import ViewToolbar from '../../components/ViewToolbar';
import LauncherOpenerButton from '../../components/LauncherOpenerButton';
import {
  changeCurrentUrl,
  closeTools,
  openTools,
  RELOAD_REQUEST,
  setPreviewEditMode
} from '../../state/actions/preview';
import { useDispatch } from 'react-redux';
import {
  useActiveSiteId,
  useEnv,
  useItemsByPath,
  usePreviewGuest,
  usePreviewState,
  useSelection,
  useSiteList
} from '../../utils/hooks';
import { getHostToGuestBus } from './previewContext';
import { defineMessages, useIntl } from 'react-intl';
import QuickCreate from './QuickCreate';
import { changeSite } from '../../state/reducers/sites';
import Tooltip from '@material-ui/core/Tooltip';
import { setSiteCookie } from '../../utils/auth';
import LogoAndMenuBundleButton from '../../components/LogoAndMenuBundleButton';
import { getSystemLink } from '../../components/LauncherSection';
import { hasCreateAction, hasEditAction } from '../../utils/content';
import { PublishingStatusButton } from '../../components/PublishingStatusButton';
import EditModeSwitch from '../../components/EditModeSwitch';
import { AddressBar } from '../../components/PreviewAddressBar/PreviewAddressBar';
import SiteSwitcherSelect, { useSiteSwitcherMinimalistStyles } from '../../components/SiteSwitcherSelect';
import { isBlank } from '../../utils/string';

const translations = defineMessages({
  openToolsPanel: {
    id: 'openToolsPanel.label',
    defaultMessage: 'Open tools panel'
  },
  toggleEditMode: {
    id: 'previewToolbar.toggleEditMode',
    defaultMessage: 'Toggle edit mode'
  },
  toggleSidebarTooltip: {
    id: 'common.toggleSidebarTooltip',
    defaultMessage: 'Toggle sidebar'
  },
  itemMenu: {
    id: 'previewToolbar.itemMenu',
    defaultMessage: 'Item menu'
  }
});

export default function ToolBar() {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const site = useActiveSiteId();
  const editMode = useSelection((state) => state.preview.editMode);
  const sites = useSiteList();
  const { computedUrl, showToolsPanel } = usePreviewState();
  const guest = usePreviewGuest();
  const modelId = guest?.modelId;
  const models = guest?.models;
  const items = useItemsByPath();
  const item = items?.[models?.[modelId]?.craftercms.path];
  const { previewChoice } = usePreviewState();
  const { authoringBase } = useEnv();
  const write = hasEditAction(item?.availableActions);
  const createContent = hasCreateAction(item?.availableActions);
  const classes = useSiteSwitcherMinimalistStyles();

  const onSiteChange = ({ target: { value } }) => {
    if (!isBlank(value) && site !== value) {
      if (previewChoice[value] === '2') {
        dispatch(changeSite(value));
      } else {
        setSiteCookie(value);
        setTimeout(
          () =>
            (window.location.href = getSystemLink({
              site: value,
              systemLinkId: 'preview',
              previewChoice,
              authoringBase
            }))
        );
      }
    }
  };

  return (
    <ViewToolbar>
      <section>
        <Tooltip title={formatMessage(translations.toggleSidebarTooltip)}>
          <LogoAndMenuBundleButton
            aria-label={formatMessage(translations.openToolsPanel)}
            onClick={() => dispatch(showToolsPanel ? closeTools() : openTools())}
          />
        </Tooltip>
        <SiteSwitcherSelect
          value={site}
          sites={sites}
          displayEmpty
          variant="standard"
          className={classes.menuRoot}
          style={{ marginRight: 5 }}
          onChange={onSiteChange}
          classes={{
            select: classes.input,
            selectMenu: classes.menu,
            menuItem: classes.menuItem
          }}
        />
        <QuickCreate disabled={!createContent} />
      </section>
      <section>
        <AddressBar
          site={site ?? ''}
          url={computedUrl}
          item={item}
          onUrlChange={(url) => dispatch(changeCurrentUrl(url))}
          onRefresh={() => getHostToGuestBus().next({ type: RELOAD_REQUEST })}
        />
      </section>
      <section>
        <Tooltip title={!write ? '' : formatMessage(translations.toggleEditMode)}>
          <EditModeSwitch
            disabled={!write}
            color="default"
            checked={editMode}
            onChange={(e) => {
              dispatch(setPreviewEditMode({ editMode: e.target.checked }));
            }}
          />
        </Tooltip>
        <PublishingStatusButton variant="icon" />
        <LauncherOpenerButton sitesRailPosition="left" icon="apps" />
      </section>
    </ViewToolbar>
  );
}
