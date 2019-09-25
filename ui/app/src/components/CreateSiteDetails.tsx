import React, { useState } from "react";
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import SwipeableViews from 'react-swipeable-views';
// @ts-ignore
import { autoPlay } from 'react-swipeable-views-utils';
import MobileStepper from "./MobileStepper";
import { defineMessages, useIntl } from "react-intl";
import { Image } from "../models/Blueprint";
import Button from "@material-ui/core/Button";
import Fab from "@material-ui/core/Fab";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Grid from "@material-ui/core/Grid";
import Link from '@material-ui/core/Link';

const useStyles = makeStyles((theme: Theme) => ({
  detailsView: {
    height: '100%',
    background: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto'
  },
  topBar: {
    display: 'flex',
    padding: '30px 20px',
    justifyContent: 'space-between'
  },
  carouselImg: {
    width: '100%',
    height: '300px',
    objectFit: 'cover'
  },
  detailsContainer: {
    position: 'relative',
    padding: '40px 20px'
  },
  dots: {
    position: 'absolute',
    background: 'none',
    left: '50%',
    transform: 'translate(-50%)',
    top: '-40px',
    zIndex: 999,
    '& .MuiMobileStepper-dot': {
      padding: '3px',
      margin: '2px',
      '&:hover': {
        background: 'gray'
      }
    }
  },
  circleBtn: {
    color: '#4F4F4F',
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    left: '40px',
    bottom: '40px',
    '&:hover': {
      backgroundColor: '#FFFFFF',
    },
  },
  section: {
    marginBottom: '20px'
  },
  bold: {
    fontWeight: 'bold'
  },
  video: {
    width: '100% !important',
    height: '300px !important'
  },
  viewContainer: {
    height: '300px'
  }
}));

interface CreateSiteError {
  onBack(event: any): any,

  error: {
    code: string,
    documentationUrl?: string,
    message: string,
    remedialAction: string
  },
}

const messages = defineMessages({
  use: {
    id: 'common.use',
    defaultMessage: 'Use'
  },
  version: {
    id: 'common.version',
    defaultMessage: 'Version'
  },
  developer: {
    id: 'common.developer',
    defaultMessage: 'Developer'
  },
  website: {
    id: 'common.website',
    defaultMessage: 'Website'
  },
  license: {
    id: 'common.license',
    defaultMessage: 'License'
  },
  craftercms: {
    id: 'common.craftercms',
    defaultMessage: 'crafterCMS'
  }
});

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

export default function CreateSiteDetails(props: any) {
  const classes = useStyles({});
  const [index, setIndex] = useState(0);
  const {blueprint, interval, onBlueprintSelected, onCloseDetails} = props;
  const {media, name, description, version, license, crafterCmsVersions, developer, website} = blueprint;
  const fullVersion = version ? `${version.major}.${version.minor}.${version.patch}` : null;
  const crafterCMS = crafterCmsVersions ? `${crafterCmsVersions[0].major}.${crafterCmsVersions[0].minor}.${crafterCmsVersions[0].patch}` : null;

  const {formatMessage} = useIntl();

  function handleChangeIndex(value: number) {
    setIndex(value);
  }

  function onDotClick(e: any, step: number) {
    e.stopPropagation();
    setIndex(step);
  }

  const steps = blueprint.media.screenshots.length + 1;

  return (
    <div className={classes.detailsView}>
      <div className={classes.topBar}>
        <Typography variant="h5" component="h1">
          {name}
        </Typography>
        <Button variant="contained" color="primary" onClick={() => onBlueprintSelected(blueprint, 1)}>
          {formatMessage(messages.use)}
        </Button>
      </div>
      <AutoPlaySwipeableViews
        index={index}
        autoplay={false}
        interval={interval}
        onChangeIndex={handleChangeIndex}
        enableMouseEvents
      >
        <div className={classes.viewContainer}>
          <video controls className={classes.video}>
            <source src="http://techslides.com/demos/sample-videos/small.mp4" type="video/mp4"/>
            Your browser does not support the video tag.
          </video>
        </div>
        {media.screenshots.map((step: Image, index: number) => (
          <div key={index} className={classes.viewContainer}>
            <img className={classes.carouselImg} src={step.url} alt={step.description}/>
          </div>
        ))}
      </AutoPlaySwipeableViews>
      <div className={classes.detailsContainer}>
        {steps > 1 &&
        <MobileStepper variant="dots" steps={steps} onDotClick={onDotClick} className={classes.dots} position={'static'}
                       activeStep={index}/>}
        <Grid container spacing={3}>
          <Grid item xs={8}>
            <Typography variant="body1">
            {description}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <div className={classes.section}>
              {
                developer &&
                <Typography variant="subtitle2" className={classes.bold}>
                  {formatMessage(messages.developer)}
                </Typography>
              }
              {
                developer.company &&
                <Typography variant="subtitle2">
                    {developer.company.name}
                </Typography>
              }
            </div>
            <div className={classes.section}>
              {
                website &&
                <Typography variant="subtitle2" className={classes.bold}>
                  {formatMessage(messages.website)}
                </Typography>
              }
              {
                website.name &&
                <Link href={website.url}>
                  {website.name}
                </Link>
              }
            </div>
            { fullVersion &&
              <div className={classes.section}>
                <Typography variant="subtitle2" className={classes.bold}>
                  {formatMessage(messages.version)}
                </Typography>
                  <Typography variant="subtitle2">
                  {fullVersion}
                </Typography>
              </div>
            }
            { license &&
            <div className={classes.section}>
                <Typography variant="subtitle2" className={classes.bold}>
                  {formatMessage(messages.license)}
                </Typography>
                <Typography variant="subtitle2">
                  {license.name}
                </Typography>
            </div>
            }
            { crafterCMS &&
            <div className={classes.section}>
                <Typography variant="subtitle2" className={classes.bold}>
                  {formatMessage(messages.craftercms)}
                </Typography>
                <Typography variant="subtitle2">
                  {crafterCMS}
                </Typography>
            </div>
            }
          </Grid>
        </Grid>
      </div>
      <Fab aria-label="back" className={classes.circleBtn} onClick={onCloseDetails}>
        <ArrowBackIcon/>
      </Fab>
    </div>
  )
}
