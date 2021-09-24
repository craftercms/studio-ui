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

import createStyles from '@mui/styles/createStyles';

import makeStyles from '@mui/styles/makeStyles';
import { PropsWithChildren, useEffect } from 'react';
import { createPortal } from 'react-dom';

let portalEl;

function createPortalEl() {
  if (!portalEl) {
    portalEl = document.createElement('div');
    document.body.appendChild(portalEl);
    portalEl.classList.add('THE-CRAFTERCMS-PORTAL');
  }
  return portalEl;
}

export const useStyles = makeStyles((theme) =>
  createStyles({
    wrapper: {
      right: '0',
      bottom: '20px',
      display: 'flex',
      position: 'fixed',
      flexDirection: 'row-reverse',
      width: '100%',
      overflow: 'auto',
      padding: '2px 20px',
      zIndex: theme.zIndex.modal,
      pointerEvents: 'none',
      '& > *': {
        pointerEvents: 'all'
      }
    }
  })
);
export function MinimizedBarPortal(props: PropsWithChildren<{}>) {
  const classes = useStyles();
  const el = createPortalEl();
  useEffect(() => {
    el.setAttribute('class', classes.wrapper);
  }, [el, classes.wrapper]);
  return createPortal(props.children, el);
}

export default MinimizedBarPortal;
