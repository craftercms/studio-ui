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

import React, { lazy, Suspense } from 'react';
import CrafterCMSNextBridge from './CrafterCMSNextBridge';
import crafterIconUrl from '../assets/crafter-icon.svg';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import palette from '../styles/palette';
import AuthBoundary from './AuthBoundary';

const DevServerRoot = process.env.REACT_APP_COMPONENT ? lazy(() => import(process.env.REACT_APP_COMPONENT)) : Intro;

export default function App() {
  return Boolean(process.env.REACT_APP_OMIT_BRIDGE) ? (
    <Suspense fallback="">
      <DevServerRoot />
    </Suspense>
  ) : (
    <AuthBoundary>
      <CrafterCMSNextBridge>
        <DevServerRoot />
      </CrafterCMSNextBridge>
    </AuthBoundary>
  );
}

const useStyles = makeStyles((theme) =>
  createStyles({
    '@global': {
      'body, html, #root': {
        display: 'flex',
        height: '100%',
        textAlign: 'center',
        placeContent: 'center',
        fontFamily: 'sans-serif'
      },
      em: {
        border: `1px solid ${palette.gray.light4}`,
        backgroundColor: palette.gray.light1,
        padding: '0 5px',
        borderRadius: 4,
        display: 'inline-block'
      }
    },
    container: {
      display: 'flex',
      textAlign: 'center',
      flexDirection: 'column',
      placeContent: 'center',
      alignItems: 'center',
      maxWidth: 500,
      margin: 'auto'
    },
    logo: {
      width: 100
    },
    code: {
      border: `1px solid ${palette.gray.light4}`,
      backgroundColor: palette.gray.light1,
      padding: theme.spacing(1),
      borderRadius: 4,
      textAlign: 'left'
    },
    hint: {}
  })
);

function Intro() {
  const classes = useStyles({});
  return (
    <section className={classes.container}>
      <img className={classes.logo} src={crafterIconUrl} alt="" />
      <h1>Crafter CMS Codebase Next</h1>
      <p className={classes.hint}>
        Create a <em>.env.local</em> file and add the content below. Point the <em>REACT_APP_COMPONENT</em> variable to
        the component you'd like to see in your local dev server.
      </p>
      <code className={classes.code}>
        INLINE_RUNTIME_CHUNK=false
        <br />
        PUBLIC_URL=/studio/static-assets/next/
        <br />
        BROWSER=chrome
        <br />
        REACT_APP_COMPONENT=../pages/Preview
        <br />
      </code>
    </section>
  );
}
