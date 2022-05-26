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

import { makeStyles } from 'tss-react/mui';
import React from 'react';
import { CSSObject } from 'tss-react';
import Typography from '@mui/material/Typography';
import LauncherOpenerButton from '../LauncherOpenerButton';
import LogoAndMenuBundleButton from '../LogoAndMenuBundleButton';
import { defineMessages, useIntl } from 'react-intl';
import ViewToolbar, { ViewToolbarClassKey } from '../ViewToolbar/ViewToolbar';
import { useGlobalAppState } from '../GlobalApp';

export type GlobalAppToolbarClassKey =
  | ViewToolbarClassKey
  | 'headings'
  | 'subtitle'
  | 'leftContent'
  | 'rightContent'
  | 'ellipsis';

export type GlobalAppToolbarStyles = Partial<Record<GlobalAppToolbarClassKey, CSSObject>>;

export interface GlobalAppToolbarProps {
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

const useStyles = makeStyles<GlobalAppToolbarStyles, GlobalAppToolbarClassKey>()(
  (theme, { headings, subtitle, leftContent, rightContent } = {} as GlobalAppToolbarStyles) => ({
    appBar: {},
    toolbar: {},
    headings: {
      marginLeft: '10px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start!important',
      overflow: 'hidden',
      ...headings
    },
    subtitle: {
      ...subtitle
    },
    leftContent: {
      marginLeft: '25px',
      display: 'flex',
      alignItems: 'center',
      whiteSpace: 'nowrap',
      ...leftContent
    },
    rightContent: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
      whiteSpace: 'nowrap',
      ...rightContent
    },
    ellipsis: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  })
);

export const GlobalAppToolbar = React.memo<GlobalAppToolbarProps>(function (props) {
  const {
    title,
    subtitle,
    leftContent,
    rightContent,
    showHamburgerMenuButton = true,
    showAppsButton = true,
    startContent,
    styles
  } = props;
  const { classes, cx } = useStyles(styles);
  const { formatMessage } = useIntl();
  const [{ openSidebar }, setState] = useGlobalAppState();

  return (
    <ViewToolbar elevation={props.elevation} styles={styles} classes={props.classes}>
      {showHamburgerMenuButton && Boolean(setState) && (
        <LogoAndMenuBundleButton
          showCrafterIcon={showAppsButton}
          aria-label={formatMessage(translations.toggleSidebar)}
          onClick={() => setState({ openSidebar: !openSidebar })}
        />
      )}
      {startContent}
      {Boolean(title || subtitle) && (
        <section className={cx(classes.headings, props.classes?.headings)}>
          {title && (
            <Typography variant="h5" component="h1" className={classes.ellipsis}>
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography
              variant="body2"
              component="h2"
              color="textSecondary"
              className={cx(classes.ellipsis, classes.subtitle, props.classes?.subtitle)}
            >
              {subtitle}
            </Typography>
          )}
        </section>
      )}
      <section className={cx(classes.leftContent, props.classes?.leftContent)}>{leftContent}</section>
      <section className={cx(classes.rightContent, props.classes?.rightContent)}>{rightContent}</section>
      {showAppsButton && <LauncherOpenerButton />}
    </ViewToolbar>
  );
});

export default GlobalAppToolbar;
