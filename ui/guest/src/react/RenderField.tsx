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

import React, { ComponentType } from 'react';
import PropTypes from 'prop-types';
import { useICE } from './hooks';
import { FieldProps, fieldPropTypesWithoutChildren } from './Field';
import { nnou, setProperty } from '@craftercms/studio-ui/utils/object';
import { extractCollectionItem, value as getModelValue } from '@craftercms/studio-ui/utils/model';

export type RenderFieldProps<P, V = any, F = V> = Omit<FieldProps<P>, 'children'> & {
  renderTarget?: string;
  render?: (value: V, fieldId: string) => F;
  /** @deprecated Use `render` instead. Prop `format` will be removed in later version. */
  format?: (value: V, fieldId: string) => F;
};

export function RenderField<P = {}>(props: RenderFieldProps<P>) {
  const {
    model: modelProp,
    fieldId,
    index,
    component = 'div',
    componentProps = {},
    // The renderTarget property for the field value. Can be multiple (CSVs),
    // just like fieldId. Should have a 1-to-1 correspondence with fieldId.
    renderTarget = 'children',
    render = props.format ?? ((value) => value),
    ...other
  } = props;
  if (props.format) {
    console.error(
      'RenderField component prop `format` was renamed to `render`. Support for `format` will be removed in later versions. Please use `render` instead.'
    );
  }
  const { props: ice, model } = useICE({ model: modelProp, fieldId, index });
  const Component = component as ComponentType<P>;
  const passDownProps = Object.assign({}, other as unknown, ice, componentProps) as P;
  const fields = fieldId.replace(/\s/g, '').split(',');
  const targets = renderTarget.replace(/\s/g, '').split(',');
  targets.forEach((target, targetIndex) => {
    const fieldId = fields[targetIndex];
    setProperty(
      passDownProps as {},
      target,
      render(nnou(index) ? extractCollectionItem(model, fieldId, index) : getModelValue(model, fieldId), fieldId)
    );
  });
  return <Component {...passDownProps} />;
}

RenderField.propTypes = {
  ...fieldPropTypesWithoutChildren,
  format: PropTypes.func,
  renderTarget: PropTypes.string
};

/*
- PropTypes model, fieldId are required,
- add ref to RenderField & Field
- Create RenderRepeat & RenderComponents
*/

export default RenderField;
