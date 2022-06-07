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

var YDom = YAHOO.util.Dom;
var YEvent = YAHOO.util.Event;

CStudioAuthoring.Dialogs = CStudioAuthoring.Dialogs || {};

/**
 * NewContentType
 */
CStudioAuthoring.Dialogs.NewContentType = CStudioAuthoring.Dialogs.NewContentType || {
  /**
   * initialize module
   */
  initialize: function (config) {
    this.config = config;
  },

  /**
   * show dialog
   */
  showDialog: function (cb, config) {
    this.config = config;
    this._self = this;
    this.cb = cb;
    this.dialog = this.createDialog();
    this.dialog.show();
    document.getElementById('cstudio-wcm-popup-div_h').style.display = 'none';
  },

  /**
   * hide dialog
   */
  closeDialog(didCreate) {
    !didCreate &&
      CStudioAuthoring.Dialogs.NewContentType.cb &&
      CStudioAuthoring.Dialogs.NewContentType.cb.close &&
      CStudioAuthoring.Dialogs.NewContentType.cb.close(!!didCreate);
    this.dialog.destroy();
  },

  onSetDirty(value) {
    window.top.postMessage(
      {
        type: 'CONTENT_TYPES_ON_SUBMITTING_OR_PENDING_CHANGES_MESSAGE',
        payload: { hasPendingChanges: value }
      },
      '*'
    );
  },

  /**
   * create dialog
   */
  createDialog: function () {
    const self = this;
    YDom.removeClass('cstudio-wcm-popup-div', 'yui-pe-content');

    var newdiv = YDom.get('cstudio-wcm-popup-div'),
      me = this;

    if (newdiv == undefined) {
      newdiv = document.createElement('div');
      document.body.appendChild(newdiv);
    }

    var divIdName = 'cstudio-wcm-popup-div';
    newdiv.setAttribute('id', divIdName);
    newdiv.className = 'yui-pe-content';
    newdiv.innerHTML =
      '<div class="contentTypePopupInner" id="upload-popup-inner">' +
      '<div class="contentTypePopupContent" id="contentTypePopupContent"> ' +
      '<div class="contentTypePopupHeader">' +
      CMgs.format(formsLangBundle, 'newContTypeDialogTitle') +
      '</div> ' +
      '<div class="content">' +
      '<div class="contentTypeOuter">' +
      '<label for="contentTypeDisplayName"><span>' +
      CMgs.format(formsLangBundle, 'newContTypeDialogDisplayLabel') +
      ':</span>' +
      '<input title="' +
      CMgs.format(formsLangBundle, 'newContTypeDialogLabelMsg') +
      '" id="contentTypeDisplayName" type="text" autofocus focus-me="true"></label>' +
      '<label for="contentTypeName"><span>' +
      CMgs.format(formsLangBundle, 'newContTypeDialogContentTypeName') +
      ':</span>' +
      '<input style="disabled" title="' +
      CMgs.format(formsLangBundle, 'newContTypeDialogContentTypeNamelMsg') +
      '" id="contentTypeName" type="text"></label>' +
      '<div class="selectInput">' +
      `<label for="contentTypeObjectType">${CMgs.format(formsLangBundle, 'newContTypeDialogType')}:</label>` +
      `<select title="${CMgs.format(formsLangBundle, 'newContTypeDialogTypeMsg')}" id="contentTypeObjectType">` +
      '</select></div>' +
      '<label style="display:none;" class="checkboxInput" for="contentTypeAsFolder"><span>Model as index (content as folder)</span>' +
      '<input style="display:none;" id="contentTypeAsFolder" type="checkbox" checked="true"></label>' +
      '</div>' +
      '<div class="contentTypePopupBtn"> ' +
      `<input type="button" class="btn btn-default cstudio-button" id="createCancelButton" value="${CMgs.format(
        formsLangBundle,
        'cancel'
      )}" />` +
      `<input type="button" class="btn btn-primary cstudio-button ok" id="createButton" value="${CMgs.format(
        formsLangBundle,
        'create'
      )}" disabled="disabled" />` +
      '</div>' +
      '</div>';

    document.getElementById('upload-popup-inner').style.width = '350px';
    document.getElementById('upload-popup-inner').style.height = '270px';

    var objectTypes;

    if (this.config.objectTypes.type != undefined) {
      objectTypes = this.config.objectTypes.type;
    } else {
      objectTypes = this.config.objectTypes[0];
    }

    if (!objectTypes.length) {
      objectTypes = [objectTypes];
    }

    var typeEl = document.getElementById('contentTypeObjectType');
    for (var k = 0; k < objectTypes.length; k++) {
      var objectType = objectTypes[k];
      typeEl.options[typeEl.options.length] = new Option(
        CMgs.format(formsLangBundle, objectType.label.toLowerCase()),
        objectType.name
      );
    }

    // Instantiate the Dialog
    var dialog = new YAHOO.widget.Dialog('cstudio-wcm-popup-div', {
      width: '360px',
      effect: {
        effect: YAHOO.widget.ContainerEffect.FADE,
        duration: 0.25
      },
      fixedcenter: true,
      visible: false,
      modal: true,
      close: false,
      constraintoviewport: true,
      underlay: 'none'
    });

    // Render the Dialog
    dialog.render();
    setTimeout(function () {
      $('#contentTypeDisplayName').focus();
    }, 200);

    this.buttonValidator('createButton', { contentTypeDisplayName: [/^$/] });

    var eventParams = {
      self: this,
      typeNameEl: document.getElementById('contentTypeName'),
      labelEl: document.getElementById('contentTypeDisplayName'),
      asFolderEl: document.getElementById('contentTypeAsFolder'),
      objectTypeEl: document.getElementById('contentTypeObjectType')
    };

    // 'Type' dropdown
    YEvent.on('contentTypeObjectType', 'change', function () {
      self.onSetDirty(true);

      var type = document.getElementById('contentTypeObjectType').value;
      if (type == 'page') {
        document.getElementById('contentTypeAsFolder').checked = true;
      } else {
        document.getElementById('contentTypeAsFolder').checked = false;
      }
    });

    // 'Display Label' input
    YEvent.on('contentTypeDisplayName', 'keyup', function () {
      YAHOO.Bubbling.fire('content-type.values.changed');
      value = document.getElementById('contentTypeDisplayName').value;

      value = value.replace(/[^a-z0-9]/gi, '');
      value = value.toLowerCase();

      self.onSetDirty(Boolean(value));

      document.getElementById('contentTypeName').value = value;
    });

    YEvent.addListener('createButton', 'click', this.createClick, eventParams);

    YEvent.addListener('createCancelButton', 'click', this.popupCancelClick);

    YEvent.addListener('createCancelButton', 'click', this.popupCancelClick);

    $(document).on('keyup', function (e) {
      if (e.keyCode === 27) {
        // esc
        me.popupCancelClick();
        $(document).off('keyup');
      }
    });

    return dialog;
  },

  /**
   * create clicked
   */
  createClick: function (event, params) {
    var label = CStudioAuthoring.Dialogs.NewContentType.xmlEscape(params.labelEl.value);
    var name = CStudioAuthoring.Dialogs.NewContentType.xmlEscape(params.typeNameEl.value);
    var type = CStudioAuthoring.Dialogs.NewContentType.xmlEscape(params.objectTypeEl.value);
    var contentAsFolder = type == 'component' ? false : params.asFolderEl.checked;
    const basePath = `/content-types/${type}/${name}/`;

    var typeConfig =
      '<content-type name="/' +
      type +
      '/' +
      name +
      '" is-wcm-type="true">\r\n' +
      '<label>' +
      label +
      '</label>\r\n' +
      '<form>/' +
      type +
      '/' +
      name +
      '</form>\r\n' +
      '<form-path>simple</form-path>\r\n' +
      '<model-instance-path>NOT-USED-BY-SIMPLE-FORM-ENGINE</model-instance-path>\r\n' +
      '<file-extension>xml</file-extension>\r\n' +
      '<content-as-folder>' +
      contentAsFolder +
      '</content-as-folder>\r\n' +
      '<previewable>' +
      (type == 'page') +
      '</previewable>\r\n' +
      '<quickCreate>false</quickCreate>\r\n' +
      '<quickCreatePath></quickCreatePath>\r\n' +
      '<noThumbnail>true</noThumbnail>\r\n' +
      '<image-thumbnail></image-thumbnail>\r\n' +
      '</content-type>';

    const controllerContent =
      'import scripts.libs.CommonLifecycleApi;\r\n\r\n' +
      'def contentLifecycleParams =[:];\r\n' +
      'contentLifecycleParams.site = site;\r\n' +
      'contentLifecycleParams.path = path;\r\n' +
      'contentLifecycleParams.user = user;\r\n' +
      'contentLifecycleParams.contentType = contentType;\r\n' +
      'contentLifecycleParams.contentLifecycleOperation = contentLifecycleOperation;\r\n' +
      'contentLifecycleParams.contentLoader = contentLoader;\r\n' +
      'contentLifecycleParams.applicationContext = applicationContext;\r\n\r\n' +
      'def controller = new CommonLifecycleApi(contentLifecycleParams);\r\n' +
      'controller.execute();\r\n';

    const context = CStudioAuthoring.Dialogs.NewContentType;
    let fileNameLabel = 'Page URL';
    if (type == 'component') {
      fileNameLabel = 'Component ID';
    }
    let formDefContent =
      '<form>\r\n' +
      '<title>' +
      label +
      '</title>\r\n' +
      '<description></description>\r\n' +
      '<content-type>/' +
      type +
      '/' +
      name +
      '</content-type>\r\n' +
      '<objectType>' +
      type +
      '</objectType>\r\n' +
      '<quickCreate>false</quickCreate>\r\n' +
      '<quickCreatePath></quickCreatePath>\r\n' +
      '<properties>\r\n' +
      '<property>\r\n' +
      '<name>content-type</name>\r\n' +
      '<label>Content Type</label>\r\n' +
      '<value>/' +
      type +
      '/' +
      name +
      '</value>\r\n' +
      '<type>string</type>\r\n' +
      '</property>\r\n';

    if (!context.config.objectTypes.type.length) {
      context.config.objectTypes.type = [context.config.objectTypes.type];
    }

    for (var k = 0; k < context.config.objectTypes.type.length; k++) {
      var objectType = context.config.objectTypes.type[k];

      if (objectType.name == type) {
        if (!objectType.properties.property.length) {
          objectType.properties.property = [objectType.properties.property];
        }

        var typeProps = objectType.properties.property;

        for (var j = 0; j < typeProps.length; j++) {
          var typeProperty = typeProps[j];

          formDefContent +=
            '<property>\r\n' +
            '<name>' +
            typeProperty.name +
            '</name>\r\n' +
            '<label>' +
            typeProperty.label +
            '</label>\r\n' +
            '<value>' +
            typeProperty.value +
            '</value>\r\n' +
            '<type>' +
            typeProperty.type +
            '</type>\r\n' +
            '</property>\r\n';
        }
        break;
      }
    }

    formDefContent +=
      '</properties>\r\n' +
      '<sections>\r\n' +
      '<section>\r\n' +
      '<title>' +
      label +
      ' Properties</title>\r\n' +
      '<description></description>\r\n' +
      '<defaultOpen>true</defaultOpen>\r\n' +
      '<fields>\r\n' +
      '<field>\r\n';
    if (type == 'component') {
      formDefContent += '<type>auto-filename</type>\r\n';
    } else {
      formDefContent += '<type>file-name</type>\r\n';
    }
    formDefContent +=
      '<id>file-name</id>\r\n' +
      '<iceId></iceId>\r\n' +
      '<title>' +
      fileNameLabel +
      '</title>\r\n' +
      '<description></description>\r\n' +
      '<defaultValue></defaultValue>\r\n' +
      '<help></help>\r\n' +
      '<properties>\r\n' +
      '<property>\r\n' +
      '<name>size</name>\r\n' +
      '<value>50</value>\r\n' +
      '<type>int</type>\r\n' +
      '</property>\r\n' +
      '<property>\r\n' +
      '<name>maxlength</name>\r\n' +
      '<value>50</value>\r\n' +
      '<type>int</type>\r\n' +
      '</property>\r\n' +
      '<property>\r\n' +
      '<name>readonly</name>\r\n' +
      '<value></value>\r\n' +
      '<type>boolean</type>\r\n' +
      '</property>\r\n' +
      '</properties>\r\n' +
      '<constraints>\r\n' +
      '</constraints>\r\n' +
      '</field>\r\n' +
      '<field>\r\n' +
      '<type>input</type>\r\n' +
      '<id>internal-name</id>\r\n' +
      '<iceId></iceId>\r\n' +
      '<title>Internal Name</title>\r\n' +
      '<description></description>\r\n' +
      '<defaultValue></defaultValue>\r\n' +
      '<help></help>\r\n' +
      '<properties>\r\n' +
      '<property>\r\n' +
      '<name>size</name>\r\n' +
      '<value>50</value>\r\n' +
      '<type>int</type>\r\n' +
      '</property>\r\n' +
      '<property>\r\n' +
      '<name>maxlength</name>\r\n' +
      '<value>50</value>\r\n' +
      '<type>int</type>\r\n' +
      '</property>\r\n' +
      '</properties>\r\n' +
      '<constraints>\r\n' +
      '<constraint>\r\n' +
      '<name>required</name>\r\n' +
      '<value>true</value>\r\n' +
      '<type>boolean</type>\r\n' +
      '</constraint>\r\n' +
      '</constraints>\r\n' +
      '</field>';

    if (type == 'page') {
      // prettier-ignore
      formDefContent +=
        '<field>\r\n' +
          '<type>page-nav-order</type>\r\n' +
          '<id>placeInNav</id>\r\n' +
          '<iceId></iceId>\r\n' +
          '<title>Place in Nav</title>\r\n' +
          '<description></description>\r\n' +
          '<defaultValue></defaultValue>\r\n' +
          '<help></help>\r\n' +
          '<properties>\r\n' +
            '<property>\r\n' +
              '<name>readonly</name>\r\n' +
              '<value>[]</value>\r\n' +
              '<type>boolean</type>\r\n' +
            '</property>\r\n' +
          '</properties>\r\n' +
          '<constraints>\r\n' +
            '<constraint>\r\n' +
              '<name>required</name>\r\n' +
              '<value><![CDATA[]]></value>\r\n' +
              '<type>boolean</type>\r\n' +
            '</constraint>\r\n' +
          '</constraints>\r\n' +
        '</field>' +
        '<field>\r\n' +
          '<type>input</type>\r\n' +
          '<id>navLabel</id>\r\n' +
          '<iceId></iceId>\r\n' +
          '<title>Nav Label</title>\r\n' +
          '<description></description>\r\n' +
          '<defaultValue></defaultValue>\r\n' +
          '<help></help>\r\n' +
          '<properties>\r\n' +
            '<property>\r\n' +
              '<name>size</name>\r\n' +
              '<value>50</value>\r\n' +
              '<type>int</type>\r\n' +
            '</property>\r\n' +
            '<property>\r\n' +
              '<name>maxlength</name>\r\n' +
              '<value>50</value>\r\n' +
              '<type>int</type>\r\n' +
            '</property>\r\n' +
          '</properties>\r\n' +
          '<constraints>\r\n' +
            '<constraint>\r\n' +
              '<name>required</name>\r\n' +
              '<value>true</value>\r\n' +
              '<type>boolean</type>\r\n' +
            '</constraint>\r\n' +
          '</constraints>\r\n' +
        '</field>\r\n';
    }

    formDefContent += '</fields>\r\n' + '</section>\r\n' + '</sections>\r\n' + '</form>';

    CrafterCMSNext.rxjs
      .forkJoin({
        config: CrafterCMSNext.services.configuration.writeConfiguration(
          CStudioAuthoringContext.site,
          `${basePath}config.xml`,
          'studio',
          typeConfig
        ),
        controller: CrafterCMSNext.services.configuration.writeConfiguration(
          CStudioAuthoringContext.site,
          `${basePath}controller.groovy`,
          'studio',
          controllerContent
        ),
        formDef: CrafterCMSNext.services.configuration.writeConfiguration(
          CStudioAuthoringContext.site,
          `${basePath}form-definition.xml`,
          'studio',
          formDefContent
        )
      })
      .subscribe(() => {
        CStudioAuthoring.Dialogs.NewContentType.closeDialog(true);
        CStudioAuthoring.Dialogs.NewContentType.cb.success('/' + type + '/' + name);
      });
  },

  /**
   * event fired when the ok is pressed
   */
  popupCancelClick: function (event) {
    CStudioAuthoring.Dialogs.NewContentType.closeDialog();
  },

  /**
   * Disables a specific button if one of the inputs in a list match a non-accepted value. Otherwise, enables the button.
   * This method listens to the onBlur events of the inputs it controls
   * @param buttonId : Id of the button to control
   * @param inputConfigObj : An object where the keys are IDs of the inputs, and the values are arrays of
   reg expressions with values that are invalid for the input
   */
  buttonValidator: function (buttonId, inputConfigObj) {
    var enableButton,
      button = YDom.get(buttonId),
      configObj = inputConfigObj,
      inputEl = null,
      regExp;

    var checkButton = function () {
      enableButton = true;

      controlLoop: for (var inputId in configObj) {
        if (configObj.hasOwnProperty(inputId)) {
          if ((inputEl = YDom.get(inputId))) {
            // Assign and test that input element exists
            for (var invalidValue in configObj[inputId]) {
              // Loop through all the invalid values
              if (inputEl.value.match(configObj[inputId][invalidValue])) {
                enableButton = false;
                break controlLoop;
              }
            }
          }
        }
      }

      if (button) {
        if (enableButton) {
          button.removeAttribute('disabled');
        } else {
          button.setAttribute('disabled', 'disabled');
        }
      }
    };

    YAHOO.Bubbling.on('content-type.values.changed', checkButton);
  },

  xmlEscape: function (value) {
    value = value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/&nbsp;/g, '&amp;nbsp;');

    return value;
  }
};

CStudioAuthoring.Module.moduleLoaded('new-content-type-dialog', CStudioAuthoring.Dialogs.NewContentType);
