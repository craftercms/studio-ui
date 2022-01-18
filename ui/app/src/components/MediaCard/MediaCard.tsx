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
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from '@mui/material/CardActionArea';
import IconButton from '@mui/material/IconButton';
import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import { MediaItem } from '../../models/Search';
import FormGroup from '@mui/material/FormGroup';
import Checkbox from '@mui/material/Checkbox';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import cardTitleStyles from '../../styles/card';
import { defineMessages, useIntl } from 'react-intl';
import palette from '../../styles/palette';
import moment from 'moment-timezone';
import SystemIcon from '../SystemIcon';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';

const translations = defineMessages({
  options: {
    id: 'media.card.title',
    defaultMessage: 'options'
  },
  itemLastEdition: {
    id: 'media.card.itemLastEdition',
    defaultMessage: 'Edited {time}'
  }
});

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    card: {
      '& .cardTitle': {
        ...cardTitleStyles
      },
      '& .cardSubtitle': {
        overflow: 'hidden',
        display: '-webkit-box',
        '-webkit-line-clamp': 1,
        '-webkit-box-orient': 'vertical'
      },
      position: 'relative'
    },
    cardHeaderRoot: {
      padding: '9px 0',
      cursor: 'pointer',
      width: '100%'
    },
    avatar: {
      color: palette.black,
      margin: '0 10px'
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      width: '100%'
    },
    cardOptions: {
      marginLeft: 'auto'
    },
    media: {
      height: 0,
      paddingTop: '56.25%' // 16:9
    },
    previewButton: {
      margin: '5px',
      position: 'absolute',
      bottom: 0,
      right: 0,
      color: theme.palette.primary.contrastText,
      background: theme.palette.action.focus
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
      width: '100%'
    },
    checkbox: {}
  })
);

interface MediaCardProps {
  item: MediaItem;
  hasSubheader?: boolean;
  onPreviewButton?(item: MediaItem): void;
  onCardClicked?(item: MediaItem): void;
  isList?: boolean;
  selected?: Array<string>;
  previewAppBaseUri: string;
  headerButtonIcon?: React.ElementType<any>;
  avatar?: React.ElementType<any>;
  classes?: Partial<Record<'root' | 'checkbox' | 'header' | 'media' | 'mediaIcon', string>>;
  onHeaderButtonClick?(...props: any): any;
  onPreview?(item: MediaItem): any;
  onSelect?(path: string, selected: boolean): any;
  onDragStart?(...args: any): any;
  onDragEnd?(...args: any): any;
}

