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

import { defineMessages } from 'react-intl';

export const translations = defineMessages({
  title: {
    id: 'uploadDialog.title',
    defaultMessage: 'Upload'
  },
  uploadInProgress: {
    id: 'uploadDialog.uploadInProgress',
    defaultMessage:
      'Uploads are still in progress. Leaving this page would stop the pending uploads. Are you sure you wish to leave?'
  },
  uploadInProgressConfirmation: {
    id: 'uploadDialog.uploadInProgressConfirmation',
    defaultMessage:
      'Uploads are still in progress. Closing this modal would stop the pending uploads. Are you sure you wish to close it?'
  },
  noDuplicates: {
    id: 'uppyCore.noDuplicates',
    defaultMessage: "Cannot add the duplicate file “%'{fileName}'”, it already exists"
  }
});

export default translations;
