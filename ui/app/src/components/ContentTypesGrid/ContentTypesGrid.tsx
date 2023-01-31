/*
 * Copyright (C) 2007-2023 Crafter Software Corporation. All Rights Reserved.
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
import { ContentTypesGridProps } from '../NewContentDialog/utils';
import useStyles from '../NewContentDialog/styles';
import { Grid } from '@mui/material';
import NewContentCard from '../NewContentDialog/NewContentCard';

export function ContentTypesGrid(props: ContentTypesGridProps) {
  const { isCompact, onTypeOpen, selectedContentType, filterContentTypes } = props;
  const { classes } = useStyles();
  return (
    <Grid container spacing={3} className={classes.cardsContainer}>
      {filterContentTypes.map((content) => (
        <Grid item key={content.label}>
          <NewContentCard
            isCompact={isCompact}
            headerTitle={content.label}
            subheader={content.form}
            contentTypeName={content.name}
            onClick={() => onTypeOpen(content)}
            isSelected={content.name === selectedContentType}
          />
        </Grid>
      ))}
    </Grid>
  );
}

export default ContentTypesGrid;
