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

CStudioForms.Datasources.AudioBrowseRepo =
  CStudioForms.Datasources.AudioBrowseRepo ||
  function (id, form, properties, constraints) {
    this.id = id;
    this.form = form;
    this.properties = properties;
    this.constraints = constraints;
    this.selectItemsCount = -1;
    this.useSearch = false;

    for (var i = 0; i < properties.length; i++) {
      if (properties[i].name == 'repoPath') {
        this.repoPath = properties[i].value;
      } else if (properties[i].name === 'useSearch') {
        this.useSearch = properties[i].value === 'true';
      }
    }

    return this;
  };

YAHOO.extend(CStudioForms.Datasources.AudioBrowseRepo, CStudioForms.CStudioFormDatasource, {
  insertAudioAction: function (callback) {
    const _self = this;

    if (this.useSearch) {
      const searchContext = {
        keywords: '',
        filters: {
          'mime-type': ['audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav']
        },
        sortBy: 'internalName',
        sortOrder: 'asc',
        mode: 'select' // open search not in default but in select mode
      };

      if (this.repoPath) {
        searchContext.path = this.repoPath.endsWith('/') ? `${this.repoPath}.+` : `${this.repoPath}/.+`;
      }

      CStudioAuthoring.Operations.openSearch(
        searchContext,
        true,
        {
          success(searchId, selectedTOs) {
            const path = selectedTOs[0].path;
            const url = this.context.createPreviewUrl(path);
            const audioData = {
              previewUrl: url,
              relativeUrl: path,
              fileExtension: path.substring(path.lastIndexOf('.') + 1)
            };
            callback.success(audioData);
          },
          failure() {},
          context: _self
        },
        null
      );
    } else {
      const multiSelect = _self.selectItemsCount === -1 || _self.selectItemsCount > 1;
      CStudioAuthoring.Operations.openBrowseFilesDialog({
        path: _self.processPathsForMacros(_self.repoPath),
        multiSelect,
        onSuccess: (result) => {
          const items = Array.isArray(result) ? result : [result];
          items.forEach(({ path }) => {
            const url = CStudioAuthoringContext.previewAppBaseUri + path;
            const videoData = {
              previewUrl: url,
              relativeUrl: path,
              fileExtension: url.substring(url.lastIndexOf('.') + 1)
            };
            callback.success(videoData);
          });
        }
      });
    }
  },

  /**
   * create preview URL
   */
  createPreviewUrl(audioPath) {
    return `${CStudioAuthoringContext.previewAppBaseUri}${audioPath}`;
  },

  getLabel: function () {
    // TODO: i18n
    return 'Audio From Repository';
  },

  getInterface: function () {
    return 'audio';
  },

  getName: function () {
    return 'audio-browse-repo';
  },

  getSupportedProperties: function () {
    return [
      { label: CMgs.format(langBundle, 'repositoryPath'), name: 'repoPath', type: 'string' },
      {
        label: CMgs.format(langBundle, 'useSearch'),
        name: 'useSearch',
        type: 'boolean',
        defaultValue: 'false'
      }
    ];
  },

  getSupportedConstraints: function () {
    return [{ label: CMgs.format(langBundle, 'required'), name: 'required', type: 'boolean' }];
  }
});

CStudioAuthoring.Module.moduleLoaded(
  'cstudio-forms-controls-audio-browse-repo',
  CStudioForms.Datasources.AudioBrowseRepo
);