function MediaCard(props: MediaCardProps) {
  const classes = useStyles();
  const {
    onPreview,
    onSelect,
    selected,
    item,
    previewAppBaseUri,
    hasSubheader = true,
    isList = false,
    onPreviewButton,
    onCardClicked,
    headerButtonIcon: HeaderButtonIcon = MoreVertRounded,
    onHeaderButtonClick,
    avatar: Avatar,
    onDragStart,
    onDragEnd
  } = props;
  const { name, path, type } = item;
  const { formatMessage } = useIntl();

  const renderIcon = (type: string) => {
    let iconClass = 'media-icon';
    let icon = { id: '@mui/icons-material/InsertDriveFileOutlined' };
    switch (type) {
      case 'Page':
        icon.id = '@mui/icons-material/InsertDriveFileOutlined';
        break;
      case 'Video':
        icon.id = '@mui/icons-material/VideocamOutlined';
        break;
      case 'Template':
        icon.id = '@mui/icons-material/CodeRounded';
        break;
      case 'Taxonomy':
        icon.id = '@mui/icons-material/LocalOfferOutlined';
        break;
      case 'Component':
        icon.id = '@mui/icons-material/ExtensionOutlined';
        break;
      case 'Groovy':
      case 'JavaScript':
      case 'CSS':
        icon.id = '@mui/icons-material/CodeRounded';
        break;
      default:
        break;
    }
    return onPreview ? (
      <CardActionArea onClick={() => onPreview(item)} className={clsx(isList && classes.listActionArea)}>
        <div className={clsx(classes.mediaIcon, props.classes?.mediaIcon)}>
          {type === 'Video' ? (
            <video className={classes.videoThumbnail}>
              <source src={path} type="video/mp4" />
              <SystemIcon icon={icon} svgIconProps={{ className: iconClass }} />
            </video>
          ) : (
            <SystemIcon icon={icon} svgIconProps={{ className: iconClass }} />
          )}
        </div>
      </CardActionArea>
    ) : (
      <div className={clsx(classes.mediaIcon, props.classes?.mediaIcon)}>
        {type === 'Video' ? (
          <video className={classes.videoThumbnail}>
            <source src={path} type="video/mp4" />
            <SystemIcon icon={icon} svgIconProps={{ className: iconClass }} />
          </video>
        ) : (
          <SystemIcon icon={icon} svgIconProps={{ className: iconClass }} />
        )}
      </div>
    );
  };

  return (
    <Card
      className={clsx(classes.card, props.classes?.root)}
      draggable={!!onDragStart || !!onDragEnd}
      onDragStart={() => onDragStart(item)}
      onDragEnd={() => onDragEnd(item)}
      onClick={() => onCardClicked?.(item)}
    >
      {isList && onSelect && (
        <FormGroup className={clsx(classes.checkbox, props.classes?.checkbox)}>
          <Checkbox
            checked={selected.includes(path)}
            onClick={(e: any) => onSelect(path, e.target.checked)}
            color="primary"
          />
        </FormGroup>
      )}
      <header className={clsx(classes.cardHeader, props.classes?.header)}>
        {!isList && onSelect && (
          <FormGroup>
            <Checkbox
              checked={selected.includes(path)}
              onClick={(e: any) => onSelect(path, e.target.checked)}
              color="primary"
            />
          </FormGroup>
        )}
        {/*
        // @ts-ignore */}
        <CardHeader
          title={name}
          subheader={
            hasSubheader
              ? `${type}, ${formatMessage(translations.itemLastEdition, {
                  time: moment(item.lastModified).fromNow()
                })}`
              : null
          }
          avatar={Avatar ? <Avatar /> : null}
          classes={{ root: classes.cardHeaderRoot, avatar: classes.avatar }}
          onClick={() => onPreview?.(item)}
          titleTypographyProps={{
            variant: 'subtitle2',
            component: 'h2',
            className: 'cardTitle'
          }}
          subheaderTypographyProps={{
            variant: 'subtitle2',
            component: 'h2',
            className: 'cardSubtitle',
            color: 'textSecondary'
          }}
        />
        {onHeaderButtonClick && (
          <IconButton
            aria-label={formatMessage(translations.options)}
            className={classes.cardOptions}
            onClick={(e) => onHeaderButtonClick(e, item)}
            size="large"
          >
            <HeaderButtonIcon />
          </IconButton>
        )}
      </header>
      {type === 'Image' ? (
        onPreviewButton || !onPreview ? (
          <>
            <CardMedia
              className={clsx(classes.media, props.classes?.media)}
              image={`${previewAppBaseUri}${path}`}
              title={name}
            />
            {onPreviewButton && (
              <IconButton
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPreviewButton(item);
                }}
                className={classes.previewButton}
                size="large"
              >
                <ZoomInRoundedIcon />
              </IconButton>
            )}
          </>
        ) : (
          <CardActionArea onClick={() => onPreview(item)} className={clsx(isList && classes.listActionArea)}>
            <CardMedia
              className={clsx(classes.media, props.classes?.media)}
              image={`${previewAppBaseUri}${path}`}
              title={name}
            />
          </CardActionArea>
        )
      ) : (
        renderIcon(type)
      )}
    </Card>
  );
}

export default MediaCard;
