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

import useStyles from './styles';
import ResizeableDrawer from '../ResizeableDrawer/ResizeableDrawer';
import React, { useState } from 'react';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { FormattedMessage, useIntl } from 'react-intl';
import SystemIcon, { SystemIconDescriptor } from '../SystemIcon';
import EmptyState from '../EmptyState/EmptyState';
import CrafterCMSLogo from '../../icons/CrafterCMSLogo';
import { getPossibleTranslation } from '../../utils/i18n';
import Widget from '../Widget';
import { WidgetDescriptor } from '../../models';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import SiteSwitcherSelect from '../SiteSwitcherSelect';
import Tooltip from '@mui/material/Tooltip';
import Paper from '@mui/material/Paper';
import TranslationOrText from '../../models/TranslationOrText';
import Suspencified from '../Suspencified/Suspencified';
import LauncherOpenerButton from '../LauncherOpenerButton';
import { onSubmittingAndOrPendingChangeProps } from '../../hooks/useEnhancedDialogState';
import useSelection from '../../hooks/useSelection';
import useSiteUIConfig from '../../hooks/useSiteUIConfig';
import { ConfirmDialog } from '../ConfirmDialog';
import { unblockSiteConfigNavigation } from '../../state/actions/configuration';
import { useDispatch } from 'react-redux';

export interface Tool {
  title: TranslationOrText;
  icon: SystemIconDescriptor;
  url: string;
  widget: WidgetDescriptor;
}

export interface SiteToolsProps {
  site: string;
  activeToolId: string;
  footerHtml?: string;
  openSidebar: boolean;
  sidebarWidth: number;
  tools: Tool[];
  sidebarBelowToolbar?: boolean;
  hideSidebarLogo?: boolean;
  hideSidebarSiteSwitcher?: boolean;
  showAppsButton?: boolean;
  classes?: Partial<Record<'root', string>>;
  // Whether the component is mounted on a dialog or it's the main app on a page (i.e. `/studio/site-tools`)
  mountMode?: 'dialog' | 'page';
  onBackClick?(): void;
  onWidthChange(width: number): void;
  onNavItemClick(url: string): void;
  onSubmittingAndOrPendingChange?(value: onSubmittingAndOrPendingChangeProps): void;
  onMinimize?: () => void;
}

export function SiteTools(props: SiteToolsProps) {
  const {
    site,
    activeToolId,
    hideSidebarSiteSwitcher = false,
    hideSidebarLogo = false,
    sidebarBelowToolbar = false,
    mountMode = 'dialog',
    footerHtml,
    onBackClick,
    openSidebar,
    sidebarWidth,
    onWidthChange,
    tools,
    onNavItemClick,
    showAppsButton,
    onSubmittingAndOrPendingChange,
    onMinimize
  } = props;
  const { classes, cx: clsx } = useStyles();
  const { formatMessage } = useIntl();
  const baseUrl = useSelection<string>((state) => state.env.authoringBase);
  const tool = tools?.find((tool) => tool.url === activeToolId)?.widget;
  const { blockSiteConfigNavigation } = useSiteUIConfig();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [nextRoute, setNextRoute] = useState('');
  const dispatch = useDispatch();
  const onItemClick = (url: string) => {
    if (blockSiteConfigNavigation) {
      setNextRoute(url);
      setShowConfirmDialog(true);
    } else {
      onNavItemClick(url);
    }
  };

  const onConfirmOk = () => {
    setShowConfirmDialog(false);
    dispatch(unblockSiteConfigNavigation());
    onNavItemClick(nextRoute);
  };

  return (
    <Paper className={clsx(classes.root, props.classes?.root)} elevation={0}>
      <ResizeableDrawer
        classes={{ drawerPaper: classes.drawerPaper, drawerBody: classes.drawerBody }}
        open={openSidebar}
        width={sidebarWidth}
        belowToolbar={sidebarBelowToolbar}
        onWidthChange={onWidthChange}
      >
        <section>
          <Box display="flex" justifyContent="space-between" marginBottom="10px">
            {onBackClick && (
              <Tooltip title={<FormattedMessage id="words.preview" defaultMessage="Preview" />}>
                <IconButton onClick={onBackClick} size="large">
                  <KeyboardArrowLeftRoundedIcon />
                </IconButton>
              </Tooltip>
            )}
            {!hideSidebarSiteSwitcher && <SiteSwitcherSelect site={site} fullWidth />}
          </Box>
          <MenuList disablePadding className={classes.nav}>
            {tools ? (
              tools.map((tool) => (
                <MenuItem
                  onClick={() => onItemClick(tool.url)}
                  key={tool.url}
                  selected={`/${tool.url}` === activeToolId}
                >
                  <SystemIcon
                    className={classes.icon}
                    icon={tool.icon}
                    svgIconProps={{ fontSize: 'small', color: 'action' }}
                  />
                  <Typography>{getPossibleTranslation(tool.title, formatMessage)}</Typography>
                </MenuItem>
              ))
            ) : (
              <EmptyState
                title={
                  <FormattedMessage
                    id="siteTools.toolListingNotConfigured"
                    defaultMessage="The project tools list has not been set"
                  />
                }
                subtitle={
                  <FormattedMessage
                    id="siteTools.toolListingNotConfiguredSubtitle"
                    defaultMessage="Please set the craftercms.siteTools reference on the ui.xml"
                  />
                }
              />
            )}
          </MenuList>
        </section>
        <footer className={classes.footer}>
          {!hideSidebarLogo && <CrafterCMSLogo width={100} className={classes.logo} />}
          {footerHtml && (
            <Typography
              component="p"
              variant="caption"
              className={classes.footerDescription}
              dangerouslySetInnerHTML={{ __html: footerHtml }}
            />
          )}
        </footer>
      </ResizeableDrawer>
      <Box className={classes.wrapper} height="100%" width="100%" paddingLeft={openSidebar ? `${sidebarWidth}px` : 0}>
        {activeToolId ? (
          tool ? (
            <Suspencified>
              <Widget
                {...tool}
                overrideProps={{
                  embedded: false,
                  mountMode,
                  showAppsButton,
                  onSubmittingAndOrPendingChange,
                  onMinimize
                }}
              />
            </Suspencified>
          ) : (
            <Box display="flex" flexDirection="column" height="100%">
              <section className={classes.launcher}>
                <LauncherOpenerButton />
              </section>
              <EmptyState
                styles={{ root: { height: '100%', margin: 0 } }}
                title="404"
                subtitle={<FormattedMessage id="siteTools.toolNotFound" defaultMessage="Tool not found" />}
              />
            </Box>
          )
        ) : (
          <EmptyState
            styles={{ root: { height: '100%', margin: 0 } }}
            title={<FormattedMessage id="siteTools.selectTool" defaultMessage="Please choose a tool from the left." />}
            image={`${baseUrl}/static-assets/images/choose_option.svg`}
          />
        )}
      </Box>
      <ConfirmDialog
        open={showConfirmDialog}
        title={
          <FormattedMessage id="siteConfigurationManagement.unsavedChangesTitle" defaultMessage="Unsaved changes" />
        }
        body={
          <FormattedMessage
            id="siteConfigurationManagement.unsavedChangesSubtitle"
            defaultMessage="You have unsaved changes, do you want to leave?"
          />
        }
        onOk={onConfirmOk}
        onCancel={() => setShowConfirmDialog(false)}
      />
    </Paper>
  );
}

export default SiteTools;
