/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import React, { useEffect, useState } from 'react';
import { useActiveSiteId, useMount, useSelection } from '../../utils/hooks';
import { fetchActiveEnvironment } from '../../services/environment';
import { fetchConfigurationXML, fetchSiteConfigurationFiles } from '../../services/configuration';
import { SiteConfigurationFile } from '../../models/SiteConfigurationFile';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import useStyles from './styles';
import ListSubheader from '@material-ui/core/ListSubheader';
import { FormattedMessage, useIntl } from 'react-intl';
import Skeleton from '@material-ui/lab/Skeleton';
import EmptyState from '../SystemStatus/EmptyState';
import { translations } from './translations';
import { getTranslation } from '../../utils/i18n';
import { ConditionalLoadingState } from '../SystemStatus/LoadingState';
import AceEditor from '../AceEditor';
import GlobalAppToolbar from '../GlobalAppToolbar';
import ResizeableDrawer from '../../modules/Preview/ResizeableDrawer';
import { IconButton } from '@material-ui/core';
import MenuOpenRoundedIcon from '@material-ui/icons/MenuOpenRounded';
import MenuRoundedIcon from '@material-ui/icons/MenuRounded';
import PrimaryButton from '../PrimaryButton';
import DialogFooter from '../Dialogs/DialogFooter';
import SecondaryButton from '../SecondaryButton';

export default function SiteConfigurationManagement() {
  const site = useActiveSiteId();
  const baseUrl = useSelection<string>((state) => state.env.authoringBase);
  const classes = useStyles();
  const { formatMessage } = useIntl();
  const [environment, setEnvironment] = useState<string>();
  const [files, setFiles] = useState<SiteConfigurationFile[]>();
  const [selectedConfigFile, setSelectedConfigFile] = useState<SiteConfigurationFile>(null);
  const [selectedConfigFileXml, setSelectedConfigFileXml] = useState(null);
  const [loadingXml, setLoadingXml] = useState(false);
  const [width, setWidth] = useState(240);
  const [openDrawer, setOpenDrawer] = useState(true);

  useMount(() => {
    fetchActiveEnvironment().subscribe((env) => {
      setEnvironment(env);
    });
  });

  useEffect(() => {
    if (site && environment) {
      fetchSiteConfigurationFiles(site, environment).subscribe((files) => {
        setFiles(files);
      });
    }
  }, [environment, site]);

  useEffect(() => {
    if (selectedConfigFile && environment) {
      setLoadingXml(true);
      fetchConfigurationXML(site, selectedConfigFile.path, selectedConfigFile.module, environment).subscribe((xml) => {
        setSelectedConfigFileXml(xml);
        setLoadingXml(false);
      });
    }
  }, [selectedConfigFile, environment, site]);

  const onToggleDrawer = () => {
    setOpenDrawer(!openDrawer);
  };

  const onDrawerResize = (width) => {
    if (width > 240) {
      setWidth(width);
    }
  };

  return (
    <Box display="flex" height="100vh">
      <ResizeableDrawer
        open={openDrawer}
        width={width}
        classes={{ drawerPaper: classes.drawerPaper }}
        onWidthChange={onDrawerResize}
      >
        <List
          className={classes.list}
          component="nav"
          dense
          subheader={
            <ListSubheader className={classes.listSubheader} component="div">
              {environment ? (
                <>
                  <FormattedMessage id="siteConfigurationManagement.environment" defaultMessage="Active Environment" />:{' '}
                  {environment}
                </>
              ) : (
                <section className={classes.listSubheaderSkeleton}>
                  <Skeleton height={15} width="80%" />
                </section>
              )}
            </ListSubheader>
          }
        >
          {files
            ? files.map((file, i) => (
                <ListItem
                  onClick={() => setSelectedConfigFile(file)}
                  button
                  key={i}
                  dense
                  divider={i < files.length - 1}
                >
                  <ListItemText
                    classes={{ primary: classes.ellipsis, secondary: classes.ellipsis }}
                    primaryTypographyProps={{ title: getTranslation(file.title, translations, formatMessage) }}
                    secondaryTypographyProps={{ title: getTranslation(file.description, translations, formatMessage) }}
                    primary={getTranslation(file.title, translations, formatMessage)}
                    secondary={getTranslation(file.description, translations, formatMessage)}
                  />
                </ListItem>
              ))
            : Array(15)
                .fill(null)
                .map((x, i) => (
                  <ListItem button key={i} dense divider={i < Array.length - 1}>
                    <ListItemText
                      primary={<Skeleton height={15} width="80%" />}
                      secondary={<Skeleton height={15} width="60%" />}
                      primaryTypographyProps={{
                        className: classes.itemSkeletonText
                      }}
                      secondaryTypographyProps={{
                        className: classes.itemSkeletonText
                      }}
                    />
                  </ListItem>
                ))}
        </List>
      </ResizeableDrawer>
      {selectedConfigFile ? (
        <ConditionalLoadingState isLoading={loadingXml}>
          <Box display="flex" flexGrow={1} flexDirection="column" paddingLeft={openDrawer && `${width}px`}>
            <GlobalAppToolbar
              title={getTranslation(selectedConfigFile.title, translations, formatMessage)}
              leftContent={
                <IconButton onClick={onToggleDrawer} className={classes.toggleDrawerButton}>
                  {openDrawer ? <MenuOpenRoundedIcon /> : <MenuRoundedIcon />}
                </IconButton>
              }
              rightContent={
                <>
                  <SecondaryButton>
                    <FormattedMessage id="siteConfigurationManagement.encryptMarked" defaultMessage="Encrypt Marked" />
                  </SecondaryButton>
                  <PrimaryButton>
                    <FormattedMessage id="siteConfigurationManagement.viewSmaple" defaultMessage="View Sample" />
                  </PrimaryButton>
                </>
              }
            />
            <AceEditor mode="ace/mode/yaml" theme="ace/theme/textmate" autoFocus={true} value={selectedConfigFileXml} />
            <DialogFooter>
              <PrimaryButton>
                <FormattedMessage id="words.save" defaultMessage="Save" />
              </PrimaryButton>
            </DialogFooter>
          </Box>
        </ConditionalLoadingState>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          flexGrow={1}
          justifyContent="center"
          paddingLeft={openDrawer && `${width}px`}
        >
          <EmptyState
            title={
              <FormattedMessage
                id="siteConfigurationManagement.selectConfigFile"
                defaultMessage="Please choose a config file from the left."
              />
            }
            image={`${baseUrl}/static-assets/images/choose_option.svg`}
          />
        </Box>
      )}
    </Box>
  );
}
