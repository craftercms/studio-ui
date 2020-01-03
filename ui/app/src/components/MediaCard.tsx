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
import CardActionArea from '@material-ui/core/CardActionArea';
import IconButton from '@material-ui/core/IconButton';
import makeStyles from "@material-ui/core/styles/makeStyles";
import { Theme } from "@material-ui/core";
import clsx from 'clsx';
import { MediaItem } from '../models/Search';
import FormGroup from "@material-ui/core/FormGroup";
import Checkbox from "@material-ui/core/Checkbox";
import MoreVertRounded from '@material-ui/icons/MoreVertRounded';
import { palette } from "../styles/theme";
import cardTitleStyles from "../styles/card";
import { defineMessages, useIntl } from 'react-intl';

const translations = defineMessages({
  options: {
    id: 'media.card.title',
    defaultMessage: 'options'
  }
});

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    '& .cardTitle': {
      ...cardTitleStyles,
      '&.clickable': {
        textDecoration: 'underline',
        cursor: 'pointer',
      }
    },
    '& .cardSubtitle': {
      overflow: 'hidden',
      display: '-webkit-box',
      '-webkit-line-clamp': 1,
      '-webkit-box-orient': 'vertical',
    }
  },
  cardHeaderRoot: {
    padding: '9px 0'
  },
  avatar: {
    color: palette.black,
    margin: '0 10px'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  cardOptions: {
    marginLeft: 'auto'
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
  listActionArea: {
    paddingTop: 0,
    height: '80px',
    width: '80px',
    order: -1
  },
  mediaIcon: {
    paddingTop: '56.25%',
    position: 'relative',
    overflow: 'hidden',
    '& .media-icon': {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      color: palette.gray.medium4,
      fontSize: '50px'
    },
    '&.list': {
      height: '80px',
      width: '80px',
      paddingTop: '0',
      order: -1
    }
  },
  videoThumbnail: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '209px',
  },
  checkbox: {}
}));

interface MediaCardProps {
  item: MediaItem;
  hasSubheader?: boolean;
  isList?: boolean;
  selected?: Array<string>;
  previewAppBaseUri: string;
  headerButtonIcon?: React.ElementType<any>;
  avatar?: React.ElementType<any>;
  classes?: {
    root?: any;
    checkbox?: any;
    header?: any;
    media?: any;
    mediaIcon?: any;
  };

  onHeaderButtonClick?(...props: any): any;

  onEdit?(path: string, readonly?: boolean): any;

  onPreview?(url: string): any;

  onPreviewAsset?(url: string, type: string, name: string): any;

  onSelect?(path: string, selected: boolean): any;

  onDragStart?(...args: any): any;

  onDragEnd?(...args: any): any;
}

