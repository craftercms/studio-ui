/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
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

CStudioForms.Datasources.ImgWebS3Repo =
  CStudioForms.Datasources.ImgWebS3Repo ||
  function (id, form, properties, constraints) {
    this.id = id;
    this.form = form;
    this.properties = properties;
    this.constraints = constraints;

    for (var i = 0; i < properties.length; i++) {
      if (properties[i].name === 'path') {
        this.path = properties[i].value;
      }
      if (properties[i].name === 'profileId') {
        this.profileId = properties[i].value;
      }
    }

    return this;
  };

YAHOO.extend(CStudioForms.Datasources.ImgWebS3Repo, CStudioForms.CStudioFormDatasource, {
  insertImageAction: function (insertCb) {
    var _self = this;

    var browseCb = {
      success: function (searchId, selectedTOs) {
        for (var i = 0; i < selectedTOs.length; i++) {
          var item = selectedTOs[i];
          var uri = item.browserUri;
          var fileName = item.internalName;
          var fileExtension = fileName.split('.').pop();

          var imageData = {
            previewUrl: uri,
            relativeUrl: uri,
            fileExtension: fileExtension,
            remote: true
          };

          insertCb.success(imageData, true);
        }
      },
      failure: function () {}
    };

    CStudioAuthoring.Operations.openS3Browse(
      _self.profileId,
      _self.processPathsForMacros(_self.path),
      'select',
      true,
      browseCb,
      'image'
    );
  },

  getLabel: function () {
    return CMgs.format(langBundle, 'imageS3Repository');
  },

  getInterface: function () {
    return 'image';
  },

  getName: function () {
    return 'img-S3-repo';
  },

  getSupportedProperties: function () {
    return [
      { label: CMgs.format(langBundle, 'repositoryPath'), name: 'path', type: 'string' },
      { label: CMgs.format(langBundle, 'profileId'), name: 'profileId', type: 'string' }
    ];
  },

  getSupportedConstraints: function () {
    return [];
  }
});

CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-img-S3-repo', CStudioForms.Datasources.ImgWebS3Repo);
