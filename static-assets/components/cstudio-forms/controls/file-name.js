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

CStudioForms.Controls.FileName =
  CStudioForms.Controls.FileName ||
  function(id, form, owner, properties, constraints, readonly) {
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
    this.readonly = readonly;
    this.defaultValue = '';
    this.showWarnOnEdit = true;
    this.messages = {
      fileNameControlMessages: CrafterCMSNext.i18n.messages.fileNameControlMessages
    };

    return this;
  };

YAHOO.extend(CStudioForms.Controls.FileName, CStudioForms.CStudioFormField, {
  getFixedId: function() {
    return 'file-name';
  },

  getLabel: function() {
    return CMgs.format(langBundle, 'fileName');
  },

  getRequirementCount: function() {
    //2 Requirement:
    // 1. The field is required
    // 2. The Path must be valid
    return 2;
  },

  getCurrentPath: function() {
    return this.form.path ? this.form.path : CStudioAuthoring.Utils.getQueryVariable(location.search, 'path');
  },

  isRootPath: function() {
    if (this.getCurrentPath() == '/site/website/index.xml') return true;
    return false;
  },

  _onChange: function(evt, obj) {
    var oldValue = obj.value;
    obj.value = obj.inputEl.value;
    if (obj.value != '' && oldValue != obj.value)
      //Just check if the value was changed
      obj.filenameAvailable();

    if (obj.required) {
      if (obj.inputEl.value == '' && !obj.isRootPath()) {
        obj.setError('required', 'Field is Required');
        obj.renderValidation(true, false);
      } else {
        obj.clearError('required');
        obj.renderValidation(true, true);
      }
    } else {
      obj.renderValidation(false, true);
    }

    obj.owner.notifyValidation();

    if (obj.contentAsFolder == true || obj.contentAsFolder == 'true') {
      obj.form.updateModel('file-name', 'index.xml');
      obj.form.updateModel('folder-name', obj.inputEl.value);
    } else {
      obj.form.updateModel('file-name', obj.inputEl.value + '.xml');
      obj.form.updateModel('folder-name', '');
    }
  },

  _onChangeVal: function(evt, obj) {
    obj.edited = true;
    obj._onChange(evt, obj);
  },

  /**
   * perform count calculation on keypress
   * @param evt event
   * @param el element
   */
  count: function(evt, countEl, el) {
    // 'this' is the input box
    el = el ? el : this;
    var text = el.value;

    var charCount = text.length ? text.length : el.textLength ? el.textLength : 0;
    var maxlength = el.maxlength && el.maxlength != '' ? el.maxlength : -1;

    if (maxlength != -1) {
      if (charCount > el.maxlength) {
        // truncate if exceeds max chars
        if (charCount > el.maxlength) {
          this.value = text.substr(0, el.maxlength);
          charCount = el.maxlength;
        }

        if (
          evt &&
          evt != null &&
          evt.keyCode != 8 &&
          evt.keyCode != 46 &&
          evt.keyCode != 37 &&
          evt.keyCode != 38 &&
          evt.keyCode != 39 &&
          evt.keyCode != 40 && // arrow keys
          evt.keyCode != 88 &&
          evt.keyCode != 86
        ) {
          // allow backspace and
          // delete key and arrow keys (37-40)
          // 86 -ctrl-v, 90-ctrl-z,
          if (evt) YAHOO.util.Event.stopEvent(evt);
        }
      }
    }

    if (maxlength != -1) {
      countEl.innerHTML = charCount + ' / ' + el.maxlength;
    } else {
      countEl.innerHTML = charCount;
    }
  },

  /**
   * don't allow characters which are invalid for file names and check length
   */
  processKey: function(evt, el) {
    var invalid = new RegExp('[.!@#$%^&*\\(\\)\\+=\\[\\]\\\\\\\'`;,\\/\\{\\}|":<>\\?~ ]', 'g');
    //Prevent the use of non english characters
    var nonEnglishChar = new RegExp('[^\x00-\x80]', 'g');
    var cursorPosition = el.selectionStart;
    //change url to lower case
    if (el.value != '' && el.value != el.value.toLowerCase()) {
      el.value = el.value.toLowerCase();
      if (cursorPosition && typeof cursorPosition == 'number') {
        el.selectionStart = cursorPosition;
        el.selectionEnd = cursorPosition;
      }
    }
    var data = el.value;

    if (invalid.exec(data) != null) {
      el.value = data.replace(invalid, '-');
      YAHOO.util.Event.stopEvent(evt);
    }

    if (nonEnglishChar.exec(data) != null) {
      el.value = data.replace(nonEnglishChar, '-');
      YAHOO.util.Event.stopEvent(evt);
    }

    var maxlength = el.maxlength && el.maxlength != '' ? el.maxlength : -1;

    if (maxlength != -1 && data.length > maxlength) {
      data = data.substr(0, maxlength);
      el.value = data;
    }
  },

  /**
   * check availability on mouse out
   */
  filenameAvailable: function() {
    var newPath = '';
    var path = this.getCurrentPath();

    if (this.contentAsFolder == true || this.contentAsFolder == 'true') {
      newPath = this._getPath() + '/' + this.value + '/index.xml';
    } else {
      newPath = this._getPath() + '/' + this.value + '.xml';
    }

    newPath = newPath.replace('//', '/');

    var checkCb = {
      exists: function(exists) {
        if (exists == true) {
          this.obj.setError('exists', 'Path exists already');
          this.obj.renderValidation(true, false);
          YAHOO.util.Dom.addClass(this.obj.urlErrEl, 'on');
        } else {
          this.obj.clearError('exists');
          this.obj.renderValidation(true, true);
          YAHOO.util.Dom.removeClass(this.obj.urlErrEl, 'on');
        }
      },
      failure: function() {
        this.availableEl.style.display = 'none';
        this.availableEl.innerHTML = '';
      },
      obj: this
    };

    if (path != '' && path != newPath) {
      CStudioAuthoring.Service.contentExists(newPath, checkCb);
    } else {
      YAHOO.util.Dom.removeClass(this.urlErrEl, 'on');
      this.clearError('exists');
      this.renderValidation(true, true);
    }
  },

  render: function(config, containerEl) {
    // we need to make the general layout of a control inherit from common
    // you should be able to override it -- but most of the time it wil be the same
    containerEl.id = this.id;

    const self = this;

    var titleEl = document.createElement('span');

    YAHOO.util.Dom.addClass(titleEl, 'cstudio-form-field-title');
    titleEl.textContent = config.title;

    var controlWidgetContainerEl = document.createElement('div');
    YAHOO.util.Dom.addClass(controlWidgetContainerEl, 'cstudio-form-control-file-name-container');

    var validEl = document.createElement('span');
    YAHOO.util.Dom.addClass(validEl, 'validation-hint');
    YAHOO.util.Dom.addClass(validEl, 'cstudio-form-control-validation fa fa-check');

    var path = this._getPath();
    path = path.replace(/^\/site\/website/, ''); //From Pages
    if (path.match(/^\/site\/components\//)) path = path.replace(/^\/site/, ''); // From Components
    path = path + '/';
    path = path.replace('//', '/');

    var pathEl = document.createElement('span');
    YAHOO.util.Dom.addClass(pathEl, 'input-path');
    pathEl.innerHTML = path + ' ';

    var inputContainer = document.createElement('div');
    YAHOO.util.Dom.addClass(inputContainer, 'cstudio-form-control-input-container no-wrap input-wrapper');
    inputContainer.appendChild(pathEl);
    this.inputContainer = inputContainer;
    controlWidgetContainerEl.appendChild(inputContainer);

    var inputEl = document.createElement('input');
    this.inputEl = inputEl;
    YAHOO.util.Dom.addClass(inputEl, 'datum');
    YAHOO.util.Dom.addClass(inputEl, 'cstudio-form-control-input');
    YAHOO.util.Dom.addClass(inputEl, 'cstudio-form-control-file-name');
    inputEl.id = 'studioFileName';
    inputContainer.appendChild(inputEl);

    this.defaultValue = config.defaultValue;

    var Event = YAHOO.util.Event,
      me = this;
    Event.on(
      inputEl,
      'click',
      function(evt, context) {
        context.form.setFocusedField(context);
      },
      this
    );
    Event.on(
      inputEl,
      'focus',
      function() {
        YAHOO.util.Dom.addClass(inputContainer, 'focused');
      },
      this
    );
    Event.on(inputEl, 'change', this._onChangeVal, this);
    Event.on(
      inputEl,
      'blur',
      function(evt, obj) {
        YAHOO.util.Dom.removeClass(inputContainer, 'focused');
        self._onChange(evt, obj);
      },
      this
    );
    Event.on(inputEl, 'keyup', this.processKey, inputEl);
    Event.on(
      inputEl,
      'paste',
      function(evt, el) {
        setTimeout(function() {
          me.processKey(evt, el);
        }, 100);
      },
      inputEl
    );

    for (var i = 0; i < config.properties.length; i++) {
      var prop = config.properties[i];
      if (prop.name == 'size') {
        inputEl.size = prop.value;
      } else if (prop.name == 'maxlength') {
        inputEl.maxlength = prop.value;
      }

      if (prop.name == 'readonly' && prop.value == 'true') {
        this.readonly = true;
      }
    }

    if (this.isRootPath() || this.readonly == true) {
      inputEl.disabled = true;
    }

    var urlErrEl = document.createElement('div');
    urlErrEl.innerHTML = 'URL is NOT available';
    YAHOO.util.Dom.addClass(urlErrEl, 'cstudio-form-control-input-url-err');
    controlWidgetContainerEl.appendChild(urlErrEl);
    this.urlErrEl = urlErrEl;

    var countEl = document.createElement('div');
    YAHOO.util.Dom.addClass(countEl, 'char-count');
    YAHOO.util.Dom.addClass(countEl, 'cstudio-form-control-input-count');
    controlWidgetContainerEl.appendChild(countEl);
    this.countEl = countEl;

    YAHOO.util.Event.on(inputEl, 'keyup', this.count, countEl);
    YAHOO.util.Event.on(inputEl, 'mouseup', this.count, countEl);

    this.renderHelp(config, controlWidgetContainerEl);

    var descriptionEl = document.createElement('span');
    YAHOO.util.Dom.addClass(descriptionEl, 'description');
    YAHOO.util.Dom.addClass(descriptionEl, 'cstudio-form-field-description');
    descriptionEl.textContent = config.description;

    containerEl.appendChild(titleEl);
    containerEl.appendChild(validEl);
    this._renderEdit(containerEl);
    containerEl.appendChild(controlWidgetContainerEl);
    containerEl.appendChild(descriptionEl);
  },

  _renderEdit: function(containerEl) {
    var _self = this;
    if (CStudioAuthoring.Utils.getQueryVariable(location.search, 'edit') && this.readonly == false) {
      var editFileNameEl = document.createElement('div');
      YAHOO.util.Dom.addClass(editFileNameEl, 'cstudio-form-control-filename-edit');
      var editFileNameBtn = document.createElement('input');
      editFileNameBtn.type = 'button';
      editFileNameBtn.value = 'Edit';
      YAHOO.util.Dom.addClass(editFileNameBtn, 'cstudio-button');
      editFileNameEl.appendChild(editFileNameBtn);
      containerEl.appendChild(editFileNameEl);

      this.inputEl.disabled = true;
      YAHOO.util.Dom.addClass(this.inputContainer, 'disabled');

      var createWarningDialog = function() {
        var dialog = new YAHOO.widget.SimpleDialog('changeNameWar', {
          width: '440px',
          fixedcenter: true,
          visible: false,
          draggable: false,
          close: true,
          modal: true,
          icon: YAHOO.widget.SimpleDialog.ICON_WARN,
          constraintoviewport: true
        });

        var viewDependenciesLink = document.createElement('a');
        viewDependenciesLink.innerHTML = 'here';
        viewDependenciesLink.onclick = function() {
          window.parent.CStudioAuthoring.Operations.viewDependencies(
            window.parent.CStudioAuthoringContext.site,
            window.parent.CStudioAuthoring.SelectedContent.getSelectedContent(),
            false,
            'depends-on-me'
          );
        };

        dialog.setHeader('Warning');
        dialog.setBody(
          CrafterCMSNext.i18n.intl.formatMessage(_self.messages.fileNameControlMessages.urlChangeWaring) +
            '</br></br>' +
            CrafterCMSNext.i18n.intl.formatMessage(_self.messages.fileNameControlMessages.viewReferences)
        );
        dialog.body.insertBefore(viewDependenciesLink, dialog.body.lastChild);

        var myButtons = [
          {
            text: 'Cancel',
            isDefault: true,
            handler: function() {
              this.destroy();
              $(document).off('CloseFormWithChangesUserWarningDialogShown', onEscape);
            }
          },
          {
            text: 'OK',
            handler: function() {
              _self.inputEl.disabled = false;
              YAHOO.util.Dom.removeClass(_self.inputContainer, 'disabled');
              _self.inputEl.focus();
              editFileNameEl.style.display = 'none';
              this.destroy();
              $(document).off('CloseFormWithChangesUserWarningDialogShown', onEscape);
            }
          }
        ];

        dialog.cfg.queueProperty('buttons', myButtons);
        dialog.render(document.body);
        dialog.show();

        function onEscape(e) {
          dialog.destroy();
          $(document).off('CloseFormWithChangesUserWarningDialogShown', onEscape);
        }

        $(document).on('CloseFormWithChangesUserWarningDialogShown', onEscape);
      };

      YAHOO.util.Event.on(editFileNameBtn, 'click', function() {
        _self.form.setFocusedField(_self);
        if (_self.showWarnOnEdit) {
          createWarningDialog();
        }
      });
    }
  },

  getValue: function() {
    return this.value;
  },

  setValue: function(value) {
    var path = this.getCurrentPath();
    if (value == '') {
      this.value = this.defaultValue;
      this.inputEl.value = this.defaultValue;
    } else {
      this.value = value;
      this.inputEl.value = this._getValue();
      if (this.inputEl.value == '' && !this.isRootPath() && this.defaultValue != '') {
        this.value = this.defaultValue;
        this.inputEl.value = this.defaultValue;
      }
    }
    this.count(null, this.countEl, this.inputEl);
    this._onChange(null, this);
    this.edited = false;
  },

  _getValue: function() {
    var value = '';
    var path = this.getCurrentPath();
    path = path.replace('/site/website', '');

    if (path.indexOf('.xml') != -1) {
      if (path.indexOf('/index.xml') != -1) {
        path = path.replace('/index.xml', '');

        var value = path.substring(path.lastIndexOf('/'));
        path = path.replace(value, '');

        if (path == '') {
          path = '/';
        }

        value = value.substring(1);
      } else {
        value = path.substring(path.lastIndexOf('/') + 1).replace('.xml', '');
      }
    } else {
      value = '';
    }

    return value;
  },

  _getPath: function() {
    var path = this.getCurrentPath();
    var hasXmlFile = path.indexOf('.xml') >= 0;

    if (this.contentAsFolder == true || '/component/level-descriptor' === this.form.id) {
      path = path.replace('/index.xml', '');
    }

    if (hasXmlFile) {
      var trimmedPath = path.substring(0, path.lastIndexOf('/'));
      if (trimmedPath != '/site') {
        path = trimmedPath;
      }
    }

    return path;
  },

  getName: function() {
    return 'file-name';
  },

  getSupportedProperties: function() {
    return [
      { label: CMgs.format(langBundle, 'size'), name: 'size', type: 'int', defaultValue: '50' },
      {
        label: CMgs.format(langBundle, 'maxLength'),
        name: 'maxlength',
        type: 'int',
        defaultValue: '50'
      },
      { label: CMgs.format(langBundle, 'readonly'), name: 'readonly', type: 'boolean' }
    ];
  },

  getSupportedConstraints: function() {
    return [
      // required is assumed
    ];
  }
});

CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-file-name', CStudioForms.Controls.FileName);
