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
  root: {
    maxWidth: 345
  },
  media: {
    height: 0,
    paddingTop: '56.25%'
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
}

export default function NewContentCard(props: NewContentCardProps) {
  const { headerTitle, subheader, img, imgTitle, onClick } = props;
  const classes = useStyles();

  return (
    <Card className={classes.root} onClick={onClick}>
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
    </Card>
  );
}
