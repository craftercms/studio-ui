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

import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import SwipeableViews from 'react-swipeable-views';
// @ts-ignore
import { autoPlay } from 'react-swipeable-views-utils';
import { Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import { MarketplacePlugin } from '../../models/MarketplacePlugin';
import { defineMessages, useIntl } from 'react-intl';
import MobileStepper from '../MobileStepper/MobileStepper';
import { backgroundColor } from '../../styles/theme';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import clsx from 'clsx';
import cardTitleStyles from '../../styles/card';
import SecondaryButton from '../SecondaryButton';

interface PluginCardProps {
  plugin: MarketplacePlugin;
  changeImageSlideInterval?: number;
  isMarketplacePlugin?: boolean;
  inUse?: boolean;
  usePermission?: boolean;
  beingInstalled?: boolean;
  useLabel?: string | JSX.Element;
  disableCardActionClick?: boolean;

  onPluginSelected(plugin: MarketplacePlugin, view: number): any;

  onDetails(plugin: MarketplacePlugin, index?: number): any;
}

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);
const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1
  },
  card: {
    maxWidth: '100%',
    minHeight: '339px',
    '& .cardTitle': {
      ...cardTitleStyles
    },
    '& .cardContent': {
      height: '13.26em',
      padding: '12px 14px 5px 14px',
      position: 'relative'
    },
    '& .cardActions': {
      justifyContent: 'space-around'
    },
    '& .developer': {
      overflow: 'hidden',
      display: '-webkit-box',
      '-webkit-line-clamp': 1,
      '-webkit-box-orient': 'vertical',
      marginBottom: 0
    }
  },
  carouselImg: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
    '&.git': {
      objectFit: 'fill'
    }
  },
  video: {
    width: '100%',
    height: '180px',
    outline: 'none',
    background: backgroundColor
  },
  chip: {
    fontSize: '11px',
    color: 'gray',
    backgroundColor: '#f5f5f5',
    padding: '2px 5px',
    borderRadius: '5px',
    display: 'inline-block',
    whiteSpace: 'nowrap',
    '& label': {
      marginRight: '5px',
      marginBottom: 0,
      fontWeight: 400
    },
    '& span': {
      color: '#2F2707'
    }
  },
  options: {
    marginLeft: 'auto'
  },
  dialogContent: {
    display: 'flex'
  },
  imgWrapper: {
    position: 'relative'
  },
  dots: {
    background: 'none',
    borderTop: '1px solid #e4e3e3',
    height: '30px',
    padding: '0',
    cursor: 'pointer',
    '& .MuiMobileStepper-dot': {
      padding: '6px',
      margin: '4px',
      '&:hover': {
        background: 'gray'
      }
    }
  },
  use: {
    width: '50%'
  },
  more: {
    width: '50%',
    textAlign: 'center',
    color: theme.palette.text.secondary,
    flex: 1
  },
  background: {
    background: backgroundColor,
    height: '180px',
    overflow: 'hidden',
    '&.git': {
      background: 'none'
    }
  },
  subtitleContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  }
}));

const messages = defineMessages({
  version: {
    id: 'plugin.version',
    defaultMessage: 'Version'
  },
  license: {
    id: 'plugin.license',
    defaultMessage: 'License'
  },
  crafterCms: {
    id: 'plugin.crafterCMS',
    defaultMessage: 'Crafter CMS'
  },
  by: {
    id: 'plugin.by',
    defaultMessage: 'By'
  },
  noDev: {
    id: 'plugin.noDev',
    defaultMessage: 'No developer specified.'
  },
  use: {
    id: 'plugin.use',
    defaultMessage: 'Use'
  },
  more: {
    id: 'plugin.more',
    defaultMessage: 'More...'
  },
  licenseTooltip: {
    id: 'plugin.licenseTooltip',
    defaultMessage: '{license} license'
  }
});

