/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const
  FORM_REQUEST = 'FORMS.FORM_REQUEST',
  FORM_REQUEST_FULFILMENT = 'FORMS.FORM_REQUEST_FULFILMENT',
  FORM_SAVE_REQUEST = 'FORMS.FORM_SAVE_REQUEST',
  FORM_SAVE_COMPLETE = 'FORM_SAVE_COMPLETE';

const { fromEvent, operators } = CrafterCMSNext.rxjs;
const { map, filter, take } = operators;

const messages$ = fromEvent(window, 'message').pipe(
  filter(event => event.data && event.data.type),
  map(event => event.data)
);

const sendMessage = (message) => {
  window.top.CStudioAuthoring.InContextEdit.messageDialogs(message);
};

function parseDOM(content) {
  try {
    let parseResult = new window.DOMParser().parseFromString(content, 'text/xml');
    return parseResult.documentElement;
  } catch (ex) {
    console.error(`Error attempting to parse content XML.`);
    return null;
  }
}

CStudioForms.Datasources.ItemSpecificChildContent = function (id, form, properties, constraints) {
  this.id = id;
  this.form = form;
  this.properties = properties;
  this.constraints = constraints;
  this.selectItemsCount = -1;
  this.contentType = '';
  this.flattened = true;

  for (var i = 0; i < properties.length; i++) {
    if (properties[i].name === 'contentType') {
      this.contentType = (Array.isArray(properties[i].value)) ? '' : properties[i].value;
    }
  }

  return this;
};

YAHOO.extend(CStudioForms.Datasources.ItemSpecificChildContent, CStudioForms.CStudioFormDatasource, {
  itemsAreContentReferences: true,

  createElementAction: function (control, _self, addContainerEl, onlyAppend) {
    if(onlyAppend) {
      control.addContainerEl = null;
      control.containerEl.removeChild(addContainerEl);
    }

    if (_self.contentType === "") {
      CStudioAuthoring.Operations.createNewContent(
        CStudioAuthoringContext.site,
        "",
        false, {
          success: function (formName, name, value) {
            control.insertItem(value, formName.item.internalName, null, null, _self.id);
            control._renderItems();
          },
          failure: function () {
          }
        }, true, true);
    } else {
      CStudioAuthoring.Operations.openContentWebForm(
        _self.contentType,
        null,
        null,
        "",
        false,
        false,
        {
          success: function (contentTO, editorId, name, value) {
            control.insertItem(name, value, null, null, _self.id);
            control._renderItems();
            //CStudioAuthoring.InContextEdit.unstackDialog(editorId);
          },
          failure: function () {
          }
        },
        [
          { name: "childForm", value: "true" }
        ],
        null,
        true);
    }
  },

  add: function (control, onlyAppend) {
    var CMgs = CStudioAuthoring.Messages;
    var langBundle = CMgs.getBundle("contentTypes", CStudioAuthoringContext.lang);

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
      addContainerEl = document.createElement("div");
      control.containerEl.appendChild(addContainerEl);
      YAHOO.util.Dom.addClass(addContainerEl, 'cstudio-form-control-node-selector-add-container');
      control.addContainerEl = addContainerEl;
      control.addContainerEl.style.left = control.addButtonEl.offsetLeft + "px";
      control.addContainerEl.style.top = control.addButtonEl.offsetTop + 22 + "px";
    }

    if(onlyAppend) {
      addContainerEl.create = document.createElement("div");
      addContainerEl.appendChild(addContainerEl.create);
      YAHOO.util.Dom.addClass(addContainerEl.create, 'cstudio-form-controls-create-element');

      var createEl = document.createElement("div");
      YAHOO.util.Dom.addClass(createEl, 'cstudio-form-control-node-selector-add-container-item');
      createEl.innerHTML = CMgs.format(langBundle, "createNew") + " - " + newElTitle;
      control.addContainerEl.create.appendChild(createEl);
      var addContainerEl = control.addContainerEl;
      YAHOO.util.Event.on(createEl, 'click', function () {
        _self.createElementAction(control, _self, addContainerEl, onlyAppend);
      }, createEl);
    }else {
      _self.createElementAction(control, _self);
    }
  },

  edit: function (key, control) {
    var _self = this;

    messages$.pipe(
      filter(message =>
        message.type === FORM_REQUEST_FULFILMENT &&
        message.key === key
      ),
      take(1)
    ).subscribe((message) => {
      const contentType = parseDOM(message.payload).getElementsByTagName('content-type')[0].innerHTML;
      const success = function (contentTO, editorId, name, value) {
        if (control) {
          control.updateEditedItem(value, _self.id);
        }
      }

      CStudioAuthoring.Operations.performSimpleIceEdit(
        {contentType: contentType, uri:key},
        null, // field
        true,
        { success },
        [],
        true
      );
    });

    sendMessage({ type: FORM_REQUEST, key });
  },

  getLabel: function () {
    return CMgs.format(langBundle, "itemSpecificChildContent");
  },

  getInterface: function () {
    return "item";
  },

  getName: function () {
    return "item-specific-child-content";
  },

  getSupportedProperties: function () {
    return [
      { label: CMgs.format(langBundle, "contentType"), name: "contentType", type: "string" }
    ];
  },

  getSupportedConstraints: function () {
    return [];
  }

});

CStudioAuthoring.Module.moduleLoaded("cstudio-forms-controls-item-specific-child-content", CStudioForms.Datasources.ItemSpecificChildContent);
