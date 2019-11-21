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

export interface ContentTypeSection {
  title: string;
  fields: string[];
  description: string;
  expandByDefault: string;
}

export interface ContentTypeField {
  id: string;
  name: string;
  type: string;
}

export interface DataSource {
  id: string;
  name: string;
  [prop: string]: any;
}

type LegacyComponentTypes = 'component' | 'page' | 'unknown';

export interface ContentType {
  id: string;
  name: string;
  type: LegacyComponentTypes;
  quickCreate: boolean;
  quickCreatePath: string;
  displayTemplate: string;
  sections: ContentTypeSection[];
  fields: ContentTypeField[];
  dataSources: DataSource[];
}

export interface LegacyFormConfigPattern {
  pattern: string;
}

export interface LegacyFormDefinitionProperty {
  label: string; // => display name
  name: string; // => id
  type: string;
  value: string;
}

export interface LegacyFormDefinitionField {
  constraints: '';
  defaultValue: string;
  description: string;
  help: string;
  iceId: string;
  id: string;
  properties: {
    property: LegacyFormDefinitionProperty | Array<LegacyFormDefinitionProperty>
  };
  title: string;
  type: string;
}

export interface LegacyFormDefinitionSection {
  defaultOpen: 'true' | 'false';
  description: string;
  fields: {
    field: LegacyFormDefinitionField | Array<LegacyFormDefinitionField>
  };
  title: string;
}

export interface LegacyFormDefinition {
  // As returned by `/studio/api/1/services/api/1/site/get-configuration.json?site=${site}&path=/content-types/.../form-definition.xml`
  title: string; // e.g. Page - Home
  contentType: string; // e.g. /page/home
  description: string; // e.g. ""
  imageThumbnail: string; // e.g. page-home.png
  objectType: string; // e.g. page
  quickCreate: 'true' | 'false';
  quickCreatePath: string; // e.g. /site/pages
  sections: {
    section: LegacyFormDefinitionSection | Array<LegacyFormDefinitionSection>
  };
  properties: {
    property: LegacyFormDefinitionProperty[] | LegacyFormDefinitionProperty
  };
  datasources: {
    datasource: Array<{
      id: string; // id within the form
      title: string; // display name for authors
      type: string; // data source id
      interface: string; // ?
      properties: {
        property: LegacyFormDefinitionProperty[] | LegacyFormDefinitionProperty
      }
    }>;
  }
}

export interface LegacyFormConfig {
  // As returned by `/studio/api/1/services/api/1/site/get-configuration.json?site=${site}&path=/content-types/.../config.xml`
  contentAsFolder: 'true' | 'false';
  fileExtension: 'xml';
  form: string;
  formPath: string;
  imageThumbnail: string;
  label: string;
  modelInstancePath: string;
  noThumbnail: 'true' | 'false';
  paths: { excludes: LegacyFormConfigPattern | Array<LegacyFormConfigPattern> }
  previewable: 'true' | 'false';
  quickCreate: 'true' | 'false';
  quickCreatePath: string;
}

export interface LegacyContentTypeDescriptorCamelized {
  // As returned by `/studio/api/1/services/api/1/content/get-content-types.json?site=${site}`
  allowedRoles: [];
  contentAsFolder: boolean;
  copyDepedencyPattern: [];
  deleteDependencyPattern: [];
  form: string;
  formPath: string;
  imageThumbnail: string;
  label: string;
  lastUpdated: string;
  modelInstancePath: string;
  name: string;
  noThumbnail: boolean;
  nodeRef: any;
  pathExcludes: string[];
  pathIncludes: string[];
  previewable: boolean;
  quickCreate: boolean;
  quickCreatePath: string;
  type: LegacyComponentTypes;
  useRoundedFolder: string;
}

export default ContentType;

// New FIELD format

// "id": "header",
// "name": "Header",
// "type": "component",
// "localized": false,
// "required": true,
// "disabled": false,
// "omitted": false,
// "mapsTo": "#header",
// "mapsToType": "",
// "mapsToTarget": "element",
// "placeholder": "header",
// "editor": "",
// "defaultValue": "",
// "validations": {
// "role": {
//   "value": [/*...*/]
// },
// "permissions": {
//   "value": [/*...*/]
// },
// "contentTypes": ["0SscAs0UuA_ctid"],
//   "contentTypeTags": []
// }

// /studio/api/1/services/api/1/site/get-configuration.json?site=editorial&path=/content-types/page/home/form-definition.xml

