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

CStudioForms.Datasources.EmbeddedContent = function (id, form, properties, constraints) {
  this.id = id;
  this.form = form;
  this.properties = properties;
  this.constraints = constraints;
  this.selectItemsCount = -1;
  this.contentType = '';
  this.flattened = true;
  const i18n = CrafterCMSNext.i18n;
  (this.formatMessage = i18n.intl.formatMessage),
    (this.embeddedContentDSMessages = i18n.messages.embeddedContentDSMessages);

  for (var i = 0; i < properties.length; i++) {
    if (properties[i].name === 'contentType') {
      this.contentType = Array.isArray(properties[i].value) ? '' : properties[i].value;
    }
  }

  return this;
};

YAHOO.extend(CStudioForms.Datasources.EmbeddedContent, CStudioForms.CStudioFormDatasource, {
  itemsAreContentReferences: true,

  createElementAction: function (control, _self, addContainerEl, onlyAppend) {
    if (onlyAppend) {
      control.addContainerEl = null;
      control.containerEl.removeChild(addContainerEl);
    }

    if (_self.contentType === '') {
      CStudioAuthoring.Operations.createNewContent(
        CStudioAuthoringContext.site,
        CStudioAuthoring.Constants.GET_ALL_CONTENT_TYPES,
        false,
        {
          success: function (contentTO, editorId, name, value) {
            control.insertItem(name, value, null, null, _self.id);
            control._renderItems();
          },
          failure: function () {}
        },
        true,
        true,
        (contentType) => contentType.type === 'component' && contentType.name !== '/component/level-descriptor'
      );
    } else {
      let parentPath = _self.form.path;
      CStudioAuthoring.Operations.openContentWebForm(
        _self.contentType,
        null,
        null,
        '',
        false,
        false,
        {
          success: function (contentTO, editorId, name, value) {
            control.insertItem(name, value, null, null, _self.id);
            control._renderItems();
          },
          failure: function () {}
        },
        [
          { name: 'childForm', value: 'true' },
          { name: 'parentPath', value: parentPath }
        ],
        null,
        true
      );
    }
  },

  add: function (control, onlyAppend) {
    var CMgs = CStudioAuthoring.Messages;
    var langBundle = CMgs.getBundle('contentTypes', CStudioAuthoringContext.lang);

    var _self = this;
    var addContainerEl = control.addContainerEl || null;

    var datasourceDef = this.form.definition.datasources,
      newElTitle = '';

    for (var x = 0; x < datasourceDef.length; x++) {
      if (datasourceDef[x].id === this.id) {
        newElTitle = datasourceDef[x].title;
      }
    }

    if (!addContainerEl && onlyAppend) {
      addContainerEl = document.createElement('div');
      control.containerEl.appendChild(addContainerEl);
      YAHOO.util.Dom.addClass(addContainerEl, 'cstudio-form-control-node-selector-add-container');
      control.addContainerEl = addContainerEl;
      control.addContainerEl.style.left = control.addButtonEl.offsetLeft + 'px';
      control.addContainerEl.style.top = control.addButtonEl.offsetTop + 22 + 'px';
    }

    if (onlyAppend) {
      addContainerEl.create = document.createElement('div');
      addContainerEl.appendChild(addContainerEl.create);
      YAHOO.util.Dom.addClass(addContainerEl.create, 'cstudio-form-controls-create-element');

      var createEl = document.createElement('div');
      YAHOO.util.Dom.addClass(createEl, 'cstudio-form-control-node-selector-add-container-item');
      createEl.innerHTML = CMgs.format(langBundle, 'createNew') + ' - ' + newElTitle;
      control.addContainerEl.create.appendChild(createEl);
      var addContainerEl = control.addContainerEl;
      YAHOO.util.Event.on(
        createEl,
        'click',
        function () {
          _self.createElementAction(control, _self, addContainerEl, onlyAppend);
        },
        createEl
      );
    } else {
      _self.createElementAction(control, _self);
    }
  },

  edit: function (key, control) {
    var _self = this;
    const readonly = control.readonly;
    CStudioForms.communication.sendAndAwait(key, (message) => {
      const contentType = CStudioForms.communication.parseDOM(message.payload).querySelector('content-type').innerHTML;
      // If current component is embedded too, it'll have a parentPath url param (the path of the shared component
      // containing it), so we use that one.
      const parentPathParam = CStudioAuthoring.Utils.getQueryParameterByName('parentPath');
      const parentPath = parentPathParam !== '' ? parentPathParam : _self.form.path;
      const auxParams = [
        { name: 'childForm', value: 'true' },
        { name: 'parentPath', value: parentPath }
      ];

      if (readonly) {
        auxParams.push({ name: 'readonly' });
      }

      CStudioAuthoring.Operations.performSimpleIceEdit(
        { contentType: contentType, uri: key },
        null, // field
        true,
        {
          success: function (contentTO, editorId, name, value) {
            if (control) {
              control.updateEditedItem(value, _self.id);
            }
          }
        },
        auxParams,
        true
      );
    });
  },

  getLabel: function () {
    return this.formatMessage(this.embeddedContentDSMessages.embeddedContent);
  },

  getInterface: function () {
    return 'item';
  },

  getName: function () {
    return 'embedded-content';
  },

  getSupportedProperties: function () {
    return [{ label: CMgs.format(langBundle, 'contentType'), name: 'contentType', type: 'string' }];
  },

  getSupportedConstraints: function () {
    return [];
  }
});

CStudioAuthoring.Module.moduleLoaded(
  'cstudio-forms-controls-embedded-content',
  CStudioForms.Datasources.EmbeddedContent
);
