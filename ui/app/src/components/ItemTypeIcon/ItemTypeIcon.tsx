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

import UnknownStateIcon from '@mui/icons-material/HelpOutlineRounded';
import Js from '../Icons/Js';
import JsonIcon from '../Icons/Json';
import Groovy from '../Icons/Groovy';
import Freemarker from '../Icons/Freemarker';
import Html from '../Icons/Html';
import Css from '../Icons/Css';
import ComponentIcon from '../Icons/Component';
import PageIcon from '../Icons/Page';
import LevelDescriptorIcon from '../Icons/LevelDescriptor';
import Tooltip from '@mui/material/Tooltip';
import * as React from 'react';
import { ItemDisplayProps } from '../ItemDisplay';
import ImageIcon from '@mui/icons-material/ImageOutlined';
import CodeRounded from '@mui/icons-material/CodeRounded';
import FontIcon from '@mui/icons-material/FontDownloadOutlined';
import TextIcon from '@mui/icons-material/SubjectRounded';
import FolderIcon from '@mui/icons-material/FolderOpenRounded';
import TaxonomyIcon from '@mui/icons-material/LocalOfferOutlined';
import { DetailedItem, SandboxItem } from '../../models/Item';
import { capitalize } from '../../utils/string';
import clsx from 'clsx';

export interface ItemTypeIconProps {
  item: DetailedItem | SandboxItem;
  classes?: ItemDisplayProps['classes'];
  className?: string;
}

export function getItemTypeText(item: DetailedItem | SandboxItem) {
  return `${capitalize(item.systemType ?? 'Unknown')} - ${item.mimeType}`;
}

export default function ItemTypeIcon(props: ItemTypeIconProps) {
  const { item, classes, className } = props;
  let TheIcon = UnknownStateIcon;
  switch (item.systemType) {
    case 'asset':
      if (item.mimeType.includes('image/')) {
        TheIcon = ImageIcon;
      } else {
        switch (item.mimeType) {
          case 'application/javascript':
          case 'application/x-javascript':
            TheIcon = Js;
            break;
          case 'application/json':
            TheIcon = JsonIcon;
            break;
          case 'application/x-groovy':
            TheIcon = Groovy;
            break;
          case 'application/x-freemarker':
            TheIcon = Freemarker;
            break;
          case 'text/html':
            TheIcon = Html;
            break;
          case 'text/css':
            TheIcon = Css;
            break;
          case 'text/plain':
            TheIcon = TextIcon;
            break;
          case 'application/xml':
            TheIcon = CodeRounded;
            break;
          case 'font/ttf':
          case 'font/otf':
          case 'font/woff':
          case 'font/woff2':
          case 'application/vnd.ms-fontobject':
            TheIcon = FontIcon;
            break;
          case 'image/vnd.microsoft.icon':
            TheIcon = ImageIcon;
            break;
          default:
            if (item.mimeType.includes('text/')) {
              TheIcon = TextIcon;
            }
            break;
        }
      }
      break;
    case 'component':
      TheIcon = ComponentIcon;
      break;
    case 'page':
      TheIcon = PageIcon;
      break;
    case 'folder':
      TheIcon = FolderIcon;
      break;
    case 'levelDescriptor':
      TheIcon = LevelDescriptorIcon;
      break;
    case 'renderingTemplate':
      TheIcon = Freemarker;
      break;
    case 'script':
      TheIcon = Groovy;
      break;
    case 'taxonomy':
      TheIcon = TaxonomyIcon;
      break;
  }
  return (
    <Tooltip title={getItemTypeText(item)}>
      <TheIcon className={clsx(classes?.root, className)} />
    </Tooltip>
  );
}
