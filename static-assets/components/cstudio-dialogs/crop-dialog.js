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
// YConnect.setDefaultPostHeader(false);
//                YConnect.initHeader("Content-Type", "application/xml; charset=utf-8");
//                YConnect.
var YEvent = YAHOO.util.Event;
const i18n = CrafterCMSNext.i18n;
const formatMessage = i18n.intl.formatMessage;
const formEngineMessages = i18n.messages.formEngineMessages;

CStudioAuthoring.Dialogs = CStudioAuthoring.Dialogs || {};

/**
 * Submit to go live
 */
CStudioAuthoring.Dialogs.CropDialog = CStudioAuthoring.Dialogs.CropDialog || {
  /**
   * initialize module
   */
  initialize: function (config) {},

  /**
   * show dialog
   */
  showDialog: function (site, Message, imageData, imageWidth, imageHeight, aspectRatio, repoImage, callback) {
    this._self = this;
    this.site = site;
    this.message = Message;
    this.asPopup = true;
    this.imageData = imageData;
    this.width = imageWidth;
    this.height = imageHeight;
    this.aspectRatio = aspectRatio ? aspectRatio : null;
    this.callback = callback;
    this.repoImage = repoImage;

    this.dialog = this.createDialog(Message, imageData, repoImage);
    this.dialog.show();

    document.getElementById('cstudio-wcm-popup-div_h').style.display = 'none';

    if (window.frameElement) {
      var id = window.frameElement.getAttribute('id').split('-editor-')[1];

      var getFormSizeVal = typeof getFormSize === 'function' ? getFormSize : parent.getFormSize;
      var setFormSizeVal = typeof setFormSize === 'function' ? setFormSize : parent.setFormSize;
      var formSize = getFormSizeVal(id);
      if (formSize < 320) {
        setFormSizeVal(320, id);
      }
    }
  },

  /**
   * hide dialog
   */
  closeDialog: function () {
    this.dialog.destroy();
  },

  /**
   * create dialog
   */
  createDialog: function (Message, imageData, repoImage) {
    self = this;
    YDom.removeClass('cstudio-wcm-popup-div', 'yui-pe-content');

    self.repoImage = repoImage;

    self.increaseFormDialogForCrop();

    var newdiv = YDom.get('cstudio-wcm-popup-div');
    if (newdiv == undefined) {
      newdiv = document.createElement('div');
      document.body.appendChild(newdiv);
    }

    var divIdName = 'cstudio-wcm-popup-div';
    newdiv.setAttribute('id', divIdName);
    newdiv.className = 'yui-pe-content';
    newdiv.innerHTML =
      '<div class="contentTypePopupInner crop-image-dialog" id="crop-popup-inner">' +
      '<div class="contentTypePopupContent" id="contentTypePopupContent"> ' +
      '<div class="contentTypePopupHeader">Crop Image</div> ' +
      '<div>' +
      '<div class="contentTypeOuter clearfix">' +
      '<div class="formDesc">' +
      Message +
      '</div> ' +
      '<div class="leftControls">' +
      '<div class="cropContainer">' +
      '<img src="' +
      imageData.previewUrl +
      '">' +
      '</div>' +
      '<div class="cropMethods">' +
      '<div class="btn-group">' +
      '<button type="button" class="btn btn-primary" data-method="zoom" data-option="0.1" title="Zoom In" id="zoomIn">' +
      '<span class="docs-tooltip" data-bs-toggle="tooltip" title="Zoom In" data-original-title="Zoom In">' +
      '<span class="status-icon fa fa-search-plus"></span>' +
      '</span>' +
      '</button>' +
      '<button type="button" class="btn btn-primary" data-method="zoom" data-option="-0.1" title="Zoom Out" id="zoomOut">' +
      '<span class="docs-tooltip" data-bs-toggle="tooltip" title="Zoom Out" data-original-title="Zoom Out)">' +
      '<span class="status-icon fa fa-search-minus"></span>' +
      '</span>' +
      '</button>' +
      '</div>' +
      '<button type="button" class="btn btn-primary refresh" data-method="getContainerData" data-option="" id="refresh">' +
      '<span class="docs-tooltip" data-bs-toggle="tooltip" title="Refresh" data-original-title="Refresh">' +
      '<span class="status-icon fa fa-refresh"></span>' +
      '</span>' +
      '</button>' +
      '<span id="zoomMessage" class="hidden">Increasing zoom creates an image which is smaller than the constraints</span>' +
      '</div>' +
      '</div>' +
      '<div class="rightControls">' +
      '<div class="img-preview preview-sm"></div>' +
      '<div class="docs-data">' +
      '<div class="input-group">' +
      '<label class="input-group-addon" for="dataX">X</label>' +
      '<input type="text" class="form-control" id="dataX" placeholder="x" disabled>' +
      '<span class="input-group-addon">px</span>' +
      '</div>' +
      '<div class="input-group">' +
      '<label class="input-group-addon" for="dataY">Y</label>' +
      '<input type="text" class="form-control" id="dataY" placeholder="y" disabled>' +
      '<span class="input-group-addon">px</span>' +
      '</div>' +
      '<div class="input-group">' +
      '<label class="input-group-addon" for="dataWidth">Width</label>' +
      '<input type="text" class="form-control" id="dataWidth" placeholder="width" disabled>' +
      '<span class="input-group-addon">px</span>' +
      '</div>' +
      '<div class="input-group">' +
      '<label class="input-group-addon" for="dataHeight">Height</label>' +
      '<input type="text" class="form-control" id="dataHeight" placeholder="height" disabled>' +
      '<span class="input-group-addon">px</span>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<div class="contentTypePopupBtn" id="crop-popup-btns"> ' +
      '<input type="button" class="btn btn-default cstudio-xform-button" id="uploadCancelButton" value="Cancel" />' +
      '<input type="button" class="btn btn-primary cstudio-xform-button ok" id="cropButton" value="Crop" />' +
      '</div>' +
      '</div>' +
      '</div> ' +
      '</div>';

    // Instantiate the Dialog
    crop_dialog = new YAHOO.widget.Dialog('cstudio-wcm-popup-div', {
      width: '830px',
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
    crop_dialog.render();

    var $image = $('.cropContainer > img');
    var widthConstrains = JSON.parse(self.width);
    var heightConstrains = JSON.parse(self.height);
    var flag;
    var boxResizable = false;

    var $dataX = $('#dataX');
    var $dataY = $('#dataY');
    var $dataHeight = $('#dataHeight');
    var $dataWidth = $('#dataWidth');

    var widthCropBox, minWidthCropBox, maxWidthCropBox, heightCropBox, minHeightCropBox, maxHeightCropBox;

    function getPercentage(min, max) {
      var result;
      if (min && max) {
        result = min + (max - min) / 2;
      } else if (min) {
        result = min + 1;
      } else {
        result = max - 1;
      }
      return result;
    }

    if (widthConstrains.exact) {
      widthCropBox = widthConstrains.exact;
      flag = 'exact';
    } else if (!isNaN(widthConstrains)) {
      widthCropBox = widthConstrains;
      flag = 'exact';
    } else {
      flag = 'variable';
      boxResizable = true;
      if (widthConstrains.min) {
        minWidthCropBox = widthConstrains.min;
      }
      if (widthConstrains.max) {
        maxWidthCropBox = widthConstrains.max;
      }
      if (minWidthCropBox || maxWidthCropBox) {
        widthCropBox = getPercentage(parseInt(minWidthCropBox), parseInt(maxWidthCropBox));
      }
    }
    if (heightConstrains.exact) {
      heightCropBox = heightConstrains.exact;
    } else if (!isNaN(heightConstrains)) {
      heightCropBox = heightConstrains;
    } else {
      if (heightConstrains.min) {
        minHeightCropBox = heightConstrains.min;
      }
      if (heightConstrains.max) {
        maxHeightCropBox = heightConstrains.max;
      }
      if (minHeightCropBox || maxHeightCropBox) {
        heightCropBox = getPercentage(parseInt(minHeightCropBox), parseInt(maxHeightCropBox));
      }
    }

    $image.cropper({
      aspectRatio: this.aspectRatio,
      minCropBoxWidth: this,
      dragCrop: false,
      cropBoxResizable: boxResizable,
      preview: '.img-preview',
      crop: function (e) {
        // Output the result data for cropping image.
        $dataX.val(Math.round(e.x));
        $dataY.val(Math.round(e.y));
        $dataHeight.val(Math.round(e.height));
        $dataWidth.val(Math.round(e.width));
        if (flag == 'exact') {
          if (!($dataHeight.val() == heightCropBox) && !($dataWidth.val() == widthCropBox)) {
            $('#zoomMessage').removeClass('hidden');
            $dataWidth.addClass('error');
            $dataHeight.addClass('error');
          } else {
            $('#zoomMessage').addClass('hidden');
            $dataWidth.removeClass('error');
            $dataHeight.removeClass('error');
          }
        } else {
          const width = e.width;
          const height = e.height;

          // When there are min/max restrictions, crop values need to be validated and if not valid,
          // set the proper values.
          // If cropped width is lower than minWidth
          if (Boolean(minWidthCropBox) && width < parseInt(minWidthCropBox)) {
            $image.cropper('setData', {
              width: parseInt(minWidthCropBox)
            });
          }
          // If cropped width is higher than minWidth
          if (Boolean(maxWidthCropBox) && width > parseInt(maxWidthCropBox)) {
            $image.cropper('setData', {
              width: parseInt(maxWidthCropBox)
            });
          }
          // If cropped height is lower than minWidth
          if (Boolean(minHeightCropBox) && height < parseInt(minHeightCropBox)) {
            $image.cropper('setData', {
              height: parseInt(minHeightCropBox)
            });
          }
          // If cropped width is higher than minWidth
          if (Boolean(maxHeightCropBox) && height > parseInt(maxHeightCropBox)) {
            $image.cropper('setData', {
              height: parseInt(maxHeightCropBox)
            });
          }
        }
      },
      built: function () {
        $image.cropper('setData', {
          width: parseInt(widthCropBox),
          height: parseInt(heightCropBox)
        });
        $dataHeight.val(heightCropBox);
        $dataWidth.val(widthCropBox);
        $('#zoomMessage').addClass('hidden');
        $dataHeight.removeClass('error');
        $dataWidth.removeClass('error');
      },
      zoom: function (e) {
        const isZoomIn = e.ratio > 0;
        const croppedCanvas = $image.cropper('getCroppedCanvas');
        const width = parseInt(croppedCanvas.getAttribute('width'));
        const height = parseInt(croppedCanvas.getAttribute('height'));
        // If you're zooming in (increasing the image size) you may end up having an image (canvas) with smaller
        // dimensions than the ones set up for minWidth and minHeight
        if (isZoomIn) {
          if (Boolean(minWidthCropBox) && width < parseInt(minWidthCropBox)) {
            e.preventDefault();
          }
          if (Boolean(minHeightCropBox) && height < parseInt(minHeightCropBox)) {
            e.preventDefault();
          }
        }
      }
    });

    $('#zoomIn').on('click', function () {
      $image.cropper('zoom', 0.1);
    });

    $('#zoomOut').on('click', function () {
      $image.cropper('zoom', -0.1);
    });

    $('#refresh').on('click', function () {
      $image.cropper('reset');
      $image.cropper('setData', { width: parseInt(widthCropBox), height: parseInt(heightCropBox) });
    });

    function inputValidation(min, max, input, auxInput) {
      if (
        (min && max && input.val() >= min && input.val() <= max) ||
        (min && !max && input.val() >= min) ||
        (!min && max && input.val() <= max)
      ) {
        $('#zoomMessage').addClass('hidden');
        input.removeClass('error');
        // $('#cropButton').prop('disabled',false);
      } else {
        $('#zoomMessage').removeClass('hidden');
        input.addClass('error');
        // $('#cropButton').prop('disabled',true);
      }
      if (input.hasClass('error') || auxInput.hasClass('error')) {
        $('#zoomMessage').removeClass('hidden');
      }
    }

    function _cropImage(self, newName) {
      var imageInformation = $image.cropper('getData', true),
        path = imageData.relativeUrl,
        site = CStudioAuthoringContext.site,
        self = self;

      const canvas = $image.cropper('getCroppedCanvas');
      const dataUrl = canvas.toDataURL(imageData.meta.type);

      const file = {
        dataUrl,
        name: imageData.name,
        type: imageData.type
      };

      var cropImageCallBack = {
        success: function (content) {
          self.callback.success(content);
          self.cropPopupCancel();
        },
        failure: function (message) {
          CStudioAuthoring.Operations.showSimpleDialog(
            'error-dialog',
            CStudioAuthoring.Operations.simpleDialogTypeINFO,
            'notification',
            JSON.parse(message.responseText).message,
            null, // use default button
            YAHOO.widget.SimpleDialog.ICON_BLOCK,
            'studioDialog'
          );
          self.cropPopupCancel();
        }
      };

      const fileName = CrafterCMSNext.util.path.getFileNameFromPath(imageData.relativeUrl),
        re = /(?:\.([^.]+))?$/,
        ext = re.exec(imageData.relativeUrl)[1]; // get original image extension

      if (newName) {
        const createNewNameFile = () => {
          var relativeUrlLastSlashIndex = imageData.relativeUrl.lastIndexOf('/'),
            previewUrlLastSlashIndex = imageData.previewUrl.lastIndexOf('/'),
            relativeFolder = imageData.relativeUrl.substring(0, relativeUrlLastSlashIndex + 1),
            previewFolder = imageData.previewUrl.substring(0, previewUrlLastSlashIndex + 1);

          path = imageData.relativeUrl + '&newname=' + newName + '.' + ext;
          imageData.renameRelativeUrl = relativeFolder + newName + '.' + ext;
          imageData.renamePreviewUrl = previewFolder + newName + '.' + ext;

          var contextExistsCallBack = {
            site: site,
            path: path,
            imageInformation: imageInformation,
            cropImageCallBack: cropImageCallBack,
            exists: function (exists) {
              if (exists) {
                CStudioAuthoring.Operations.showSimpleDialog(
                  'error-dialog',
                  CStudioAuthoring.Operations.simpleDialogTypeINFO,
                  'Notification',
                  'Image filename already exists',
                  null, // use default button
                  YAHOO.widget.SimpleDialog.ICON_BLOCK,
                  'studioDialog imgExists'
                );
                YDom.getElementsByClassName('imgExists')[0].parentNode.classList.add('inc-zindex');
              } else {
                const fileName = CrafterCMSNext.util.path.getFileNameFromPath(imageData.relativeUrl);
                CrafterCMSNext.services.content
                  .uploadDataUrl(
                    site,
                    {
                      dataUrl,
                      name: `${newName}.${ext}`
                    },
                    imageData.relativeUrl.replace(fileName, ''),
                    '_csrf'
                  )
                  .subscribe({
                    next: (response) => {
                      if (response.type === 'complete') {
                        cropImageCallBack.success(response.payload.body);
                      }
                    },
                    error: (error) => {
                      cropImageCallBack.failure(error);
                    }
                  });
              }
            },
            failure: function () {}
          };

          CStudioAuthoring.Service.contentExists(imageData.renameRelativeUrl, contextExistsCallBack);
        };

        CrafterCMSNext.services.sites
          .validateActionPolicy(CStudioAuthoringContext.site, {
            type: 'CREATE',
            target: `${imageData.relativeUrl.replace(fileName, '')}${newName}.${ext}`
          })
          .subscribe(({ allowed, modifiedValue, target }) => {
            if (allowed) {
              if (modifiedValue) {
                CStudioAuthoring.Utils.showConfirmDialog({
                  body: formatMessage(formEngineMessages.createPolicy, { originalPath: fileName, path: modifiedValue }),
                  onOk: () => {
                    createNewNameFile();
                  }
                });
              } else {
                createNewNameFile();
              }
            } else {
              CStudioAuthoring.Utils.showConfirmDialog({
                body: formatMessage(formEngineMessages.policyError, { path: target })
              });
            }
          });
      } else {
        const fileName = CrafterCMSNext.util.path.getFileNameFromPath(imageData.relativeUrl);
        CrafterCMSNext.services.content
          .uploadDataUrl(site, { dataUrl, name: fileName }, imageData.relativeUrl.replace(fileName, ''), '_csrf')
          .subscribe({
            next: (response) => {
              if (response.type === 'complete') {
                cropImageCallBack.success(response.payload.body);
              }
            },
            error: (error) => {
              cropImageCallBack.failure(error);
            }
          });
      }
    }

    function _renameFile(self, imageData) {
      var container = document.getElementById('crop-popup-btns'),
        buttons =
          '<input type="button" class="btn btn-primary cstudio-xform-button ok" disabled id="renameButton" value="Rename" />' +
          '<input type="button" class="btn btn-default cstudio-xform-button" id="uploadCancelButton" value="Cancel" /></div>';
      self = self;

      container.innerHTML =
        '<div class="rename-container" style="float: left; position: relative;" data-extension="' +
        imageData.fileExtension +
        '"><span style="display: inline-block; float: left; margin-right: 10px; margin-top: 7px;">Filename:</span> <input id="renameFileInput" type="text" style="display: inline-block; width: 220px; border-right-width: 54px; border-right-color: rgba(204, 204, 204, 0.33);"></div>' +
        buttons;

      YAHOO.util.Event.on('renameFileInput', 'keyup', function () {
        this.value = this.value.replace(/ /g, '_');
        this.value = this.value.replace(/[^A-Za-z0-9-_]/g, '').toLowerCase();

        if (!this.value || this.value == '') {
          document.getElementById('renameButton').setAttribute('disabled', '');
        } else {
          document.getElementById('renameButton').removeAttribute('disabled');
        }
      });

      YAHOO.util.Event.addListener('renameButton', 'click', function (e) {
        _cropImage(self, document.getElementById('renameFileInput').value);
      });

      YAHOO.util.Event.addListener(
        'uploadCancelButton',
        'click',
        function () {
          self.cropPopupCancel();
        },
        this,
        true
      );
    }

    function cropImage() {
      var imageInformation = $image.cropper('getData', true),
        path = imageData.relativeUrl,
        site = CStudioAuthoringContext.site,
        self = this;

      if (self.repoImage) {
        var container = document.getElementById('crop-popup-btns'),
          buttons =
            '<input type="button" class="btn btn-primary cstudio-xform-button ok" id="overwriteButton" value="Overwrite" />' +
            '<input type="button" class="btn btn-primary cstudio-xform-button ok" id="renameButton" value="Rename" />' +
            '<input type="button" class="btn btn-default cstudio-xform-button" id="uploadCancelButton" value="Cancel" /></div>';

        container.innerHTML =
          "<div class='' style='float: left; margin-right:10px; margin-top: 7px;'>File already exists, do you want to overwrite it?</div>" +
          buttons;

        YAHOO.util.Event.addListener('uploadCancelButton', 'click', this.cropPopupCancel, this, true);
        YAHOO.util.Event.addListener('renameButton', 'click', function () {
          _renameFile(self, imageData);
        });
        YAHOO.util.Event.addListener(
          'overwriteButton',
          'click',
          function () {
            _cropImage(self);
          },
          this,
          true
        );
      } else {
        _cropImage(self);
      }
    }

    YAHOO.util.Event.addListener('uploadCancelButton', 'click', this.cropPopupCancel, this, true);
    YAHOO.util.Event.addListener('cropButton', 'click', cropImage, this, true);
    this.crop_dialog = crop_dialog;
    return crop_dialog;
    upload_dialog.show();
  },

  cropPopupCancel: function (event) {
    CStudioAuthoring.Dialogs.CropDialog.closeDialog();
    CStudioAuthoring.Utils.decreaseFormDialog();
  },

  increaseFormDialogForCrop: function () {
    if (window.frameElement) {
      var id = window.frameElement.getAttribute('id').split('-editor-')[1];
      var getFormSizeVal = typeof getFormSize === 'function' ? getFormSize : parent.getFormSize;
      var setFormSizeVal = typeof setFormSize === 'function' ? setFormSize : parent.setFormSize;
      var formSize = getFormSizeVal(id);
      if (formSize < 557) {
        setFormSizeVal(557, id);
      }
    }
  }
};

CStudioAuthoring.Module.moduleLoaded('crop-dialog', CStudioAuthoring.Dialogs.CropDialog);
