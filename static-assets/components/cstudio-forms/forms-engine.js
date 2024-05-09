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

var openerChildformMgr;
var parentWindowLocation;
var CStudioRemote = {};

try {
  if (window.opener) {
    openerChildformMgr = window.opener.CStudioAuthoring.ChildFormManager;
    parentWindowLocation = window.opener.location.href;
  } else {
    openerChildformMgr = window.CStudioAuthoring.ChildFormManager;
    parentWindowLocation = window.location.href;
  }
} catch (err) {
  openerChildformMgr = window.CStudioAuthoring.ChildFormManager;
  parentWindowLocation = window.location.href;
}

var getFormSize = function (id) {
  var formSize;

  if (document.getElementsByClassName('studio-ice-container-' + id).length > 0) {
    formSize = document.getElementsByClassName('studio-ice-container-' + id)[0].offsetHeight;
  } else {
    formSize = parent.document.getElementsByClassName('studio-ice-container-' + id)[0].offsetHeight;
  }

  return formSize;
};

var setFormSize = function (height, id) {
  var form;

  if (document.getElementsByClassName('studio-ice-container-' + id).length) {
    form = document.getElementsByClassName('studio-ice-container-' + id)[0];
  } else {
    form = parent.document.getElementsByClassName('studio-ice-container-' + id)[0];
  }

  form.style.height = height + 'px';
};

