/*
 * Copyright (C) 2007-2024 Crafter Software Corporation. All Rights Reserved.
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

import { registerComponents } from './env/registerComponents';
import { createCodebaseBridge } from './env/codebase-bridge';
import { publishCrafterGlobal } from './env/craftercms';
import { setRequestForgeryToken } from './utils/auth';
import { unescapeHTML } from './utils/string';
import { createRoot } from 'react-dom/client';
import React, { StrictMode } from 'react';
import CrafterCMSNextBridge from './components/CrafterCMSNextBridge';
import SiteTools from './pages/SiteTools';

registerComponents();
publishCrafterGlobal();
setRequestForgeryToken();
createCodebaseBridge();

const footerData = JSON.parse(document.getElementById('siteToolsFooterData').textContent);
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CrafterCMSNextBridge>
      <SiteTools footerHtml={unescapeHTML(footerData.description)} />
    </CrafterCMSNextBridge>
  </StrictMode>
);
