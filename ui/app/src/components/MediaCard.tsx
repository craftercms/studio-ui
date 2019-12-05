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
import CardActionArea from '@material-ui/core/CardActionArea';
import IconButton from '@material-ui/core/IconButton';
import makeStyles from "@material-ui/core/styles/makeStyles";
import { Theme } from "@material-ui/core";
import DeleteIcon from '@material-ui/icons/Delete';
import VisibilityIcon from '@material-ui/icons/Visibility';
import EditIcon from '@material-ui/icons/Edit';
import clsx from 'clsx';
import { MediaItem } from '../models/Search';
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

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
    },
    '&.list': {
      display: 'flex',
    }
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center'
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
    //backgroundSize: 'auto',
    '&.list': {
      paddingTop: 0,
      height: '80px',
      width: '80px',
      order: -1
    }
  },
  listActionArea: {
    paddingTop: 0,
    height: '80px',
    width: '80px',
    order: -1
  },
  mediaIcon: {
    backgroundColor: '#f3f3f3',
    paddingTop: '56.25%',
    position: 'relative',
    '& .media-icon': {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      color: 'rgba(0, 0, 0, 0.54)',
      fontSize: '50px'
    },
    '&.list': {
      height: '80px',
      width: '80px',
      paddingTop: '0',
      order: -1
    }
  },
  deleteIcon: {
    marginLeft: 'auto',
  },
  mLa: {
    marginLeft: 'auto'
  },
  checkbox: {
    marginLeft: '28px',
    '& label': {
      marginRight: 0
    },
    '&.list': {
      justifyContent: 'center',
      order: -2,
      marginRight: '16px'
    }
  },
}));

interface MediaCardProps {
  item: MediaItem;
  currentView: string;
  selected: Array<string>;

  handleEdit(path: string): any;

  handleDelete(path: string): any;

  handlePreview(url: string): any;

  handlePreviewAsset(url: string, type: string, name: string): any;

  handleSelect(path: string, selected: boolean): void;
}

function MediaCard(props: MediaCardProps) {
  const classes = useStyles({});

  const {handleEdit, handleDelete, handlePreview, handlePreviewAsset, handleSelect, selected, item} = props;
  const {name, path, type} = item;
  const isList = props.currentView === 'list';
  const siteUrl = 'http://localhost:8080';

  function renderIcon(type: string, path: string) {
    let iconClass = 'fa media-icon';
    let iconName = `${iconClass} fa-file`;
    let actionArea = false;
    switch (type) {
      case 'Page':
        iconName = `${iconClass} fa-file`;
        actionArea = true;
        break;
      case 'Video':
        iconName = `${iconClass} fa-file-video-o`;
        break;
      case 'Template':
        iconName = `${iconClass} fa-file-code-o`;
        break;
      case 'Taxonomy':
        iconName = `${iconClass} fa-tag`;
        break;
      case 'Component':
        iconName = `${iconClass} fa-puzzle-piece`;
        break;
      case 'Groovy':
        iconName = `${iconClass} fa-file-code-o`;
        break;
      default:
        break;
    }
    return (
      actionArea ?
        <CardActionArea onClick={() => handlePreview(path)} className={clsx(isList && classes.listActionArea)}>
          <div className={clsx(classes.mediaIcon, isList && 'list')}>
            <i className={iconName}></i>
          </div>
        </CardActionArea>
        :
        <div className={clsx(classes.mediaIcon, isList && 'list')}>
          <i className={iconName}></i>
        </div>
    )
  }

  const handleDetailsClick = (path: string, type: string, name: string) => {
    if (type === 'Image' || type === 'Video') {
      handlePreviewAsset(path, type, name);
    } else {
      handleEdit(path);
    }
  };

  return (
    <Card className={clsx(classes.card, isList && 'list')}>
      {
        isList &&
        <FormGroup className={clsx(classes.checkbox, 'list')}>
          <FormControlLabel
            control={
              <Checkbox
                checked={selected.includes(path)}
                onClick={(e: any) => handleSelect(path, e.target.checked)}
                color="primary"/>
            }
            label={''}
          />
        </FormGroup>
      }
      <header className={classes.cardHeader}>
        {
          !isList &&
          <FormGroup className={classes.checkbox}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selected.includes(path)}
                  onClick={(e: any) => handleSelect(path, e.target.checked)}
                  color="primary"/>
              }
              label={''}
            />
          </FormGroup>
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
      </header>
      {
        type === 'Image' ?
          <CardActionArea onClick={() => handlePreview(path)} className={clsx(isList && classes.listActionArea)}>
            <CardMedia
              className={clsx(classes.media, isList && 'list')}
              image={`${siteUrl}${path}`}
              title="Paella dish"
            />
          </CardActionArea>
          :
          renderIcon(type, path)
      }
      <CardActions disableSpacing className={isList ? classes.mLa : ''}>
        <IconButton aria-label="view details" onClick={() => handleDetailsClick(path, type, name)}>
          {
            (type === 'Image' || type === 'Video') ? <VisibilityIcon/> : <EditIcon/>
          }
        </IconButton>
        <IconButton aria-label="add to favorites" className={classes.deleteIcon} onClick={() => handleDelete(path)}>
          <DeleteIcon/>
        </IconButton>
      </CardActions>
    </Card>
  )
}

export default MediaCard;
