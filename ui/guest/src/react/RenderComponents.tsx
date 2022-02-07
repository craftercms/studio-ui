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
import { ElementType } from 'react';
import ContentType from './ContentType';
import RenderRepeat, { RenderRepeatProps } from './RenderRepeat';
import { ContentInstance } from '@craftercms/studio-ui/models';
import PropTypes from 'prop-types';

export interface RenderComponentsProps<
  RootProps = {},
  ItemProps = {},
  ItemType extends ContentInstance = ContentInstance
> extends Pick<
    RenderRepeatProps<RootProps, ItemProps, ItemType>,
    'model' | 'index' | 'fieldId' | 'component' | 'componentProps' | 'itemComponent' | 'itemProps'
  > {
  contentTypeMap: Record<string, ElementType>;
  renderItem?: RenderRepeatProps<RootProps, ItemProps, ItemType>['renderItem'];
}

export function RenderComponents<RootProps = {}, ItemProps = {}, ItemType extends ContentInstance = ContentInstance>(
  props: RenderComponentsProps<RootProps, ItemProps, ItemType>
) {
  const {
    contentTypeMap,
    renderItem = (component) => <ContentType model={component as ContentInstance} contentTypeMap={contentTypeMap} />
  } = props;
  // @ts-ignore - types aren't working quite well (RenderComponents vs RenderRepeat types aren't matching)
  return <RenderRepeat {...props} renderItem={renderItem} />;
}

RenderComponents.propTypes = { ...RenderRepeat.propTypes, renderItem: PropTypes.func };

export default RenderComponents;
