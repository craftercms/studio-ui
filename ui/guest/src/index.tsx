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

import React from 'react';
import ReactDOM from 'react-dom';
import Guest from './react/Guest';
import GuestProxy from './react/GuestProxy';
import ContentInstance from '@craftercms/studio-ui/models/ContentInstance';
import { nnou } from './utils/object';

export interface BaseCrafterConfig {
  baseUrl?: string;
}

export interface ICEAttributes {
  'data-craftercms-model-path': string;
  'data-craftercms-model-id': string;
  'data-craftercms-field-id'?: string;
  'data-craftercms-index'?: string | number;
  'data-craftercms-label'?: string;
}

export interface ICEConfig {
  model: ContentInstance;
  fieldId?: string;
  index?: string | number;
  label?: string;
  isAuthoring: boolean;
}

export function getICEAttributes(config: ICEConfig): ICEAttributes {
  let { model, fieldId, index, label, isAuthoring = true } = config;
  let attributes = {} as ICEAttributes;

  if (!isAuthoring) {
    return attributes;
  }

  if (label === null || label === undefined) {
    label = model?.craftercms.label || '';
  }

  attributes['data-craftercms-model-id'] = model.craftercms.id;
  attributes['data-craftercms-model-path'] = model.craftercms.path;
  nnou(fieldId) && (attributes['data-craftercms-field-id'] = fieldId);
  nnou(index) && (attributes['data-craftercms-index'] = index);
  nnou(label) && (attributes['data-craftercms-label'] = label);

  return attributes;
}

export function fetchIsAuthoring(config?: BaseCrafterConfig): Promise<boolean> {
  config = { baseUrl: '', ...(config || {}) };
  return fetch(`${config.baseUrl}/api/1/config/preview.json`)
    .then((response) => response.json())
    .then((response) => response.preview);
}

export function initPageBuilder({ path, documentDomain }) {
  const guestProxyElement = document.createElement('craftercms-guest-proxy');
  ReactDOM.render(
    <Guest path={path} isAuthoring documentDomain={documentDomain}>
      <GuestProxy />
    </Guest>,
    guestProxyElement
  );
}
