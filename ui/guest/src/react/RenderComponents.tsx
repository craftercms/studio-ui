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

import * as React from 'react';
import { ElementType, forwardRef } from 'react';
import ContentType, { defaultContentTypeMap } from './ContentType';
import RenderRepeat, { RenderRepeatProps } from './RenderRepeat';
import { ContentInstance } from '@craftercms/studio-ui/models';
import PropTypes from 'prop-types';

export type RenderComponentsProps<
  RootProps = {},
  ItemProps = {},
  ItemType extends ContentInstance = ContentInstance
> = Omit<RenderRepeatProps<RootProps, ItemProps, ItemType>, 'renderItem'> & {
  contentTypeProps?: Record<string, any>;
  nthContentTypeProps?: Record<number, any>;
} & (
    | {
        contentTypeMap: Record<string, ElementType>;
        renderItem?: RenderRepeatProps<RootProps, ItemProps, ItemType>['renderItem'];
      }
    | {
        contentTypeMap?: Record<string, ElementType>;
        renderItem: RenderRepeatProps<RootProps, ItemProps, ItemType>['renderItem'];
      }
  );

export const RenderComponents = forwardRef<any, RenderComponentsProps>((props, ref) => {
  const {
    contentTypeMap = defaultContentTypeMap,
    contentTypeProps = {},
    nthContentTypeProps = {},
    renderItem = (component, index) => (
      <ContentType
        model={component as ContentInstance}
        contentTypeMap={contentTypeMap}
        {...{ ...contentTypeProps, ...nthContentTypeProps[index] }}
      />
    )
  } = props;
  return (
    <RenderRepeat
      {...props}
      // Next like is to avoid compiler complaining about the `itemKeyGenerator` prop differences.
      // TODO: Is there a way to carry the type correctly?
      itemKeyGenerator={props.itemKeyGenerator as any}
      ref={ref}
      renderItem={renderItem}
    />
  );
});

RenderComponents.propTypes = { ...RenderRepeat.propTypes, renderItem: PropTypes.func };

export default RenderComponents;
