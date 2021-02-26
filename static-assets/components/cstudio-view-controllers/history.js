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
 * File: history.js
 * Component ID: viewcontroller-history
 * @author: Roy Art
 * @date: 03.01.2011
 **/
(function () {
  let History;

  const Dom = YAHOO.util.Dom,
    Event = YAHOO.util.Event,
    TemplateAgent = CStudioAuthoring.Component.TemplateAgent,
    template = CStudioAuthoring.TemplateHolder.History,
    i18n = CrafterCMSNext.i18n,
    formatMessage = i18n.intl.formatMessage,
    words = i18n.messages.words;

  CStudioAuthoring.register('ViewController.History', function () {
    CStudioAuthoring.ViewController.History.superclass.constructor.apply(this, arguments);
  });

  History = CStudioAuthoring.ViewController.History;
  YAHOO.extend(History, CStudioAuthoring.ViewController.Base, {
    events: ['wipeAndRevert', 'view', 'restore', 'compare', 'revert', 'wipeRecent'],

    actions: ['.close-button', '.compare-button'],

    loadHistory: function (selection, isWrite) {
      var _this = this,
        colspan = 5,
        loadFn,
        escaped = selection.escaped;

      _this.selection = selection;
      _this.isWrite = _this.isWrite ? _this.isWrite : isWrite;

      loadFn = function () {
        var tbody = _this.getComponent('table.item-listing tbody');
        tbody.innerHTML =
          '<tr><td colspan="5"><i>' +
          CMgs.format(formsLangBundle, 'historyDialogLoadingWait') +
          '&hellip;</i></td></tr>';

        CStudioAuthoring.Service.getVersionHistory(CStudioAuthoringContext.site, selection, {
          success: function (history) {
            var versions = history.versions,
              isXML = history.item.mimeType === 'application/xml'; // Diff tool support only xml files

            var itemStateEl = _this.getComponent('span.show-for-item');
            Dom.addClass(itemStateEl, CStudioAuthoring.Utils.getIconFWClasses(history.item));
            itemStateEl.innerHTML = CrafterCMSNext.util.string.escapeHTML(history.item.internalName);

            if (versions.length == 0) {
              tbody.innerHTML =
                '<tr><td colspan="5"><i>' +
                CMgs.format(formsLangBundle, 'historyDialogNoVersionsFound') +
                '</i></td></tr>';
            } else {
              tbody.innerHTML = '';

              if (isXML) {
                var actionWrapper = _this.getComponent('.history-view .action-wrapper'),
                  compareButton = document.createElement('input');
                $('#historyCompareBtn').remove();
                compareButton.type = 'button';
                Dom.addClass(compareButton, 'compare-button btn btn-default');
                compareButton.value = CMgs.format(formsLangBundle, 'historyDialogCompare');
                compareButton.setAttribute('disabled', '');
                compareButton.setAttribute('id', 'historyCompareBtn');
                actionWrapper.appendChild(compareButton);

                (function () {
                  Event.addListener(compareButton, 'click', function () {
                    _this.compareButtonActionClicked(history.item.uri);
                  });
                })();
              }

              for (var i = 0; i < versions.length; i++) {
                var version = versions[i],
                  rowEl = document.createElement('tr'),
                  tdEl,
                  col2El,
                  col3El,
                  col4El,
                  col5El,
                  col6El,
                  revertActionEl,
                  checkboxEl,
                  $revertDropdown,
                  // if more than 5 versions, last 5 will have dropup
                  dropdownClass = versions.length > 5 && i > 1 && i + 5 >= versions.length ? 'dropup' : 'dropdown';

                col2El = document.createElement('div');
                Dom.addClass(col2El, 'c8');

                col2El.innerHTML = CStudioAuthoring.Utils.formatDateFromUTC(
                  version.lastModifiedDate,
                  studioTimeZone,
                  'full'
                );

                var versionNumber = new Date(version.lastModifiedDate);
                versionNumber =
                  versionNumber.toLocaleDateString() + 'T' + versionNumber.toLocaleTimeString().replace(' ', '');

                if (isXML) {
                  checkboxEl = document.createElement('input');
                  checkboxEl.maxLength = 300;
                  checkboxEl.type = 'checkbox';
                  checkboxEl.name = 'version';
                  checkboxEl.value = version.versionNumber;
                  checkboxEl.style.marginRight = '5px';
                  col2El.insertBefore(checkboxEl, col2El.firstChild);
                }

                tdEl = document.createElement('td');
                tdEl.appendChild(col2El);
                rowEl.appendChild(tdEl);

                col4El = document.createElement('div');
                Dom.addClass(col4El, 'c4');
                col4El.innerHTML = version.lastModifier;
                tdEl = document.createElement('td');
                tdEl.appendChild(col4El);
                rowEl.appendChild(tdEl);

                col6El = document.createElement('div');
                // Dom.addClass(col6El, "c6");
                col6El.innerHTML = version.comment ? version.comment : '&nbsp;';
                tdEl = document.createElement('td');
                tdEl.appendChild(col6El);
                rowEl.appendChild(tdEl);

                col5El = document.createElement('div');
                col5El.style.whiteSpace = 'nowrap';
                Dom.addClass(col5El, 'c5');
                tdEl = document.createElement('td');
                tdEl.appendChild(col5El);
                rowEl.appendChild(tdEl);

                if (isXML) {
                  var viewActionEl = document.createElement('a');
                  viewActionEl.innerHTML =
                    '<span id="actionView' + version.versionNumber + '" class="action fa fa-eye"></span>';
                  viewActionEl.version = version.versionNumber;
                  viewActionEl.path = selection.uri;
                  col5El.appendChild(viewActionEl);
                  new YAHOO.widget.Tooltip('tooltipView' + viewActionEl.version, {
                    context: 'actionView' + viewActionEl.version,
                    container: _this.tooltipsContainer,
                    text: CMgs.format(formsLangBundle, 'historyDialogViewFileMessage'),
                    zIndex: 104103
                  });

                  var compareActionEl = document.createElement('a');
                  compareActionEl.innerHTML =
                    '<span id="actionCompare' + version.versionNumber + '" class="action fa fa-files-o"></span>';
                  compareActionEl.version = version.versionNumber;
                  compareActionEl.path = selection.uri;
                  col5El.appendChild(compareActionEl);
                  new YAHOO.widget.Tooltip('tooltipCompare' + compareActionEl.version, {
                    context: 'actionCompare' + viewActionEl.version,
                    container: _this.tooltipsContainer,
                    text: CMgs.format(formsLangBundle, 'historyDialogCompareFileMessage'),
                    zIndex: 104103
                  });
                }

                if (_this.isWrite) {
                  $revertDropdown = $(
                    `<div class="${dropdownClass} inline-block relative confirmation-dropdown">
                        <span id="actionRevert${
                          version.versionNumber
                        }" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" class="action fa fa-reply"></span>
                        <ul class="dropdown-menu pull-right" aria-labelledby="actionRevert${version.versionNumber}">
                          <li><a class="cancel" href="#" onclick="return false;">${formatMessage(words.cancel)}</a></li>
                          <li role="separator" class="divider"></li>
                          <li><a class="confirm" href="#">${formatMessage(words.confirm)}</a></li>
                        </ul>
                      </div>`
                  ).appendTo($(col5El));
                  $revertDropdown.data('item', selection);
                  $revertDropdown.data('version', version.versionNumber);

                  new YAHOO.widget.Tooltip('tooltipRevert' + version.versionNumber, {
                    context: 'actionRevert' + version.versionNumber,
                    container: _this.tooltipsContainer,
                    text: CMgs.format(formsLangBundle, 'historyDialogRevertFileMessage'),
                    zIndex: 104103
                  });
                }

                (function (item) {
                  if (_this.isWrite) {
                    $revertDropdown.find('.confirm').on('click', function (e) {
                      e.preventDefault();
                      const $dropdown = $(this).closest('.confirmation-dropdown');

                      CStudioAuthoring.Service.revertContentItem(
                        CStudioAuthoringContext.site,
                        $dropdown.data('item'),
                        $dropdown.data('version'),
                        {
                          success: function () {
                            if (CStudioAuthoringContext.isPreview) {
                              CStudioAuthoring.Operations.refreshPreview();
                            }
                            eventNS.data = item;
                            document.dispatchEvent(eventNS);
                            _this.loadHistory(_this.selection);
                          },
                          failure: function () {
                            var CMgs = CStudioAuthoring.Messages;
                            var langBundle = CMgs.getBundle('forms', CStudioAuthoringContext.lang);
                            CStudioAuthoring.Operations.showSimpleDialog(
                              'revertError-dialog',
                              CStudioAuthoring.Operations.simpleDialogTypeINFO,
                              CMgs.format(langBundle, 'notification'),
                              CMgs.format(langBundle, 'revertError'),
                              null,
                              YAHOO.widget.SimpleDialog.ICON_BLOCK,
                              'studioDialog'
                            );
                          }
                        }
                      );
                    });
                    Event.addListener(revertActionEl, 'click', function () {});
                  }

                  Event.addListener(viewActionEl, 'click', function () {
                    detachEscapeListener();
                    CStudioAuthoring.Operations.openDiff(
                      CStudioAuthoringContext.site,
                      this.path,
                      this.version,
                      this.version,
                      escaped
                    );
                  });

                  Event.addListener(compareActionEl, 'click', function () {
                    detachEscapeListener();
                    CStudioAuthoring.Operations.openDiff(
                      CStudioAuthoringContext.site,
                      this.path,
                      this.version,
                      null,
                      escaped
                    );
                  });

                  Event.addListener(checkboxEl, 'change', function () {
                    _this.validateDiffCheckboxes();
                  });
                })(history.item);

                tbody.appendChild(rowEl);
              }
            }
            //set focus on submit/delete button
            var oSubmitBtn = _this.getComponent(_this.actions[0]);

            if (oSubmitBtn) {
              CStudioAuthoring.Utils.setDefaultFocusOn(oSubmitBtn);
            }
          },
          failure: function () {
            tbody.innerHTML =
              '<tr><td>' +
              CMgs.format(formsLangBundle, 'historyDialogUnable') +
              ' <a class="retry-dependency-load" href="javascript:">' +
              CMgs.format(formsLangBundle, 'historyDialogTryAgain') +
              '</a></td></tr>';
            Event.addListener(_this.getComponent('a.retry-dependency-load'), 'click', loadFn);
          }
        });
      };

      var tooltipsContainer = document.createElement('div');
      YAHOO.util.Dom.addClass(tooltipsContainer, 'tooltips-container');
      document.querySelector('body').appendChild(tooltipsContainer);
      this.tooltipsContainer = tooltipsContainer;

      loadFn();

      function onEscape(e) {
        if (e.keyCode === 27) {
          // esc
          _this.end();
          _this.destroyTooltips();
          $(document).off('keyup', onEscape);
        }
      }

      function attachEscapeListener() {
        $(document).on('keyup', onEscape);
      }

      function detachEscapeListener() {
        $(document).off('keyup', onEscape);
      }

      $('body').on('diff-end', attachEscapeListener);

      attachEscapeListener();
    },

    loadConfigurationHistory: function (selection, isWrite) {
      var _this = this,
        colspan = 5,
        loadFn,
        escaped = selection.escaped;

      _this.selection = selection;
      _this.isWrite = _this.isWrite ? _this.isWrite : isWrite;

      loadFn = function () {
        var tbody = _this.getComponent('table.item-listing tbody');
        tbody.innerHTML =
          '<tr><td colspan="5"><i>' +
          CMgs.format(formsLangBundle, 'historyDialogLoadingWait') +
          '&hellip;</i></td></tr>';

        CStudioAuthoring.Service.getConfigurationVersionHistory(CStudioAuthoringContext.site, selection, {
          success: function (history) {
            var versions = history.versions,
              isAsset = history.item.isAsset;

            var itemStateEl = _this.getComponent('span.show-for-item');
            Dom.addClass(itemStateEl, CStudioAuthoring.Utils.getIconFWClasses(history.item));
            itemStateEl.innerHTML = CrafterCMSNext.util.string.escapeHTML(history.item.internalName);

            if (versions.length == 0) {
              tbody.innerHTML =
                '<tr><td colspan="5"><i>' +
                CMgs.format(formsLangBundle, 'historyDialogNoVersionsFound') +
                '</i></td></tr>';
            } else {
              tbody.innerHTML = '';

              if (!isAsset) {
                var actionWrapper = _this.getComponent('.history-view .action-wrapper'),
                  compareButton = document.createElement('input');
                $('#historyCompareBtn').remove();
                compareButton.type = 'button';
                Dom.addClass(compareButton, 'compare-button btn btn-default');
                compareButton.value = CMgs.format(formsLangBundle, 'historyDialogCompare');
                compareButton.setAttribute('disabled', '');
                compareButton.setAttribute('id', 'historyCompareBtn');
                actionWrapper.appendChild(compareButton);

                (function () {
                  Event.addListener(compareButton, 'click', function () {
                    _this.compareButtonActionClicked(history.item.uri);
                  });
                })();
              }

              for (var i = 0; i < versions.length; i++) {
                var version = versions[i],
                  rowEl = document.createElement('tr'),
                  tdEl,
                  col2El,
                  col3El,
                  col4El,
                  col5El,
                  col6El,
                  revertActionEl,
                  checkboxEl,
                  $revertDropdown,
                  // if more than 5 versions, last 5 will have dropup
                  dropdownClass = versions.length > 5 && i > 1 && i + 5 >= versions.length ? 'dropup' : 'dropdown';

                col2El = document.createElement('div');
                Dom.addClass(col2El, 'c8');

                col2El.innerHTML = CStudioAuthoring.Utils.formatDateFromUTC(
                  version.lastModifiedDate,
                  studioTimeZone,
                  'full'
                );

                var versionNumber = new Date(version.lastModifiedDate);
                versionNumber =
                  versionNumber.toLocaleDateString() + 'T' + versionNumber.toLocaleTimeString().replace(' ', '');

                if (!isAsset) {
                  checkboxEl = document.createElement('input');
                  checkboxEl.maxLength = 300;
                  checkboxEl.type = 'checkbox';
                  checkboxEl.name = 'version';
                  checkboxEl.value = version.versionNumber;
                  checkboxEl.style.marginRight = '5px';
                  col2El.insertBefore(checkboxEl, col2El.firstChild);
                }

                tdEl = document.createElement('td');
                tdEl.appendChild(col2El);
                rowEl.appendChild(tdEl);

                col4El = document.createElement('div');
                Dom.addClass(col4El, 'c4');
                col4El.innerHTML = version.lastModifier;
                tdEl = document.createElement('td');
                tdEl.appendChild(col4El);
                rowEl.appendChild(tdEl);

                col6El = document.createElement('div');
                // Dom.addClass(col6El, "c6");
                col6El.innerHTML = version.comment ? version.comment : '&nbsp;';
                tdEl = document.createElement('td');
                tdEl.appendChild(col6El);
                rowEl.appendChild(tdEl);

                col5El = document.createElement('div');
                col5El.style.whiteSpace = 'nowrap';
                Dom.addClass(col5El, 'c5');
                tdEl = document.createElement('td');
                tdEl.appendChild(col5El);
                rowEl.appendChild(tdEl);

                if (!isAsset) {
                  var viewActionEl = document.createElement('a');
                  viewActionEl.innerHTML =
                    '<span id="actionView' + version.versionNumber + '" class="action fa fa-eye"></span>';
                  viewActionEl.version = version.versionNumber;
                  viewActionEl.path = history.item.uri;
                  col5El.appendChild(viewActionEl);
                  new YAHOO.widget.Tooltip('tooltipView' + viewActionEl.version, {
                    context: 'actionView' + viewActionEl.version,
                    container: _this.tooltipsContainer,
                    text: CMgs.format(formsLangBundle, 'historyDialogViewFileMessage'),
                    zIndex: 104103
                  });

                  var compareActionEl = document.createElement('a');
                  compareActionEl.innerHTML =
                    '<span id="actionCompare' + version.versionNumber + '" class="action fa fa-files-o"></span>';
                  compareActionEl.version = version.versionNumber;
                  compareActionEl.path = history.item.uri;
                  col5El.appendChild(compareActionEl);
                  new YAHOO.widget.Tooltip('tooltipCompare' + compareActionEl.version, {
                    context: 'actionCompare' + viewActionEl.version,
                    container: _this.tooltipsContainer,
                    text: CMgs.format(formsLangBundle, 'historyDialogCompareFileMessage'),
                    zIndex: 104103
                  });
                }

                if (_this.isWrite) {
                  $revertDropdown = $(
                    `<div class="${dropdownClass} inline-block relative confirmation-dropdown">
                        <span id="actionRevert${
                          version.versionNumber
                        }" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" class="action fa fa-reply"></span>
                        <ul class="dropdown-menu pull-right" aria-labelledby="actionRevert${version.versionNumber}">
                          <li><a class="cancel" href="#" onclick="return false;">${formatMessage(words.cancel)}</a></li>
                          <li role="separator" class="divider"></li>
                          <li><a class="confirm" href="#">${formatMessage(words.confirm)}</a></li>
                        </ul>
                      </div>`
                  ).appendTo($(col5El));
                  $revertDropdown.data('item', selection);
                  $revertDropdown.data('version', version.versionNumber);

                  new YAHOO.widget.Tooltip('tooltipRevert' + version.versionNumber, {
                    context: 'actionRevert' + version.versionNumber,
                    container: _this.tooltipsContainer,
                    text: CMgs.format(formsLangBundle, 'historyDialogRevertFileMessage'),
                    zIndex: 104103
                  });
                }

                (function (item) {
                  if (_this.isWrite) {
                    $revertDropdown.find('.confirm').on('click', function (e) {
                      e.preventDefault();
                      const $dropdown = $(this).closest('.confirmation-dropdown');

                      CStudioAuthoring.Service.revertContentItem(
                        CStudioAuthoringContext.site,
                        item,
                        $dropdown.data('version'),
                        {
                          success: function () {
                            if (CStudioAuthoringContext.isPreview) {
                              CStudioAuthoring.Operations.refreshPreview();
                            }
                            eventNS.data = item;
                            document.dispatchEvent(eventNS);

                            _this.loadConfigurationHistory(_this.selection);
                            amplify.publish('HISTORY_REVERT');
                          },
                          failure: function () {
                            var CMgs = CStudioAuthoring.Messages;
                            var langBundle = CMgs.getBundle('forms', CStudioAuthoringContext.lang);
                            CStudioAuthoring.Operations.showSimpleDialog(
                              'revertError-dialog',
                              CStudioAuthoring.Operations.simpleDialogTypeINFO,
                              CMgs.format(langBundle, 'notification'),
                              CMgs.format(langBundle, 'revertError'),
                              null,
                              YAHOO.widget.SimpleDialog.ICON_BLOCK,
                              'studioDialog'
                            );
                          }
                        }
                      );
                    });
                  }

                  Event.addListener(viewActionEl, 'click', function () {
                    detachEscapeListener();
                    CStudioAuthoring.Operations.openDiff(
                      CStudioAuthoringContext.site,
                      history.item.uri,
                      this.version,
                      this.version,
                      escaped
                    );
                  });

                  Event.addListener(compareActionEl, 'click', function () {
                    detachEscapeListener();
                    CStudioAuthoring.Operations.openDiff(
                      CStudioAuthoringContext.site,
                      history.item.uri,
                      this.version,
                      null,
                      escaped
                    );
                  });

                  Event.addListener(checkboxEl, 'change', function () {
                    _this.validateDiffCheckboxes();
                  });
                })(history.item);

                tbody.appendChild(rowEl);
              }
            }
            //set focus on submit/delete button
            var oSubmitBtn = _this.getComponent(_this.actions[0]);

            if (oSubmitBtn) {
              CStudioAuthoring.Utils.setDefaultFocusOn(oSubmitBtn);
            }
          },
          failure: function () {
            tbody.innerHTML =
              '<tr><td>' +
              CMgs.format(formsLangBundle, 'historyDialogUnable') +
              ' <a class="retry-dependency-load" href="javascript:">' +
              CMgs.format(formsLangBundle, 'historyDialogTryAgain') +
              '</a></td></tr>';
            Event.addListener(_this.getComponent('a.retry-dependency-load'), 'click', loadFn);
          }
        });
      };

      var tooltipsContainer = document.createElement('div');
      YAHOO.util.Dom.addClass(tooltipsContainer, 'tooltips-container');
      document.querySelector('body').appendChild(tooltipsContainer);
      this.tooltipsContainer = tooltipsContainer;

      loadFn();

      function onEscape(e) {
        if (e.keyCode === 27) {
          // esc
          _this.end();
          _this.destroyTooltips();
          $(document).off('keyup', onEscape);
        }
      }

      function attachEscapeListener() {
        $(document).on('keyup', onEscape);
      }

      function detachEscapeListener() {
        $(document).off('keyup', onEscape);
      }

      $('body').on('diff-end', attachEscapeListener);

      attachEscapeListener();
    },

    preFormatDate: function (dateTime) {
      var inZulu = new RegExp('Z$').test(dateTime),
        convertedDate = dateTime;
      if (inZulu) {
        var convertedTimezone = new Date(dateTime),
          year = convertedTimezone.getFullYear(),
          month = convertedTimezone.getMonth() + 1,
          day = convertedTimezone.getDate(),
          hours = convertedTimezone.getHours(),
          minutes = convertedTimezone.getMinutes(),
          minutes = minutes < 10 ? '0' + minutes : minutes,
          seconds = convertedTimezone.getSeconds();

        convertedDate = year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':' + seconds;
      }
      return convertedDate;
    },

    validateDiffCheckboxes: function () {
      var tbody = this.getComponent('table.item-listing tbody'),
        selectedCheckboxes = $(tbody).find('input[name="version"]:checked'),
        unselectedCheckboxes = $(tbody).find('input[name="version"]:not(:checked)');

      if (selectedCheckboxes.length >= 2) {
        unselectedCheckboxes.prop('disabled', true);
      } else {
        unselectedCheckboxes.prop('disabled', false);
      }

      if (selectedCheckboxes.length == 2) {
        $('#historyCompareBtn').prop('disabled', false);
      } else {
        $('#historyCompareBtn').prop('disabled', true);
      }
    },

    wipeRecentEdits: function () {
      this.fire('wipeRecent');
    },

    revertToLive: function () {
      this.fire('revert');
    },
    wipeAndRevert: function () {
      this.fire('wipeAndRevert');
    },
    view: function () {
      this.fire('view');
    },
    restore: function () {
      this.fire('restore');
    },
    compare: function () {
      this.fire('compare');
    },
    closeButtonActionClicked: function () {
      this.end();
      this.destroyTooltips();
      $(document).off('keyup');
    },
    // Destroy tooltips to avoid unnecesary markup when dismissing history dialog
    destroyTooltips: function () {
      $('.tooltips-container').remove();
    },
    compareButtonActionClicked: function (itemPath) {
      var tbody = this.getComponent('table.item-listing tbody'),
        selectedCheckboxes = $(tbody).find('input[name="version"]:checked'),
        diffArray = [],
        path = itemPath;

      $.each(selectedCheckboxes, function (index) {
        diffArray[index] = this.value;
      });

      CStudioAuthoring.Operations.openDiff(CStudioAuthoringContext.site, path, diffArray[0], diffArray[1]);
    }
  });

  CStudioAuthoring.Env.ModuleMap.map('viewcontroller-history', History);
})();
