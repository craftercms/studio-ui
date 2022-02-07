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

import * as React from 'react';
import PropTypes from 'prop-types';
import { ElementType, ReactElement } from 'react';
import Field from './Field';
import RenderField from './RenderField';
import { nnou, nou } from '@craftercms/studio-ui/utils/object';
import ContentInstance from '@craftercms/studio-ui/src/models/ContentInstance';
import { ICEProps } from '../models/InContextEditing';

export interface RenderRepeatProps<RootProps = {}, ItemProps = {}, ItemType extends any = {}> {
  model: ContentInstance;
  index?: ICEProps['index'];
  fieldId: ICEProps['fieldId'];
  component?: ElementType<RootProps>;
  componentProps?: Partial<RootProps>;
  itemComponent?: ElementType<ItemProps>;
  itemProps?: Partial<ItemProps>;
  renderItem(
    item: ItemType,
    fullIndex: string | number,
    indexInCollection: number,
    collection: Array<ItemType>
  ): ReactElement;
}

export function RenderRepeat(props: RenderRepeatProps) {
  const {
    model,
    fieldId,
    index,
    component = 'div',
    componentProps,
    itemComponent = 'div',
    itemProps,
    renderItem = (item) => JSON.stringify(item, null, ' ')
  } = props;
  const subIndexGenerator = nnou(index) ? (i) => `${index}.${i}` : (i) => i;
  const itemPropsGenerator = nou(itemProps)
    ? () => void 0
    : typeof itemProps === 'function'
    ? itemProps
    : () => itemProps;
  return (
    <RenderField
      model={model}
      index={index}
      fieldId={fieldId}
      component={component}
      componentProps={componentProps}
      render={(collection) =>
        collection?.map((item, indexInCollection) => (
          <Field
            key={indexInCollection}
            model={model}
            index={subIndexGenerator(indexInCollection)}
            fieldId={fieldId}
            component={itemComponent}
            componentProps={itemPropsGenerator(item, indexInCollection)}
          >
            {renderItem(item, subIndexGenerator(indexInCollection), indexInCollection, collection)}
          </Field>
        ))
      }
    />
  );
}

RenderRepeat.propTypes = {
  model: PropTypes.object.isRequired,
  index: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  fieldId: PropTypes.string.isRequired,
  component: PropTypes.elementType,
  componentProps: PropTypes.object,
  itemComponent: PropTypes.elementType,
  itemProps: PropTypes.object,
  renderItem: PropTypes.func.isRequired
};

export default RenderRepeat;
