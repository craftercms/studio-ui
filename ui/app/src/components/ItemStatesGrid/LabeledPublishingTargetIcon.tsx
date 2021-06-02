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

import PublishingTargetIcon from '@material-ui/icons/FiberManualRecordRounded';
import clsx from 'clsx';
import * as React from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import palette from '../../styles/palette';
import { CSSProperties } from '@material-ui/styles';
import { ItemStates } from '../../models/Item';
import { getPublishingTargetText } from './utils';

export type LabeledPublishingTargetIconClassKey =
  | 'root'
  | 'publishingTargetLive'
  | 'publishingTargetStaged'
  | 'publishingIcon';
export type LabeledPublishingTargetIconStyles = Partial<Record<LabeledPublishingTargetIconClassKey, CSSProperties>>;

export interface LabeledPublishingTargetIconProps {
  state: ItemStates;
  classes?: Partial<Record<LabeledPublishingTargetIconClassKey, string>>;
  className?: string;
  styles?: LabeledPublishingTargetIconStyles;
}

const useStyles = makeStyles(() =>
  createStyles<LabeledPublishingTargetIconClassKey, LabeledPublishingTargetIconStyles>({
    root: (styles) => ({
      color: palette.gray.medium2,
      ...styles.root
    }),
    publishingTargetLive: (styles) => ({
      color: palette.green.main,
      ...styles.publishingTargetLive
    }),
    publishingTargetStaged: (styles) => ({
      color: palette.blue.main,
      ...styles.publishingTargetStaged
    }),
    publishingIcon: (styles) => ({
      ...styles.publishingIcon
    })
  })
);

export default function LabeledPublishingTargetIcon(props: LabeledPublishingTargetIconProps) {
  const { state, classes: propClasses, styles, className } = props;
  const classes = useStyles(styles);

  return (
    <>
      <PublishingTargetIcon
        className={clsx(
          classes.root,
          classes.publishingIcon,
          propClasses?.root,
          className,
          state === 'live' && classes.publishingTargetLive,
          state === 'staged' && classes.publishingTargetStaged
        )}
      />
      {getPublishingTargetText(state)}
    </>
  );
}
