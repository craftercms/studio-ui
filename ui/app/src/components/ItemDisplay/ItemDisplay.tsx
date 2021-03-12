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
import { DetailedItem, ItemStateMap } from '../../models/Item';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { CSSProperties } from '@material-ui/styles';
import clsx from 'clsx';
import palette from '../../styles/palette';
import Typography, { TypographyProps } from '@material-ui/core/Typography';
import PublishingTargetIcon from '@material-ui/icons/FiberManualRecordRounded';
import NewStateIcon from '@material-ui/icons/StarOutlineRounded';
import EditedStateIcon from '@material-ui/icons/EditOutlined';
import DeletedStateIcon from '@material-ui/icons/DeleteOutlineRounded';
import LockedStateIcon from '../Icons/LockOutline';
import SystemProcessingStateIcon from '@material-ui/icons/HourglassEmptyRounded';
import SubmittedStateIcon from '../Icons/PlanePaperOutline';
import ScheduledStateIcon from '@material-ui/icons/AccessTimeRounded';
import UnknownStateIcon from '@material-ui/icons/HelpOutlineRounded';
import ImageIcon from '@material-ui/icons/ImageOutlined';
import ComponentIcon from '../Icons/Component';
import FolderIcon from '@material-ui/icons/FolderOpenRounded';
import PageIcon from '../Icons/Page';
import LevelDescriptorIcon from '../Icons/LevelDescriptor';
import Tooltip from '@material-ui/core/Tooltip';
import { FormattedMessage } from 'react-intl';
import { capitalize } from '../../utils/string';
import { isNavigable } from '../PathNavigator/utils';
import Js from '../Icons/Js';
import CodeRounded from '@material-ui/icons/CodeRounded';
import Groovy from '../Icons/Groovy';
import Freemarker from '../Icons/Freemarker';
import Html from '../Icons/Html';
import TextIcon from '@material-ui/icons/SubjectRounded';
import Css from '../Icons/Css';
import TaxonomyIcon from '@material-ui/icons/LocalOfferOutlined';
import JsonIcon from '../Icons/Json';

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
  classes?: Partial<Record<ItemDisplayClassKey, string>>;
  styles?: ItemDisplayStyles;
  item: DetailedItem;
  labelTypographyProps?: TypographyProps<LabelTypographyComponent, { component?: LabelTypographyComponent }>;
}

export interface ItemIconProps {
  item: DetailedItem;
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

export function getItemStateText(stateMap: ItemStateMap) {
  switch (true) {
    case stateMap.new:
      return <FormattedMessage id="itemState.new" defaultMessage="New" />;
    case stateMap.modified:
      return <FormattedMessage id="itemState.modified" defaultMessage="Modified" />;
    case stateMap.deleted:
      return <FormattedMessage id="itemState.deleted" defaultMessage="Deleted" />;
    case stateMap.locked:
      return <FormattedMessage id="itemState.locked" defaultMessage="Locked" />;
    case stateMap.systemProcessing:
      return <FormattedMessage id="itemState.systemProcessing" defaultMessage="System Processing" />;
    case stateMap.submitted:
      return <FormattedMessage id="itemState.submitted" defaultMessage="Submitted" />;
    case stateMap.scheduled:
      return <FormattedMessage id="itemState.scheduled" defaultMessage="Scheduled" />;
    default:
      return <FormattedMessage id="words.unknown" defaultMessage="Unknown" />;
  }
}

export function getItemTypeText(item: DetailedItem) {
  return `${capitalize(item.systemType ?? 'Unknown')} - ${item.mimeType}`;
}

export function ItemStateIcon(props: ItemIconProps) {
  const { item, classes } = props;
  let TheIcon = UnknownStateIcon;
  let stateSpecificClass;
  switch (true) {
    case item.stateMap.new:
      TheIcon = NewStateIcon;
      stateSpecificClass = classes.stateNewIcon;
      break;
    case item.stateMap.modified:
      TheIcon = EditedStateIcon;
      stateSpecificClass = classes.stateModifiedIcon;
      break;
    case item.stateMap.deleted:
      TheIcon = DeletedStateIcon;
      stateSpecificClass = classes.stateDeletedIcon;
      break;
    case item.stateMap.locked:
      TheIcon = LockedStateIcon;
      stateSpecificClass = classes.stateLockedIcon;
      break;
    case item.stateMap.systemProcessing:
      TheIcon = SystemProcessingStateIcon;
      stateSpecificClass = classes.stateSystemProcessingIcon;
      break;
    case item.stateMap.submitted:
      TheIcon = SubmittedStateIcon;
      stateSpecificClass = classes.stateSubmittedIcon;
      break;
    case item.stateMap.scheduled:
      TheIcon = ScheduledStateIcon;
      stateSpecificClass = classes.stateScheduledIcon;
      break;
  }
  return (
    <Tooltip title={getItemStateText(item.stateMap)}>
      <TheIcon className={clsx(classes.icon, classes.publishingIcon, stateSpecificClass)} />
    </Tooltip>
  );
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

export function ItemPublishingTargetIcon(props: ItemIconProps) {
  const { item, classes } = props;
  return (
    <Tooltip title={item.stateMap.live ? 'Live' : item.stateMap.staged ? 'Staged' : 'Unpublished'}>
      <PublishingTargetIcon
        className={clsx(
          classes.icon,
          classes.publishingIcon,
          item.stateMap.live && classes.publishingTargetLive,
          item.stateMap.staged && classes.publishingTargetStaged
        )}
      />
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
        className={clsx(classes.label, isNavigable(item) && classes.labelPreviewable, labelTypographyProps?.className)}
        title={item.label}
        children={item.label}
      />
    </span>
  );
});

export default ItemDisplay;
