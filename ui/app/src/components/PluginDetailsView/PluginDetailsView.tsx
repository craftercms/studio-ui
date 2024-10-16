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

import React, { useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import Typography from '@mui/material/Typography';
import SwipeableViews from 'react-swipeable-views';
// @ts-ignore
import { autoPlay } from 'react-swipeable-views-utils';
import MobileStepper from '../MobileStepper/MobileStepper';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { MarketplacePlugin } from '../../models/MarketplacePlugin';
import Fab from '@mui/material/Fab';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Grid from '@mui/material/Grid2';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Alert from '@mui/material/Alert';
import { backgroundColor } from '../../styles/theme';
// @ts-ignore
import { fadeIn } from 'react-animations';
import PrimaryButton from '../PrimaryButton';
import PluginDocumentation from '../PluginDocumentation';

const useStyles = makeStyles()((theme) => ({
  fadeIn: {
    animation: `${fadeIn} 1s`
  },
  detailsView: {
    height: '100%',
    overflow: 'auto'
  },
  topBar: {
    display: 'flex',
    padding: '20px',
    alignItems: 'center'
  },
  carouselImg: {
    width: '100%',
    height: '340px',
    objectFit: 'contain'
  },
  detailsContainer: {
    position: 'relative',
    padding: '20px'
  },
  dots: {
    background: 'none',
    borderTop: '1px solid #e4e3e3',
    height: '30px',
    padding: '0',
    cursor: 'pointer',
    '& .MuiMobileStepper-dot': {
      padding: '7px',
      margin: '4px',
      '&:hover': {
        background: 'gray'
      }
    }
  },
  useBtn: {
    marginLeft: 'auto',
    maxHeight: '36px'
  },
  circleBtn: {
    color: '#4F4F4F',
    backgroundColor: '#FFFFFF',
    marginRight: '30px',
    '&:hover': {
      backgroundColor: '#FFFFFF'
    }
  },
  section: {
    marginBottom: '5px'
  },
  sectionChips: {
    display: 'flex',
    padding: 0,
    alignitems: 'center',
    marginTop: '10px'
  },
  bold: {
    fontWeight: 'bold'
  },
  video: {
    width: '100%',
    height: '300px',
    outline: 'none',
    background: backgroundColor
  },
  chip: {
    fontSize: '12px',
    color: 'gray',
    marginRight: theme.spacing(1),
    backgroundColor: theme.palette.background.default,
    padding: '5px',
    borderRadius: '5px',
    '& label': {
      display: 'block',
      marginBottom: 0,
      fontWeight: 400
    },
    '& span': {
      color: theme.palette.text.primary
    }
  },
  link: {
    color: theme.palette.text.secondary,
    '& svg': {
      verticalAlign: 'sub',
      fontSize: '1.1rem'
    }
  },
  background: {
    background: theme.palette.background.default,
    height: '340px'
  },
  detailsNotCompatible: {
    marginBottom: '15px',
    backgroundColor: theme.palette.error.light,
    '& .MuiAlert-icon': {
      color: theme.palette.error.main
    },
    '& .MuiAlert-message': {
      color: theme.palette.error.contrastText
    }
  }
}));

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
    defaultMessage: 'CrafterCMS'
  }
});

interface PluginDetailsViewProps {
  plugin: MarketplacePlugin;
  selectedImageSlideIndex?: number;
  changeImageSlideInterval?: number;
  isMarketplacePlugin?: boolean;
  useLabel?: string | JSX.Element;
  usePermission?: boolean;
  inUse?: boolean;
  beingInstalled?: boolean;

  onCloseDetails(event: any): any;

  onBlueprintSelected(blueprint: MarketplacePlugin, view: number): any;
}

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

