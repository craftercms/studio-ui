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

import React, { ElementType } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import Gears from './Gears';
import clsx from 'clsx';

const useStyles = makeStyles(() => ({
  loadingView: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  gearContainer: {
    display: 'flex',
    justifyContent: 'center'
  },
  title: {
    marginTop: '40px',
    marginBottom: '15px'
  },
  paragraph: {
    marginBottom: '10px'
  }
}));

interface LoadingStateProps {
  title: string;
  subtitle?: string;
  Graphic?: ElementType<any>;
  graphicProps?: any;
  classes?: {
    root?: string;
    title?: string;
    subtitle?: string;
    graphic?: string;
    graphicRoot?: string;
  }
}

export default function LoadingState(props: LoadingStateProps) {
  const classes = useStyles({});
  const { Graphic } = props;
  const propClasses = Object.assign({
    root: '',
    title: '',
    subtitle: '',
    graphic: '',
    graphicRoot: ''
  }, props.classes || {});

  return (
    <div className={clsx(classes.loadingView, { [propClasses.root]: !!propClasses.root })}>
      {
        props.title &&
        <Typography
          variant="h5" component="h1"
          className={clsx(classes.title, { [propClasses.title]: !!propClasses.title })}>
        {props.title}
      </Typography>
      }
      {
        props.subtitle &&
        <Typography
          variant="subtitle1"
          component="p"
          className={clsx(classes.paragraph, { [propClasses.subtitle]: !!propClasses.subtitle })}
        >
          {props.subtitle}
        </Typography>
      }
      <div className={clsx(classes.gearContainer, { [propClasses.graphicRoot]: !!propClasses.graphicRoot })}>
        <Graphic className={propClasses.graphic} {...props.graphicProps}/>
      </div>
    </div>
  );

}

LoadingState.defaultProps = {
  Graphic: Gears,
  graphicProps: { width: '250px' }
};
