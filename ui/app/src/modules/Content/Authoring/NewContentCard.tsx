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

import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import Divider from '@material-ui/core/Divider';
import palette from '../../../styles/palette';
import clsx from 'clsx';

const useStyles = makeStyles(() => ({
  defaultCard: {
    maxWidth: 345,
    cursor: 'pointer'
  },
  compactCard: {
    display: 'flex',
    cursor: 'pointer'
  },
  media: {
    paddingTop: '75%'
  },
  compactMedia: {
    width: 151
  },
  selected: {
    border: `1px solid ${palette.blue.tint}`
  }
}));

interface NewContentCardProps {
  headerTitle: string;
  subheader: string;
  imgTitle?: string;
  img: string;
  onClick: any;
  isCompact: boolean;
  isSelected: boolean;
}

const DefaultCardContent = (props) => {
  const { headerTitle, subheader, classes, img, imgTitle } = props;
  return (
    <>
      <CardHeader
        title={headerTitle}
        subheader={subheader}
        titleTypographyProps={{ variant: 'body1' }}
      />
      <Divider />
      <CardMedia className={classes.media} image={img} title={imgTitle} />
    </>
  );
};

const CompactCardContent = (props) => {
  const { headerTitle, subheader, classes, img, imgTitle } = props;
  return (
    <>
      <CardMedia className={classes.compactMedia} image={img} title={imgTitle} />
      <CardHeader
        title={headerTitle}
        subheader={subheader}
        titleTypographyProps={{ variant: 'body1' }}
      />
    </>
  );
};

export default function NewContentCard(props: NewContentCardProps) {
  const { onClick, isCompact, isSelected } = props;
  const classes = useStyles();
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
