import React, { useEffect } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core';
import ExtensionRounded from '@material-ui/icons/ExtensionRounded';
import ImageRounded from '@material-ui/icons/ImageRounded';
import EmojiPeopleRounded from '@material-ui/icons/EmojiPeopleRounded';
import DevicesRounded from '@material-ui/icons/DevicesRounded';
import ChevronRightIcon from '@material-ui/icons/ChevronRightRounded';
import EditRounded from '@material-ui/icons/EditRounded';
import WarningRounded from '@material-ui/icons/WarningRounded';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Drawer from '@material-ui/core/Drawer';
import { DRAWER_WIDTH, selectTool, toolsLoaded, usePreviewContext } from './previewContext';
import Typography from '@material-ui/core/Typography';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { getPreviewToolsConfig } from '../../services/configuration';
import ToolPanel from './Tools/ToolPanel';
import AudiencesPanel from './Tools/AudiencesPanel';
import AssetsPanel from './Tools/AssetsPanel';
import ComponentsPanel from './Tools/ComponentsPanel';
import SimulatorPanel from './Tools/SimulatorPanel';
import ICEPanel from './Tools/ICEPanel';
import { getTranslation } from '../../utils/i18n';

const useStyles = makeStyles((theme: Theme) => createStyles({
  drawer: {
    flexShrink: 0,
    width: DRAWER_WIDTH
  },
  drawerPaper: {
    width: DRAWER_WIDTH,
    top: 64,
    zIndex: (theme.zIndex.appBar - 1)
  },
  itemIconRoot: {
    minWidth: 35
  },
  secondaryActionRoot: {
    display: 'flex'
  },

  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start'
  },
  panelTitle: {},
  panelBody: {},
  panelBodyInner: {
    padding: theme.spacing(1)
  },
  center: {
    textAlign: 'center'
  },

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

  ellipsis: {
    textOverflow: 'ellipsis',
    whitespace: 'no-wrap',
    overflow: 'hidden'
  }

}));

const translations = defineMessages({
  unknownPanel: {
    id: 'craftercms.ice.unknown.title',
    defaultMessage: 'Unknown Panel'
  },
  inContextEditing: {
    id: 'craftercms.ice.ice.title',
    defaultMessage: 'In Context Editing'
  },
  pageComponents: {
    id: 'craftercms.ice.components.title',
    defaultMessage: 'Components'
  },
  componentsPanel: {
    id: 'craftercms.ice.components.title',
    defaultMessage: 'Components'
  },
  assetsPanel: {
    id: 'craftercms.ice.assets.title',
    defaultMessage: 'Assets'
  },
  audiencesPanel: {
    id: 'craftercms.ice.audiences.title',
    defaultMessage: 'Audience Targeting'
  },
  publishingChannel: {
    id: 'craftercms.ice.simulator.title',
    defaultMessage: 'Device Simulator'
  }
});

function UnknownPanel(props: any) {
  const classes = useStyles({});
  return (
    <ToolPanel title={translations.unknownPanel}>
      <Typography component="div" variant="body1" className={`${classes.panelBodyInner} ${classes.center}`}>
        <div>
          <WarningRounded/>
        </div>
        <pre className={classes.ellipsis} title={props.id}>
          {props.id}
        </pre>
        <FormattedMessage
          id="previewTools.unknownPanel"
          defaultMessage={`This panel is unknown to the system. Please check your configuration.`}
        />
      </Typography>
    </ToolPanel>
  );
}

function ToolSelector() {

  const classes = useStyles({});
  const { formatMessage } = useIntl();
  const [{ tools }, dispatch] = usePreviewContext();
  const select = (toolChoice: any) => dispatch(selectTool(toolChoice));

  return (
    (tools == null) ? <>
      Loading...
    </> : <List>
      {tools.map((tool) => ({
        ...tool,
        Icon: componentIconMap[tool.id] || WarningRounded,
        title: getTranslation(tool.title, translations, formatMessage)
      })).map(({ id, title, Icon }) =>
        <ListItem key={id} button onClick={() => select(id)}>
          <ListItemIcon className={classes.itemIconRoot}><Icon/></ListItemIcon>
          <ListItemText primary={title}/>
          <ChevronRightIcon/>
        </ListItem>
      )}
    </List>
  );
}

const componentIconMap: any = {
  'craftercms.ice.components': ExtensionRounded,
  'craftercms.ice.assets': ImageRounded,
  'craftercms.ice.audiences': EmojiPeopleRounded,
  'craftercms.ice.simulator': DevicesRounded,
  'craftercms.ice.ice': EditRounded
};

const componentMap: any = {
  'craftercms.ice.components': ComponentsPanel,
  'craftercms.ice.assets': AssetsPanel,
  'craftercms.ice.audiences': AudiencesPanel,
  'craftercms.ice.simulator': SimulatorPanel,
  'craftercms.ice.ice': ICEPanel
};

export default function ToolsPanel() {

  const classes = useStyles({});
  const [{ tools, showToolsPanel, selectedTool }, dispatch] = usePreviewContext();

  let Tool = selectedTool ? componentMap[selectedTool] || UnknownPanel : ToolSelector;
  let toolMeta = tools ? tools.find((desc) => desc.id === selectedTool) : null;
  let config = tools ? (toolMeta || { config: null }).config : null;

  const site = 'editorial';
  useEffect(() => {
    !tools && getPreviewToolsConfig(site)
      .subscribe(
        (tools) => {
          dispatch(toolsLoaded(tools.modules));
        },
        (e) => {
          // TODO: Show error view.
          console.error(`AAAWWHHGG!! Tools panel config didn't load`, e);
        }
      )

  }, []);

  return (
    <Drawer
      open={showToolsPanel}
      anchor="right"
      variant="persistent"
      className={classes.drawer}
      classes={{ paper: classes.drawerPaper }}
    >
      <Tool id={toolMeta ? toolMeta.id : null} config={config}/>
    </Drawer>
  );

}
