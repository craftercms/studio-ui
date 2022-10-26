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

CStudioForms.Datasources.VideoWebDAVUpload =
  CStudioForms.Datasources.VideoWebDAVUpload ||
  function (id, form, properties, constraints) {
    this.id = id;
    this.form = form;
    this.properties = properties;
    this.constraints = constraints;

    for (var i = 0; i < properties.length; i++) {
      if (properties[i].name == 'repoPath') {
        this.repoPath = properties[i].value;
      }
      if (properties[i].name === 'profileId') {
        this.profileId = properties[i].value;
      }
    }

    return this;
  };

YAHOO.extend(CStudioForms.Datasources.VideoWebDAVUpload, CStudioForms.CStudioFormDatasource, {
  itemsAreContentReferences: true,

  /**
   * action called when user clicks insert file
   */
  insertVideoAction: function (insertCb) {
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
        const fileName = fileData.name;
        var uri = fileData.url;
        var fileExtension = fileName.split('.').pop();

        var videoData = {
          previewUrl: uri,
          relativeUrl: uri,
          fileExtension: fileExtension,
          remote: true
        };

        insertCb.success(videoData);
      },

      failure: function () {
        insertCb.failure('An error occurred while uploading the video.');
      },

      context: this
    };

    CStudioAuthoring.Operations.uploadWebDAVAsset(site, path, me.profileId, callback, ['video/*']);
  },

  getLabel: function () {
    return CMgs.format(langBundle, 'WebDAVUploadVideo');
  },

  getInterface: function () {
    return 'video';
  },

  getName: function () {
    return 'video-WebDAV-upload';
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
  'cstudio-forms-controls-video-WebDAV-upload',
  CStudioForms.Datasources.VideoWebDAVUpload
);
