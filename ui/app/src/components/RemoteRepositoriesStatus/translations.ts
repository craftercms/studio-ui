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

export const messages = defineMessages({
  revertPullSuccessMessage: {
    id: 'repositories.revertPullSuccessMessage',
    defaultMessage: 'Successfully reverted repository.'
  },
  commitSuccessMessage: {
    id: 'repositories.commitSuccessMessage',
    defaultMessage: 'Successfully committed.'
  },
  revertAll: {
    id: 'repositories.revertAll',
    defaultMessage: 'Revert All'
  },
  no: {
    id: 'words.no',
    defaultMessage: 'No'
  },
  yes: {
    id: 'words.yes',
    defaultMessage: 'Yes'
  },
  confirmHelper: {
    id: 'repositories.confirmHelper',
    defaultMessage: "Cancel pull operation and keep what's on this repository."
  },
  acceptRemote: {
    id: 'repositories.acceptRemote',
    defaultMessage: 'Accept Remote'
  },
  acceptRemoteHelper: {
    id: 'repositories.acceptRemoteHelper',
    defaultMessage: 'Override local file with the version pulled from remote.'
  },
  keepLocal: {
    id: 'repositories.keepLocal',
    defaultMessage: 'Keep Local'
  },
  keepLocalHelper: {
    id: 'repositories.keepLocalHelper',
    defaultMessage: 'Discard remote changes and keep the local file.'
  },
  diff: {
    id: 'words.diff',
    defaultMessage: 'Diff'
  }
});
