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

CStudioForms.Datasources.VideoWebDAVRepo =
  CStudioForms.Datasources.VideoWebDAVRepo ||
  function (id, form, properties, constraints) {
    this.id = id;
    this.form = form;
    this.properties = properties;
    this.constraints = constraints;

    for (var i = 0; i < properties.length; i++) {
      if (properties[i].name === 'repoPath') {
        this.repoPath = properties[i].value;
      }
      if (properties[i].name === 'profileId') {
        this.profileId = properties[i].value;
      }
    }

    return this;
  };

YAHOO.extend(CStudioForms.Datasources.VideoWebDAVRepo, CStudioForms.CStudioFormDatasource, {
  insertVideoAction: function (insertCb) {
    var _self = this;

    var browseCb = {
      success: function (searchId, selectedTOs) {
        for (var i = 0; i < selectedTOs.length; i++) {
          var item = selectedTOs[i];
          var uri = item.browserUri;
          var fileName = item.internalName;
          var fileExtension = fileName.split('.').pop();

          var videoData = {
            previewUrl: uri,
            relativeUrl: uri,
            fileExtension: fileExtension,
            remote: true
          };

          insertCb.success(videoData);
        }
      },
      failure: function () {}
    };

    CStudioAuthoring.Operations.openWebDAVBrowse(
      _self.processPathsForMacros(_self.repoPath),
      _self.profileId,
      'select',
      true,
      browseCb,
      'video'
    );
  },

  getConfig: function (callback) {
    CStudioAuthoring.Service.getConfiguration(CStudioAuthoringContext.site, '/webdav/webdav.xml', {
      success: function (config) {
        callback(config);
      }
    });
  },

  getLabel: function () {
    return CMgs.format(langBundle, 'videoWebDavRepository');
  },

  getInterface: function () {
    return 'video';
  },

  getName: function () {
    return 'video-WebDAV-repo';
  },

  getSupportedProperties: function () {
    return [
      { label: CMgs.format(langBundle, 'repositoryPath'), name: 'repoPath', type: 'string' },
      { label: CMgs.format(langBundle, 'profileId'), name: 'profileId', type: 'string' }
    ];
  },

  getSupportedConstraints: function () {
    return [];
  }
});

CStudioAuthoring.Module.moduleLoaded(
  'cstudio-forms-controls-video-WebDAV-repo',
  CStudioForms.Datasources.VideoWebDAVRepo
);
