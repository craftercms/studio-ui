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

type GlobalAppToolbarClassKey = 'appBar' | 'toolbar' | 'title' | 'leftContent' | 'rightContent';

type GlobalAppToolbarStyles = Partial<Record<GlobalAppToolbarClassKey, CSSProperties>>;

interface GlobalAppToolbarProps {
  elevation?: number;
  title: React.ReactNode;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  styles?: GlobalAppToolbarStyles;
  classes?: Partial<Record<GlobalAppToolbarClassKey, string>>;
}

const translations = defineMessages({
  openConfigPanel: {
    id: 'openConfigPanel.label',
    defaultMessage: 'Open config panel'
  }
});

const useStyles = makeStyles((theme) =>
  createStyles<GlobalAppToolbarClassKey, GlobalAppToolbarStyles>({
    appBar: (styles) => ({
      borderBottom: `1px solid ${theme.palette.divider}`,
      ...styles.appBar
    }),
    toolbar: (styles) => ({
      paddingLeft: 0,
      paddingRight: 0,
      alignItems: 'center',
      '& > section': {
        display: 'flex',
        alignItems: 'center'
      },
      ...styles.toolbar
    }),
    title: (styles) => ({
      marginLeft: '10px',
      ...styles.title
    }),
    leftContent: (styles) => ({
      marginLeft: '25px',
      ...styles.leftContent
    }),
    rightContent: (styles) => ({
      marginLeft: 'auto',
      ...styles.rightContent
    })
  })
);

export const GlobalAppToolbar = React.memo<GlobalAppToolbarProps>(function(props) {
  const classes = useStyles(props.styles);
  const { title, leftContent, rightContent, elevation = 0 } = props;
  const { formatMessage } = useIntl();
  return (
    <AppBar
      color="inherit"
      position="relative"
      elevation={elevation}
      className={clsx(classes.appBar, props.classes?.appBar)}
    >
      <Toolbar className={clsx(classes.toolbar, props.classes?.toolbar)}>
        <LogoAndMenuBundleButton
          aria-label={formatMessage(translations.openConfigPanel)}
          onClick={() => {
            if (window.location.hash.includes('/globalMenu/')) {
              window.location.hash = window.location.hash.replace('/globalMenu', '');
            } else {
              window.location.hash = window.location.hash.replace('#/', '#/globalMenu/');
            }
          }}
        />
        <section className={clsx(classes.title, props.classes?.title)}>
          <Typography variant="h5" component="h1">
            {title}
          </Typography>
        </section>
        <section className={clsx(classes.leftContent, props.classes?.leftContent)}>{leftContent}</section>
        <section className={clsx(classes.rightContent, props.classes?.rightContent)}>{rightContent}</section>
        <LauncherOpenerButton sitesRailPosition="left" icon="apps" />
      </Toolbar>
    </AppBar>
  );
});

export default GlobalAppToolbar;
