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

var YDom = YAHOO.util.Dom;
var YEvent = YAHOO.util.Event;

CStudioAuthoring.Dialogs = CStudioAuthoring.Dialogs || {};

CStudioAuthoring.Dialogs.DialogSelectContentType = {
  /**
   * initialize module
   */
  initialize(config) {},

  changeTemplateCalled: false,
  /**
   * show dialog
   */
  showDialog(contentTypes, path, asPopup, onSaveCallback, isChangeTemplate, targetElement) {
    // Caching this here to avoid re-fetching on contentTypes selector.
    CStudioAuthoring.Dialogs.DialogSelectContentType.contentTypes = contentTypes;

    /**
     * indicating, from where showDialog is called (new/change template).
     */
    CStudioAuthoring.Dialogs.DialogSelectContentType.changeTemplateCalled = isChangeTemplate;

    this._self = this;

    this.dialog = this.createDialog(path, onSaveCallback, targetElement);

    this.path = path;
    this.onSaveCallback = onSaveCallback;
    this.asPopup = asPopup;
    this.formSize = null;

    this.updateAvailableTemplates(this.dialog, contentTypes);
    this.setDefaultTemplate(contentTypes);
    this.dialog.show();

    if (!targetElement) {
      if (0 === contentTypes.length) {
        $('#submitWCMPopup').attr('disabled', 'disabled');
      }

      if (window.frameElement) {
        var id = window.frameElement.getAttribute('id').split('-editor-')[1];
        this.formSize = typeof getFormSize === 'function' ? getFormSize : parent.getFormSize;
        if (this.formSize < 522) {
          parent.setFormSize(522, id);
          $($('.studio-ice-container-' + id, parent.document)[0]).attr('data-decrease', true);
        }
      }
    }
  },

  /**
   * hide dialog
   */
  hideDialog() {
    this.onSaveCallback && this.onSaveCallback.close && this.onSaveCallback.close();
    this.dialog.destroy();
  },

  /**
   * create dialog
   */
  createDialog(path, selectTemplateCb, elem) {
    var self = this;
    const isDialog = !elem;

    var newDiv = elem;
    if (!newDiv) {
      newDiv = document.createElement('div');
      document.body.appendChild(newDiv);
    }

    var divIdName = 'cstudio-wcm-popup-div';
    var CMgs = CStudioAuthoring.Messages;
    var formsLangBundle = CStudioAuthoring.Messages.getBundle('forms', CStudioAuthoringContext.lang);

    newDiv.setAttribute('id', divIdName);
    newDiv.className = 'yui-pe-content';
    newDiv.innerHTML =
      `<div class="contentTypePopupInner" id="ct_contentTypePopupInner">` +
      /**/ `<div class="contentTypePopupContent" id="ct_contentTypePopupContent">` +
      /****/ '<form name="contentFromWCM"> ' +
      /******/ `<div class="contentTypePopupHeader">${CMgs.format(formsLangBundle, 'chooseContentType')}</div>` +
      /******/ `<div>${CMgs.format(formsLangBundle, 'chooseContentTypeBody')}</div>` +
      /******/ '<div class="contentTypeOuter"> ' +
      /********/ '<div class="templateName" id="templateName"> ' +
      /**********/ '<div class="contentTypeDropdown">' +
      /************/ '<div>' +
      CMgs.format(formsLangBundle, 'chooseContentTypeLabel') +
      '</div>' +
      /************/ '<select id="wcm-content-types-dropdown" size="16" class="cstudio-wcm-popup-select-control" style="width:273px; height:275px;"></select> ' +
      /**********/ '</div>' +
      /********/ '</div>' +
      /********/ '<div class="previewImage" id="previewImage">' +
      /**********/ '<div class="contentTypePreview">' +
      /************/ '<div>' +
      CMgs.format(formsLangBundle, 'chooseContentTypePreview') +
      '</div>' +
      /************/ '<img src="' +
      CStudioAuthoringContext.baseUri +
      '/static-assets/themes/cstudioTheme/images/default-contentType.jpg' +
      '" id="contentTypePreviewImg" width="267px" height="275px" /> ' +
      /**********/ '</div>' +
      /********/ '</div>' +
      /******/ '</div>' +
      /******/ '<div class="contentTypePopupBtn"> ' +
      (isDialog
        ? /********/ '<input type="button" class="btn btn-default cstudio-xform-button cancel mr10" id="closeWCMPopup" value="' +
          CMgs.format(formsLangBundle, 'cancel') +
          '">'
        : '') +
      /********/ '<input type="submit" class="btn btn-primary cstudio-xform-button ok" id="submitWCMPopup" value="' +
      CMgs.format(formsLangBundle, 'openType') +
      '">' +
      /******/ '</div>' +
      /****/ '</form> ' +
      /**/ '</div> ' +
      '</div>';

    // Instantiate the Dialog
    var content_type_dialog = new YAHOO.widget.Dialog('cstudio-wcm-popup-div', {
      width: '610px',
      effect: {
        effect: YAHOO.widget.ContainerEffect.FADE,
        duration: 0.25
      },
      fixedcenter: isDialog,
      visible: true,
      modal: isDialog,
      close: false,
      constraintoviewport: isDialog,
      underlay: 'none'
    });

    // Render the Dialog
    content_type_dialog.render();

    content_type_dialog.cfg.subscribe('configChanged', function(p_sType, p_aArgs) {
      var aProperty = p_aArgs[0],
        sPropertyName = aProperty[0],
        oPropertyValue = aProperty[1];
      if (sPropertyName == 'zindex') {
        var siteContextNavZIndex = 100000;
        YDom.get('cstudio-wcm-popup-div').parentNode.style.zIndex = oPropertyValue + siteContextNavZIndex;
      }
    });

    YAHOO.util.Event.addListener('submitWCMPopup', 'click', this.contentPopupSubmit, {
      self: this
    });

    $('#closeWCMPopup').click(function() {
      self.contentPopupCancel();
    });

    if (isDialog) {
      // set focus on OK Button.
      if (YDom.get('submitWCMPopup')) {
        CStudioAuthoring.Utils.setDefaultFocusOn(YDom.get('submitWCMPopup'));
      }

      $(document).on('keyup', function(e) {
        // esc
        if (e.keyCode === 27) {
          self.contentPopupCancel();
          $(document).off('keyup');
        }
      });
    }

    return content_type_dialog;
  },

  setDefaultTemplate(contentTypes) {
    var configFilesPath = CStudioAuthoring.Constants.CONFIG_FILES_PATH;
    var contentTypesSelect = YDom.get('wcm-content-types-dropdown');
    if (!contentTypesSelect) return;
    var defaultSrc = CStudioAuthoringContext.baseUri + '/static-assets/themes/cstudioTheme/images/';
    var defaultImg = 'default-contentType.jpg';
    var contentTypePreviewImg = YDom.get('contentTypePreviewImg');

    for (var k = 0; k < contentTypes.length; k++) {
      if (contentTypesSelect.value == contentTypes[k].form) {
        if (
          (contentTypes[k].image && contentTypes[k].image != '') ||
          (contentTypes[k].imageThumbnail &&
            contentTypes[k].imageThumbnail != '' &&
            contentTypes[k].imageThumbnail != 'undefined')
        ) {
          var imageName =
            contentTypes[k].image && contentTypes[k].image != ''
              ? contentTypes[k].image
              : contentTypes[k].imageThumbnail;

          const extensionRegex = /(?:\.([^.]+))?$/;
          const extension = extensionRegex.exec(imageName)[1];

          this.getImage(
            `${configFilesPath}/content-types${contentTypesSelect.value}/${imageName}`,
            imageName
          ).subscribe((response) => {
            contentTypePreviewImg.src = URL.createObjectURL(
              new Blob([response.response], { type: `image/${extension}` })
            );
          });
        } else {
          contentTypePreviewImg.src = defaultSrc + defaultImg;
        }
      }
    }
  },

  /**
   * update the content types
   */
  updateAvailableTemplates(dialog, contentTypes) {
    const me = this;

    $('#wcm-content-types-dropdown').hide();

    // simple sort for content types, list should be pretty small
    var swapped;
    do {
      swapped = false;
      for (var i = 0; i < contentTypes.length - 1; i++) {
        if (contentTypes[i].label > contentTypes[i + 1].label) {
          var temp = contentTypes[i];
          contentTypes[i] = contentTypes[i + 1];
          contentTypes[i + 1] = temp;
          swapped = true;
        }
      }
    } while (swapped);

    // handle updates
    var contentTypesSelect = document.getElementById('wcm-content-types-dropdown');

    contentTypesSelect.innerHTML = '';

    for (j = 0; j < contentTypes.length; j++) {
      var label = contentTypes[j].label;
      var option = document.createElement('option');
      option.text = contentTypes[j].label;
      option.value = contentTypes[j].form;
      if (j == 0) option.selected = 'selected'; //first template will be selected.
      contentTypesSelect.options.add(option);
    }

    YAHOO.util.Event.addListener('wcm-content-types-dropdown', 'change', function() {
      var defaultSrc = CStudioAuthoringContext.baseUri + '/static-assets/themes/cstudioTheme/images/';
      var defaultImg = 'default-contentType.jpg';
      var contentTypePreviewImg = YDom.get('contentTypePreviewImg');
      var configFilesPath = CStudioAuthoring.Constants.CONFIG_FILES_PATH;

      for (var k = 0; k < contentTypes.length; k++) {
        if (this.value == contentTypes[k].form) {
          if (
            (contentTypes[k].image && contentTypes[k].image != '') ||
            (contentTypes[k].imageThumbnail &&
              contentTypes[k].imageThumbnail != '' &&
              contentTypes[k].imageThumbnail != 'undefined')
          ) {
            var imageName =
              contentTypes[k].image && contentTypes[k].image != ''
                ? contentTypes[k].image
                : contentTypes[k].imageThumbnail;

            const extensionRegex = /(?:\.([^.]+))?$/;
            const extension = extensionRegex.exec(imageName)[1];

            me.getImage(
              `${configFilesPath}/content-types${contentTypesSelect.value}/${imageName}`,
              imageName
            ).subscribe((response) => {
              contentTypePreviewImg.src = URL.createObjectURL(
                new Blob([response.response], { type: `image/${extension}` })
              );
            });
          } else {
            contentTypePreviewImg.src = defaultSrc + defaultImg;
          }
        }
      }
    });

    $('#wcm-content-types-dropdown').fadeIn('fast');
  },

  getImage(path) {
    const qs = CrafterCMSNext.util.object.toQueryString({
      site: CStudioAuthoringContext.site,
      path
    });

    return CrafterCMSNext.util.ajax.getBinary(`/studio/api/1/services/api/1/content/get-content-at-path.bin${qs}`);
  },

  closeDialog() {
    this.dialog.destroy();
  },
  /**
   * event fired when the ok is pressed
   */
  contentPopupSubmit: function(event, args) {
    var contentTypesSelect = document.getElementById('wcm-content-types-dropdown');
    var selectedIndex = contentTypesSelect.selectedIndex;
    var selectedType = contentTypesSelect.value;
    /**
     * EMO-8604, calling closeDialog to remove pop up from DOM.
     */
    CStudioAuthoring.Dialogs.DialogSelectContentType.closeDialog();
    args.self.onSaveCallback.success(selectedType);
  },

  /**
   * event fired when the cancel is pressed
   */
  contentPopupCancel: function(event) {
    CStudioAuthoring.Dialogs.DialogSelectContentType.hideDialog();
    if (window.frameElement) {
      var id = window.frameElement.getAttribute('id').split('-editor-')[1];
      if (
        $($('.studio-ice-container-' + id, parent.document)[0]).height() > this.formSize &&
        $($('.studio-ice-container-' + id, parent.document)[0]).attr('data-decrease')
      ) {
        $($('.studio-ice-container-' + id, parent.document)[0]).height(this.formSize);
      }
    }
  }
};

CStudioAuthoring.Module.moduleLoaded('dialog-select-template', CStudioAuthoring.Dialogs.DialogSelectContentType);
