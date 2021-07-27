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
import { initPageBuilderPanelConfig, updatePageBuilderPanelWidth } from '../../state/actions/preview';
import LoadingState, { ConditionalLoadingState } from '../SystemStatus/LoadingState';
import { useSelection } from '../../utils/hooks/useSelection';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { useActiveUser } from '../../utils/hooks/useActiveUser';
import { useSiteUIConfig } from '../../utils/hooks/useSiteUIConfig';
import { renderWidgets } from '../Widget';
import ResizeableDrawer from '../../modules/Preview/ResizeableDrawer';
import { usePreviewState } from '../../utils/hooks/usePreviewState';
import EmptyState from '../SystemStatus/EmptyState';
import { FormattedMessage } from 'react-intl';

export function PageBuilderPanel() {
  const dispatch = useDispatch();
  const uiConfig = useSiteUIConfig();
  const { pageBuilderPanel } = usePreviewState();
  const site = useActiveSiteId();
  const { rolesBySite } = useActiveUser();
  const { pageBuilderPanelWidth: width, editMode, pageBuilderPanelStack } = useSelection((state) => state.preview);
  const onWidthChange = (width) => dispatch(updatePageBuilderPanelWidth({ width }));

  useEffect(() => {
    if (uiConfig.xml && !pageBuilderPanel.widgets) {
      dispatch(initPageBuilderPanelConfig({ configXml: uiConfig.xml, references: uiConfig.references }));
    }
  }, [uiConfig.xml, uiConfig.references, dispatch, pageBuilderPanel.widgets]);

  return (
    <ResizeableDrawer open={editMode} belowToolbar anchor="right" width={width} onWidthChange={onWidthChange}>
      <Suspense fallback={<LoadingState />}>
        <ConditionalLoadingState isLoading={!Boolean(pageBuilderPanel)}>
          {pageBuilderPanel.widgets ? (
            renderWidgets(
              pageBuilderPanelStack.length
                ? pageBuilderPanelStack.slice(pageBuilderPanelStack.length - 1)
                : pageBuilderPanel.widgets,
              rolesBySite[site]
            )
          ) : (
            <EmptyState
              title={<FormattedMessage id="noUiConfigMessageTitle.title" defaultMessage="Configuration file missing" />}
              subtitle={
                <FormattedMessage
                  id="noUiConfigMessageTitle.subtitle"
                  defaultMessage="Add & configure `ui.xml` on your site to show content here."
                />
              }
            />
          )}
        </ConditionalLoadingState>
      </Suspense>
    </ResizeableDrawer>
  );
}

export default PageBuilderPanel;
