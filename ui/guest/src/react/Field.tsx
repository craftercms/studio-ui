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

import React, { ComponentType, Fragment, PropsWithChildren, ElementType } from 'react';
import { ICEProps } from '../models/InContextEditing';
import ContentInstance from '@craftercms/studio-ui/models/ContentInstance';
import { useICE } from './hooks';
import { value as getModelValue } from '../utils/model';
import { setProperty } from '../utils/object';

type FieldProps<P = {}> = PropsWithChildren<
  P & {
    model: ContentInstance;
    index?: ICEProps['index'];
    fieldId?: ICEProps['fieldId'];
    component?: ElementType<P>;
  }
>;

export function Field<P = {}>(props: FieldProps<P>) {
  const { model: modelProp, fieldId, index, component = 'div', ...other } = props;
  const { props: ice, model } = useICE({ model: modelProp, fieldId, index });
  const Component = component as ComponentType<P>;
  const passDownProps = {
    ...other,
    ...ice,
    // If the component is an html element, the model would end up write as an
    // attribute model="[object Object]".
    ...(typeof component === 'string' ? {} : { model })
  } as P;
  return <Component {...passDownProps} />;
}

export default Field;

export function Img(props) {
  const { props: ice, model } = useICE(props);
  return <img src={getModelValue(model, props.fieldId)} alt="" {...ice} />;
}

type RenderFieldProps<P, V = any, F = V> = FieldProps<P> & {
  target?: string;
  format?: (value: V, fieldId: string) => F;
};

export function RenderField<P = {}>(props: RenderFieldProps<P>) {
  const {
    model: modelProp,
    fieldId,
    index,
    component = 'div',
    target = 'children',
    format = (value) => value,
    ...other
  } = props;
  const { props: ice, model } = useICE({ model: modelProp, fieldId, index });
  const Component = component as ComponentType<P>;
  const passDownProps = Object.assign({}, other, ice) as P;
  const fields = fieldId.replace(/\s/g, '').split(',');
  const targets = target.replace(/\s/g, '').split(',');
  targets.forEach((target, index) => {
    const fieldId = fields[index];
    setProperty(passDownProps as {}, target, format(getModelValue(model, fieldId), fieldId));
  });
  return <Component {...passDownProps} />;
}

export function Model<P = {}>(props: FieldProps<P>) {
  const { model, fieldId, index, component = Fragment, ...other } = props;
  useICE({ model, fieldId: null, index: null, noRef: true });
  const Component = component as ComponentType<P>;
  const passDownProps = other as P;
  return <Component {...passDownProps} />;
}
