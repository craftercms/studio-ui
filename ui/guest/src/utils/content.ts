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

// TODO: To be moved to sdk and/or removed
// https://github.com/craftercms/craftercms/issues/4057
import ContentInstance from '@craftercms/studio-ui/models/ContentInstance';
import LookupTable from '@craftercms/studio-ui/models/LookupTable';
import { forEach } from './array';

export function modelsToLookup(models: ContentInstance[]): LookupTable<ContentInstance> {
  const lookup = {};
  models.forEach((model) => {
    modelsToLookupModelParser(model, lookup);
  });
  return lookup;
}

function modelsToLookupModelParser(model: ContentInstance, lookup: LookupTable<ContentInstance>) {
  if ('craftercms' in model) {
    if (model.craftercms.id === null) {
      // e.g. In editorial, related-articles-widget (some
      // items can use key/value without being "includes")
      // it may simply be a key/value pair. This is an issue
      // of the parseDescriptor function of the @craftercms/content package
      //   <scripts_o item-list="true">
      //     <item>
      //       <key>/scripts/components/related-articles.groovy</key>
      //       <value>related-articles.groovy</value>
      //     </item>
      //   </scripts_o>
      return;
    }
    lookup[model.craftercms.id] = model;
  }
  Object.entries(model).forEach(([prop, value]) => {
    if (prop.endsWith('_o')) {
      const collection: ContentInstance[] = value;
      forEach(collection, (item) => {
        if ('craftercms' in item) {
          if (item.craftercms.id === null) {
            return 'continue';
          }
          // Add model to lookup table
          lookup[item.craftercms.id] = item;
        }
        modelsToLookupModelParser(item, lookup);
      });
    }
  });
}

export function normalizeModelsLookup(models: LookupTable<ContentInstance>) {
  const lookup = {};
  Object.entries(models).forEach(([id, model]) => {
    lookup[id] = normalizeModel(model);
  });
  return lookup;
}

export function normalizeModel(model: ContentInstance): ContentInstance {
  const normalized = { ...model };
  Object.entries(model).forEach(([prop, value]) => {
    if (prop.endsWith('_o')) {
      const collection: ContentInstance[] = value;
      if (collection.length) {
        const isNodeSelector = Boolean(collection[0]?.craftercms?.id);
        if (isNodeSelector) {
          normalized[prop] = collection.map((item) => item.craftercms.id);
        } else {
          normalized[prop] = collection.map((item) => normalizeModel(item));
        }
      }
    }
  });
  return normalized;
}

export function denormalizeModel(
  normalized: ContentInstance,
  modelLookup: LookupTable<ContentInstance>
): ContentInstance {
  const model = { ...normalized };
  Object.entries(model).forEach(([prop, value]) => {
    if (prop.endsWith('_o')) {
      const collection: any[] = value;
      if (collection.length) {
        const isNodeSelector = typeof collection[0] === 'string';
        if (isNodeSelector) {
          model[prop] = collection.map((item) => denormalizeModel(modelLookup[item], modelLookup));
        } else {
          model[prop] = collection.map((item) => denormalizeModel(item, modelLookup));
        }
      }
    }
  });
  return model;
}

/**
 * Creates a list with the ids of all the direct descendant child models
 * @param model {ContentInstance} The model to extract child ids from
 */
export function createChildModelIdList(model: ContentInstance): string[] {
  const children = [];
  Object.entries(model).forEach(([prop, value]) => {
    if (prop.endsWith('_o') && Array.isArray(value)) {
      const collection: ContentInstance[] = value;
      forEach(collection, (item) => {
        if ('craftercms' in item && item.craftercms.id !== null) {
          // Node selector
          children.push(item.craftercms.id);
        } else {
          // Repeating group item
          forEach(Object.entries(item), ([_prop, _value]) => {
            if (_prop.endsWith('_o') && Array.isArray(_value)) {
              const _collection: ContentInstance[] = _value;
              forEach(_collection, (_item) => {
                if ('craftercms' in _item && _item.craftercms.id !== null) {
                  children.push(_item.craftercms.id);
                } else {
                  // Not a node selector, no point to continue iterating
                  // Subsequent levels are calculated by calling this function
                  // with that model as the argument
                  return 'break';
                }
              });
            }
          });
        }
      });
    }
  });
  return children;
}

export function createPathIdMap(models: LookupTable<ContentInstance>): LookupTable<string> {
  const map = {};
  Object.entries(models).forEach(([id, model]) => {
    if (model.craftercms.path) {
      map[model.craftercms.path] = id;
    }
  });
  return map;
}