function MediaCard(props: MediaCardProps) {
  const classes = useStyles({});
  const {
    onEdit,
    onPreview,
    onPreviewAsset,
    onSelect,
    selected,
    item,
    previewAppBaseUri,
    hasSubheader = true,
    isList = false,
    headerButtonIcon: HeaderButtonIcon = MoreVertRounded,
    onHeaderButtonClick,
    avatar: Avatar,
    onDragStart,
    onDragEnd
  } = props;
  const { name, path, type } = item;
  const { formatMessage } = useIntl();
  const hasOnAssetClick = (onPreviewAsset || onEdit) ? true : false;

  const renderIcon = (type: string, path: string, name: string) => {
    let iconClass = 'fa media-icon';
    let iconName = `${iconClass} fa-file`;
    let previewArea = false;
    switch (type) {
      case 'Page':
        iconName = `${iconClass} fa-file`;
        previewArea = true;
        break;
      case 'Video':
        iconName = `${iconClass} fa-file-video-o`;
        previewArea = true;
        break;
      case 'Template':
        iconName = `${iconClass} fa-file-code-o`;
        previewArea = true;
        break;
      case 'Taxonomy':
        iconName = `${iconClass} fa-tag`;
        break;
      case 'Component':
        iconName = `${iconClass} fa-puzzle-piece`;
        break;
      case 'Groovy':
        iconName = `${iconClass} fa-file-code-o`;
        previewArea = true;
        break;
      default:
        break;
    }
    return (
      hasOnAssetClick ? (
        <CardActionArea
          onClick={
            previewArea
              ? () => onPreviewAsset(path, type, name)
              : () => onEdit(path, true)
          }
          className={clsx(isList && classes.listActionArea)}>
          <div className={clsx(classes.mediaIcon, props.classes?.mediaIcon)}>
            {
              (type === 'Video') ? (
                <video className={classes.videoThumbnail}>
                  <source src={path} type="video/mp4"/>
                  <i className={iconName}></i>
                </video>
              ) : (
                <i className={iconName}></i>
              )
            }
          </div>
        </CardActionArea>
      ) : (
        <div className={clsx(classes.mediaIcon, props.classes?.mediaIcon)}>
          {
            (type === 'Video') ? (
              <video className={classes.videoThumbnail}>
                <source src={path} type="video/mp4"/>
                <i className={iconName}></i>
              </video>
            ) : (
              <i className={iconName}></i>
            )
          }
        </div>
      )
    )
  };

  return (
    <Card
      className={clsx(classes.card, props.classes?.root)}
      draggable={!!onDragStart || !!onDragEnd}
      onDragStart={() => onDragStart(item)}
      onDragEnd={() => onDragEnd(item)}
    >
      {
        (isList && onSelect) &&
        <FormGroup className={clsx(classes.checkbox, props.classes?.checkbox)}>
          <Checkbox
            checked={selected.includes(path)}
            onClick={(e: any) => onSelect(path, e.target.checked)}
            color="primary"/>
        </FormGroup>
      }
      <header className={clsx(classes.cardHeader, props.classes?.header)}>
        {
          (!isList && onSelect) &&
          <FormGroup>
            <Checkbox
              checked={selected.includes(path)}
              onClick={(e: any) => onSelect(path, e.target.checked)}
              color="primary"/>
          </FormGroup>
        }
        <CardHeader
          title={name}
          subheader={hasSubheader ? type : null}
          avatar={Avatar ? <Avatar/> : null}
          classes={{ root: classes.cardHeaderRoot, avatar: classes.avatar }}
          onClick={(type === 'Image' || type === 'Video' || type === 'Page') && onPreview ? () => onPreview(path) : null}
          titleTypographyProps={{
            variant: "subtitle2",
            component: "h2",
            className: clsx('cardTitle', (type === 'Image' || type === 'Video' || type === 'Page') && onPreview && 'clickable')
          }}
          subheaderTypographyProps={{
            variant: "subtitle2",
            component: "h2",
            className: 'cardSubtitle',
            color: "textSecondary"
          }}
        />
        {
          onHeaderButtonClick &&
          <IconButton
            aria-label={formatMessage(translations.options)}
            className={classes.cardOptions}
            onClick={(e) => onHeaderButtonClick(e, item)}
          >
            <HeaderButtonIcon/>
          </IconButton>
        }
      </header>
      {
        (type === 'Image') ? (
          onPreviewAsset ? (
            <CardActionArea
              onClick={() => onPreviewAsset(path, type, name)}
              className={clsx(isList && classes.listActionArea)}
            >
              <CardMedia
                className={clsx(classes.media, props.classes?.media)}
                image={`${previewAppBaseUri}${path}`}
                title={name}
              />
            </CardActionArea>
          ) : (
            <CardMedia
              className={clsx(classes.media, props.classes?.media)}
              image={`${previewAppBaseUri}${path}`}
              title={name}
            />
          )
        ) : (
          renderIcon(type, path, name)
        )
      }
    </Card>
  )
}

export default MediaCard;
