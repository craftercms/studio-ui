/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';
import CreateSiteDialog from './CreateSiteDialog';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import { IntlProvider } from "react-intl";
import { theme } from '../styles/theme';
import '../styles/aux.scss';
//import PublishingQueue from "./PublishingQueue";

function App() {
  return (
    <IntlProvider locale="en">
      <ThemeProvider theme={theme}>
        {/*<PublishingQueue siteId={'editorial'}/>*/}
        <CreateSiteDialog/>
      </ThemeProvider>
    </IntlProvider>
  );
}

export default App;