export function PluginDetailsView(props: PluginDetailsViewProps) {
  const { classes, cx } = useStyles();
  const [play, setPlay] = useState(false);
  const {
    plugin,
    changeImageSlideInterval = 5000,
    onBlueprintSelected,
    onCloseDetails,
    selectedImageSlideIndex = 0,
    isMarketplacePlugin = true,
    inUse = false,
    usePermission = true,
    beingInstalled = false,
    useLabel
  } = props;
  const [index, setIndex] = useState(selectedImageSlideIndex);
  const { media, name, description, version, license, developer, website, compatible } = plugin;
  const fullVersion = version ? `${version.major}.${version.minor}.${version.patch}` : null;

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

  function renderMedias() {
    let videos: any = media && media.videos ? { ...media.videos, type: 'video' } : [];
    videos = videos.length ? videos.map((obj: any) => ({ ...obj, type: 'video' })) : [];
    let screenshots: any = media && media.screenshots ? media.screenshots : [];
    const merged = [...videos, ...screenshots];

    return merged.map((item, index) => {
      if (item.type !== 'video') {
        return (
          <div key={index} className={classes.background}>
            <img className={classes.carouselImg} src={item.url} alt={item.description} />
          </div>
        );
      } else {
        return (
          <video
            key={index}
            controls
            className={classes.video}
            autoPlay={play}
            onPlaying={handlePlay}
            onEnded={handleEnded}
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
    <div className={cx(classes.detailsView, classes.fadeIn)}>
      <div className={classes.topBar}>
        <Fab aria-label="back" className={classes.circleBtn} onClick={onCloseDetails}>
          <ArrowBackIcon />
        </Fab>
        <Typography variant="h5" component="h1">
          {name}
        </Typography>
        {((isMarketplacePlugin && compatible) || !isMarketplacePlugin) && ( // if it's from marketplace and compatible, or not from marketplace (private bps)
          <PrimaryButton
            variant="contained"
            color="primary"
            className={classes.useBtn}
            disabled={!usePermission || inUse || beingInstalled}
            loading={beingInstalled}
            onClick={() => onBlueprintSelected(plugin, 1)}
          >
            {useLabel ? useLabel : formatMessage(messages.use)}
          </PrimaryButton>
        )}
      </div>
      <AutoPlaySwipeableViews
        index={index}
        autoplay={!play}
        interval={changeImageSlideInterval}
        onChangeIndex={handleChangeIndex}
        enableMouseEvents
        slideStyle={{ height: '340px' }}
      >
        {renderMedias()}
      </AutoPlaySwipeableViews>
      {steps > 1 && (
        <MobileStepper
          variant="dots"
          steps={steps}
          onDotClick={onDotClick}
          className={classes.dots}
          position="static"
          activeStep={index}
        />
      )}
      <div className={classes.detailsContainer}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            {isMarketplacePlugin && !compatible && (
              <Alert severity="error" className={classes.detailsNotCompatible}>
                <FormattedMessage
                  id="pluginDetails.notCompatible"
                  defaultMessage="This blueprint is not compatible with your current version of CrafterCMS."
                />
              </Alert>
            )}
            <Typography variant="body1">{description}</Typography>
            <PluginDocumentation plugin={plugin} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <div className={classes.section}>
              {developer && <Typography variant="subtitle2">{formatMessage(messages.developer)}</Typography>}
              {developer && developer.company && (
                <Typography variant="subtitle2" color={'textSecondary'}>
                  {developer.company.name}
                </Typography>
              )}
              {developer && developer.people && (
                <Typography variant="subtitle2" color={'textSecondary'}>
                  {developer.people.name}
                </Typography>
              )}
            </div>
            <div className={classes.section}>
              {website && <Typography variant="subtitle2">{formatMessage(messages.website)}</Typography>}
              {website && website.name && (
                <Typography variant="subtitle2" component="p">
                  <a className={classes.link} href={website.url} target={'blank'}>
                    {website.name} <OpenInNewIcon />
                  </a>
                </Typography>
              )}
            </div>
            <div className={classes.sectionChips}>
              <div className={classes.chip}>
                <label>{formatMessage(messages.version)}</label>
                <span>{fullVersion}</span>
              </div>
              <div className={classes.chip}>
                <label>{formatMessage(messages.license)}</label>
                <span>{license.name}</span>
              </div>
            </div>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export default PluginDetailsView;
