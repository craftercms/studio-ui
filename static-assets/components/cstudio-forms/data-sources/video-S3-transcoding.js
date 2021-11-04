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

CStudioForms.Datasources.VideoS3Transcoding =
  CStudioForms.Datasources.VideoS3Transcoding ||
  function (id, form, properties, constraints) {
    this.id = id;
    this.form = form;
    this.properties = properties;
    this.constraints = constraints;

    for (var i = 0; i < properties.length; i++) {
      if (properties[i].name === 'outputProfileId') {
        this.outputProfileId = properties[i].value;
      }
      if (properties[i].name === 'inputProfileId') {
        this.inputProfileId = properties[i].value;
      }
    }

    return this;
  };

YAHOO.extend(CStudioForms.Datasources.VideoS3Transcoding, CStudioForms.CStudioFormDatasource, {
  itemsAreContentReferences: true,

  /**
   * action called when user clicks insert file
   */
  insertVideoAction: function (insertCb) {
    (this._self = this), (me = this);

    var path = this._self.repoPath;
    var site = CStudioAuthoringContext.site;

    for (var i = 0; i < this.properties.length; i++) {
      if (this.properties[i].name == 'repoPath') {
        path = this.properties[i].value;
        path = this.processPathsForMacros(path);
      }
    }

    var callback = {
      success: function (fileData) {
        var videoData = {};
        videoData.remote = true;
        videoData.multiple = true;
        videoData.videos = [];

        fileData.urls.forEach(function (url) {
          var video = {
            url: url
          };

          videoData.videos.push(video);
        });

        insertCb.success(videoData);
      },

      failure: function () {
        insertCb.failure('An error occurred while uploading the video.');
      },

      context: this
    };

    var params = {
      transcode: true
    };

    var profiles = {
      outputProfileId: me.outputProfileId,
      inputProfileId: me.inputProfileId
    };

    CStudioAuthoring.Operations.uploadS3Asset(site, path, profiles, callback, params, ['video/*']);
  },

  getLabel: function () {
    return CMgs.format(langBundle, 'videos3Transcoding');
  },

  getInterface: function () {
    return 'transcoded-video';
  },

  getName: function () {
    return 'video-S3-transcoding';
  },

  getSupportedProperties: function () {
    return [
      { label: CMgs.format(langBundle, 'inputProfileId'), name: 'inputProfileId', type: 'string' },
      { label: CMgs.format(langBundle, 'outputProfileId'), name: 'outputProfileId', type: 'string' }
    ];
  },

  getSupportedConstraints: function () {
    return [];
  }
});

CStudioAuthoring.Module.moduleLoaded(
  'cstudio-forms-controls-video-S3-transcoding',
  CStudioForms.Datasources.VideoS3Transcoding
);
