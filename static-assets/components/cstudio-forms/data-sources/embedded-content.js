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

CStudioForms.Datasources.EmbeddedContent = function(id, form, properties, constraints) {
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

  createElementAction: function(control, _self) {
    if (_self.contentType === '') {
      CStudioAuthoring.Operations.createNewContent(
        CStudioAuthoringContext.site,
        CStudioAuthoring.Constants.GET_ALL_CONTENT_TYPES,
        false,
        {
          success: function(contentTO, editorId, name, value) {
            control.insertItem(name, value, null, null, _self.id);
            control._renderItems();
          },
          failure: function() {}
        },
        true,
        true,
        (contentType) => contentType.type === 'component' && contentType.name !== '/component/level-descriptor'
      );
    } else {
      CStudioAuthoring.Operations.openContentWebForm(
        _self.contentType,
        null,
        null,
        '',
        false,
        false,
        {
          success: function(contentTO, editorId, name, value) {
            control.insertItem(name, value, null, null, _self.id);
            control._renderItems();
          },
          failure: function() {}
        },
        [{ name: 'childForm', value: 'true' }],
        null,
        true
      );
    }
  },

  add: function(control, onlyAppend) {
    var CMgs = CStudioAuthoring.Messages;
    var langBundle = CMgs.getBundle('contentTypes', CStudioAuthoringContext.lang);

    var _self = this;

    var datasourceDef = this.form.definition.datasources,
      newElTitle = '';

    for (var x = 0; x < datasourceDef.length; x++) {
      if (datasourceDef[x].id === this.id) {
        newElTitle = datasourceDef[x].title;
      }
    }

    if (onlyAppend) {
      const create = $(
        `<li class="cstudio-form-controls-create-element"><a class="cstudio-form-control-node-selector-add-container-item">${CMgs.format(
          langBundle,
          'createNew'
        )} - ${newElTitle}</a></li>`
      );

      control.$dropdownMenu.append(create);

      YAHOO.util.Event.on(
        create[0],
        'click',
        function() {
          _self.createElementAction(control, _self);
        },
        create[0]
      );
    } else {
      _self.createElementAction(control, _self);
    }
  },

  edit: function(key, control) {
    var _self = this;
    CStudioForms.communication.sendAndAwait(key, (message) => {
      const contentType = CStudioForms.communication.parseDOM(message.payload).querySelector('content-type').innerHTML;
      CStudioAuthoring.Operations.performSimpleIceEdit(
        { contentType: contentType, uri: key },
        null, // field
        true,
        {
          success: function(contentTO, editorId, name, value) {
            if (control) {
              control.updateEditedItem(value, _self.id);
            }
          }
        },
        [],
        true
      );
    });
  },

  getLabel: function() {
    return this.formatMessage(this.embeddedContentDSMessages.embeddedContent);
  },

  getInterface: function() {
    return 'item';
  },

  getName: function() {
    return 'embedded-content';
  },

  getSupportedProperties: function() {
    return [{ label: CMgs.format(langBundle, 'contentType'), name: 'contentType', type: 'string' }];
  },

  getSupportedConstraints: function() {
    return [];
  }
});

CStudioAuthoring.Module.moduleLoaded(
  'cstudio-forms-controls-embedded-content',
  CStudioForms.Datasources.EmbeddedContent
);
