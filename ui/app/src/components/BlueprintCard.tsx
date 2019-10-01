import React, { useState } from 'react';
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import IconButton from "@material-ui/core/IconButton";
import MoreVertIcon from '@material-ui/icons/MoreVert';
import SwipeableViews from 'react-swipeable-views';
// @ts-ignore
import { autoPlay } from 'react-swipeable-views-utils';
import makeStyles from "@material-ui/core/styles/makeStyles";
import { Blueprint } from "../models/Blueprint";
import { defineMessages, useIntl } from "react-intl";
import MobileStepper from "./MobileStepper";
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';


interface BlueprintCard {
  onBlueprintSelected(blueprint: Blueprint, view: number): any,
  onDetails(blueprint: Blueprint): any,
  blueprint: Blueprint,
  interval: number;
}

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);
const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  card: {
    maxWidth: '100%',
    minHeight: '314px',
    '& .cardTitle': {
      fontWeight: '600',
      lineHeight: '1.5rem'
    },
    '& .cardContent': {
      height: '6rem',
      paddingBottom: '0',
      position: 'relative',
      boxSizing: 'initial',
    },
    '& .cardActions': {
      paddingTop: '0'
    }
  },
  carouselImg: {
    width: '100%',
    height: '200px',
    objectFit: 'cover'
  },
  video: {
    width: '100%',
    height: '200px',
    outline: 'none',
    background: '#ebebf1'
  },
  chip: {
    fontSize: '12px',
    color: 'gray',
    margin: theme.spacing(1),
    backgroundColor: '#f5f5f5',
    padding: '5px',
    borderRadius: '5px',
    '& label': {
      display: 'block',
      marginBottom: 0,
      fontWeight: 400,
    },
    '& span': {
      color: '#2F2707'
    }
  },
  gitOptions: {
    height: '4.3rem'
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
    position: 'absolute',
    background: 'none',
    left: '50%',
    transform: 'translate(-50%)',
    top: '-30px',
    zIndex: 999,
    '& .MuiMobileStepper-dot': {
      padding: '3px',
      margin: '2px',
      '&:hover':{
        background: 'gray'
      }
    }
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
    defaultMessage: 'CrafterCMS'
  }
});

function BlueprintCard(props: BlueprintCard) {
  const classes = useStyles({});
  const [index, setIndex] = useState(0);
  const [play, setPlay] = useState(false);
  const {onBlueprintSelected, blueprint, interval, onDetails} = props;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const {media, name, description, version, license, crafterCmsVersions, id} = blueprint;
  const fullVersion = version ? `${version.major}.${version.minor}.${version.patch}` : null;
  const crafterCMS = crafterCmsVersions ? `${crafterCmsVersions[0].major}.${crafterCmsVersions[0].minor}.${crafterCmsVersions[0].patch}` : null;
  const { formatMessage } = useIntl();

  function handleChangeIndex(value: number) {
    setIndex(value);
  }

  function handleClick(event: any) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose(blueprint: Blueprint) {
    setAnchorEl(null);
    onDetails(blueprint);
  }

  function onDotClick(e:any, step: number) {
    e.stopPropagation();
    setIndex(step);
  }

  function handlePlay() {
    setPlay(true);
  }

  function handleEnded() {
    setPlay(false);
  }

  function renderMedias(){
    let videos:any = media.videos? {...media.videos, type: 'video'} : [];
    videos = videos.lenght? videos.map((obj:any)=> ({ ...obj, type: 'video' })) : [];
    const merged = [...videos, ...media.screenshots];
    return merged.map((item, index) => {
      if(item.type !== 'video') {
        return (
          <div key={index}>
            <img className={classes.carouselImg} src={item.url} alt={item.description}/>
          </div>
        )
      }else {
        return (
          <video key={index} controls className={classes.video} autoPlay={play} onPlaying={handlePlay} onEnded={handleEnded}>
            <source src={item.url} type="video/mp4"/>
            Your browser does not support the video tag.
          </video>
        )
      }
    })
  }

  let steps = blueprint.media.screenshots? blueprint.media.screenshots.length : 0;
  steps += blueprint.media.videos? blueprint.media.videos.length : 0;

  return (
    <Card className={classes.card}>
      <CardActionArea onClick={() => onBlueprintSelected(blueprint, 1)}>
        <AutoPlaySwipeableViews
          index={index}
          autoplay={!play}
          interval={interval}
          onChangeIndex={handleChangeIndex}
          enableMouseEvents
        >
          {renderMedias()}
        </AutoPlaySwipeableViews>
        <CardContent className={'cardContent'}>
          {steps > 1 && <MobileStepper variant="dots" steps={steps} onDotClick={onDotClick} className={classes.dots} position={'static'} activeStep={index}/>}
          <Typography gutterBottom variant="subtitle1" component="h2" className={'cardTitle'}>
            {name}
          </Typography>
          <Typography variant="body2" component="p">
            {description}
          </Typography>
        </CardContent>
        {
          (id === 'GIT') &&
          <div className={classes.gitOptions}/>
        }
      </CardActionArea>
      {
        (id !== 'GIT') &&
        <CardActions disableSpacing className={'cardActions'}>
          <div className={classes.chip}>
              <label>{formatMessage(messages.version)}</label>
              <span>{fullVersion}</span>
          </div>
          <div className={classes.chip}>
              <label>{formatMessage(messages.license)}</label>
              <span>{license.name}</span>
          </div>
          <div className={classes.chip}>
              <label>{formatMessage(messages.crafterCms)}</label>
              <span>{crafterCMS}</span>
          </div>
          <IconButton aria-label="options" aria-controls="simple-menu" aria-haspopup="true" className={classes.options} onClick={handleClick}>
              <MoreVertIcon/>
          </IconButton>
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem onClick={() => handleClose(blueprint)}>Details</MenuItem>
            </Menu>
      </CardActions>
      }
    </Card>
  )
}

export default BlueprintCard;
