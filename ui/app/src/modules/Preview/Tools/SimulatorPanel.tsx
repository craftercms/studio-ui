import { defineMessages, useIntl } from 'react-intl';
import React, { useEffect, useMemo, useReducer } from 'react';
import { DRAWER_WIDTH, setHostSize, usePreviewContext } from '../previewContext';
import { getTranslation } from '../../../utils/i18n';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import { ScreenRotationRounded } from '@material-ui/icons';
import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import TextField from '@material-ui/core/TextField';
import ToolPanel from './ToolPanel';

const SIMULATOR_PANEL_RESPONSIVE_MODE = 'craftercms.ice.simulator.previewWindowSize';
const SIMULATOR_PANEL_CUSTOM_MODE = 'craftercms.ice.simulator.custom';

const translations = defineMessages({
  simulatorPanel: {
    id: 'craftercms.ice.simulator.title',
    defaultMessage: 'Device Simulator'
  },
  smartPhone: {
    id: 'craftercms.ice.simulator.phone',
    defaultMessage: 'Phone'
  },
  tablet: {
    id: 'craftercms.ice.simulator.tablet',
    defaultMessage: 'Tablet'
  },
  desktop: {
    id: 'craftercms.ice.simulator.desktop',
    defaultMessage: 'Desktop'
  },
  previewWindowSize: {
    id: 'craftercms.ice.simulator.previewWindowSize',
    defaultMessage: 'Preview Window Size'
  },
  presets: {
    id: 'words.presets',
    defaultMessage: 'Presets'
  },
  custom: {
    id: 'words.custom',
    defaultMessage: 'Custom'
  }
});

const useStyles = makeStyles((theme: Theme) => createStyles({
  simulatorFlipColumn: {
    display: 'flex',
    alignItems: 'flex-end'
  },
  simulatorFlipButton: {
    marginBottom: `${theme.spacing(1)}px`
  },
  presetFieldset: {
    marginTop: theme.spacing(1)
  },
  panelBodyInner: {
    padding: theme.spacing(1)
  }
}));

function cleanseConfigNumericValue(element) {
  if (element) {
    const value = element.innerHTML.trim();
    if (value !== '') {
      return parseInt(value.replace(/px|em|pt/g, ''));
    } else {
      return null;
    }
  } else {
    return null;
  }
}

const INITIAL_STATE = {
  width: '',
  height: '',
  preset: SIMULATOR_PANEL_RESPONSIVE_MODE
};

const reducer = (a: any, b: any) => ({ ...a, ...b });

export default function SimulatorPanel(props: any) {

  const classes = useStyles({});
  const { formatMessage } = useIntl();
  const maxWidth = window.innerWidth - DRAWER_WIDTH;

  const channels = useMemo(() => {
    const _channels = props.config && props.config.channels;
    if (_channels) {
      if (!Array.isArray(_channels)) {
        console.log(`[SimulatorPanel] Expected channels to be array but instead got "${typeof _channels}"`);
      }
      return _channels.map((channel) => ({
        ...channel,
        value: `${channel.width}_${channel.height}`
      }));
    }
    return [];
  }, [props.config]);

  const [{ width, height, preset }, setState] = useReducer(reducer, INITIAL_STATE);
  const setWidth = (value) => setState({ width: value });
  const setHeight = (value) => setState({ height: value });

  const handlePresetChange = (e: any) => {
    const value = e.target.value;
    if (value === SIMULATOR_PANEL_RESPONSIVE_MODE) {
      dispatch(setHostSize({
        width: null,
        height: null
      }));
    } else {
      const channel = channels.find((chan) => chan.value === value);
      channel && dispatch(setHostSize({
        width: (channel.width > maxWidth) ? maxWidth : channel.width,
        height: channel.height
      }));
    }
  };

  const [{ hostSize }, dispatch] = usePreviewContext();
  const onDimensionKeyUp = (e: any) => {
    if (e.key === 'Enter') {

      let widthToSet, heightToSet;

      if (!width) {
        widthToSet = null;
      } else if (!isNaN(width as any)) {
        widthToSet = parseInt(width);
      } else {
        widthToSet = hostSize.width;
      }

      if (!height) {
        heightToSet = null;
      } else if (!isNaN(height as any)) {
        heightToSet = parseInt(height);
      } else {
        heightToSet = hostSize.height;
      }

      dispatch(setHostSize({
        width: widthToSet > maxWidth ? maxWidth : widthToSet,
        height: heightToSet
      }));

    }
  };

  useEffect(() => {
    const nextState: any = {};
    if (hostSize.width != null) {
      nextState.width = `${hostSize.width}`;
    } else {
      nextState.width = '';
    }
    if (hostSize.height != null) {
      nextState.height = `${hostSize.height}`;
    } else {
      nextState.height = '';
    }
    if (hostSize.width != null || hostSize.height != null) {
      const matchingPreset = channels.find((channel) =>
        // @ts-ignore
        channel.width == hostSize.width && channel.height == hostSize.height
      );
      nextState.preset = (matchingPreset)
        ? matchingPreset.value
        : SIMULATOR_PANEL_CUSTOM_MODE;
    } else {
      nextState.preset = SIMULATOR_PANEL_RESPONSIVE_MODE;
    }
    setState(nextState);
  }, [hostSize, props.config]);

  const onFlipDimensions = () => {
    const nextWidth = parseInt(height);
    const nextHeight = parseInt(width);
    dispatch(setHostSize({
      width: nextWidth > maxWidth ? maxWidth : nextWidth,
      height: nextHeight
    }));
  };

  const PRESETS = formatMessage(translations.presets);

  return (
    <ToolPanel title={translations.simulatorPanel}>
      <div className={classes.panelBodyInner}>
        <Grid container spacing={1}>
          <Grid item xs={4}>
            <TextField
              id="standard-basic"
              label="Width"
              name="width"
              type="number"
              margin="normal"
              placeholder="auto"
              onKeyUp={onDimensionKeyUp}
              onChange={(e) => setWidth(e.target.value)}
              value={width}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              id="standard-basic"
              label="Height"
              type="number"
              name="height"
              margin="normal"
              placeholder="auto"
              onKeyUp={onDimensionKeyUp}
              onChange={(e) => setHeight(e.target.value)}
              value={height}
            />
          </Grid>
          <Grid item xs={4} className={classes.simulatorFlipColumn}>
            <IconButton onClick={onFlipDimensions} className={classes.simulatorFlipButton}>
              <ScreenRotationRounded/>
            </IconButton>
          </Grid>
        </Grid>
        <Divider/>
        <FormControl component="fieldset" className={classes.presetFieldset}>
          <FormLabel component="legend">{PRESETS}</FormLabel>
          <RadioGroup
            value={preset}
            onChange={handlePresetChange}
            aria-label={PRESETS}
            name="craftercms.ice.simulator.device"
          >
            <FormControlLabel
              value={SIMULATOR_PANEL_CUSTOM_MODE}
              control={<Radio/>}
              label={formatMessage(translations.custom)}
              disabled={true}
            />
            <FormControlLabel
              value={SIMULATOR_PANEL_RESPONSIVE_MODE}
              control={<Radio/>}
              label={formatMessage(translations.previewWindowSize)}
            />
            {channels.map((channel) =>
              <FormControlLabel
                key={channel.value}
                value={channel.value}
                control={<Radio/>}
                label={formatMessage(getTranslation(channel.title, translations))}
              />
            )}
          </RadioGroup>
        </FormControl>
      </div>
    </ToolPanel>
  );
}
