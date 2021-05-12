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

import React from 'react';
import GlobalAppToolbar from '../GlobalAppToolbar';
import { FormattedMessage } from 'react-intl';
import { useEnv, useSelection } from '../../utils/hooks';
import Paper from '@material-ui/core/Paper';
import useStyles from './styles';
import CrafterCMSLogo from '../Icons/CrafterCMSLogo';
import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

export default function AboutCrafterCMSView() {
  const env = useEnv();
  const classes = useStyles();
  const localeBranch = useSelection((state) => state.uiConfig.locale);

  return (
    <Box display="flex" flexDirection="column" height="calc(100vh - 108px)">
      <GlobalAppToolbar title={<FormattedMessage id="global.about" defaultMessage="About" />} />
      <Box display="flex" alignItems="center" justifyContent="center" flexGrow="1">
        <Paper className={classes.paperRoot}>
          <CrafterCMSLogo width={250} className={classes.logo} />
          <div className={classes.row}>
            <Typography variant="subtitle2" className={'aboutLabel'}>
              <FormattedMessage id="about.studioVersionNumber" defaultMessage="Studio Version Number" />:
            </Typography>
            <Typography variant="body2">{`${env.packageVersion}-${env.packageBuild?.substring(0, 6)}`}</Typography>
          </div>
          <div className={classes.row}>
            <Typography variant="subtitle2" className={'aboutLabel'}>
              <FormattedMessage id="about.buildNumber" defaultMessage="Build Number" />:
            </Typography>
            <Typography variant="body2">{env.packageBuild}</Typography>
          </div>
          <div className={classes.row}>
            <Typography variant="subtitle2" className={'aboutLabel'}>
              <FormattedMessage id="about.buildNumber" defaultMessage="Build Date" />:
            </Typography>
            <Typography variant="body2">
              {new Intl.DateTimeFormat(localeBranch.localeCode, localeBranch.dateTimeFormatOptions).format(
                new Date(env.packageBuildDate)
              )}
            </Typography>
          </div>
          <div className={classes.externalLink}>
            <Typography variant="body2">
              <FormattedMessage
                id="aboutView.attribution"
                defaultMessage="Crafter CMS is made possible by these other <a>open source software projects</a>."
                values={{
                  a: (msg) => (
                    <Link
                      href={`https://docs.craftercms.org/en/${env.packageVersion?.substr(
                        0,
                        3
                      )}/acknowledgements/index.html`}
                      target="_blank"
                    >
                      {msg}
                    </Link>
                  )
                }}
              />
            </Typography>
          </div>
        </Paper>
      </Box>
    </Box>
  );
}
