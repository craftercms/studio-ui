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

import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core';
import ExtensionRounded from '@material-ui/icons/ExtensionRounded';
import ImageRounded from '@material-ui/icons/ImageOutlined';
import EmojiPeopleRounded from '@material-ui/icons/EmojiPeopleRounded';
import DevicesRounded from '@material-ui/icons/DevicesRounded';
import ChevronRightIcon from '@material-ui/icons/ChevronRightRounded';
import WarningRounded from '@material-ui/icons/WarningRounded';
import SearchRoundedIcon from '@material-ui/icons/SearchRounded';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
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
import InPageInstancesPanel from './Tools/InPageInstancesPanel';
import { selectTool, updateToolsPanelWidth } from '../../state/actions/preview';
import { useDispatch } from 'react-redux';
import {
  useActiveSiteId,
  usePreviewState,
  useSelection,
  useSidebarPanels
} from '../../utils/hooks';
import EmptyState from '../../components/SystemStatus/EmptyState';
import BrowseComponentsPanel from './Tools/BrowseComponentsPanel';
import PageExplorer from './Tools/PageExplorer';
import SearchPanel from './Tools/SearchPanel';
import PreviewTool from '../../models/PreviewTool';
import { SvgIconTypeMap } from '@material-ui/core/SvgIcon/SvgIcon';
import { OverridableComponent } from '@material-ui/core/OverridableComponent';
import SiteExplorer from './Tools/SiteExplorer';
import PageExplorerRounded from '../../components/Icons/PageExplorerRounded';
import SiteExplorerRounded from '../../components/Icons/SiteExplorerRounded';
import ResizeableDrawer from './ResizeableDrawer';
import { ConditionalLoadingState } from '../../components/SystemStatus/LoadingState';
import { ErrorBoundary } from '../../components/SystemStatus/ErrorBoundary';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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
  unknownPanelTitle: {
    id: 'unknownPanel.title',
    defaultMessage: 'Unknown Panel'
  },
  componentsPanelTitle: {
    id: 'componentsPanel.title',
    defaultMessage: 'Components'
  },
  assetsPanelTitle: {
    id: 'assetsPanel.title',
    defaultMessage: 'Assets'
  },
  audiencesPanelTitle: {
    id: 'audiencesPanel.title',
    defaultMessage: 'Audience Targeting'
  },
  simulatorPanelTitle: {
    id: 'simulatorPanelTitle.title',
    defaultMessage: 'Device Simulator'
  },
  browseComponentsPanelTitle: {
    id: 'browseComponentsPanel.title',
    defaultMessage: 'Browse Components'
  },
  pageExplorerPanelTitle: {
    id: 'pageExplorerPanel.title',
    defaultMessage: 'Page Explorer'
  },
  searchPanelTitle: {
    id: 'searchPanel.title',
    defaultMessage: 'Search Everywhere'
  },
  loading: {
    id: 'words.loading',
    defaultMessage: 'Loading'
  },
  siteExplorerPanelTitle: {
    id: 'siteExplorerPanel.title',
    defaultMessage: 'Site Explorer'
  }
});

interface UnknownPanelProps {
  id: string;
}

interface ToolSelectorProps {
  tools: any[];
}

function UnknownPanel(props: UnknownPanelProps) {
  const classes = useStyles({});
  return (
    <ToolPanel title={translations.unknownPanelTitle}>
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
  const { tools } = props;
  const classes = useStyles({});
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const select = (toolChoice: any) => dispatch(selectTool(toolChoice));

  return (
    <List>
      {tools
        .map((tool) => ({
          ...tool,
          Icon: componentIconMap[tool.id] || WarningRounded,
          title: getTranslation(translationIdMap[tool.id], translations, formatMessage)
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
  'craftercms.contentTypeReceptaclesPanel': undefined,
  'craftercms.editPanel': undefined,
  'craftercms.componentsPanel': ExtensionRounded,
  'craftercms.assetsPanel': ImageRounded,
  'craftercms.audiencesPanel': EmojiPeopleRounded,
  'craftercms.simulatorPanel': DevicesRounded,
  'craftercms.browseComponentsPanel': ExtensionRounded,
  'craftercms.inPageInstancesPanel': ExtensionRounded,
  'craftercms.pageExplorerPanel': PageExplorerRounded,
  'craftercms.searchPanel': SearchRoundedIcon,
  'craftercms.siteExplorerPanel': SiteExplorerRounded
};

const componentMap: { [key in PreviewTool]: React.ElementType } = {
  'craftercms.componentsPanel': ComponentsPanel,
  'craftercms.assetsPanel': AssetsPanel,
  'craftercms.audiencesPanel': AudiencesPanel,
  'craftercms.simulatorPanel': SimulatorPanel,
  'craftercms.editPanel': EditFormPanel,
  'craftercms.browseComponentsPanel': BrowseComponentsPanel,
  'craftercms.inPageInstancesPanel': InPageInstancesPanel,
  'craftercms.contentTypeReceptaclesPanel': ReceptaclesPanel,
  'craftercms.pageExplorerPanel': PageExplorer,
  'craftercms.searchPanel': SearchPanel,
  'craftercms.siteExplorerPanel': SiteExplorer
};

const translationIdMap: { [key in PreviewTool]: string } = {
  'craftercms.componentsPanel': 'componentsPanelTitle',
  'craftercms.assetsPanel': 'assetsPanelTitle',
  'craftercms.audiencesPanel': 'audiencesPanelTitle',
  'craftercms.simulatorPanel': 'simulatorPanelTitle',
  'craftercms.editPanel': 'editPanelTitle',
  'craftercms.browseComponentsPanel': 'BrowseComponentsPanelTitle',
  'craftercms.inPageInstancesPanel': 'inPageInstancesPanelTitle',
  'craftercms.contentTypeReceptaclesPanel': 'contentTypeReceptaclesPanelTitle',
  'craftercms.pageExplorerPanel': 'pageExplorerPanelTitle',
  'craftercms.searchPanel': 'searchPanelTitle',
  'craftercms.siteExplorerPanel': 'siteExplorerPanelTitle'
};

export default function ToolsPanel() {
  const classes = useStyles({});
  const dispatch = useDispatch();
  const site = useActiveSiteId();
  const { guest, selectedTool, showToolsPanel } = usePreviewState();
  const toolsPanelWidth = useSelection<number>((state) => state.preview.toolsPanelWidth);
  const baseUrl = useSelection<string>((state) => state.env.authoringBase);
  const tools = useSidebarPanels();

  let Tool = componentMap[selectedTool] || UnknownPanel;
  let toolMeta = tools?.find((desc) => desc.id === selectedTool);

  return (
    <ResizeableDrawer
      open={showToolsPanel}
      width={toolsPanelWidth}
      onWidthChange={(width) => {
        dispatch(
          updateToolsPanelWidth({
            width
          })
        );
      }}
    >
      <ErrorBoundary>
        {site ? (
          guest?.selected ? (
            <EditFormPanel />
          ) : (
            <ConditionalLoadingState isLoading={!Boolean(tools)}>
              {Boolean(selectedTool) ? (
                <Tool id={toolMeta?.id} {...toolMeta?.parameters}/>
              ) : (
                <ToolSelector tools={tools} />
              )}
            </ConditionalLoadingState>
          )
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
      </ErrorBoundary>
    </ResizeableDrawer>
  );
}
