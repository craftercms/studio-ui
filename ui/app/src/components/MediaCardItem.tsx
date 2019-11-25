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
    display: 'flex',
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
    height: '80px',
    width: '80px'
  },
  mediaIcon: {
    backgroundColor: '#f3f3f3',
    height: '80px',
    width: '80px',
    position: 'relative',
    '& .media-icon':{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      color: 'rgba(0, 0, 0, 0.54)',
      fontSize: '50px'
    }
  },
  cardActions: {
    marginLeft: 'auto'
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

function MediaCardItem(props: MediaCardProps) {
  const classes = useStyles({});
  const {name, path, type} = props.item;

  const siteUrl = 'http://localhost:8080';

  function renderIcon(type: string) {
    let iconClass = 'fa media-icon';
    let iconName = `${iconClass} fa-file`;
    switch (type) {
      case 'Page':
        iconName = `${iconClass} fa fa-file`;
        break;
      case 'Template':
        iconName = `${iconClass} fa-file-code-o`;
        break;
      case 'Taxonomy':
        iconName = `${iconClass} fa-file-code-o`;
        break;
      case 'Component':
        iconName = `${iconClass} fa-file-code-o`;
        break;
      case 'Groovy':
        iconName = `${iconClass} fa-file-code-o`;
        break;
      default:
        break;
    }
    return (
      <div className={classes.mediaIcon}>
        <i className={iconName}></i>
      </div>
    )
  }

  return (
    <Card className={classes.card}>
      {
        type === 'Image' ?
          <CardMedia
            className={classes.media}
            image={`${siteUrl}${path}`}
            title="Paella dish"
          /> :
          renderIcon(type)
      }
      <CardHeader
        title={name}
        subheader={type}
        titleTypographyProps={{variant: "subtitle2", component: "h2", className: 'cardTitle'}}
        subheaderTypographyProps={{
          variant: "subtitle2",
          component: "h2",
          className: 'cardSubtitle',
          color: "textSecondary"
        }}
      />
      <CardActions disableSpacing className={classes.cardActions}>
        <IconButton aria-label="view details">
          <VisibilityIcon/>
        </IconButton>
        <IconButton aria-label="add to favorites" className={clsx(classes.favorites, true && 'fav')}>
          <FavoriteIcon/>
        </IconButton>
      </CardActions>
    </Card>
  )
}

export default MediaCardItem;
