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
import { createRoot } from 'react-dom/client';
import ExperienceBuilder, { ExperienceBuilderProps } from './react/ExperienceBuilder';
import GuestProxy from './react/GuestProxy';
import ContentInstance from '@craftercms/studio-ui/models/ContentInstance';
import { nnou } from '@craftercms/studio-ui/utils/object';
import * as elementRegistry from './elementRegistry';
import * as iceRegistry from './iceRegistry';
import * as contentController from './contentController';
import { fromTopic, post } from './utils/communicator';
import queryString from 'query-string';
import { crafterConf } from '@craftercms/classes';
import { fetchIsAuthoring, BaseCrafterConfig } from '@craftercms/ice';
import { xbLoadedEvent } from './constants';

export interface ICEAttributes {
  'data-craftercms-model-path': string;
  'data-craftercms-model-id': string;
  'data-craftercms-field-id'?: string;
  'data-craftercms-index'?: string | number;
  'data-craftercms-label'?: string;
  'data-craftercms-type'?: 'collection';
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

export { fetchIsAuthoring };

export function addAuthoringSupport(config?: Partial<BaseCrafterConfig>): Promise<any> {
  config = crafterConf.mix(config);
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = `${config.baseUrl}/studio/static-assets/scripts/craftercms-xb.umd.js`;
    script.addEventListener('load', () => {
      // @ts-ignore
      resolve(window.craftercms?.xb);
    });
    document.head.appendChild(script);
  });
}

export function initExperienceBuilder(props: ExperienceBuilderProps) {
  const guestProxyElement = document.createElement('craftercms-guest-proxy');
  const { crafterCMSGuestDisabled } = queryString.parse(window.location.search);
  const root = createRoot(guestProxyElement);
  root.render(
    // @ts-ignore - typing system is not playing nice with the {path} | {model} options of GuestProps
    <ExperienceBuilder isAuthoring={crafterCMSGuestDisabled !== 'true'} {...props}>
      {crafterCMSGuestDisabled !== 'true' && <GuestProxy />}
    </ExperienceBuilder>
  );
  return { unmount: () => root.unmount() };
}

/** @deprecated Use `initExperienceBuilder` instead. */
export const initInContextEditing = initExperienceBuilder;

export { elementRegistry, iceRegistry, contentController, fromTopic, post };

setTimeout(() => document?.dispatchEvent(new CustomEvent(xbLoadedEvent)));
