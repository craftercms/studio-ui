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

CStudioForms.Controls.RTE.ImageEditor =
  CStudioForms.Controls.RTE.ImageEditor ||
  (function () {
    var validateAndClose = function () {
      if (imageEditor.isSet()) {
        if (tinymce2.activeEditor.contextControl.forceImageAlts == true) {
          var altTextEl = document.getElementById('rteImageAltText'),
            value = altTextEl.value.replace(/^\s\s*/, '').replace(/\s\s*$/, '');

          if (!value) {
            var CMgs = CStudioAuthoring.Messages;
            var langBundle = CMgs.getBundle('forms', CStudioAuthoringContext.lang);
            CStudioAuthoring.Operations.showSimpleDialog(
              'imgReq-dialog',
              CStudioAuthoring.Operations.simpleDialogTypeINFO,
              CMgs.format(langBundle, 'notification'),
              CMgs.format(langBundle, 'imgReq'),
              null,
              YAHOO.widget.SimpleDialog.ICON_BLOCK,
              'studioDialog'
            );
          } else {
            imageEditor.hide();
          }
        } else {
          imageEditor.hide();
        }
      }
    };

    var imageEditor = {
      isSet: function () {
        var imagePropertiesEl = document.getElementById('rte-image-properties');
        return imagePropertiesEl && !YAHOO.util.Dom.hasClass(imagePropertiesEl, 'hidden');
      },

      hide: function () {
        var imagePropertiesEl = document.getElementById('rte-image-properties');

        if (imagePropertiesEl) {
          YAHOO.util.Dom.addClass(imagePropertiesEl, 'hidden');
        }
      },

      renderImageEdit: function (editor, imageElement) {
        var rteControl = editor.contextControl,
          imagePropertiesEl = document.getElementById('rte-image-properties');

        var imageProperties = {
          // height, width, flow, margin-top, margin-right ,margin-bottom, margin-left ,description
          height: imageElement.height,
          width: imageElement.width,
          marginTop: imageElement.style.marginTop.replace('px', ''),
          marginRight: imageElement.style.marginRight.replace('px', ''),
          marginBottom: imageElement.style.marginBottom.replace('px', ''),
          marginLeft: imageElement.style.marginLeft.replace('px', ''),
          description: imageElement.alt,
          align: imageElement.align
        };

        var updateMarginInputFields = function updateMarginInputFields(imageElement) {
          var imageMarginTopEl = document.getElementById('rteImageTopMargin');
          var imageMarginRightEl = document.getElementById('rteImageRightMargin');
          var imageMarginBottomEl = document.getElementById('rteImageBottomMargin');
          var imageMarginLeftEl = document.getElementById('rteImageLeftMargin');

          imageMarginTopEl.value = imageElement.style.marginTop.replace('px', '');
          imageMarginRightEl.value = imageElement.style.marginRight.replace('px', '');
          imageMarginBottomEl.value = imageElement.style.marginBottom.replace('px', '');
          imageMarginLeftEl.value = imageElement.style.marginLeft.replace('px', '');
        };

        if (!imagePropertiesEl) {
          imagePropertiesEl = document.createElement('div');
          imagePropertiesEl.id = 'rte-image-properties';
          YAHOO.util.Dom.addClass(imagePropertiesEl, 'seethrough');
          YAHOO.util.Dom.addClass(imagePropertiesEl, 'rte-panel');
          document.body.appendChild(imagePropertiesEl);
        } else {
          YAHOO.util.Dom.removeClass(imagePropertiesEl, 'hidden');
          imagePropertiesEl.innerHTML = '';
        }

        var imageNameEl = document.createElement('div');
        imagePropertiesEl.appendChild(imageNameEl);

        var imageSizeEl = document.createElement('div');
        YAHOO.util.Dom.addClass(imageSizeEl, 'rte-image-prop-size-container');
        imagePropertiesEl.appendChild(imageSizeEl);

        var imageSizetHtml =
          '<table>' +
          "<tr><td>Height</td><td><input id='rteImageHeight'/></td></tr>" +
          "<tr><td>Width</td><td><input id='rteImageWidth'/></td></tr>" +
          "<tr class='img-flow'><td>Text Flow</td><td>" +
          "<div id='rteImageAlignNone' title='Display inline image'></div>" +
          "<div id='rteImageAlignLeft' title='Float image to the left'></div>" +
          "<div id='rteImageAlignRight' title='Float image to the right'></div>" +
          "<div id='rteImageAlignCenter' title='Display block image centered'></div>" +
          '</td></tr>' +
          '</table>';

        imageSizeEl.innerHTML = imageSizetHtml;
        var imageHeightEl = document.getElementById('rteImageHeight');
        YAHOO.util.Dom.addClass(imageHeightEl, 'rte-image-prop-size-input form-control');
        imageHeightEl.value = imageElement.height;
        YAHOO.util.Event.on(imageHeightEl, 'keyup', function () {
          imageElement.height = imageHeightEl.value;
        });

        var imageWidthEl = document.getElementById('rteImageWidth');
        YAHOO.util.Dom.addClass(imageWidthEl, 'rte-image-prop-size-input form-control');
        imageWidthEl.value = imageElement.width;
        YAHOO.util.Event.on(imageWidthEl, 'keyup', function () {
          imageElement.width = imageWidthEl.value;
        });

        // alignment
        var imageAlignNoneEl = document.getElementById('rteImageAlignNone');
        var imageAlignLeftEl = document.getElementById('rteImageAlignLeft');
        var imageAlignRightEl = document.getElementById('rteImageAlignRight');
        var imageAlignCenterEl = document.getElementById('rteImageAlignCenter');

        var selectAlignFn = function () {
          YAHOO.util.Dom.removeClass(imageAlignNoneEl, 'rte-image-prop-align-selected');
          YAHOO.util.Dom.removeClass(imageAlignLeftEl, 'rte-image-prop-align-selected');
          YAHOO.util.Dom.removeClass(imageAlignRightEl, 'rte-image-prop-align-selected');
          YAHOO.util.Dom.removeClass(imageAlignCenterEl, 'rte-image-prop-align-selected');

          if (imageElement.align == 'none' || imageElement.align == '') {
            YAHOO.util.Dom.addClass(imageAlignNoneEl, 'rte-image-prop-align-selected');
          }

          if (imageElement.align == 'left') {
            YAHOO.util.Dom.addClass(imageAlignLeftEl, 'rte-image-prop-align-selected');
          }

          if (imageElement.align == 'right') {
            YAHOO.util.Dom.addClass(imageAlignRightEl, 'rte-image-prop-align-selected');
          }

          if (imageElement.align == 'middle') {
            YAHOO.util.Dom.addClass(imageAlignCenterEl, 'rte-image-prop-align-selected');
          }
        };

        YAHOO.util.Dom.addClass(imageAlignNoneEl, 'rte-image-prop-align');
        YAHOO.util.Dom.addClass(imageAlignNoneEl, 'rte-image-prop-align-none');
        YAHOO.util.Event.on(imageAlignNoneEl, 'click', function () {
          imageElement.align = 'none';
          CStudioForms.Controls.RTE.ImageEditor.setStyleStr(editor, imageElement, 'display', 'inline');
          CStudioForms.Controls.RTE.ImageEditor.setStyleStr(editor, imageElement, 'margin', '');
          updateMarginInputFields(imageElement);
          selectAlignFn();
        });

        YAHOO.util.Dom.addClass(imageAlignLeftEl, 'rte-image-prop-align');
        YAHOO.util.Dom.addClass(imageAlignLeftEl, 'rte-image-prop-align-left');
        YAHOO.util.Event.on(imageAlignLeftEl, 'click', function () {
          imageElement.align = 'left';
          CStudioForms.Controls.RTE.ImageEditor.setStyleStr(editor, imageElement, 'display', 'inline');
          CStudioForms.Controls.RTE.ImageEditor.setStyleStr(editor, imageElement, 'margin', '');
          updateMarginInputFields(imageElement);
          selectAlignFn();
        });

        YAHOO.util.Dom.addClass(imageAlignRightEl, 'rte-image-prop-align');
        YAHOO.util.Dom.addClass(imageAlignRightEl, 'rte-image-prop-align-right');
        YAHOO.util.Event.on(imageAlignRightEl, 'click', function () {
          imageElement.align = 'right';
          CStudioForms.Controls.RTE.ImageEditor.setStyleStr(editor, imageElement, 'display', 'inline');
          CStudioForms.Controls.RTE.ImageEditor.setStyleStr(editor, imageElement, 'margin', '');
          updateMarginInputFields(imageElement);
          selectAlignFn();
        });

        YAHOO.util.Dom.addClass(imageAlignCenterEl, 'rte-image-prop-align');
        YAHOO.util.Dom.addClass(imageAlignCenterEl, 'rte-image-prop-align-center');
        YAHOO.util.Event.on(imageAlignCenterEl, 'click', function () {
          imageElement.align = 'middle';
          CStudioForms.Controls.RTE.ImageEditor.setStyleStr(editor, imageElement, 'display', 'block');
          CStudioForms.Controls.RTE.ImageEditor.setStyleStr(editor, imageElement, 'margin', '0 auto');
          updateMarginInputFields(imageElement);
          selectAlignFn();
        });

        selectAlignFn();

        // layout & padding
        var imageLayoutEl = document.createElement('div');
        YAHOO.util.Dom.addClass(imageLayoutEl, 'rte-image-prop-layout-container');
        imagePropertiesEl.appendChild(imageLayoutEl);

        var imageLayoutHtml =
          '<table>' +
          "<tr><td colspan='3'>Margin</td></tr>" +
          "<tr><td></td> <td><input id='rteImageTopMargin'/></td> <td></td>" +
          '<tr>' +
          "<td><input id='rteImageLeftMargin'/> </td>" +
          "<td><div id='rteImagePreview'></div></td>" +
          "<td><input id='rteImageRightMargin'/></td>" +
          '</tr>' +
          "<tr><td></td> <td><input id='rteImageBottomMargin'/></td> <td></td></tr>" +
          '</table>';

        imageLayoutEl.innerHTML = imageLayoutHtml;

        var imageEl = document.getElementById('rteImagePreview');
        YAHOO.util.Dom.addClass(imageEl, 'rte-image-prop-layout-image');
        imageEl.innerHTML = "<img width='50px' height='50px' src='" + imageElement.src + "'>";

        var imageMarginTopEl = document.getElementById('rteImageTopMargin');
        YAHOO.util.Dom.addClass(imageMarginTopEl, 'rte-image-prop-layout-input form-control');
        YAHOO.util.Dom.addClass(imageMarginTopEl, 'rte-image-prop-layout-topm');
        imageMarginTopEl.value = imageElement.style.marginTop.replace('px', '');
        YAHOO.util.Event.on(imageMarginTopEl, 'keyup', function () {
          CStudioForms.Controls.RTE.ImageEditor.setStyleStr(
            editor,
            imageElement,
            'margin-top',
            imageMarginTopEl.value + 'px'
          );
        });

        var imageMarginBottomEl = document.getElementById('rteImageBottomMargin');
        YAHOO.util.Dom.addClass(imageMarginBottomEl, 'rte-image-prop-layout-input form-control');
        YAHOO.util.Dom.addClass(imageMarginBottomEl, 'rte-image-prop-layout-bottomm');
        imageMarginBottomEl.value = imageElement.style.marginBottom.replace('px', '');
        YAHOO.util.Event.on(imageMarginBottomEl, 'keyup', function () {
          CStudioForms.Controls.RTE.ImageEditor.setStyleStr(
            editor,
            imageElement,
            'margin-bottom',
            imageMarginBottomEl.value + 'px'
          );
        });

        var imageMarginLeftEl = document.getElementById('rteImageLeftMargin');
        YAHOO.util.Dom.addClass(imageMarginLeftEl, 'rte-image-prop-layout-input form-control');
        YAHOO.util.Dom.addClass(imageMarginLeftEl, 'rte-image-prop-layout-leftm');
        imageMarginLeftEl.value = imageElement.style.marginLeft.replace('px', '');
        YAHOO.util.Event.on(imageMarginLeftEl, 'keyup', function () {
          CStudioForms.Controls.RTE.ImageEditor.setStyleStr(
            editor,
            imageElement,
            'margin-left',
            imageMarginLeftEl.value + 'px'
          );
        });

        var imageMarginRightEl = document.getElementById('rteImageRightMargin');
        YAHOO.util.Dom.addClass(imageMarginRightEl, 'rte-image-prop-layout-input form-control');
        YAHOO.util.Dom.addClass(imageMarginRightEl, 'rte-image-prop-layout-rightm');
        imageMarginRightEl.value = imageElement.style.marginRight.replace('px', '');
        YAHOO.util.Event.on(imageMarginRightEl, 'keyup', function () {
          CStudioForms.Controls.RTE.ImageEditor.setStyleStr(
            editor,
            imageElement,
            'margin-right',
            imageMarginRightEl.value + 'px'
          );
        });

        // alt text and link
        var imageAltLinkEl = document.createElement('div');
        YAHOO.util.Dom.addClass(imageAltLinkEl, 'rte-image-prop-altlink-container');
        imagePropertiesEl.appendChild(imageAltLinkEl);

        var imageAltLinkHtml =
          '<table>' + "<tr><td>Description</td> <td><input id='rteImageAltText'/></td></tr>" + '</table>';

        imageAltLinkEl.innerHTML = imageAltLinkHtml;

        var AltTextEl = document.getElementById('rteImageAltText');
        AltTextEl.value = imageElement.alt;
        YAHOO.util.Dom.addClass(AltTextEl, 'rte-image-prop-altlink-alttext form-control');
        YAHOO.util.Event.on(AltTextEl, 'keyup', function () {
          imageElement.alt = AltTextEl.value;
        });

        var imageActionButtons = document.createElement('div');
        imageActionButtons.id = 'image-edit-action-buttons';
        imageActionButtons.style.cssText =
          'position: absolute; bottom: 0; width: 100%; text-align: center; margin-bottom: 10px;';

        var me = this;

        var saveBtn = document.createElement('input');
        saveBtn.className = 'btn btn-primary';
        saveBtn.setAttribute('type', 'button');
        saveBtn.value = 'Save';
        saveBtn.style.cssText = 'margin-right: 10px;';
        imageActionButtons.appendChild(saveBtn);

        YAHOO.util.Event.on(saveBtn, 'click', function () {
          me.hide();
        });

        var cancelBtn = document.createElement('input');
        cancelBtn.className = 'btn btn-default';
        cancelBtn.setAttribute('type', 'button');
        cancelBtn.value = 'Cancel';
        imageActionButtons.appendChild(cancelBtn);

        YAHOO.util.Event.on(cancelBtn, 'click', function () {
          imageElement.height = imageProperties.height;
          imageElement.width = imageProperties.width;
          imageElement.style.marginTop = imageProperties.marginTop;
          imageElement.style.marginRight = imageProperties.marginRight;
          imageElement.style.marginBottom = imageProperties.marginBottom;
          imageElement.style.marginLeft = imageProperties.marginLeft;
          imageElement.alt = imageProperties.description;
          imageElement.align = imageProperties.align;

          me.hide();
        });

        imagePropertiesEl.appendChild(imageActionButtons);
      },

      setStyleStr: function (editor, element, style, value) {
        tinymce2.DOM.setStyle(element, style, value);
        var styleStr =
          typeof element.getAttribute('style') !== 'string' ? element.style.cssText : element.getAttribute('style');

        element.getAttribute('style').value = styleStr;
        element.setAttribute('data-mce-style', styleStr);

        editor.contextControl.save();
      }
    };

    amplify.subscribe('/rte/clicked', validateAndClose);
    amplify.subscribe('/rte/blurred', imageEditor.hide);

    return imageEditor;
  })();

CStudioAuthoring.Module.moduleLoaded('cstudio-forms-controls-rte-edit-image', CStudioForms.Controls.RTE.ImageEditor);
