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

import React, { ComponentType, ElementType, PropsWithChildren } from 'react';
import ContentInstance from '@craftercms/studio-ui/models/ContentInstance';

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

export function ContentType(props: ContentTypeProps) {
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
    contentTypeMap = {},
    notMappedComponent: NotDeveloped = NotDevelopedDefault,
    notFoundComponent: NotFound = NotFoundDefault,
    ...rest
  } = props;
  // prettier-ignore
  const Component = (model === null) ? NotFound : (
    contentTypeMap[model.craftercms.contentTypeId] ?? NotDeveloped
  );
  return <Component model={model} {...rest} />;
}

export default ContentType;
