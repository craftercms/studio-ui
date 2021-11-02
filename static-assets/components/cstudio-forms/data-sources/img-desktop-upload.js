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

CStudioForms.Datasources.ImgDesktopUpload =
  CStudioForms.Datasources.ImgDesktopUpload ||
  function (id, form, properties, constraints) {
    this.id = id;
    this.form = form;
    this.properties = properties;
    this.constraints = constraints;

    return this;
  };

YAHOO.extend(CStudioForms.Datasources.ImgDesktopUpload, CStudioForms.CStudioFormDatasource, {
  getLabel: function () {
    return CMgs.format(langBundle, 'imageUploadedDesktop');
  },

  /**
   * action called when user clicks insert image
   */
  insertImageAction: function (insertCb, file) {
    this._self = this;
    var site = CStudioAuthoringContext.site;
    var path = '/static-assets/images'; // default
    var isUploadOverwrite = true;

    var CMgs = CStudioAuthoring.Messages;
    var langBundle = CMgs.getBundle('contentTypes', CStudioAuthoringContext.lang);

    for (var i = 0; i < this.properties.length; i++) {
      if (this.properties[i].name == 'repoPath') {
        path = this.properties[i].value;

        path = this.processPathsForMacros(path);
      }
    }

    var callback = {
      success: function (imageData) {
        var relativeUrl = path.endsWith('/') ? path + imageData.fileName : path + '/' + imageData.fileName;
        var url = this.context.createPreviewUrl(relativeUrl);
        imageData.previewUrl = url + '?' + new Date().getTime();
        imageData.relativeUrl = relativeUrl;

        insertCb.success(imageData);
      },
      failure: function () {
        insertCb.failure('An error occurred while uploading the image.');
      },
      context: this
    };

    if ('' != path) {
      if (!file) {
        CStudioAuthoring.Operations.uploadAsset(site, path, isUploadOverwrite, callback, ['image/*']);
      } else {
        CrafterCMSNext.services.content.uploadDataUrl(site, file, path, '_csrf').subscribe(
          (response) => {
            if (response.type === 'complete') {
              const item = response.payload.body.message;
              const relativeUrl = item.uri;
              const previewUrl = `${CStudioAuthoringContext.previewAppBaseUri}${relativeUrl}`;

              const imageData = {
                fileName: item.name,
                relativeUrl,
                previewUrl
              };

              insertCb.success(imageData);
            }
          },
          (error) => {
            insertCb.failure(error);
          }
        );
      }
    } else {
      var errorString = CMgs.format(langBundle, 'noPathSetError');
      errorString = errorString.replace('{DATASOURCENAME}', '<b>' + this.getName() + '</b>');

      dialog = CStudioAuthoring.Operations.showSimpleDialog(
        'error-dialog',
        CStudioAuthoring.Operations.simpleDialogTypeINFO,
        'Notification',
        errorString,
        null,
        YAHOO.widget.SimpleDialog.ICON_BLOCK,
        'studioDialog'
      );
    }
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

    if (previewUrl.indexOf(CStudioAuthoringContext.previewAppBaseUri) != -1) {
      url = previewUrl.substring(CStudioAuthoringContext.previewAppBaseUri.length);

      if (url.substring(0, 1) != '/') {
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
    return 'img-desktop-upload';
  },

  getSupportedProperties: function () {
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
      }
    ];
  },

  getSupportedConstraints: function () {
    return [{ label: CMgs.format(langBundle, 'required'), name: 'required', type: 'boolean' }];
  }
});

CStudioAuthoring.Module.moduleLoaded(
  'cstudio-forms-controls-img-desktop-upload',
  CStudioForms.Datasources.ImgDesktopUpload
);
