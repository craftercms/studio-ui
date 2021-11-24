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

import * as React from 'react';
import { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { initIcePanelConfig, updateIcePanelWidth } from '../../state/actions/preview';
import LoadingState, { ConditionalLoadingState } from '../LoadingState/LoadingState';
import { useSelection } from '../../hooks/useSelection';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { useActiveUser } from '../../hooks/useActiveUser';
import { useSiteUIConfig } from '../../hooks/useSiteUIConfig';
import { renderWidgets } from '../Widget';
import ResizeableDrawer from '../ResizeableDrawer/ResizeableDrawer';
import { usePreviewState } from '../../hooks/usePreviewState';
import EmptyState from '../EmptyState/EmptyState';
import { FormattedMessage } from 'react-intl';
import { nnou } from '../../utils/object';
import { getComputedEditMode } from '../../utils/content';
import { useCurrentPreviewItem } from '../../hooks/useCurrentPreviewItem';
import {
  getStoredICEToolsPanelPage,
  getStoredICEToolsPanelWidth,
  setStoredICEToolsPanelWidth
} from '../../utils/state';
import { useActiveSite } from '../../hooks';

export function ICEToolsPanel() {
  const dispatch = useDispatch();
  const uiConfig = useSiteUIConfig();
  const { icePanel } = usePreviewState();
  const { id: site, uuid } = useActiveSite();
  const { rolesBySite, username } = useActiveUser();
  const { icePanelWidth: width, editMode, icePanelStack } = useSelection((state) => state.preview);
  const item = useCurrentPreviewItem();
  const isOpen = getComputedEditMode({ item, editMode, username });

  const onWidthChange = (width) => {
    setStoredICEToolsPanelWidth(site, username, width);
    dispatch(updateIcePanelWidth({ width }));
  };

  useEffect(() => {
    if (nnou(uiConfig.xml) && !icePanel) {
      const icePanelWidth = getStoredICEToolsPanelWidth(site, username);
      const storedPage = getStoredICEToolsPanelPage(uuid, username);
      dispatch(initIcePanelConfig({ configXml: uiConfig.xml, storedPage, icePanelWidth }));
    }
  }, [uiConfig.xml, dispatch, icePanel, site, username]);

  return (
    <ResizeableDrawer open={isOpen} belowToolbar anchor="right" width={width} onWidthChange={onWidthChange}>
      <Suspense fallback={<LoadingState />}>
        <ConditionalLoadingState isLoading={!Boolean(icePanel)}>
          {icePanel?.widgets && icePanel.widgets.length > 0 ? (
            renderWidgets(
              icePanelStack.length ? icePanelStack.slice(icePanelStack.length - 1) : icePanel.widgets,
              rolesBySite[site]
            )
          ) : (
            <EmptyState
              title={<FormattedMessage id="icePanel.noWidgetsMessage" defaultMessage="No tools have been configured" />}
            />
          )}
        </ConditionalLoadingState>
      </Suspense>
    </ResizeableDrawer>
  );
}

export default ICEToolsPanel;
