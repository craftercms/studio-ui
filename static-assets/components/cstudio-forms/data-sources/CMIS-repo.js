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

CStudioForms.Datasources.CMISRepo =
  CStudioForms.Datasources.CMISRepo ||
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

    this.messages = {
      words: CrafterCMSNext.i18n.messages.words
    };

    return this;
  };

YAHOO.extend(CStudioForms.Datasources.CMISRepo, CStudioForms.CStudioFormDatasource, {
  add: function (control, multiple) {
    const _self = this;

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
          ${CrafterCMSNext.i18n.intl.formatMessage(
            _self.messages.words.browse
          )} - ${CrafterCMSNext.util.string.escapeHTML(newElTitle)}
        </a>
      </li>`
    );

    create.find('a').on('click', function () {
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
                  uri = repo['download-url-regex'].replace('{item_id}', item.itemId);
                } else {
                  uri = _self.studioPath + fileName;
                  uri = uri.startsWith('/') ? uri : '/' + uri;
                }

                control.insertItem(uri, item.browserUri, fileExtension, null, _self.id);
                if (control._renderItems) {
                  control._renderItems();
                }
              }
            };

            _self.getConfig(cb);
          },
          failure: function () {}
        }
      );
    });

    control.$dropdownMenu.append(create);
  },

  getConfig: function (callback) {
    CStudioAuthoring.Service.getConfiguration(CStudioAuthoringContext.site, '/data-sources/cmis-config.xml', {
      success: function (config) {
        callback(config.repositories.repository);
      }
    });
  },

  getLabel: function () {
    return CMgs.format(langBundle, 'CMISRepository');
  },

  getInterface: function () {
    return 'item';
  },

  getName: function () {
    return 'CMIS-repo';
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

CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-CMIS-repo', CStudioForms.Datasources.CMISRepo);
