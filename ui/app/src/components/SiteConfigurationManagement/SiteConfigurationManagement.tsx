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
import { fetchSiteConfigurationFiles } from '../../services/configuration';
import { SiteConfigurationFile } from '../../models/SiteConfigurationFile';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import useStyles from './styles';
import ListSubheader from '@material-ui/core/ListSubheader';
import { defineMessages, FormattedMessage } from 'react-intl';
import Skeleton from '@material-ui/lab/Skeleton';
import EmptyState from '../SystemStatus/EmptyState';

const translations = defineMessages({});

export default function SiteConfigurationManagement() {
  const site = useActiveSiteId();
  const [environment, setEnvironment] = useState<string>();
  const [files, setFiles] = useState<SiteConfigurationFile[]>();
  const baseUrl = useSelection<string>((state) => state.env.authoringBase);
  const classes = useStyles();

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

  console.log(files);

  return (
    <Box display="flex">
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
              <ListItem button key={i} dense divider={i < files.length - 1}>
                <ListItemText
                  classes={{ primary: classes.ellipsis, secondary: classes.ellipsis }}
                  primaryTypographyProps={{ title: file.title }}
                  secondaryTypographyProps={{ title: file.path }}
                  primary={file.title}
                  secondary={file.path}
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
      <Box>
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
    </Box>
  );
}
