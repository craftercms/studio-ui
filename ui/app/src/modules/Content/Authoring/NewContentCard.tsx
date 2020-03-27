/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import Divider from '@material-ui/core/Divider';
import { palette } from '../../../styles/theme';

const useStyles = makeStyles(theme => ({
  defaultCard: {
    maxWidth: 345
  },
  compactCard: {
    display: 'flex'
  },
  media: {
    paddingTop: '56.25%',
  },
  compactMedia: {
    width: 151,
  },
  cardTitle: {
    color: palette.black
  }
}));

interface NewContentCardProps {
  headerTitle: string;
  subheader: string;
  imgTitle: string;
  img: string;
  onClick: any;
  isCompact: boolean
}

const DefaultCardContent = props => {
  const { headerTitle, subheader, classes, img, imgTitle } = props;
  return (
    <>
      <CardHeader
        title={headerTitle}
        subheader={subheader}
        titleTypographyProps={{
          variant: 'subtitle2',
          className: classes.cardTitle
        }}
        subheaderTypographyProps={{
          variant: 'subtitle2',
          color: 'textSecondary'
        }}
      />
      <Divider />
      <CardMedia
        className={classes.media}
        image={img}
        title={imgTitle}
      />
    </>
  );
};

const CompactCardContent = props => {
  const { headerTitle, subheader, classes, img, imgTitle } = props;
  return (
    <>
      <CardMedia
        className={classes.compactMedia}
        image={img}
        title={imgTitle}
      />
      <Divider />
      <CardHeader
        title={headerTitle}
        subheader={subheader}
        titleTypographyProps={{
          variant: 'subtitle2',
          className: classes.cardTitle
        }}
        subheaderTypographyProps={{
          variant: 'subtitle2',
          color: 'textSecondary'
        }}
      />
    </>
  );
};

export default function NewContentCard(props: NewContentCardProps) {
  const { onClick, isCompact } = props;
  const classes = useStyles();
  const rootClass = !isCompact ? classes.defaultCard : classes.compactCard;

  return (
    <Card className={rootClass} onClick={onClick}>
      {
        !isCompact
        ? <DefaultCardContent {...props} classes={classes} />
        : <CompactCardContent {...props} classes={classes}/>
      }
    </Card>
  );
}
