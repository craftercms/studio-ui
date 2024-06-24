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

CStudioAdminConsole.Tool.ContentTypes.PropertyType.Template =
  CStudioAdminConsole.Tool.ContentTypes.PropertyType.Template ||
  function (fieldName, containerEl, currentContenType) {
    this.fieldName = fieldName;
    this.containerEl = containerEl;
    this.currentContenType = currentContenType;
    return this;
  };

YAHOO.extend(
  CStudioAdminConsole.Tool.ContentTypes.PropertyType.Template,
  CStudioAdminConsole.Tool.ContentTypes.PropertyType,
  {
    render: function (value, updateFn) {
      var _self = this;
      var containerEl = this.containerEl;
      var valueEl = document.createElement('input');
      YAHOO.util.Dom.addClass(valueEl, 'content-type-property-sheet-property-value');
      containerEl.appendChild(valueEl);
      valueEl.value = value;
      valueEl.fieldName = this.fieldName;
      this.updateFn = updateFn;

      // don't let the user type anything
      YAHOO.util.Event.on(
        valueEl,
        'keydown',
        function (evt) {
          YAHOO.util.Event.stopEvent(evt);
        },
        valueEl
      );

      YAHOO.util.Event.on(
        valueEl,
        'focus',
        function (evt) {
          _self.showTemplateEdit();
        },
        valueEl
      );

      if (updateFn) {
        var updateFieldFn = function (event, el) {};

        YAHOO.util.Event.on(valueEl, 'change', updateFieldFn, valueEl);
      }

      this.valueEl = valueEl;
    },

    getValue: function () {
      return this.valueEl.value;
    },

    showTemplateEdit: function () {
      var _self = this;
      if (this.controlsContainerEl) {
        this.controlsContainerEl.style.display = 'inline';
        this.valueEl.size;
      } else {
        var controlsContainerEl = document.createElement('div');
        YAHOO.util.Dom.addClass(controlsContainerEl, 'options');

        var editEl = document.createElement('div');
        YAHOO.util.Dom.addClass(editEl, 'edit fa fa-pencil f18');

        var pickEl = document.createElement('div');
        YAHOO.util.Dom.addClass(pickEl, 'pick fa fa-search f18');

        controlsContainerEl.appendChild(editEl);
        controlsContainerEl.appendChild(pickEl);

        this.containerEl.appendChild(controlsContainerEl);

        this.controlsContainerEl = controlsContainerEl;

        editEl.onclick = function () {
          const path = _self.valueEl.value;
          const contentType = _self.currentContenType.contentType;
          const customEventId = 'createFileDialogEventId';

          if (path === '') {
            CrafterCMSNext.system.store.dispatch({
              type: 'SHOW_CREATE_FILE_DIALOG',
              payload: {
                path: '/templates/web',
                type: 'template',
                onCreated: {
                  type: 'BATCH_ACTIONS',
                  payload: [
                    {
                      type: 'DISPATCH_DOM_EVENT',
                      payload: { id: customEventId, type: 'onCreated' }
                    },
                    { type: 'CLOSE_CREATE_FILE_DIALOG' }
                  ]
                },
                onClosed: {
                  type: 'BATCH_ACTIONS',
                  payload: [
                    {
                      type: 'DISPATCH_DOM_EVENT',
                      payload: { id: customEventId, type: 'onClosed' }
                    },
                    { type: 'CREATE_FILE_DIALOG_CLOSED' }
                  ]
                }
              }
            });

            CrafterCMSNext.createLegacyCallbackListener(customEventId, (response) => {
              const { openOnSuccess, fileName, path, type } = response;
              if (type === 'onCreated') {
                const templatePath = craftercms.utils.string.ensureSingleSlash(`${path}/${fileName}`);
                _self.valueEl.value = templatePath;
                _self.value = templatePath;
                _self.updateFn(null, _self.valueEl);
                if (openOnSuccess) {
                  CStudioAuthoring.Operations.openCodeEditor({ path: templatePath, contentType, mode: 'ftl' });
                }
              }
            });
          } else {
            const customEventId = 'editTemplateCreateSuccess';
            CrafterCMSNext.system.store.dispatch({
              type: 'EDIT_CONTENT_TYPE_TEMPLATE',
              payload: {
                contentTypeId: contentType
              }
            });

            CrafterCMSNext.createLegacyCallbackListener(customEventId, (response) => {
              const { path, fileName } = response;
              const templatePath = craftercms.utils.string.ensureSingleSlash(`${path}/${fileName}`);
              _self.valueEl.value = templatePath;
              _self.value = templatePath;
              _self.updateFn(null, _self.valueEl);
            });
          }
        };

        pickEl.onclick = function () {
          CStudioAuthoring.Operations.openBrowseFilesDialog({
            path: '/templates/web',
            onSuccess: ({ path }) => {
              _self.valueEl.value = path;
              _self.value = path;
              _self.updateFn(null, _self.valueEl);
            }
          });
        };
      }
    },

    hideTemplateEdit: function () {
      if (this.controlsContainerEl) {
        this.controlsContainerEl.style.display = 'none';
      }
    }
  }
);

CStudioAuthoring.Module.moduleLoaded(
  'cstudio-console-tools-content-types-proptype-template',
  CStudioAdminConsole.Tool.ContentTypes.PropertyType.Template
);
