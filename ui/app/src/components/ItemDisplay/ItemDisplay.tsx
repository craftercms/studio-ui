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
import { forwardRef } from 'react';
import { DetailedItem, SandboxItem } from '../../models/Item';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { CSSProperties } from '@material-ui/styles';
import clsx from 'clsx';
import palette from '../../styles/palette';
import Typography, { TypographyProps } from '@material-ui/core/Typography';
import UnknownStateIcon from '@material-ui/icons/HelpOutlineRounded';
import ImageIcon from '@material-ui/icons/ImageOutlined';
import ComponentIcon from '../Icons/Component';
import FolderIcon from '@material-ui/icons/FolderOpenRounded';
import PageIcon from '../Icons/Page';
import LevelDescriptorIcon from '../Icons/LevelDescriptor';
import Tooltip from '@material-ui/core/Tooltip';
import { capitalize } from '../../utils/string';
import { isPreviewable } from '../PathNavigator/utils';
import Js from '../Icons/Js';
import CodeRounded from '@material-ui/icons/CodeRounded';
import Groovy from '../Icons/Groovy';
import Freemarker from '../Icons/Freemarker';
import Html from '../Icons/Html';
import TextIcon from '@material-ui/icons/SubjectRounded';
import Css from '../Icons/Css';
import TaxonomyIcon from '@material-ui/icons/LocalOfferOutlined';
import JsonIcon from '../Icons/Json';
import FontIcon from '@material-ui/icons/FontDownloadOutlined';
import ItemPublishingTargetIcon from '../ItemPublishingTargetIcon';
import ItemStateIcon from '../ItemStateIcon';

export type ItemDisplayClassKey =
  | 'root'
  | 'label'
  | 'labelPreviewable'
  | 'publishingIcon'
  | 'icon'
  | 'typeIcon'
  | 'stateIcon'
  | 'stateNewIcon'
  | 'stateModifiedIcon'
  | 'stateDeletedIcon'
  | 'stateLockedIcon'
  | 'stateSystemProcessingIcon'
  | 'stateSubmittedIcon'
  | 'stateScheduledIcon'
  | 'publishingTargetStaged'
  | 'publishingTargetLive';

export type ItemDisplayStyles = Partial<Record<ItemDisplayClassKey, CSSProperties>>;

export interface ItemDisplayProps<LabelTypographyComponent extends React.ElementType = 'span'>
  extends React.HTMLAttributes<HTMLSpanElement> {
  showPublishingTarget?: boolean;
  showWorkflowState?: boolean;
  showItemType?: boolean;
  showNavigableAsLinks?: boolean;
  classes?: Partial<Record<ItemDisplayClassKey, string>>;
  styles?: ItemDisplayStyles;
  item: DetailedItem | SandboxItem;
  labelTypographyProps?: TypographyProps<LabelTypographyComponent, { component?: LabelTypographyComponent }>;
  isNavigableFn?: (item: DetailedItem | SandboxItem) => boolean;
}

export interface ItemIconProps {
  item: DetailedItem | SandboxItem;
  classes: ItemDisplayProps['classes'];
}

const useStyles = makeStyles((theme) =>
  createStyles<ItemDisplayClassKey, ItemDisplayStyles>({
    root: (styles) => ({
      display: 'inline-flex',
      alignItems: 'center',
      placeContent: 'left center',
      ...styles.root
    }),
    label: (styles) => ({
      ...styles.label
    }),
    labelPreviewable: (styles) => ({
      color: theme.palette.type === 'dark' ? palette.teal.tint : palette.teal.shade,
      ...styles.labelPreviewable
    }),
    icon: (styles) => ({
      fontSize: '1rem',
      ...styles.icon
    }),
    typeIcon: (styles) => ({
      marginRight: 3,
      ...styles.typeIcon
    }),
    publishingIcon: (styles) => ({
      color: palette.gray.medium2,
      ...styles.publishingIcon
    }),
    publishingTargetLive: (styles) => ({
      color: palette.green.main,
      ...styles.publishingTargetLive
    }),
    publishingTargetStaged: (styles) => ({
      color: palette.blue.main,
      ...styles.publishingTargetStaged
    }),
    stateIcon: (styles) => ({
      ...styles.stateIcon
    }),
    stateNewIcon: (styles) => ({
      color: palette.teal.main,
      ...styles.stateNewIcon
    }),
    stateModifiedIcon: (styles) => ({
      color: palette.yellow.main,
      ...styles.stateModifiedIcon
    }),
    stateDeletedIcon: (styles) => ({
      color: palette.red.main,
      ...styles.stateDeletedIcon
    }),
    stateLockedIcon: (styles) => ({
      color: palette.orange.main,
      ...styles.stateLockedIcon
    }),
    stateSystemProcessingIcon: (styles) => ({
      color: palette.pink.main,
      ...styles.stateSystemProcessingIcon
    }),
    stateSubmittedIcon: (styles) => ({
      color: palette.purple.main,
      ...styles.stateSubmittedIcon
    }),
    stateScheduledIcon: (styles) => ({
      color: palette.green.main,
      ...styles.stateScheduledIcon
    })
  })
);

export function getItemTypeText(item: DetailedItem | SandboxItem) {
  return `${capitalize(item.systemType ?? 'Unknown')} - ${item.mimeType}`;
}

export function ItemTypeIcon(props: ItemIconProps) {
  const { item, classes } = props;
  let TheIcon = UnknownStateIcon;
  switch (item.systemType) {
    case 'asset':
      if (item.mimeType.includes('image/')) {
        TheIcon = ImageIcon;
      } else {
        switch (item.mimeType) {
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
      <TheIcon className={clsx(classes.icon, classes.typeIcon)} />
    </Tooltip>
  );
}

const ItemDisplay = forwardRef<HTMLSpanElement, ItemDisplayProps>((props, ref) => {
  const {
    item,
    styles,
    classes: propClasses,
    showPublishingTarget = true,
    showWorkflowState = true,
    showItemType = true,
    showNavigableAsLinks = true,
    isNavigableFn = isPreviewable,
    labelTypographyProps,
    ...rest
  } = props;
  const classes = useStyles(props.styles);
  return (
    <span ref={ref} {...rest} className={clsx(classes.root, propClasses?.root, rest?.className)}>
      {showPublishingTarget && <ItemPublishingTargetIcon item={item} classes={classes} />}
      {showWorkflowState && <ItemStateIcon item={item} classes={classes} />}
      {showItemType && <ItemTypeIcon item={item} classes={classes} />}
      <Typography
        noWrap
        component="span"
        {...labelTypographyProps}
        className={clsx(
          classes.label,
          showNavigableAsLinks && isNavigableFn(item) && classes.labelPreviewable,
          labelTypographyProps?.className
        )}
        title={item.label}
        children={item.label}
      />
    </span>
  );
});

export default ItemDisplay;
