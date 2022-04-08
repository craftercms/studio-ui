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

import Typography from '@mui/material/Typography';
import { renderWidgets, WidgetDescriptor } from '../Widget';
import React, { PropsWithChildren, ReactElement } from 'react';
import TranslationOrText from '../../models/TranslationOrText';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { EnhancedUser } from '../../models/User';
import { FormatXMLElementFn, PrimitiveType } from 'intl-messageformat';
import { CSSProperties } from '@mui/styles';
import clsx from 'clsx';
import { usePossibleTranslation } from '../../hooks/usePossibleTranslation';

export type LauncherSectionUIClassKey = 'title' | 'nav';

export type LauncherSectionUIStyles = Partial<Record<LauncherSectionUIClassKey, CSSProperties>>;

export type LauncherSectionUIProps = PropsWithChildren<{
  title: TranslationOrText;
  user?: EnhancedUser;
  site?: string;
  widgets?: WidgetDescriptor[];
  translationValues?: Record<string, PrimitiveType | ReactElement | FormatXMLElementFn>;
  styles?: LauncherSectionUIStyles;
  classes?: Partial<Record<LauncherSectionUIClassKey, string>>;
}>;

const useStyles = makeStyles((theme) =>
  createStyles<LauncherSectionUIClassKey, LauncherSectionUIStyles>({
    title: (styles) => ({
      textTransform: 'uppercase',
      fontWeight: 600,
      margin: '0 0 10px 0',
      '& > .muted': {
        textTransform: 'none',
        marginLeft: '0.315em',
        color: theme.palette.text.secondary
      },
      ...styles.title
    }),
    nav: (styles) => ({
      display: 'flex',
      flexWrap: 'wrap',
      ...styles.nav
    })
  })
);

export function LauncherSectionUI(props: LauncherSectionUIProps) {
  const classes = useStyles(props.styles);
  const title = usePossibleTranslation(props.title, props.translationValues);
  const { children } = props;
  return (
    <>
      {title && (
        <Typography variant="subtitle1" component="h2" className={clsx(classes.title, props.classes?.title)}>
          {title}
        </Typography>
      )}
      <nav className={clsx(classes.nav, props.classes?.nav)}>
        {children ? children : renderWidgets(props.widgets, { userRoles: props.user.rolesBySite[props.site] })}
      </nav>
    </>
  );
}

export default LauncherSectionUI;
