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

CStudioForms.Datasources.S3Repo =
  CStudioForms.Datasources.S3Repo ||
  function (id, form, properties, constraints) {
    this.id = id;
    this.form = form;
    this.properties = properties;
    this.constraints = constraints;

    for (var i = 0; i < properties.length; i++) {
      if (properties[i].name === 'path') {
        this.path = properties[i].value;
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

YAHOO.extend(CStudioForms.Datasources.S3Repo, CStudioForms.CStudioFormDatasource, {
  add: function (control, multiple) {
    console.log('add repo');
    var _self = this,
      baseUrl;

    var browseCb = {
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
      createEl.innerHTML = `${CrafterCMSNext.i18n.intl.formatMessage(
        _self.messages.words.browse
      )} - ${newElTitle}`;
      control.addContainerEl.create.appendChild(createEl);

      var addContainerEl = control.addContainerEl;
      YAHOO.util.Event.on(
        createEl,
        'click',
        function () {
          control.addContainerEl = null;
          control.containerEl.removeChild(addContainerEl);
          CStudioAuthoring.Operations.openS3Browse(
            _self.profileId,
            _self.processPathsForMacros(_self.path),
            'select',
            true,
            browseCb
          );
        },
        createEl
      );
    } else {
      CStudioAuthoring.Operations.openS3Browse(
        _self.profileId,
        _self.processPathsForMacros(_self.path),
        'select',
        true,
        browseCb
      );
    }
  },

  getLabel: function () {
    return CMgs.format(langBundle, 'fileS3Repository');
  },

  getInterface: function () {
    return 'item';
  },

  getName: function () {
    return 'S3-repo';
  },

  getSupportedProperties: function () {
    return [
      { label: CMgs.format(langBundle, 'repositoryPath'), name: 'path', type: 'string' },
      { label: CMgs.format(langBundle, 'profileId'), name: 'profileId', type: 'string' }
    ];
  },

  getSupportedConstraints: function () {
    return [];
  }
});

CStudioAuthoring.Module.moduleLoaded(
  'cstudio-forms-controls-S3-repo',
  CStudioForms.Datasources.S3Repo
);
