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

CStudioForms.Datasources.ImgCMISUpload =
  CStudioForms.Datasources.ImgCMISUpload ||
  function (id, form, properties, constraints) {
    this.id = id;
    this.form = form;
    this.properties = properties;
    this.constraints = constraints;

    for (var i = 0; i < properties.length; i++) {
      if (properties[i].name == 'repoPath') {
        this.repoPath = properties[i].value;
      }
      if (properties[i].name === 'repositoryId') {
        this.repositoryId = properties[i].value;
      }
    }

    return this;
  };

YAHOO.extend(CStudioForms.Datasources.ImgCMISUpload, CStudioForms.CStudioFormDatasource, {
  itemsAreContentReferences: true,

  /**
   * action called when user clicks insert file
   */
  insertImageAction: function (insertCb) {
    (this._self = this), (me = this);

    var site = CStudioAuthoringContext.site;
    var path = this._self.repoPath;
    var isUploadOverwrite = true;

    for (var i = 0; i < this.properties.length; i++) {
      if (this.properties[i].name == 'repoPath') {
        path = this.properties[i].value;

        path = this.processPathsForMacros(path);
      }
    }

    var callback = {
      success: function (fileData) {
        var uri = fileData;
        var fileExtension = fileData.split('.').pop();

        var imageData = {
          previewUrl: uri,
          relativeUrl: uri,
          fileExtension: fileExtension,
          remote: true
        };

        insertCb.success(imageData);
      },

      failure: function () {
        insertCb.failure('An error occurred while uploading the image.');
      },

      context: this
    };

    CStudioAuthoring.Operations.uploadCMISAsset(site, path, me.repositoryId, callback);
  },

  getLabel: function () {
    return CMgs.format(langBundle, 'CMISUploadImage');
  },

  getInterface: function () {
    return 'image';
  },

  getName: function () {
    return 'img-CMIS-upload';
  },

  getSupportedProperties: function () {
    return [
      { label: CMgs.format(langBundle, 'repositoryPath'), name: 'repoPath', type: 'string' },
      { label: CMgs.format(langBundle, 'repositoryId'), name: 'repositoryId', type: 'string' }
    ];
  },

  getSupportedConstraints: function () {
    return [];
  }
});

CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-img-CMIS-upload', CStudioForms.Datasources.ImgCMISUpload);
