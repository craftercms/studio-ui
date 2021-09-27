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

import UnknownStateIcon from '@material-ui/icons/HelpOutlineRounded';
import Js from '../Icons/Js';
import JsonIcon from '../Icons/Json';
import Groovy from '../Icons/Groovy';
import Freemarker from '../Icons/Freemarker';
import Html from '../Icons/Html';
import Css from '../Icons/Css';
import ComponentIcon from '../Icons/Component';
import PageIcon from '../Icons/Page';
import LevelDescriptorIcon from '../Icons/LevelDescriptor';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import * as React from 'react';
import { ItemDisplayProps } from '../ItemDisplay';
import ImageIcon from '@material-ui/icons/ImageOutlined';
import CodeRounded from '@material-ui/icons/CodeRounded';
import FontIcon from '@material-ui/icons/FontDownloadOutlined';
import TextIcon from '@material-ui/icons/SubjectRounded';
import FolderIcon from '@material-ui/icons/FolderOpenRounded';
import TaxonomyIcon from '@material-ui/icons/LocalOfferOutlined';
import { DetailedItem, SandboxItem } from '../../models/Item';
import clsx from 'clsx';
import { defineMessages, IntlFormatters, useIntl } from 'react-intl';

const messages = defineMessages({
  asset: {
    id: 'systemType.asset',
    defaultMessage: 'Asset'
  },
  component: {
    id: 'systemType.component',
    defaultMessage: 'Component'
  },
  page: {
    id: 'systemType.page',
    defaultMessage: 'Page'
  },
  folder: {
    id: 'systemType.folder',
    defaultMessage: 'Folder'
  },
  levelDescriptor: {
    id: 'systemType.levelDescriptor',
    defaultMessage: 'Level Descriptor'
  },
  renderingTemplate: {
    id: 'systemType.renderingTemplate',
    defaultMessage: 'Rendering Template'
  },
  script: {
    id: 'systemType.script',
    defaultMessage: 'Script'
  },
  taxonomy: {
    id: 'systemType.taxonomy',
    defaultMessage: 'Taxonomy'
  },
  unknown: {
    id: 'words.unknown',
    defaultMessage: 'Unknown'
  }
});

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

export default function ItemTypeIcon(props: ItemTypeIconProps) {
  const { item, classes, className } = props;
  const { formatMessage } = useIntl();
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
    <Tooltip title={getItemTypeText(item, formatMessage)}>
      <TheIcon className={clsx(classes?.root, className)} />
    </Tooltip>
  );
}
