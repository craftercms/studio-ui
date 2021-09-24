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

import * as React from 'react';
import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import DeleteContentTypeDialog from '../components/DeleteContentTypeDialog';
import ContentType from '../models/ContentType';

export interface DeleteContentTypeButtonProps {
  contentType: ContentType;
  onComplete?(): void;
}

function DeleteContentTypeButton({ contentType, onComplete }: DeleteContentTypeButtonProps) {
  const [open, setOpen] = useState(false);
  return <>
    <IconButton onClick={() => setOpen(true)} size="large">
      <DeleteRounded />
    </IconButton>
    <DeleteContentTypeDialog
      open={open}
      onClose={() => setOpen(false)}
      contentType={contentType}
      onComplete={() => {
        setOpen(false);
        onComplete?.();
      }}
    />
  </>;
}

export default DeleteContentTypeButton;
