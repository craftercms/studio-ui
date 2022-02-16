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

CStudioForms.Controls.AutoFilename =
  CStudioForms.Controls.AutoFilename ||
  function (id, form, owner, properties, constraints) {
    var _self = this;
    this.owner = owner;
    this.owner.registerField(this);
    this.errors = [];
    this.properties = properties;
    this.constraints = constraints;
    this.inputEl = null;
    this.countEl = null;
    this.required = true;
    this.value = '_not-set';
    this.form = form;
    this.id = 'file-name';
    this.contentAsFolder = form.definition ? form.definition.contentAsFolder : null;

    return this;
  };

YAHOO.extend(CStudioForms.Controls.AutoFilename, CStudioForms.CStudioFormField, {
  getFixedId: function () {
    return 'file-name';
  },

  getLabel: function () {
    return CMgs.format(langBundle, 'autoFilename');
  },

  render: function (config, containerEl) {
    // this widget has no visual presentation
  },

  getValue: function () {
    return this.value;
  },

  setValue: function (value) {
    var filename = value;
    var changeTemplate = CStudioAuthoring.Utils.getQueryVariable(location.search, 'changeTemplate');

    if (filename == '') {
      // if value has not been set, use the item's object ID as the filename
      filename = this.form.model['objectId'] + '.xml';
    }

    this.value = filename;

    if (this.contentAsFolder == true || this.contentAsFolder == 'true') {
      this.form.updateModel('file-name', 'index.xml');
      this.form.updateModel('folder-name', this.form.model['objectId']);
    } else if (changeTemplate == 'true') {
      this.form.updateModel('file-name', this.form.model['objectId'] + '.xml');
      this.form.updateModel('folder-name', '');
    } else {
      this.form.updateModel('file-name', filename);
      this.form.updateModel('folder-name', '');
    }
  },

  getName: function () {
    return 'auto-filename';
  },

  getSupportedProperties: function () {
    return [];
  },

  getSupportedConstraints: function () {
    return [
      // required is assumed
    ];
  }
});

CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-auto-filename', CStudioForms.Controls.AutoFilename);
