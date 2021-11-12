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

import React, { ComponentType, ElementType, Fragment, PropsWithChildren } from 'react';
import { ICEProps } from '../models/InContextEditing';
import ContentInstance from '@craftercms/studio-ui/models/ContentInstance';
import { useICE } from './hooks';
import { extractCollectionItem, value as getModelValue } from '@craftercms/studio-ui/utils/model';
import { nnou, setProperty } from '@craftercms/studio-ui/utils/object';

export type FieldProps<P = {}> = PropsWithChildren<
  P & {
    model: ContentInstance;
    index?: ICEProps['index'];
    fieldId?: ICEProps['fieldId'];
    component?: ElementType<P>;
  }
>;

export type RenderFieldProps<P, V = any, F = V> = FieldProps<P> & {
  renderTarget?: string;
  format?: (value: V, fieldId: string) => F;
};

export type ModelProps<P = {}> = PropsWithChildren<
  P & {
    model: ContentInstance;
    component?: ElementType<P>;
  }
>;

// Field component is a slightly lighter/simpler version of RenderField. It has less options to render (e.g. no renderTarget, format)
// Registers the zone but doesn't render the field value, so values don't get repainted when changed.
export function Field<P = {}>(props: FieldProps<P>) {
  const { model: modelProp, fieldId, index, component = 'div', ...other } = props;
  const { props: ice, model } = useICE({ model: modelProp, fieldId, index });
  const Component = component as ComponentType<P>;
  const passDownProps = {
    ...other,
    ...ice,
    // If the component is an html element, `model` would end up written as an
    // attribute model="[object Object]".
    ...(typeof component === 'string' ? {} : { model })
  } as P;
  return <Component {...passDownProps} />;
}

export function RenderField<P = {}>(props: RenderFieldProps<P>) {
  const {
    model: modelProp,
    fieldId,
    index,
    component = 'div',
    // The renderTarget property for the field value. Can be multiple (CSVs),
    // just like fieldId. Should have a 1-to-1 correspondence with fieldId.
    renderTarget = 'children',
    format = (value) => value,
    ...other
  } = props;
  const { props: ice, model } = useICE({ model: modelProp, fieldId, index });
  const Component = component as ComponentType<P>;
  const passDownProps = Object.assign({}, other, ice) as P;
  const fields = fieldId.replace(/\s/g, '').split(',');
  const targets = renderTarget.replace(/\s/g, '').split(',');
  targets.forEach((target, targetIndex) => {
    const fieldId = fields[targetIndex];
    setProperty(
      passDownProps as {},
      target,
      format(nnou(index) ? extractCollectionItem(model, fieldId, index) : getModelValue(model, fieldId), fieldId)
    );
  });
  return <Component {...passDownProps} />;
}

export function Model<P = {}>(props: ModelProps<P>) {
  const { model, component = Fragment, ...other } = props;
  useICE({ model, fieldId: null, index: null, noRef: true });
  const Component = component as ComponentType<P>;
  const passDownProps = other as P;
  return <Component {...passDownProps} />;
}

export default Field;