// {
//   'quickCreatePath': '/site/pages',
//   'datasources': {
//     'datasource': [{
//       'id': 'existingImages',
//       'type': 'img-repository-upload',
//       'title': 'Existing Images',
//       'interface': 'image',
//       'properties': { 'property': { 'name': 'repoPath', 'type': 'undefined', 'value': '/static-assets/images/' } }
//     }, {
//       'id': 'uploadImages',
//       'type': 'img-desktop-upload',
//       'title': 'Upload Images',
//       'interface': 'image',
//       'properties': {
//         'property': {
//           'name': 'repoPath',
//           'type': 'undefined',
//           'value': '/static-assets/item/images/{yyyy}/{mm}/{dd}/'
//         }
//       }
//     }, {
//       'id': 'components-header',
//       'type': 'shared-content',
//       'title': 'Components Header',
//       'interface': 'item',
//       'properties': {
//         'property': [{
//           'name': 'repoPath',
//           'type': 'undefined',
//           'value': '/site/components/headers/'
//         }, { 'name': 'browsePath', 'type': 'undefined', 'value': '' }, {
//           'name': 'type',
//           'type': 'undefined',
//           'value': ''
//         }]
//       }
//     }, {
//       'id': 'features',
//       'type': 'embedded-content',
//       'title': 'Features',
//       'interface': 'item',
//       'properties': { 'property': { 'name': 'contentType', 'type': 'undefined', 'value': '/component/feature' } }
//     }, {
//       'id': 'components-left-rail',
//       'type': 'shared-content',
//       'title': 'Components Left Rail',
//       'interface': 'item',
//       'properties': {
//         'property': [{
//           'name': 'repoPath',
//           'type': 'undefined',
//           'value': '/site/components/left-rails/'
//         }, { 'name': 'browsePath', 'type': 'undefined', 'value': '' }, {
//           'name': 'type',
//           'type': 'undefined',
//           'value': ''
//         }]
//       }
//     }, {
//       'id': 'sharedFeatures',
//       'type': 'shared-content',
//       'title': 'Shared Features',
//       'interface': 'item',
//       'properties': {
//         'property': [{
//           'name': 'enableCreateNew',
//           'type': 'undefined',
//           'value': 'true'
//         }, { 'name': 'enableBrowseExisting', 'type': 'undefined', 'value': 'true' }, {
//           'name': 'enableSearchExisting',
//           'type': 'undefined',
//           'value': 'false'
//         }, { 'name': 'repoPath', 'type': 'undefined', 'value': '/site/components/features' }, {
//           'name': 'browsePath',
//           'type': 'undefined',
//           'value': '/site/components/features'
//         }, { 'name': 'type', 'type': 'undefined', 'value': '' }]
//       }
//     }]
//   },
//   'quickCreate': 'true',
//   'description': '',
//   'content-type': '/page/home',
//   'title': 'Page - Home',
//   'imageThumbnail': 'page-home.png',
//   'properties': {
//     'property': [{
//       'name': 'display-template',
//       'label': 'Display Template',
//       'type': 'template',
//       'value': '/templates/web/pages/home.ftl'
//     }, {
//       'name': 'no-template-required',
//       'label': 'No Template Required',
//       'type': 'boolean',
//       'value': ''
//     }, { 'name': 'merge-strategy', 'label': 'Merge Strategy', 'type': 'string', 'value': 'inherit-levels' }]
//   },
//   'sections': {
//     'section': [{
//       'description': '', 'defaultOpen': 'true', 'title': 'Page Properties', 'fields': {
//         'field': [{
//           'iceId': '',
//           'help': '',
//           'defaultValue': '',
//           'description': '',
//           'id': 'file-name',
//           'type': 'file-name',
//           'title': 'Page URL',
//           'constraints': '',
//           'properties': {
//             'property': [{ 'name': 'size', 'type': 'int', 'value': '50' }, {
//               'name': 'maxlength',
//               'type': 'int',
//               'value': '50'
//             }, { 'name': 'readonly', 'type': 'boolean', 'value': 'true' }]
//           }
//         }, {
//           'iceId': '',
//           'help': '',
//           'defaultValue': '',
//           'description': '',
//           'id': 'internal-name',
//           'type': 'input',
//           'title': 'Internal Name',
//           'constraints': { 'constraint': { 'name': 'required', 'type': 'boolean', 'value': 'true' } },
//           'properties': {
//             'property': [{ 'name': 'size', 'type': 'int', 'value': '50' }, {
//               'name': 'maxlength',
//               'type': 'int',
//               'value': '50'
//             }]
//           }
//         }, {
//           'iceId': '',
//           'help': '',
//           'defaultValue': '',
//           'description': '',
//           'id': 'disabled',
//           'type': 'checkbox',
//           'title': 'Disable Page',
//           'constraints': { 'constraint': { 'name': 'required', 'type': 'boolean', 'value': '' } },
//           'properties': { 'property': { 'name': 'readonly', 'type': 'boolean', 'value': '' } }
//         }, {
//           'iceId': 'core',
//           'help': '',
//           'defaultValue': '',
//           'description': '',
//           'id': 'title_t',
//           'type': 'input',
//           'title': 'Title',
//           'constraints': {
//             'constraint': [{
//               'name': 'required',
//               'type': 'boolean',
//               'value': 'true'
//             }, { 'name': 'pattern', 'type': 'string', 'value': '' }]
//           },
//           'properties': {
//             'property': [{ 'name': 'size', 'type': 'int', 'value': '50' }, {
//               'name': 'maxlength',
//               'type': 'int',
//               'value': '50'
//             }, { 'name': 'readonly', 'type': 'boolean', 'value': '' }, {
//               'name': 'tokenize',
//               'type': 'boolean',
//               'value': 'false'
//             }]
//           }
//         }, {
//           'iceId': 'core',
//           'help': '',
//           'defaultValue': '',
//           'description': 'Default header is inherited from Section Defaults. Specify a new header to overwrite it.',
//           'id': 'header_o',
//           'type': 'node-selector',
//           'title': 'Header',
//           'constraints': { 'constraint': { 'name': 'allowDuplicates', 'type': 'boolean', 'value': '' } },
//           'properties': {
//             'property': [{ 'name': 'minSize', 'type': 'int', 'value': '0' }, {
//               'name': 'maxSize',
//               'type': 'int',
//               'value': '1'
//             }, { 'name': 'itemManager', 'type': 'datasource:item', 'value': 'components-header' }, {
//               'name': 'readonly',
//               'type': 'boolean',
//               'value': ''
//             }, { 'name': 'disableFlattening', 'type': 'boolean', 'value': '' }, {
//               'name': 'useSingleValueFilename',
//               'type': 'boolean',
//               'value': ''
//             }]
//           }
//         }, {
//           'iceId': '',
//           'help': '',
//           'defaultValue': '',
//           'description': 'Default left-rail is inherited from Section Defaults. Specify a new left-rail to overwrite it.',
//           'id': 'left-rail_o',
//           'type': 'node-selector',
//           'title': 'Left Rail',
//           'constraints': { 'constraint': { 'name': 'allowDuplicates', 'type': 'boolean', 'value': '' } },
//           'properties': {
//             'property': [{ 'name': 'minSize', 'type': 'int', 'value': '0' }, {
//               'name': 'maxSize',
//               'type': 'int',
//               'value': '1'
//             }, {
//               'name': 'itemManager',
//               'type': 'datasource:item',
//               'value': 'components-left-rail'
//             }, { 'name': 'readonly', 'type': 'boolean', 'value': '' }, {
//               'name': 'disableFlattening',
//               'type': 'boolean',
//               'value': ''
//             }, { 'name': 'useSingleValueFilename', 'type': 'boolean', 'value': '' }]
//           }
//         }]
//       }
//     }, {
//       'description': '', 'defaultOpen': 'true', 'title': 'Hero Section', 'fields': {
//         'field': [{
//           'iceId': 'hero',
//           'help': '',
//           'defaultValue': '',
//           'description': '',
//           'id': 'hero_title_html',
//           'type': 'rte-tinymce5',
//           'title': 'Hero Title',
//           'constraints': { 'constraint': { 'name': 'required', 'type': 'boolean', 'value': 'true' } },
//           'properties': {
//             'property': [{
//               'name': 'height',
//               'type': 'int',
//               'value': '410'
//             }, { 'name': 'forceRootBlockPTag', 'type': 'boolean', 'value': 'true' }, {
//               'name': 'forcePTags',
//               'type': 'boolean',
//               'value': 'true'
//             }, { 'name': 'forceBRTags', 'type': 'boolean', 'value': 'false' }, {
//               'name': 'supportedChannels',
//               'type': 'supportedChannels',
//               'value': ''
//             }, { 'name': 'rteConfiguration', 'type': 'string', 'value': 'generic' }, {
//               'name': 'imageManager',
//               'type': 'datasource:image',
//               'value': ''
//             }, { 'name': 'videoManager', 'type': 'datasource:video', 'value': '' }]
//           }
//         }, {
//           'iceId': 'hero',
//           'help': '',
//           'defaultValue': '',
//           'description': '',
//           'id': 'hero_text_html',
//           'type': 'rte-tinymce5',
//           'title': 'Hero Text',
//           'constraints': { 'constraint': { 'name': 'required', 'type': 'boolean', 'value': 'true' } },
//           'properties': {
//             'property': [{
//               'name': 'height',
//               'type': 'int',
//               'value': '200'
//             }, { 'name': 'forceRootBlockPTag', 'type': 'boolean', 'value': 'true' }, {
//               'name': 'forcePTags',
//               'type': 'boolean',
//               'value': 'true'
//             }, { 'name': 'forceBRTags', 'type': 'boolean', 'value': 'false' }, {
//               'name': 'supportedChannels',
//               'type': 'supportedChannels',
//               'value': ''
//             }, { 'name': 'rteConfiguration', 'type': 'string', 'value': 'generic' }, {
//               'name': 'imageManager',
//               'type': 'datasource:image',
//               'value': ''
//             }, { 'name': 'videoManager', 'type': 'datasource:video', 'value': '' }]
//           }
//         }, {
//           'iceId': 'hero',
//           'help': '',
//           'defaultValue': '',
//           'description': '',
//           'id': 'hero_image_s',
//           'type': 'image-picker',
//           'title': 'Hero Image',
//           'constraints': { 'constraint': { 'name': 'required', 'type': 'boolean', 'value': '' } },
//           'properties': {
//             'property': [{
//               'name': 'width',
//               'type': 'range',
//               'value': '{ "exact":"", "min":"", "max":"" }'
//             }, {
//               'name': 'height',
//               'type': 'range',
//               'value': '{ "exact":"", "min":"", "max":"" }'
//             }, { 'name': 'thumbnailWidth', 'type': 'int', 'value': '' }, {
//               'name': 'thumbnailHeight',
//               'type': 'int',
//               'value': ''
//             }, {
//               'name': 'imageManager',
//               'type': 'datasource:image',
//               'value': 'existingImages,uploadImages'
//             }, { 'name': 'readonly', 'type': 'boolean', 'value': '' }]
//           }
//         }]
//       }
//     }, {
//       'description': '', 'defaultOpen': 'true', 'title': 'Features', 'fields': {
//         'field': [{
//           'iceId': 'features',
//           'help': '',
//           'defaultValue': '',
//           'description': '',
//           'id': 'features_title_t',
//           'type': 'input',
//           'title': 'Features Title',
//           'constraints': {
//             'constraint': [{
//               'name': 'required',
//               'type': 'boolean',
//               'value': 'true'
//             }, { 'name': 'pattern', 'type': 'string', 'value': '' }]
//           },
//           'properties': {
//             'property': [{ 'name': 'size', 'type': 'int', 'value': '50' }, {
//               'name': 'maxlength',
//               'type': 'int',
//               'value': '50'
//             }, { 'name': 'readonly', 'type': 'boolean', 'value': '' }, {
//               'name': 'tokenize',
//               'type': 'boolean',
//               'value': 'false'
//             }]
//           }
//         }, {
//           'iceId': 'features',
//           'help': '',
//           'defaultValue': '',
//           'description': '',
//           'id': 'features_o',
//           'type': 'node-selector',
//           'title': 'Features',
//           'constraints': { 'constraint': { 'name': 'allowDuplicates', 'type': 'boolean', 'value': '' } },
//           'properties': {
//             'property': [{ 'name': 'minSize', 'type': 'int', 'value': '' }, {
//               'name': 'maxSize',
//               'type': 'int',
//               'value': ''
//             }, {
//               'name': 'itemManager',
//               'type': 'datasource:item',
//               'value': 'features,sharedFeatures'
//             }, { 'name': 'readonly', 'type': 'boolean', 'value': '' }, {
//               'name': 'disableFlattening',
//               'type': 'boolean',
//               'value': ''
//             }, { 'name': 'useSingleValueFilename', 'type': 'boolean', 'value': '' }]
//           }
//         }]
//       }
//     }]
//   },
//   'objectType': 'page'
// }

