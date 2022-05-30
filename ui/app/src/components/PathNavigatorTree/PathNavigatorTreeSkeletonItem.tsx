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

import Skeleton from '@mui/material/Skeleton';
import { rand } from '../PathNavigator/utils';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

export interface PathNavigatorTreeSkeletonItemProps {
  textWidth?: string;
  classes?: Partial<Record<'root', string>>;
}

const useStyles = makeStyles()(() => ({
  root: { display: 'flex' }
}));

export function PathNavigatorTreeSkeletonItem(props: PathNavigatorTreeSkeletonItemProps) {
  const { classes, cx } = useStyles();
  return (
    <div className={cx(classes.root, props.classes?.root)}>
      <Skeleton variant="circular" width="20px" style={{ marginRight: '10px' }} />
      <Skeleton variant="text" style={{ margin: '0 10px', width: props.textWidth ?? `${rand(60, 95)}%` }} />
    </div>
  );
}

export default PathNavigatorTreeSkeletonItem;
