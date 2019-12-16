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
import { Site } from "../models/Site";

export function fetchBlueprints() {
  return get('/studio/api/2/sites/available_blueprints');
}

export function fetchSites() {
  return get('/studio/api/2/users/me/sites');
}

export function createSite(site: Site) {
  return post('/studio/api/1/services/api/1/site/create.json', site, {
    'Content-Type': 'application/json'
  })
}

export function deleteSite(id: string) {
  return post('/studio/api/1/services/api/1/site/delete-site.json', {siteId: id}, {
    'Content-Type': 'application/json'
  })
}

export function checkHandleAvailability(name: string) {
  return get(`/studio/api/1/services/api/1/site/exists.json?site=${name}`)
}

export default {
  fetchBlueprints,
  fetchSites,
  createSite,
  checkHandleAvailability
}
