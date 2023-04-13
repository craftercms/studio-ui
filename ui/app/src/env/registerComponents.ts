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

import { components, icons } from './studioUI';
import registerRoundedIcons from './registerRoundedIcons';
import registerOutlinedIcons from './registerOutlinedIcons';
import { components as registry } from '../utils/constants';

// To prevent running registration more than once.
let registered = false;

export const registerComponents = () => {
  if (registered) {
    return false;
  }
  registerRoundedIcons();
  registerOutlinedIcons();
  Object.entries(components).forEach(([name, component]) => {
    if (name === 'LegacySiteDashboard') {
      registry.set('craftercms.components.Dashboard', component);
    }
    registry.set(`craftercms.components.${name}`, component);
  });
  Object.entries(icons).forEach(([name, component]) => {
    registry.set(`craftercms.icons.${name}`, component);
  });
  return true;
};
