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

import React, { ComponentType, ElementType, PropsWithChildren, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { ICEProps } from '../models/InContextEditing';
import ContentInstance from '@craftercms/studio-ui/models/ContentInstance';
import { useICE } from './hooks';

export type FieldProps<P = {}> = PropsWithChildren<
  P & {
    model: ContentInstance;
    index?: ICEProps['index'];
    fieldId?: ICEProps['fieldId'];
    component?: ElementType<P>;
    componentProps?: Partial<P>;
  }
>;

// Field component is a slightly lighter/simpler version of RenderField. It has less options to render (e.g. no renderTarget, render)
// Registers the zone but doesn't render the field value, so values don't get repainted when changed.
export const Field = forwardRef<any, FieldProps>(function <P = {}>(props: FieldProps<P>, ref) {
  const { model: modelProp, fieldId, index, component = 'div', componentProps, ...other } = props;
  const { props: ice, model } = useICE({
    model: modelProp,
    fieldId: fieldId === '__CRAFTERCMS_FAKE_FIELD__' ? void 0 : fieldId,
    index,
    ref
  });
  const Component = component as ComponentType<P>;
  const passDownProps = {
    ...other,
    ...ice,
    ...componentProps,
    // If the component is an html element, `model` would end up written as an
    // attribute model="[object Object]".
    ...(typeof component === 'string' ? {} : { model })
  } as P;
  return <Component {...passDownProps} />;
});

Field.propTypes = {
  model: (props, propName, componentName) => {
    if (!props[propName] || !props[propName].craftercms) {
      return new Error(
        `Invalid "${propName}" prop supplied to ${componentName}. Model prop should be a ContentInstance.`
      );
    }
  },
  fieldId: PropTypes.string.isRequired,
  index: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  // @ts-ignore
  component: PropTypes.elementType,
  componentProps: PropTypes.object
};

export default Field;
