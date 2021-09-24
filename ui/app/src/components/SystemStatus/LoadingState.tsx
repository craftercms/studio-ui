/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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

import React, { ElementType, PropsWithChildren } from 'react';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import Typography from '@mui/material/Typography';
import Gears from './Gears';
import clsx from 'clsx';
import { CSSProperties } from '@mui/styles';

type LoadingStateClassKey = 'root' | 'title' | 'subtitle' | 'graphic' | 'graphicRoot';

type LoadingStateStyles = Partial<Record<LoadingStateClassKey, CSSProperties>>;

const useStyles = makeStyles((theme) =>
  createStyles<LoadingStateClassKey, LoadingStateStyles>({
    root: (styles) => ({
      display: 'flex',
      textAlign: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      margin: `${theme.spacing(2)} auto`,
      ...styles.root
    }),
    graphicRoot: (styles) => ({
      display: 'flex',
      justifyContent: 'center',
      ...styles.graphicRoot
    }),
    title: (styles) => ({
      marginTop: '40px',
      marginBottom: '15px',
      ...styles.title
    }),
    subtitle: (styles) => ({
      marginBottom: '10px',
      ...styles.subtitle
    }),
    graphic: (styles) => ({
      width: 120,
      ...styles.graphic
    })
  })
);

export interface LoadingStateProps {
  title?: string | JSX.Element;
  subtitle?: string;
  graphic?: ElementType;
  graphicProps?: any;
  classes?: Partial<Record<LoadingStateClassKey, string>>;
  styles?: LoadingStateStyles;
}

export type ConditionalLoadingStateProps = LoadingStateProps & PropsWithChildren<{ isLoading: boolean }>;

export default function LoadingState(props: LoadingStateProps) {
  const classes = useStyles(props.styles);
  const { graphic: Graphic = Gears, classes: propClasses } = props;
  return (
    <div className={clsx(classes.root, propClasses?.root)}>
      {props.title && (
        <Typography variant="h6" component="h3" className={clsx(classes.title, propClasses?.title)}>
          {props.title}
        </Typography>
      )}
      {props.subtitle && (
        <Typography variant="subtitle1" component="p" className={clsx(classes.subtitle, propClasses?.subtitle)}>
          {props.subtitle}
        </Typography>
      )}
      <div className={clsx(classes.graphicRoot, propClasses?.graphicRoot)}>
        <Graphic className={clsx(classes.graphic, propClasses?.graphic)} {...props.graphicProps} />
      </div>
    </div>
  );
}

export function ConditionalLoadingState(props: ConditionalLoadingStateProps) {
  const { children, isLoading, ...loadingStateProps } = props;
  return isLoading ? <LoadingState {...loadingStateProps} /> : <>{children}</>;
}
