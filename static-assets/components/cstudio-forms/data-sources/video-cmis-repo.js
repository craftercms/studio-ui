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

CStudioForms.Datasources.VideoCMISRepo =
  CStudioForms.Datasources.VideoCMISRepo ||
  function (id, form, properties, constraints) {
    this.id = id;
    this.form = form;
    this.properties = properties;
    this.constraints = constraints;

    for (var i = 0; i < properties.length; i++) {
      if (properties[i].name === 'repoPath') {
        this.repoPath = properties[i].value;
      }
      if (properties[i].name === 'repoId') {
        this.repoId = properties[i].value;
      }
      if (properties[i].name === 'studioPath') {
        this.studioPath = properties[i].value;
      }
      if (properties[i].name === 'allowedOperations') {
        var propValues = JSON.parse(properties[i].value);

        for (var x = 0; x < propValues.length; x++) {
          if (propValues[x].selected) {
            this.allowedOperations = propValues[x].value;
          }
        }
      }
    }

    return this;
  };

YAHOO.extend(CStudioForms.Datasources.VideoCMISRepo, CStudioForms.CStudioFormDatasource, {
  insertVideoAction: function (callback) {
    var _self = this;

    CStudioAuthoring.Operations.openCMISBrowse(
      _self.repoId,
      _self.repoPath,
      _self.studioPath,
      _self.allowedOperations,
      'select',
      true,
      {
        success: function (searchId, selectedTOs) {
          var cb = function (repositories) {
            var repo = null;
            if (!repositories.length) {
              repo = repositories;
            } else {
              for (var i = 0; i < repositories.length; i++) {
                if (_self.repoId === repositories[i].id) {
                  repo = repositories[i];
                }
              }
            }

            var item = selectedTOs[0],
              fileName = item.internalName,
              fileExtension = fileName.split('.').pop(),
              relativeUrl,
              previewUrl;

            if (item.clone) {
              // clone
              relativeUrl = _self.studioPath.endsWith('/')
                ? _self.studioPath + fileName
                : _self.studioPath + '/' + fileName;
              previewUrl = CStudioAuthoringContext.previewAppBaseUri + relativeUrl;
            } else {
              // link
              previewUrl = repo['download-url-regex'].replace('{item_id}', item.itemId);
              relativeUrl = repo['download-url-regex'].replace('{item_id}', item.itemId) + '?crafterCMIS=true';
            }

            var videoData = {
              previewUrl: previewUrl,
              relativeUrl: relativeUrl,
              fileExtension: fileExtension,
              remote: true
            };

            callback.success(videoData);
          };

          _self.getConfig(cb);
        },
        failure: function () {}
      }
    );
  },

  getConfig: function (callback) {
    CStudioAuthoring.Service.getConfiguration(CStudioAuthoringContext.site, '/data-sources/cmis-config.xml', {
      success: function (config) {
        callback(config.repositories.repository);
      }
    });
  },

  // remove edit because edit is not supported
  edit: function (key) {},

  getLabel: function () {
    return CMgs.format(langBundle, 'videoCMISRepository');
  },

  getInterface: function () {
    return 'video';
  },

  getName: function () {
    return 'video-cmis-repo';
  },

  getSupportedProperties: function () {
    return [
      { label: CMgs.format(langBundle, 'repositoryPath'), name: 'repoPath', type: 'string' },
      { label: CMgs.format(langBundle, 'repositoryId'), name: 'repoId', type: 'string' },
      { label: CMgs.format(langBundle, 'studioPath'), name: 'studioPath', type: 'string' },
      {
        label: CMgs.format(langBundle, 'allowedOperations'),
        name: 'allowedOperations',
        type: 'dropdown',
        defaultValue: [
          {
            value: 'value_both',
            label: CMgs.format(langBundle, 'cloneAndLink'),
            selected: true
          },
          {
            value: 'value_clone',
            label: CMgs.format(langBundle, 'clone'),
            selected: false
          },
          {
            value: 'value_link',
            label: CMgs.format(langBundle, 'link'),
            selected: false
          }
        ]
      }
    ];
  },

  getSupportedConstraints: function () {
    return [];
  }
});

CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-video-cmis-repo', CStudioForms.Datasources.VideoCMISRepo);
