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

CStudioForms.Datasources.ImgCMISRepo =
  CStudioForms.Datasources.ImgCMISRepo ||
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

YAHOO.extend(CStudioForms.Datasources.ImgCMISRepo, CStudioForms.CStudioFormDatasource, {
  getLabel: function () {
    return CMgs.format(langBundle, 'imageFromCMISRepository');
  },

  /**
   * action called when user clicks insert image
   */
  insertImageAction: function (insertCb) {
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

            for (var i = 0; i < selectedTOs.length; i++) {
              var item = selectedTOs[i];
              var uri;
              var fileName = item.internalName;
              var fileExtension = fileName.split('.').pop();
              if (!selectedTOs[i].clone) {
                uri = repo['download-url-regex'].replace('{item_id}', item.itemId) + '?crafterCMIS=true';
              } else {
                uri = _self.studioPath.endsWith('/') ? _self.studioPath + fileName : _self.studioPath + '/' + fileName;
              }

              var imageData = {
                previewUrl: uri,
                relativeUrl: uri,
                fileExtension: fileExtension,
                remote: true
              };

              insertCb.success(imageData, true);
            }
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

  /**
   * create preview URL
   */
  createPreviewUrl: function (imagePath) {
    return CStudioAuthoringContext.previewAppBaseUri + imagePath + '';
  },

  /**
   * clean up preview URL so that URL is canonical
   */
  cleanPreviewUrl: function (previewUrl) {
    var url = previewUrl;

    if (previewUrl.indexOf(CStudioAuthoringContext.previewAppBaseUri) !== -1) {
      url = previewUrl.substring(CStudioAuthoringContext.previewAppBaseUri.length);

      if (url.substring(0, 1) !== '/') {
        url = '/' + url;
      }
    }

    return url;
  },

  deleteImage: function (path) {},

  getInterface: function () {
    return 'image';
  },

  getName: function () {
    return 'img-cmis-repo';
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

CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-img-cmis-repo', CStudioForms.Datasources.ImgCMISRepo);
