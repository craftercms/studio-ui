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

CStudioAdminConsole.Tool.ContentTypes.PropertyType.Image =
  CStudioAdminConsole.Tool.ContentTypes.PropertyType.Image ||
  function (fieldName, containerEl) {
    this.fieldName = fieldName;
    this.containerEl = containerEl;
    this.WIDTHCONSTRAINS = 775;
    this.HEIGHTCONSTRAINS = 767;
    return this;
  };

YAHOO.extend(
  CStudioAdminConsole.Tool.ContentTypes.PropertyType.Image,
  CStudioAdminConsole.Tool.ContentTypes.PropertyType,
  {
    render: function (value, updateFn) {
      var _self = this;
      var containerEl = this.containerEl;
      var valueEl = document.createElement('input');
      YAHOO.util.Dom.setStyle(valueEl, 'cursor', 'default');
      YAHOO.util.Dom.setStyle(valueEl, 'outline', 'none');
      YAHOO.util.Dom.setStyle(valueEl, 'color', 'transparent');
      YAHOO.util.Dom.setStyle(valueEl, 'text-shadow', '0 0 0 #BBB');
      YAHOO.util.Dom.addClass(valueEl, 'content-type-property-sheet-property-value');
      containerEl.appendChild(valueEl);
      valueEl.value = value;
      valueEl.fieldName = this.fieldName;
      this.updateFn = updateFn;

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
          _self.showIcons();
        },
        valueEl
      );

      if (updateFn) {
        var updateFieldFn = function (event, el) {
          updateFn(event, el);
          CStudioAdminConsole.Tool.ContentTypes.visualization.render();
        };

        YAHOO.util.Event.on(valueEl, 'change', updateFieldFn, valueEl);
      }

      this.valueEl = valueEl;
    },

    getValue: function () {
      return this.valueEl.value;
    },

    showIcons: function () {
      var _self = this;
      var configFilesPath = CStudioAuthoring.Constants.CONFIG_FILES_PATH;
      var validExtensions = CStudioAuthoring.Constants.IMAGE_VALID_EXTENSIONS;
      if (this.controlsContainerEl) {
        this.controlsContainerEl.style.display = 'inline';
        this.valueEl.size;
      } else {
        var controlsContainerEl = document.createElement('div');
        YAHOO.util.Dom.addClass(controlsContainerEl, 'options');

        var uploadEl = document.createElement('div');
        YAHOO.util.Dom.addClass(uploadEl, 'upload fa fa-upload f18');

        var deleteEl = document.createElement('div');
        YAHOO.util.Dom.addClass(deleteEl, 'delete fa fa-trash-o f18');

        controlsContainerEl.appendChild(uploadEl);
        controlsContainerEl.appendChild(deleteEl);

        this.containerEl.appendChild(controlsContainerEl);

        this.controlsContainerEl = controlsContainerEl;

        uploadEl.onclick = function () {
          var uploadCb = {
            success: function (to) {
              var imageData = to;
              const url =
                configFilesPath + '/content-types' + CStudioAdminConsole.contentTypeSelected + '/' + to.fileName;
              imageData.relativeUrl = url;

              var valid = false,
                message = '';
              if (validExtensions.includes(to.fileExtension?.toLowerCase().trim())) {
                valid = true;
              } else {
                message = CMgs.format(langBundle, 'fileNotImage');
              }

              if (valid) {
                const defPath = `/content-types/${CStudioAdminConsole.contentTypeSelected}/form-definition.xml`;
                CrafterCMSNext.services.configuration
                  .fetchConfigurationDOM(CStudioAuthoringContext.site, defPath, 'studio')
                  .subscribe({
                    next(doc) {
                      let imageThumbnail = doc.querySelector('imageThumbnail');

                      if (!imageThumbnail) {
                        imageThumbnail = document.createElement('imageThumbnail');
                        doc.appendChild(imageThumbnail);
                      }
                      imageThumbnail.innerHTML = to.fileName;

                      const xmlFormDef = new XMLSerializer().serializeToString(doc);
                      CrafterCMSNext.services.configuration
                        .writeConfiguration(CStudioAuthoringContext.site, defPath, 'studio', xmlFormDef)
                        .subscribe({
                          next() {
                            const image = new Image();

                            function imageLoaded() {
                              const originalWidth = this.width,
                                originalHeight = this.height,
                                widthConstrains = _self.WIDTHCONSTRAINS,
                                heightConstrains = _self.HEIGHTCONSTRAINS;
                              message = CMgs.format(langBundle, 'constraintsError');

                              if (
                                widthConstrains &&
                                originalWidth <= widthConstrains &&
                                heightConstrains &&
                                originalHeight <= heightConstrains
                              ) {
                                const itemURL = to.fileName;
                                _self.valueEl.value = itemURL;
                                _self.value = itemURL;
                                _self.updateFn(null, _self.valueEl);
                              } else {
                                var callback = {
                                  success: function (content) {
                                    const itemURL = content.message.internalName;
                                    _self.valueEl.value = itemURL;
                                    _self.value = itemURL;
                                    _self.updateFn(null, _self.valueEl);
                                  }
                                };

                                CStudioAuthoring.Operations.cropperImage(
                                  CStudioAuthoringContext.site,
                                  message,
                                  imageData,
                                  widthConstrains,
                                  heightConstrains,
                                  widthConstrains / heightConstrains,
                                  null,
                                  callback
                                );
                              }
                            }
                            image.addEventListener('load', imageLoaded, false);
                            image.addEventListener('error', function (e) {
                              message = CMgs.format(langBundle, 'loadImageError');
                              CStudioAuthoring.Operations.showSimpleDialog(
                                'error-dialog',
                                CStudioAuthoring.Operations.simpleDialogTypeINFO,
                                CMgs.format(langBundle, 'notification'),
                                message,
                                null, // use default button
                                YAHOO.widget.SimpleDialog.ICON_BLOCK,
                                'studioDialog'
                              );
                            });

                            _self.getImage(CStudioAdminConsole.contentTypeSelected).subscribe((response) => {
                              imageData.previewUrl = URL.createObjectURL(
                                new Blob([response.response], { type: `image/${to.fileExtension}` })
                              );
                              image.src = imageData.previewUrl;
                            });
                          },
                          error() {
                            CStudioAuthoring.Operations.showSimpleDialog(
                              'errorDialog-dialog',
                              CStudioAuthoring.Operations.simpleDialogTypeINFO,
                              CMgs.format(langBundle, 'notification'),
                              CMgs.format(langBundle, 'saveFailed'),
                              null, // use default button
                              YAHOO.widget.SimpleDialog.ICON_BLOCK,
                              'studioDialog'
                            );
                          }
                        });
                    },
                    error() {
                      CStudioAuthoring.Operations.showSimpleDialog(
                        'errorDialog-dialog',
                        CStudioAuthoring.Operations.simpleDialogTypeINFO,
                        CMgs.format(langBundle, 'notification'),
                        CMgs.format(langBundle, 'failConfig'),
                        null, // use default button
                        YAHOO.widget.SimpleDialog.ICON_BLOCK,
                        'studioDialog'
                      );
                    }
                  });
              } else {
                CStudioAuthoring.Operations.showSimpleDialog(
                  'error-dialog',
                  CStudioAuthoring.Operations.simpleDialogTypeINFO,
                  CMgs.format(langBundle, 'notification'),
                  message,
                  null, // use default button
                  YAHOO.widget.SimpleDialog.ICON_BLOCK,
                  'studioDialog'
                );
              }
            },

            failure: function () {}
          };

          CStudioAuthoring.Operations.uploadAsset(
            CStudioAuthoringContext.site,
            configFilesPath + '/content-types' + CStudioAdminConsole.contentTypeSelected,
            'upload',
            uploadCb,
            ['image/*']
          );
        };

        deleteEl.onclick = function () {
          if (_self.valueEl.value != '') {
            _self.valueEl.value = '';
            _self.value = '';
            _self.updateFn(null, _self.valueEl);
            CStudioAdminConsole.Tool.ContentTypes.visualization.render();
          }
        };
      }
    },

    /**
     * create preview URL
     */
    createPreviewUrl: function (imagePath) {
      return CStudioAuthoringContext.previewAppBaseUri + imagePath + '';
    },

    getImage(contentTypeId) {
      return CrafterCMSNext.services.contentTypes.fetchPreviewImage(CStudioAuthoringContext.site, contentTypeId);
    },

    isImageValid: function (width, originalWidth, height, originalHeight) {
      var result = true;

      var checkFn = function (value, srcValue) {
        var internalResult = true;

        if (value) {
          internalResult = false;

          var obj = typeof value == 'string' ? eval('(' + value + ')') : value;

          if (typeof obj == 'number' && obj == srcValue) {
            internalResult = true;
          } else {
            if (obj.exact != '') {
              if (obj.exact == srcValue) {
                internalResult = true;
              }
            } else if (
              ((obj.min != '' && obj.min <= srcValue) || obj.min == '') &&
              ((obj.max != '' && obj.max >= srcValue) || obj.max == '')
            ) {
              internalResult = true;
            }
          }
        }

        return internalResult;
      };

      result = checkFn(width, originalWidth) && checkFn(height, originalHeight);

      return result;
    }
  }
);

CStudioAuthoring.Module.moduleLoaded(
  'cstudio-console-tools-content-types-proptype-image',
  CStudioAdminConsole.Tool.ContentTypes.PropertyType.Image
);
