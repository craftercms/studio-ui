/*
 * Copyright (C) 2007-2025 Crafter Software Corporation. All Rights Reserved.
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

import Checkbox, { CheckboxProps } from '@mui/material/Checkbox';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Alert, { alertClasses, AlertProps } from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grow from '@mui/material/Grow';

export interface FolderMoveAlertProps extends Pick<AlertProps, 'variant' | 'sx'> {
  checked: boolean;
  initialExpanded?: boolean;
  itemType?: 'folder' | 'page';
  action?: 'move' | 'rename';
  autoFocus?: boolean;
  onChange: CheckboxProps['onChange'];
}

export function FolderMoveAlert({
  checked = false,
  initialExpanded = false,
  itemType = 'folder',
  action = 'rename',
  autoFocus = false,
  onChange,
  variant = 'standard',
  sx
}: FolderMoveAlertProps) {
  const [open, setOpen] = useState(checked || initialExpanded);
  const i18nValues = {
    itemType:
      itemType === 'folder' ? <FormattedMessage defaultMessage="folder" /> : <FormattedMessage defaultMessage="page" />,
    action:
      action === 'move' ? <FormattedMessage defaultMessage="moved" /> : <FormattedMessage defaultMessage="renamed" />,
    b: (msg) => <strong>{msg}</strong>
  };
  return (
    <Alert
      variant={variant}
      icon={false}
      severity="warning"
      // TODO: use consolidateSx utility function once merged into `develop`
      sx={[{ [`.${alertClasses.message}`]: { overflow: 'visible' } }, sx].flatMap((i) => i)}
      action={
        checked ? null : (
          <IconButton
            color="primary"
            size="small"
            onClick={() => {
              !checked && setOpen(!open);
            }}
          >
            <ExpandMoreRounded
              sx={(theme) => ({
                // Add transform to rotate 180deg when collapsed
                transform: open ? 'rotate(180deg)' : 'none',
                // Animate the rotation
                transition: theme.transitions.create('transform', { duration: theme.transitions.duration.standard })
              })}
            />
          </IconButton>
        )
      }
    >
      <FormControlLabel
        disableTypography
        control={<Checkbox autoFocus={autoFocus} color="primary" checked={checked} onChange={onChange} />}
        label={
          <Box>
            <Typography>
              <FormattedMessage
                defaultMessage="This action may break references to items in the {itemType} being {action}."
                values={i18nValues}
              />
            </Typography>
            <Grow mountOnEnter unmountOnExit in={open || checked}>
              <Typography variant="body2" component="div" sx={{ mt: 1, p: 0 }}>
                <FormattedMessage defaultMessage="Make sure:" />
                <Box sx={{ my: 0, pl: 2 }} component="ol">
                  <li>
                    <FormattedMessage
                      defaultMessage="Items in the {itemType} being {action} <b>must</b> be published individually or in bulk to complete the move in the published staged or live project."
                      values={i18nValues}
                    />
                  </li>
                  <li>
                    <FormattedMessage defaultMessage="Change references to point to the new paths." />
                  </li>
                </Box>
              </Typography>
            </Grow>
          </Box>
        }
      />
    </Alert>
  );
}

export default FolderMoveAlert;
