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

import React, { ComponentType, ElementType, forwardRef, PropsWithChildren } from 'react';
import ContentInstance from '@craftercms/studio-ui/models/ContentInstance';
import { isForwardRef } from 'react-is';

export type PropsWithModel = PropsWithChildren<{ model: ContentInstance }>;

export interface ContentTypeProps<P extends PropsWithModel = PropsWithModel> {
  model: ContentInstance;
  contentTypeMap: Record<string, ElementType<P>>;
  notFoundComponent?: ComponentType<P>;
  notMappedComponent?: ComponentType<P>;
}

export function NotFoundDefault() {
  return (
    <section>
      <p>Content not found.</p>
    </section>
  );
}

export function NotDevelopedDefault() {
  return <section>The page you've selected needs to be created by the site developers.</section>;
}

export const defaultContentTypeMap: Record<string, ElementType<any>> = {
  null: NotFoundDefault,
  undefined: NotFoundDefault
};

export const ContentType = forwardRef<any, ContentTypeProps>(function (props, ref) {
  if (!props.contentTypeMap) {
    console.error(
      `The content type map was not supplied to ContentType component. ${
        Boolean(props.model)
          ? `"${props.model.craftercms.label}" component of type "${props.model.craftercms.contentTypeId}" won't render.`
          : ''
      }`
    );
  }
  const {
    model,
    contentTypeMap = defaultContentTypeMap,
    notMappedComponent: NotDeveloped = NotDevelopedDefault,
    notFoundComponent: NotFound = NotFoundDefault,
    ...rest
  } = props;

  const Component = model === null ? NotFound : contentTypeMap[model?.craftercms?.contentTypeId] ?? NotDeveloped;

  const finalProps: any = rest;
  if (typeof Component !== 'string') {
    // Avoid <div model="[Object object]">
    finalProps.model = model;
  }
  if (isForwardRef(Component) || typeof Component === 'string') {
    finalProps.ref = ref;
  }

  return <Component {...finalProps} />;
});

export default ContentType;
