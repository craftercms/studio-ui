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

CStudioForms.Datasources.CMISUpload =
  CStudioForms.Datasources.CMISUpload ||
  function(id, form, properties, constraints) {
    this.id = id;
    this.form = form;
    this.properties = properties;
    this.constraints = constraints;

    for (var i = 0; i < properties.length; i++) {
      if (properties[i].name == 'repoPath') {
        this.repoPath = properties[i].value;
      }
      if (properties[i].name === 'repositoryId') {
        this.repositoryId = properties[i].value;
      }
    }

    this.messages = {
      words: CrafterCMSNext.i18n.messages.words
    };

    return this;
  };

YAHOO.extend(CStudioForms.Datasources.CMISUpload, CStudioForms.CStudioFormDatasource, {
  itemsAreContentReferences: true,

  /**
   * action called when user clicks insert file
   */
  add: function(control, multiple) {
    (this._self = this), (me = this);

    var site = CStudioAuthoringContext.site;
    var path = this._self.repoPath;
    var isUploadOverwrite = true;

    for (var i = 0; i < this.properties.length; i++) {
      if (this.properties[i].name == 'repoPath') {
        path = this.properties[i].value;

        path = this.processPathsForMacros(path);
      }
    }

    var callback = {
      success: function(fileData) {
        if (control) {
          var item = fileData.url,
            fileName = fileData.url,
            fileExtension = fileData.fileExtension;

          control.insertItem(item, item, fileExtension, null, me.id);
          if (control._renderItems) {
            control._renderItems();
          }
          CStudioAuthoring.Utils.decreaseFormDialog();
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
        if (datasourceDef[x].id == this.id) {
          newElTitle = datasourceDef[x].title;
        }
      }

      var createEl = document.createElement('div');
      YAHOO.util.Dom.addClass(createEl, 'cstudio-form-control-node-selector-add-container-item');
      createEl.innerHTML = `${CrafterCMSNext.i18n.intl.formatMessage(me.messages.words.upload)} - ${newElTitle}`;
      control.addContainerEl.create.appendChild(createEl);

      (function(control, me) {
        var addContainerEl = control.addContainerEl;
        YAHOO.util.Event.on(
          createEl,
          'click',
          function() {
            control.addContainerEl = null;
            control.containerEl.removeChild(addContainerEl);
            CStudioAuthoring.Operations.uploadCMISAsset(site, path, me.repositoryId, callback);
          },
          createEl
        );
      })(control, me);
    } else {
      CStudioAuthoring.Operations.uploadCMISAsset(site, path, me.repositoryId, callback);
    }
  },

  getLabel: function() {
    return CMgs.format(langBundle, 'CMISUpload');
  },

  getInterface: function() {
    return 'item';
  },

  getName: function() {
    return 'CMIS-upload';
  },

  getSupportedProperties: function() {
    return [
      { label: CMgs.format(langBundle, 'repositoryPath'), name: 'repoPath', type: 'string' },
      { label: CMgs.format(langBundle, 'repositoryId'), name: 'repositoryId', type: 'string' }
    ];
  },

  getSupportedConstraints: function() {
    return [];
  }
});

CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-CMIS-upload', CStudioForms.Datasources.CMISUpload);
