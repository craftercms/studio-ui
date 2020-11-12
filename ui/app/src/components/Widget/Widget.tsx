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

import React, { ComponentType } from 'react';
import { components } from '../../utils/craftercms';
import NonReactWidget from '../NonReactWidget/NonReactWidget';
import { PluginFileBuilder } from '../../services/plugin';

// TODO: Temporary/remove after testing.
export const TempTestContext = React.createContext<any>({});

interface WidgetProps {
  id: string;
  plugin: PluginFileBuilder;
  configuration: any;
}

function isComponent(record): record is React.ComponentType<any> {
  return typeof record !== 'object';
}

export function Widget(props: WidgetProps) {
  const { id, plugin, configuration } = props;
  const record = components.get(id);
  if (record) {
    if (isComponent(record)) {
      const Component = record;
      return <Component {...configuration} />;
    } else {
      return <NonReactWidget widget={record} configuration={configuration} />;
    }
  } else {
    const Component = React.lazy<ComponentType<WidgetProps>>(() =>
      // TODO: Replace for actual plugin load call.
      // import(/* webpackIgnore: true */ buildFileUrl(plugin))
      import(/* webpackIgnore: true */ `${process.env.PUBLIC_URL}/${plugin.type}${plugin.name}${plugin.file}`).then(
        () => {
          return {
            default: function() {
              if (components.has(id)) {
                return <Widget {...props} />;
              } else {
                return <div>Component not found.</div>;
              }
            }
          };
        }
      )
    );
    return <Component {...props} />;
  }
}

export function renderWidgets(widgets, roles: string[]) {
  return widgets
    .filter((widget) => (widget.roles ?? []).length === 0 || roles.some((role) => widget.roles.includes(role)))
    .map((widget, index) => <Widget key={`${widget.id}_${index}`} {...widget} />);
}

export default Widget;
