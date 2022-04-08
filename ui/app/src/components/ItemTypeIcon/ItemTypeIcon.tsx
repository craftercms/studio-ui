/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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
import Js from '../../icons/Js';
import JsonIcon from '../../icons/Json';
import Groovy from '../../icons/Groovy';
import Freemarker from '../../icons/Freemarker';
import Html from '../../icons/Html';
import Css from '../../icons/Css';
import ComponentIcon from '../../icons/Component';
import PageIcon from '../../icons/Page';
import LevelDescriptorIcon from '../../icons/LevelDescriptor';
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
import clsx from 'clsx';
import { IntlFormatters, useIntl } from 'react-intl';
import { messages } from './translations';

export interface ItemTypeIconProps {
  item: DetailedItem | SandboxItem;
  classes?: ItemDisplayProps['classes'];
  className?: string;
}

export function getItemTypeText(item: DetailedItem | SandboxItem, formatMessage: IntlFormatters['formatMessage']) {
  return messages[item.systemType]
    ? formatMessage(messages[item.systemType])
    : item.mimeType
    ? item.mimeType
    : formatMessage(messages.unknown);
}

export function ItemTypeIcon(props: ItemTypeIconProps) {
  const { item, classes, className } = props;
  const { formatMessage } = useIntl();
  let TheIcon = UnknownStateIcon;
  switch (item.systemType) {
    case 'file':
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
    <Tooltip title={getItemTypeText(item, formatMessage)}>
      <TheIcon className={clsx(classes?.root, className)} />
    </Tooltip>
  );
}

export default ItemTypeIcon;
