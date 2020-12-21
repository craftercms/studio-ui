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
 * Active Content Plugin
 */
CStudioAuthoring.ContextualNav.WcmActiveContentMod =
  CStudioAuthoring.ContextualNav.WcmActiveContentMod ||
  (function() {
    var filePermissions = { fileLen: 0 }, // Cache the file permissions for the files selected
      permissionAggregateCounter = {}; // Keep a counter of all the permissions from the selected files

    return {
      initialized: false,

      /**
       * initialize module
       */
      initialize: function(config) {
        if (!CStudioAuthoring.ContextualNav.WcmActiveContent) {
          this.renderActiveContent();
          CStudioAuthoring.ContextualNav.WcmActiveContent.init();
        }
      },

      renderActiveContent: function() {
        var YDom = YAHOO.util.Dom,
          YEvent = YAHOO.util.Event,
          navWcmContent,
          _this; // Reference to CStudioAuthoring.ContextualNav.WcmActiveContent

        contextPath = location.protocol + '//' + location.hostname + ':' + location.port;

        var CMgs = CStudioAuthoring.Messages;
        var contextNavLangBundle = CMgs.getBundle('contextnav', CStudioAuthoringContext.lang);

        /**
         * WCM Site Dropdown Contextual Active Content
         */
        _this = CStudioAuthoring.register({
          'ContextualNav.WcmActiveContent': {
            options: [
              {
                name: CMgs.format(contextNavLangBundle, 'wcmContentEdit'),
                allowAuthor: true,
                allowAdmin: true,
                allowBulk: false,
                renderId: 'Edit'
              },
              {
                name: CMgs.format(contextNavLangBundle, 'wcmContentSubmit'),
                allowAuthor: true,
                allowAdmin: true,
                allowBulk: true,
                renderId: 'SimpleSubmit'
              },
              {
                name: CMgs.format(contextNavLangBundle, 'wcmContentDelete'),
                allowAuthor: true,
                allowAdmin: true,
                allowBulk: true,
                renderId: 'Delete'
              },
              {
                name: CMgs.format(contextNavLangBundle, 'wcmContentRequestDelete'),
                allowAuthor: true,
                allowAdmin: false,
                allowBulk: true,
                renderId: 'ScheduleForDelete'
              },
              {
                name: CMgs.format(contextNavLangBundle, 'wcmContentReject'),
                allowAuthor: true,
                allowAdmin: true,
                allowBulk: true,
                renderId: 'Reject'
              },
              {
                name: CMgs.format(contextNavLangBundle, 'wcmContentSchedule'),
                allowAuthor: true,
                allowAdmin: true,
                allowBulk: true,
                renderId: 'ApproveCommon'
              },
              {
                name: CMgs.format(contextNavLangBundle, 'wcmContentApprove'),
                allowAuthor: true,
                allowAdmin: true,
                allowBulk: true,
                renderId: 'ApproveCommon'
              },
              {
                name: CMgs.format(contextNavLangBundle, 'wcmContentDuplicate'),
                allowAuthor: true,
                allowAdmin: true,
                allowBulk: false,
                renderId: 'Duplicate'
              },
              {
                name: CMgs.format(contextNavLangBundle, 'wcmContentDependencies'),
                allowAuthor: true,
                allowAdmin: true,
                allowBulk: false,
                renderId: 'ViewDependencies'
              },
              {
                name: CMgs.format(contextNavLangBundle, 'wcmContentHistory'),
                allowAuthor: true,
                allowAdmin: true,
                allowBulk: false,
                renderId: 'VersionHistory'
              }
            ],

            /**
             * initialize widget
             */
            init: function() {
              var me = this;

              CStudioAuthoring.Events.contentSelected.subscribe(function(evtName, contentTO) {
                var selectedContent, callback;
                if (contentTO[0] && contentTO[0].path) {
                  selectedContent = CStudioAuthoring.SelectedContent.getSelectedContent();

                  if (selectedContent.length) {
                    $('#activeContentActions').addClass('selected-content');
                  }

                  callback = {
                    success: function(isWrite, perms) {
                      var totalPerms, isWrite;

                      this._self.addFilePermissions(this.filePath, perms, filePermissions, permissionAggregateCounter);
                      totalPerms = this._self.getAgreggatePermissions(
                        filePermissions.fileLen,
                        permissionAggregateCounter
                      );
                      isWrite = this._self.hasWritePermission(totalPerms);
                      this._self._drawNav(selectedContent, isWrite, totalPerms);

                      if (CStudioAuthoringContext.isPreview == true && selectedContent[0].disabled == true) {
                        var noticeEl = document.createElement('div');
                        this._self.containerEl.parentNode.parentNode.appendChild(noticeEl);
                        YDom.addClass(noticeEl, 'acnDisabledContent');
                        noticeEl.innerHTML = CMgs.format(contextNavLangBundle, 'wcmContentPageDisabled');
                      } else {
                        me.removeDisableMessage();
                      }

                      var thisContext = this;
                      var saveDraftFlag = false;
                      (function(saveDraftFlag) {
                        var currentContent;
                        for (var s = 0; s < selectedContent.length; s++) {
                          currentContent = selectedContent[s];

                          var noticeEls = YDom.getElementsByClassName(
                            'acnDraftContent',
                            null,
                            _this.containerEl.parentNode.parentNode
                          );
                          if (currentContent.savedAsDraft == true) {
                            saveDraftFlag = true;
                            if (noticeEls.length < 1) {
                              var noticeEl = document.createElement('div');
                              thisContext._self.containerEl.parentNode.parentNode.appendChild(noticeEl);
                              YDom.addClass(noticeEl, 'acnDraftContent');
                              noticeEl.innerHTML = CMgs.format(contextNavLangBundle, 'wcmContentSavedAsDraft');
                            }
                          } else {
                            if (!saveDraftFlag) {
                              me.removeNotices(noticeEls);
                            }
                          }
                        }
                      })(saveDraftFlag);
                    },
                    failure: function() {
                      //TDOD: log error, not mute it
                    },

                    selectedContent: selectedContent,
                    _self: _this,
                    filePath: contentTO[0].path
                  };

                  _this.checkWritePermission(contentTO[0].uri, callback);
                }
              });

              document.addEventListener(
                'crafter.create.contenMenu',
                function(e) {
                  if (e.item && CStudioAuthoring.SelectedContent.getSelectedContent()[0]) {
                    if (CStudioAuthoringContext.isPreview && (e.item.isPage || e.item.isAsset)) {
                      CStudioAuthoring.SelectedContent.clear();
                      CStudioAuthoring.SelectedContent.setContent(e.item);
                    }
                    _this.drawNav();
                  } else {
                    if (YDom.get('activeContentActions').innerHTML) {
                      YDom.get('activeContentActions').innerHTML = '';
                      _this.drawNav();
                    }
                  }
                },
                false
              );

              document.addEventListener(
                'crafter.refresh',
                function(e) {
                  function lookupSiteContent(curNode, paramCont) {
                    var dataUri = e.data.uri ? e.data.uri : e.data[0] ? e.data[0].uri : e.data.data.uri,
                      contentUri = curNode && curNode.uri ? curNode.uri : dataUri,
                      typeAction = e.typeAction ? e.typeAction : '';

                    if (contentUri) {
                      CStudioAuthoring.Service.lookupSiteContent(
                        CStudioAuthoringContext.site,
                        contentUri,
                        1,
                        'default',
                        {
                          success: function(treeData) {
                            var cont = paramCont ? paramCont : 0;

                            if (
                              typeAction === 'publish' &&
                              treeData.item.inProgress &&
                              !treeData.item.scheduled &&
                              cont < 5
                            ) {
                              treeData.item.inFlight = true;
                            }
                            if (treeData.item.inFlight) {
                              cont++;
                              if (!nodeOpen) {
                                eventCM.typeAction = e.typeAction;
                                eventCM.item = treeData.item;
                                document.dispatchEvent(eventCM);
                              }
                              if (cont < 5) {
                                setTimeout(function() {
                                  lookupSiteContent(curNode, cont);
                                }, 3000);
                              } else {
                                if (typeof WcmDashboardWidgetCommon != 'undefined') {
                                  WcmDashboardWidgetCommon.refreshAllDashboards();
                                }
                              }
                            } else {
                              cont++;
                              if (cont < 2) {
                                setTimeout(function() {
                                  lookupSiteContent(curNode, cont);
                                }, 300);
                              } else {
                                if (!nodeOpen) {
                                  eventCM.typeAction = e.typeAction;
                                  eventCM.item = treeData.item;
                                  document.dispatchEvent(eventCM);
                                }
                                if (typeof WcmDashboardWidgetCommon != 'undefined') {
                                  WcmDashboardWidgetCommon.refreshAllDashboards();
                                }
                              }
                            }
                          },
                          failure: function() {}
                        }
                      );
                    }
                  }

                  if (typeof WcmDashboardWidgetCommon != 'undefined') {
                    WcmDashboardWidgetCommon.refreshAllDashboards();
                    _this.drawNav();
                  }
                  // wcm_content should not be refreshed in site-config page
                  if (window.location.pathname !== '/studio/site-config') {
                    lookupSiteContent(CStudioAuthoring.SelectedContent.getSelectedContent()[0]);
                  }
                },
                false
              );

              CStudioAuthoring.Events.contentUnSelected.subscribe(function(evtName, contentTO) {
                var selectedContent, totalPerms, noticeEl, isWrite;

                if (contentTO[0] && contentTO[0].path) {
                  selectedContent = CStudioAuthoring.SelectedContent.getSelectedContent();

                  if (!selectedContent.length) {
                    $('#activeContentActions').removeClass('selected-content');
                  }

                  var saveDraftFlag = false;
                  var noticeEls = YDom.getElementsByClassName(
                    'acnDraftContent',
                    null,
                    _this.containerEl.parentNode.parentNode
                  );
                  (function(saveDraftFlag, noticeEls, selectedContent) {
                    if (selectedContent.length > 0) {
                      for (var s = 0; s < selectedContent.length; s++) {
                        var currentContent = selectedContent[s];
                        if (currentContent.savedAsDraft == true && selectedContent.length > 0) {
                          saveDraftFlag = true;
                          noticeEls = YDom.getElementsByClassName(
                            'acnDraftContent',
                            null,
                            _this.containerEl.parentNode.parentNode
                          );
                          if (noticeEls.length < 1) {
                            var noticeEl = document.createElement('div');
                            _this.containerEl.parentNode.parentNode.appendChild(noticeEl);
                            YDom.addClass(noticeEl, 'acnDraftContent');
                            noticeEl.innerHTML = CMgs.format(contextNavLangBundle, 'wcmContentSavedAsDraft');
                          }
                        } else {
                          if (!saveDraftFlag /*|| (saveDraftFlag && selectedContent.length-1 == s )*/) {
                            me.removeNotices(noticeEls);
                          }
                        }
                      }
                    } else {
                      noticeEls = YDom.getElementsByClassName(
                        'acnDraftContent',
                        null,
                        _this.containerEl.parentNode.parentNode
                      );
                      me.removeNotices(noticeEls);
                    }
                  })(saveDraftFlag, noticeEls, selectedContent);

                  _this.removeFilePermissions(contentTO[0].path, filePermissions, permissionAggregateCounter);

                  if (filePermissions.fileLen) {
                    selectedContent = CStudioAuthoring.SelectedContent.getSelectedContent();
                    totalPerms = _this.getAgreggatePermissions(filePermissions.fileLen, permissionAggregateCounter);
                    isWrite = _this.hasWritePermission(totalPerms);
                    _this._drawNav(selectedContent, isWrite, totalPerms);

                    if (CStudioAuthoringContext.isPreview == true && selectedContent[0].disabled == true) {
                      noticeEl = document.createElement('div');
                      _this.containerEl.parentNode.parentNode.appendChild(noticeEl);
                      YDom.addClass(noticeEl, 'acnDisabledContent');
                      noticeEl.innerHTML = CMgs.format(contextNavLangBundle, 'wcmContentPageDisabled');
                    } else {
                      me.removeDisableMessage();
                    }
                  } else {
                    _this.renderSelectNone();
                  }
                } else {
                  _this.renderSelectNone();
                }
              });

              for (var i = 0, opts = this.options, l = opts.length, opt = opts[0]; i < l; opt = opts[++i]) {
                opts[i].renderer = this['render' + opt.renderId];
              }
              navWcmContent = _this;
              YEvent.onAvailable(
                'activeContentActions',
                function(parentControl) {
                  parentControl.containerEl = YDom.get('activeContentActions');
                  navWcmContent.drawNav();
                  CStudioAuthoring.Events.moduleActiveContentReady.fire();
                },
                this
              );
            },

            /*
             * Adds a file and its permissions to a hash map and adds its permissions to a permissionAggregator.
             */
            addFilePermissions: function addFilePermissions(fileId, perms, permissionsHash, permissionAgreggator) {
              if (typeof fileId == 'string') {
                permissionsHash.fileLen++; // Increment file counter
                permissionsHash[fileId] = perms;
                perms.forEach(function(permObj) {
                  if (typeof permissionAgreggator[permObj] == 'number') {
                    // Check if the permission already exists in the permission agreggator
                    permissionAgreggator[permObj] = permissionAgreggator[permObj] + 1;
                  } else {
                    // Add a new permission to the permission agreggator
                    permissionAgreggator[permObj] = 1;
                  }
                });
              }
            },

            /*
             * Removes a file and its permissions from a hash map and subtracts its permissions from a permissionAggregator.
             */
            removeFilePermissions: function removeFilePermissions(fileId, permissionsHash, permissionAgreggator) {
              var perms;

              if (typeof fileId == 'string' && permissionsHash.hasOwnProperty(fileId)) {
                permissionsHash.fileLen--; // Decrement file counter
                perms = permissionsHash[fileId];

                perms.forEach(function(permObj) {
                  if (typeof permissionAgreggator[permObj] == 'number') {
                    // Check if the permission already exists in the permission agreggator
                    permissionAgreggator[permObj] = permissionAgreggator[permObj] - 1;
                  }
                });

                // Remove file from hash map
                delete permissionsHash[fileId];
              }
            },

            getAgreggatePermissions: function getAgreggatePermissions(totalFiles, permissionAgreggator) {
              var result = [];
              var permObj;

              for (var permission in permissionAgreggator) {
                if (permissionAgreggator.hasOwnProperty(permission) && permissionAgreggator[permission] == totalFiles) {
                  // Permissions that are present for all files are added to permissions array
                  //permObj = {};
                  //permObj['permission'] = permission;

                  result.push(permission);
                }
              }
              return result;
            },

            removeDisableMessage: function() {
              var messages = YDom.getElementsByClassName('acnDisabledContent');

              for (var x = 0; x < messages.length; x++) {
                messages[x].remove();
              }
            },

            removeNotices: function(noticeEls) {
              for (var n = 0; n < noticeEls.length; n++) {
                var curNode = noticeEls[n];
                curNode.parentNode.removeChild(curNode);
              }
            },

            /**
             * render the navigation bar
             */
            drawNav: function() {
              var selectedContent = CStudioAuthoring.SelectedContent.getSelectedContent(),
                me = this;

              if (selectedContent.length != 0) {
                this.checkWritePermission(selectedContent[0].uri, {
                  success: function(isWrite, perms) {
                    this._self._drawNav(selectedContent, isWrite, perms);

                    if (CStudioAuthoringContext.isPreview == true && selectedContent[0].disabled == true) {
                      var noticeEl = document.createElement('div');
                      this._self.containerEl.parentNode.parentNode.appendChild(noticeEl);
                      YDom.addClass(noticeEl, 'acnDisabledContent');
                      noticeEl.innerHTML = CMgs.format(contextNavLangBundle, 'wcmContentPageDisabled');
                    } else {
                      me.removeDisableMessage();
                    }

                    var thisContext = this;
                    for (var s = 0; s < selectedContent.length; s++) {
                      CStudioAuthoring.Service.lookupContentItem(CStudioAuthoringContext.site, selectedContent[s].uri, {
                        success: function(content) {
                          if (content.item.savedAsDraft == true) {
                            var noticeEls = YDom.getElementsByClassName(
                              'acnDraftContent',
                              null,
                              _this.containerEl.parentNode.parentNode
                            );
                            if (noticeEls.length < 1) {
                              var noticeEl = document.createElement('div');
                              thisContext._self.containerEl.parentNode.parentNode.appendChild(noticeEl);
                              YDom.addClass(noticeEl, 'acnDraftContent');
                              noticeEl.innerHTML = CMgs.format(contextNavLangBundle, 'wcmContentSavedAsDraft');
                            }
                          }
                        }
                      });
                    }
                  },
                  failure: function() {
                    //TDOD: log error, not mute it
                  },

                  selectedContent: selectedContent,
                  _self: this
                });
              } else {
                this.renderSelectNone();
              }
            },

            /**
             * draw navigation after security check on item
             */
            _drawNav: function(selectedContent, isWrite, perms) {
              var icon = '',
                isAdmin = CStudioAuthoringContext.role == 'admin',
                isBulk = true,
                isRelevant = true,
                state = '',
                stateKey = '',
                prevState = '',
                auxIcon = '',
                isInFlight = false,
                isOneItemLocked = false,
                itemLocked,
                spanIcon;

              if (selectedContent.length === 0) {
                this.renderSelectNone();
              } else {
                if (selectedContent.length > 1) {
                  var i,
                    auxState,
                    count = 0,
                    iconsCount = 0,
                    l = selectedContent.length,
                    newFileFlag = true;

                  for (i = 0; i < l; i++) {
                    auxState = CStudioAuthoring.Utils.getContentItemStatus(selectedContent[i], true).string;
                    auxIcon = CStudioAuthoring.Utils.getIconFWClasses(selectedContent[i]);
                    itemLocked = CStudioAuthoring.Utils.isItemLocked(selectedContent[i]);

                    // If there is at least one item locked, isOneItemLocked === true
                    isOneItemLocked = isOneItemLocked || itemLocked;

                    if (newFileFlag && !selectedContent[i].newFile) {
                      newFileFlag = false;
                    }
                    if (i === 0) {
                      // first iteration
                      prevState = auxState;
                      state += auxState;
                      count++;
                    } else {
                      if (prevState != auxState) {
                        prevState = auxState;
                        state += '|' + auxState;
                        count++;
                      }
                    }

                    if (icon != auxIcon) {
                      icon = auxIcon;
                      iconsCount++;
                    }
                    if (selectedContent[i].deleted) {
                      isRelevant = false;
                    }
                  }

                  count > 1 && (icon = '');
                  iconsCount > 1 && (icon = '');
                  if (newFileFlag) {
                    state += '*';
                  }
                } else {
                  isBulk = false;
                  state = CStudioAuthoring.Utils.getContentItemStatus(selectedContent[0], true).string;
                  stateKey = CStudioAuthoring.Utils.getContentItemStatus(selectedContent[0], true).key;

                  icon = CStudioAuthoring.Utils.getContentItemIcon(selectedContent[0]);
                  if (selectedContent[0].internalName) {
                    $(icon)
                      .append(selectedContent[0].internalName)
                      .attr('title', selectedContent[0].internalName)
                      .addClass('active-content-icon-with-item-name')
                      .find('.status-icon')
                      .css('marginRight', 20);
                  }

                  isInFlight = selectedContent[0].inFlight;
                  isOneItemLocked = CStudioAuthoring.Utils.isItemLocked(selectedContent[0]);

                  if (selectedContent[0].lockOwner !== '') {
                    if (selectedContent[0].lockOwner != CStudioAuthoringContext.user) {
                      isWrite = false;
                    } else {
                      isWrite = true;
                    }
                  }

                  if (selectedContent[0].deleted) {
                    isRelevant = false;
                  }
                  if (selectedContent[0].newFile) {
                    state += '*';
                  }
                }

                this.renderSelect(
                  icon,
                  state,
                  isBulk,
                  isAdmin,
                  isRelevant,
                  isInFlight,
                  isWrite,
                  perms,
                  isOneItemLocked,
                  stateKey
                );
              }
              // add class to remove border from last item - would be more efficient using YUI Selector module, but it's currently not loaded
              var itemContainer = document.getElementById('acn-active-content');
              if (itemContainer.hasChildNodes()) {
                var lastItem = itemContainer.lastChild;
                lastItem.className += ' acn-link-last';
                // override background for first menu item
                if (itemContainer.children.length > 0) {
                  var secondItem = itemContainer.children[1];
                  if (secondItem) {
                    secondItem.style.background = 'none';
                  }
                }
              }

              this.renderSelectedItemsCount(selectedContent);
            },

            renderSelectedItemsCount: function(selectedContent) {
              const $activeContentContainer = $('#activeContentActions');
              $activeContentContainer.off('click', '.clear-selected', this.clearSelectedContent);

              if ($('body').hasClass('embedded') && selectedContent.length) {
                $activeContentContainer.append(
                  '<li class="acn-link items-count">' +
                    `<p>${selectedContent.length} item${selectedContent.length > 1 ? 's' : ''} selected` +
                    '<a class="clear-selected" href="#">' +
                    '<svg class="MuiSvgIcon-root" focusable="false" viewBox="0 0 24 24" aria-hidden="true">' +
                    '<path d="M14.59 8L12 10.59 9.41 8 8 9.41 10.59 12 8 14.59 9.41 16 12 13.41 14.59 16 16 14.59 13.41 12 16 9.41 14.59 8zM12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>' +
                    '</svg>' +
                    '</a>' +
                    '</p>' +
                    '</li>'
                );

                $activeContentContainer.on('click', '.clear-selected', this.clearSelectedContent);
              } else {
                $activeContentContainer.remove('.items-count');
              }
            },

            clearSelectedContent: function(e) {
              e.preventDefault();
              $('#activeContentActions').removeClass('selected-content');
              WcmDashboardWidgetCommon.clearSelections();
              CStudioAuthoring.SelectedContent.clear();
            },

            hasWritePermission: function hasWritePermission(permissions) {
              var isWrite = CStudioAuthoring.Service.isWrite(permissions);
              var isUserAllowed = CStudioAuthoring.Service.isUserAllowed(permissions);

              if (isWrite && isUserAllowed) {
                return true;
              } else {
                return false;
              }
            },

            /**
             * check permissions on the given path
             */
            checkWritePermission: function(path, callback) {
              //Get user permissions to get read write operations
              var _this = this,
                checkPermissionsCb = {
                  success: function(results) {
                    var isWrite = _this.hasWritePermission(results.permissions);
                    callback.success(isWrite, results.permissions);
                  },
                  failure: function() {}
                };
              CStudioAuthoring.Service.getUserPermissions(CStudioAuthoringContext.site, path, checkPermissionsCb);
            },

            /**
             * select none
             */
            renderSelectNone: function() {
              this.containerEl.innerHTML = '';
            },

            /**
             * render many items
             */
            renderSelect: function(
              icon,
              state,
              isBulk,
              isAdmin,
              isRelevant,
              isInFlight,
              isWrite,
              perms,
              isOneItemLocked,
              stateKey
            ) {
              this.containerEl.innerHTML = '';
              var navLabelElContainer = document.createElement('li');
              var navLabelEl = document.createElement('span');

              navLabelEl.innerHTML = '';

              for (var i = 0; i < this.options.length; i++) {
                var option = this.options[i];
                if (isInFlight != undefined && isInFlight != null) {
                  option.isInFlight = isInFlight;
                }
                if (!option.renderer) {
                  navWcmContent.createNavItem(option, isBulk, isAdmin, true, false, perms);
                } else {
                  // The last parameter (isOneItemLocked) was added for renderDelete which needs to know if one of the
                  // content items is currently locked or not
                  option.renderer.render(
                    option,
                    isBulk,
                    isAdmin,
                    state,
                    isRelevant,
                    isWrite,
                    perms,
                    isOneItemLocked,
                    stateKey
                  );
                }
              }

              if ('string' === typeof icon) {
                $(navLabelEl).addClass(`${icon} context-nav-title-element navbar-text`);
              } else {
                $(navLabelEl).addClass('context-nav-title-element navbar-text');
                navLabelEl.appendChild(icon);
              }

              navLabelElContainer.appendChild(navLabelEl);
              if (this.containerEl.children.length) {
                YDom.insertBefore(navLabelElContainer, this.containerEl.firstChild);
              } else {
                this.containerEl.appendChild(navLabelElContainer);
              }
            },
            /**
             * render new option
             */
            renderNew: {
              render: function(option, isBulk, isAdmin, state, isRelevant, isWrite) {
                option.onclick = function() {
                  CStudioAuthoring.Operations.createNewContent(
                    CStudioAuthoringContext.site,
                    CStudioAuthoring.SelectedContent.getSelectedContent()[0].uri
                  );
                };
                _this.createNavItem(option, isBulk, isAdmin, true, !isWrite);
              }
            },
            /**
             * handle edit
             */
            renderEdit: {
              render: function(option, isBulk, isAdmin, state, isRelevant, isWrite, perms, isOneItemLocked, stateKey) {
                const content = CStudioAuthoring.SelectedContent.getSelectedContent();

                option.onclick = function() {
                  const path = content[0].uri;
                  const site = CrafterCMSNext.system.store.getState().sites.active;
                  const authoringBase = CrafterCMSNext.system.store.getState().env.authoringBase;
                  const legacyFormSrc = `${authoringBase}/legacy/form?`;
                  const src = `${legacyFormSrc}site=${site}&path=${path}&type=form`;
                  if (isWrite) {
                    // Edit Mode
                    CrafterCMSNext.services.content.fetchWorkflowAffectedItems(site, path).subscribe((items) => {
                      let eventIdSuccess = 'editDialogSuccess';
                      let eventIdDismissed = 'editDialogDismissed';
                      let unsubscribe, cancelUnsubscribe;
                      if (items && items.length > 0) {
                        CrafterCMSNext.system.store.dispatch({
                          type: 'SHOW_WORKFLOW_CANCELLATION_DIALOG',
                          payload: {
                            items,
                            onContinue: {
                              type: 'SHOW_EDIT_DIALOG',
                              payload: {
                                src,
                                onSaveSuccess: {
                                  type: 'BATCH_ACTIONS',
                                  payload: [
                                    {
                                      type: 'DISPATCH_DOM_EVENT',
                                      payload: { id: eventIdSuccess }
                                    },
                                    {
                                      type: 'SHOW_EDIT_ITEM_SUCCESS_NOTIFICATION'
                                    },
                                    {
                                      type: 'RELOAD_DETAILED_ITEM',
                                      payload: {
                                        path
                                      }
                                    }
                                  ]
                                },
                                onCancel: {
                                  type: 'BATCH_ACTIONS',
                                  payload: [
                                    {
                                      type: 'CLOSE_EDIT_DIALOG'
                                    },
                                    {
                                      type: 'DISPATCH_DOM_EVENT',
                                      payload: { id: eventIdDismissed }
                                    }
                                  ]
                                }
                              }
                            },
                            onClose: {
                              type: 'BATCH_ACTIONS',
                              payload: [
                                {
                                  type: 'CLOSE_WORKFLOW_CANCELLATION_DIALOG'
                                },
                                {
                                  type: 'DISPATCH_DOM_EVENT',
                                  payload: { id: eventIdDismissed }
                                }
                              ]
                            }
                          }
                        });
                      } else {
                        CrafterCMSNext.system.store.dispatch({
                          type: 'SHOW_EDIT_DIALOG',
                          payload: {
                            src,
                            onSaveSuccess: {
                              type: 'BATCH_ACTIONS',
                              payload: [
                                {
                                  type: 'DISPATCH_DOM_EVENT',
                                  payload: { id: eventIdSuccess }
                                },
                                {
                                  type: 'SHOW_EDIT_ITEM_SUCCESS_NOTIFICATION'
                                },
                                {
                                  type: 'RELOAD_DETAILED_ITEM',
                                  payload: {
                                    path
                                  }
                                }
                              ]
                            },
                            onCancel: {
                              type: 'BATCH_ACTIONS',
                              payload: [
                                {
                                  type: 'CLOSE_EDIT_DIALOG'
                                },
                                {
                                  type: 'DISPATCH_DOM_EVENT',
                                  payload: { id: eventIdDismissed }
                                }
                              ]
                            }
                          }
                        });
                      }

                      unsubscribe = CrafterCMSNext.createLegacyCallbackListener(eventIdSuccess, (response) => {
                        const contentTO = response;
                        const draft = response.action === 'save';
                        const oCurrentTextNodeOldPath = CStudioAuthoring.SelectedContent.getSelectedContent()[0]
                          .browserUri;
                        const pageParameter = CStudioAuthoring.Utils.getQueryParameterURL('page');
                        if (
                          CStudioAuthoring.SelectedContent.getSelectedContent()[0].browserUri !==
                          contentTO.item.browserUri
                        ) {
                          eventNS.oldPath = CStudioAuthoring.SelectedContent.getSelectedContent()[0].uri;
                          CStudioAuthoring.SelectedContent.getSelectedContent()[0] = contentTO.item;
                          if (oCurrentTextNodeOldPath.split('.')[0] === pageParameter.split('.')[0]) {
                            const currentURL = CStudioAuthoring.Utils.replaceQueryParameterURL(
                              window.location.href,
                              'page',
                              contentTO.item.browserUri.indexOf('.xml') > 0
                                ? contentTO.item.browserUri.split('.')[0] + '.html'
                                : contentTO.item.browserUri
                            );
                            window.location.href = currentURL;
                          }
                        }
                        if (CStudioAuthoringContext.isPreview) {
                          try {
                            let currentContentTO,
                              contentTOBrowseUri = contentTO.item.browserUri === '' ? '/' : contentTO.item.browserUri;

                            if (pageParameter === contentTOBrowseUri) {
                              currentContentTO = null;
                            } else {
                              currentContentTO = contentTO.item;
                            }

                            CStudioAuthoring.Operations.refreshPreview(currentContentTO);
                          } catch (err) {
                            if (!draft) {
                              this.callingWindow.location.reload(true);
                            } else {
                              const previewFrameEl = document.getElementById('engineWindow');
                              if (previewFrameEl) {
                                previewFrameEl.contentWindow.location.reload();
                              }
                            }
                          }
                        }

                        if (
                          contentTO.updatedModel &&
                          contentTO.initialModel &&
                          contentTO.updatedModel.orderDefault_f !== contentTO.initialModel.orderDefault_f
                        ) {
                          if (CStudioAuthoring.ContextualNav.WcmRootFolder) {
                            eventYS.data = contentTO.item;
                            eventYS.typeAction = 'edit';
                            eventYS.draft = draft;
                            document.dispatchEvent(eventYS);
                          } else {
                            eventNS.data = contentTO.item;
                            eventNS.typeAction = 'edit';
                            eventNS.draft = draft;
                            document.dispatchEvent(eventNS);
                          }
                        } else {
                          eventNS.data = contentTO.item;
                          eventNS.typeAction = 'edit';
                          eventNS.draft = draft;
                          document.dispatchEvent(eventNS);
                        }

                        if (!CStudioAuthoringContext.isPreview) {
                          if (draft) {
                            CStudioAuthoring.Utils.Cookies.createCookie(
                              'dashboard-checked',
                              JSON.stringify(CStudioAuthoring.SelectedContent.getSelectedContent())
                            );
                          } else {
                            CStudioAuthoring.Utils.Cookies.eraseCookie('dashboard-checked');
                          }
                        }
                        cancelUnsubscribe();
                      });

                      cancelUnsubscribe = CrafterCMSNext.createLegacyCallbackListener(eventIdDismissed, () => {
                        unsubscribe();
                      });
                    });
                  } else {
                    // View Mode
                    CrafterCMSNext.system.store.dispatch({
                      type: 'SHOW_EDIT_DIALOG',
                      payload: {
                        src: `${src}&readonly=true`
                      }
                    });
                  }
                };

                // relevant flag, allowing document & banner to be editable from Search result
                // allowing banner type component
                // alowing crafter-level-descriptor.xml
                var rflag =
                  (isRelevant ||
                    content.document ||
                    (content.component && content.contentType.indexOf('level-descriptor') != -1)) &&
                  state.indexOf('Delete') == -1;
                // if item is deleted and in the go live queue , enable edit.
                if (state.indexOf('Submitted for Delete') >= 0 || state.indexOf('Scheduled for Delete') >= 0) {
                  rflag = true;
                }

                // for edit, if in read-only mode, it should display View, not Edit
                if (isWrite == false) {
                  option.name = CMgs.format(contextNavLangBundle, 'wcmContentView');
                } else {
                  option.name = CMgs.format(contextNavLangBundle, 'wcmContentEdit');
                }

                _this.createNavItem(option, isBulk, isAdmin, rflag, false, !isWrite);
              }
            },
            /**
             * handle duplicate
             */
            renderDuplicate: {
              render: function(option, isBulk, isAdmin, state, isRelevant, isWrite) {
                var content = CStudioAuthoring.SelectedContent.getSelectedContent()[0],
                  uri = content.uri;

                if (isWrite && '/site/website/index.xml' != uri) {
                  option.onclick = function() {
                    CrafterCMSNext.system.store.dispatch({
                      type: 'SHOW_CONFIRM_DIALOG',
                      payload: {
                        title: CrafterCMSNext.i18n.intl.formatMessage({
                          id: 'words.duplicate',
                          defaultMessage: 'Duplicate'
                        }),
                        body: CrafterCMSNext.i18n.intl.formatMessage({
                          id: 'itemMenu.duplicateDialogBody',
                          defaultMessage:
                            "A new copy of this item and all of it's item specific content will be created. Are you sure you wish to proceed?"
                        }),
                        onCancel: {
                          type: 'CLOSE_CONFIRM_DIALOG'
                        },
                        onOk: {
                          type: 'BATCH_ACTIONS',
                          payload: [
                            {
                              type: 'CLOSE_CONFIRM_DIALOG'
                            },
                            {
                              type: 'DUPLICATE_ITEM',
                              payload: {
                                path: uri,
                                onSuccess: {
                                  type: 'SHOW_DUPLICATED_ITEM_SUCCESS_NOTIFICATION'
                                }
                              }
                            }
                          ]
                        }
                      }
                    });
                  };

                  if (content.document || content.component) {
                    // for doc and components disable dublicate link
                    isRelevant = false;
                  }
                  _this.createNavItem(option, isBulk, isAdmin, isRelevant, !isWrite);
                }
              }
            },
            /**
             * render submit option
             */
            renderSimpleSubmit: {
              render: function(option, isBulk, isAdmin, state, isRelevant, isWrite, perms, isOneItemLocked, stateKey) {
                if (CStudioAuthoring.Service.isPublishAllowed(perms)) {
                  return;
                }

                if (isWrite) {
                  if (!isBulk) {
                    var isRelevant = false;
                    if (
                      (stateKey.indexOf('statusInProgress') >= 0 ||
                        stateKey.indexOf('statusDeleted') >= 0 ||
                        stateKey.indexOf('statusSubmittedForDelete') >= 0 ||
                        stateKey.indexOf('statusScheduledForDelete') >= 0) &&
                      !isOneItemLocked
                    ) {
                      isRelevant = true;
                    }
                  }

                  //Check for live items
                  var content = CStudioAuthoring.SelectedContent.getSelectedContent();
                  if (isRelevant && content && content.length >= 1) {
                    for (var conIdx = 0; conIdx < content.length; conIdx++) {
                      if (content[conIdx].live) {
                        isRelevant = false;
                        break;
                      }
                    }
                  }

                  option.onclick = function() {
                    CStudioAuthoring.Operations.submitContent(
                      CStudioAuthoringContext.site,
                      CStudioAuthoring.SelectedContent.getSelectedContent()
                    );
                  };
                  _this.createNavItem(option, isBulk, isAdmin, isRelevant, !isWrite);
                }
              }
            },

            renderScheduleForDelete: {
              render: function(option, isBulk, isAdmin, state, showFlag, isWrite) {
                var isRelevant = false;

                if (isWrite) {
                  //Schedule for Delete link should visible only from wcm search pages.
                  var isInSearchForm = YDom.getElementsByClassName('cstudio-search-result');
                  if (showFlag && isInSearchForm && isInSearchForm.length >= 1) {
                    if (showFlag) {
                      isRelevant = true;
                    }

                    if (state.indexOf('Submitted for Delete') >= 0 || state.indexOf('Scheduled for Delete') >= 0) {
                      isRelevant = true;
                    }
                    option.onclick = function() {
                      CStudioAuthoring.Operations.deleteContent(CStudioAuthoring.SelectedContent.getSelectedContent());
                    };
                  }

                  _this.createNavItem(option, isBulk, isAdmin, isRelevant, !isWrite);
                }
              }
            },

            renderDelete: {
              render: function(option, isBulk, isAdmin, state, isRelevant, isWrite, perms, isOneItemLocked, stateKey) {
                if (isWrite && CStudioAuthoring.Service.isDeleteAllowed(perms)) {
                  var isRelevant = true;
                  var isAdminFlag = isAdmin;

                  if (
                    state.indexOf('Submitted for Delete') >= 0 ||
                    state.indexOf('Scheduled for Delete') >= 0 ||
                    isOneItemLocked
                  ) {
                    isRelevant = false;
                    isAdminFlag = false;
                  }

                  option.onclick = function() {
                    CStudioAuthoring.Operations.deleteContent(CStudioAuthoring.SelectedContent.getSelectedContent());
                  };
                  _this.createNavItem(option, isBulk, isAdminFlag, isRelevant, !isWrite);
                }
              }
            },
            renderVersionHistory: {
              render: function(option, isBulk, isAdmin, state, isRelevant, isWrite) {
                option.onclick = function() {
                  CStudioAuthoring.Operations.viewContentHistory(
                    CStudioAuthoring.SelectedContent.getSelectedContent()[0],
                    isWrite
                  );
                };
                //Making this link false as this feature is not yet completed.
                _this.createNavItem(option, isBulk, isAdmin, true, false);
              }
            },

            renderApproveCommon: {
              render: function(option, isBulk, isAdmin, state, isRelevant, isWrite, perms, isOneItemLocked, stateKey) {
                if (CStudioAuthoring.Service.isPublishAllowed(perms)) {
                  var isRelevant = !isOneItemLocked;
                  var items = CStudioAuthoring.SelectedContent.getSelectedContent();

                  option.onclick = function() {
                    CStudioAuthoring.Operations.approveCommon(
                      CStudioAuthoringContext.site,
                      CStudioAuthoring.SelectedContent.getSelectedContent(),
                      option.name == 'Schedule' ? true : false
                    );
                  };

                  if (isRelevant) {
                    for (var i = 0; i < items.length; i++) {
                      if (items[i].live) {
                        isRelevant = false;
                        break;
                      }
                    }
                  }

                  var renderFlag = true;
                  if (option.name == 'Schedule') {
                    for (var i = 0; i < items.length; i++) {
                      if (items[i].submittedForDeletion == true) {
                        renderFlag = false;
                        break;
                      }
                    }
                  }

                  if (renderFlag == true) {
                    _this.createNavItem(option, isBulk, isAdmin, isRelevant, false);
                  }
                }
              }
            },

            /**
             * render reject option
             */
            renderReject: {
              render: function(option, isBulk, isAdmin, state, isRelevant, isWrite, perms) {
                if (CStudioAuthoring.Service.isPublishAllowed(perms)) {
                  isRelevant = false;
                  if (
                    state.indexOf('Submitted') != -1 ||
                    state.indexOf('Scheduled') != -1 ||
                    state.indexOf('In Workflow') != -1 ||
                    state.indexOf('Deleted') != -1
                  ) {
                    isRelevant = true;
                  }

                  //Check that all selected items are from go-live queue or not
                  /*var content = CStudioAuthoring.SelectedContent.getSelectedContent();
                                if (isRelevant && content && content.length >= 1) {
                                    for (var conIdx=0; conIdx<content.length; conIdx++) {
                                        var auxState = CStudioAuthoring.Utils.getContentItemStatus(content[conIdx]);
                                        if ( (auxState.indexOf("Submitted") != -1 || auxState.indexOf("Scheduled") != -1 || auxState.indexOf("Deleted") != -1) &&
                                            auxState != "Scheduled") {
                                            //Here is special case for sheduled for delted items.
                                            if ((auxState == "Submitted for Delete" || auxState == "Scheduled for Delete") && !content[conIdx].submitted && content[conIdx].scheduled) {
                                                isRelevant = false;
                                                break;
                                            } else {
                                                isRelevant = true;
                                            }
                                        } else {
                                            isRelevant = false;
                                            break;
                                        }
                                    }
                                }*/

                  option.onclick = function() {
                    CStudioAuthoring.Operations.rejectContent(
                      CStudioAuthoringContext.site,
                      CStudioAuthoring.SelectedContent.getSelectedContent()
                    );
                  };
                  _this.createNavItem(option, isBulk, isAdmin, isRelevant, false);
                }
              }
            },
            /**
             * render Dependencies option
             */
            renderViewDependencies: {
              render: function(option, isBulk, isAdmin, state, isRelevant, isWrite, perms, isOneItemLocked, stateKey) {
                isRelevant = true;

                option.onclick = function() {
                  CStudioAuthoring.Operations.viewDependencies(
                    CStudioAuthoringContext.site,
                    CStudioAuthoring.SelectedContent.getSelectedContent(),
                    false
                  );
                };
                _this.createNavItem(option, isBulk, isAdmin, isRelevant, false);
              }
            },
            /**
             * copy paste needs to be dynamic.  if there are items on the clipboard
             * it needs to say paste.  if there are no items on the cliploard it needs to
             * say copy.
             * question: how do you clear the clipboard or see whats on it?  I think we may want this to
             * be a dropdown?
             */
            renderclipboard: {
              render: function(option) {
                option.name = 'Copy';
                _this.createNavItem(option, true, true);
              }
            },
            /**
             * create simple name item
             */
            createNavItem: function(item, isBulk, isAdmin, isRelevant, disableItem) {
              var parentEl = this.containerEl;
              var content = CStudioAuthoring.SelectedContent.getSelectedContent();
              var showItem = !item.isInFlight && ((isAdmin && item.allowAdmin) || (!isAdmin && item.allowAuthor));

              const mimeType = content[0].mimeType;
              if (content[0] && mimeType) {
                const nonEditable =
                  mimeType.match(/\bimage\b/) || mimeType.match(/\bpdf\b/) || mimeType.match(/\bvideo\b/);

                showItem = nonEditable && 'Edit' === item.renderId ? false : showItem;
              }

              if (showItem) {
                /* Do not attach items if links are not relevant */
                if (!isRelevant || (isBulk && !item.allowBulk)) return;

                var linkContainerEl = document.createElement('li'),
                  linkEl = document.createElement('a');

                YDom.addClass(linkContainerEl, 'acn-link');

                if ('Schedule' === item.name) {
                  YDom.addClass(linkEl, 'Schedule');
                } else {
                  YDom.addClass(linkEl, item.renderId);
                }
                linkEl.innerHTML = item.name;
                YDom.addClass(linkEl, 'cursor');
                linkEl.style.cursor = 'pointer';

                if (disableItem == true) {
                  YDom.addClass(linkEl, 'acn-link-disabled');
                  /* not setting onclick either*/
                } else {
                  if (item.onclick) {
                    linkEl.onclick = item.onclick;
                  } else {
                    linkEl.onclick = function() {
                      CStudioAuthoring.Operations.showSimpleDialog(
                        'noEventError-dialog',
                        CStudioAuthoring.Operations.simpleDialogTypeINFO,
                        CMgs.format(contextNavLangBundle, 'notification'),
                        CMgs.format(contextNavLangBundle, 'noEventError'),
                        null, // use default button
                        YAHOO.widget.SimpleDialog.ICON_BLOCK,
                        'studioDialog'
                      );
                    };
                  }
                }

                var dividerEl = document.createElement('div');
                dividerEl.id = 'acn-render';

                parentEl.appendChild(linkContainerEl);
                linkContainerEl.appendChild(linkEl);
              }
            },

            isAllowedEditForSelection: function() {
              var contentItem = CStudioAuthoring.SelectedContent.getSelectedContent()[0];

              // Edits etc are not allowed on asset items.
              if (contentItem.asset) {
                return false;
              }

              return true;
            },

            areSomeSelectedItemsLockedOut: function() {
              var itemLockedOut = false;
              var selectedItems = CStudioAuthoring.SelectedContent.getSelectedContent();
              for (var i = 0; !itemLockedOut && i < selectedItems.length; i++) {
                if (CStudioAuthoring.Utils.isLockedOut(selectedItems[i])) {
                  itemLockedOut = true;
                }
              }

              return itemLockedOut;
            }
          }
        });
      }
    };
  })();

CStudioAuthoring.Module.moduleLoaded('wcm_content', CStudioAuthoring.ContextualNav.WcmActiveContentMod);
