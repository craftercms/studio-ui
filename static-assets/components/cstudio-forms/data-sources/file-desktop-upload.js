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

CStudioForms.Datasources.FileDesktopUpload =
  CStudioForms.Datasources.FileDesktopUpload ||
  function(id, form, properties, constraints) {
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
  add: function(control, multiple) {
    this._self = this;
    var me = this;

    var site = CStudioAuthoringContext.site;
    var path = this._self.repoPath;
    var isUploadOverwrite = true;

    for (var i = 0; i < this.properties.length; i++) {
      if (this.properties[i].name === 'repoPath') {
        path = this.properties[i].value;

        path = this.processPathsForMacros(path);
      }
    }

    var callback = {
      success: function(fileData) {
        if (control) {
          control.insertItem(
            path + '/' + fileData.fileName,
            path + '/' + fileData.fileName,
            fileData.fileExtension,
            fileData.size,
            me.id
          );
          if (control._renderItems) {
            control._renderItems();
          }
        }
      },

      failure: function() {
        if (control) {
          control.failure('An error occurred while uploading the file.');
        }
      },

      context: this
    };

    if (multiple) {
      var addContainerEl = null;

      if (!control.addContainerEl) {
        addContainerEl = document.createElement('div');
        addContainerEl.create = document.createElement('div');
        addContainerEl.browse = document.createElement('div');

        addContainerEl.appendChild(addContainerEl.create);
        addContainerEl.appendChild(addContainerEl.browse);
        control.containerEl.appendChild(addContainerEl);

        YAHOO.util.Dom.addClass(addContainerEl, 'cstudio-form-control-node-selector-add-container');
        YAHOO.util.Dom.addClass(addContainerEl.create, 'cstudio-form-controls-create-element');
        YAHOO.util.Dom.addClass(addContainerEl.browse, 'cstudio-form-controls-browse-element');

        control.addContainerEl = addContainerEl;
        addContainerEl.style.left = control.addButtonEl.offsetLeft + 'px';
        addContainerEl.style.top = control.addButtonEl.offsetTop + 22 + 'px';
      }

      var datasourceDef = this.form.definition.datasources,
        newElTitle = '';

      for (var x = 0; x < datasourceDef.length; x++) {
        if (datasourceDef[x].id === this.id) {
          newElTitle = datasourceDef[x].title;
        }
      }

      var createEl = document.createElement('div');
      YAHOO.util.Dom.addClass(createEl, 'cstudio-form-control-node-selector-add-container-item');
      createEl.innerHTML = 'Create New - ' + newElTitle;
      control.addContainerEl.create.appendChild(createEl);

      addContainerEl = control.addContainerEl;
      YAHOO.util.Event.on(
        createEl,
        'click',
        function() {
          control.addContainerEl = null;
          control.containerEl.removeChild(addContainerEl);

          CStudioAuthoring.Operations.uploadAsset(site, path, isUploadOverwrite, callback);
        },
        createEl
      );
    } else {
      CStudioAuthoring.Operations.uploadAsset(site, path, isUploadOverwrite, callback);
    }
  },

  edit: function(key, control) {
    this._self = this;
    var me = this;

    var site = CStudioAuthoringContext.site;
    var path = this._self.repoPath;
    var isUploadOverwrite = true;

    for (var i = 0; i < this.properties.length; i++) {
      if (this.properties[i].name === 'repoPath') {
        path = this.properties[i].value;

        path = this.processPathsForMacros(path);
      }
    }

    var callback = {
      success: function(fileData) {
        if (control) {
          control.deleteItem(key);
          control.insertItem(
            path + '/' + fileData.fileName,
            path + '/' + fileData.fileName,
            fileData.fileExtension,
            fileData.size,
            me.id
          );
          if (control._renderItems) {
            control._renderItems();
          }
        }
      },

      failure: function() {
        if (control) {
          control.failure('An error occurred while uploading the file.');
        }
      },

      context: this
    };

    CStudioAuthoring.Operations.uploadAsset(site, path, isUploadOverwrite, callback);
  },

  getLabel: function() {
    return CMgs.format(langBundle, 'fileUploadedDesktop');
  },

  getInterface: function() {
    return 'item';
  },

  getName: function() {
    return 'file-desktop-upload';
  },

  getSupportedProperties: function() {
    return [{ label: CMgs.format(langBundle, 'repositoryPath'), name: 'repoPath', type: 'string' }];
  },

  getSupportedConstraints: function() {
    return [];
  }
});

CStudioAuthoring.Module.moduleLoaded(
  'cstudio-forms-controls-file-desktop-upload',
  CStudioForms.Datasources.FileDesktopUpload
);
