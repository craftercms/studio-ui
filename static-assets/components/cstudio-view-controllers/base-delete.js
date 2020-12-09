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
 * File: schedule-for-delete.js
 * Component ID: viewcontroller-basedelete
 * @author: Roy Art
 * @date: 05.01.2011
 **/
(function () {
  var BaseDelete,
    Event = YAHOO.util.Event,
    Dom = YAHOO.util.Dom,
    isValidateCommentOn = null,
    eachfn = CStudioAuthoring.Utils.each;

  CStudioAuthoring.register('ViewController.BaseDelete', function () {
    CStudioAuthoring.ViewController.BaseDelete.superclass.constructor.apply(this, arguments);
  });

  BaseDelete = CStudioAuthoring.ViewController.BaseDelete;
  YAHOO.extend(BaseDelete, CStudioAuthoring.ViewController.Base, {
    actions: ['.cancel'],
    events: ['submitComplete', 'submitStart', 'submitEnd', 'itemRender'],
    startup: ['fetchPublishingSettings', 'translateUI', 'extend'],
    extend: function () {
      this.events = this.events.concat(this.constructor.superclass.events);
      this.actions = this.actions.concat(this.constructor.superclass.actions);
    },

    translateUI: function () {
      const i18n = CrafterCMSNext.i18n,
        formatMessage = i18n.intl.formatMessage,
        messages = i18n.messages.deleteDialogMessages;

      // Translate the whole UI via the codebase next utility
      i18n.translateElements(this.getComponents('[data-i18n]'), messages, {
        warning: (content) => {
          return `<em>${content.toUpperCase()}</em>`;
        }
      });
    },
    loadDependencies: function (selection) {
      var _this = this;
      _this.renderItems(selection);
      $(document).on('keyup', function (e) {
        if (e.keyCode === 10 || e.keyCode === 13) {
          // enter
          $('#deleteBtn').click();
        }

        if (e.keyCode === 27) {
          // esc
          _this.end();
          $(document).off('keyup');
        }
      });
    },
    initCheckRules: function () {
      Event.addListener(
        this.getComponent('table.item-listing'),
        'click',
        function (e) {
          var el = e.target,
            tag = el.tagName.toLowerCase();
          if (tag == 'input') {
            var parentid = el.getAttribute('parentid'),
              isParent = !parentid;
            if (isParent && el.checked) {
              eachfn(
                this.getComponents('input[parentid="' + el.id + '"]'),
                function (i, input) {
                  if (!input.disabled) {
                    input.checked = true;
                  }
                },
                this
              );
            } else if (el.checked) {
              var checks = this.getComponents('input[type=checkbox].item-check');
              eachfn(
                checks,
                function (i, check) {
                  var parsedJson = JSON.parse(decodeURIComponent(check.getAttribute('json')));
                  if (parsedJson.parentPath && parsedJson.parentPath != '') {
                    var parentPath = parsedJson.parentPath;
                    var parentElNode = this.getComponents('input[id="' + parentPath + '"]');
                    if (parentElNode && parentElNode.length == 1 && parentElNode[0] == el) {
                      check.checked = true;
                    }
                  }
                },
                this
              );
            } else if (!el.checked) {
              var parsedJson = JSON.parse(decodeURIComponent(el.getAttribute('json')));
              if (parsedJson.parentPath && parsedJson.parentPath != '') {
                var parentPath = parsedJson.parentPath;
                var parentElNode = this.getComponents('input[id="' + parentPath + '"]');
                if (parentElNode && parentElNode.length == 1 && parentElNode[0].checked) {
                  el.checked = true;
                }
              }
            }
            this.updateSubmitButton();
          }
        },
        null,
        this
      );
    },
    fetchPublishingSettings: function () {
      var me = this;
      CStudioAuthoring.Service.getConfiguration(CStudioAuthoringContext.site, '/site-config.xml', {
        success: function (config) {
          var publishing = config['publishing'];
          isValidateCommentOn =
            publishing && publishing['comments']
              ? (publishing['comments']['required'] === 'true' &&
                  publishing['comments']['delete-required'] !== 'false') ||
                publishing['comments']['delete-required'] === 'true'
                ? true
                : false
              : false;
          if (isValidateCommentOn) {
            me.getComponent('.delete-submission-label').append(' (*)');
          }
          me.initValidation();
        }
      });
    },

    deleteValidation: function () {
      if (this.result && this.result.length > 0) {
        this.$('.items-feedback').hide();
        if (
          (isValidateCommentOn && this.getComponent('.delete-submission-comment').value !== '') ||
          !isValidateCommentOn
        ) {
          this.$('#deleteBtn').prop('disabled', false);
        } else {
          this.$('#deleteBtn').prop('disabled', true);
        }
      } else {
        this.$('.items-feedback').show();
        this.$('#deleteBtn').prop('disabled', true);
      }
    },

    initValidation: function () {
      var self = this,
        submissionCommentVal = this.getComponent('.submissionCommentVal');
      this.deleteValidation();
      this.$('.delete-submission-comment').focusout(function () {
        if (isValidateCommentOn && $(this).get(0).value === '') {
          submissionCommentVal.classList.remove('hide');
        } else {
          submissionCommentVal.classList.contains('hide') === false ? submissionCommentVal.classList.add('hide') : null;
        }
        self.deleteValidation();
      });
    },

    updateSubmitButton: function () {
      var checks = this.getComponents('input[type=checkbox].item-check'),
        someChecked = false;
      eachfn(checks, function (i, check) {
        if (check.checked && !check.disabled) {
          someChecked = true;
          return false;
        }
      });
      if (someChecked) {
        this.enableActions(this.actions[0]);
      } else {
        this.disableActions(this.actions[0]);
      }
    },

    cancelActionClicked: function (btn, evt) {
      this.end();
      $(document).off('keyup');
    }
  });

  CStudioAuthoring.Env.ModuleMap.map('viewcontroller-basedelete', BaseDelete);
})();
