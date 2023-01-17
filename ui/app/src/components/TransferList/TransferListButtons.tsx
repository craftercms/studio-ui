/*
 * Copyright (C) 2007-2023 Crafter Software Corporation. All Rights Reserved.
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
import Tooltip from '@mui/material/Tooltip';
import { FormattedMessage } from 'react-intl';
import IconButton from '@mui/material/IconButton';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import useStyles from './styles';

export interface TransferListButtonsProps {
  disableAdd: boolean;
  disableRemove: boolean;
  addToTarget(): void;
  removeFromTarget(): void;
}

export function TransferListButtons(props: TransferListButtonsProps) {
  const { disableAdd, disableRemove, addToTarget, removeFromTarget } = props;
  const { classes } = useStyles();

  return (
    <section className={classes.buttonsWrapper}>
      <Tooltip
        title={
          disableAdd ? (
            <FormattedMessage id="transferList.addDisabledTooltip" defaultMessage="Select items to add from the left" />
          ) : (
            <FormattedMessage id="transferList.addToTarget" defaultMessage="Add selected" />
          )
        }
      >
        <span>
          <IconButton onClick={addToTarget} disabled={disableAdd} size="large">
            <NavigateNextIcon />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip
        title={
          disableRemove ? (
            <FormattedMessage
              id="transferList.removeDisabledTooltip"
              defaultMessage="Select items to remove from the right"
            />
          ) : (
            <FormattedMessage id="transferList.removeFromTarget" defaultMessage="Remove selected" />
          )
        }
      >
        <span>
          <IconButton onClick={removeFromTarget} disabled={disableRemove} size="large">
            <NavigateBeforeIcon />
          </IconButton>
        </span>
      </Tooltip>
    </section>
  );
}

export default TransferListButtons;
