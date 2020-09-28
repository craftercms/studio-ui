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

import { translations } from './translations';
import { DetailedItem } from '../../models/Item';
import LookupTable from '../../models/LookupTable';
import { SectionItem } from '../ContextMenu';
import { withoutIndex } from '../../utils/path';

const menuOptions = {
  edit: {
    id: 'edit',
    label: translations.edit
  },
  view: {
    id: 'view',
    label: translations.view
  },
  createContent: {
    id: 'createContent',
    label: translations.createContent
  },
  createFolder: {
    id: 'createFolder',
    label: translations.createFolder
  },
  delete: {
    id: 'delete',
    label: translations.delete
  },
  changeContentType: {
    id: 'changeContentType',
    label: translations.changeContentType
  },
  cut: {
    id: 'cut',
    label: translations.cut
  },
  copy: {
    id: 'copy',
    label: translations.copy
  },
  paste: {
    id: 'paste',
    label: translations.paste
  },
  duplicate: {
    id: 'duplicate',
    label: translations.duplicate
  },
  schedule: {
    id: 'schedule',
    label: translations.schedule
  },
  publish: {
    id: 'publish',
    label: translations.publish
  },
  reject: {
    id: 'reject',
    label: translations.reject
  },
  history: {
    id: 'history',
    label: translations.history
  },
  dependencies: {
    id: 'dependencies',
    label: translations.dependencies
  },
  translation: {
    id: 'translation',
    label: translations.translation
  },
  editController: {
    id: 'editController',
    label: translations.editController
  },
  editTemplate: {
    id: 'editTemplate',
    label: translations.editTemplate
  }
};

export function generateMenuOptions(item: DetailedItem, permissions: LookupTable<boolean>): SectionItem[][] {
  let options: SectionItem[][] = [];
  const write = permissions.write;
  const read = permissions.read;
  const publish = permissions.publish;
  const reject = permissions.cancel_publish;
  const deleteItem = permissions.delete;
  const createFolder = permissions.create_folder;
  const createContent = permissions.create_content;
  const changeContentType = permissions.change_content_type;

  switch (item.systemType) {
    case 'page': {
      let _optionsA = [];
      if (write) {
        _optionsA.push(menuOptions.edit);
        if (read) {
          _optionsA.push(menuOptions.view);
        }
        if (createFolder) {
          _optionsA.push(menuOptions.createFolder);
        }
        if (createContent) {
          _optionsA.push(menuOptions.createContent);
        }
        if (deleteItem) {
          _optionsA.push(menuOptions.delete);
        }
        if (changeContentType) {
          _optionsA.push(menuOptions.changeContentType);
        }
        if (withoutIndex(item.path) !== '/site/website') {
          _optionsA.push(menuOptions.cut);
          _optionsA.push(menuOptions.copy);
          _optionsA.push(menuOptions.duplicate);
        }
        // TODO: Check clipboard;
        _optionsA.push(menuOptions.paste);
        if (publish && !item.lockOwner && !item.stateMap.live) {
          _optionsA.push(menuOptions.schedule);
          _optionsA.push(menuOptions.publish);
        }
        if (reject && (item.stateMap.staged || item.stateMap.scheduled || item.stateMap.deleted)) {
          _optionsA.push(menuOptions.reject);
        }
        _optionsA.push(menuOptions.history);
        _optionsA.push(menuOptions.dependencies);
        _optionsA.push(menuOptions.translation);
        _optionsA.push(menuOptions.editTemplate);
        _optionsA.push(menuOptions.editController);
      } else if (read) {
        _optionsA.push(menuOptions.view);
      }
      options.push(_optionsA);
      return options;
    }
    default: {
      return options;
    }
  }
}
