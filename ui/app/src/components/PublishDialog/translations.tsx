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

const translations = defineMessages({
  title: {
    id: 'publishDialog.title',
    defaultMessage: 'Publish'
  },
  publishSubtitle: {
    id: 'publishDialog.publishSubtitle',
    defaultMessage: 'Selected files will go live upon submission.'
  },
  requestPublishSubtitle: {
    id: 'publishDialog.requestPublishSubtitle',
    defaultMessage: 'Selected files will be submitted for review upon submission.'
  },
  subtitleHelperText: {
    id: 'publishDialog.subtitleHelperText',
    defaultMessage:
      'Hard dependencies are automatically submitted with the main items. You may choose whether to submit or not soft dependencies'
  }
});

export default translations;
