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

import { createStyles, makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import React from 'react';
import { CSSProperties } from '@material-ui/styles';
import clsx from 'clsx';
import Typography from '@material-ui/core/Typography';
import LauncherOpenerButton from '../LauncherOpenerButton';
import LogoAndMenuBundleButton from '../LogoAndMenuBundleButton';
import { defineMessages, useIntl } from 'react-intl';

type GlobalAppToolbarClassKey = 'appBar' | 'toolbar' | 'title' | 'leftContent' | 'rightContent' | 'ellipsis';

type GlobalAppToolbarStyles = Partial<Record<GlobalAppToolbarClassKey, CSSProperties>>;

interface GlobalAppToolbarProps {
  elevation?: number;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  styles?: GlobalAppToolbarStyles;
  classes?: Partial<Record<GlobalAppToolbarClassKey, string>>;
  startContent?: React.ReactNode;
  showHamburgerMenuButton?: boolean;
  showAppsButton?: boolean;
}

const translations = defineMessages({
  toggleSidebar: {
    id: 'globalAppToolbar.toggleSidebar',
    defaultMessage: 'Toggle Sidebar'
  }
});

const useStyles = makeStyles((theme) =>
  createStyles<GlobalAppToolbarClassKey, GlobalAppToolbarStyles>({
    appBar: (styles) => ({
      borderBottom: `1px solid ${theme.palette.divider}`,
      ...styles.appBar
    }),
    toolbar: (styles) => ({
      paddingLeft: theme.spacing(1.5),
      paddingRight: theme.spacing(1.5),
      alignItems: 'center',
      ...styles.toolbar
    }),
    title: (styles) => ({
      marginLeft: '10px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      overflow: 'hidden',
      ...styles.title
    }),
    leftContent: (styles) => ({
      marginLeft: '25px',
      display: 'flex',
      alignItems: 'center',
      whiteSpace: 'nowrap',
      ...styles.leftContent
    }),
    rightContent: (styles) => ({
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
      whiteSpace: 'nowrap',
      ...styles.rightContent
    }),
    ellipsis: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  })
);

export const GlobalAppToolbar = React.memo<GlobalAppToolbarProps>(function(props) {
  const classes = useStyles(props.styles);
  const {
    title,
    subtitle,
    leftContent,
    rightContent,
    elevation = 0,
    showHamburgerMenuButton = true,
    showAppsButton = true,
    startContent
  } = props;
  const { formatMessage } = useIntl();
  return (
    <AppBar
      color="inherit"
      position="relative"
      elevation={elevation}
      className={clsx(classes.appBar, props.classes?.appBar)}
    >
      <Toolbar className={clsx(classes.toolbar, props.classes?.toolbar)}>
        {showHamburgerMenuButton && (
          <LogoAndMenuBundleButton
            aria-label={formatMessage(translations.toggleSidebar)}
            onClick={() => {
              if (window.location.hash.includes('/globalMenu/')) {
                window.location.hash = window.location.hash.replace('/globalMenu', '');
              } else {
                window.location.hash = window.location.hash.replace('#/', '#/globalMenu/');
              }
            }}
          />
        )}
        {startContent}
        {(title || subtitle) && (
          <section className={clsx(classes.title, props.classes?.title)}>
            {title && (
              <Typography variant="h5" component="h1" className={classes.ellipsis}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" component="h2" color="textSecondary" className={classes.ellipsis}>
                {subtitle}
              </Typography>
            )}
          </section>
        )}
        <section className={clsx(classes.leftContent, props.classes?.leftContent)}>{leftContent}</section>
        <section className={clsx(classes.rightContent, props.classes?.rightContent)}>{rightContent}</section>
        {showAppsButton && <LauncherOpenerButton sitesRailPosition="left" icon="apps" />}
      </Toolbar>
    </AppBar>
  );
});

export default GlobalAppToolbar;
