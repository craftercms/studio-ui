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

CStudioForms.Controls.ImagePicker =
  CStudioForms.Controls.ImagePicker ||
  function(id, form, owner, properties, constraints, readonly) {
    this.owner = owner;
    this.owner.registerField(this);
    this.errors = [];
    this.properties = properties;
    this.constraints = constraints;
    this.inputEl = null;
    this.required = false;
    this.value = '_not-set';
    this.form = form;
    this.id = id;
    this.datasources = null;
    this.upload_dialog = null;
    this.crop_dialog = null;
    this.validExtensions = [
      'jpg',
      'jpeg',
      'gif',
      'png',
      'tiff',
      'tif',
      'bmp',
      'svg',
      'JPG',
      'JPEG',
      'GIF',
      'PNG',
      'TIFF',
      'TIF',
      'BMP',
      'SVG',
      'jp2',
      'jxr',
      'webp'
    ];
    this.readonly = readonly;
    this.originalWidth = null;
    this.originalHeight = null;
    this.previewBoxHeight = 100;
    this.previewBoxWidth = 300;
    this.external = null;
    this.supportedPostFixes = ['_s'];

    return this;
  };

YAHOO.extend(CStudioForms.Controls.ImagePicker, CStudioForms.CStudioFormField, {
  getLabel: function() {
    return CMgs.format(langBundle, 'image');
  },

  _onChange: function(evt, obj) {
    obj.value = obj.inputEl.value;

    if (obj.required) {
      if (obj.inputEl.value === '') {
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
    obj.form.updateModel(obj.id, obj.getValue(), obj.remote);
  },

  _onChangeVal: function(evt, obj) {
    obj.edited = true;
    this._onChange(evt, obj);
  },

  /**
   * perform count calculation on keypress
   * @param evt event
   * @param el element
   */
  count: function(evt, countEl, el) {},

  /**
   * Aspect Ratios
   */
  calculateAspectRatioFit: function(srcWidth, srcHeight, maxWidth, maxHeight) {
    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

    return { width: srcWidth * ratio, height: srcHeight * ratio };
  },

  /**
   * create dialog
   */
  createDialog: function() {
    YDom.removeClass('cstudio-wcm-popup-div', 'yui-pe-content');

    var newdiv = YDom.get('cstudio-wcm-popup-div');
    if (newdiv === undefined || newdiv === null) {
      newdiv = document.createElement('div');
      document.body.appendChild(newdiv);
    }

    var divIdName = 'cstudio-wcm-popup-div';
    newdiv.setAttribute('id', divIdName);
    newdiv.className = 'yui-pe-content';

    var imgObj = this.calculateAspectRatioFit(
        this.originalWidth,
        this.originalHeight,
        window.innerWidth - 10,
        window.innerHeight - 20
      ),
      imgWidth = imgObj.width,
      imgHeight = imgObj.height,
      width = imgWidth ? imgWidth : 500,
      height = imgHeight ? imgHeight : 500,
      url = !this.external ? CStudioAuthoringContext.previewAppBaseUri : '' + this.inputEl.value;
    newdiv.innerHTML =
      '<img width="' +
      width +
      'px" height="' +
      height +
      'px" src="' +
      url +
      '"></img>' +
      '<input type="button" class="zoom-button btn btn-primary cstudio-form-control-asset-picker-zoom-cancel-button" id="zoomCancelButton" value="Close"/>' +
      '<input type="button" class="zoom-button btn btn-primary cstudio-form-control-asset-picker-zoom-full-button" id="zoomFullButton" value="Full"/>';

    // Instantiate the Dialog
    upload_dialog = new YAHOO.widget.Dialog('cstudio-wcm-popup-div', {
      fixedcenter: true,
      visible: false,
      modal: true,
      close: true,
      constraintoviewport: true,
      underlay: 'none',
      keylisteners: new YAHOO.util.KeyListener(
        document,
        { ctrl: false, keys: 27 },
        { fn: this.uploadPopupCancel, correctScope: true }
      )
    });

    // Render the Dialog
    upload_dialog.render();
    YAHOO.util.Event.addListener('zoomCancelButton', 'click', this.uploadPopupCancel, this, true);
    YAHOO.util.Event.addListener(
      'zoomFullButton',
      'click',
      function() {
        this.fullImageTab(!this.external ? CStudioAuthoringContext.previewAppBaseUri : '' + this.inputEl.value);
      },
      this,
      true
    );
    this.upload_dialog = upload_dialog;
    upload_dialog.show();
  },

  /**
   * event fired when the full is pressed
   */
  fullImageTab: function(url) {
    window.open(url);
  },

  /**
   * event fired when the ok is pressed
   */
  uploadPopupCancel: function(event) {
    this.upload_dialog.destroy();
  },

  showAlert: function(message) {
    var self = this;
    var dialog = new YAHOO.widget.SimpleDialog('alertDialog', {
      width: '400px',
      fixedcenter: true,
      visible: false,
      draggable: false,
      close: false,
      modal: true,
      text: message,
      icon: YAHOO.widget.SimpleDialog.ICON_ALARM,
      constraintoviewport: true,
      buttons: [
        {
          text: 'OK',
          handler: function() {
            this.destroy();
            CStudioAuthoring.Utils.decreaseFormDialog();
          },
          isDefault: false
        }
      ]
    });
    dialog.setHeader('CStudio Warning');
    dialog.render(document.body);
    dialog.show();
    dialog.innerElement.parentElement.style.setProperty('z-index', '100104', 'important');
  },

  cropPopupCancel: function(event) {
    this.crop_dialog.destroy();
    CStudioAuthoring.Utils.decreaseFormDialog();
  },

  setImageData: function(imagePicker, imageData) {
    let CMgs = CStudioAuthoring.Messages;
    let langBundle = CMgs.getBundle('contentTypes', CStudioAuthoringContext.lang);
    imagePicker.inputEl.value = imageData.relativeUrl;

    imagePicker.previewEl.src = imageData.previewUrl.replace(/ /g, '%20') + '?' + new Date().getTime();
    imagePicker.urlEl.innerHTML = imageData.relativeUrl.replace('?crafterCMIS=true', '');
    imagePicker.downloadEl.href = imageData.previewUrl;
    imagePicker.remote = imageData.remote && imageData.remote === true ? true : false;

    imagePicker.$addBtn.text(CMgs.format(langBundle, 'replace'));

    imagePicker.noPreviewEl.style.display = 'none';
    imagePicker.previewEl.style.display = 'inline';
    YAHOO.util.Dom.addClass(imagePicker.previewEl, 'cstudio-form-control-asset-picker-preview-content');

    imagePicker.adjustImage();

    imagePicker._onChangeVal(null, imagePicker);
  },

  increaseFormDialogForCrop: function() {
    var id = window.frameElement.getAttribute('id').split('-editor-')[1];
    var getFormSizeVal = typeof getFormSize === 'function' ? getFormSize : parent.getFormSize;
    var setFormSizeVal = typeof setFormSize === 'function' ? setFormSize : parent.setFormSize;
    var formSize = getFormSizeVal(id);
    if (formSize < 557) {
      setFormSizeVal(557, id);
    }
  },

  addImage: function() {
    var _self = this;
    var imageManagerNames = this.datasources;

    imageManagerNames = !imageManagerNames
      ? ''
      : Array.isArray(imageManagerNames)
      ? imageManagerNames.join(',')
      : imageManagerNames;
    var datasourceMap = this.form.datasourceMap,
      datasourceDef = this.form.definition.datasources;

    if (imageManagerNames !== '' && imageManagerNames.indexOf(',') !== -1) {
      // The datasource title is only found in the definition.datasources. It'd make more sense to have all
      // the information in just one place.

      var addMenuOption = function(el) {
        // We want to avoid possible substring conflicts by using a reg exp (a simple indexOf
        // would fail if a datasource id string is a substring of another datasource id)
        var mapDatasource;

        //if (imageManagerNames.search(regexpr) > -1) {
        if (imageManagerNames.indexOf(el.id) !== -1) {
          mapDatasource = datasourceMap[el.id];

          const $itemEl = $(`<li><a class="cstudio-form-control-image-picker-add-container-item">${el.title}</a></li>`);

          _self.$dropdownMenu.append($itemEl);

          YAHOO.util.Event.on(
            $itemEl[0],
            'click',
            function() {
              _self._addImage(mapDatasource);
            },
            $itemEl[0]
          );
        }
      };
      datasourceDef.forEach(addMenuOption);
    } else if (imageManagerNames !== '') {
      imageManagerNames = imageManagerNames.replace('["', '').replace('"]', '');
      this._addImage(datasourceMap[imageManagerNames]);
    }
  },

  _addImage: function(datasourceEl) {
    self = this;
    var datasource = datasourceEl;
    if (datasource) {
      if (datasource.insertImageAction) {
        var callback = {
          success: function(imageData, repoImage) {
            var valid = false,
              message = '',
              repoImage;

            if (this.imagePicker.validExtensions.indexOf(imageData.fileExtension) !== -1) {
              valid = true;
            } else {
              message = 'The uploaded file is not of type image';
            }

            if (!valid) {
              this.imagePicker.showAlert(message);
              //this.imagePicker.deleteImage();
            } else {
              var image = new Image();
              var imagePicker = this.imagePicker;

              function imageLoaded() {
                imagePicker.originalWidth = this.width;
                imagePicker.originalHeight = this.height;

                valid = imagePicker.isImageValid();
                if (!valid) {
                  var widthConstrains = JSON.parse(self.width);
                  var heightConstrains = JSON.parse(self.height);
                  message = 'The uploaded file does not meet the specified width & height constraints';
                  //imagePicker.deleteImage();
                  if (
                    (widthConstrains.min && imagePicker.originalWidth < widthConstrains.min) ||
                    (heightConstrains.min && imagePicker.originalHeight < heightConstrains.min) ||
                    (widthConstrains.exact && imagePicker.originalWidth < widthConstrains.exact) ||
                    (heightConstrains.exact && imagePicker.originalHeight < heightConstrains.exact) ||
                    (widthConstrains && imagePicker.originalWidth < widthConstrains) ||
                    (heightConstrains && imagePicker.originalHeight < heightConstrains)
                  ) {
                    message = 'Image is smaller than the constraint size';
                    self.showAlert(message);
                  } else {
                    (function(self) {
                      var callbackCropper = {
                        success: function(content) {
                          var imagePicker = self;

                          imageData.relativeUrl = imageData.renameRelativeUrl
                            ? imageData.renameRelativeUrl
                            : imageData.relativeUrl;
                          imageData.previewUrl = imageData.renamePreviewUrl
                            ? imageData.renamePreviewUrl
                            : imageData.previewUrl;

                          self.setImageData(imagePicker, imageData);
                        }
                      };

                      CStudioAuthoring.Operations.cropperImage(
                        CStudioAuthoringContext.site,
                        message,
                        imageData,
                        self.width,
                        self.height,
                        self.width / self.height,
                        repoImage,
                        callbackCropper
                      );
                    })(self);
                  }

                  //this.isUploadOverwrite = isUploadOverwrite;
                } else {
                  var formContainer = this.form ? this.form.containerEl : self.form.containerEl;
                  // $(self.form.containerEl).find("#ice-body .cstudio-form-field-container")
                  if ($(formContainer).find('#ice-body .cstudio-form-field-container').length > 1) {
                    if (this.setImageData) {
                      this.setImageData(imagePicker, imageData);
                    } else {
                      self.setImageData(imagePicker, imageData);
                    }
                  } else {
                    if (this.setImageData) {
                      this.setImageData(imagePicker, imageData);
                      CStudioAuthoring.Utils.decreaseFormDialog();
                    } else {
                      self.setImageData(imagePicker, imageData);
                      CStudioAuthoring.Utils.decreaseFormDialog();
                    }
                  }
                }
              }
              image.addEventListener('load', imageLoaded, false);
              image.addEventListener('error', function() {
                message = 'Unable to load the selected image. Please try again or select another image';
                imagePicker.showAlert(message);
              });
              CStudioAuthoring.Operations.getImageRequest({
                url: imageData.previewUrl,
                image: image
              });
            }
          },
          failure: function(message) {
            this.imagePicker.showAlert(message);
          }
        };
        callback.imagePicker = this;
        datasource.insertImageAction(callback);
      }
    }
  },

  deleteImage: function() {
    var CMgs = CStudioAuthoring.Messages;
    var langBundle = CMgs.getBundle('contentTypes', CStudioAuthoringContext.lang);

    if (this.addContainerEl) {
      addContainerEl = this.addContainerEl;
      this.addContainerEl = null;
      this.ctrlOptionsEl.removeChild(addContainerEl);
    }

    if (this.inputEl.value !== '') {
      this.inputEl.value = '';
      this.urlEl.innerHTML = '';
      this.previewEl.style.display = 'none';
      this.previewEl.src = '';
      this.noPreviewEl.style.display = 'inline';
      this.$addBtn.text(CMgs.format(langBundle, 'add'));
      this.remote = false;

      this.downloadEl.style.display = 'none';
      this.zoomEl.style.display = 'none';

      this.originalWidth = null;
      this.originalHeight = null;

      YAHOO.util.Dom.addClass(this.previewEl, 'cstudio-form-control-asset-picker-preview-content');
      YAHOO.util.Dom.setStyle(this.imageEl, 'width', this.previewBoxWidth + 'px');
      YAHOO.util.Dom.setStyle(this.imageEl, 'height', this.previewBoxHeight + 'px');

      this._onChangeVal(null, this);
    }
  },

  render: function(config, containerEl) {
    containerEl.id = this.id;

    var divPrefix = config.id + '-';
    var datasource = null;

    var CMgs = CStudioAuthoring.Messages;
    var langBundle = CMgs.getBundle('contentTypes', CStudioAuthoringContext.lang);

    this.containerEl = containerEl;

    // we need to make the general layout of a control inherit from common
    // you should be able to override it -- but most of the time it wil be the same
    var titleEl = document.createElement('span');

    YAHOO.util.Dom.addClass(titleEl, 'cstudio-form-field-title');
    titleEl.innerHTML = config.title;

    var controlWidgetContainerEl = document.createElement('div');
    YAHOO.util.Dom.addClass(controlWidgetContainerEl, 'cstudio-form-control-image-picker-container');

    var validEl = document.createElement('span');
    YAHOO.util.Dom.addClass(validEl, 'validation-hint');
    YAHOO.util.Dom.addClass(validEl, 'cstudio-form-control-validation fa fa-check');

    var inputEl = document.createElement('input');
    this.inputEl = inputEl;
    inputEl.style.display = 'none';
    YAHOO.util.Dom.addClass(inputEl, 'datum');
    controlWidgetContainerEl.appendChild(inputEl);

    var imgInfoContainer = document.createElement('div');
    YAHOO.util.Dom.addClass(imgInfoContainer, 'imgInfoContainer');
    controlWidgetContainerEl.appendChild(imgInfoContainer);

    var urlEl = document.createElement('div');
    this.urlEl = urlEl;
    urlEl.innerHTML = this.inputEl.value;
    YAHOO.util.Dom.addClass(urlEl, 'info');
    imgInfoContainer.appendChild(urlEl);

    var bodyEl = document.createElement('div');
    YAHOO.util.Dom.addClass(bodyEl, 'cstudio-form-control-asset-picker-body');
    imgInfoContainer.appendChild(bodyEl);

    var imageEl = document.createElement('div');
    this.imageEl = imageEl;
    imageEl.id = divPrefix + 'cstudio-form-image-picker';
    YAHOO.util.Dom.addClass(imageEl, 'cstudio-form-control-asset-picker-preview-block');
    YAHOO.util.Dom.addClass(imageEl, 'cstudio-form-control-asset-picker-no-preview-image');
    bodyEl.appendChild(imageEl);

    var noPreviewEl = document.createElement('span');
    this.noPreviewEl = noPreviewEl;
    noPreviewEl.innerHTML = 'No Image Available';
    YAHOO.util.Dom.addClass(noPreviewEl, 'cstudio-form-control-asset-picker-no-preview-content');
    imageEl.appendChild(noPreviewEl);

    var previewEl = document.createElement('img');
    this.previewEl = previewEl;
    YAHOO.util.Dom.addClass(previewEl, 'cstudio-form-control-asset-picker-preview-content');
    previewEl.style.display = 'none';
    imageEl.appendChild(previewEl);

    var zoomEl = document.createElement('a');
    this.zoomEl = zoomEl;
    zoomEl.type = 'button';
    YAHOO.util.Dom.addClass(
      zoomEl,
      'cstudio-form-control-hover-btn cstudio-form-control-asset-picker-zoom-button fa fa-search-plus'
    );
    zoomEl.style.display = 'none';
    imageEl.appendChild(zoomEl);

    var downloadEl = document.createElement('a');
    this.downloadEl = downloadEl;
    downloadEl.href = inputEl.value;
    downloadEl.target = '_new';
    YAHOO.util.Dom.addClass(
      downloadEl,
      'cstudio-form-control-hover-btn cstudio-form-control-asset-picker-download-button fa fa-download'
    );
    downloadEl.style.display = 'none';
    imageEl.appendChild(downloadEl);

    var ctrlOptionsEl = document.createElement('div');
    YAHOO.util.Dom.addClass(ctrlOptionsEl, 'cstudio-form-control-image-picker-options');
    bodyEl.appendChild(ctrlOptionsEl);

    this.ctrlOptionsEl = ctrlOptionsEl;

    let dropdownLabel;

    if (this.inputEl.value === null || this.inputEl.value === '') {
      dropdownLabel = CMgs.format(langBundle, 'add');
    } else {
      dropdownLabel = CMgs.format(langBundle, 'replace');
    }

    // dropdownBtn and dropdownMenu
    const $addBtn = $(
      `<button id="add-image" class="cstudio-button btn btn-default btn-sm dropdown-toggle" type="button" data-toggle="dropdown">${dropdownLabel}</button>`
    );
    const $dropdown = $('<div class="dropdown"></div>');
    const $dropdownMenu = $('<ul class="dropdown-menu pull-right"></ul>');
    this.$dropdown = $dropdown;
    this.$dropdownMenu = $dropdownMenu;
    this.$addBtn = $addBtn;
    $dropdown.append($addBtn);
    $dropdown.append($dropdownMenu);

    $(ctrlOptionsEl).append($dropdown);

    var delEl = document.createElement('input');
    this.delEl = delEl;
    delEl.type = 'button';
    delEl.value = CMgs.format(langBundle, 'delete');
    delEl.style.position = 'relative';
    YAHOO.util.Dom.addClass(delEl, 'cstudio-button btn btn-default btn-sm');

    ctrlOptionsEl.appendChild(delEl);

    for (var i = 0; i < config.properties.length; i++) {
      var prop = config.properties[i];

      if (prop.name === 'imageManager') {
        if (prop.value && prop.value !== '') {
          this.datasources = prop.value;
        }
      }

      if (prop.name === 'height') {
        if (prop.value && prop.value !== '') {
          this.height = prop.value;
        }
      }

      if (prop.name === 'width') {
        if (prop.value && prop.value !== '') {
          this.width = prop.value;
        }
      }

      if (prop.name === 'thumbnailHeight') {
        if (prop.value && prop.value !== '') {
          this.previewBoxHeight = prop.value;
        }
      }

      if (prop.name === 'thumbnailWidth') {
        if (prop.value && prop.value !== '') {
          this.previewBoxWidth = prop.value;
        }
      }

      if (prop.name === 'readonly' && prop.value === 'true') {
        this.readonly = true;
      }
    }

    YAHOO.util.Dom.setStyle(this.imageEl, 'height', this.previewBoxHeight + 'px');
    YAHOO.util.Dom.setStyle(this.imageEl, 'width', this.previewBoxWidth + 'px');

    var helpContainerEl = document.createElement('div');
    YAHOO.util.Dom.addClass(helpContainerEl, 'cstudio-form-field-help-container');
    ctrlOptionsEl.appendChild(helpContainerEl);

    this.renderHelp(config, helpContainerEl);

    this.renderImageConstraints(bodyEl);

    var descriptionEl = document.createElement('span');
    YAHOO.util.Dom.addClass(descriptionEl, 'description');
    YAHOO.util.Dom.addClass(descriptionEl, 'cstudio-form-field-description');
    descriptionEl.innerHTML = config.description;
    //descriptionEl.style.marginLeft = "341px";
    descriptionEl.style.position = 'relative';

    containerEl.appendChild(titleEl);
    containerEl.appendChild(validEl);
    containerEl.appendChild(controlWidgetContainerEl);
    containerEl.appendChild(descriptionEl);

    if (this.readonly === true) {
      this.$addBtn.attr('disabled', 'disabled');
      this.$addBtn.addClass('cstudio-button-disabled');
      delEl.disabled = true;
      YAHOO.util.Dom.addClass(delEl, 'cstudio-button-disabled');
    }

    YAHOO.util.Event.addListener(
      imageEl,
      'click',
      function(evt, context) {
        context.form.setFocusedField(context);
      },
      this,
      true
    );

    // adding options to $dropdownMenu;
    if (!this.$addBtn.attr('disabled')) {
      this.addImage();
    }

    YAHOO.util.Event.addListener(
      $addBtn[0],
      'click',
      function(evt, context) {
        context.form.setFocusedField(context);
      },
      this,
      true
    );

    YAHOO.util.Event.addListener(
      delEl,
      'click',
      function(evt, context) {
        context.form.setFocusedField(context);
        this.deleteImage();
      },
      this,
      true
    );
    YAHOO.util.Event.addListener(zoomEl, 'click', this.createDialog, this, true);

    YAHOO.util.Event.addListener(imageEl, 'mouseover', this.showButtons, this, true);
    YAHOO.util.Event.addListener(imageEl, 'mouseout', this.hideButtons, this, true);
  },

  showButtons: function(evt) {
    if (this.value !== '') {
      if (this.originalWidth > this.previewBoxWidth || this.originalHeight > this.previewBoxHeight) {
        this.zoomEl.style.display = 'inline-block';
        this.downloadEl.style.marginLeft = '0px';
      } else {
        this.downloadEl.style.marginLeft = '-20px';
      }
      this.downloadEl.style.display = 'inline-block';
    }
  },

  hideButtons: function(evt) {
    this.zoomEl.style.display = 'none';
    this.downloadEl.style.display = 'none';
  },

  getValue: function() {
    return this.value;
  },

  renderImageConstraints: function(containerEl) {
    var checkFn = function(label, value) {
      var message = '';

      if (value) {
        var obj = typeof value === 'string' ? eval('(' + value + ')') : value;

        if (typeof obj === 'number') {
          message = label + ': equal to ' + obj + 'px';
        } else {
          if (obj.exact !== '') {
            message = label + ': equal to ' + obj.exact + 'px';
          } else {
            if (obj.min !== '' && obj.max !== '') {
              message = label + ': between ' + obj.min + 'px and ' + obj.max + 'px';
            } else if (obj.min !== '') {
              message = label + ': equal or greater than ' + obj.min + 'px';
            } else if (obj.max !== '') {
              message = label + ': equal or less than ' + obj.max + 'px';
            }
          }
        }
      }

      return message;
    };

    var widthConstraints = checkFn('Width', this.width);
    var heightConstraints = checkFn('Height', this.height);

    if (widthConstraints !== '' || heightConstraints !== '') {
      var requirementsEl = document.createElement('div');
      requirementsEl.innerHTML =
        '<div class="title">Image Requirements</div>' +
        '<div class="width-constraint">' +
        widthConstraints +
        '</div>' +
        '<div class="height-constraint">' +
        heightConstraints +
        '</div>';
      YAHOO.util.Dom.addClass(requirementsEl, 'cstudio-form-field-image-picker-constraints');
      containerEl.appendChild(requirementsEl);
    }
  },

  isImageValid: function() {
    var result = true;

    var checkFn = function(value, srcValue) {
      var internalResult = true;

      if (value) {
        internalResult = false;

        var obj = typeof value === 'string' ? eval('(' + value + ')') : value;

        if (typeof obj == 'number' && obj === srcValue) {
          internalResult = true;
        } else {
          if (obj.exact !== '') {
            if (obj.exact === srcValue) {
              internalResult = true;
            }
          } else if (
            ((obj.min !== '' && obj.min <= srcValue) || obj.min === '') &&
            ((obj.max !== '' && obj.max >= srcValue) || obj.max === '')
          ) {
            internalResult = true;
          }
        }
      }

      return internalResult;
    };

    result = checkFn(this.width, this.originalWidth) && checkFn(this.height, this.originalHeight);

    return result;
  },

  adjustImage: function() {
    var wImg = this.originalWidth || 0;
    var hImg = this.originalHeight || 0;
    var wThb = parseInt(this.previewBoxWidth, 10);
    var hThb = parseInt(this.previewBoxHeight, 10);
    var adjustedWidth = 0;
    var adjustedHeight = 0;

    YAHOO.util.Dom.setStyle(this.previewEl, 'height', '100%');
    YAHOO.util.Dom.setStyle(this.previewEl, 'width', '100%');

    if (wImg < wThb && hImg < hThb) {
      YAHOO.util.Dom.removeClass(this.previewEl, 'cstudio-form-control-asset-picker-preview-content');
      YAHOO.util.Dom.setStyle(this.imageEl, 'height', hImg + 'px');
      YAHOO.util.Dom.setStyle(this.imageEl, 'width', wImg + 'px');
    } else {
      if (wImg && hImg) {
        var conversionFactor = wImg / wThb > hImg / hThb ? wImg / wThb : hImg / hThb;
        adjustedHeight = Math.floor(hImg / conversionFactor);
        adjustedWidth = Math.floor(wImg / conversionFactor);

        YAHOO.util.Dom.setStyle(this.imageEl, 'height', adjustedHeight + 'px');
        YAHOO.util.Dom.setStyle(this.imageEl, 'width', adjustedWidth + 'px');
      } else {
        YAHOO.util.Dom.setStyle(this.imageEl, 'height', hThb + 'px');
        YAHOO.util.Dom.setStyle(this.imageEl, 'width', wThb + 'px');
      }
    }
  },

  setValue: function(value, attribute) {
    var _self = this;
    this.value = value;
    this.remote = attribute === true ? true : false;
    this.inputEl.value = value;

    var CMgs = CStudioAuthoring.Messages;
    var langBundle = CMgs.getBundle('contentTypes', CStudioAuthoringContext.lang);

    this.external = value.indexOf('?crafterCMIS=true') !== -1 || value.indexOf('http') <= 0;

    if (value === null || value === '') {
      this.noPreviewEl.style.display = 'inline';
    } else {
      if (this.external) {
        this.previewEl.src = value.replace(/ /g, '%20');
      } else {
        this.previewEl.src = CStudioAuthoringContext.previewAppBaseUri + value.replace(/ /g, '%20');
      }
      this.previewEl.style.display = 'inline';
      this.noPreviewEl.style.display = 'none';
      this.urlEl.innerHTML = this.external ? value.replace('?crafterCMIS=true', '') : value;
      this.downloadEl.href = this.external ? value.replace('?crafterCMIS=true', '') : value;

      this.$addBtn.text(CMgs.format(langBundle, 'replace'));

      var loaded = false;
      var image = new Image();
      image.src = '';

      function imageLoaded() {
        _self.originalWidth = this.width;
        _self.originalHeight = this.height;
        _self.adjustImage();
      }
      image.addEventListener('load', imageLoaded, false);
      image.src = CStudioAuthoringContext.previewAppBaseUri + value.replace(/ /g, '%20') + '?' + new Date().getTime();
    }
    this._onChange(null, this);
    this.edited = false;
  },

  getName: function() {
    return 'image-picker';
  },

  getSupportedProperties: function() {
    return [
      { label: CMgs.format(langBundle, 'width'), name: 'width', type: 'range' },
      { label: CMgs.format(langBundle, 'height'), name: 'height', type: 'range' },
      { label: CMgs.format(langBundle, 'thumbnailWidth'), name: 'thumbnailWidth', type: 'int' },
      { label: CMgs.format(langBundle, 'thumbnailHeight'), name: 'thumbnailHeight', type: 'int' },
      {
        label: CMgs.format(langBundle, 'datasource'),
        name: 'imageManager',
        type: 'datasource:image'
      },
      { label: CMgs.format(langBundle, 'readonly'), name: 'readonly', type: 'boolean' }
    ];
  },

  getSupportedConstraints: function() {
    return [{ label: CMgs.format(langBundle, 'required'), name: 'required', type: 'boolean' }];
  },

  getSupportedPostFixes: function() {
    return this.supportedPostFixes;
  }
});

CStudioAuthoring.Utils.addCss('/static-assets/libs/cropper/dist/cropper.css');
CStudioAuthoring.Utils.addCss('/static-assets/themes/cstudioTheme/css/icons.css');

CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-image-picker', CStudioForms.Controls.ImagePicker);
CStudioAuthoring.Module.requireModule('jquery-cropper', '/static-assets/libs/cropper/dist/cropper.js');
