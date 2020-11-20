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

// TODO: Temporary/remove after testing.
export const TempTestContext = React.createContext<any>({});

interface WidgetProps {
  id: string;
  plugin: PluginFileBuilder;
  configuration: any;
}

const messages = defineMessages({
  componentNotFound: {
    id: 'widgetComponent.componentNotFound',
    defaultMessage: 'Component not found'
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
  } else {
    const Component = React.lazy<ComponentType<WidgetProps>>(() =>
      importPlugin(plugin).then(
        () => ({
          default: function(props) {
            if (components.has(id)) {
              return <Widget {...props} />;
            } else {
              return (
                <EmptyState title={formatMessage(messages.componentNotFound)} styles={{ image: { width: 100 } }} />
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

export function renderWidgets(widgets, roles: string[]) {
  return widgets
    .filter((widget) => (widget.roles ?? []).length === 0 || roles.some((role) => widget.roles.includes(role)))
    .map((widget, index) => <Widget key={`${widget.id}_${index}`} {...widget} />);
}

export default Widget;
