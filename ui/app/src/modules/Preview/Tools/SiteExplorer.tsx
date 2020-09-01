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
import { defineMessages, useIntl } from 'react-intl';
import { createStyles } from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';
import ToolPanel from './ToolPanel';
import { SidebarConfigItem } from '../../../services/configuration';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Widget from '../../../components/Navigation/PathNavigator/Widget';
import { Resource } from '../../../models/Resource';
import { SuspenseWithEmptyState } from '../../../components/SystemStatus/Suspencified';
import {
  useActiveSiteId,
  useLogicResource,
  usePreviousValue,
  useSelection
} from '../../../utils/hooks';
import Alert from '@material-ui/lab/Alert';
import Link from '@material-ui/core/Link';
import { fetchSidebarConfig } from '../../../state/actions/configuration';
import { useDispatch } from 'react-redux';
import palette from '../../../styles/palette';

type SiteExplorerResource = { supported: SidebarConfigItem[]; notSupported: SidebarConfigItem[] };

interface SiteExplorerProps {
  resource: Resource<SiteExplorerResource>;
}

const translations = defineMessages({
  title: {
    id: 'siteExplorerPanel.title',
    defaultMessage: 'Site Explorer'
  },
  noSidebarItems: {
    id: 'siteExplorerPanel.emptyMessage',
    defaultMessage: 'No widgets are configured to show on the site explorer.'
  },
  unsupportedItemsPreset: {
    id: 'siteExplorerPanel.unsupportedItemsPreset',
    defaultMessage: "Some items in the site explorer config are not supported and won't show."
  }
});

const useLinkIconStyles = makeStyles(() =>
  createStyles({
    links: {
      paddingTop: 0,
      paddingLeft: 9,
      paddingBottom: 0,
      textDecoration: 'none'
    },
    icon: {
      marginRight: 3
    }
  })
);

const useExplorerStyles = makeStyles(() =>
  createStyles({
    body: {
      marginLeft: 10,
      borderLeft: `3px solid ${palette.gray.light2}`
    }
  })
);

const LinkWithIcon = ({ label, icon, href }) => {
  const classes = useLinkIconStyles();
  return (
    <ListItem button component={Link} href={href} className={classes.links}>
      <ListItemText
        primary={
          <>
            <i className={`${classes.icon} ${icon}`} /> {label}
          </>
        }
      />
    </ListItem>
  );
};

const DashboardLink = () => (
  <LinkWithIcon label="Dashboard" icon="fa fa-tasks" href="/studio/site-dashboard" />
);

const SiteConfigLink = () => (
  <LinkWithIcon label="Site Config" icon="fa fa-sliders" href="/studio/site-config" />
);

const ItemToComponentMap = {
  PagesWidget: Widget,
  'site-config': SiteConfigLink,
  dashboard: DashboardLink
};

export function SiteExplorer(props: SiteExplorerProps) {
  const { resource } = props;
  const { supported: widgets, notSupported } = resource.read();
  const { formatMessage } = useIntl();
  const classes = useExplorerStyles();
  return (
    <>
      {Boolean(notSupported.length) && (
        <Alert severity="warning">{formatMessage(translations.unsupportedItemsPreset)}</Alert>
      )}
      {widgets?.map((item, index) => {
        const Component = ItemToComponentMap[item.name || item.render];
        return <Component
          key={index} {...(item.name ? item.params : item.props)} classes={classes}
        />;
      })}
    </>
  );
}

export function SiteExplorerContainer() {
  const { formatMessage } = useIntl();
  const site = useActiveSiteId();
  const dispatch = useDispatch();
  const prevSite = usePreviousValue(site);
  const state = useSelection((state) => state.configuration.sidebar);
  const resource = useLogicResource(state, {
    errorSelector: (state) => state.error,
    resultSelector: ({ items }) => {
      const supported = items.filter((i) =>
        ['PagesWidget', 'site-config', 'dashboard'].includes(i.name || i.render)
      );
      const notSupported = items.filter(
        (i) => !['PagesWidget', 'site-config', 'dashboard'].includes(i.name || i.render)
      );
      return { supported, notSupported };
    },
    shouldReject: (state) => Boolean(state.error),
    shouldRenew: (state, resource) => resource.complete,
    shouldResolve: (state) => !state.isFetching && Boolean(state.items)
  });
  useEffect(() => {
    if (
      (!state.items && !state.isFetching) ||
      (prevSite !== undefined && prevSite !== site)
    ) {
      dispatch(fetchSidebarConfig(site));
    }
  }, [dispatch, prevSite, site, state.isFetching, state.items]);
  return (
    <ToolPanel title={translations.title}>
      <SuspenseWithEmptyState
        resource={resource}
        withEmptyStateProps={{
          emptyStateProps: { title: formatMessage(translations.noSidebarItems) }
        }}
      >
        {/* @ts-ignore */}
        <SiteExplorer resource={resource} />
      </SuspenseWithEmptyState>
    </ToolPanel>
  );
}

export default SiteExplorerContainer;
