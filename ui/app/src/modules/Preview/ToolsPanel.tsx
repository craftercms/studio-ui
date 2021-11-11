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

import React, { useEffect } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { fetchContentTypes, initToolsPanelConfig, updateToolsPanelWidth } from '../../state/actions/preview';
import { useDispatch } from 'react-redux';
import ResizeableDrawer from './ResizeableDrawer';
import { renderWidgets, WidgetDescriptor } from '../../components/Widget';
import { Resource } from '../../models/Resource';
import { SuspenseWithEmptyState } from '../../components/SystemStatus/Suspencified';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { useSelection } from '../../utils/hooks/useSelection';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { usePreviewState } from '../../utils/hooks/usePreviewState';
import { useActiveUser } from '../../utils/hooks/useActiveUser';
import { useLogicResource } from '../../utils/hooks/useLogicResource';
import { useSiteUIConfig } from '../../utils/hooks/useSiteUIConfig';
import LookupTable from '../../models/LookupTable';
import { nnou } from '../../utils/object';
import {
  getStoredPreviewToolsPanelPage,
  getStoredPreviewToolsPanelWidth,
  setStoredPreviewToolsPanelWidth
} from '../../utils/state';
import { useActiveSite } from '../../utils/hooks/useActiveSite';
import { getHostToHostBus } from './previewContext';
import { filter } from 'rxjs/operators';
import { pluginInstalled } from '../../state/actions/system';

defineMessages({
  previewSiteExplorerPanelTitle: {
    id: 'previewSiteExplorerPanel.title',
    defaultMessage: 'Site Explorer'
  }
});

const useStyles = makeStyles((theme) =>
  createStyles({
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
  })
);

export default function ToolsPanel() {
  const dispatch = useDispatch();
  const { id: siteId, uuid } = useActiveSite();
  const classes = useStyles();
  const { showToolsPanel, toolsPanel } = usePreviewState();
  const toolsPanelWidth = useSelection<number>((state) => state.preview.toolsPanelWidth);
  const pages = useSelection<WidgetDescriptor[]>((state) => state.preview.toolsPanelPageStack);
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

  useEffect(() => {
    const events = [pluginInstalled.type];
    const hostToHost$ = getHostToHostBus();
    const subscription = hostToHost$.pipe(filter((e) => events.includes(e.type))).subscribe(({ type, payload }) => {
      switch (type) {
        case pluginInstalled.type: {
          dispatch(fetchContentTypes());
        }
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const resource = useLogicResource<WidgetDescriptor[], LookupTable<WidgetDescriptor[]>>(toolsPanel, {
    errorSelector: (source) => uiConfig.error,
    resultSelector: (source) => source.widgets,
    shouldReject: (source) => false,
    shouldResolve: (source) => Boolean(source),
    shouldRenew: (source, resource) => uiConfig.isFetching || resource.complete
  });

  const onWidthChange = (width) => {
    setStoredPreviewToolsPanelWidth(siteId, username, width);
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
      classes={{ drawerBody: classes.drawerBody }}
      onWidthChange={onWidthChange}
    >
      <SuspenseWithEmptyState
        resource={resource}
        loadingStateProps={{
          classes: { root: classes.loadingViewRoot }
        }}
        withEmptyStateProps={{
          isEmpty: (widgets) => !siteId || widgets?.length === 0,
          emptyStateProps: {
            title: siteId ? (
              <FormattedMessage id="previewTools.noWidgetsMessage" defaultMessage="No tools have been configured" />
            ) : (
              <FormattedMessage id="previewTools.choseSiteMessage" defaultMessage="Please choose site" />
            ),
            ...(!siteId && { image: `${baseUrl}/static-assets/images/choose_option.svg` }),
            classes: { root: classes.emptyState, image: classes.emptyStateImage }
          }
        }}
      >
        <ToolsPaneBody resource={resource} pageStack={pages} />
      </SuspenseWithEmptyState>
    </ResizeableDrawer>
  );
}

interface ToolsPaneBodyProps {
  resource: Resource<WidgetDescriptor[]>;
  pageStack: WidgetDescriptor[];
}

function ToolsPaneBody(props: ToolsPaneBodyProps) {
  const root = props.resource.read();
  const site = useActiveSiteId();
  const { pageStack } = props;
  const { rolesBySite } = useActiveUser();
  return <>{renderWidgets(pageStack.length ? pageStack.slice(props.pageStack.length - 1) : root, rolesBySite[site])}</>;
}
