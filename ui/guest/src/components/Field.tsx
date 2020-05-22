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
import { ICEProps } from '../models/InContextEditing';
import ContentInstance from '@craftercms/studio-ui/models/ContentInstance';
import { PropsWithChildren, ElementType } from 'react';
import { useICE } from '../hooks';

type FieldProps<P = {}> = PropsWithChildren<
  P & {
    model: ContentInstance;
    index?: ICEProps['index'];
    fieldId?: ICEProps['fieldId'];
    component?: ElementType<P>;
  }
>;

export default function Field<P = {}>(props: FieldProps<P>) {
  const { model, fieldId, index, component = 'div', ...other } = props;
  const { props: ice } = useICE({ model, fieldId, index });
  const Component = component as ComponentType<P>;
  const passDownProps = other as P;
  return <Component {...passDownProps} {...ice} />;
}
