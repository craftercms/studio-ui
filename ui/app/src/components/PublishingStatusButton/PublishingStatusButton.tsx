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

import React, { forwardRef } from 'react';
import { IconButtonProps } from '@material-ui/core/IconButton';
import { useDispatch } from 'react-redux';
import PublishingStatusButtonUI, { PublishingStatusButtonUIProps } from './PublishingStatusButtonUI';
import { showPublishingStatusDialog } from '../../state/actions/dialogs';
import { useSelection } from '../../utils/hooks/useSelection';

export interface PublishingStatusButtonProps extends IconButtonProps {
  variant?: PublishingStatusButtonUIProps['variant'];
}

export const PublishingStatusButton = forwardRef<HTMLButtonElement, PublishingStatusButtonProps>((props, ref) => {
  const { enabled, status, isFetching, totalItems, numberOfItems } = useSelection(
    (state) => state.dialogs.publishingStatus
  );
  const dispatch = useDispatch();
  return (
    <PublishingStatusButtonUI
      {...props}
      ref={ref}
      enabled={enabled}
      status={status}
      isFetching={isFetching}
      value={Math.round((numberOfItems / totalItems) * 100)}
      onClick={() => {
        dispatch(showPublishingStatusDialog({}));
      }}
    />
  );
});

export default PublishingStatusButton;