// studio/api/1/services/api/1/content/get-content-types.json

// {
//   'name': '/taxonomy',
//   'label': 'Taxonomy',
//   'form': '/taxonomy',
//   'formPath': 'simple',
//   'type': 'unknown',
//   'contentAsFolder': false,
//   'useRoundedFolder': false,
//   'modelInstancePath': 'NOT-USED-BY-SIMPLE-FORM-ENGINE',
//   'allowedRoles': [],
//   'lastUpdated': '2019-11-21T04:25:31.634Z',
//   'copyDepedencyPattern': [], <=== !!!!??????!????!
//   'imageThumbnail': 'taxonomy.png',
//   'noThumbnail': false,
//   'pathIncludes': ['^/site/taxonomy/.*'],
//   'pathExcludes': [],
//   'nodeRef': null,
//   'quickCreate': false,
//   'quickCreatePath': '',
//   'previewable': false,
//   'deleteDependencyPattern': []
// }

// New ICE format

// "id": "4qT1W3Xewc_ctid",
// "name": "Canvas Homepage",
// "alias": "canvas",
// "description": "A multi-purpose landing page",
// "type": "ContentType",
// "publishedCounter": 1,
// "version": 2,
// "createdAt": "2019-05-28T18:47:37.615Z",
// "updatedAt": "2019-05-28T18:47:39.626Z",
// "publishedVersion": 1,
// "publishedAt": "2019-05-28T18:47:39.626Z",
// "firstPublishedAt": "2019-05-28T18:47:39.626Z",
// "disabled": false,
// "omitted": false,
