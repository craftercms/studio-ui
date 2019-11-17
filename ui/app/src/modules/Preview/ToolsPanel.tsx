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
import { defineMessages, useIntl } from 'react-intl';
import { getDOM } from '../../services/configuration';
import { map } from 'rxjs/operators';
import ToolPanel from './Tools/ToolPanel';
import AudiencesPanel from './Tools/AudiencesPanel';
import AssetsPanel from './Tools/AssetsPanel';
import ComponentsPanel from './Tools/ComponentsPanel';
import SimulatorPanel from './Tools/SimulatorPanel';
import ICEPanel from './Tools/ICEPanel';

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
  },
});

const ELEMENT_MOCKUP = { innerHTML: null };

function UnknownPanel() {
  const classes = useStyles({});
  return (
    <ToolPanel title={translations.unknownPanel}>
      <Typography component="div" variant="body1" className={`${classes.panelBodyInner} ${classes.center}`}>
        <WarningRounded/>
        <div>This Panel is unknown to the system. Please check your configuration.</div>
      </Typography>
    </ToolPanel>
  );
}

function ToolSelector() {

  const classes = useStyles({});
  const { formatMessage } = useIntl();
  const [{ tools }, dispatch] = usePreviewContext();
  const select = (toolChoice: any) => dispatch(selectTool(toolChoice));

  const site = 'editorial';
  useEffect(() => {
    getDOM(site, `/preview-tools/panel.xml`, 'studio')
      .pipe(
        map((xml) =>
          Array.from(xml.querySelectorAll('module')).map((module) => {
            const id = module.querySelector('moduleName').innerHTML;
            return {
              id: panelIdMapper[id] || id,
              titleKey: module.querySelector('title').innerHTML,
              config: (module.querySelector('config') || ELEMENT_MOCKUP).innerHTML
            };
          })
        )
      )
      .subscribe(
        (tools) => {
          dispatch(toolsLoaded(tools));
        },
        (e) => {
          // TODO: Show error view.
          console.error(`AAAWWHHGG!! Tools panel config didn't load`, e);
        }
      )
  }, []);

  return (
    (tools == null) ? <>
      Loading...
    </> : <List>
      {tools.map((tool) => ({
        ...tool,
        Icon: componentIconMap[tool.id] || WarningRounded,
        title: formatMessage((translations as any)[tool.titleKey] || translations.unknownPanel)
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

const panelIdMapper: any = {
  'ice-tools-panel': 'craftercms.ice.ice',
  'component-panel': 'craftercms.ice.components',
  'medium-panel': 'craftercms.ice.simulator'
};

export default function ToolsPanel() {

  const classes = useStyles({});
  const [state] = usePreviewContext();
  const { tools, showToolsPanel, selectedTool } = state;

  let Tool = selectedTool ? componentMap[selectedTool] || UnknownPanel : ToolSelector;
  let config = tools ? (tools.find((desc) => desc.id === selectedTool) || { config: null }).config : null

  return (
    <Drawer
      open={showToolsPanel}
      anchor="right"
      variant="persistent"
      className={classes.drawer}
      classes={{ paper: classes.drawerPaper }}
    >
      <Tool config={config}/>
    </Drawer>
  );

}
