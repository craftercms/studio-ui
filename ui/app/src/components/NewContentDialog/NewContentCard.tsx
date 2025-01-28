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

import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardHeader, { cardHeaderClasses } from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import palette from '../../styles/palette';
import { fetchPreviewImage } from '../../services/contentTypes';
import useActiveSiteId from '../../hooks/useActiveSiteId';

interface NewContentCardProps {
  headerTitle: string;
  subheader: string;
  imgTitle?: string;
  contentTypeName: string;
  onClick: any;
  isCompact: boolean;
  isSelected: boolean;
}

function useContentTypePreviewImage(contentTypeName: string) {
  const [src, setSrc] = useState(null);
  const site = useActiveSiteId();
  useEffect(() => {
    fetchPreviewImage(site, contentTypeName).subscribe((response) => {
      setSrc(URL.createObjectURL(new Blob([response.response])));
    });
  }, [contentTypeName, site]);
  return src;
}

const DefaultCardContent = (props) => {
  const { headerTitle, subheader, classes, imgTitle, contentTypeName } = props;
  const src = useContentTypePreviewImage(contentTypeName);
  return (
    <>
      <CardHeader
        title={headerTitle}
        subheader={subheader}
        classes={{ content: classes?.cardHeader }}
        sx={{
          [`& .${cardHeaderClasses.content}`]: {
            overflow: 'hidden'
          }
        }}
        titleTypographyProps={{
          variant: 'body1',
          title: headerTitle,
          classes: { root: classes?.cardHeaderContentTypography },
          sx: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
        }}
        subheaderTypographyProps={{
          noWrap: true,
          title: subheader,
          classes: { root: classes?.cardHeaderContentTypography },
          sx: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
        }}
      />
      <Divider />
      {src && <CardMedia className={classes?.media} sx={{ paddingTop: '75%' }} image={src} title={imgTitle} />}
    </>
  );
};

const CompactCardContent = (props) => {
  const { headerTitle, subheader, classes, imgTitle, contentTypeName } = props;
  const src = useContentTypePreviewImage(contentTypeName);
  return (
    <>
      {src && (
        <CardMedia className={classes?.compactMedia} sx={{ width: 151, minWidth: 151 }} image={src} title={imgTitle} />
      )}
      <CardHeader
        title={headerTitle}
        subheader={subheader}
        classes={{
          root: classes?.cardHeader,
          content: classes?.cardHeader
        }}
        sx={{
          overflow: 'hidden',
          [`& .${cardHeaderClasses.content}`]: {
            overflow: 'hidden'
          }
        }}
        titleTypographyProps={{
          variant: 'body1',
          title: headerTitle,
          classes: { root: classes?.cardHeaderContentTypography },
          sx: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
        }}
        subheaderTypographyProps={{
          noWrap: true,
          title: subheader,
          classes: { root: classes?.cardHeaderContentTypography },
          sx: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
        }}
      />
    </>
  );
};

export function NewContentCard(props: NewContentCardProps) {
  const { onClick, isCompact, isSelected } = props;
  const [hover, setHover] = useState(false);

  return (
    <Card
      sx={[
        props.isCompact ? { display: 'flex', cursor: 'pointer' } : { maxWidth: 345, cursor: 'pointer' },
        isSelected && { border: `1px solid ${palette.blue.tint}` }
      ]}
      onClick={onClick}
      elevation={hover ? 3 : 1}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {!isCompact ? <DefaultCardContent {...props} /> : <CompactCardContent {...props} />}
    </Card>
  );
}

export function ContentSkeletonCard(props: { isCompact: boolean }) {
  return (
    <Card sx={props.isCompact ? { display: 'flex', cursor: 'pointer' } : { maxWidth: 345, cursor: 'pointer' }}>
      {!props.isCompact ? (
        <>
          <CardHeader
            title={<Skeleton animation="wave" height={10} width="40%" />}
            subheader={<Skeleton animation="wave" height={10} width="80%" />}
          />
          <Skeleton animation="wave" variant="rectangular" sx={{ paddingTop: '75%' }} />
        </>
      ) : (
        <>
          <Skeleton animation="wave" variant="rectangular" sx={{ width: 151, minWidth: 151 }} />
          <CardHeader
            title={<Skeleton animation="wave" height={10} width="40%" />}
            subheader={<Skeleton animation="wave" height={10} width="80%" />}
          />
        </>
      )}
    </Card>
  );
}

export default NewContentCard;
