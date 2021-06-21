/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import LookupTable from '../../models/LookupTable';

export const freemarkerSnippets: LookupTable<{ label: string; value: string }> = {
  'content-variable': {
    label: 'Content variable',
    // eslint-disable-next-line no-template-curly-in-string
    value: '${contentModel.VARIABLENAME}'
  },
  'request-parameter': {
    label: 'Request parameter',
    // eslint-disable-next-line no-template-curly-in-string
    value: '${RequestParameters["PARAMNAME"]!"DEFAULT"}'
  },
  'studio-support': {
    label: 'Studio support',
    value: '<#import "/templates/system/common/cstudio-support.ftl" as studio />\r\n\t...\r\n\t<@studio.toolSupport />'
  },
  'dynamic-navigation': {
    label: 'Dynamic navigation',
    value:
      '<#include "/templates/web/navigation/navigation.ftl">\r\n\t...\r\n\t<@renderNavigation "/site/website", 1 />'
  },
  'transform-path-to-url': {
    label: 'Transform PATH to URL',
    // eslint-disable-next-line no-template-curly-in-string
    value: "${urlTransformationService.transform('storeUrlToRenderUrl', STOREURL)}"
  },
  'ice-attr': {
    label: 'In context editing attribute (pencil)',
    value: '<@studio.iceAttr iceGroup="ICEGROUID"/>'
  },
  'component-dropzone-attr': {
    label: 'Component DropZone attribute',
    value: '<@studio.componentContainerAttr target="TARGETID" objectId=contentModel.objectId />'
  },
  'component-attr': {
    label: 'Component attribute',
    value: '<@studio.componentAttr path=contentModel.storeUrl ice=false />'
  },
  'render-components-list': {
    label: 'Render list of components',
    value: '<#list contentModel.VARIABLENAME.item as module>\r\n\t<@renderComponent component=module />\r\n</#list>'
  },
  'iterate-items-list-load-content-item': {
    label: 'Iterate over a list of items and load content item',
    value:
      // eslint-disable-next-line no-template-curly-in-string
      '<#list contentModel.VARIABLENAME.item as myItem>\r\n\t<#assign myContentItem =  siteItemService.getSiteItem(myItem.key) />\r\n\t${myContentItem.variableName}\r\n</#list>'
  },
  'iterate-repeat-group': {
    label: 'Iterate over repeat group',
    // eslint-disable-next-line no-template-curly-in-string
    value: '<#list contentModel.VARIABLENAME.item as row>\r\n\t${row.VARIABLENAME}\r\n</#list>'
  },
  'freemarker-value-assignment': {
    label: 'Freemarker value assignment',
    value: '<#assign imageSource = contentModel.image!"" />'
  },
  'freemarker-if': {
    label: 'Freemarker value IF',
    value: '<#if CONDITION>\r\n\t...\r\n</#if>'
  },
  'freemarker-loop': {
    label: 'Freemarker value LOOP',
    // eslint-disable-next-line no-template-curly-in-string
    value: '<#list ARRAY as value>\r\n\t${value_index}: ${value}\r\n</#list>'
  },
  'freemarker-fragment-include': {
    label: 'Freemarker Fragment include',
    value: '<#include "/templates/PATH" />'
  },
  'freemarker-library-import': {
    label: 'Freemarker Library import',
    value: '<#import "/templates/PATH" as NAMESPACE />'
  },
  'html-page': {
    label: 'HTML Page',
    value:
      '<#import "/templates/system/common/cstudio-support.ftl" as studio />\r\n<html lang="en">\r\n<head>\r\n\t</head>\r\n\t<body>\r\n\t\t<h1>CONTENT HERE</h1>\r\n\t<@studio.toolSupport/>\r\n\t</body>\r\n</html>'
  },
  'html-component': {
    label: 'HTML Component',
    value:
      '<#import "/templates/system/common/cstudio-support.ftl" as studio />\r\n<div <@studio.componentAttr path=contentModel.storeUrl ice=false /> >\r\nCOMPONENT MARKUP</div>'
  }
};

export const groovySnippets: LookupTable<{ label: string; value: string }> = {
  'access-content-model': { label: 'Access Content Model', value: 'contentModel' },
  'access-template-model': { label: 'Access Template Model', value: 'templateModel' },
  'current-site-id': { label: 'Current Site ID', value: 'siteContext.siteName' },
  'request-parameters': { label: 'Request Parameters', value: 'params' },
  cookies: { label: 'Cookies', value: 'cookies' },
  'http-request': { label: 'HTTP Request', value: 'request' },
  'http-response': { label: 'HTTP Response', value: 'response' },
  session: { label: 'Session', value: 'session' },
  'transform-path-to-url': {
    label: 'Transform PATH to URL',
    value: "urlTransformationService.transform('storeUrlToRenderUrl', STOREURL)"
  },
  'user-profile': { label: 'User Profile', value: 'profile' },
  'current-authentication': {
    label: 'Current Authentication',
    value: 'authentication'
  },
  'log-info': { label: 'Log an INFO', value: "logger.info('MY MESSAGE')" },
  'log-error': { label: 'Log an ERROR', value: "logger.error('MY MESSAGE')" },
  'search-service': { label: 'Search Service', value: 'searchService' },
  'site-item-service': { label: 'Site Item Service', value: 'siteItemService' },
  'profile-service': { label: 'Profile Service', value: 'profileService' },
  'get-spring-bean': {
    label: 'Get Spring Bean',
    value: 'applicationContext.get("SPRING_BEAN_NAME")'
  }
};
