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

import React from 'react';
import DialogBody from '../DialogBody';
import { useStyles } from './styles';
import { Box } from '@mui/material';
import MediaSkeletonCard from './MediaSkeletonCard';

export interface BrowseFilesDialogContainerSkeletonProps {}

export default function BrowseFilesDialogContainerSkeleton(props: BrowseFilesDialogContainerSkeletonProps) {
  const classes = useStyles();

  return (
    <>
      <DialogBody className={classes.dialogBody}>
        <Box display="flex">
          <section className={classes.leftWrapper} />
          <section className={classes.rightWrapper}>
            <div className={classes.cardsContainer}>
              {Array(5)
                .fill(null)
                .map((x, i) => (
                  <MediaSkeletonCard key={i} />
                ))}
            </div>
          </section>
        </Box>
      </DialogBody>
    </>
  );
}
