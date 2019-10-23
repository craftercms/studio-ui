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

import { get, post } from "../utils/ajax";
import { MarketplaceSite } from "../models/Site";

export function fetchBlueprints() {
  return get('/studio/api/2/marketplace/search?type=blueprint&limit=1000');
}

export function createSite(site: MarketplaceSite) {
  return post('/studio/api/2/sites/create_site_from_marketplace', site, {
    'Content-Type': 'application/json'
  })
}

export default {
  fetchBlueprints
}
