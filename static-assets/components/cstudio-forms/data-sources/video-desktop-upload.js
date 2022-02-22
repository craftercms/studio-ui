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

CStudioForms.Datasources.VideoDesktopUpload =
  CStudioForms.Datasources.VideoDesktopUpload ||
  function (id, form, properties, constraints) {
    this.id = id;
    this.form = form;
    this.properties = properties;
    this.constraints = constraints;

    return this;
  };

YAHOO.extend(CStudioForms.Datasources.VideoDesktopUpload, CStudioForms.CStudioFormDatasource, {
  getLabel: function () {
    return CMgs.format(langBundle, 'videoUploadedDesktop');
  },

  /**
   * action called when user clicks insert video
   */
  insertVideoAction: function (insertCb) {
    this._self = this;
    var site = CStudioAuthoringContext.site;
    var path = '/static-assets/video';
    var isUploadOverwrite = true;

    for (var i = 0; i < this.properties.length; i++) {
      if (this.properties[i].name == 'repoPath') {
        path = this.properties[i].value;

        path = this.processPathsForMacros(path);
      }
    }

    var callback = {
      success: function (videoData) {
        var url = this.context.createPreviewUrl(path + '/' + videoData.fileName);
        videoData.previewUrl = url;
        videoData.relativeUrl = path + '/' + videoData.fileName;
        insertCb.success(videoData);
      },
      failure: function () {
        insertCb.failure('An error occurred while uploading the video.');
      },
      context: this
    };

    CStudioAuthoring.Operations.uploadAsset(site, path, isUploadOverwrite, callback, ['video/*']);
  },

  /**
   * create preview URL
   */
  createPreviewUrl: function (videoPath) {
    return CStudioAuthoringContext.previewAppBaseUri + videoPath + '';
  },

  /**
   * clean up preview URL so that URL is canonical
   */
  cleanPreviewUrl: function (previewUrl) {
    var url = previewUrl;

    if (previewUrl.indexOf(CStudioAuthoringContext.previewAppBaseUri) != -1) {
      url = previewUrl.substring(CStudioAuthoringContext.previewAppBaseUri.length);
    }

    return url;
  },

  deleteVideo: function (path) {},

  getInterface: function () {
    return 'video';
  },

  getName: function () {
    return 'video-desktop-upload';
  },

  getSupportedProperties: function () {
    return [{ label: CMgs.format(langBundle, 'repositoryPath'), name: 'repoPath', type: 'string' }];
  },

  getSupportedConstraints: function () {
    return [{ label: CMgs.format(langBundle, 'required'), name: 'required', type: 'boolean' }];
  }
});

CStudioAuthoring.Module.moduleLoaded(
  'cstudio-forms-controls-video-desktop-upload',
  CStudioForms.Datasources.VideoDesktopUpload
);
