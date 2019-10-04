import { get, post } from "../utils/ajax";
import { Site } from "../models/Site";

export function fetchBlueprints() {
  return get('/studio/api/2/sites/available_blueprints');
}

export function createSite(site: Site) {
  return post('/studio/api/1/services/api/1/site/create.json', site, {
    'Content-Type': 'application/json'
  })
}

export function checkHandleAvailability(name:string) {
  return get(`/studio/api/1/services/api/1/site/exists.json?site=${name}`)
}

