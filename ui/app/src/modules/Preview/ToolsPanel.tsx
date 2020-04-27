/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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

import React, { useEffect } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core';
import ExtensionRounded from '@material-ui/icons/ExtensionRounded';
import ImageRounded from '@material-ui/icons/ImageRounded';
import EmojiPeopleRounded from '@material-ui/icons/EmojiPeopleRounded';
import DevicesRounded from '@material-ui/icons/DevicesRounded';
import ChevronRightIcon from '@material-ui/icons/ChevronRightRounded';
import WarningRounded from '@material-ui/icons/WarningRounded';
import AccountTreeRoundedIcon from '@material-ui/icons/AccountTreeRounded';
import SearchRoundedIcon from '@material-ui/icons/SearchRounded';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Drawer from '@material-ui/core/Drawer';
import { DRAWER_WIDTH } from './previewContext';
import Typography from '@material-ui/core/Typography';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import ToolPanel from './Tools/ToolPanel';
import AudiencesPanel from './Tools/AudiencesPanel';
import AssetsPanel from './Tools/AssetsPanel';
import ComponentsPanel from './Tools/ComponentsPanel';
import SimulatorPanel from './Tools/SimulatorPanel';
import { getTranslation } from '../../utils/i18n';
import EditFormPanel from './Tools/EditFormPanel';
import ReceptaclesPanel from './Tools/ReceptaclesPanel';
import { fetchPreviewToolsConfig, selectTool } from '../../state/actions/preview';
import { useDispatch } from 'react-redux';
import {
  useActiveSiteId,
  usePreviewState,
  useSelection,
  useStateResource
} from '../../utils/hooks';
import EmptyState from '../../components/SystemStatus/EmptyState';
import BrowseComponentsPanel from './Tools/BrowseComponentsPanel';
import ContentTree from './Tools/ContentTree';
import { nnou } from '../../utils/object';
import Suspencified from '../../components/SystemStatus/Suspencified';
import SearchPanel from './Tools/SearchPanel';
import PreviewTool from '../../models/PreviewTool';
import { Resource } from '../../models/Resource';
import { SvgIconTypeMap } from '@material-ui/core/SvgIcon/SvgIcon';
import { OverridableComponent } from '@material-ui/core/OverridableComponent';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawer: {
      flexShrink: 0,
      width: DRAWER_WIDTH
    },
    drawerPaper: {
      top: 64,
      bottom: 0,
      height: 'auto',
      width: DRAWER_WIDTH,
      zIndex: theme.zIndex.appBar - 1
    },
    itemIconRoot: {
      minWidth: 35
    },
    itemSearch: {
      padding: '0 16px'
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
    },
    emptyState: {
      margin: `${theme.spacing(4)}px ${theme.spacing(1)}px`
    },
    emptyStateImage: {
      width: '50%',
      marginBottom: theme.spacing(1)
    }
  })
);

