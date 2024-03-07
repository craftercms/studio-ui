/*
 * Copyright (C) 2007-2024 Crafter Software Corporation. All Rights Reserved.
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

CStudioForms.Datasources.AudioDesktopUpload =
  CStudioForms.Datasources.AudioDesktopUpload ||
  function (id, form, properties, constraints) {
    this.id = id;
    this.form = form;
    this.properties = properties;
    this.constraints = constraints;
    this.formatMessage = CrafterCMSNext.i18n.intl.formatMessage;
    this.messages = CrafterCMSNext.i18n.messages.audioDSMessages;

    return this;
  };

YAHOO.extend(CStudioForms.Datasources.AudioDesktopUpload, CStudioForms.CStudioFormDatasource, {
  getLabel: function () {
    return this.formatMessage(this.messages.uploadLabel);
  },

  /**
   * action called when user clicks insert audio
   */
  insertAudioAction: function (insertCb) {
    const site = CStudioAuthoringContext.site;
    let path = '/static-assets/audio';
    let isUploadOverwrite = true;

    for (let i = 0; i < this.properties.length; i++) {
      if (this.properties[i].name === 'repoPath') {
        path = this.properties[i].value;
        path = this.processPathsForMacros(path);
      }
    }

    const _self = this;
    const callback = {
      success: function (audioData) {
        audioData.previewUrl = this.context.createPreviewUrl(path + '/' + audioData.fileName);
        audioData.relativeUrl = path + '/' + audioData.fileName;
        insertCb.success(audioData);
      },
      failure: function () {
        insertCb.failure(_self.formatMessage(_self.messages.uploadError));
      },
      context: this
    };

    CStudioAuthoring.Operations.uploadAsset(site, path, isUploadOverwrite, callback, ['audio/*']);
  },

  /**
   * create preview URL
   */
  createPreviewUrl: function (audioPath) {
    return `${CStudioAuthoringContext.previewAppBaseUri}${audioPath}`;
  },

  /**
   * clean up preview URL so that URL is canonical
   */
  cleanPreviewUrl: function (previewUrl) {
    let url = previewUrl;
    if (previewUrl.indexOf(CStudioAuthoringContext.previewAppBaseUri) !== -1) {
      url = previewUrl.substring(CStudioAuthoringContext.previewAppBaseUri.length);
    }
    return url;
  },

  getInterface: function () {
    return 'audio';
  },

  getName: function () {
    return 'audio-desktop-upload';
  },

  getSupportedProperties: function () {
    return [{ label: CMgs.format(langBundle, 'repositoryPath'), name: 'repoPath', type: 'string' }];
  },

  getSupportedConstraints: function () {
    return [{ label: CMgs.format(langBundle, 'required'), name: 'required', type: 'boolean' }];
  }
});

CStudioAuthoring.Module.moduleLoaded(
  'cstudio-forms-controls-audio-desktop-upload',
  CStudioForms.Datasources.AudioDesktopUpload
);