var CStudioForms =
  CStudioForms ||
  (function () {
    var cfe = {};

    var CMgs = CStudioAuthoring.Messages;
    var formsLangBundle = CMgs.getBundle('forms', CStudioAuthoringContext.lang);
    var repeatEdited = false;
    var saveDraft = false;
    var lastDraft = false;
    var pluginError = {};
    pluginError.control = [];
    pluginError.datasource = [];
    // lookup to check the controls with default values
    const defaultValuesLookup = {};
    // lookup to check the fields that have the `no-default` attribute set
    let noDefaultLookup = {};
    let disableClose = false;

    // This sets the dropup class to bootstrap dropdowns (used to display datasources selected for controls) when
    // there's no space below to fit the dropdown.
    $(document)
      .on('shown.bs.dropdown', '.dropdown', function () {
        // calculate the required sizes, spaces
        const $ul = $(this).children('.dropdown-menu');
        const $button = $(this).children('.dropdown-toggle');
        const ulOffset = $ul.offset();
        // how much space would be left on the top if the dropdown opened that direction
        const spaceUp = ulOffset.top - $button.height() - $ul.height() - $(window).scrollTop();
        // how much space is left at the bottom
        const spaceDown = $(window).scrollTop() + $(window).height() - (ulOffset.top + $ul.height());
        // switch to dropup only if there is no space at the bottom AND there is space at the top, or there isn't either but it would be still better fit
        if (spaceDown < 0 && (spaceUp >= 0 || spaceUp > spaceDown)) $(this).addClass('dropup');
      })
      .on('hidden.bs.dropdown', '.dropdown', function () {
        // always reset after close
        $(this).removeClass('dropup');
      });

    // private methods

    /**
     * A data source provides data and services to fields
     */
    var CStudioFormDatasource = function (id, form, properties) {
      this.id = id;
      this.form = form;
      this.properties = properties;
      return this;
    };

    CStudioFormDatasource.prototype = {
      /**
       * type of data returned by datasource
       */
      getInterface: function () {
        return '';
      },

      /**
       * unique type for datasource
       */
      getType: function () {
        return '';
      },

      /**
       * return the name unless overwritten
       */
      getLabel: function () {
        return this.getName();
      },

      /**
       * unique id for datasource
       */
      getName: function () {
        return '';
      },

      /**
       * datasource properties
       */
      getSupportedProperties: function () {
        return [];
      },

      /**
       * handle macros in file paths
       */
      processPathsForMacros: function (path) {
        var model = this.form.model;

        return CStudioAuthoring.Operations.processPathsForMacros(path, model);
      }
    };

    /**
     * Field controller
     * The purpose of this class is to allow implementation specific rules to be implemented
     */
    var FormController = function () {
      return this;
    };

    FormController.prototype = {
      /**
       * initialize controller
       */
      initialize: function (form) {
        this.form = form;
      },

      /**
       * allows you to do any data manipulation or custom validation rules you want
       * return true to go forward with save.  Return false to stop the save
       */
      onBeforeSave: function () {
        return true;
      },

      /**
       * called by for each field on a form. By returning true the field will be included in the form.
       */
      isFieldRelevant: function (field) {
        return true;
      }
    };

    /**
     * Field base class
     */
    var CStudioFormField = function (id, form, owner, properties, constraints) {
      this.owner = owner;
      this.owner.registerField(this);
      this.errors = [];
      this.properties = properties;
      this.constraints = constraints;
      this.inputEl = null;
      this.countEl = null;
      this.required = false;
      this.value = '_not-set';
      this.form = form;
      this.id = id;
      this.delayedInit = false;

      return this;
    };

    CStudioFormField.prototype = {
      getFixedId: function () {
        return '';
      },

      focusOut: function () {},

      focusIn: function () {},

      renderValidation: function (onOff) {
        var valid = true;

        for (let key in this.errors) {
          valid = false;
          break;
        }

        var validationEl = YAHOO.util.Dom.getElementsByClassName(
          'cstudio-form-control-validation',
          null,
          this.containerEl
        )[0];

        if (validationEl) {
          YAHOO.util.Dom.removeClass(validationEl, 'cstudio-form-control-valid');
          YAHOO.util.Dom.removeClass(validationEl, 'fa-check');
          YAHOO.util.Dom.removeClass(validationEl, 'cstudio-form-control-invalid');
          YAHOO.util.Dom.removeClass(validationEl, 'fa-times');

          if (onOff == true) {
            if (valid == true) {
              YAHOO.util.Dom.addClass(validationEl, 'cstudio-form-control-valid fa-check');
            } else {
              YAHOO.util.Dom.addClass(validationEl, 'cstudio-form-control-invalid fa-times');
            }
          }
        }
      },

      /**
       * factory method
       */
      create: function () {},

      /**
       * get requirement count
       */
      getRequirementCount: function () {
        var count = 0;

        for (var i = 0; i < this.constraints.length; i++) {
          var constraint = this.constraints[i];

          if (constraint.name == 'required' && constraint.value == 'true') {
            count++;
          }
        }

        return count;
      },

      /**
       * register validation error
       */
      setError: function (errorId, message) {
        this.errors[errorId] = message;
        this.owner.notifyValidation();
      },

      /**
       * remove a specific error
       */
      clearError: function (errorId) {
        delete this.errors[errorId];
        this.owner.notifyValidation();
      },

      /**
       * remove all errors
       */
      clearAllErrors: function () {
        this.errors = [];
        this.owner.notifyValidation();
      },

      /**
       * return errors
       */
      getErrors: function () {
        return this.errors;
      },

      /**
       * initialize module
       */
      initialize: function (config, containerEl, lastTwo) {
        this.containerEl = containerEl;

        for (var j = 0; j < config.constraints.length; j++) {
          var constraint = config.constraints[j];

          if (constraint.name == 'required' && constraint.value == 'true') {
            this.required = true;
          }
        }

        this.render(config, containerEl, lastTwo, false);

        if (this.delayedInit) {
          if (this.form.asyncFields == 0) {
            var ajaxOverlayEl = document.getElementById('ajax-overlay');
            YDom.addClass(ajaxOverlayEl, 'visible');
          }
          this.form.asyncFields++;
        }

        return this;
      },

      /**
       * render
       */
      render: function (config, containerEl) {
        containerEl.innerHTML = 'Widget';
        containerEl.style.color = 'white';
        containerEl.style.border = '1px solid black';
        containerEl.style.backgroundColor = '#0176B1';
        containerEl.style.width = '400px';
        containerEl.style.marginLeft = 'auto';
        containerEl.style.marginRight = 'auto';
        containerEl.style.textAlign = 'center';
      },

      _onChange: function () {},

      getLabel: function () {
        return this.getName();
      },

      getName: function () {
        return '';
      },

      getValue: function () {
        return '';
      },

      setValue: function (value) {},

      getSupportedProperties: function () {
        return [];
      },

      renderHelp: function (config, containerEl) {
        if (!Array.isArray(config.help) && config.help !== '') {
          var helpEl = document.createElement('span');
          YAHOO.util.Dom.addClass(helpEl, 'hint');
          YAHOO.util.Dom.addClass(helpEl, 'cstudio-form-field-help');
          helpEl.innerHTML = '&nbsp;';
          $(containerEl).prepend(helpEl);

          YAHOO.util.Event.on(
            helpEl,
            'mouseover',
            function (evt, context) {
              YAHOO.util.Dom.addClass(helpEl, 'on');
            },
            this
          );

          YAHOO.util.Event.on(
            helpEl,
            'mouseout',
            function (evt, context) {
              YAHOO.util.Dom.removeClass(helpEl, 'on');
            },
            this
          );

          YAHOO.util.Event.on(
            helpEl,
            'click',
            function (evt, context) {
              var helpDialogEl = document.getElementById('help-dialog');
              if (!helpDialogEl) {
                helpDialogEl = document.createElement('div');
                helpDialogEl.id = 'help-dialog';
                YAHOO.util.Dom.addClass(helpDialogEl, 'seethrough');
                document.body.appendChild(helpDialogEl);
              }

              var maskEl = document.createElement('div');
              YAHOO.util.Dom.addClass(maskEl, 'dialog-dialog-mask');
              maskEl.style.display = 'block';
              maskEl.id = 'dialogMask';
              document.body.appendChild(maskEl);

              helpDialogEl.style.display = 'block';
              helpDialogEl.innerHTML = '';

              var titleEl = document.createElement('div');
              YAHOO.util.Dom.addClass(titleEl, 'dialog-title');
              titleEl.innerHTML = 'Help';
              helpDialogEl.appendChild(titleEl);

              var helpDialogContainerEl = document.createElement('div');
              YAHOO.util.Dom.addClass(helpDialogContainerEl, 'dialog-body');
              helpDialogEl.appendChild(helpDialogContainerEl);

              helpDialogContainerEl.innerHTML = config.help;

              var buttonContainerEl = document.createElement('div');
              YAHOO.util.Dom.addClass(buttonContainerEl, 'dialog-button-bar');
              helpDialogEl.appendChild(buttonContainerEl);

              var okEl = document.createElement('div');
              YAHOO.util.Dom.addClass(okEl, 'btn btn-primary');
              okEl.innerHTML = 'OK';
              buttonContainerEl.appendChild(okEl);

              YAHOO.util.Event.on(
                okEl,
                'click',
                function (evt) {
                  var helpDialogEl = document.getElementById('help-dialog');
                  var dialogMask = document.getElementById('dialogMask');
                  helpDialogEl.parentNode.removeChild(helpDialogEl);
                  dialogMask.parentNode.removeChild(dialogMask);
                },
                okEl
              );
            },
            this
          );
        }
      },

      escapeXml: function (value) {
        if (value && typeof value === 'string') {
          value = value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/&nbsp;/g, '&amp;nbsp;');
        }

        return value;
      },

      unEscapeXml: function (value) {
        if (value && typeof value === 'string') {
          value = value
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&amp;nbsp;/g, '&nbsp;');
        }

        return value;
      }
    };

    /**
     * Section base class
     */
    var CStudioFormSection = function (owner, containerEl, iceWindowCallback) {
      this.fields = [];
      this.owner = owner;
      this.containerEl = containerEl;
      this.iceWindowCallback = iceWindowCallback;
      return this;
    };

    CStudioFormSection.prototype = {
      /**
       * register field with section
       */
      registerField: function (field) {
        this.fields[this.fields.length] = field;
      },

      /**
       * get validation state
       */
      getValidationState: function () {
        var requirements = 0;
        var invalid = 0;

        for (var i = 0; i < this.fields.length; i++) {
          var field = this.fields[i];
          requirements += field.getRequirementCount();

          var errors = field.getErrors();
          var errsize = 0,
            key;
          for (key in errors) {
            if (errors.hasOwnProperty(key)) invalid++;
          }
        }

        return { requirements: requirements, invalid: invalid };
      },

      getValidationStateDraft: function () {
        var requirements = 0;
        var invalid = 0;

        for (var i = 0; i < this.fields.length; i++) {
          var field = this.fields[i];

          if (['file-name', 'internal-name'].includes(field.id)) {
            requirements += field.getRequirementCount();

            var errors = field.getErrors();
            var errsize = 0,
              key;
            for (key in errors) {
              if (errors.hasOwnProperty(key)) invalid++;
            }
          }
        }

        return { requirements: requirements, invalid: invalid };
      },

      notifyValidation: function () {
        var validationEl = YAHOO.util.Dom.getElementsByClassName(
          'cstudio-form-section-validation',
          null,
          this.containerEl
        )[0];
        var indicatorEl = YAHOO.util.Dom.getElementsByClassName(
          'cstudio-form-section-indicator',
          null,
          this.containerEl
        )[0];

        var state = this.getValidationState();

        if (indicatorEl) {
          YAHOO.util.Dom.removeClass(indicatorEl, 'cstudio-form-section-valid');
          YAHOO.util.Dom.removeClass(indicatorEl, 'fa-check');
          YAHOO.util.Dom.removeClass(indicatorEl, 'cstudio-form-section-invalid');
          YAHOO.util.Dom.removeClass(indicatorEl, 'fa-times');

          if (state.requirements > 0 && state.invalid != 0) {
            validationEl.innerHTML = CMgs.format(
              formsLangBundle,
              'sectionValidation',
              state.invalid,
              state.requirements
            );

            YAHOO.util.Dom.addClass(indicatorEl, 'cstudio-form-section-invalid');
            YAHOO.util.Dom.addClass(indicatorEl, 'fa-times');
          } else {
            validationEl.innerHTML = '';
            YAHOO.util.Dom.addClass(indicatorEl, 'cstudio-form-section-valid');
            YAHOO.util.Dom.addClass(indicatorEl, 'fa-check');
          }
        }
      }
    };

    /**
     * form base class
     */
    var CStudioForm = function (name, formDefinition, model, style, customController) {
      this.id = name;
      this.style = style;
      this.definition = formDefinition;
      this.dynamicFields = [];
      this.sections = [];
      this.datasources = [];
      this.model = model;
      this.beforeSaveCallbacks = [];
      this.afterSaveCallbacks = [];
      this.beforeUiRefreshCallbacks = [];
      this.customController = customController;
      this.asyncFields = 0; // Number of asynchronous fields (fields that take a while to load -e.g. the RTE)

      if (customController) {
        customController.initialize(this);
      }

      // Retrieve additional fields set in controls.
      const _self = this;
      const processSection = function (section) {
        section.fields.forEach((field) => {
          if (field.type !== 'repeat') {
            if (field.additionalFields) {
              const additionalFieldsArray =
                typeof field.additionalFields.id === 'string' ? [field.additionalFields.id] : field.additionalFields.id;
              _self.dynamicFields.push(...additionalFieldsArray);
            }
          } else {
            processSection(field);
          }
        });
      };
      formDefinition.sections.forEach((section) => processSection(section));

      return this;
    };

    CStudioForm.prototype = {
      registerDynamicField: function (name) {
        if (!this.dynamicFields.includes(name)) {
          this.dynamicFields.push(name);
        }
      },

      registerBeforeSaveCallback: function (callback) {
        this.beforeSaveCallbacks[this.beforeSaveCallbacks.length] = callback;
      },

      registerAfterSaveCallback: function (callback) {
        this.afterSaveCallbacks[this.afterSaveCallbacks.length] = callback;
      },

      registerBeforeUiRefreshCallback: function (callback) {
        this.beforeUiRefreshCallbacks[this.beforeUiRefreshCallbacks.length] = callback;
      },

      isInError: function () {
        var inError = false;

        for (var i = 0; i < this.sections.length; i++) {
          if (this.sections[i].getValidationState().invalid > 0) {
            inError = true;
            break;
          }
        }

        return inError;
      },

      isInErrorDraft: function () {
        var inError = false;

        for (var i = 0; i < this.sections.length; i++) {
          if (this.sections[i].getValidationStateDraft().invalid > 0) {
            inError = true;
            break;
          }
        }

        return inError;
      },

      getModelValue: function (id) {
        var value = null;
        if (id.indexOf('|') != -1) {
          var parts = id.split('|');
          var repeatGroup = parts[0];
          var repeatIndex = parseInt(parts[1]);
          var repeatField = parts[2];

          if (
            this.model[repeatGroup].length > 0 &&
            (this.model[repeatGroup][repeatIndex] != null || this.model[repeatGroup][repeatIndex] != undefined)
          ) {
            value = this.model[repeatGroup][repeatIndex][repeatField];
          } else {
            this.model[repeatGroup][repeatIndex][repeatField] = value;
          }
        } else {
          value = this.model[id];
        }

        return value;
      },

      updateModel: function (id, value, remote) {
        let formField = null;

        this.sections.forEach((section) => {
          let field = section.fields.find((field) => field.id === id);
          if (field) {
            formField = field;
          }
        });

        if (formField && formField.edited) {
          var editorId = CStudioAuthoring.Utils.getQueryVariable(location.search, 'editorId');
          var iceWindowCallback = CStudioAuthoring.InContextEdit.getIceCallback(editorId);
          if (iceWindowCallback?.pendingChanges) {
            let callback = getCustomCallback(iceWindowCallback.pendingChanges);
            callback();
          }
        }

        if (id.indexOf('|') != -1) {
          var parts = id.split('|');
          var repeatGroup = parts[0];
          var repeatIndex = parseInt(parts[1]);
          var repeatField = parts[2];

          try {
            this.model[repeatGroup][repeatIndex][repeatField] = value;
          } catch (err) {}
        } else {
          this.model[id] = value;
        }

        if (remote) {
          CStudioRemote[id] = remote;
        } else {
          if (CStudioRemote[id]) {
            delete CStudioRemote[id];
          }
        }

        CStudioForms.updatedModel = this.model;
      },

      onBeforeSave: function (paramObj) {
        var callbacks = this.beforeSaveCallbacks;
        for (var i = 0; i < callbacks.length; i++) {
          var callback = callbacks[i];
          callback.beforeSave(paramObj);
        }
      },

      onBeforeUiRefresh: function () {
        var callbacks = this.beforeUiRefreshCallbacks;
        for (var i = 0; i < callbacks.length; i++) {
          var callback = callbacks[i];
          callback.beforeUiRefresh();
        }
      },

      onAfterSave: function () {
        var callbacks = this.afterSaveCallbacks;
        for (var i = 0; i < callbacks.length; i++) {
          var callback = callbacks[i];
          callback.afterSave();
        }
      },

      setFocusedField: function (field) {
        var previousFocusedField = this.focusedField;
        this.focusedField = field;

        if ((previousFocusedField && previousFocusedField !== field) || field == null)
          if (previousFocusedField && previousFocusedField.focusOut) {
            previousFocusedField.focusOut();
          }

        if (field) {
          if (this.focusedField.focusIn) {
            this.focusedField.focusIn();
          }
        } else {
          this.focusedField = null;
        }
      }
    };

    const FORM_REQUEST = 'FORMS.FORM_REQUEST',
      FORM_REQUEST_FULFILMENT = 'FORMS.FORM_REQUEST_FULFILMENT',
      FORM_SAVE_REQUEST = 'FORMS.FORM_SAVE_REQUEST',
      FORM_UPDATE_REQUEST = 'FORMS.FORM_UPDATE_REQUEST',
      OPEN_CHILD_COMPONENT = 'OPEN_CHILD_COMPONENT',
      CHILD_FORM_DRAFT_COMPLETE = 'CHILD_FORM_DRAFT_COMPLETE',
      FORM_ENGINE_RENDER_COMPLETE = 'FORM_ENGINE_RENDER_COMPLETE',
      FORM_CANCEL_REQUEST = 'FORM_CANCEL_REQUEST',
      FORM_CANCEL = 'FORM_CANCEL',
      LEGACY_FORM_DIALOG_CANCEL_REQUEST = 'LEGACY_FORM_DIALOG_CANCEL_REQUEST',
      CHILD_FORM_SUCCESS = 'CHILD_FORM_SUCCESS';

    const { fromEvent, map, filter, take } = CrafterCMSNext.rxjs;
    const FlattenerState = {};
    const i18n = CrafterCMSNext.i18n;
    const formatMessage = i18n.intl.formatMessage;
    const formEngineMessages = i18n.messages.formEngineMessages;
    const words = i18n.messages.words;

    const messages$ = fromEvent(window, 'message').pipe(
      filter((event) => event.data && event.data.type),
      map((event) => event.data)
    );

    const getCustomCallback = (callback) => {
      if (typeof callback === 'string') {
        let type = callback;
        return function () {
          getTopLegacyWindow().top.postMessage({ type }, '*');
        };
      } else {
        return callback;
      }
    };

    const getCustomsCallbacks = (callback) => {
      let processedCallbacks = {};
      Object.keys(callback).forEach((cb) => {
        processedCallbacks[cb] = getCustomCallback(callback[cb]);
      });
      return processedCallbacks;
    };

    const sendMessage = (message) => {
      getTopLegacyWindow().CStudioAuthoring.InContextEdit.messageDialogs(message);
    };

    function parseDOM(content) {
      let parseResult = new window.DOMParser().parseFromString(content, 'text/xml');

      if (isParseError(parseResult)) {
        throw new Error('Error attempting to parse content XML.');
      }
      return parseResult.documentElement;
    }

    function isParseError(parsedDocument) {
      var parser = new DOMParser(),
        errorneousParse = parser.parseFromString('<', 'application/xml'),
        parsererrorNS = errorneousParse.getElementsByTagName('parsererror')[0].namespaceURI;

      if (parsererrorNS === 'http://www.w3.org/1999/xhtml') {
        return parsedDocument.getElementsByTagName('parsererror').length > 0;
      }

      return parsedDocument.getElementsByTagNameNS(parsererrorNS, 'parsererror').length > 0;
    }

    function sendAndAwait(key, observer) {
      messages$
        .pipe(
          filter((message) => message.type === FORM_REQUEST_FULFILMENT && message.key === key),
          take(1)
        )
        .subscribe(observer);
      sendMessage({ type: FORM_REQUEST, key });
    }

    function setButtonsEnabled(enabled) {
      if (enabled === undefined) {
        enabled = true;
      }
      disableClose = !enabled;
      const cancelBtnEl = document.getElementById('cancelBtn');
      if (cancelBtnEl) cancelBtnEl.disabled = !enabled;

      const payload = {
        type: enabled ? 'EMBEDDED_LEGACY_FORM_SAVE_END' : 'EMBEDDED_LEGACY_FORM_SAVE_START'
      };

      window.postMessage(payload, '*');
      window.top.postMessage(payload, '*');
    }

    function resolvePendingComponents(doc) {
      doc.querySelectorAll('component:not([processed])').forEach((component) => {
        const src = parseDOM(FlattenerState[component.getAttribute('id')]);
        component.innerHTML = src.innerHTML;
        component.setAttribute('processed', 'true');
      });
      if (doc.querySelectorAll('component:not([processed])').length) {
        return resolvePendingComponents(doc);
      } else {
        doc.querySelectorAll('component[processed]').forEach((item) => {
          item.removeAttribute('processed');
        });
        return doc.outerHTML;
      }
    }

    // public methods

    cfe.Controls = {};
    cfe.Datasources = {};
    cfe.Forms = [];
    cfe.CStudioFormField = CStudioFormField;
    cfe.CStudioFormSection = CStudioFormSection;
    cfe.CStudioForm = CStudioForm;
    cfe.FormControllers = {};
    cfe.FormController = FormController;
    cfe.CStudioFormDatasource = CStudioFormDatasource;
    cfe.engine = {};
    cfe.communication = {
      messages$,
      sendMessage,
      parseDOM,
      sendAndAwait
    };

    /**
     * Form Rendering Engine
     */
    cfe.engine = {
      config: ((search) => ({
        formId: CStudioAuthoring.Utils.getQueryVariable(search, 'form'),
        readonly: CStudioAuthoring.Utils.getQueryVariable(search, 'readonly') === 'true',
        path: CStudioAuthoring.Utils.getQueryVariable(search, 'path'),
        isInclude: CStudioAuthoring.Utils.getQueryVariable(search, 'isInclude') === 'true',
        isEdit: CStudioAuthoring.Utils.getQueryVariable(search, 'edit'),
        iceId: CStudioAuthoring.Utils.getQueryVariable(search, 'iceId'),
        iceComponent: CStudioAuthoring.Utils.getQueryVariable(search, 'iceComponent'),
        changeTemplate: CStudioAuthoring.Utils.getQueryVariable(search, 'changeTemplate'),
        editorId: CStudioAuthoring.Utils.getQueryVariable(search, 'editorId'),
        wid: CStudioAuthoring.Utils.getQueryVariable(search, 'wid')
      }))(location.search),

      /**
       * Main entry point for the forms engine, renders
       * a form in the given style.
       */
      render: function (_, style) {
        var _self = this;

        if (style !== 'default') {
          // forms-default.css is loaded on the FTL.
          CStudioAuthoring.Utils.addCss('/static-assets/themes/cstudioTheme/css/forms-' + style + '.css');
        }

        let { formId, path, isInclude, readonly, isEdit } = this.config;

        // Check if "includes" may have flattened components within. In that case,
        // the post message subscription should be initialized for them too.
        if (!isInclude) {
          messages$.subscribe((message) => {
            switch (message.type) {
              case FORM_REQUEST: {
                if (message.key) {
                  if (FlattenerState.hasOwnProperty(message.key)) {
                    sendMessage({
                      key: message.key,
                      type: FORM_REQUEST_FULFILMENT,
                      payload: FlattenerState[message.key]
                    });
                  } else {
                    console.warn(`FormEngine Flattener: The include \`component[key="${message.key}"]\` wasn't found.`);
                  }
                }
                break;
              }
              case FORM_UPDATE_REQUEST: {
                // Update the DOM for subsequent content request messages.
                const nextComponentDOM = parseDOM(message.payload);
                const objectId = nextComponentDOM.querySelector('objectId').innerHTML;
                nextComponentDOM.setAttribute('id', objectId);
                FlattenerState[objectId] = nextComponentDOM.outerHTML;
                const name = nextComponentDOM.querySelector('internal-name').innerHTML;
                if (message.draft) {
                  if (message.edit) {
                    amplify.publish('UPDATE_NODE_SELECTOR', { objId: objectId, value: name });
                    cfe.engine.saveForm(false, message.draft, false, message.action);
                  } else {
                    CStudioAuthoring.InContextEdit.getIceCallback(message.editorId).success(
                      {},
                      message.editorId,
                      objectId,
                      name,
                      message.draft,
                      message.action
                    );
                    if (!CStudioAuthoring.InContextEdit.getIceCallback(message.editorId).type) {
                      cfe.engine.saveForm(false, message.draft, false, message.action);
                    }
                  }
                } else if (CStudioAuthoring.InContextEdit.unstackDialog(message.editorId)) {
                  CStudioAuthoring.InContextEdit.getIceCallback(message.editorId).success(
                    {},
                    message.editorId,
                    objectId,
                    name,
                    message.draft,
                    message.action
                  );
                }
                break;
              }
              case FORM_SAVE_REQUEST: {
                if (message.new) {
                  amplify.publish('UPDATE_NODE_SELECTOR_NEW', {
                    key: message.key,
                    value: message.value,
                    selectorId: message.selectorId,
                    ds: message.ds,
                    order: message.order
                  });
                  cfe.engine.saveForm(false, message.draft, false, message.action);
                } else {
                  amplify.publish('UPDATE_NODE_SELECTOR', message);
                  cfe.engine.saveForm(false, message.draft, true, message.action);
                }
                break;
              }
              case FORM_CANCEL_REQUEST: {
                cfe.engine.cancelForm();
                break;
              }
              case LEGACY_FORM_DIALOG_CANCEL_REQUEST: {
                const dialog = CStudioAuthoring.InContextEdit.getDialog(cfe.engine.config.editorId);
                const dialogs = CStudioAuthoring.InContextEdit.getDialogs();
                if (dialog.stackNumber === dialogs.length) {
                  cfe.engine.cancelForm();
                }
                break;
              }
              case CHILD_FORM_SUCCESS: {
                const { editorId, action } = message.payload;
                const isParent = CStudioAuthoring.InContextEdit.getIceCallback(_self.config.editorId).isParent;
                switch (action) {
                  case 'save': {
                    break;
                  }
                  case 'saveAndMinimize': {
                    if (isParent) {
                      CStudioAuthoring.InContextEdit.getIceCallback(_self.config.editorId).minimize();
                    }
                    break;
                  }
                  case 'saveAndClose': {
                    if (editorId === _self.config.editorId) {
                      CStudioAuthoring.InContextEdit.unstackDialog(editorId);
                    }
                    break;
                  }
                }
                break;
              }
            }
          });
        } else {
          messages$.subscribe((message) => {
            if (message.type === CHILD_FORM_DRAFT_COMPLETE) {
              setButtonsEnabled(true);
            } else if (message.type === LEGACY_FORM_DIALOG_CANCEL_REQUEST) {
              const dialog = CStudioAuthoring.InContextEdit.getDialog(cfe.engine.config.editorId);
              const dialogs = CStudioAuthoring.InContextEdit.getDialogs();
              if (dialog.stackNumber === dialogs.length) {
                cfe.engine.cancelForm();
              }
            }
          });
        }

        const getInitialConfiguration = () => {
          Promise.all([
            new Promise((resolve) => {
              CStudioForms.Util.loadFormDefinition(formId, { success: resolve });
            }),
            new Promise((resolve) => {
              CStudioForms.Util.LoadFormConfig(formId, {
                success: (ctrlCls, formConfig) =>
                  resolve({
                    ctrlCls,
                    formConfig
                  })
              });
            }),
            new Promise((resolve) => {
              path.includes('.xml')
                ? CStudioAuthoring.Service.lookupContentItem(
                    CStudioAuthoringContext.site,
                    path,
                    { success: resolve },
                    false
                  )
                : resolve(null);
            }),
            new Promise((resolve) => {
              CStudioAuthoring.Service.lookupContentType(CStudioAuthoringContext.site, formId, { success: resolve });
            }),
            new Promise((resolve) => {
              if (isEdit) {
                if (isInclude) {
                  sendAndAwait(path, (message) => {
                    resolve(message.payload);
                  });
                } else {
                  CStudioAuthoring.Service.getContent(path, false, { success: resolve });
                }
              } else {
                resolve(null);
              }
            })
          ])
            .then(([formDefinition, { ctrlCls, formConfig }, model, contentType, content]) => {
              const formDef = Object.assign({}, formDefinition, {
                config: formConfig,
                contentAsFolder: contentType.contentAsFolder
              });

              if (model && model.item.lockOwner !== '' && model.item.lockOwner !== CStudioAuthoringContext.user) {
                readonly = true;
              }

              if (!readonly && !isInclude && isEdit) {
                // Lock file
                CStudioAuthoring.Service.getContent(path, true, { success: () => void null });
              }

              let dom = content
                ? parseDOM(content)
                : {
                    children: [],
                    responseXML: { documentElement: { children: [] } }
                  };

              if (!isInclude && content) {
                CStudioForms.Util.createFlattenerState(dom);
              }

              _self._renderFormWithContent(dom, formId, formDef, style, ctrlCls, readonly);
            })
            .catch((reason) => {
              console.error(reason);
              CStudioAuthoring.InContextEdit.getIceCallback(cfe.engine.config.editorId).renderFailed &&
                CStudioAuthoring.InContextEdit.getIceCallback(cfe.engine.config.editorId).renderFailed(reason);
              CStudioAuthoring.Operations.showSimpleDialog(
                'loadContentError-dialog',
                CStudioAuthoring.Operations.simpleDialogTypeINFO,
                CMgs.format(formsLangBundle, 'notification'),
                CMgs.format(formsLangBundle, 'errFailedToLoadContent'),
                null,
                YAHOO.widget.SimpleDialog.ICON_BLOCK,
                'studioDialog'
              );
            });
        };

        CrafterCMSNext.system.getStore().subscribe(() => {
          getInitialConfiguration();
        });
      },

      _getPageLocation: function (path) {
        var pathStr = path.replace(/^\/site\/website\//, ''); // Remove string "/site/website/" from path(Page)
        if (pathStr.match(/^\/site\/components\//)) pathStr = pathStr.replace(/^\/site\//, ''); // Remove string "/site/" from path (Component)
        pathStr = pathStr.replace(/\/index\.xml$/, ''); // Remove string /index.xml from path
        pathStr = pathStr.replace(/\.xml$/, ''); // Remove string .xml
        return pathStr.replace(/\//g, ' » '); // Replace forward slash (/) with " >> "
      },

      _createDialog: function () {
        var dialog = new YAHOO.widget.SimpleDialog('closeUserWarning', {
          width: '300px',
          fixedcenter: true,
          visible: false,
          draggable: false,
          close: false,
          modal: true,
          text: message,
          icon: YAHOO.widget.SimpleDialog.ICON_WARN,
          constraintoviewport: true
        });
        dialog.setHeader(CMgs.format(formsLangBundle, 'cancelDialogHeader'));
        dialog.render(document.body);
        dialogEl = document.getElementById('closeUserWarning');
        dialogEl.dialog = dialog;
      },

      _getPageName: function (content) {
        var _content = content.responseXML ? content.responseXML : content;
        if (_content) {
          try {
            return _content?.querySelector?.(':scope > internal-name').textContent;
          } catch (err) {
            console.error(err);
            return '';
          }
        }
        return '';
      },

      _renderFormWithContent: function (content, formId, formDef, style, customControllerClass, readOnly) {
        var me = this;

        function getDateTimeObject(timeObj) {
          return {
            date: timeObj.getUTCMonth() + 1 + '/' + timeObj.getUTCDate() + '/' + timeObj.getUTCFullYear(),
            time: timeObj.getUTCHours() + ':' + timeObj.getUTCMinutes() + ':' + timeObj.getUTCSeconds()
          };
        }

        var closeAjaxOverlay = function () {
          if (form.asyncFields == 0) {
            // Form can now be safely manipulated
            var ajaxOverlayEl = document.getElementById('ajax-overlay');
            YDom.replaceClass(ajaxOverlayEl, 'visible', 'invisible');
          }
        };
        var readonly =
          readOnly || CStudioAuthoring.Utils.getQueryVariable(location.search, 'readonly') == 'true' ? true : false;
        var contentType = CStudioAuthoring.Utils.getQueryVariable(location.search, 'form');
        var path = CStudioAuthoring.Utils.getQueryVariable(location.search, 'path');
        var edit = CStudioAuthoring.Utils.getQueryVariable(location.search, 'edit');
        var editorId = CStudioAuthoring.Utils.getQueryVariable(location.search, 'editorId');
        var iceWindowCallback = CStudioAuthoring.InContextEdit.getIceCallback(editorId);
        try {
          if (window.opener) {
            window.previewTargetWindowId = window.opener.previewTargetWindowId
              ? window.opener.previewTargetWindowId
              : window.opener.name;
          }
        } catch (err) {}

        //path in include items is the object id
        if (me.config.isInclude && me.config.isEdit) {
          let filename = content.querySelector(':scope > file-name').innerHTML;
          path = `/${filename}`;
        }

        var contentDom = content;
        var contentMap = CStudioForms.Util.xmlModelToMap(contentDom);
        CStudioForms.Util.initAttributeObject(contentDom, 'remote');

        var customController = null;

        if (customControllerClass) {
          customController = new customControllerClass();
        }

        var form = new CStudioForm(formId, formDef, contentMap, style, customController);

        CStudioForms.initialModel = JSON.parse(JSON.stringify(form.model));

        form.readOnly = readonly;
        form.path = path;

        var timezone = 'GMT';

        CStudioAuthoring.Service.lookupConfigurtion(CStudioAuthoringContext.site, '/site-config.xml', {
          failure: crafter.noop,
          success: function (config) {
            timezone = config.locale?.dateTimeFormatOptions?.timeZone ?? 'EST5EDT';
          }
        });

        // Timestamp in UTC
        var nowTimestamp = new Date().toISOString();

        /*
         * register before save callback for created date and modified date
         * internal form properties
         */
        form.registerBeforeSaveCallback({
          beforeSave: function () {
            var oModel = form.model;

            if (oModel.createdDate === undefined || oModel.createdDate === 'undefined' || oModel.createdDate === '') {
              oModel.createdDate = nowTimestamp;
              oModel.createdDate_dt = nowTimestamp;
            }

            oModel.lastModifiedDate = nowTimestamp;
            oModel.lastModifiedDate_dt = nowTimestamp;
          },
          renderPersist: true
        });

        form.definition = formDef;

        form.definition.pageName = this._getPageName(content);

        form.definition.pageLocation = this._getPageLocation(path);
        form.containerEl = document.getElementById('formContainer');

        this._loadDatasources(form, function (loaded, notLoaded) {
          var iceId = CStudioAuthoring.Utils.getQueryVariable(location.search, 'iceId');
          var iceComponent = CStudioAuthoring.Utils.getQueryVariable(location.search, 'iceComponent');
          const selectedFields = CStudioAuthoring.Utils.getQueryVariable(location.search, 'selectedFields');
          const fieldsIndexes = CStudioAuthoring.Utils.getQueryVariable(location.search, 'fieldsIndexes');

          if (iceId && iceId != '') {
            var html = me._renderIceLayout(form);
            form.containerEl.innerHTML = html;
            var readOnlyBannerEl = document.getElementById('cstudio-form-readonly-banner');
            if (form.readOnly == true) {
              YDom.removeClass(readOnlyBannerEl, 'hidden');
            }
            me._renderInContextEdit(form, iceId);
          } else if (selectedFields) {
            var html = me._renderIceLayout(form);
            form.containerEl.innerHTML = html;
            const fields = JSON.parse(decodeURIComponent(selectedFields));

            if (fieldsIndexes) {
              const fieldsIndexesObj = JSON.parse(decodeURIComponent(fieldsIndexes));
              me._renderFields(form, fields, fieldsIndexesObj);
            } else {
              me._renderFields(form, fields);
            }
          } else {
            var html = me._renderFormLayout(form);
            form.containerEl.innerHTML = html;

            var readOnlyBannerEl = document.getElementById('cstudio-form-readonly-banner');
            if (form.readOnly == true) {
              YDom.removeClass(readOnlyBannerEl, 'hidden');
            }

            var expandAllEl = document.getElementById('cstudio-form-expand-all');
            var collapseAllEl = document.getElementById('cstudio-form-collapse-all');
            expandAllEl.form = form;
            collapseAllEl.form = form;

            expandAllEl.onclick = function () {
              var sections = form.sections;
              for (var q = 0; q < sections.length; q++) {
                var section = sections[q];
                var sectionBodyEl = section.sectionBodyEl;
                var sectionOpenCloseWidgetEl = section.sectionOpenCloseWidgetEl;

                sectionBodyEl.style.display = 'block';
                YAHOO.util.Dom.removeClass(sectionOpenCloseWidgetEl, 'cstudio-form-section-widget-closed');
              }
            };

            collapseAllEl.onclick = function () {
              var sections = form.sections;
              for (var q = 0; q < sections.length; q++) {
                var section = sections[q];
                var sectionBodyEl = section.sectionBodyEl;
                var sectionOpenCloseWidgetEl = section.sectionOpenCloseWidgetEl;

                sectionBodyEl.style.display = 'none';
                YAHOO.util.Dom.addClass(sectionOpenCloseWidgetEl, 'cstudio-form-section-widget-closed');
              }
            };

            me._renderFormSections(form);

            if (pluginError.control.length > 0 || pluginError.datasource.length > 0) {
              CStudioAuthoring.Utils.form.getPluginError(pluginError, CMgs, formsLangBundle);
            }
          }

          var buildEntityIdFn = function (draft, useCurrentValidFolder) {
            var entityId = path.replace('.html', '.xml');
            var changeTemplate = CStudioAuthoring.Utils.getQueryVariable(location.search, 'changeTemplate');
            var length = entityId.length;
            var index_html = '';
            var fileName = form.model['file-name'];
            var folderName =
              form.definition.contentAsFolder || form.definition.contentAsFolder === 'true'
                ? useCurrentValidFolder
                  ? CStudioForms.currentValidFolder ?? CStudioForms.initialModel['folder-name']
                  : form.model['folder-name']
                : undefined;
            /*
             * No folderName means it is NOT a content-as-folder content type.
             * See file-name.js function _onChange().
             */

            if (form.definition.objectType == 'page') {
              var pagePath = entityId.replace('/site/website/', '');
              file = pagePath.split('/').pop();

              if (file.indexOf('.xml') > -1 && file != 'index.xml') {
                folderName = '';
              }
            }

            if (changeTemplate == 'true') {
              if (form.definition.contentAsFolder == 'false') {
                entityId = entityId.replace('/index.xml');
              }
            }

            if (folderName != undefined && folderName.length == 0) folderName = undefined;

            if (folderName) {
              index_html = '/index.xml';
              if (fileName != index_html.substring(1)) {
                CStudioAuthoring.Operations.showSimpleDialog(
                  'errExpectedIndexXml-dialog',
                  CStudioAuthoring.Operations.simpleDialogTypeINFO,
                  CMgs.format(formsLangBundle, 'notification'),
                  CMgs.format(formsLangBundle, 'errExpectedIndexXml'),
                  null,
                  YAHOO.widget.SimpleDialog.ICON_BLOCK,
                  'studioDialog'
                );
              }
              if (entityId.indexOf(index_html) == length - 10) entityId = entityId.substring(0, length - 10);
            } else if (fileName.indexOf('.xml') != fileName.length - 4) {
              form.model['file-name'] = fileName += '.xml';
            }
            if (edit == 'true' || form.readOnly || lastDraft) {
              //This is also necessary in readonly mode
              // Get parent folder
              entityId = entityId.substring(0, entityId.lastIndexOf('/'));
            }
            if (folderName) {
              entityId += '/' + folderName + index_html;
            } else {
              entityId += '/' + fileName;
            }
            if (!(form.isInError() && draft == false) && !(form.isInErrorDraft() && draft == true)) {
              saveDraft = true;
            }
            lastDraft = draft;
            return craftercms.utils.string.ensureSingleSlash(entityId);
          };

          //If the form is opened in view mode, we don't need show the warn message or unlock the item
          var showWarnMsg = form.readOnly ? false : true;
          var _notifyServer = form.readOnly ? false : true;
          var message = CMgs.format(formsLangBundle, 'cancelDialogBody');

          var queryString = document.location.search;
          var editorId = CStudioAuthoring.Utils.getQueryVariable(queryString, 'editorId');
          var iceWindowCallback = CStudioAuthoring.InContextEdit.getIceCallback(editorId);

          var saveFn = function (preview, draft, embeddedIceDraft, action) {
            showWarnMsg = false;
            var saveDraft = draft == true ? true : false;

            setButtonsEnabled(false);

            var entityId = buildEntityIdFn(draft);
            var entityFile = entityId.substring(entityId.lastIndexOf('/') + 1);

            if ((form.isInError() && draft == false) || (form.isInErrorDraft() && draft == true)) {
              var dialogEl = document.getElementById('errMissingRequirements');
              if (!dialogEl) {
                var dialog = new YAHOO.widget.SimpleDialog('errMissingRequirements', {
                  width: '375px',
                  fixedcenter: true,
                  visible: false,
                  draggable: false,
                  close: false,
                  modal: true,
                  text: CMgs.format(formsLangBundle, 'errMissingRequirements'),
                  icon: YAHOO.widget.SimpleDialog.ICON_BLOCK,
                  constraintoviewport: true,
                  buttons: [
                    {
                      text: CMgs.format(formsLangBundle, 'ok'),
                      handler: function () {
                        this.hide();
                      },
                      isDefault: false
                    }
                  ]
                });
                dialog.setHeader(CMgs.format(formsLangBundle, 'cancelDialogHeader'));
                dialog.render(document.body);
                dialogEl = document.getElementById('errMissingRequirements');
                dialogEl.dialog = dialog;
              }
              dialogEl.dialog.show();
              setButtonsEnabled(true);
              return;
            }

            try {
              form.onBeforeSave({ preview: preview });
            } catch (e) {
              CStudioAuthoring.Utils.showConfirmDialog({
                body: formatMessage(formEngineMessages.formNotReadyForSaving)
              });
              return;
            }

            if (form.customController && !form.customController.onBeforeSave()) {
              return;
            }

            try {
              var xml = CStudioForms.Util.serializeModelToXml(form, saveDraft);
            } catch (e) {
              CStudioAuthoring.Operations.showSimpleDialog(
                'error-dialog',
                CStudioAuthoring.Operations.simpleDialogTypeINFO,
                CMgs.format(formsLangBundle, 'notification'),
                e,
                null,
                YAHOO.widget.SimpleDialog.ICON_BLOCK,
                'studioDialog'
              );
              setButtonsEnabled(true);
              return;
            }

            var serviceUrl =
              CStudioAuthoring.Service.createServiceUri('/api/1/services/api/1/content/write-content.json') +
              'site=' +
              CStudioAuthoringContext.site +
              '&phase=onSave' +
              '&path=' +
              entityId +
              '&fileName=' +
              entityFile +
              '&contentType=' +
              contentType;

            if (path != entityId && edit && edit == 'true') {
              // this is a rename
              serviceUrl += '&oldContentPath=' + path;
            }

            if (preview || draft == true) {
              serviceUrl += '&unlock=false';
            } else {
              serviceUrl += '&unlock=true';
            }

            if (me.config.isInclude) {
              setButtonsEnabled(true);
              sendMessage({
                type: FORM_UPDATE_REQUEST,
                editorId: editorId,
                payload: xml,
                preview,
                draft,
                edit,
                action
              });
            } else {
              const saveContent = () => {
                CrafterCMSNext.util.ajax.post(serviceUrl, xml).subscribe(
                  function () {
                    CStudioForms.currentValidFolder = CStudioForms.updatedModel?.['folder-name'];
                    YAHOO.util.Event.removeListener(window, 'beforeunload', unloadFn, me);

                    var getContentItemCb = {
                      success: function (contentTO) {
                        var previewUrl = CStudioAuthoringContext.previewAppBaseUri + contentTO.item.browserUri;
                        path = entityId;
                        var formId = CStudioAuthoring.Utils.getQueryVariable(location.search.substring(1), 'wid');
                        var editorId = CStudioAuthoring.Utils.getQueryVariable(location.search, 'editorId');

                        setButtonsEnabled(true);
                        sendMessage({ type: CHILD_FORM_DRAFT_COMPLETE });

                        if (typeof window.parent.CStudioAuthoring.editDisabled !== 'undefined') {
                          for (var x = 0; x < window.parent.CStudioAuthoring.editDisabled.length; x++) {
                            window.parent.CStudioAuthoring.editDisabled[x].style.pointerEvents = '';
                          }
                          window.parent.CStudioAuthoring.editDisabled = [];
                        }

                        if (iceWindowCallback && iceWindowCallback.success) {
                          var value = form.model['internal-name'];
                          var name = entityId;

                          contentTO.initialModel = CStudioForms.initialModel;
                          contentTO.updatedModel = CStudioForms.updatedModel;

                          iceWindowCallback.success(contentTO, editorId, name, value, draft, action);

                          if (!iceWindowCallback.isParent) {
                            CStudioForms.communication.sendMessage({
                              type: 'CHILD_FORM_SUCCESS',
                              payload: {
                                action: action,
                                editorId: editorId
                              }
                            });
                          }

                          if (draft) {
                            CStudioAuthoring.Utils.Cookies.createCookie('cstudio-save-draft', 'true');
                          } else {
                            CStudioAuthoring.Utils.Cookies.eraseCookie('cstudio-save-draft');
                            CStudioAuthoring.InContextEdit.unstackDialog(editorId);
                            CStudioAuthoring.Operations.refreshPreview();
                          }
                        } else {
                          if (draft) {
                            CStudioAuthoring.Utils.Cookies.createCookie('cstudio-save-draft', 'true');
                            CStudioAuthoring.Operations.refreshPreview();
                          } else {
                            CStudioAuthoring.Utils.Cookies.eraseCookie('cstudio-save-draft');
                            CStudioAuthoring.InContextEdit.unstackDialog(editorId);
                            CStudioAuthoring.Operations.refreshPreview();
                          }
                        }
                        var page = CStudioAuthoring.Utils.getQueryParameterURLParentWindow('page');
                        var currentPage = page.split('/')[page.split('/').length - 1];
                        var acnDraftContent = YDom.getElementsByClassName('acnDraftContent', null, parent.document)[0];
                        if (acnDraftContent && !saveDraft) {
                          acnDraftContent.parentNode.removeChild(acnDraftContent);
                        }
                        if (!acnDraftContent && saveDraft && contentTO.item.browserUri == page) {
                          var noticeEl = document.createElement('div');
                          parent.document.querySelector('#studioBar nav .container-fluid').appendChild(noticeEl);
                          YDom.addClass(noticeEl, 'acnDraftContent');
                          noticeEl.innerHTML = CMgs.format(formsLangBundle, 'wcmContentSavedAsDraft');
                        }

                        if (embeddedIceDraft) {
                          //close parent form when embeddedIce is saved as draft
                          sendMessage({ type: FORM_CANCEL_REQUEST });
                        }
                      },
                      failure: function (err) {
                        CStudioAuthoring.Operations.showSimpleDialog(
                          'error-dialog',
                          CStudioAuthoring.Operations.simpleDialogTypeINFO,
                          CMgs.format(formsLangBundle, 'notification'),
                          err,
                          [
                            {
                              text: 'OK',
                              handler: function () {
                                this.hide();
                                form.onAfterSave();
                                setButtonsEnabled(true);
                              },
                              isDefault: false
                            }
                          ],
                          YAHOO.widget.SimpleDialog.ICON_BLOCK,
                          'studioDialog'
                        );
                      }
                    };

                    if (entityId === path) {
                      CStudioAuthoring.Service.lookupContentItem(
                        CStudioAuthoringContext.site,
                        entityId,
                        getContentItemCb,
                        false,
                        false
                      );
                    } else {
                      CStudioAuthoring.Service.lookupSiteContent(
                        CStudioAuthoringContext.site,
                        entityId,
                        1,
                        'default',
                        getContentItemCb
                      );
                    }
                  },
                  function (err) {
                    if (!CStudioForms.currentValidFolder) {
                      CStudioForms.currentValidFolder = CStudioForms.initialModel['folder-name'];
                    }
                    try {
                      CStudioAuthoring.Operations.showSimpleDialog(
                        'error-dialog',
                        CStudioAuthoring.Operations.simpleDialogTypeINFO,
                        CMgs.format(formsLangBundle, 'notification'),
                        YAHOO.lang.JSON.parse(err.responseText).callstack[1].substring(
                          YAHOO.lang.JSON.parse(err.responseText).callstack[1].indexOf(':') + 1
                        ),
                        null,
                        YAHOO.widget.SimpleDialog.ICON_BLOCK,
                        'studioDialog'
                      );
                    } catch (e) {
                      const error = err.response,
                        errorMessage = error.message ? error.message : CMgs.format(formsLangBundle, 'errSaveFailed');

                      CStudioAuthoring.Operations.showSimpleDialog(
                        'error-dialog',
                        CStudioAuthoring.Operations.simpleDialogTypeINFO,
                        CMgs.format(formsLangBundle, 'notification'),
                        errorMessage,
                        null,
                        YAHOO.widget.SimpleDialog.ICON_BLOCK,
                        'studioDialog'
                      );
                    }
                    setButtonsEnabled(true);
                  }
                );
              };
              CrafterCMSNext.services.sites
                .validateActionPolicy(CStudioAuthoringContext.site, {
                  type: 'CREATE',
                  target: entityId,
                  contentMetadata: { contentType }
                })
                .subscribe(({ allowed, modifiedValue, target }) => {
                  if (allowed) {
                    if (modifiedValue) {
                      CStudioAuthoring.Utils.showConfirmDialog({
                        body: formatMessage(formEngineMessages.createPolicy, {
                          originalPath: entityId,
                          path: modifiedValue
                        }),
                        onOk: () => {
                          saveContent();
                        },
                        onCancel: () => {
                          setButtonsEnabled(true);
                        }
                      });
                    } else {
                      saveContent();
                    }
                  } else {
                    setButtonsEnabled(true);
                    CStudioAuthoring.Utils.showConfirmDialog({
                      body: formatMessage(formEngineMessages.policyError, { path: target })
                    });
                  }
                });
            }
          };

          cfe.engine.saveForm = saveFn;

          var formControlBarEl = YDom.getElementsByClassName(
            'cstudio-form-controls-container',
            null,
            form.containerEl
          )[0];
          var formButtonContainerEl = document.createElement('div');
          YDom.addClass(formButtonContainerEl, 'cstudio-form-controls-button-container');
          formControlBarEl.appendChild(formButtonContainerEl);

          function reloadParentWindow() {
            window.parent.location.reload();
          }

          var beforeUnloadFn = function (e) {
            if (showWarnMsg) {
              var evt = e || window.event;
              evt.returnValue = message;
              YAHOO.util.Event.stopEvent(evt);
              return message;
            }
          };

          var unloadFn = function (e) {
            if (_notifyServer) {
              path = CStudioAuthoring.Utils.getQueryVariable(location.search, 'path');
              if (path && path.indexOf('.xml') != -1) {
                var entityId = buildEntityIdFn(null);
                CrafterCMSNext.services.content.unlock(CStudioAuthoringContext.site, entityId).subscribe();
              }
            }
          };

          var unlockBeforeCancel = function (path) {
            CStudioAuthoring.Service.lookupContentItem(CStudioAuthoringContext.site, path, {
              success: function (itemTO) {
                //Unlock if the item is locked by the user
                if (itemTO.item && itemTO.item.lockOwner == CStudioAuthoringContext.user) {
                  CStudioAuthoring.Service.unlockContentItem(CStudioAuthoringContext.site, path, {
                    success: function () {
                      _notifyServer = false;
                      eventNS.data = itemTO.item;
                      eventNS.typeAction = '';
                      eventNS.oldPath = null;
                      getTopLegacyWindow().document.dispatchEvent(eventNS);
                      var editorId = CStudioAuthoring.Utils.getQueryVariable(location.search, 'editorId');
                      CStudioAuthoring.InContextEdit.unstackDialog(editorId);
                    },
                    failure: function () {}
                  });
                } else {
                  _notifyServer = false;
                  var editorId = CStudioAuthoring.Utils.getQueryVariable(location.search, 'editorId');
                  CStudioAuthoring.InContextEdit.unstackDialog(editorId);
                }
              },
              failure: function () {}
            });
          };

          isModified = function () {
            let flag = false;
            if (form.sections.length) {
              for (var j = 0; j < form.sections.length; j++) {
                if (form.sections[j].fields.length) {
                  for (var i = 0; i < form.sections[j].fields.length; i++) {
                    if (form.sections[j].fields[i].edited == true) {
                      flag = true;
                    }
                  }
                }
              }
            }
            return flag;
          };

          var cancelFn = function () {
            if (iceWindowCallback && iceWindowCallback.refresh) {
              iceWindowCallback.refresh();
            }

            if (typeof window.parent.CStudioAuthoring.editDisabled !== 'undefined') {
              for (var x = 0; x < window.parent.CStudioAuthoring.editDisabled.length; x++) {
                window.parent.CStudioAuthoring.editDisabled[x].style.pointerEvents = '';
              }
              window.parent.CStudioAuthoring.editDisabled = [];
            }

            var flag = isModified();

            if (!disableClose) {
              if (showWarnMsg && (flag || repeatEdited)) {
                if (CStudioAuthoring.InContextEdit.isDialogCollapsed()) {
                  collapseFn();
                }
                $(document).trigger('CloseFormWithChangesUserWarningDialogShown');

                CStudioAuthoring.Utils.showConfirmDialog({
                  body: message,
                  onOk: () => {
                    if (iceWindowCallback && iceWindowCallback.cancelled) {
                      iceWindowCallback.cancelled();
                    }
                    sendMessage({ type: FORM_CANCEL });
                    var entityId = buildEntityIdFn(null);
                    showWarnMsg = false;

                    var path = CStudioAuthoring.Utils.getQueryVariable(location.search, 'path');
                    if (path && path.indexOf('.xml') != -1) {
                      unlockBeforeCancel(path);
                    } else {
                      _notifyServer = false;
                      var editorId = CStudioAuthoring.Utils.getQueryVariable(location.search, 'editorId');
                      CStudioAuthoring.InContextEdit.unstackDialog(editorId);

                      if (path == '/site/components/page') {
                        CStudioAuthoring.Operations.refreshPreview();
                      }
                    }
                  }
                });
              } else {
                if (iceWindowCallback && iceWindowCallback.cancelled) {
                  iceWindowCallback.cancelled();
                }
                //Message to unsubscribe FORM_ENGINE_MESSAGE_POSTED
                sendMessage({ type: FORM_CANCEL });
                var acnDraftContent = YDom.getElementsByClassName('acnDraftContent', null, parent.document)[0],
                  editorId = CStudioAuthoring.Utils.getQueryVariable(location.search, 'editorId');
                if (acnDraftContent) {
                  unlockBeforeCancel(path);
                } else {
                  if (!form.readOnly && path && path.indexOf('.xml') != -1 && !me.config.isInclude) {
                    const entityId = buildEntityIdFn(null, Boolean(CStudioForms.currentValidFolder));
                    CrafterCMSNext.services.content
                      .unlock(CStudioAuthoringContext.site, entityId)
                      .subscribe((response) => {
                        YAHOO.util.Event.removeListener(window, 'beforeunload', unloadFn, me);

                        if ((iceId && iceId != '') || (iceComponent && iceComponent != '')) {
                          CStudioAuthoring.InContextEdit.unstackDialog(editorId);
                          var componentsOn = !!sessionStorage.getItem('components-on');
                          if (componentsOn) {
                            CStudioAuthoring.Operations.refreshPreviewParent();
                          }
                        } else {
                          window.close();
                          if (componentsOn) {
                            CStudioAuthoring.Operations.refreshPreviewParent();
                          }
                        }
                      });
                  } else {
                    CStudioAuthoring.InContextEdit.unstackDialog(editorId);
                  }
                }
              }
            }
          };

          var collapseFn = function () {
            if ((iceId && iceId !== '') || (iceComponent && iceComponent !== '')) {
              var editorId = CStudioAuthoring.Utils.getQueryVariable(location.search, 'editorId');
              CStudioAuthoring.InContextEdit.collapseDialog(editorId);
            } else {
              window.close();
            }
          };

          cfe.engine.cancelForm = cancelFn;

          amplify.subscribe('/field/init/completed', function () {
            form.asyncFields--;
            closeAjaxOverlay();
          });

          if (!form.readOnly) {
            var cancelButtonEl = document.createElement('input');
            cancelButtonEl.id = 'cancelBtn';
            YDom.addClass(cancelButtonEl, 'btn btn-default');
            cancelButtonEl.type = 'button';
            cancelButtonEl.value = CMgs.format(formsLangBundle, 'cancel');
            formButtonContainerEl.appendChild(cancelButtonEl);

            const buttonsContainer = document.createElement('div');
            buttonsContainer.id = 'splitButtonContainer';
            formButtonContainerEl.appendChild(buttonsContainer);

            //In Context Edit, the preview button must not be shown
            var iceId = CStudioAuthoring.Utils.getQueryVariable(location.search, 'iceId');
            // This is really the right thing to do but previewable doesn't come through
            CStudioAuthoring.Service.lookupContentType(CStudioAuthoringContext.site, contentType, {
              success: function (type) {
                const storedId = 'formEditor';
                const defaultSelected = 'saveAndClose';

                const onMultiChoiceSaveButtonClick = (e, type) => {
                  saveFn(type === 'saveAndPreview', type !== 'saveAndClose', null, type);
                };

                const React = craftercms.libs.React;
                const MultiChoiceSaveButton = craftercms.components.MultiChoiceSaveButton;

                function LegacyMultiChoiceSaveButton(props) {
                  const [disabled, setDisabled] = React.useState(props.disabled);

                  React.useEffect(() => {
                    const messagesSubscription = craftercms.libs.rxjs
                      .fromEvent(window, 'message')
                      .pipe(craftercms.libs.rxjs.filter((e) => e.data && e.data.type))
                      .subscribe((e) => {
                        switch (e.data.type) {
                          case 'EMBEDDED_LEGACY_FORM_SAVE_START': {
                            setDisabled(true);
                            break;
                          }
                          case 'EMBEDDED_LEGACY_FORM_SAVE_END': {
                            setDisabled(false);
                            break;
                          }
                        }
                        return () => {
                          messagesSubscription.unsubscribe();
                        };
                      });
                  }, []);

                  return React.createElement(MultiChoiceSaveButton, {
                    ...props,
                    disabled
                  });
                }

                CrafterCMSNext.render(buttonsContainer, LegacyMultiChoiceSaveButton, {
                  defaultSelected,
                  disablePortal: false,
                  storageKey: storedId,
                  options: [
                    {
                      id: 'saveDraft',
                      label: formatMessage(formEngineMessages.saveDraft),
                      callback: (e) => onMultiChoiceSaveButtonClick(e, 'save')
                    },
                    {
                      id: 'saveAndClose',
                      label: formatMessage(formEngineMessages.saveAndClose),
                      callback: (e) => onMultiChoiceSaveButtonClick(e, 'saveAndClose')
                    },
                    {
                      id: 'saveAndMinimize',
                      label: formatMessage(formEngineMessages.saveAndMinimize),
                      callback: (e) => onMultiChoiceSaveButtonClick(e, 'saveAndMinimize')
                    }
                  ]
                });
              },
              failure: function () {}
            });

            YAHOO.util.Event.addListener(window, 'beforeunload', unloadFn, me);
            YAHOO.util.Event.addListener(cancelButtonEl, 'click', cancelFn, me);
          } else {
            var closeButtonEl = document.createElement('input');
            YDom.addClass(closeButtonEl, 'btn btn-default');
            closeButtonEl.type = 'button';
            closeButtonEl.value = CMgs.format(formsLangBundle, 'close');
            formButtonContainerEl.appendChild(closeButtonEl);
            YDom.setStyle(formButtonContainerEl, 'text-align', 'center');

            YAHOO.util.Event.addListener(window, 'beforeunload', unloadFn, me);
            YAHOO.util.Event.addListener(closeButtonEl, 'click', cancelFn, me);

            const canEdit = CStudioAuthoring.Utils.getQueryVariable(queryString, 'canEdit');

            if (canEdit) {
              var editButtonEl = document.createElement('input');
              YDom.addClass(editButtonEl, 'btn btn-primary');
              editButtonEl.type = 'button';
              editButtonEl.style.marginLeft = '15px';
              editButtonEl.value = formatMessage(formEngineMessages.edit);

              formButtonContainerEl.appendChild(editButtonEl);
              YDom.setStyle(formButtonContainerEl, 'text-align', 'center');

              YAHOO.util.Event.addListener(
                editButtonEl,
                'click',
                () => {
                  const editorId = CStudioAuthoring.Utils.getQueryVariable(location.search, 'editorId');
                  const iceWindowCallback = CStudioAuthoring.InContextEdit.getIceCallback(editorId);
                  if (iceWindowCallback.changeToEditMode) {
                    getCustomCallback(iceWindowCallback.changeToEditMode)();
                  }
                },
                me
              );
            }

            var focusEl = window;
            setTimeout(function () {
              focusEl.focus();
            }, 500);
          }

          if (window.frameElement) {
            var overlayContainer = parent.document.getElementById(window.frameElement.id).parentElement;
            YDom.addClass(overlayContainer, 'overlay');
          }

          $(document).on('keyup', function (e) {
            if (e.keyCode === 27) {
              // esc
              if (e.currentTarget.activeElement) {
                //blur and focus again element - to update model and detect if there was a change on form
                $(e.currentTarget.activeElement).blur();
                $(e.currentTarget.activeElement).focus();
              }
              cancelFn();
            }
          });

          if (!me.config.isInclude) {
            //render finished
            messages$.subscribe((message) => {
              switch (message.type) {
                case OPEN_CHILD_COMPONENT: {
                  const key = message.key || null;
                  const edit = message.edit || false;
                  const iceId = message.iceId || null;
                  const selectorId = message.selectorId || null;
                  const ds = message.ds || null;
                  const order = message.order != null ? message.order : null;
                  const contentType =
                    message.contentType ||
                    parseDOM(FlattenerState[message.key]).querySelector('content-type').innerHTML;
                  let callback = message.callback || {};
                  callback = getCustomsCallbacks(callback);
                  if (edit) {
                    CStudioAuthoring.Operations.performSimpleIceEdit(
                      { contentType: contentType, uri: key },
                      iceId || null, // field
                      edit,
                      {
                        ...callback,
                        success: function (contentTO, editorId, objId, value, draft, action) {
                          sendMessage({ type: FORM_SAVE_REQUEST, objId, value, draft, action });
                        },
                        cancelled: function () {
                          sendMessage({ type: FORM_CANCEL_REQUEST });
                        }
                      },
                      [],
                      true
                    );
                  } else {
                    CStudioAuthoring.Operations.openContentWebForm(
                      contentType,
                      null,
                      null,
                      '',
                      false,
                      false,
                      {
                        ...callback,
                        success: function (contentTO, editorId, objId, value, draft, action) {
                          sendMessage({
                            type: FORM_SAVE_REQUEST,
                            key: objId,
                            value,
                            draft,
                            new: true,
                            selectorId: selectorId,
                            ds,
                            order,
                            action
                          });
                        },
                        cancelled: function () {
                          sendMessage({ type: FORM_CANCEL_REQUEST });
                        },
                        type: function () {
                          return 'dnd';
                        }
                      },
                      [{ name: 'childForm', value: 'true' }],
                      null,
                      true
                    );
                    //it is a dnd
                  }
                }
              }
            });
            sendMessage({ type: FORM_ENGINE_RENDER_COMPLETE });
          }
          CStudioAuthoring.InContextEdit.getIceCallback(editorId)?.renderComplete?.();
        });
      },

      /**
       * load datasource objects in to form so that fields can attach to them when they load
       */
      _loadDatasources: function (form, callback) {
        var formDef = form.definition,
          loadControl = 0,
          loaded = [],
          notLoaded = [],
          releaseCallback;

        form.datasourceMap = {};

        releaseCallback = function () {
          if (loaded.length + notLoaded.length === formDef.datasources.length) {
            callback(loaded, notLoaded);
          }
        };

        if (0 === formDef.datasources.length) {
          callback(loaded, notLoaded);
        } else {
          for (var i = 0, l = formDef.datasources.length; i < l; i++) {
            var datasourceDef = formDef.datasources[i],
              pluginInfo = '',
              script;

            datasourceDef.name = datasourceDef.type;

            pluginInfo = CStudioAuthoring.Utils.form.getPluginInfo(
              datasourceDef,
              CStudioAuthoring.Constants.DATASOURCE_URL,
              'datadource'
            );

            if (pluginInfo.path != '') {
              script = CStudioAuthoringContext.baseUri + pluginInfo.path;

              var onDone = (function (datasourceDef, pluginInfo) {
                return function (script, textStatus) {
                  try {
                    if ('' === script) {
                      notLoaded.push(datasourceDef.type);
                    } else {
                      var moduleClass = CStudioAuthoring.Module.loadedModules[pluginInfo.prefix];
                      var datasource = new moduleClass(datasourceDef.id, form, datasourceDef.properties);
                      form.datasourceMap[datasource.id] = datasource;
                      amplify.publish('/datasource/loaded', { name: datasource.id });

                      loaded.push(datasourceDef.type);
                    }

                    releaseCallback();
                  } catch (e) {
                    console.log(e);
                  }
                };
              })(datasourceDef, pluginInfo);

              if (CStudioAuthoring.Module.loadedModules[pluginInfo.prefix]) {
                onDone();
              } else {
                jQuery
                  .getScript({ url: script, cache: true })
                  .done(onDone)
                  .fail(
                    (function (datasourceDef) {
                      return function (jqxhr, settings, exception) {
                        console.log(exception);
                        notLoaded.push(datasourceDef.type);
                        releaseCallback();
                      };
                    })(datasourceDef)
                  );
              }
            } else {
              notLoaded.push(datasourceDef.type);
            }

            if (pluginInfo.missingProp.length > 0) {
              pluginError.datasource.push(pluginInfo.missingProp);
            }
          }
        }
      },

      /**
       * render a form section
       */
      _renderFormSections: function (form) {
        var formDef = form.definition;
        form.sectionsMap = [];
        var editorId = CStudioAuthoring.Utils.getQueryVariable(location.search, 'editorId');
        var iceWindowCallback = CStudioAuthoring.InContextEdit.getIceCallback(editorId);

        for (var i = 0; i < formDef.sections.length; i++) {
          var section = formDef.sections[i];

          var sectionContainerEl = document.getElementById(section.id + '-container');
          var sectionEl = document.getElementById(section.id + '-body-controls');

          var formSection = new CStudioFormSection(form, sectionContainerEl, iceWindowCallback);
          form.sectionsMap[section.title] = formSection;
          form.sections[form.sections.length] = formSection;

          var sectionOpenCloseWidgetEl = YDom.getElementsByClassName(
            'cstudio-form-section-widget',
            null,
            sectionContainerEl
          )[0];
          var sectionBodyEl = YDom.getElementsByClassName('panel-body', null, sectionContainerEl)[0];
          var sectionHeadingEl = YDom.getElementsByClassName('panel-heading', null, sectionContainerEl)[0];

          if (section.defaultOpen == 'false' || section.defaultOpen == '' || section.defaultOpen == false) {
            sectionBodyEl.style.display = 'none';
            YAHOO.util.Dom.addClass(sectionOpenCloseWidgetEl, 'cstudio-form-section-widget-closed');
          }

          sectionOpenCloseWidgetEl.sectionBodyEl = sectionBodyEl;
          formSection.sectionOpenCloseWidgetEl = sectionOpenCloseWidgetEl;
          formSection.sectionBodyEl = sectionBodyEl;

          sectionHeadingEl.onclick = function () {
            YDom.getElementsByClassName('panel-body', null, this)[0];
            if (YDom.getElementsByClassName('panel-body', null, this)[0].style.display === 'none') {
              YDom.getElementsByClassName('panel-body', null, this)[0].style.display = 'block';
              YAHOO.util.Dom.removeClass(
                YDom.getElementsByClassName('cstudio-form-section-widget', null, this)[0],
                'cstudio-form-section-widget-closed'
              );
            } else {
              YDom.getElementsByClassName('panel-body', null, this)[0].style.display = 'none';
              YAHOO.util.Dom.addClass(
                YDom.getElementsByClassName('cstudio-form-section-widget', null, this)[0],
                'cstudio-form-section-widget-closed'
              );
            }
          }.bind(sectionContainerEl);

          for (var j = 0; j < section.fields.length; j++) {
            var field = section.fields[j];

            if (field) {
              if (field.type != 'repeat') {
                var lastTwo = j + 2 >= section.fields.length ? true : false;
                this._renderField(
                  formDef,
                  field,
                  form,
                  formSection,
                  sectionBodyEl,
                  undefined,
                  undefined,
                  undefined,
                  lastTwo
                );
              } else {
                this._renderRepeat(formDef, field, form, formSection, sectionBodyEl);
              }
            }
          }
        }
      },

      /**
       * render a repeat
       */
      _renderRepeat: function (formDef, repeat, form, formSection, sectionEl, fieldIndex) {
        if (form.customController && form.customController.isFieldRelevant(repeat) == false) {
          return;
        }

        var repeatContainerEl = document.createElement('div');
        sectionEl.appendChild(repeatContainerEl);
        repeatContainerEl.maxOccurs = repeat.maxOccurs;
        repeatContainerEl.minOccurs = repeat.minOccurs;
        repeatContainerEl.formDef = formDef;
        repeatContainerEl.repeat = repeat;
        repeatContainerEl.index = fieldIndex;
        repeatContainerEl.form = form;
        repeatContainerEl.formSection = formSection;
        repeatContainerEl.sectionEl = sectionEl;
        repeatContainerEl.formEngine = this;
        repeatContainerEl.reRender = function (controlEl) {
          var arrayFilter = function (arr, attFilter) {
            return arr.filter(function (el) {
              return el[attFilter];
            });
          };

          // If the repeating group that it's being re-rendered has RTE5 controls, remove all of them before cleanup up
          // markup (so it'll remove all things related to those RTEs)
          const $rteControls = $(controlEl).find('.rte-control');
          if ($rteControls.length) {
            const $rteInputs = $rteControls.find('.cstudio-form-control-input');
            $rteInputs.each((index, element) => {
              const rteId = element.getAttribute('id');
              tinymce.get(rteId).remove();
            });
          }
          controlEl.formEngine._cleanUpRepeatBodyFields(controlEl, this.repeat.id);
          controlEl.innerHTML = '';
          controlEl.formEngine._renderRepeatBody(controlEl);
        };

        this._renderRepeatBody(repeatContainerEl);
      },

      /**
       * this method will clean up all the repeating group fields
       * to make sure old fields don't cause validation issues
       */
      _cleanUpRepeatBodyFields: function (repeatContainerEl, id) {
        var formSectionFields = [];
        var repFields = repeatContainerEl.formSection.fields;
        if (repFields && repFields.length > 0) {
          for (var i = 0; i < repFields.length; i++) {
            if (repFields[i].id.indexOf(id + '|') == -1) {
              formSectionFields.push(repFields[i]);
            }
          }
          repeatContainerEl.formSection.fields = formSectionFields;
        }
      },

      _renderRepeatDescription: function (repeatContainerEl) {
        const repeat = repeatContainerEl.repeat;
        const description = repeat.description;

        if (description) {
          var descriptionEl = document.createElement('span');
          YAHOO.util.Dom.addClass(descriptionEl, 'description');
          YAHOO.util.Dom.addClass(descriptionEl, 'cstudio-form-field-description repeating-group-description');
          descriptionEl.textContent = description;
          repeatContainerEl.appendChild(descriptionEl);
        }
      },

      /**
       * this method does the actual rendering of the repeat and
       * has been separated from renderRepeat so it can be called on
       * repeat manipulation events
       */
      _renderRepeatBody: function (repeatContainerEl) {
        var maxOccurs = repeatContainerEl.maxOccurs;
        var minOccurs = repeatContainerEl.minOccurs;
        var formDef = repeatContainerEl.formDef;
        var repeat = repeatContainerEl.repeat;
        var form = repeatContainerEl.form;
        var formSection = repeatContainerEl.formSection;
        var sectionEl = repeatContainerEl.sectionEl;
        var containerEl = repeatContainerEl;
        var self = this;

        // render with items
        var currentCount = form.model[repeat.id] ? form.model[repeat.id].length : 0;
        var repeatCount = currentCount > minOccurs ? currentCount : minOccurs;

        //handle case where there are no items
        if ((minOccurs == 0 && !form.model[repeat.id]) || repeatCount == 0) {
          var repeatInstanceContainerEl = document.createElement('div');
          repeatContainerEl.appendChild(repeatInstanceContainerEl);
          YAHOO.util.Dom.addClass(repeatInstanceContainerEl, 'cstudio-form-repeat-container');
          repeatInstanceContainerEl._repeatIndex = 0;

          var titleEl = document.createElement('span');
          repeatInstanceContainerEl.appendChild(titleEl);
          YAHOO.util.Dom.addClass(titleEl, 'cstudio-form-repeat-title');
          titleEl.textContent = repeat.title;

          var addEl = document.createElement('a');
          repeatInstanceContainerEl.appendChild(addEl);
          YAHOO.util.Dom.addClass(addEl, 'cstudio-form-repeat-control btn btn-default btn-sm');
          addEl.innerHTML = 'Add First Item';
          addEl.onclick = function () {
            repeatContainerEl.form.setFocusedField(repeatContainerEl);
            form.model[repeat.id] = [];
            form.model[repeat.id][0] = [];

            this.parentNode.parentNode.reRender(this.parentNode.parentNode);
            repeatEdited = true;
          };

          this._renderRepeatDescription(repeatContainerEl);

          formSection.notifyValidation();
          return;
        }

        if (!form.model[repeat.id]) {
          form.model[repeat.id] = [];
        }

        if (currentCount < minOccurs) {
          var count = minOccurs - currentCount;
          for (var j = 0; j < count; j++) {
            form.model[repeat.id][form.model[repeat.id].length] = [];
          }
        }

        const repeatIndex = repeatContainerEl.index;
        const repeatIndexNOU = repeatIndex === null || repeatIndex === undefined;
        for (var i = 0; i < repeatCount; i++) {
          if (repeatIndexNOU || repeatIndex === i) {
            var repeatInstanceContainerEl = document.createElement('div');
            YAHOO.util.Dom.addClass(repeatInstanceContainerEl, 'cstudio-form-repeat-container');
            repeatInstanceContainerEl._repeatIndex = i;

            var titleEl = document.createElement('span');
            repeatInstanceContainerEl.appendChild(titleEl);
            YAHOO.util.Dom.addClass(titleEl, 'cstudio-form-repeat-title');
            titleEl.textContent = repeat.title;

            if (repeatIndexNOU) {
              var addEl = document.createElement('a');
              repeatInstanceContainerEl.appendChild(addEl);
              YAHOO.util.Dom.addClass(addEl, 'cstudio-form-repeat-control btn btn-default btn-sm');
              addEl.innerHTML = CMgs.format(formsLangBundle, 'repeatAddAnother');
              if (form.readOnly || (maxOccurs != '*' && currentCount >= maxOccurs)) {
                YAHOO.util.Dom.addClass(addEl, 'cstudio-form-repeat-control-disabled');
              } else {
                addEl.onclick = function () {
                  form.onBeforeUiRefresh();
                  repeatContainerEl.form.setFocusedField(repeatContainerEl);
                  var itemArray = form.model[repeat.id];
                  var repeatArrayIndex = this.parentNode._repeatIndex;
                  itemArray.splice(repeatArrayIndex + 1, 0, []);
                  containerEl.reRender(containerEl);

                  var containerElNodes = $(containerEl.childNodes);
                  containerElLastChildTop = $(containerElNodes.get(repeatArrayIndex + 1)).offset().top;
                  $('html').scrollTop(containerElLastChildTop);

                  repeatEdited = true;
                };
              }

              var upEl = document.createElement('a');
              repeatInstanceContainerEl.appendChild(upEl);
              YAHOO.util.Dom.addClass(upEl, 'cstudio-form-repeat-control btn btn-default btn-sm');
              upEl.innerHTML = CMgs.format(formsLangBundle, 'repeatMoveUp');
              if (form.readOnly || i == 0) {
                YAHOO.util.Dom.addClass(upEl, 'cstudio-form-repeat-control-disabled');
              } else {
                upEl.onclick = function () {
                  //form.setFocusedField(null);
                  repeatContainerEl.form.setFocusedField(repeatContainerEl);
                  form.onBeforeUiRefresh();
                  var itemArray = form.model[repeat.id];
                  var repeatArrayIndex = this.parentNode._repeatIndex;
                  var itemToMove = itemArray[repeatArrayIndex];
                  itemArray.splice(repeatArrayIndex, 1);
                  itemArray.splice(repeatArrayIndex - 1, 0, itemToMove);
                  containerEl.reRender(containerEl);

                  var containerElNodes = $(containerEl.childNodes);
                  containerElLastChildTop = $(containerElNodes.get(repeatArrayIndex - 1)).offset().top;
                  $('html').scrollTop(containerElLastChildTop);

                  repeatEdited = true;
                };
              }

              var downEl = document.createElement('a');
              repeatInstanceContainerEl.appendChild(downEl);
              YAHOO.util.Dom.addClass(downEl, 'cstudio-form-repeat-control btn btn-default btn-sm');
              downEl.innerHTML = CMgs.format(formsLangBundle, 'repeatMoveDown');
              if (form.readOnly || i == repeatCount - 1) {
                YAHOO.util.Dom.addClass(downEl, 'cstudio-form-repeat-control-disabled');
              } else {
                downEl.onclick = function () {
                  //form.setFocusedField(null);
                  repeatContainerEl.form.setFocusedField(repeatContainerEl);
                  form.onBeforeUiRefresh();
                  var itemArray = form.model[repeat.id];
                  var repeatArrayIndex = this.parentNode._repeatIndex;
                  var itemToMove = itemArray[repeatArrayIndex];
                  itemArray.splice(repeatArrayIndex, 1);
                  itemArray.splice(repeatArrayIndex + 1, 0, itemToMove);
                  containerEl.reRender(containerEl);

                  var containerElNodes = $(containerEl.childNodes);
                  containerElLastChildTop = $(containerElNodes.get(repeatArrayIndex + 1)).offset().top;
                  $('html').scrollTop(containerElLastChildTop);

                  repeatEdited = true;
                };
              }

              var deleteEl = document.createElement('a');
              repeatInstanceContainerEl.appendChild(deleteEl);
              YAHOO.util.Dom.addClass(deleteEl, 'cstudio-form-repeat-control btn btn-default btn-sm');
              deleteEl.innerHTML = CMgs.format(formsLangBundle, 'repeatDelete');
              if (form.readOnly || currentCount <= minOccurs) {
                YAHOO.util.Dom.addClass(deleteEl, 'cstudio-form-repeat-control-disabled');
              } else {
                deleteEl.onclick = function () {
                  repeatContainerEl.form.setFocusedField(repeatContainerEl);
                  form.onBeforeUiRefresh();
                  var itemArray = form.model[repeat.id];
                  var repeatArrayIndex = this.parentNode._repeatIndex;
                  itemArray.splice(repeatArrayIndex, 1);
                  // Remove noDefaultLookup entry
                  const itemBaseId = repeat.id + '|' + repeatArrayIndex;
                  noDefaultLookup = Object.fromEntries(
                    Object.entries(noDefaultLookup).filter(([key]) => !key.startsWith(itemBaseId))
                  );
                  containerEl.reRender(containerEl);

                  if (repeatArrayIndex) {
                    var containerElNodes = $(containerEl.childNodes);
                    containerElLastChildTop = $(containerElNodes.get(repeatArrayIndex - 1)).offset().top;
                    $('html').scrollTop(containerElLastChildTop);
                  }

                  repeatEdited = true;
                };
              }
            }

            // Insert the repeat group instance to the DOM as late in the process as possible
            repeatContainerEl.appendChild(repeatInstanceContainerEl);

            for (var j = 0; j < repeat.fields.length; j++) {
              var field = repeat.fields[j];

              this._renderField(formDef, field, form, formSection, repeatInstanceContainerEl, repeat, i);
            }
          }
        }

        this._renderRepeatDescription(repeatContainerEl);
      },

      /**
       * render a field
       * repeatField, repeatIndex are used only when repeat
       */
      _renderField: function (
        formDef,
        field,
        form,
        formSection,
        sectionEl,
        repeatField,
        repeatIndex,
        pencilMode,
        lastTwo
      ) {
        if (form.customController && form.customController.isFieldRelevant(field) == false) {
          return;
        }

        var fieldContainerEl = document.createElement('div'),
          pluginInfo;

        field.name = field.type;

        pluginInfo = CStudioAuthoring.Utils.form.getPluginInfo(
          field,
          CStudioAuthoring.Constants.CONTROL_URL,
          'control'
        );

        YAHOO.util.Dom.addClass(fieldContainerEl, 'container');
        YAHOO.util.Dom.addClass(fieldContainerEl, field.type + '-control');
        YAHOO.util.Dom.addClass(fieldContainerEl, 'cstudio-form-field-container');
        sectionEl.appendChild(fieldContainerEl);

        // initialize each control
        var cb = {
          moduleLoaded: function (moduleName, moduleClass, moduleConfig) {
            try {
              var fieldId = moduleConfig.config.field.id;
              if (repeatField) {
                fieldId =
                  moduleConfig.config.repeatField.id +
                  '|' +
                  moduleConfig.config.repeatIndex +
                  '|' +
                  moduleConfig.config.field.id;
              }

              var formField = new moduleClass(
                fieldId,
                this.form,
                this.section,
                moduleConfig.config.field.properties,
                moduleConfig.config.field.constraints,
                form.readOnly,
                pencilMode
              );

              formField.initialize(moduleConfig.config.field, this.containerEl, lastTwo);

              var value = '';
              if (repeatField) {
                value =
                  form.model[moduleConfig.config.repeatField.id][moduleConfig.config.repeatIndex][
                    moduleConfig.config.field.id
                  ];
              } else {
                // not a repeat
                value = form.model[moduleConfig.config.field.id];
              }

              const defaultValue = moduleConfig.config.field.defaultValue;
              if (
                craftercms.utils.object.nou(value) &&
                defaultValue &&
                typeof defaultValue === 'string' &&
                !noDefaultLookup[formField.id]
              ) {
                value = defaultValue;
              }

              if (value) {
                formField.setValue(value, CStudioRemote[formField.id]);
              } else {
                formField.setValue('');
              }

              // if the field has a default value set, set it to the defaultValuesLookup
              if (defaultValue && typeof defaultValue === 'string') {
                defaultValuesLookup[formField.id] = defaultValue;
              }

              formField.fieldDef = this.fieldDef;
              try {
                if (lastTwo) {
                  const focusTimeout = setTimeout(function (lastTwo) {
                    for (var k = 0; k < formField.form.sections[0].fields.length; k++) {
                      var elt = formField.form.sections[0].fields[k].inputEl;
                      if (elt && !elt.disabled) {
                        if (
                          !['input', 'button', 'iframe', 'textarea', 'select'].includes(
                            document.activeElement.tagName.toLowerCase()
                          )
                        ) {
                          formField.form.sections[0].fields[k].inputEl.focus({ preventScroll: true });
                        }
                        return;
                      }
                    }
                  }, 1900);

                  fromEvent(window, 'message')
                    .pipe(filter((event) => event.data && event.data.type))
                    .subscribe((event) => {
                      if (event.data.type === 'CLEAR_FORM_INPUT_FOCUS_TIMEOUT') {
                        clearTimeout(focusTimeout);
                      }
                    });
                }
              } catch (err) {
                console.error(err);
              }
            } catch (e) {
              console.error(e);
            }
          },

          context: this,
          containerEl: fieldContainerEl,
          section: formSection,
          fieldDef: field,
          form: form,
          lastTwo: lastTwo
        };

        CStudioAuthoring.Module.requireModule(
          pluginInfo.prefix,
          pluginInfo.path,
          {
            config: {
              field: field,
              repeatField: repeatField,
              repeatIndex: repeatIndex
            }
          },
          cb
        );

        if (pluginInfo.missingProp.length > 0) {
          pluginError.control.push(pluginInfo.missingProp);
        }
      },

      _renderInContextEdit: function (form, iceId) {
        var formDef = form.definition;
        form.sectionsMap = [];
        var sectionContainerEl = document.getElementById('ice-container');
        var sectionEl = document.getElementById('ice-body-controls');
        var sectionBodyEl = YDom.getElementsByClassName('cstudio-form-section-body', null, sectionContainerEl)[0];
        var formSection = new CStudioFormSection(form, sectionContainerEl);
        form.sectionsMap['ice'] = formSection;
        form.sections[0] = formSection;

        for (var i = 0; i < formDef.sections.length; i++) {
          var section = formDef.sections[i];

          for (var j = 0; j < section.fields.length; j++) {
            var field = section.fields[j];

            if (field) {
              if (field.iceId == iceId) {
                if (field.type != 'repeat') {
                  this._renderField(formDef, field, form, formSection, sectionBodyEl, null, null, true);
                  CStudioAuthoring.InContextEdit.autoSizeIceDialog();
                } else {
                  this._renderRepeat(formDef, field, form, formSection, sectionBodyEl);
                  CStudioAuthoring.InContextEdit.autoSizeIceDialog();
                }
              }
            }
          }
        }
      },

      /* Render a list of fields from the form */
      /* fields: string[] - fields ids */
      _renderFields: function (form, fields, fieldsIndexes) {
        const formDef = form.definition;
        const sectionContainerEl = document.getElementById('ice-container');
        const sectionBodyEl = YDom.getElementsByClassName('cstudio-form-section-body', null, sectionContainerEl)[0];
        const formSection = new CStudioFormSection(form, sectionContainerEl);
        // Only base fields (no subfields dot-separated).
        // baseFields will be an array of objects with the baseField, full field and the index from fieldsIndexes
        const fieldsData = fields.map((fieldId) => {
          return {
            id: fieldId,
            baseField: fieldId.replace(/(\.).+$/, ''),
            index: fieldsIndexes?.[fieldId]
          };
        });

        formDef.sections.forEach((section) => {
          section.fields
            .filter((field) => fieldsData.find((fieldData) => fieldData.baseField === field.id))
            .forEach((field) => {
              if (field.type !== 'repeat') {
                this._renderField(formDef, field, form, formSection, sectionBodyEl, null, null, true);
                CStudioAuthoring.InContextEdit.autoSizeIceDialog();
              } else {
                const fieldData = fieldsData.find((fieldData) => fieldData.baseField === field.id);
                const fieldIndex = fieldData.index;
                this._renderRepeat(formDef, field, form, formSection, sectionBodyEl, fieldIndex);
                CStudioAuthoring.InContextEdit.autoSizeIceDialog();
              }
            });
        });
      },

      /**
       * refresh the page name and page location
       */
      _reRenderPageLocation: function (formDef) {
        var pageEl = document.getElementById('page-name');
        var locationEl = document.getElementById('page-location');

        if (pageEl) {
          pageEl.textContent = formDef.pageName;
        }

        if (locationEl) {
          locationEl.textContent = formDef.pageLocation;
        }
      },

      /**
       * draw the html for the form
       */
      _renderFormLayout: function (form) {
        // long term even the layout should be delegated to a pluggable module
        // for now we'll start with delegation of widgets
        var formDef = form.definition;
        var html = '';

        // Update the window title
        window.document.title = formDef.pageName ? formDef.title + ' | ' + formDef.pageName : formDef.title;

        $('header').show();
        $('.page-header h1 .header').text(
          formDef.pageName ? formDef.pageName : CMgs.format(formsLangBundle, 'new') + ' ' + formDef.title
        );
        if (formDef.title) {
          $('.page-header h1 .name').addClass('has-page-name').text(formDef.title);
        }
        if (formDef.pageLocation) {
          $('.page-header h1 .location').text(formDef.pageLocation);
        }
        $('.page-description').text(formDef.description);
        $('#cstudio-form-expand-all').text(CMgs.format(formsLangBundle, 'expandAll'));
        $('#cstudio-form-collapse-all').text(CMgs.format(formsLangBundle, 'collapseAll'));

        html =
          "<div id='cstudio-form-readonly-banner' class='hidden'>READ ONLY</div>" +
          '<div class="container">' +
          '<div class="panel-group">';

        for (var i = 0; i < formDef.sections.length; i++) {
          var section = formDef.sections[i];

          html += "<div id='" + section.id + "-container' class='panel panel-default'>";

          html +=
            "<div id='" +
            encodeURIComponent(section.id) +
            "-heading' class='panel-heading'>" +
            '<div class="cstudio-form-section-widget"></div>' +
            '<div class="cstudio-form-section-indicator fa f18"></div>' +
            '<h2 class="panel-title">' +
            CrafterCMSNext.util.string.escapeHTML(section.title) +
            '</h2>' +
            '<span class="cstudio-form-section-validation"></span>' +
            '</div>';

          html +=
            '<div id="' +
            encodeURIComponent(section.id) +
            '-body" class="panel-collapse collapse in">' +
            '<div class="panel-body">' +
            (section.description ? '<p>' + CrafterCMSNext.util.string.escapeHTML(section.description) + '</p>' : '') +
            '<div id="' +
            section.id +
            '-body-controls"></div>' +
            '</div>' +
            '</div>';

          html += '</div>';
        }

        html +=
          '</div>' +
          '</div>' +
          "<div class='cstudio-form-controls-container'></div>" +
          "<div id='ajax-overlay'><div class='ajax-loader'></div></div>";

        return html;
      },

      /**
       * draw the html for the ICE form
       */
      _renderIceLayout: function (form) {
        var formDef = form.definition;
        var html = '';

        html = "<div class='cstudio-form-container-ice'>";

        html += "<div id='cstudio-form-readonly-banner' class='hidden'>READ ONLY</div>";

        html += "<div id='ice-container'>";
        html +=
          "<div id='ice-body'  class='cstudio-form-section-body'>" + // secion body
          "<div id='ice-body-controls'>" + // section controls
          '</div>' +
          '</div>';
        html += '</div>';
        html += '</div>'; // end form

        html += "<div class='cstudio-form-controls-container'>" + '</div>'; // command bar
        html += '</div>';

        return html;
      }
    };

    // Utility Methods

    cfe.Util = {
      /**
       * internal menthod
       * load form definition from repository
       * @param formId
       *      path to the form you want to render
       */
      loadFormDefinition: function (formId, cb) {
        var configCb = {
          success: function (config) {
            // make sure the json is correct
            var def = config;
            def.contentType = formId;

            // handle datasources

            if (!def.datasources || typeof def.datasources === 'string') {
              def.datasources = [];
            } else {
              def.datasources = def.datasources.datasource;
            }

            if (!def.datasources.length) {
              def.datasources = [].concat(def.datasources);
            }

            for (var k = 0; k < def.datasources.length; k++) {
              var datasource = def.datasources[k];
              datasource.form = def;

              if (!datasource.properties || !datasource.properties.property) {
                datasource.properties = [];
              } else {
                datasource.properties = datasource.properties.property;
                if (!datasource.properties.length) {
                  datasource.properties = [].concat(datasource.properties);
                }
              }
            }

            // handle form properties
            if (!def.properties || !def.properties.property) {
              def.properties = [];
            } else {
              def.properties = def.properties.property;
              if (!def.properties.length) {
                def.properties = [def.properties];
              }
            }

            // handle form dections
            if (!def.sections || !def.sections.section) {
              def.sections = [];
            } else {
              def.sections = def.sections.section;
              if (!def.sections.length) {
                def.sections = [].concat(def.sections);
              }
            }

            for (var i = 0; i < def.sections.length; i++) {
              var section = def.sections[i];
              section.form = def;

              var sectionId = section.title.replace(/ /g, '');
              section.id = sectionId;

              processFieldsFn = function (container) {
                if (!container.fields || !container.fields.field) {
                  container.fields = [];
                } else {
                  container.fields = container.fields.field;
                  if (!container.fields.length) {
                    container.fields = [].concat(container.fields);
                  }
                }

                for (var j = 0; j < container.fields.length; j++) {
                  var field = container.fields[j];
                  if (field) {
                    if (!field.properties || !field.properties.property) {
                      field.properties = [];
                    } else {
                      field.properties = field.properties.property;
                      if (!field.properties.length) {
                        field.properties = [].concat(field.properties);
                      }
                    }

                    if (!field.constraints || !field.constraints.constraint) {
                      field.constraints = [];
                    } else {
                      field.constraints = field.constraints.constraint;

                      if (!field.constraints.length) {
                        field.constraints = [].concat(field.constraints);
                      }
                    }

                    if (field.type == 'repeat') {
                      processFieldsFn(field);
                    }
                  }
                }
              };

              processFieldsFn(section);
            }

            // notify
            cb.success(def);
          },
          failure: function (e) {
            cb.failure(e);
          }
        };

        CStudioAuthoring.Service.lookupConfigurtion(
          CStudioAuthoringContext.site,
          '/content-types/' + formId + '/form-definition.xml',
          configCb
        );
      },

      /**
       * internal menthod
       * load Config from repository
       * @param formId
       *      path to the form you want to render
       */
      loadConfig: function (formId, cb) {
        var configCb = {
          success: function (config) {
            // make sure the json is correct
            var conf = config;
            conf.contentType = formId;

            // notify
            cb.success(conf);
          },
          failure: function () {}
        };

        CStudioAuthoring.Service.lookupConfigurtion(
          CStudioAuthoringContext.site,
          '/content-types/' + formId + '/config.xml',
          configCb
        );
      },

      /**
       * Load the form field controller and form configuration
       */
      LoadFormConfig: function (formId, cb) {
        var configCb = {
          success: function (formConfig) {
            cb.success(undefined, formConfig);
          },
          failure: function () {
            cb.failure();
          }
        };

        CStudioAuthoring.Service.lookupConfigurtion(
          CStudioAuthoringContext.site,
          '/content-types/' + formId + '/config.xml',
          configCb
        );
      },

      /**
       * Getting the value of some item
       */
      getModelItemValue: function (item) {
        var value = '';

        try {
          if (YAHOO.env.ua.ie > 0) {
            //The browser is Internet Explorer
            value = !item.nodeValue ? item.firstChild.nodeValue : item.nodeValue;
          } else {
            value = !item.wholeText ? item.firstChild.wholeText : item.wholeText;
          }
        } catch (npe) {
          value = '';
        }

        return value;
      },

      /**
       * Initialize Attribute Object
       */
      initAttributeObject: function (contentDom, attribute) {
        var children = contentDom.children ? contentDom.children : contentDom.childNodes;
        var child, attributes;
        for (var i = 0; i < children.length; i++) {
          try {
            child = children[i];
            if (child.nodeName != '#text') {
              attributes = child.attributes;
              for (var j = 0; j < attributes.length; j++) {
                if (child.attributes[j].nodeName == attribute) {
                  CStudioRemote[child.nodeName] = true;
                }
              }
            }
          } catch (err) {
            console.log(err);
          }
        }
      },

      /**
       * take an xml content item and turn it in to a property map
       */
      xmlModelToMap: function (dom) {
        var map = {};
        var children = dom.children ? dom.children : dom.childNodes;

        this.xmlModelToMapChildren(map, children);

        /* make sure object has IDs */
        if (!map['objectId']) {
          var UUID = CStudioAuthoring.Utils.generateUUID();
          var groupId = UUID.substring(0, 4);
          map['objectGroupId'] = groupId;
          map['objectId'] = UUID;
        }

        return map;
      },

      xmlModelToMapChildren: function (node, children) {
        for (var i = 0; i < children.length; i++) {
          try {
            var child = children[i];
            if (child.nodeName != '#text') {
              // Chrome and FF support childElementCount; for IE we will get the length of the childNodes collection
              var hasChildren =
                typeof child.childElementCount == 'number'
                  ? !!child.childElementCount
                  : !!child.childNodes.length && child.firstChild.nodeName != '#text';

              if (hasChildren) {
                this.xmlModelToMapArray(node, child);
              } else {
                node[child.nodeName] = this.getModelItemValue(child);

                // while parsing the xml, if a `no-default` attribute is found, add it to the lookup
                if (child.getAttribute('no-default')) {
                  noDefaultLookup[child.nodeName] = true;
                }
              }
            }
          } catch (err) {}
        }
      },

      xmlModelToMapArray: function (node, child) {
        // array/repeat item
        node[child.nodeName] = [];

        var repeatCount = 0;
        var repeatChildren = child.children ? child.children : child.childNodes;

        for (var j = 0; j < repeatChildren.length; j++) {
          try {
            var repeatChild = repeatChildren[j];

            if (repeatChild.nodeName != '#text') {
              node[child.nodeName][repeatCount] = {};
              //checking if the node has the attribute 'data-source'
              node[child.nodeName][repeatCount] = repeatChild.getAttribute('datasource')
                ? {
                    datasource: repeatChild.getAttribute('datasource')
                  }
                : {};
              var repeatChildChildren = repeatChild.children ? repeatChild.children : repeatChild.childNodes;

              for (var k = 0; k < repeatChildChildren.length; k++) {
                var repeatField = repeatChildChildren[k];

                if (repeatField.nodeName != '#text' && repeatField.nodeName != 'component') {
                  if (repeatField.childElementCount > 0) {
                    this.xmlModelToMapArray(node[child.nodeName][repeatCount], repeatField);
                  } else {
                    var value = '';

                    try {
                      //value = (!repeatField.wholeText) ?
                      //  repeatField.firstChild.wholeText : repeatField.wholeText;
                      value = this.getModelItemValue(repeatField);
                    } catch (noValue) {}

                    // while parsing the xml (in repeating group), if a `no-default` attribute is found, add it to the lookup
                    if (repeatField.getAttribute('no-default')) {
                      noDefaultLookup[`${child.nodeName}|${repeatCount}|${repeatField.nodeName}`] = true;
                    }

                    node[child.nodeName][repeatCount][repeatField.nodeName] = this.unEscapeXml(value);
                  }
                }
              }

              //getting values from attributes
              Array.from(repeatChild.attributes).forEach((attr) => {
                const { nodeName, nodeValue } = attr;
                node[child.nodeName][repeatCount] = { ...node[child.nodeName][repeatCount], [nodeName]: nodeValue };
              });

              repeatCount++;
            }
          } catch (repeatErr) {
            CStudioAuthoring.Operations.showSimpleDialog(
              'error-dialog',
              CStudioAuthoring.Operations.simpleDialogTypeINFO,
              CMgs.format(formsLangBundle, 'notification'),
              CMgs.format(formsLangBundle, 'errOnRepeat'),
              '' + repeatErr,
              null,
              YAHOO.widget.SimpleDialog.ICON_BLOCK,
              'studioDialog'
            );
          }
        }
      },

      createFlattenerState: function (dom) {
        const components = Array.from(dom.querySelectorAll(`item > component`));
        components.forEach((component) => {
          FlattenerState[component.getAttribute('id')] = component.outerHTML;
        });
      },

      serializeModelToXml: function (form, saveDraft) {
        var xml = '<' + form.definition.objectType + '>\r\n';

        if (saveDraft) {
          xml += '\t<savedAsDraft>true</savedAsDraft>\n';
        }

        xml += '\t<content-type>' + form.definition.contentType + '</content-type>\n';

        if (form.definition.properties && form.definition.properties.length) {
          for (var i = 0; i < form.definition.properties.length; i++) {
            var property = form.definition.properties[i];
            if (property && property.name) {
              xml += '\t<' + property.name + '>';
              xml += this.escapeXml(property.value);
              xml += '</' + property.name + '>\r\n';
            }
          }
        }

        xml += this.printFieldsToXml(form.model, form.dynamicFields, form.definition.sections, form.definition.config);

        xml += '</' + form.definition.objectType + '>';

        xml = xml.replaceAll('', '');

        if (!cfe.engine.config.isInclude) {
          const doc = parseDOM(xml);
          xml = resolvePendingComponents(doc);
        }

        return xml;
      },

      printFieldsToXml: function (formModel, formDynamicFields, formSections, formConfig) {
        var fieldInstructions = [];
        var fieldLists = [];
        var validFields = [
            '$!',
            'objectGroupId',
            'objectId',
            'folder-name',
            'createdDate',
            'createdDate_dt',
            'lastModifiedDate',
            'lastModifiedDate_dt',
            'components',
            'orderDefault_f',
            'placeInNav',
            'rteComponents'
          ],
          output = '',
          validFieldsStr,
          fieldRe,
          section;

        // Add valid fields from the ones created dynamically by controls
        if (formDynamicFields && formDynamicFields.length > 0) {
          validFields = validFields.concat(formDynamicFields);
        }

        // Add valid fields from form sections

        function getValidFields(section, isRepeat) {
          section.fields.forEach((field) => {
            let fieldId = isRepeat ? `${section.id}.${field.id}` : field.id;
            validFields.push(fieldId);
            let fieldInstruction = { tokenize: false };
            fieldInstructions[fieldId] = fieldInstruction;
            let fieldList = { list: false };
            fieldLists[fieldId] = fieldList;

            field.properties.forEach((property) => {
              try {
                if (property.name == 'tokenize' && property.value == 'true') {
                  fieldInstruction.tokenize = true;
                }
              } catch (err) {
                CStudioAuthoring.Operations.showSimpleDialog(
                  'error-dialog',
                  CStudioAuthoring.Operations.simpleDialogTypeINFO,
                  CMgs.format(formsLangBundle, 'notification'),
                  err,
                  null,
                  YAHOO.widget.SimpleDialog.ICON_BLOCK,
                  'studioDialog'
                );
              }
            });

            if (field.type === 'repeat' || field.type === 'node-selector') {
              fieldList.list = true;
              if (field.fields) {
                getValidFields(field, true);
              }
            }
          });
        }

        formSections.forEach((section) => {
          getValidFields(section);
        });

        // Add valid fields from form config
        if (formConfig && formConfig.customFields) {
          for (var i in formConfig.customFields) {
            if (formConfig.customFields.hasOwnProperty(i)) {
              if (formConfig.customFields[i].removeOnChangeType == 'false') {
                validFields.push(formConfig.customFields[i].name);
              }
            }
          }
        }

        validFields.push('$!'); // End element
        validFieldsStr = validFields.join(',');

        for (var key in formModel) {
          var attributes = [' '],
            fieldInstruction = fieldInstructions[key],
            fieldList = fieldLists[key],
            invalidFields = [],
            modelItem = formModel[key],
            isModelItemArray = Object.prototype.toString.call(modelItem) === '[object Array]';

          try {
            if (fieldInstruction && fieldInstruction.tokenize == true) {
              attributes.push('tokenized="true"');
            }
            if (fieldList && fieldList.list == true) {
              attributes.push('item-list="true"');
            }
            if (CStudioRemote[key] && !isModelItemArray) {
              attributes.push('remote="true"');
            }
            // If item has a default value and current value is empty or doesn't exist, add the `no-default` attribute.
            // model Item may be an array (repeating group item) so we're only considering string values.
            if (defaultValuesLookup[key] && typeof modelItem === 'string' && modelItem?.replace(/\s+/g, '') === '') {
              attributes.push('no-default="true"');
            }
          } catch (err) {
            CStudioAuthoring.Operations.showSimpleDialog(
              'error-dialog',
              CStudioAuthoring.Operations.simpleDialogTypeINFO,
              CMgs.format(formsLangBundle, 'notification'),
              err,
              null,
              YAHOO.widget.SimpleDialog.ICON_BLOCK,
              'studioDialog'
            );
          }

          if (attributes.length === 1) {
            attributes.pop();
          }

          // Because we added start and end elements, we can be sure that any field names will
          // be delimited by the delimiter token (ie. comma)
          fieldRe = new RegExp(',' + key + '(?:,||d+|)', 'g');

          if (fieldRe.test(validFieldsStr)) {
            if (isModelItemArray) {
              output += '\t<' + key + attributes.join(' ') + '>';
              output = this.recursiveRetrieveItemValues(modelItem, output, key, fieldInstructions);
              output += '</' + key + '>\r\n';
            } else {
              output += '\t<' + key + ' ' + attributes.join(' ') + ' >';
              output += this.escapeXml(modelItem);
              output += '</' + key + '>\r\n';
            }
          } else {
            invalidFields[invalidFields.length] = key;
          }
        }

        // TODO: This needs the code above to be move in to a reusable place and then placed
        // outside the save process so that user has a choice to cancel.
        // this also needs a real dialog and more information about the fields
        // instead of an ugly system name
        //if(invalidFields.length > 0) {
        //    var invalidFieldsMsg =
        //    "The following fields were found in the content due to a model change and will not be saved: \n";
        //    for(var g=0; g<invalidFields.length; g++) {
        //       invalidFieldsMsg + "\t"+invalidFields[length]+"\n";
        //    }
        //    alert(invalidFieldsMsg);
        //}

        return output;
      },

      recursiveRetrieveItemValues: function (item, output, key, fieldInstructions) {
        item.forEach((repeatItem, index) => {
          let attributes;
          attributes = repeatItem.datasource ? `datasource=\"${repeatItem.datasource}\"` : '';
          if (repeatItem.inline) {
            attributes += ` inline=\"${repeatItem.inline}\"`;
          }
          output += `\t<item ${attributes}>`;
          for (var fieldName in repeatItem) {
            if (fieldName !== 'datasource' && fieldName !== 'inline' && fieldName !== 'component') {
              var repeatValue = repeatItem[fieldName],
                isRemote = CStudioRemote[key] && fieldName === 'url' ? true : false,
                isArray = Object.prototype.toString.call(repeatValue).indexOf('[object Array]') != -1,
                isTokenized =
                  !!fieldInstructions[`${key}.${fieldName}`] &&
                  fieldInstructions[`${key}.${fieldName}`].tokenize === true,
                repeatAttr = `${isRemote ? 'remote="true"' : ''} ${isArray ? 'item-list="true"' : ''} ${
                  isTokenized ? 'tokenized="true"' : ''
                }`;

              // using `${parentFieldName}|${repeatItemIndex}|${fieldName}` as the fieldId. That's how the forms-engine
              // handles the repeating groups ids.
              const fieldId = `${key}|${index}|${fieldName}`;
              const attributes = [];

              // Validating to add `no-default` in repeating group items
              // this is only for string values that can be blanked, for them not to be repopulated with default values.
              if (
                defaultValuesLookup[fieldId] &&
                typeof repeatValue === 'string' &&
                repeatValue.replace(/\s+/g, '') === ''
              ) {
                attributes.push('no-default="true"');
              }

              output += `\t<${fieldName} ${repeatAttr} ${attributes.join(' ')}>`;
              if (isArray) {
                output = this.recursiveRetrieveItemValues(repeatValue, output, key, fieldInstructions);
              } else {
                output += this.escapeXml(repeatValue);
              }
              output += '</' + fieldName + '>\r\n';
            } else if (repeatItem.inline === 'true' && fieldName === 'inline') {
              const objId = repeatItem['key'];
              output += (FlattenerState[objId] ? FlattenerState[objId] : `<component id="${objId}"/>`) + '\n';
            }
          }
          output += '\t</item>';
        });
        return output;
      },

      escapeXml: function (value) {
        if (value && typeof value === 'string') {
          value = value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }

        return value;
      },

      unEscapeXml: function (value) {
        if (value && typeof value === 'string') {
          value = value
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&');
        }

        return value;
      },

      defaultSectionTitle: 'Default Section Title'
    };

    return cfe;
  })();

CStudioAuthoring.Module.moduleLoaded('cstudio-forms-engine', CStudioForms);
