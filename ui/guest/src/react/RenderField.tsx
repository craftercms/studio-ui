/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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

import React, { ComponentType, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { useICE } from './hooks';
import { FieldProps, Field } from './Field';
import { nnou, setProperty } from '@craftercms/studio-ui/utils/object';
import { extractCollectionItem, value as getModelValue } from '@craftercms/studio-ui/utils/model';
import { getCachedContentType } from '../contentController';
import ContentInstance from '@craftercms/studio-ui/models/ContentInstance';

export type RenderFieldProps<P, V = any, F = V> = Omit<FieldProps<P>, 'children'> & {
  renderTarget?: string;
  render?: (value: V, fieldId: string, model: ContentInstance) => F;
};

export const RenderField = forwardRef<any, RenderFieldProps<{}>>(function <P = {}>(props, ref) {
  // region const { ... } = props
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
  // endregion
  if (props.format) {
    console.error(
      'RenderField component prop `format` was renamed to `render`. Support for `format` will be removed in later versions. Please use `render` instead.'
    );
  }
  const { props: ice, model } = useICE({ model: modelProp, fieldId, index, ref });
  const Component = component as ComponentType<P>;
  const passDownProps = Object.assign({}, other as unknown, ice, componentProps) as P;
  const fields = fieldId.replace(/\s/g, '').split(',');
  const targets = renderTarget.replace(/\s/g, '').split(',');
  targets.forEach((target, targetIndex) => {
    const fieldId = fields[targetIndex];
    setProperty(
      passDownProps as {},
      target,
      render(nnou(index) ? extractCollectionItem(model, fieldId, index) : getModelValue(model, fieldId), fieldId, model)
    );
  });

  // `data-craftercms-field` attribute is added to all fields for the elements to get the XB on hover cursor styles.
  // `data-craftercms-type="collection"` attribute is added to node-selector and repeat fields for the elements to get
  // the XB padding mode styles.
  const contentTypeId = model.craftercms.contentTypeId;
  const contentType = getCachedContentType(contentTypeId);
  const field = contentType?.fields[fieldId];
  passDownProps['data-craftercms-field'] = '';
  if (field && ['node-selector', 'repeat'].includes(field.type)) {
    passDownProps['data-craftercms-type'] = 'collection';
  }

  return <Component {...passDownProps} />;
});

RenderField.propTypes = {
  ...Field.propTypes,
  render: PropTypes.func,
  renderTarget: PropTypes.string
};

export default RenderField;
