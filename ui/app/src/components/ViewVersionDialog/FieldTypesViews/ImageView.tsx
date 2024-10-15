/*
 * Copyright (C) 2007-2024 Crafter Software Corporation. All Rights Reserved.
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

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import React from 'react';
import { fromString } from '../../../utils/xml';
import { ViewComponentBaseProps } from '../utils';
import { parseElementByContentType } from '../../../utils/content';
import useContentTypes from '../../../hooks/useContentTypes';
import { PartialSxRecord } from '../../../models';

export interface ImageViewProps extends ViewComponentBaseProps {
  sxs?: PartialSxRecord<'image' | 'label'>;
}

export function ImageView(props: ImageViewProps) {
  const { xml, field, sxs } = props;
  const contentTypes = useContentTypes();
  const content = xml
    ? parseElementByContentType(fromString(xml).querySelector(field.id), field, contentTypes, {})
    : '';

  return (
    <>
      <Box component="img" src={content} alt="" sx={{ maxWidth: '100%', ...sxs?.image }} />
      <Typography variant="subtitle2" sx={{ ...sxs?.label }}>
        {content}
      </Typography>
    </>
  );
}

export default ImageView;
