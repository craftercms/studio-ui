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

import React, { ComponentType, ElementType, Fragment, PropsWithChildren } from 'react';
import { useICE } from './hooks';
import ContentInstance from '@craftercms/studio-ui/models/ContentInstance';

export type ModelProps<P = {}> = PropsWithChildren<
  P & {
    model: ContentInstance;
    component?: ElementType<P>;
  }
>;

export function Model<P = {}>(props: ModelProps<P>) {
  const { model, component = Fragment, ...other } = props;
  useICE({ model, fieldId: null, index: null, noRef: true });
  const Component = component as ComponentType<P>;
  const passDownProps = other as P;
  return <Component {...passDownProps} />;
}

export default Model;
