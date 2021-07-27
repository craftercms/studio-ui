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
import { initToolsPanelConfig, updateToolsPanelWidth } from '../../state/actions/preview';
import { useDispatch } from 'react-redux';
import ResizeableDrawer from './ResizeableDrawer';
import { renderWidgets, WidgetDescriptor } from '../../components/Widget';
import { Resource } from '../../models/Resource';
import { SuspenseWithEmptyState } from '../../components/SystemStatus/Suspencified';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useSelection } from '../../utils/hooks/useSelection';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { usePreviewState } from '../../utils/hooks/usePreviewState';
import { useActiveUser } from '../../utils/hooks/useActiveUser';
import { useLogicResource } from '../../utils/hooks/useLogicResource';
import { useSiteUIConfig } from '../../utils/hooks/useSiteUIConfig';
import LookupTable from '../../models/LookupTable';
import { nnou } from '../../utils/object';

defineMessages({
  previewSiteExplorerPanelTitle: {
    id: 'previewSiteExplorerPanel.title',
    defaultMessage: 'Site Explorer'
  }
});

const useStyles = makeStyles((theme) =>
  createStyles({
    emptyState: {
      margin: `${theme.spacing(4)}px ${theme.spacing(1)}px`
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
  const site = useActiveSiteId();
  const classes = useStyles();
  const { showToolsPanel, toolsPanel } = usePreviewState();
  const toolsPanelWidth = useSelection<number>((state) => state.preview.toolsPanelWidth);
  const pages = useSelection<WidgetDescriptor[]>((state) => state.preview.toolsPanelPageStack);
  const uiConfig = useSiteUIConfig();
  const baseUrl = useSelection<string>((state) => state.env.authoringBase);

  useEffect(() => {
    if (nnou(uiConfig.xml) && !toolsPanel) {
      dispatch(initToolsPanelConfig({ configXml: uiConfig.xml, references: uiConfig.references }));
    }
  }, [uiConfig.xml, uiConfig.references, toolsPanel, dispatch]);

  const resource = useLogicResource<WidgetDescriptor[], LookupTable<WidgetDescriptor[]>>(toolsPanel, {
    errorSelector: (source) => uiConfig.error,
    resultSelector: (source) => source.widgets,
    shouldReject: (source) => false,
    shouldResolve: (source) => Boolean(source),
    shouldRenew: (source, resource) => uiConfig.isFetching || resource.complete
  });

  return (
    <ResizeableDrawer
      belowToolbar
      open={showToolsPanel}
      width={toolsPanelWidth}
      classes={{ drawerBody: classes.drawerBody }}
      onWidthChange={(width) => {
        dispatch(
          updateToolsPanelWidth({
            width
          })
        );
      }}
    >
      <SuspenseWithEmptyState
        resource={resource}
        loadingStateProps={{
          classes: { root: classes.loadingViewRoot }
        }}
        withEmptyStateProps={{
          isEmpty: (widgets) => !site || !widgets || widgets?.length === 0,
          emptyStateProps: {
            title: site ? (
              <FormattedMessage id="previewTools.noWidgetsMessage" defaultMessage="No tools have been configured" />
            ) : (
              <FormattedMessage id="previewTools.choseSiteMessage" defaultMessage="Please choose site" />
            ),
            ...(!site && { image: `${baseUrl}/static-assets/images/choose_option.svg` }),
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
