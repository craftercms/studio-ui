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

import React from 'react';
import NewContentCard, { ContentSkeletonCard } from './NewContentCard';
import { Grid } from '@mui/material';
import useStyles from './styles';
import { ContentTypesGridProps, NewContentDialogProps } from './utils';
import { NewContentDialogContainer } from './NewContentDialogContainer';
import EnhancedDialog from '../EnhancedDialog';
import { FormattedMessage } from 'react-intl';

export default function NewContentDialog(props: NewContentDialogProps) {
  const { item, rootPath, compact, onContentTypeSelected, ...rest } = props;
  return (
    <EnhancedDialog
      title={<FormattedMessage id="newContentDialog.title" defaultMessage="Create Content" />}
      dialogHeaderProps={{
        subtitle: (
          <FormattedMessage
            id="newContentDialog.subtitle"
            defaultMessage="Choose a content type template for your new content item."
          />
        )
      }}
      {...rest}
    >
      <NewContentDialogContainer
        item={item}
        rootPath={rootPath}
        compact={compact}
        onContentTypeSelected={onContentTypeSelected}
      />
    </EnhancedDialog>
  );
}

export function ContentTypesLoader(props: { numOfItems?: number; isCompact: boolean }) {
  const { numOfItems = 6, isCompact } = props;
  const items = new Array(numOfItems).fill(null);
  return (
    <Grid container spacing={3} style={{ marginTop: '14px' }}>
      {items.map((value, i) => (
        <Grid item key={i} xs={12} sm={!isCompact ? 4 : 6}>
          <ContentSkeletonCard isCompact={isCompact} />
        </Grid>
      ))}
    </Grid>
  );
}

export function ContentTypesGrid(props: ContentTypesGridProps) {
  const { resource, isCompact, onTypeOpen, getPrevImg, selectedContentType } = props;
  const classes = useStyles();
  const filterContentTypes = resource.read();
  return (
    <Grid container spacing={3} className={classes.cardsContainer}>
      {filterContentTypes.map((content) => (
        <Grid item key={content.label} xs={12} sm={!isCompact ? 4 : 6}>
          <NewContentCard
            isCompact={isCompact}
            headerTitle={content.label}
            subheader={content.form}
            img={getPrevImg(content)}
            onClick={() => onTypeOpen(content)}
            isSelected={content.name === selectedContentType}
          />
        </Grid>
      ))}
    </Grid>
  );
}
