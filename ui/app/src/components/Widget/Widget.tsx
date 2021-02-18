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

import React, { ComponentType, memo } from 'react';
import NonReactWidget from '../NonReactWidget/NonReactWidget';
import { components, importPlugin, PluginFileBuilder } from '../../services/plugin';
import EmptyState from '../SystemStatus/EmptyState';
import { defineMessages, useIntl } from 'react-intl';
import ErrorState from '../ErrorState';

export interface WidgetDescriptor {
  id: string;
  uiKey?: string | number;
  roles?: string[];
  plugin?: PluginFileBuilder;
  configuration?: any;
}

interface WidgetProps extends WidgetDescriptor {}

const messages = defineMessages({
  componentNotFoundTitle: {
    id: 'widgetComponent.componentNotFoundTitle',
    defaultMessage: 'Component {id} not found.'
  },
  componentNotFoundSubtitle: {
    id: 'widgetComponent.componentNotFoundSubtitle',
    defaultMessage: "Check ui config & make sure you've installed the plugins that contain the desired components."
  },
  pluginLoadFailedMessageTitle: {
    id: 'widgetComponent.pluginLoadFailedMessageTitle',
    defaultMessage: 'Plugin load failed'
  },
  pluginLoadFailedMessageBody: {
    id: 'widgetComponent.pluginLoadFailedMessageBody',
    defaultMessage: 'With {info} & component id "{id}".'
  }
});

function isComponent(record): record is React.ComponentType<any> {
  return typeof record !== 'object';
}

const Widget = memo(function(props: WidgetProps) {
  const { id, plugin, configuration } = props;
  const record = components.get(id);
  const { formatMessage } = useIntl();
  if (record) {
    if (isComponent(record)) {
      const Component = record;
      return <Component {...configuration} />;
    } else {
      return <NonReactWidget widget={record} configuration={configuration} />;
    }
  } else if (!plugin) {
    return (
      <EmptyState
        title={formatMessage(messages.componentNotFoundTitle, { id })}
        subtitle={formatMessage(messages.componentNotFoundSubtitle)}
        styles={{ image: { width: 100 } }}
      />
    );
  } else {
    const Component = React.lazy<ComponentType<WidgetProps>>(() =>
      importPlugin(plugin).then(
        () => ({
          default: function(props) {
            if (components.has(id)) {
              return <Widget {...props} />;
            } else {
              return (
                <EmptyState
                  title={formatMessage(messages.componentNotFoundTitle, { id })}
                  subtitle={formatMessage(messages.componentNotFoundSubtitle)}
                  styles={{ image: { width: 100 } }}
                />
              );
            }
          }
        }),
        () => ({
          default: function({ id, plugin }) {
            return (
              <ErrorState
                styles={{ image: { width: 100 } }}
                title={formatMessage(messages.pluginLoadFailedMessageTitle)}
                message={formatMessage(messages.pluginLoadFailedMessageBody, {
                  id,
                  info: Object.entries(plugin)
                    .map(([key, value]) => `${key} "${value}"`)
                    .join(', ')
                })}
              />
            );
          }
        })
      )
    );
    return <Component {...props} />;
  }
});

export { Widget };

export function renderWidgets(widgets: WidgetDescriptor[], userRoles: string[]): JSX.Element[] {
  return widgets
    ? widgets
        .filter(
          (widget) => (widget.roles ?? []).length === 0 || (userRoles ?? []).some((role) => widget.roles.includes(role))
        )
        .map((widget) => <Widget key={widget.uiKey} {...widget} />)
    : [];
}

export default Widget;
