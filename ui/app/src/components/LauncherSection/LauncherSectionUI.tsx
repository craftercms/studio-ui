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

import Typography from '@material-ui/core/Typography';
import { renderWidgets, WidgetDescriptor } from '../Widget';
import React, { PropsWithChildren, ReactElement } from 'react';
import { usePossibleTranslation } from '../../utils/hooks';
import TranslationOrText from '../../models/TranslationOrText';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { EnhancedUser } from '../../models/User';
import { FormatXMLElementFn, PrimitiveType } from 'intl-messageformat';

export type LauncherSectionUIProps = PropsWithChildren<{
  title: TranslationOrText;
  user?: EnhancedUser;
  site?: string;
  widgets?: WidgetDescriptor[];
  translationValues?: Record<string, PrimitiveType | ReactElement | FormatXMLElementFn>;
}>;

const useStyles = makeStyles((theme) =>
  createStyles({
    title: {
      textTransform: 'uppercase',
      fontWeight: 600,
      margin: '0 0 10px 0',
      '& > .muted': {
        textTransform: 'none',
        marginLeft: '0.315em',
        color: theme.palette.text.secondary
      }
    },
    nav: {
      display: 'flex',
      flexWrap: 'wrap'
    }
  })
);

function LauncherSectionUI(props: LauncherSectionUIProps) {
  const classes = useStyles();
  const title = usePossibleTranslation(props.title, props.translationValues);
  const { children } = props;
  return (
    <>
      {title && (
        <Typography variant="subtitle1" component="h2" className={classes.title}>
          {title}
        </Typography>
      )}
      <nav className={classes.nav}>
        {children ? children : renderWidgets(props.widgets, props.user.rolesBySite[props.site])}
      </nav>
    </>
  );
}

export default LauncherSectionUI;
