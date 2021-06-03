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
  remoteCreateSuccessMessage: {
    id: 'repositories.remoteCreateSuccessMessage',
    defaultMessage: 'Remote repository created successfully.'
  },
  noConflicts: {
    id: 'repositories.noConflicts',
    defaultMessage: 'Local repository is free of conflicts.'
  },
  conflictsExist: {
    id: 'repositories.conflictsExist',
    defaultMessage: 'Repository operations are disabled while conflicts exist. Please resolve conflicts.'
  },
  pendingCommit: {
    id: 'repositories.pendingCommit',
    defaultMessage: 'Repo contains files pending commit. See Repository status below for details.'
  },
  unstagedFiles: {
    id: 'repositories.unstagedFiles',
    defaultMessage: 'There are unstaged files in your repository.'
  }
});

export default translations;
