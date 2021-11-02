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

CStudioForms.Datasources.WebDAVRepo =
  CStudioForms.Datasources.WebDAVRepo ||
  function (id, form, properties, constraints) {
    this.id = id;
    this.form = form;
    this.properties = properties;
    this.constraints = constraints;

    for (var i = 0; i < properties.length; i++) {
      if (properties[i].name === 'repoPath') {
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

YAHOO.extend(CStudioForms.Datasources.WebDAVRepo, CStudioForms.CStudioFormDatasource, {
  add: function (control, multiple) {
    var _self = this;

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
          ${CrafterCMSNext.i18n.intl.formatMessage(
            _self.messages.words.browse
          )} - ${CrafterCMSNext.util.string.escapeHTML(newElTitle)}
        </a>
      </li>`
    );

    create.find('a').on('click', function () {
      CStudioAuthoring.Operations.openWebDAVBrowse(
        _self.processPathsForMacros(_self.repoPath),
        _self.profileId,
        'select',
        true,
        {
          success: function (searchId, selectedTOs) {
            for (var i = 0; i < selectedTOs.length; i++) {
              var item = selectedTOs[i];
              var uri = item.browserUri;
              var fileName = item.internalName;
              var fileExtension = fileName.split('.').pop();

              control.insertItem(uri, uri, fileExtension, null, _self.id);
              if (control._renderItems) {
                control._renderItems();
              }
            }
          },
          failure: function () {}
        }
      );
    });

    control.$dropdownMenu.append(create);
  },

  getConfig: function (callback) {
    CStudioAuthoring.Service.getConfiguration(CStudioAuthoringContext.site, '/webdav/webdav.xml', {
      success: function (config) {
        callback(config);
      }
    });
  },

  getLabel: function () {
    return CMgs.format(langBundle, 'fileWebDavRepository');
  },

  getInterface: function () {
    return 'item';
  },

  getName: function () {
    return 'WebDAV-repo';
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

CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-WebDAV-repo', CStudioForms.Datasources.WebDAVRepo);
