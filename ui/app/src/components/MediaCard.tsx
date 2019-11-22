/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
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
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardActions from '@material-ui/core/CardActions';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import makeStyles from "@material-ui/core/styles/makeStyles";
import { Theme } from "@material-ui/core";
import FavoriteIcon from '@material-ui/icons/Favorite';
import VisibilityIcon from '@material-ui/icons/Visibility';
import clsx from 'clsx';
import { MediaItem } from '../models/Search';
import { useIntl } from "react-intl";

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    '& .cardTitle': {
      fontWeight: '600',
      lineHeight: '1.5rem',
      overflow: 'hidden',
      display: '-webkit-box',
      '-webkit-line-clamp': 1,
      '-webkit-box-orient': 'vertical',
      marginBottom: 0
    },
    '& .cardSubtitle': {
      overflow: 'hidden',
      display: '-webkit-box',
      '-webkit-line-clamp': 1,
      '-webkit-box-orient': 'vertical',
    }
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
  favorites: {
    marginLeft: 'auto',
    '&.fav': {
      color: '#FF2D55'
    }
  }
}));

interface MediaCardProps {
  item: MediaItem;
}

function MediaCard(props: MediaCardProps) {
  const classes = useStyles({});
  const { name, path, lastModified } = props.item;
  const { formatDate } = useIntl();
  const dateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };
  const siteUrl = 'http://authoring.sample.com:8080';
  return (
    <Card className={classes.card}>
      <CardHeader
        action={
          <IconButton aria-label="details">
            <MoreVertIcon />
          </IconButton>
        }
        title={name}
        subheader={formatDate(lastModified, dateTimeFormatOptions)}
        titleTypographyProps={{variant: "subtitle2", component: "h2", className: 'cardTitle'}}
        subheaderTypographyProps={{variant: "subtitle2", component: "h2", className: 'cardSubtitle', color: "textSecondary"}}
      />
      <CardMedia
        className={classes.media}
        image={`${siteUrl}${path}`}
        title="Paella dish"
      />
      <CardActions disableSpacing>
        <IconButton aria-label="view details">
          <VisibilityIcon />
        </IconButton>
        <IconButton aria-label="add to favorites" className={clsx(classes.favorites, true && 'fav')}>
          <FavoriteIcon />
        </IconButton>
      </CardActions>
    </Card>
  )
}

export default MediaCard;
