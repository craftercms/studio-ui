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

CStudioForms.Datasources.FileBrowseRepo =
  CStudioForms.Datasources.FileBrowseRepo ||
  function(id, form, properties, constraints) {
    this.id = id;
    this.form = form;
    this.properties = properties;
    this.constraints = constraints;

    for (var i = 0; i < properties.length; i++) {
      if (properties[i].name == 'repoPath') {
        this.repoPath = properties[i].value;
      }
    }

    return this;
  };

YAHOO.extend(CStudioForms.Datasources.FileBrowseRepo, CStudioForms.CStudioFormDatasource, {
  add: function(control, multiple) {
    var _self = this;
    var CMgs = CStudioAuthoring.Messages;
    var langBundle = CMgs.getBundle('contentTypes', CStudioAuthoringContext.lang);

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
          ${CMgs.format(langBundle, 'browseExisting')} - ${CrafterCMSNext.util.string.escapeHTML(newElTitle)}
        </a>
      </li>`
    );

    create.find('a').on('click', function() {
      CStudioAuthoring.Operations.openBrowse('', _self.processPathsForMacros(_self.repoPath), '-1', 'select', true, {
        success: function(searchId, selectedTOs) {
          for (var i = 0; i < selectedTOs.length; i++) {
            var item = selectedTOs[i];
            var fileName = item.name;
            var fileExtension = fileName.split('.').pop();
            const returnProp = control.returnProp ? control.returnProp : 'uri';
            control.insertItem(item[returnProp], item.uri, fileExtension, null, _self.id);
            if (control._renderItems) {
              control._renderItems();
            }
          }
        },
        failure: function() {}
      });
    });

    control.$dropdownMenu.append(create);
  },

  edit: function(key) {
    var getContentItemCb = {
      success: function(contentTO) {
        var editCallback = {
          success: function() {
            // update label?
          },
          failure: function() {}
        };

        CStudioAuthoring.Operations.editContent(
          contentTO.item.contentType,
          CStudioAuthoringContext.siteId,
          contentTO.item.mimeType,
          contentTO.item.nodeRef,
          contentTO.item.uri,
          false,
          editCallback
        );
      },
      failure: function() {}
    };

    CStudioAuthoring.Service.lookupContentItem(CStudioAuthoringContext.site, key, getContentItemCb);
  },

  getLabel: function() {
    return CMgs.format(langBundle, 'fileBrowse');
  },

  getInterface: function() {
    return 'item';
  },

  getName: function() {
    return 'file-browse-repo';
  },

  getSupportedProperties: function() {
    return [
      {
        label: CMgs.format(langBundle, 'repositoryPath'),
        name: 'repoPath',
        type: 'content-path-input',
        defaultValue: '/site/',
        rootPath: '/site',
        validations: {
          regex: /^\/site(\/.*)?$/
        }
      }
    ];
  },

  getSupportedConstraints: function() {
    return [];
  }
});

CStudioAuthoring.Module.moduleLoaded(
  'cstudio-forms-controls-file-browse-repo',
  CStudioForms.Datasources.FileBrowseRepo
);
