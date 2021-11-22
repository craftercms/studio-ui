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

import Dialog from '@mui/material/Dialog';
import React from 'react';
import ConfigurationSamplePreviewDialogContainer from './ConfigurationSamplePreviewDialogContainer';

export interface ConfigurationSamplePreviewDialogProps {
  open: boolean;
  content: string;
  onClose(): void;
  onClosed?(): void;
  onUseSampleClick(type: 'replace' | 'append'): void;
}

export function ConfigurationSamplePreviewDialog(props: ConfigurationSamplePreviewDialogProps) {
  const { open, onClose } = props;
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <ConfigurationSamplePreviewDialogContainer {...props} />
    </Dialog>
  );
}

export default ConfigurationSamplePreviewDialog;
