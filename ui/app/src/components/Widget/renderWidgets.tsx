/*
 * Copyright (C) 2007-2023 Crafter Software Corporation. All Rights Reserved.
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

import WidgetDescriptor from '../../models/WidgetDescriptor';
import React, { ReactElement } from 'react';
import Widget, { WidgetProps } from './Widget';

type MapperFn = (widget: WidgetDescriptor, index: number) => ReactElement;

export function renderWidgets(
  widgets: WidgetDescriptor[],
  options?: Pick<WidgetProps, 'overrideProps' | 'defaultProps'> & {
    userRoles?: string[];
    createMapperFn?(originalMapperFn: MapperFn): MapperFn;
  }
): JSX.Element[] {
  if (!Array.isArray(widgets)) {
    return [];
  }
  const { userRoles, overrideProps, defaultProps, createMapperFn = (fn) => fn } = options;
  const mapperFn = createMapperFn((widget, index) => (
    <Widget key={widget.uiKey ?? index} {...widget} overrideProps={overrideProps} defaultProps={defaultProps} />
  ));
  return Array.isArray(userRoles)
    ? widgets
        .filter(
          (widget) =>
            // Incorrect deserialization or content of permittedRoles may cause it to be something other than an array
            !Array.isArray(widget.permittedRoles) ||
            (widget.permittedRoles ?? []).length === 0 ||
            (userRoles ?? []).some((role) => widget.permittedRoles.includes(role))
        )
        .map(mapperFn)
    : widgets.map(mapperFn);
}

export default renderWidgets;
