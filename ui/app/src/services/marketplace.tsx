import { get } from "../utils/ajax";

export function fetchBlueprints() {
  return get('/studio/api/2/marketplace/search?type=blueprint&limit=1000');
}
