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

/**
 * Copy Dialog for copy showinf the copy tree
 *
 */
CStudioAuthoring.Dialogs = CStudioAuthoring.Dialogs || {};

CStudioAuthoring.Dialogs.DialogCopy =
  CStudioAuthoring.Dialogs.DialogCopy ||
  (function () {
    // Internal variables
    var context, item, flatMap, dialog;
    const i18n = CrafterCMSNext.i18n,
      formatMessage = i18n.intl.formatMessage,
      messages = i18n.messages.copyDialogMessages;

    // Internal functions
    function getDialogContent(content) {
      var aURIs = [],
        popupHTML;

      flatMap = {};

      content.item.parent = null;
      popupHTML = [
        `<div style="padding: 5px 20px 0"><a href="#" data-selected="true" id="selectDeselectAll">${formatMessage(messages.deselectAll)}</a></div>`,
        '<div id="copyCheckBoxItems" style="padding-left:5px;">',
        traverse(content.item, flatMap, aURIs),
        '</div>'
      ].join('');

      return popupHTML;
    }

    function traverse(item, flatMap, aURIs) {
      var itemIconClass = CStudioAuthoring.Utils.getIconFWClasses(item),
        children = item.children,
        childrenLen = children.length,
        child,
        icon = item.folder
          ? CStudioAuthoring.Utils.createIcon('', 'fa-folder-o', 'ml0').outerHTML
          : CStudioAuthoring.Utils.getContentItemIcon(item).outerHTML,
        html =
          '<ul>' +
          '<input type="checkbox" id="' +
          encodeURIComponent(item.uri) +
          '" checked="true"/>' +
          '<div class="' +
          itemIconClass +
          '" >' +
          '<div>' +
          icon +
          CrafterCMSNext.util.string.escapeHTML(item.internalName) +
          '</div> ' +
          '</div>';

      Array.isArray(aURIs) && aURIs.push('<div style="margin:0 0 5px 0">' + item.browserUri + '</div>');
      flatMap[item.uri] = item;

      if (children) {
        for (var i = 0; i < childrenLen; i++) {
          child = children[i];
          child.parent = item;
          html += '<li>' + traverse(child, flatMap, aURIs) + '</li>';
        }
      }
      return html + '</ul>';
    }

    function getContext(isCut, site) {
      var context;
      if (isCut) {
        context = {
          heading: CMgs.format(formsLangBundle, 'cut'),
          description: CMgs.format(formsLangBundle, 'copyDescription'),
          actionButton: CMgs.format(formsLangBundle, 'cut'),
          request: CStudioAuthoringContext.baseUri + '/service/cstudio/services/clipboard/cut?site=' + site
        };
      } else {
        context = {
          heading: CMgs.format(formsLangBundle, 'copy'),
          description: CMgs.format(formsLangBundle, 'copyDescription'),
          actionButton: CMgs.format(formsLangBundle, 'copy'),
          request: CStudioAuthoringContext.baseUri + CStudioAuthoring.Service.copyServiceUrl + '?site=' + site
        };
      }
      return context;
    }

    function onCutCheckBoxSubmittedItemClick(event, matchedEl) {
      function selectAll(checked) {
        var inputItem;

        for (var key in flatMap) {
          inputItem = YDom.get(flatMap[key]['uri']);
          inputItem.checked = checked;
        }
      }
      selectAll(matchedEl.checked);
    }

    function onCopyCheckBoxSubmittedItemClick(event, matchedEl) {
      var selectedItemURI,
        selectedItem,
        id = decodeURIComponent(matchedEl.id);

      function selectParents(selectedItem, checked) {
        var inputElement;

        while (selectedItem.parent != null) {
          selectedItem = selectedItem.parent;
          inputElement = YDom.get(encodeURIComponent(selectedItem.uri));
          inputElement.checked = checked;
        }
      }

      function selectChildren(selectedItem, checked) {
        var children = selectedItem.children,
          uri,
          inputChild,
          selectedChild;

        if (children === null || !children.length) {
          return;
        }
        for (var i = 0; i < children.length; i++) {
          uri = children[i]['uri'];
          inputChild = YDom.get(encodeURIComponent(uri));
          inputChild.checked = checked;
          selectedChild = flatMap[uri];
          selectChildren(selectedChild, checked);
        }
      }

      if (id === item.uri) {
        matchedEl.checked = true;
        updateCopyButtonDisableState(false);
        return;
      }

      selectedItemURI = id;
      selectedItem = flatMap[selectedItemURI];
      if (matchedEl.checked) {
        selectParents(selectedItem, true);
      } else {
        selectChildren(selectedItem, false);
      }

      const someChecked = $('.copyContent #copyCheckBoxItems input').toArray().some((checkbox) => checkbox.checked);
      updateCopyButtonDisableState(!someChecked);
    }

    function updateSelectDeselectAllAction(select) {
      const $button = $('#selectDeselectAll');
      $button.data('selected', select);
      $button.text(select ? formatMessage(messages.deselectAll) : formatMessage(messages.selectAll));
    }

    function onSelectDeselectAll(event) {
      const $el = $(event.target);
      const select = !$el.data('selected');
      $('.copyContent #copyCheckBoxItems input').each((index, element) => {
        $(element).prop('checked', select);
      });
      updateCopyButtonDisableState(!select);
      updateSelectDeselectAllAction(select);
    }

    function updateCopyButtonDisableState(disable) {
      if (disable) {
        $('#copyButton').addClass('disabled');
      } else {
        $('#copyButton').removeClass('disabled');
      }
    }

    function createSelectedItems(item, selectedItems) {
      var createItem = function (item, selectedItems) {
        if (selectedItems[item.uri] == 'selected') {
          var newItem = {};
          newItem.uri = item.uri;
          var children = item.children;
          if (children) {
            for (var i = 0; i < children.length; i++) {
              var child = children[i];
              var newChild = createItem(child, selectedItems);
              if (newChild != null) {
                if (!newItem.children) {
                  newItem.children = [];
                }
                newChild.uri = child.uri;
                newItem.children.push(newChild);
              }
            }
          }
          return newItem;
        } else {
          return null;
        }
      };
      var rootItem = createItem(item, selectedItems);
      var pasteFormatItem = {};
      pasteFormatItem.item = [];
      pasteFormatItem.item.push(rootItem);
      return pasteFormatItem;
    }

    function onCopySubmit(event, matchedEl) {
      var container = YDom.get('contentTypePopupInner'),
        inputItems = container.getElementsByTagName('input'),
        selectedIds = {},
        newItem,
        myJSON,
        oncomplete,
        selectedURI;

      for (var i = 0; i < inputItems.length; i++) {
        if (inputItems[i].checked) {
          selectedURI = decodeURIComponent(inputItems[i].id);
          selectedIds[selectedURI] = 'selected';
        }
      }

      YDom.get('copyButton').disabled = true;
      YDom.get('copyCancelButton').disabled = true;

      newItem = createSelectedItems(item, selectedIds);
      myJSON = YAHOO.lang.JSON.stringify(newItem);
      oncomplete = {
        success: function () {
          closeDialog();
          CStudioAuthoring.ContextualNav.WcmRootFolder.resetNodeStyles();
        },
        failure: function () {
          YDom.get('copyButton').disabled = false;
          YDom.get('copyCancelButton').disabled = false;
        }
      };

      YAHOO.util.Connect.setDefaultPostHeader(false);
      YAHOO.util.Connect.initHeader('Content-Type', 'application/json; charset=utf-8');
      YAHOO.util.Connect.initHeader(
        CStudioAuthoringContext.xsrfHeaderName,
        CrafterCMSNext.util.auth.getRequestForgeryToken()
      );
      YAHOO.util.Connect.asyncRequest('POST', context.request, oncomplete, myJSON);
    }

    // --- Public Methods ---
    /**
     * initialize module
     */

    function createDialog(cut, site) {
      var newdiv = document.createElement('div');

      context = getContext(cut, site);
      newdiv.setAttribute('id', 'cstudio-wcm-popup-div');
      newdiv.className = 'yui-pe-content';
      newdiv.innerHTML =
        '<style>div#copyCheckBoxItems .status-icon{padding-left: 5px !important;}</style><div class="contentTypePopupInner copyContent" id="contentTypePopupInner">' +
        '<div class="contentTypePopupContent" id="contentTypePopupContent"> ' +
        '<div class="contentTypePopupHeader">' +
        context['heading'] +
        '</div> ' +
        '<div class="contentTypeOuter">' +
        '<div>' +
        context['description'] +
        '</div> ' +
        '<div class="copy-content-container">' +
        '<h5>' +
        '<span>' +
        CMgs.format(formsLangBundle, 'page') +
        '</span>' +
        '</h5>' +
        '<div class="scrollBox">&nbsp;&nbsp;' +
        CMgs.format(formsLangBundle, 'loadingContents') +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="contentTypePopupBtn"> ' +
        '<input type="submit" class="cstudio-xform-button ok btn btn-primary" id="copyButton" value="' +
        context['actionButton'] +
        '" />' +
        '<input type="submit" class="cstudio-xform-button cancel btn btn-default" id="copyCancelButton" value="' +
        CMgs.format(formsLangBundle, 'cancel') +
        '" />' +
        '</div> ' +
        '</div> ' +
        '</div>';

      document.body.appendChild(newdiv);

      dialog = new YAHOO.widget.Dialog('cstudio-wcm-popup-div', {
        width: '608px',
        height: '525px',
        fixedcenter: true,
        visible: false,
        modal: true,
        close: false,
        constraintoviewport: true,
        underlay: 'none',
        autofillheight: null
      });

      dialog.render();
      dialog.show();
      dialog.cfg.setProperty('zIndex', 1000); // Update the z-index value to make it go over the site content nav

      $('#cstudio-wcm-popup-div').on('keyup', function (e) {
        if (e.keyCode == 10 || e.keyCode == 13) {
          // enter
          $('#copyButton').click();
        }

        if (e.keyCode === 27) {
          // esc
          closeDialog();
          $('#cstudio-wcm-popup-div').off('keyup');
        }
      });

      return dialog;
    }

    function updateDialog(content, cut) {
      var dialogContent = getDialogContent(content),
        contentContainer = YAHOO.util.Selector.query('#cstudio-wcm-popup-div .scrollBox', null, true);

      item = content.item;

      if (contentContainer) {
        contentContainer.innerHTML = dialogContent;
      }

      if (cut) {
        YAHOO.util.Event.delegate(
          'contentTypePopupInner',
          'click',
          onCutCheckBoxSubmittedItemClick,
          "input[type='checkbox']"
        );
      } else {
        YAHOO.util.Event.delegate(
          'contentTypePopupInner',
          'click',
          onCopyCheckBoxSubmittedItemClick,
          "input[type='checkbox']"
        );
      }
      YAHOO.util.Event.addListener('copyButton', 'click', onCopySubmit);
      YAHOO.util.Event.addListener('copyCancelButton', 'click', closeDialog);
      YAHOO.util.Event.addListener('selectDeselectAll', 'click', onSelectDeselectAll);

      //set focus on Copy button
      var copyButton = YDom.get('copyButton');
      if (copyButton) {
        CStudioAuthoring.Utils.setDefaultFocusOn(copyButton);
      }
    }

    function closeDialog() {
      var element = YDom.get('cstudio-wcm-popup-div');

      dialog.hide();
      $('#cstudio-wcm-popup-div').off('keyup');
      element.parentNode.removeChild(element);
    }

    // Expose API
    return {
      createDialog: createDialog,
      updateDialog: updateDialog,
      closeDialog: closeDialog
    };
  })();

CStudioAuthoring.Module.moduleLoaded('dialog-copy', CStudioAuthoring.Dialogs.DialogCopy);
