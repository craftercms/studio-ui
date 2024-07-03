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

import React, { useEffect, useState } from 'react';
import Login from '../../pages/Login';
import { obtainAuthToken } from '../../services/auth';
import I18nProvider from '../I18nProvider';
import CrafterThemeProvider from '../CrafterThemeProvider';
import { getRequestForgeryToken } from '../../utils/auth';
import Typography from '@mui/material/Typography';

export function AuthBoundary(props) {
  const [loggedIn, setLoggedIn] = useState<boolean>(null);
  useEffect(() => {
    obtainAuthToken()
      .pipe()
      .subscribe({
        next: () => setLoggedIn(true),
        error: () => setLoggedIn(false)
      });
  }, []);
  if (loggedIn === null) {
    return <Typography sx={{ margin: '50px auto', textAlign: 'center' }}>Checking Authentication</Typography>;
  } else if (loggedIn) {
    return props.children;
  } else {
    return (
      <I18nProvider>
        <CrafterThemeProvider>
          <Login passwordRequirementsMinComplexity={4} xsrfToken={getRequestForgeryToken()} xsrfParamName="_csrf" />
        </CrafterThemeProvider>
      </I18nProvider>
    );
  }
}

export default AuthBoundary;
