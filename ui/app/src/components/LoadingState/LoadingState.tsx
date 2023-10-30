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

import React, { ElementType, PropsWithChildren, ReactNode } from 'react';
import { makeStyles } from 'tss-react/mui';
import Typography from '@mui/material/Typography';
import Gears from '../Gears/Gears';
import { CSSObject as CSSProperties } from 'tss-react';

type LoadingStateClassKey = 'root' | 'title' | 'subtitle' | 'graphic' | 'graphicRoot';

type LoadingStateStyles = Partial<Record<LoadingStateClassKey, CSSProperties>>;

const useStyles = makeStyles<LoadingStateStyles, LoadingStateClassKey>()(
  (theme, { root, graphicRoot, title, subtitle, graphic } = {} as LoadingStateStyles) => ({
    root: {
      display: 'flex',
      textAlign: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      margin: `${theme.spacing(2)} auto`,
      minHeight: '100%',
      ...root
    },
    graphicRoot: {
      display: 'flex',
      justifyContent: 'center',
      ...graphicRoot
    },
    title: {
      marginTop: '40px',
      marginBottom: '15px',
      ...title
    },
    subtitle: {
      marginBottom: '10px',
      ...subtitle
    },
    graphic: {
      width: 120,
      ...graphic
    }
  })
);

export interface LoadingStateProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  graphic?: ElementType;
  graphicProps?: any;
  classes?: Partial<Record<LoadingStateClassKey, string>>;
  styles?: LoadingStateStyles;
}

export type ConditionalLoadingStateProps = LoadingStateProps & PropsWithChildren<{ isLoading: boolean }>;

export function LoadingState(props: LoadingStateProps) {
  const { classes, cx } = useStyles(props.styles);
  const { graphic: Graphic = Gears, classes: propClasses } = props;
  return (
    <div className={cx(classes.root, propClasses?.root)}>
      {props.title && (
        <Typography variant="h6" component="h3" className={cx(classes.title, propClasses?.title)}>
          {props.title}
        </Typography>
      )}
      {props.subtitle && (
        <Typography variant="subtitle1" component="p" className={cx(classes.subtitle, propClasses?.subtitle)}>
          {props.subtitle}
        </Typography>
      )}
      <div className={cx(classes.graphicRoot, propClasses?.graphicRoot)}>
        <Graphic className={cx(classes.graphic, propClasses?.graphic)} {...props.graphicProps} />
      </div>
    </div>
  );
}

export function ConditionalLoadingState(props: ConditionalLoadingStateProps) {
  const { children, isLoading, ...loadingStateProps } = props;
  return isLoading ? <LoadingState {...loadingStateProps} /> : <>{children}</>;
}

export default LoadingState;
