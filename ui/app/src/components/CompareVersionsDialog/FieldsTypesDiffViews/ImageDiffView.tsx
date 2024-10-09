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

import ImageView from '../../ViewVersionDialog/FieldTypesViews/ImageView';
import DiffViewLayout from './DiffViewLayout';
import Box from '@mui/material/Box';
import { DiffViewComponentBaseProps } from '../utils';

export interface ImageDiffViewProps extends DiffViewComponentBaseProps {}

export function ImageDiffView(props: ImageDiffViewProps) {
  const { aXml, bXml, field } = props;
  return (
    <DiffViewLayout
      aXml={aXml}
      bXml={bXml}
      field={field}
      renderContent={(xml) => (
        <Box sx={{ height: 'calc(50% - 9px)' }}>
          <ImageView xml={xml} field={field} />
        </Box>
      )}
    />
  );
}

export default ImageDiffView;