function PluginCard(props: PluginCardProps) {
  const classes = useStyles({});
  const [index, setIndex] = useState(0);
  const [play, setPlay] = useState(false);
  const {
    onPluginSelected,
    plugin,
    changeImageSlideInterval = 5000,
    isMarketplacePlugin = true,
    onDetails,
    inUse = false,
    usePermission = true,
    beingInstalled = false,
    disableCardActionClick = false,
    useLabel
  } = props;
  const { media, name, license, id, developer } = plugin;
  const { formatMessage } = useIntl();

  function handleChangeIndex(value: number) {
    setIndex(value);
  }

  function onDotClick(e: any, step: number) {
    e.stopPropagation();
    setIndex(step);
  }

  function handlePlay() {
    setPlay(true);
  }

  function handleEnded() {
    setPlay(false);
  }

  function onImageClick(e: any, index: number = 0) {
    if (plugin.id === 'GIT') return false;
    e.stopPropagation();
    e.preventDefault();
    onDetails(plugin, index);
  }

  function renderLicense() {
    return (
      <Tooltip title={formatMessage(messages.licenseTooltip, { license: license.name })}>
        <div className={classes.chip}>
          <span>{license.name}</span>
        </div>
      </Tooltip>
    );
  }

  function renderSubtitle() {
    if (developer) {
      if (developer.company) {
        return (
          <div className={classes.subtitleContainer}>
            <Typography gutterBottom variant="subtitle2" className="developer" color="textSecondary">
              {formatMessage(messages.by)} {developer.company.name}
            </Typography>
            {renderLicense()}
          </div>
        );
      } else {
        return developer.people.map((item: any) => item.name).join(',');
      }
    } else {
      return (
        <div className={classes.subtitleContainer}>
          <Typography gutterBottom variant="subtitle1" className="developer" color="textSecondary">
            {formatMessage(messages.noDev)}
          </Typography>
          {renderLicense()}
        </div>
      );
    }
  }

  function renderMedias(id: string) {
    let videos: any = media && media.videos ? { ...media.videos, type: 'video' } : [];
    videos = videos.length ? videos.map((obj: any) => ({ ...obj, type: 'video' })) : [];
    let screenshots: any = media && media.screenshots ? media.screenshots : [];
    const merged = [...videos, ...screenshots];
    return merged.map((item, index) => {
      if (item.type !== 'video') {
        return (
          <div
            key={index}
            className={clsx(classes.background, id === 'GIT' && 'git')}
            onClick={(event) => onImageClick(event, index)}
          >
            <img className={clsx(classes.carouselImg, id === 'GIT' && 'git')} src={item.url} alt={item.description} />
          </div>
        );
      } else {
        return (
          <video
            muted
            controls
            key={index}
            autoPlay={play}
            onEnded={handleEnded}
            className={classes.video}
            onPlaying={handlePlay}
          >
            <source src={item.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );
      }
    });
  }

  let steps = 0;
  plugin.media && plugin.media.screenshots ? (steps = plugin.media.screenshots.length) : (steps = 0);
  plugin.media && plugin.media.videos ? (steps += plugin.media.videos.length) : (steps += 0);

  return (
    <Card className={classes.card}>
      {id !== 'GIT' && (
        <CardActionArea
          disabled={disableCardActionClick}
          onClick={(e) => {
            if (isMarketplacePlugin && !plugin.compatible) {
              onImageClick(e);
            } else {
              onPluginSelected(plugin, 1);
            }
          }}
        >
          {/*
          // @ts-ignore */}
          <CardHeader
            title={name}
            subheader={id !== 'GIT' ? renderSubtitle() : ''}
            titleTypographyProps={{
              variant: 'subtitle2',
              component: 'h2',
              className: 'cardTitle'
            }}
            subheaderTypographyProps={{
              variant: 'subtitle2',
              component: 'h2',
              color: 'textSecondary'
            }}
          />
        </CardActionArea>
      )}
      <CardActionArea
        disabled={disableCardActionClick}
        onClick={() => {
          onPluginSelected(plugin, 1);
        }}
      >
        <AutoPlaySwipeableViews
          index={index}
          interval={changeImageSlideInterval}
          autoplay={false}
          onChangeIndex={handleChangeIndex}
          enableMouseEvents
        >
          {renderMedias(id)}
        </AutoPlaySwipeableViews>
        {id === 'GIT' && (
          <CardContent className="cardContent">
            <Typography gutterBottom variant="subtitle2" component="h2" className="cardTitle">
              {name}
            </Typography>
            <Typography gutterBottom variant="subtitle2" component="h2" color="textSecondary">
              {plugin.description}
            </Typography>
          </CardContent>
        )}
      </CardActionArea>
      {steps > 0 && id !== 'GIT' && (
        <MobileStepper
          variant="dots"
          steps={steps}
          onDotClick={onDotClick}
          className={classes.dots}
          position={'static'}
          activeStep={index}
        />
      )}
      {id !== 'GIT' && (
        <CardActions className={'cardActions'}>
          {((isMarketplacePlugin && plugin.compatible) || !isMarketplacePlugin) && ( // if it's from marketplace and compatible, or not from marketplace (private bps)
            <SecondaryButton
              color="primary"
              disabled={!usePermission || inUse || beingInstalled}
              loading={beingInstalled}
              onClick={() => onPluginSelected(plugin, 1)}
              className={classes.use}
            >
              {useLabel ? useLabel : formatMessage(messages.use)}
            </SecondaryButton>
          )}
          <Button className={classes.more} onClick={() => onDetails(plugin)}>
            {formatMessage(messages.more)}
          </Button>
        </CardActions>
      )}
    </Card>
  );
}

export default PluginCard;
