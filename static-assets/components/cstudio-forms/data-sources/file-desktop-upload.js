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

CStudioForms.Datasources.FileDesktopUpload =
  CStudioForms.Datasources.FileDesktopUpload ||
  function (id, form, properties, constraints) {
    this.id = id;
    this.form = form;
    this.properties = properties;
    this.constraints = constraints;

    for (var i = 0; i < properties.length; i++) {
      if (properties[i].name === 'repoPath') {
        this.repoPath = properties[i].value;
      }
    }

    return this;
  };

YAHOO.extend(CStudioForms.Datasources.FileDesktopUpload, CStudioForms.CStudioFormDatasource, {
  itemsAreContentReferences: true,

  /**
   * action called when user clicks insert file
   */
  add: function (control, multiple) {
    this._self = this;
    var me = this;

    var site = CStudioAuthoringContext.site;
    var path = this._self.repoPath;
    var isUploadOverwrite = true;
    var CMgs = CStudioAuthoring.Messages;
    var langBundle = CMgs.getBundle('contentTypes', CStudioAuthoringContext.lang);

    for (var i = 0; i < this.properties.length; i++) {
      if (this.properties[i].name === 'repoPath') {
        path = this.properties[i].value;

        path = this.processPathsForMacros(path);
      }
    }

    var datasourceDef = this.form.definition.datasources,
      newElTitle = '';

    for (var x = 0; x < datasourceDef.length; x++) {
      if (datasourceDef[x].id === this.id) {
        newElTitle = datasourceDef[x].title;
      }
    }

    const create = $(
      `<li class="cstudio-form-controls-create-element">
        <a class="cstudio-form-control-node-selector-add-container-item">
          ${CMgs.format(langBundle, 'createNew')} - ${CrafterCMSNext.util.string.escapeHTML(newElTitle)}
        </a>
      </li>`
    );

    const showUploadAsset = () => {
      CStudioAuthoring.Operations.uploadAsset(site, path, isUploadOverwrite, {
        success: function (fileData) {
          if (control) {
            const fileUrl = CrafterCMSNext.util.string.ensureSingleSlash(`${path}/${fileData.fileName}`);
            control.insertItem(fileUrl, fileUrl, fileData.fileExtension, fileData.size, me.id);
            if (control._renderItems) {
              control._renderItems();
            }
          }
        },
        failure: function () {
          if (control) {
            control.failure('An error occurred while uploading the file.');
          }
        },
        context: this
      });
    };
    create.find('a').on('click', showUploadAsset);

    if (control.$dropdownMenu) {
      control.$dropdownMenu.append(create);
    } else {
      showUploadAsset();
    }
  },

  edit: function (key, control) {
    CStudioAuthoring.Service.lookupContentItem(CStudioAuthoringContext.site, key, {
      success: function (contentTO) {
        CStudioAuthoring.Operations.editContent(
          contentTO.item.contentType,
          CStudioAuthoringContext.siteId,
          contentTO.item.mimeType,
          contentTO.item.nodeRef,
          contentTO.item.uri,
          false
        );
      }
    });
  },

  getLabel: function () {
    return CMgs.format(langBundle, 'fileUploadedDesktop');
  },

  getInterface: function () {
    return 'item';
  },

  getName: function () {
    return 'file-desktop-upload';
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
    return [];
  }
});

CStudioAuthoring.Module.moduleLoaded(
  'cstudio-forms-controls-file-desktop-upload',
  CStudioForms.Datasources.FileDesktopUpload
);
