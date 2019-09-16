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
import { Blueprint, Image } from "../models/Blueprint";
import { Labels } from "../models/Site";


interface BlueprintCard {
  onBlueprintSelected(blueprint: Blueprint, view: number): any,
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
      paddingBottom: '0'
    },
    '& .cardActions': {
      paddingTop: '0'
    }
  },
  carouselImg: {
    width: '100%',
    height: '200px',
  },
  chip: {
    fontSize: '12px',
    color: 'gray',
    margin: theme.spacing(1),
    backgroundColor: '#f5f5f5',
    padding: '5px',
    borderRadius: '5px',
    '& label': {
      display: 'block'
    },
    '& span': {
      color: '#2F2707'
    }
  },
  gitOptions: {
    height: '62px'
  },
  options: {
    marginLeft: 'auto'
  },
  dialogContent: {
    display: 'flex'
  }
}));

const labels: Labels = {
  version: 'Version',
  license: 'License',
  crafterCms: 'CrafterCMS'
};

function BlueprintCard(props: BlueprintCard) {
  const classes = useStyles({});
  const [index, setIndex] = useState(0);
  const {onBlueprintSelected, blueprint, interval} = props;
  const {media, name, description, version, license, crafterCmsVersions, id} = blueprint;
  const {minor, major, patch} = version;
  const fullVersion = version ? `${major}.${minor}.${patch}` : null;
  const crafterCMS = crafterCmsVersions ? `${crafterCmsVersions[0].major}.${crafterCmsVersions[0].minor}.${crafterCmsVersions[0].patch}` : null;

  function handleChangeIndex(value: number) {
    setIndex(value);
  }

  return (
    <Card className={classes.card}>
      <CardActionArea onClick={() => onBlueprintSelected(blueprint, 1)}>
        <AutoPlaySwipeableViews
          index={index}
          autoplay={true}
          interval={interval}
          onChangeIndex={handleChangeIndex}
          enableMouseEvents
        >
          {media.screenshots.map((step: Image, index: number) => (
            <div key={index}>
              <img className={classes.carouselImg} src={step.url} alt={step.description}/>
            </div>
          ))}
        </AutoPlaySwipeableViews>
        <CardContent className={'cardContent'}>
          <Typography gutterBottom variant="subtitle1" component="h2" className={'cardTitle'}>
            {name}
          </Typography>
          <Typography variant="body2" component="p">
            {description}
          </Typography>
        </CardContent>
        {(id === 'GIT') && <div className={classes.gitOptions}/>}
      </CardActionArea>
      {(id !== 'GIT') && <CardActions disableSpacing className={'cardActions'}>
          <div className={classes.chip}>
              <label>{labels.version}</label>
              <span>{fullVersion}</span>
          </div>
          <div className={classes.chip}>
              <label>{labels.license}</label>
              <span>{license.name}</span>
          </div>
          <div className={classes.chip}>
              <label>{labels.crafterCms}</label>
              <span>{crafterCMS}</span>
          </div>
          <IconButton aria-label="options" className={classes.options}>
              <MoreVertIcon/>
          </IconButton>
      </CardActions>}
    </Card>
  )
}

export default BlueprintCard;
