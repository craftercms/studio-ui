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

import React from 'react';
import Card from '@mui/material/Card';
import CardHeader, { CardHeaderProps } from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea, { CardActionAreaProps } from '@mui/material/CardActionArea';
import { makeStyles } from 'tss-react/mui';
import { MediaItem } from '../../models/Search';
import FormGroup from '@mui/material/FormGroup';
import Checkbox from '@mui/material/Checkbox';
import cardTitleStyles, { cardSubtitleStyles } from '../../styles/card';
import palette from '../../styles/palette';
import SystemIcon from '../SystemIcon';

const useStyles = makeStyles()(() => ({
  card: {
    position: 'relative'
  },
  cardTitle: {
    ...cardTitleStyles
  },
  cardSubtitle: {
    ...cardSubtitleStyles,
    WebkitLineClamp: 1
  },
  cardHeader: { alignSelf: 'center' },
  media: {
    height: 0,
    paddingTop: '56.25%'
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
  }
}));

interface MediaCardProps {
  item: MediaItem;
  showPath?: boolean;
  selected?: Array<string>;
  previewAppBaseUri: string;
  compact?: boolean;
  action?: CardHeaderProps['action'];
  avatar?: CardHeaderProps['avatar'];
  classes?: Partial<Record<'root' | 'checkbox' | 'media' | 'mediaIcon' | 'cardActionArea' | 'cardHeader', string>>;
  onClick?(e): void;
  onPreview?(e): any;
  onSelect?(path: string, selected: boolean): any;
  // TODO: Fix types
  onDragStart?(...args: any): any;
  onDragEnd?(...args: any): any;
}

function MediaCard(props: MediaCardProps) {
  const { classes, cx } = useStyles();
  // region const { ... } = props
  const {
    onSelect,
    selected,
    item,
    previewAppBaseUri,
    showPath = true,
    onClick,
    onPreview = onClick,
    action,
    avatar,
    onDragStart,
    onDragEnd,
    compact = false
  } = props;
  // endregion
  let { name, path, type } = item;
  if (item.mimeType.includes('audio/')) {
    type = 'Audio';
  }
  let iconMap = {
    Page: '@mui/icons-material/InsertDriveFileOutlined',
    Video: '@mui/icons-material/VideocamOutlined',
    Template: '@mui/icons-material/CodeRounded',
    Taxonomy: '@mui/icons-material/LocalOfferOutlined',
    Component: '@mui/icons-material/ExtensionOutlined',
    Groovy: '@mui/icons-material/CodeRounded',
    JavaScript: '@mui/icons-material/CodeRounded',
    CSS: '@mui/icons-material/CodeRounded',
    Audio: '@mui/icons-material/AudiotrackOutlined'
  };
  let icon = { id: iconMap[type] ?? '@mui/icons-material/InsertDriveFileOutlined' };
  const systemIcon = <SystemIcon icon={icon} svgIconProps={{ className: 'media-icon' }} />;
  const CardActionAreaOrFragment = onPreview ? CardActionArea : React.Fragment;
  const cardActionAreaOrFragmentProps: CardActionAreaProps = onPreview
    ? {
        className: props.classes?.cardActionArea,
        disableRipple: Boolean(onDragStart || onDragEnd),
        onClick(e) {
          e.preventDefault();
          e.stopPropagation();
          onPreview(e);
        }
      }
    : {};

  return (
    <Card
      className={cx(classes.card, props.classes?.root)}
      draggable={Boolean(onDragStart || onDragEnd)}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
    >
      <CardHeader
        classes={{ action: classes.cardHeader, root: props.classes?.cardHeader }}
        avatar={
          onSelect ? (
            <FormGroup className={props.classes?.checkbox}>
              <Checkbox
                checked={selected.includes(path)}
                onClick={(e: any) => onSelect(path, e.target.checked)}
                color="primary"
                size="small"
              />
            </FormGroup>
          ) : (
            avatar
          )
        }
        title={name}
        subheader={showPath ? item.path : null}
        action={action}
        titleTypographyProps={{
          variant: 'subtitle2',
          component: 'h2',
          className: classes.cardTitle,
          title: item.name
        }}
        subheaderTypographyProps={{
          variant: 'subtitle2',
          component: 'div',
          className: classes.cardSubtitle,
          color: 'textSecondary',
          title: item.path
        }}
      />
      {!compact && (
        <CardActionAreaOrFragment {...cardActionAreaOrFragmentProps}>
          {type === 'Image' ? (
            <CardMedia
              className={cx(classes.media, props.classes?.media)}
              image={`${previewAppBaseUri}${path}`}
              title={name}
            />
          ) : (
            <div className={cx(classes.mediaIcon, props.classes?.mediaIcon)}>
              {type === 'Video' ? (
                <video className={classes.videoThumbnail}>
                  <source src={path} type="video/mp4" />
                  {systemIcon}
                </video>
              ) : (
                systemIcon
              )}
            </div>
          )}
        </CardActionAreaOrFragment>
      )}
    </Card>
  );
}

export default MediaCard;
