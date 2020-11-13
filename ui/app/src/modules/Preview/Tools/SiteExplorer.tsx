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
import { defineMessages, useIntl } from 'react-intl';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import ToolPanel from './ToolPanel';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import PathNavigator from '../../../components/Navigation/PathNavigator/PathNavigator';
import { Resource } from '../../../models/Resource';
import { SuspenseWithEmptyState } from '../../../components/SystemStatus/Suspencified';
import { useActiveSiteId, useLogicResource, useRoles } from '../../../utils/hooks';
import Alert from '@material-ui/lab/Alert';
import Link from '@material-ui/core/Link';
import palette from '../../../styles/palette';

type SiteExplorerResource = {
  supported: any[];
  notSupported: any[];
};

interface SiteExplorerProps {
  resource: Resource<SiteExplorerResource>;
}

const translations = defineMessages({
  title: {
    id: 'siteExplorerPanel.title',
    defaultMessage: 'Site Explorer'
  },
  siteConfig: {
    id: 'siteExplorerPanel.siteConfig',
    defaultMessage: 'Site Config'
  },
  dashboard: {
    id: 'words.dashboard',
    defaultMessage: 'Dashboard'
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
      textDecoration: 'none !important'
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
    },
    searchRoot: {
      marginRight: 10
    }
  })
);

interface LinkWithIconProps {
  label: string;
  link: string;
  icon?: {
    baseClass?: string;
    baseStyle?: object;
  };
}

const LinkWithIcon = (props: LinkWithIconProps) => {
  const { link, label, icon } = props;
  const classes = useLinkIconStyles();
  return (
    <ListItem button component={Link} href={link} className={classes.links}>
      <ListItemText
        primary={
          <>
            <i className={`${classes.icon} ${icon.baseClass}`} style={{ ...icon.baseStyle }} /> {label}
          </>
        }
      />
    </ListItem>
  );
};

function SiteDashboardLink() {
  const { formatMessage } = useIntl();
  return (
    <LinkWithIcon
      link="/studio/site-dashboard"
      label={formatMessage(translations.dashboard)}
      icon={{ baseClass: 'fa fa-tasks' }}
    />
  );
}

function SiteConfigLink() {
  const { formatMessage } = useIntl();
  return (
    <LinkWithIcon
      link="/studio/site-config"
      label={formatMessage(translations.siteConfig)}
      icon={{ baseClass: 'fa fa-sliders' }}
    />
  );
}

const ItemToComponentMap = {
  'craftercms.pathNavigator': PathNavigator,
  'craftercms.linkWithIcon': LinkWithIcon,
  'craftercms.siteDashboardLink': SiteDashboardLink,
  'craftercms.siteConfigLink': SiteConfigLink
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
        const Component = ItemToComponentMap[item.id];
        return <Component key={index} {...item.parameters} classes={classes} />;
      })}
    </>
  );
}

interface SiteExplorerContainerProps {
  [key: string]: any;
}

export function SiteExplorerContainer({ widgets }: SiteExplorerContainerProps) {
  const { formatMessage } = useIntl();
  const site = useActiveSiteId();
  const rolesBySite = useRoles();

  const resource = useLogicResource(widgets, {
    errorSelector: (widgets) => null,
    resultSelector: (widgets) => {
      const supported = widgets.filter((item) => {
        const userRoles = rolesBySite[site];
        const itemRoles = item.roles;
        const hasPermission = itemRoles?.length ? userRoles.some((role) => itemRoles.includes(role)) : true;
        return (
          [
            'craftercms.linkWithIcon',
            'craftercms.siteDashboardLink',
            'craftercms.siteConfigLink',
            'craftercms.pathNavigator'
          ].includes(item.id) && hasPermission
        );
      });
      const notSupported = widgets.filter(
        (i) =>
          ![
            'craftercms.linkWithIcon',
            'craftercms.siteDashboardLink',
            'craftercms.siteConfigLink',
            'craftercms.pathNavigator'
          ].includes(i.id)
      );
      return { supported, notSupported };
    },
    shouldReject: (state) => null,
    shouldRenew: (state, resource) => resource.complete,
    shouldResolve: (state) => Boolean(widgets)
  });

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
