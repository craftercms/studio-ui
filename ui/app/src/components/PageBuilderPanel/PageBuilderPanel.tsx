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
import { Suspense } from 'react';
import { useDispatch } from 'react-redux';
import { updatePageBuilderPanelWidth } from '../../state/actions/preview';
import LoadingState, { ConditionalLoadingState } from '../SystemStatus/LoadingState';
import PageBuilderPanelUI from './PageBuilderPanelUI';
import { useSelection } from '../../utils/hooks/useSelection';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { useActiveUser } from '../../utils/hooks/useActiveUser';
import { useSiteUIConfig } from '../../utils/hooks/useSiteUIConfig';

export function PageBuilderPanel() {
  const dispatch = useDispatch();
  const uiConfig = useSiteUIConfig();
  const site = useActiveSiteId();
  const { rolesBySite } = useActiveUser();
  const { pageBuilderPanelWidth: width, editMode, pageBuilderPanelStack } = useSelection((state) => state.preview);
  const onWidthChange = (width) => dispatch(updatePageBuilderPanelWidth({ width }));
  return (
    <Suspense fallback={<LoadingState />}>
      <ConditionalLoadingState isLoading={!Boolean(uiConfig.preview.pageBuilderPanel.widgets)}>
        <PageBuilderPanelUI
          open={editMode}
          width={width}
          onWidthChange={onWidthChange}
          widgets={
            pageBuilderPanelStack.length
              ? pageBuilderPanelStack.slice(pageBuilderPanelStack.length - 1)
              : uiConfig.preview.pageBuilderPanel.widgets
          }
          userRolesInSite={rolesBySite[site]}
        />
      </ConditionalLoadingState>
    </Suspense>
  );
}

export default PageBuilderPanel;
