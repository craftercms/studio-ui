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

import React, { useEffect, useState } from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import Divider from '@material-ui/core/Divider';
import clsx from 'clsx';
import Skeleton from '@material-ui/lab/Skeleton';
import { getBinary } from '../../utils/ajax';
import { useContentCardStyles } from './styles';

interface NewContentCardProps {
  headerTitle: string;
  subheader: string;
  imgTitle?: string;
  img: string;
  onClick: any;
  isCompact: boolean;
  isSelected: boolean;
}

function useContentTypePreviewImage(img: string) {
  const [src, setSrc] = useState('/studio/static-assets/themes/cstudioTheme/images/default-contentType.jpg');
  useEffect(() => {
    if (img.includes('content-at-path')) {
      getBinary(img).subscribe((response) => {
        setSrc(
          URL.createObjectURL(new Blob([response.response], { type: `image/${/(?:\\.([^.]+))?$/.exec(img)[1]}` }))
        );
      });
    }
  }, [img]);
  return src;
}

const DefaultCardContent = (props) => {
  const { headerTitle, subheader, classes, img, imgTitle } = props;
  const src = useContentTypePreviewImage(img);
  return (
    <>
      <CardHeader title={headerTitle} subheader={subheader} titleTypographyProps={{ variant: 'body1' }} />
      <Divider />
      <CardMedia className={classes.media} image={src} title={imgTitle} />
    </>
  );
};

const CompactCardContent = (props) => {
  const { headerTitle, subheader, classes, img, imgTitle } = props;
  const src = useContentTypePreviewImage(img);
  return (
    <>
      <CardMedia className={classes.compactMedia} image={src} title={imgTitle} />
      <CardHeader title={headerTitle} subheader={subheader} titleTypographyProps={{ variant: 'body1' }} />
    </>
  );
};

export default function NewContentCard(props: NewContentCardProps) {
  const { onClick, isCompact, isSelected } = props;
  const classes = useContentCardStyles();
  const rootClass = !isCompact ? classes.defaultCard : classes.compactCard;
  const [hover, setHover] = useState(false);

  return (
    <Card
      className={clsx(rootClass, isSelected && classes.selected)}
      onClick={onClick}
      elevation={hover ? 3 : 1}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {!isCompact ? (
        <DefaultCardContent {...props} classes={classes} />
      ) : (
        <CompactCardContent {...props} classes={classes} />
      )}
    </Card>
  );
}

export function ContentSkeletonCard(props: { isCompact: boolean }) {
  const classes = useContentCardStyles();
  const rootClass = !props.isCompact ? classes.defaultCard : classes.compactCard;
  return (
    <Card className={rootClass}>
      {!props.isCompact ? (
        <>
          <CardHeader
            title={<Skeleton animation="wave" height={10} width="40%" />}
            subheader={<Skeleton animation="wave" height={10} width="80%" />}
          />
          <Skeleton animation="wave" variant="rect" className={classes.media} />
        </>
      ) : (
        <>
          <Skeleton animation="wave" variant="rect" className={classes.compactMedia} />
          <CardHeader
            title={<Skeleton animation="wave" height={10} width="40%" />}
            subheader={<Skeleton animation="wave" height={10} width="80%" />}
          />
        </>
      )}
    </Card>
  );
}
