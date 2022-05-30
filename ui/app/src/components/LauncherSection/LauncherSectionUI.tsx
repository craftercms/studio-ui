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
import { renderWidgets } from '../Widget';
import { WidgetDescriptor } from '../../models';
import React, { PropsWithChildren, ReactElement } from 'react';
import TranslationOrText from '../../models/TranslationOrText';
import { makeStyles } from 'tss-react/mui';
import { EnhancedUser } from '../../models/User';
import { FormatXMLElementFn, PrimitiveType } from 'intl-messageformat';
import { CSSObject as CSSProperties } from 'tss-react';
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

const useStyles = makeStyles<LauncherSectionUIStyles, LauncherSectionUIClassKey>()(
  (theme, { title, nav } = {} as LauncherSectionUIStyles) => ({
    title: {
      textTransform: 'uppercase',
      fontWeight: 600,
      margin: '0 0 10px 0',
      '& > .muted': {
        textTransform: 'none',
        marginLeft: '0.315em',
        color: theme.palette.text.secondary
      },
      ...title
    },
    nav: {
      display: 'flex',
      flexWrap: 'wrap',
      ...nav
    }
  })
);

export function LauncherSectionUI(props: LauncherSectionUIProps) {
  const { classes, cx } = useStyles(props.styles);
  const title = usePossibleTranslation(props.title, props.translationValues);
  const { children } = props;
  return (
    <>
      {title && (
        <Typography variant="subtitle1" component="h2" className={cx(classes.title, props.classes?.title)}>
          {title}
        </Typography>
      )}
      <nav className={cx(classes.nav, props.classes?.nav)}>
        {children ? children : renderWidgets(props.widgets, { userRoles: props.user.rolesBySite[props.site] })}
      </nav>
    </>
  );
}

export default LauncherSectionUI;
