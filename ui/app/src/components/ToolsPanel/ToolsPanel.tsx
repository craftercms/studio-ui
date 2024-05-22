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

import React, { Suspense, useEffect } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { initToolsPanelConfig, updateToolsPanelWidth } from '../../state/actions/preview';
import { useDispatch } from 'react-redux';
import ResizeableDrawer from '../ResizeableDrawer/ResizeableDrawer';
import { renderWidgets } from '../Widget';
import { WidgetDescriptor } from '../../models';
import { makeStyles } from 'tss-react/mui';
import { useSelection } from '../../hooks/useSelection';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { usePreviewState } from '../../hooks/usePreviewState';
import { useActiveUser } from '../../hooks/useActiveUser';
import { useSiteUIConfig } from '../../hooks/useSiteUIConfig';
import { nnou } from '../../utils/object';
import { getStoredPreviewToolsPanelPage, getStoredPreviewToolsPanelWidth } from '../../utils/state';
import { useActiveSite } from '../../hooks/useActiveSite';
import { ApiResponseErrorState } from '../ApiResponseErrorState';
import { LoadingState } from '../LoadingState';
import { EmptyState } from '../EmptyState';

defineMessages({
  previewSiteExplorerPanelTitle: {
    id: 'previewSiteExplorerPanel.title',
    defaultMessage: 'Project Explorer'
  }
});

const useStyles = makeStyles()((theme) => ({
  emptyState: {
    margin: `${theme.spacing(4)} ${theme.spacing(1)}`
  },
  emptyStateImage: {
    width: '50%',
    marginBottom: theme.spacing(1)
  },
  loadingViewRoot: {
    flex: 1,
    flexDirection: 'row'
  },
  drawerBody: {
    paddingBottom: 50
  }
}));

export function ToolsPanel() {
  const dispatch = useDispatch();
  const { id: siteId, uuid } = useActiveSite();
  const { classes } = useStyles();
  const { showToolsPanel, toolsPanel, toolsPanelWidth, windowSize, toolsPanelPageStack } = usePreviewState();
  const uiConfig = useSiteUIConfig();
  const baseUrl = useSelection<string>((state) => state.env.authoringBase);
  const { username } = useActiveUser();

  useEffect(() => {
    if (nnou(uiConfig.xml) && !toolsPanel) {
      const storedPage = getStoredPreviewToolsPanelPage(uuid, username);
      const toolsPanelWidth = getStoredPreviewToolsPanelWidth(siteId, username);
      dispatch(initToolsPanelConfig({ configXml: uiConfig.xml, storedPage, toolsPanelWidth }));
    }
  }, [uiConfig.xml, toolsPanel, dispatch, uuid, username, siteId]);

  const onWidthChange = (width) => {
    dispatch(
      updateToolsPanelWidth({
        width
      })
    );
  };

  return (
    <ResizeableDrawer
      belowToolbar
      open={showToolsPanel}
      width={toolsPanelWidth}
      maxWidth={windowSize}
      classes={{ drawerBody: classes.drawerBody }}
      onWidthChange={onWidthChange}
      styles={{
        resizeHandle: { backgroundColor: 'transparent' },
        drawerPaperBelowToolbar: { top: '64px' }
      }}
    >
      {uiConfig ? (
        uiConfig.error ? (
          <ApiResponseErrorState error={uiConfig.error} />
        ) : uiConfig.isFetching || !toolsPanel ? (
          <LoadingState classes={{ root: classes.loadingViewRoot }} />
        ) : !siteId || !toolsPanel.widgets || toolsPanel.widgets.length === 0 || !toolsPanelPageStack ? (
          <EmptyState
            title={
              siteId ? (
                <FormattedMessage id="previewTools.noWidgetsMessage" defaultMessage="No tools have been configured" />
              ) : (
                <FormattedMessage id="previewTools.choseSiteMessage" defaultMessage="Please choose project" />
              )
            }
            image={!siteId ? `${baseUrl}/static-assets/images/choose_option.svg` : undefined}
            classes={{ root: classes.emptyState, image: classes.emptyStateImage }}
          />
        ) : (
          <ToolsPaneBody root={toolsPanel.widgets} pageStack={toolsPanelPageStack} />
        )
      ) : null}
    </ResizeableDrawer>
  );
}

interface ToolsPaneBodyProps {
  root: WidgetDescriptor[];
  pageStack: WidgetDescriptor[];
}

function ToolsPaneBody(props: ToolsPaneBodyProps) {
  const { root, pageStack } = props;
  const site = useActiveSiteId();
  const { rolesBySite } = useActiveUser();
  return (
    <Suspense fallback="">
      {renderWidgets(pageStack.length ? pageStack.slice(props.pageStack.length - 1) : root, {
        userRoles: rolesBySite[site]
      })}
    </Suspense>
  );
}

export default ToolsPanel;
