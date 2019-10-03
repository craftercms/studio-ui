import { get } from "../utils/ajax";

export function fetchMarketPlace() {
  return get('/studio/api/2/marketplace/search?type=blueprint&limit=1000');
}

export function fetchBlueprints() {
  return get('/studio/api/2/sites/available_blueprints');
}
