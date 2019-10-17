import { get, post } from "../utils/ajax";
import { map } from 'rxjs/operators';

export function fetchFileContent(site: string, configPath: string, module: string) {
  return get(`/studio/api/2/configuration/get_configuration?siteId=${site}&module=${module}&path=${configPath}`)
    .pipe(
      map(response => response.response)
    );
}

export function fetchFileDOM(site: string, configPath: string, module: string) {
  return fetchFileContent(site, configPath, module).pipe(
    map(response => {
      const xmlString = response ? response.content : '',
                        parser = new DOMParser;
      return parser.parseFromString(xmlString, "text/xml");
    })
  )
}

export default {
  fetchFileContent,
  fetchFileDOM
}
