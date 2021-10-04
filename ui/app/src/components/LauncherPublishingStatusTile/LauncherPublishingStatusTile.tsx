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

import React from 'react';
import PublishingStatusTile from '../PublishingStatusTile';
import { closeLauncher, showPublishingStatusDialog } from '../../state/actions/dialogs';
import { useDispatch } from 'react-redux';
import { batchActions } from '../../state/actions/misc';
import { Tooltip } from '@mui/material';
import { useIntl } from 'react-intl';
import { useSelection } from '../../utils/hooks/useSelection';
import { publishingStatusMessages } from '../PublishingStatusDisplay';

function LauncherPublishingStatusTile() {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const state = useSelection((state) => state.dialogs.publishingStatus);
  return (
    <Tooltip title={formatMessage(publishingStatusMessages.publishingStatus)} disableFocusListener disableTouchListener>
      <PublishingStatusTile
        status={state.status}
        isFetching={state.isFetching}
        onClick={() => dispatch(batchActions([closeLauncher(), showPublishingStatusDialog({})]))}
      />
    </Tooltip>
  );
}

export default LauncherPublishingStatusTile;
