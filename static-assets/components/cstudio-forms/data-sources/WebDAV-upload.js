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

CStudioForms.Datasources.WebDAVUpload =
  CStudioForms.Datasources.WebDAVUpload ||
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

    this.messages = {
      words: CrafterCMSNext.i18n.messages.words
    };

    return this;
  };

YAHOO.extend(CStudioForms.Datasources.WebDAVUpload, CStudioForms.CStudioFormDatasource, {
  itemsAreContentReferences: true,

  /**
   * action called when user clicks insert file
   */
  add: function (control, multiple) {
    var me = this;

    var site = CStudioAuthoringContext.site;
    var path = this.repoPath;

    for (var i = 0; i < this.properties.length; i++) {
      if (this.properties[i].name === 'repoPath') {
        path = this.properties[i].value;
        path = this.processPathsForMacros(path);
      }
    }

    var datasourceDef = this.form.definition.datasources,
      newElTitle = '';

    for (var x = 0; x < datasourceDef.length; x++) {
      if (datasourceDef[x].id == this.id) {
        newElTitle = datasourceDef[x].title;
      }
    }

    const create = $(
      `<li class="cstudio-form-controls-create-element">
        <a class="cstudio-form-control-node-selector-add-container-item">
          ${CrafterCMSNext.i18n.intl.formatMessage(me.messages.words.upload)} - ${CrafterCMSNext.util.string.escapeHTML(
        newElTitle
      )}
        </a>
      </li>`
    );

    create.find('a').on('click', function () {
      CStudioAuthoring.Operations.uploadWebDAVAsset(site, path, me.profileId, {
        success: function (fileData) {
          if (control) {
            var item = fileData,
              fileName = item,
              fileExtension = fileName.split('.').pop();

            control.insertItem(item, item, fileExtension, null, me.id);
            if (control._renderItems) {
              control._renderItems();
            }
            CStudioAuthoring.Utils.decreaseFormDialog();
          }
        },
        failure: function () {
          if (control) {
            control.failure('An error occurred while uploading the file.');
          }
        },
        context: this
      });
    });

    control.$dropdownMenu.append(create);
  },

  getLabel: function () {
    return CMgs.format(langBundle, 'fileUploadedWebDavRepository');
  },

  getInterface: function () {
    return 'item';
  },

  getName: function () {
    return 'WebDAV-upload';
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

CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-WebDAV-upload', CStudioForms.Datasources.WebDAVUpload);
