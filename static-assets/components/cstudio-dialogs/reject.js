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

CStudioAuthoring.Dialogs = CStudioAuthoring.Dialogs || {};

/**
 * GoLive Constructor
 */
CStudioAuthoring.Dialogs.DialogReject = function () {
  CStudioAuthoring.Dialogs.DialogReject.superclass.constructor.call(this);
  this.moduleName = 'reject';
  this.reasonHash = [];
  this.uncheckedItemsArrayNew = [];
};

CStudioAuthoring.Module.requireModule(
  'publish-dialog',
  '/static-assets/components/cstudio-dialogs/publish-dialog.js',
  {},
  {
    moduleLoaded: function (moduleName, dialogClass) {
      var REJECT_DIALOG_TEMPLATE = [
        '<div class="bd">',
        /**/ '<div class="rejectContainer">',
        /**/ /**/ '<h3 id="title">Reject</h3>',
        /**/ /**/ '<p id="subtitle">The following checked item(s) will be rejected.</p>',
        /**/ /**/ '<div class="row">',
        /**/ /**/ /**/ '<div class="col-sm-8">',
        /**/ /**/ /**/ /**/ '<div class="table-wrapper">',
        /**/ /**/ /**/ /**/ /**/ '<table class="acnLiveTable liveTable">',
        /**/ /**/ /**/ /**/ /**/ '<thead class="ttThead">',
        /**/ /**/ /**/ /**/ /**/ '<tr>',
        /**/ /**/ /**/ /**/ /**/ '<th class="checkboxTh"></th>',
        /**/ /**/ /**/ /**/ /**/ '<th class="itemTh">Item</th>',
        /**/ /**/ /**/ /**/ /**/ '<th class="submittedTh">Submitted By</th>',
        /**/ /**/ /**/ /**/ /**/ '</tr>',
        /**/ /**/ /**/ /**/ /**/ '</thead>',
        /**/ /**/ /**/ /**/ /**/ '<tbody id="tbodyDepend"></tbody>',
        /**/ /**/ /**/ /**/ /**/ '</table>',
        /**/ /**/ /**/ /**/ '</div>',
        /**/ /**/ /**/ '</div>',
        /**/ /**/ /**/ '<div class="col-sm-4">',
        /**/ /**/ /**/ /**/ '<h4>Rejection Reason:</h4>',
        /**/ /**/ /**/ /**/ '<div class="field">',
        /**/ /**/ /**/ /**/ /**/ '<select id="rejectReasonDropDown" class="rejectReasonDropDown">',
        /**/ /**/ /**/ /**/ /**/ /**/ '<option>Select a Reason</option>',
        /**/ /**/ /**/ /**/ /**/ /**/ '<option value="NotApproved">Not Approved</option>',
        /**/ /**/ /**/ /**/ /**/ /**/ '<option value="IncorrectBranding">Incorrect Branding</option>',
        /**/ /**/ /**/ /**/ /**/ /**/ '<option value="Typos">Typos</option>',
        /**/ /**/ /**/ /**/ /**/ /**/ '<option value="BrokenLinks">Broken Links</option>',
        /**/ /**/ /**/ /**/ /**/ /**/ '<option value="NSOA">Needs Section Owner\'s Approval</option>',
        /**/ /**/ /**/ /**/ /**/ '</select>',
        /**/ /**/ /**/ /**/ '</div>',
        /**/ /**/ /**/ /**/ '<textarea id="rejectMessageArea" class="rejectBottomBox rejectTextarea form-control"></textarea>',
        /**/ /**/ /**/ '</div>',
        /**/ /**/ '</div>',
        /**/ /**/ '<div id="rejectReasonJson" style="display: none"></div>',
        /**/ /**/ '<div class="acnSubmitButtons">',
        /**/ /**/ /**/ '<span><input id="golivesubmitButton" type="submit" value="Send Rejection" class="rejectSend btn btn-primary"></span>',
        /**/ /**/ /**/ '<span><input id="golivecancelButton" type="submit" value="Cancel" class="rejectCancel btn btn-default"></span>',
        /**/ /**/ '</div>',
        /**/ '</div>',
        '</div>'
      ].join('');

      // Make GoLive constructor inherit from its parent (i.e. PublishDialog)
      YAHOO.lang.extend(CStudioAuthoring.Dialogs.DialogReject, dialogClass);

      // Extend GoLive's prototype with its own class functions
      CStudioAuthoring.Dialogs.DialogReject.prototype.createPanel = function (panelName, modalState, zIdx) {
        return new YAHOO.widget.Panel(panelName, {
          fixedcenter: true,
          visible: false,
          close: false,
          draggable: false,
          underlay: 'none',
          modal: modalState,
          zIndex: zIdx,
          constraintoviewport: true,
          autofillheight: null
        });
      };

      CStudioAuthoring.Dialogs.DialogReject.prototype.invokeRejectService = function () {
        // check if rejection reason is filled out
        var tempStr = YAHOO.lang.trim(YDom.get('rejectMessageArea').value);
        if (tempStr && tempStr.length == 0) {
          CStudioAuthoring.Operations.showSimpleDialog(
            'reason-dialog',
            CStudioAuthoring.Operations.simpleDialogTypeINFO,
            'Notification',
            'Please choose a reason.',
            [
              {
                text: 'OK',
                handler: function () {
                  this.destroy();
                },
                isDefault: false
              }
            ],
            YAHOO.widget.SimpleDialog.ICON_BLOCK,
            'studioDialog',
            null,
            1043
          );
        }

        // remove unchecked items and dependencies from dependencyJsonObj
        this.selectedJsonObj = this.clone_obj_uri(this.dependencyJsonObj);
        if (this.removeUncheckedItemsFromJsonNew() == -1) {
          // no items selected
          return;
        }

        // rejectMessageArea
        this.selectedJsonObj.reason = YDom.get('rejectMessageArea').value;
        if (this.selectedJsonObj.items.length) {
          var jsonSubmitString = YAHOO.lang.JSON.stringify(this.selectedJsonObj),
            self = this,
            serviceCallback = {
              success: function (oResponse) {
                //window.location.reload(true);
                if (CStudioAuthoringContext.isPreview) {
                  CStudioAuthoring.Operations.refreshPreview();
                }
                eventNS.data = CStudioAuthoring.SelectedContent.getSelectedContent();
                document.dispatchEvent(eventNS);
                YDom.get('curtain').style.display = 'none';
                self.dialog.hide();
              },
              failure: function (oResponse) {
                self.pageRedirect(oResponse);
                if (oResponse.status == -1) {
                  CStudioAuthoring.Operations.showSimpleDialog(
                    'Reject-dialog',
                    CStudioAuthoring.Operations.simpleDialogTypeINFO,
                    'Notification',
                    'Reject is taking longer. The icon status will be updated once the content rejected.',
                    [
                      {
                        text: 'OK',
                        handler: function () {
                          this.hide();
                          window.location.reload(true);
                        },
                        isDefault: false
                      }
                    ],
                    YAHOO.widget.SimpleDialog.ICON_BLOCK,
                    'studioDialog',
                    null,
                    1043
                  );
                } else {
                  CStudioAuthoring.Operations.showSimpleDialog(
                    'reject-dialog',
                    CStudioAuthoring.Operations.simpleDialogTypeINFO,
                    'Notification',
                    'Reject items call failed ' + oResponse.statusText + '.',
                    [
                      {
                        text: 'OK',
                        handler: function () {
                          this.hide();
                          self.dialog.hide();
                        },
                        isDefault: false
                      }
                    ],
                    YAHOO.widget.SimpleDialog.ICON_BLOCK,
                    'studioDialog',
                    null,
                    1043
                  );
                }
              },
              timeout: CStudioAuthoring.Request.Timeout.GoLiveTimeout
            };

          //disable submit button to protect multiple submit at the same time.
          YDom.get('golivesubmitButton').disabled = true;
          YDom.get('golivecancelButton').disabled = true;

          // submit to service
          if (YConnect._isFormSubmit) {
            YConnect.resetFormState();
          }
          YConnect.setDefaultPostHeader(false);
          YConnect.initHeader('Content-Type', 'application/json; charset=utf-8');
          YConnect.initHeader(
            CStudioAuthoringContext.xsrfHeaderName,
            CrafterCMSNext.util.auth.getRequestForgeryToken()
          );
          // call go-live
          YConnect.asyncRequest(
            'POST',
            CStudioAuthoringContext.baseUri +
              CStudioAuthoring.Service.rejectContentServiceUrl +
              '?site=' +
              CStudioAuthoringContext.site,
            serviceCallback,
            jsonSubmitString
          );
        } else {
          CStudioAuthoring.Operations.showSimpleDialog(
            'reject-dialog',
            CStudioAuthoring.Operations.simpleDialogTypeINFO,
            'Notification',
            'No items selected.',
            null,
            YAHOO.widget.SimpleDialog.ICON_BLOCK,
            'studioDialog',
            null,
            1043
          );
        }
      };

      CStudioAuthoring.Dialogs.DialogReject.prototype.handleDependencies = function (matchedInputElement, isChecked) {
        //this.updateUncheckedItemList(matchedInputElement, isChecked);

        var selectedElementURI = matchedInputElement.id,
          item = this.flatMap[selectedElementURI];

        if (isChecked) {
          //check all parents
          var parentURI = item.mandatoryParent;
          if (parentURI) {
            var parentItem = this.flatMap[parentURI];
            if (parentItem && parentItem.pages && parentItem.pages.length >= 1) {
              var isReferencePage = this.checkReferencePages(parentItem.pages, item.browserUri);
            }
            var parentInputElement = YDom.get(parentURI);
            parentInputElement.checked = true;
            this.handleDependencies(parentInputElement, true);
          }
        } else {
          var children = this.getChildren(item);
          if (children.length) {
            for (var i = 0; i < children.length; i++) {
              var child = children[i];
              var childInputElement = YDom.get(child.uri);
              childInputElement.checked = false;
              this.handleDependencies(childInputElement, false);
            }
          }
        }
      };

      CStudioAuthoring.Dialogs.DialogReject.prototype.displayItemListWithDependencies = function (dependencyList) {
        // Instantiate the Panel
        this.dialog = this.createPanel('submitPanel', true, 10);
        this.dialog.setBody(REJECT_DIALOG_TEMPLATE);
        this.dialog.render(document.body);
        this.dialog.show();

        this.dialog.mask.style.zIndex = '1030';

        // set z-index for panel so that it will appear over context nav bar also.
        var oContainerPanel = YDom.get('submitPanel_c');
        if (oContainerPanel && oContainerPanel.style.zIndex != '') {
          var zIdx = oContainerPanel.style.zIndex;
          if (!isNaN(zIdx) && parseInt(zIdx, 10) <= 100) {
            oContainerPanel.style.zIndex = '1042';
          }
        }

        var dependencies = dependencyList.items;

        var html = [];

        const renderItems = (items) => {
          CStudioAuthoring.Utils.each(items, function (index, item) {
            html.push(
              '<tr>',
              /**/ '<td class="text-center">',
              /**/ /**/ `<input type="checkbox" class="item-checkbox" data-item-id="${encodeURIComponent(
                item.uri
              )}" checked />`,
              /**/ '</td>',
              /**/ '<td class="name">',
              /**/ /**/ '<div class="in">',
              /**/ /**/ /**/ CrafterCMSNext.util.string.escapeHTML(`${item.internalName} ${item.uri}`),
              /**/ /**/ '</div>',
              /**/ /**/ '</div>',
              /**/ '</td>'
            );

            if (item.userFirstName) {
              html.push('<td class="schedule">' + item.userFirstName + '</td>', '</tr>');
            } else {
              html.push('<td class="text-right schedule"></td>', '</tr>');
            }
          });
        };

        renderItems(this.selectedContent);

        html.push(
          `<tr><td></td><td class="dependencies-label">${CMgs.format(langBundle, 'dependenciesLabel')}</td>`
        );

        renderItems(dependencies);

        YDom.get('tbodyDepend').innerHTML = html.join('');

        var itemsCheckbox = YDom.getElementsByClassName('item-checkbox');
        var me = this;
        YEvent.addListener(itemsCheckbox, 'click', function () {
          me.updateUncheckedItemListNew(this);
        });

        // put up curtain on top of nav bar
        YDom.get('curtain').style.display = 'block';

        //check for in-valid inline styles
        var oConfirmDialog = this.dialog;
        if (oConfirmDialog && oConfirmDialog.body && oConfirmDialog.body.style.height != '') {
          oConfirmDialog.body.style.height = '';
        }

        var onCheckBoxSubmittedItemClick = function (event, matchedEl) {
          // skipping email checkbox
          if (matchedEl.id == 'email') return;
          this.handleDependencies(matchedEl, matchedEl.checked);
          this.anyoneSelected = false;

          for (var key in this.flatMap) {
            if (this.flatMap.hasOwnProperty(key)) {
              var inputElement = YDom.get(key);
              this.anyoneSelected = this.anyoneSelected || inputElement.checked;
            }
          }
          var submittButton = YDom.get('golivesubmitButton');
          submittButton.disabled = !this.anyoneSelected;
        };

        // handle checkbox clicks
        YEvent.delegate(
          'acnVersionWrapper',
          'click',
          onCheckBoxSubmittedItemClick,
          '.acnLiveTableCheckbox > input',
          this,
          true
        );
        YEvent.delegate(
          'acnSubmitWrapper',
          'click',
          onCheckBoxSubmittedItemClick,
          '.acnLiveTableCheckbox > input',
          this,
          true
        );

        this.publishingChannelsInit();

        var submitInvokeReject = function () {
          this.invokeRejectService();
          this.closeDialog();
        };

        YEvent.addListener('golivesubmitButton', 'click', this.invokeRejectService, this, true);
        YEvent.addListener('golivecancelButton', 'click', this.closeDialog, this, true);

        // hide dependency line if only 1 item
        if (this.dependencyJsonObj.items.length == 1) {
          // only 1 item in the json obj
          if (this.dependencyJsonObj.items[0].numOfChildren == 0) {
            // and no children
            var dependencyText = YDom.get('depText');
            if (dependencyText) {
              YDom.setStyle(dependencyText, 'display', 'none');
            }
          }
        }

        YEvent.removeListener('now', 'click', this.toggleTimeSelection);
        YEvent.addListener('now', 'click', this.toggleTimeSelection);
        YEvent.removeListener('settime', 'click', this.toggleTimeSelection);
        YEvent.addListener('settime', 'click', this.toggleTimeSelection);

        var submittButton = YDom.get('golivesubmitButton');
        if (submittButton) {
          CStudioAuthoring.Utils.setDefaultFocusOn(submittButton);
        }
      };

      // Listener to change select box message in reject pop-up
      CStudioAuthoring.Dialogs.DialogReject.prototype.onRejectSelectBoxChange = function (e) {
        var reasonList = YDom.get('rejectReasonDropDown');
        var chosenOption = reasonList.options[reasonList.selectedIndex].value;
        try {
          CStudioAuthoring.Service.getRejectionReason('en', chosenOption, {
            success: function (content) {
              if (content) {
                YDom.get('rejectMessageArea').value = content;
              } else {
                YDom.get('rejectMessageArea').value = '';
              }
            },
            failure: function (message) {
              console.log('message');
            }
          });
        } catch (err) {
          console.log(err);
        }
      };

      CStudioAuthoring.Dialogs.DialogReject.prototype.getDependenciesForGoLiveItemList = function (contentItems) {
        var self = this;
        if (this.itemArray.length) {
          var xmlString = CStudioAuthoring.Utils.createContentItemsJson(contentItems),
            dependencyUrl =
              CStudioAuthoringContext.baseUri +
              CStudioAuthoring.Service.getDependenciesServiceUrl +
              '?site=' +
              CStudioAuthoringContext.site;

          if (YConnect._isFormSubmit) {
            YConnect.resetFormState();
          }
          YConnect.setDefaultPostHeader(false);
          YConnect.initHeader('Content-Type', 'application/xml; charset=utf-8');
          YConnect.initHeader(
            CStudioAuthoringContext.xsrfHeaderName,
            CrafterCMSNext.util.auth.getRequestForgeryToken()
          );
          YConnect.asyncRequest(
            'POST',
            dependencyUrl,
            {
              success: function (o) {
                var respText = o.responseText;
                var timeZoneText = o.getResponseHeader.Timezone;

                self.dependencyJsonObj = eval('(' + respText + ')');
                self.dependencyJsonObj.items = self.dependencyJsonObj.items.concat(self.selectedContent);

                self.flatMap = self.createItemMap();
                self.uncheckedItemsArray = [];
                self.displayItemListWithDependencies(eval('(' + respText + ')'));

                // get reject reason from hidden div
                var reasonJsonArray = [];

                for (var i = 0; i < reasonJsonArray.length; i++) {
                  self.reasonHash[reasonJsonArray[i].title] = reasonJsonArray[i].body;
                }
                YEvent.addListener('rejectReasonDropDown', 'change', self.onRejectSelectBoxChange, self, true);
              },
              failure: function (o) {
                self.pageRedirect(o);
                CStudioAuthoring.Operations.showSimpleDialog(
                  'error-dialog',
                  CStudioAuthoring.Operations.simpleDialogTypeINFO,
                  'Notification',
                  o.statusText,
                  null,
                  YAHOO.widget.SimpleDialog.ICON_BLOCK,
                  'studioDialog',
                  null,
                  1043
                );
              }
            },
            xmlString
          );
        } else {
          CStudioAuthoring.Operations.showSimpleDialog(
            'error-dialog',
            CStudioAuthoring.Operations.simpleDialogTypeINFO,
            'Notification',
            'No items selected',
            null,
            YAHOO.widget.SimpleDialog.ICON_BLOCK,
            'studioDialog',
            null,
            1043
          );
        }
      };

      CStudioAuthoring.Dialogs.DialogReject.prototype.closeDialog = function () {
        // remove curtain on top of nav bar
        YDom.get('curtain').style.display = 'none';

        this.dialog.destroy();

        //clear the overlay mask if it remains after closing the dialog.
        var tempMask = YDom.getElementsByClassName('mask');
        for (var i = 0; i < tempMask.length; ++i) {
          tempMask[i].parentNode.removeChild(tempMask[i]);
        }
      };

      CStudioAuthoring.Dialogs.DialogReject.prototype.showDialog = function (site, contentItems) {
        var selectedContent = CStudioAuthoring.SelectedContent.getSelectedContent();
        this.init();

        for (var i = 0; i < selectedContent.length; i++) {
          this.itemArray.push(selectedContent[i].uri);
        }

        this.selectedContent = selectedContent;
        this.getDependenciesForGoLiveItemList(contentItems);
      };

      CStudioAuthoring.Dialogs.DialogReject.prototype.ifExistsInUncheckedItemsArrayNew = function (url) {
        var self = this;
        self.uncheckedItemsArrayNew;
        var found = -1;
        if (self.uncheckedItemsArrayNew) {
          for (var i = 0; i < self.uncheckedItemsArrayNew.length; ++i) {
            if (self.uncheckedItemsArrayNew[i] == url) {
              found = i;
              break;
            }
          }
          return found;
        } else {
          return found;
        }
      };

      CStudioAuthoring.Dialogs.DialogReject.prototype.updateUncheckedItemListNew = function (elt) {
        // walk the DOM to get the path
        // get parent of current element
        var //
          url = decodeURIComponent(elt.getAttribute('data-item-id')),
          isChecked = elt.checked;

        if (isChecked == false) {
          // add unchecked items to array
          // check if this item exists in uncheckedItemsArray
          if (this.ifExistsInUncheckedItemsArrayNew(url) == -1) {
            //add only if item does not exist in array
            this.uncheckedItemsArrayNew.push(url);
          }
        } else {
          //checked==true
          var found = this.ifExistsInUncheckedItemsArrayNew(url);
          if (found != -1) {
            this.uncheckedItemsArrayNew.splice(found, 1); // remove element
          }
        }
      };

      CStudioAuthoring.Dialogs.DialogReject.prototype.removeItemNew = function (jsonArray, browserUri) {
        for (var i = 0; i < jsonArray.length; i++) {
          var obj = jsonArray[i];
          if ('browserUri' in obj) {
            if (obj['uri'] == browserUri) {
              //push all child pages into selected list array,
              //so that, if any item selected iside the child items
              //will come into selected elements list
              /*if (obj['children'].length >= 1) {
                                            for (var chdIdx =0; chdIdx < obj['children'].length; chdIdx++) {
                                                jsonArray.push(obj['children'][chdIdx]);
                                            }
                                        }*/

              if (jsonArray.length == 1) {
                jsonArray.length = 0; // make array of 0 length
                jsonArray.splice(i, 1); // remove element
              } else {
                jsonArray.splice(i, 1); // remove element
              }
              break;
            }
          }
          if ('children' in obj) {
            this.removeItemNew(obj.children, browserUri);
          }
        }
      };

      CStudioAuthoring.Dialogs.DialogReject.prototype.removeUncheckedItemsFromJsonNew = function () {
        // the idea here is to resubmit the dependencyJsonObj with the unchecked items removed
        var uncheckedItems = this.uncheckedItemsArrayNew,
          uncheckedItemsArrayLen = uncheckedItems.length;

        for (var i = 0; i < uncheckedItemsArrayLen; ++i) {
          this.removeItemNew(this.dependencyJsonObj.items, uncheckedItems[i]);
        }
        this.selectedJsonObj = this.clone_obj_uri(this.dependencyJsonObj);

        return uncheckedItemsArrayLen;
      };

      // Create GoLive dialog instance
      var reject = new CStudioAuthoring.Dialogs.DialogReject();

      // Create a global pointer to the current dialog instance
      CStudioAuthoring.Dialogs.DialogReject.instance = reject;

      // dialog instance will be reused with every call to 'dialog-approve'
      CStudioAuthoring.Module.moduleLoaded('dialog-reject', reject);
    }
  }
);
