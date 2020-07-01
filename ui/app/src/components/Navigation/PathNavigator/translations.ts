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

import { defineMessages } from 'react-intl';

export const translations = defineMessages({
  previousPage: {
    id: 'pagination.previousPage',
    defaultMessage: 'Previous page'
  },
  nextPage: {
    id: 'pagination.nextPage',
    defaultMessage: 'Next page'
  },
  itemsSelected: {
    id: 'craftercms.pages.widget.itemsSelected',
    defaultMessage: '{count, plural, one {{count} Item selected} other {{count} Items selected}}'
  },
  copyDialogTitle: {
    id: 'craftercms.copy.dialog.title',
    defaultMessage: 'Copy'
  },
  copyDialogSubtitle: {
    id: 'craftercms.copy.dialog.subtitle',
    defaultMessage:
      'Please select any of the sub-pages you would like to batch copy. When pasting, any selected sub-pages and their positional heirarchy will be retained.'
  },
  edit: {
    id: 'words.edit',
    defaultMessage: 'Edit'
  },
  view: {
    id: 'words.view',
    defaultMessage: 'View'
  },
  newContent: {
    id: 'craftercms.pages.option.newContent',
    defaultMessage: 'New Content'
  },
  newFolder: {
    id: 'craftercms.pages.option.newFolder',
    defaultMessage: 'New Folder'
  },
  changeTemplate: {
    id: 'craftercms.pages.option.changeTemplate',
    defaultMessage: 'Change Template'
  },
  cut: {
    id: 'words.cut',
    defaultMessage: 'Cut'
  },
  copy: {
    id: 'words.copy',
    defaultMessage: 'Copy'
  },
  paste: {
    id: 'words.paste',
    defaultMessage: 'Paste'
  },
  duplicate: {
    id: 'words.duplicate',
    defaultMessage: 'Duplicate'
  },
  delete: {
    id: 'words.delete',
    defaultMessage: 'Delete'
  },
  dependencies: {
    id: 'words.dependencies',
    defaultMessage: 'Dependencies'
  },
  history: {
    id: 'words.history',
    defaultMessage: 'History'
  },
  translation: {
    id: 'words.translation',
    defaultMessage: 'Translation'
  },
  select: {
    id: 'words.select',
    defaultMessage: 'Select'
  },
  terminateSelection: {
    id: 'craftercms.pages.option.terminateSelection',
    defaultMessage: 'Terminate Selection'
  },
  duplicateDialogBody: {
    id: 'duplicate.dialog.body',
    defaultMessage: 'A new copy of this item and all of it\'s item specific content will be created. Are you sure you wish to proceed?'
  }
});
