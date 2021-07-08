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
import { IconButton, IconButtonProps } from '@material-ui/core';
import ArrowBackIosRoundedIcon from '@material-ui/icons/ArrowBackIosRounded';
import { useDispatch } from 'react-redux';
import { useHistoryBackStack } from '../../utils/hooks/useHistoryBackStack';
import { FormattedMessage } from 'react-intl';
import Tooltip from '@material-ui/core/Tooltip';
import { goToLastPage } from '../../state/actions/preview';

export interface PreviewBackButtonProps extends IconButtonProps {}

export default function PreviewBackButton(props: PreviewBackButtonProps) {
  const stack = useHistoryBackStack();
  const dispatch = useDispatch();
  const onClick = () => {
    dispatch(goToLastPage());
  };

  return (
    <Tooltip title={<FormattedMessage id="backButtonStack.back" defaultMessage="Back" />}>
      <span>
        <IconButton disabled={stack.length <= 1} onClick={onClick} {...props}>
          <ArrowBackIosRoundedIcon />
        </IconButton>
      </span>
    </Tooltip>
  );
}
