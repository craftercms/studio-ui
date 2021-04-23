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
import { isPreviewable } from '../PathNavigator/utils';
import ItemPublishingTargetIcon from '../ItemPublishingTargetIcon';
import ItemStateIcon from '../ItemStateIcon';
import ItemTypeIcon from '../ItemTypeIcon';

export type ItemDisplayClassKey = 'root' | 'label' | 'labelPreviewable' | 'icon' | 'typeIcon';
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

export const useStyles = makeStyles((theme) =>
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
    })
  })
);

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
      {showPublishingTarget && <ItemPublishingTargetIcon item={item} className={classes.icon} />}
      {showWorkflowState && <ItemStateIcon item={item} className={classes.icon} />}
      {showItemType && <ItemTypeIcon item={item} className={classes.icon} />}
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
