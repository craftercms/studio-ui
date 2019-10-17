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

import React, { useState } from 'react';
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import SwipeableViews from 'react-swipeable-views';
// @ts-ignore
import { autoPlay } from 'react-swipeable-views-utils';
import makeStyles from "@material-ui/core/styles/makeStyles";
import { Blueprint } from "../models/Blueprint";
import { defineMessages, useIntl } from "react-intl";
import MobileStepper from "./MobileStepper";
import { backgroundColor } from "../styles/theme";
import Button from "@material-ui/core/Button";
import { Theme } from "@material-ui/core";
import clsx from "clsx";


interface BlueprintCard {
  onBlueprintSelected(blueprint: Blueprint, view: number): any,

  onDetails(blueprint: Blueprint, index?: number): any,

  blueprint: Blueprint,
  interval: number;
}

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);
const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
  },
  card: {
    maxWidth: '100%',
    minHeight: '358px',
    '& .cardTitle': {
      fontWeight: '600',
      lineHeight: '1.5rem',
      overflow: 'hidden',
      display: '-webkit-box',
      '-webkit-line-clamp': 1,
      '-webkit-box-orient': 'vertical',
      marginBottom: 0
    },
    '& .cardContent': {
      height: '6rem',
      padding: '12px 14px 5px 14px',
      position: 'relative',
    },
    '& .gitCard': {
      height: '11.1rem',
    },
    '& .cardActions': {
      justifyContent: 'space-around'
    },
    '& .developer': {
      overflow: 'hidden',
      display: '-webkit-box',
      '-webkit-line-clamp': 1,
      '-webkit-box-orient': 'vertical',
    },
  },
  carouselImg: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
    '&.git': {
      objectFit: 'fill',
    }
  },
  video: {
    width: '100%',
    height: '180px',
    outline: 'none',
    background: backgroundColor
  },
  chip: {
    fontSize: '12px',
    color: 'gray',
    backgroundColor: '#f5f5f5',
    padding: '5px',
    borderRadius: '5px',
    display: 'inline-block',
    '& label': {
      marginRight: '5px',
      marginBottom: 0,
      fontWeight: 400,
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
    width: '50%',
  },
  more: {
    width: '50%',
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  background: {
    background: backgroundColor,
    height: '180px',
    overflow: 'hidden'
  }
}));

const messages = defineMessages({
  version: {
    id: 'common.version',
    defaultMessage: 'Version'
  },
  license: {
    id: 'common.license',
    defaultMessage: 'License'
  },
  crafterCms: {
    id: 'common.crafterCMS',
    defaultMessage: 'Crafter CMS'
  },
  by: {
    id: 'common.by',
    defaultMessage: 'By'
  },
  noDev: {
    id: 'common.noDev',
    defaultMessage: 'No developer specified.'
  },
  use: {
    id: 'common.use',
    defaultMessage: 'Use'
  },
  more: {
    id: 'common.more',
    defaultMessage: 'More...'
  },
});

function BlueprintCard(props: BlueprintCard) {
  const classes = useStyles({});
  const [index, setIndex] = useState(0);
  const [play, setPlay] = useState(false);
  const {onBlueprintSelected, blueprint, interval, onDetails} = props;
  const {media, name, license, id, developer} = blueprint;
  const {formatMessage} = useIntl();

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

  function onImageClick(e: any, index: number) {
    if(blueprint.id === 'GIT') return false;
    e.stopPropagation();
    e.preventDefault();
    onDetails(blueprint, index);
  }

  function renderDeveloper() {
    if (developer) {
      if (developer.company) {
        return (
          <Typography gutterBottom variant="subtitle2" className={"developer"} color={"textSecondary"}>
            {formatMessage(messages.by)} {developer.company.name}
          </Typography>
        )
      } else {
        return developer.people.map((item:any) => item.name).join(",");
      }
    } else {
      return (
        <Typography gutterBottom variant="subtitle1" className={"developer"} color={"textSecondary"}>
          {formatMessage(messages.noDev)}
        </Typography>
      )
    }

  }

  function renderMedias(id: string) {
    let videos: any = (media && media.videos) ? {...media.videos, type: 'video'} : [];
    videos = videos.length ? videos.map((obj: any) => ({...obj, type: 'video'})) : [];
    let screenshots: any = (media && media.screenshots) ? media.screenshots : [];
    const merged = [...videos, ...screenshots];
    return merged.map((item, index) => {
      if (item.type !== 'video') {
        return (
          <div key={index} className={classes.background} onClick={ (event) => onImageClick(event, index)}>
            <img className={clsx(classes.carouselImg, id === 'GIT' && 'git')} src={item.url} alt={item.description}/>
          </div>
        )
      } else {
        return (
          <video key={index} controls className={classes.video} autoPlay={play} onPlaying={handlePlay}
                 onEnded={handleEnded}>
            <source src={item.url} type="video/mp4"/>
            Your browser does not support the video tag.
          </video>
        )
      }
    })
  }

  let steps = 0;
  (blueprint.media && blueprint.media.screenshots) ? steps = blueprint.media.screenshots.length : steps = 0;
  (blueprint.media && blueprint.media.videos) ? steps += blueprint.media.videos.length : steps += 0;

  return (
    <Card className={classes.card}>
      <CardActionArea onClick={() => onBlueprintSelected(blueprint, 1)}>
        <AutoPlaySwipeableViews
          index={index}
          interval={interval}
          autoplay={false}
          onChangeIndex={handleChangeIndex}
          enableMouseEvents
        >
          {renderMedias(id)}
        </AutoPlaySwipeableViews>
        {steps > 0 && (id !== 'GIT') &&
        <MobileStepper variant="dots" steps={steps} onDotClick={onDotClick} className={classes.dots} position={"static"}
                       activeStep={index}/>}
        <CardContent className={clsx('cardContent', id === 'GIT' && 'gitCard')}>
          <Typography gutterBottom variant="subtitle1" component="h2" className={"cardTitle"}>
            {name}
          </Typography>
          {
            (id !== 'GIT') &&
            <div>
              {renderDeveloper()}
                <div className={classes.chip}>
                    <label>{formatMessage(messages.license)}</label>
                    <span>{license.name}</span>
                </div>
            </div>
          }
        </CardContent>
      </CardActionArea>
      {
        (id !== 'GIT') &&
        <CardActions className={'cardActions'}>
            <Button variant="outlined" color="primary" onClick={() => onBlueprintSelected(blueprint, 1)}
                    className={classes.use}>
              {formatMessage(messages.use)}
            </Button>
            <Button className={classes.more} onClick={() => onDetails(blueprint)}>
              {formatMessage(messages.more)}
            </Button>
        </CardActions>
      }
    </Card>
  )
}

export default BlueprintCard;