const translations = defineMessages({
  unknownPanel: {
    id: 'craftercms.ice.unknown.title',
    defaultMessage: 'Unknown Panel'
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
  browseComponentsPanel: {
    id: 'craftercms.ice.browseComponents.title',
    defaultMessage: 'Browse Components'
  },
  contentTreePanel: {
    id: 'craftercms.ice.contentTreePanel.title',
    defaultMessage: 'Content Tree'
  },
  searchPanel: {
    id: 'craftercms.ice.contentTreePanel.title',
    defaultMessage: 'Search Everywhere'
  },
  loading: {
    id: 'words.loading',
    defaultMessage: 'Loading'
  }
});

interface UnknownPanelProps {
  id: string;
}

interface Config {
  width: number;
  height: number;
  title: string;
}

interface Tool {
  config: Config;
  id: PreviewTool;
  title: string;
}

interface ToolSelectorProps {
  resource: Resource<Tool[]>;
}

function UnknownPanel(props: UnknownPanelProps) {
  const classes = useStyles({});
  return (
    <ToolPanel title={translations.unknownPanel}>
      <Typography
        component="div"
        variant="body1"
        className={`${classes.panelBodyInner} ${classes.center}`}
      >
        <div>
          <WarningRounded />
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

function ToolSelector(props: ToolSelectorProps) {
  const { resource } = props;
  const classes = useStyles({});
  const { formatMessage } = useIntl();
  const tools = resource.read();
  const dispatch = useDispatch();
  const select = (toolChoice: any) => dispatch(selectTool(toolChoice));

  return (
    <List>
      {tools
        .map((tool) => ({
          ...tool,
          Icon: componentIconMap[tool.id] || WarningRounded,
          title: getTranslation(tool.title, translations, formatMessage)
        }))
        .map(({ id, title, Icon }) => (
          <ListItem key={id} button onClick={() => select(id)}>
            <ListItemIcon className={classes.itemIconRoot}>
              <Icon />
            </ListItemIcon>
            <ListItemText primary={title} />
            <ChevronRightIcon />
          </ListItem>
        ))}
    </List>
  );
}

const componentIconMap: { [key in PreviewTool]: OverridableComponent<SvgIconTypeMap> } = {
  "craftercms.ice.contentTypeReceptacles": undefined,
  "craftercms.ice.edit": undefined,
  'craftercms.ice.components': ExtensionRounded,
  'craftercms.ice.assets': ImageRounded,
  'craftercms.ice.audiences': EmojiPeopleRounded,
  'craftercms.ice.simulator': DevicesRounded,
  'craftercms.ice.browseComponents': ExtensionRounded,
  'craftercms.ice.contentTree': AccountTreeRoundedIcon,
  'craftercms.ice.search': SearchRoundedIcon
};

const componentMap: {  [key in PreviewTool]: React.ElementType } = {
  'craftercms.ice.components': ComponentsPanel,
  'craftercms.ice.assets': AssetsPanel,
  'craftercms.ice.audiences': AudiencesPanel,
  'craftercms.ice.simulator': SimulatorPanel,
  'craftercms.ice.edit': EditFormPanel,
  'craftercms.ice.browseComponents': BrowseComponentsPanel,
  'craftercms.ice.contentTypeReceptacles': ReceptaclesPanel,
  'craftercms.ice.contentTree': ContentTree,
  'craftercms.ice.search': SearchPanel
};

export default function ToolsPanel() {
  const classes = useStyles({});
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const site = useActiveSiteId();
  const { guest, tools, selectedTool, showToolsPanel } = usePreviewState();
  const baseUrl = useSelection<string>((state) => state.env.AUTHORING_BASE);

  let Tool = guest?.selected
    ? EditFormPanel
    : Boolean(selectedTool)
      ? componentMap[selectedTool] || UnknownPanel
      : ToolSelector;
  let toolMeta = tools?.find((desc) => desc.id === selectedTool);
  let config = toolMeta?.config;

  const resource = useStateResource(tools, {
    shouldRenew: (source, resource) => resource.complete,
    shouldResolve: (source) => nnou(source),
    shouldReject: () => false,
    errorSelector: null,
    resultSelector: (source) => source
  });

  useEffect(() => {
    // TODO: Move fetch out of component
    !tools && site && dispatch(fetchPreviewToolsConfig(site));
  }, [site, dispatch, tools]);

  return (
    <Drawer
      open={showToolsPanel}
      anchor="left"
      variant="persistent"
      className={classes.drawer}
      classes={{ paper: classes.drawerPaper }}
    >
      {site ? (
        <Suspencified loadingStateProps={{ title: `${formatMessage(translations.loading)}...` }}>
          <Tool id={toolMeta?.id} config={config} resource={resource} />
        </Suspencified>
      ) : (
        <EmptyState
          title={
            <FormattedMessage
              id="previewTools.choseSiteMessage"
              defaultMessage="Please choose site."
            />
          }
          image={`${baseUrl}/static-assets/images/choose_option.svg`}
          classes={{ root: classes.emptyState, image: classes.emptyStateImage }}
        />
      )}
    </Drawer>
  );
}
