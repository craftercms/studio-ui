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

import React, { useEffect, useState } from 'react';
import Login from '../../pages/Login';
import { refreshSession } from '../../services/auth';
import I18nProvider from '../I18nProvider';
import CrafterThemeProvider from '../CrafterThemeProvider';

export function AuthBoundary(props) {
  const [loggedIn, setLoggedIn] = useState<boolean>(true);
  useEffect(() => {
    refreshSession()
      .pipe()
      .subscribe(
        () => setLoggedIn(true),
        () => setLoggedIn(false)
      );
  }, []);
  if (loggedIn === null) {
    return null;
  } else if (loggedIn) {
    return props.children;
  } else {
    return (
      <I18nProvider>
        <CrafterThemeProvider>
          <Login passwordRequirementsRegex="'^(?=(?<hasNumbers>.*[0-9]))(?=(?<hasLowercase>.*[a-z]))(?=(?<hasUppercase>.*[A-Z]))(?=(?<hasSpecialChars>.*[~|!`,;\/@#$%^&+=]))(?<minLength>.{8,})$'" />
        </CrafterThemeProvider>
      </I18nProvider>
    );
  }
}

export default AuthBoundary;
