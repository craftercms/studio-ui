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

CStudioForms.Datasources.ImgRepoUpload =
  CStudioForms.Datasources.ImgRepoUpload ||
  function (id, form, properties, constraints) {
    this.id = id;
    this.form = form;
    this.properties = properties;
    this.constraints = constraints;
    this.useSearch = false;

    var _self = this;
    properties.forEach(function (property) {
      if (property.name === 'repoPath') {
        _self.repoPath = property.value;
      } else if (property.name === 'useSearch') {
        _self.useSearch = property.value === 'true';
      }
    });

    return this;
  };

YAHOO.extend(CStudioForms.Datasources.ImgRepoUpload, CStudioForms.CStudioFormDatasource, {
  getLabel() {
    return CMgs.format(langBundle, 'imageFromRepository');
  },

  /**
   * action called when user clicks insert image
   */
  insertImageAction(insertCb) {
    var _self = this;

    if (this.useSearch) {
      var searchContext = {
        keywords: '',
        filters: {
          'mime-type': ['image/jpeg', 'image/png', 'image/gif', 'image/tiff', 'image/bmp', 'image/svg+xml']
        },
        sortBy: 'internalName',
        sortOrder: 'asc',
        mode: 'select' // open search not in default but in select mode
      };

      if (this.repoPath) {
        searchContext.path = this.repoPath.endsWith('/') ? `${this.repoPath}.+` : `${this.repoPath}/.+`;
      }

      CStudioAuthoring.Operations.openSearch(
        searchContext,
        true,
        {
          success(searchId, selectedTOs) {
            var imageData = {};
            var path = selectedTOs[0].path;
            var url = this.context.createPreviewUrl(path);
            imageData.previewUrl = url;
            imageData.relativeUrl = path;
            imageData.fileExtension = path.substring(path.lastIndexOf('.') + 1);

            insertCb.success(imageData, true);
          },
          failure() {},
          context: _self
        },
        null
      );
    } else {
      CStudioAuthoring.Operations.openBrowseFilesDialog({
        path: _self.processPathsForMacros(_self.repoPath),
        onSuccess: ({ path }) => {
          const imageData = {};
          imageData.previewUrl = _self.createPreviewUrl(path);
          imageData.relativeUrl = path;
          imageData.fileExtension = path.substring(path.lastIndexOf('.') + 1);

          insertCb.success(imageData, true);
        }
      });
    }
  },

  /**
   * create preview URL
   */
  createPreviewUrl(imagePath) {
    return CStudioAuthoringContext.previewAppBaseUri + imagePath + '';
  },

  /**
   * clean up preview URL so that URL is canonical
   */
  cleanPreviewUrl(previewUrl) {
    var url = previewUrl;

    if (previewUrl.indexOf(CStudioAuthoringContext.previewAppBaseUri) !== -1) {
      url = previewUrl.substring(CStudioAuthoringContext.previewAppBaseUri.length);

      if (url.substring(0, 1) !== '/') {
        url = '/' + url;
      }
    }
    return url;
  },

  deleteImage(path) {},

  getInterface() {
    return 'image';
  },

  getName() {
    return 'img-repository-upload';
  },

  getSupportedProperties() {
    return [
      {
        label: CMgs.format(langBundle, 'repositoryPath'),
        name: 'repoPath',
        type: 'content-path-input',
        defaultValue: '/static-assets/',
        rootPath: '/static-assets',
        validations: {
          regex: /^\/static-assets(\/.*)?$/
        }
      },
      {
        label: CMgs.format(langBundle, 'useSearch'),
        name: 'useSearch',
        type: 'boolean',
        defaultValue: 'false'
      }
    ];
  },

  getSupportedConstraints() {
    return [{ label: CMgs.format(langBundle, 'required'), name: 'required', type: 'boolean' }];
  }
});

CStudioAuthoring.Module.moduleLoaded(
  'cstudio-forms-controls-img-repository-upload',
  CStudioForms.Datasources.ImgRepoUpload
);
