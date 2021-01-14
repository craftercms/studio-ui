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

if (!$.prototype.timezones) {
  CStudioAuthoring.Utils.addJavascript('/static-assets/jquery/timezones/timezones.full.js');
}

/**
 * Preview Tools
 */
CStudioAuthoring.ContextualNav.TargetingMod = {
  initialized: false,
  formatMessage: CrafterCMSNext.i18n.intl.formatMessage,
  messages: CrafterCMSNext.i18n.messages.targetingDialog,
  words: CrafterCMSNext.i18n.messages.words,

  /**
   * initialize module
   */
  initialize: function(config) {
    this.definePlugin();
    CStudioAuthoring.ContextualNav.TargetingNav.init();
  },

  definePlugin: function() {
    var YDom = YAHOO.util.Dom,
      YEvent = YAHOO.util.Event;
    /**
     * WCM preview tools Contextual Nav Widget
     */
    CStudioAuthoring.register({
      'ContextualNav.TargetingNav': {
        init: function() {
          if (CStudioAuthoringContext.isPreview == true) {
            this.render();
          }
          this.model = {};
        },

        bindEvents: function() {
          var me = this;

          $(document).on('keyup', function(e) {
            if (e.keyCode == 10 || e.keyCode == 13) {
              // enter
              var reportContainerEl = document.getElementById('cstudioPreviewTargetingOverlay');
              me.updateTargeting(reportContainerEl);
              $(document).off('keyup');
            }

            if (e.keyCode === 27) {
              // esc
              var reportContainerEl = document.getElementById('cstudioPreviewTargetingOverlay');
              me.closeDialog(reportContainerEl);
              $(document).off('keyup');
            }
          });
        },

        render: function() {
          var me = this,
            el,
            containerEl,
            iconEl,
            ptoOn;

          var CMgs = CStudioAuthoring.Messages;
          var previewLangBundle = CMgs.getBundle('targeting', CStudioAuthoringContext.lang);

          el = YDom.get('acn-persona');
          containerEl = document.createElement('div');
          containerEl.id = 'acn-persona-container';
          YDom.addClass(containerEl, 'nav-link nav-container');

          iconEl = document.createElement('span');
          iconEl.id = 'acn-persona-image';
          YDom.addClass(iconEl, 'nav-icon fa fa-bullseye');
          $(iconEl).attr('data-title', 'targeting');

          containerEl.appendChild(iconEl);
          el.appendChild(containerEl);

          el.onclick = function() {
            var targetingDialog = $('#cstudioPreviewTargetingOverlay')[0];

            if (targetingDialog) {
              me.closeDialog(targetingDialog);
            } else {
              me.getTargeting();
            }
          };
        },

        getTargeting: function() {
          var CMgs = CStudioAuthoring.Messages;
          var previewLangBundle = CMgs.getBundle('targeting', CStudioAuthoringContext.lang);

          var reportContainerEl = document.getElementById('cstudioPreviewTargetingOverlay'),
            me = this,
            model = this.model;

          if (reportContainerEl) {
            document.body.removeChild(reportContainerEl);
          }

          var reportContainerEl = document.createElement('div');
          reportContainerEl.id = 'cstudioPreviewTargetingOverlay';
          YAHOO.util.Dom.addClass(reportContainerEl, 'cstudio-targeting-overlay row yui-skin-cstudioTheme');

          reportContainerEl.style.position = 'fixed';
          reportContainerEl.style.width = '800px';
          reportContainerEl.style.height = 'auto';
          reportContainerEl.style.minHeight = '300px';
          reportContainerEl.style.maxHeight = '565px';
          reportContainerEl.style.top = '96px';
          reportContainerEl.style.padding = '15px 15px 50px 15px';

          var x = window.innerWidth / 2 - reportContainerEl.offsetWidth / 2 - 400;
          reportContainerEl.style.left = x + 'px';

          document.body.appendChild(reportContainerEl);

          var markup =
            "<div class='col-md-12'><h3 class='modal-title bold'>" +
            CMgs.format(previewLangBundle, 'targeting') +
            '</h3></div>' +
            "<div class='col-md-2 tac'><span class='fa fa-bullseye' style='font-size: 110px; color: #000; margin-top: 15px;'></span></div>";

          reportContainerEl.innerHTML = markup;

          var targetingContainerEl = document.createElement('div');
          targetingContainerEl.id = 'targeting-container';
          YAHOO.util.Dom.addClass(targetingContainerEl, 'col-md-10 targeting-container');
          targetingContainerEl.style.cssText = 'overflow-y: scroll; max-height: 467px;';
          targetingContainerEl.innerHTML = "<h3 class='bold'>" + CMgs.format(previewLangBundle, 'userProps') + '</h2>';

          reportContainerEl.appendChild(targetingContainerEl);

          CStudioAuthoring.Service.lookupConfigurtion(CStudioAuthoringContext.site, '/targeting/targeting-config.xml', {
            success: function(config) {
              var properties = config.property,
                currentProp,
                controlContainer;

              me.initModel(properties, {
                //update model and properties with current profile
                success: function(properties) {
                  //Create and append the options
                  for (var i = 0; i < properties.length; i++) {
                    currentProp = properties[i];

                    controlContainer = document.createElement('div');
                    YAHOO.util.Dom.addClass(controlContainer, 'control-container clearfix');
                    controlContainer.style.marginBottom = '15px';
                    targetingContainerEl.appendChild(controlContainer);

                    var labelSpan = document.createElement('span');
                    YAHOO.util.Dom.addClass(labelSpan, 'control-label bold');
                    labelSpan.style.cssText = 'min-width: 80px; display: inline-block; margin-right: 20px;';
                    labelSpan.textContent = currentProp.label;
                    targetingContainerEl.appendChild(controlContainer);
                    controlContainer.appendChild(labelSpan);

                    // <!-- valid types: dropdown, checkboxes, input -->

                    switch (currentProp.type) {
                      case 'dropdown':
                        YAHOO.util.Dom.addClass(controlContainer, 'dropdown');

                        var selectList = document.createElement('select');
                        selectList.id = currentProp.name;
                        selectList.style.width = '30%';
                        controlContainer.appendChild(selectList);

                        for (var j = 0; j < currentProp.possible_values.value.length; j++) {
                          var option = document.createElement('option');
                          option.value = currentProp.possible_values.value[j];
                          option.text = currentProp.possible_values.value[j];
                          if (currentProp.default_value == option.value) {
                            option.selected = 'selected';
                          }
                          selectList.appendChild(option);
                        }

                        break;
                      case 'checkboxes':
                        YAHOO.util.Dom.addClass(controlContainer, 'checkboxes clearfix');
                        labelSpan.style.float = 'left';

                        var checkBoxGroupContainer = document.createElement('div');
                        YAHOO.util.Dom.addClass(checkBoxGroupContainer, 'checkbox-group');
                        checkBoxGroupContainer.id = currentProp.name;
                        checkBoxGroupContainer.style.cssText =
                          'float: left; max-width: calc(100% - 100px); width: 100%;';
                        controlContainer.appendChild(checkBoxGroupContainer);

                        var checkboxSelectAll = document.createElement('span'),
                          checkbox;
                        YAHOO.util.Dom.addClass(checkboxSelectAll, 'checkbox select-all mt0');
                        checkboxSelectAll.innerHTML =
                          "<label for='" +
                          currentProp.name +
                          "-all'>" +
                          "	<input type='checkbox' id='" +
                          currentProp.name +
                          "-all' class='select-all'>" +
                          '	<span>Select All</span>' +
                          '</label>';
                        checkBoxGroupContainer.appendChild(checkboxSelectAll);

                        var defVals = currentProp.default_value.split(','),
                          checked;

                        for (var j = 0; j < currentProp.possible_values.value.length; j++) {
                          checked = defVals.indexOf(currentProp.possible_values.value[j]) != -1 ? 'checked' : '';

                          checkbox = document.createElement('span');
                          YAHOO.util.Dom.addClass(checkboxSelectAll, 'checkbox');
                          checkbox.innerHTML =
                            "<label style='width: 50%;' for='" +
                            currentProp.name +
                            '-' +
                            currentProp.possible_values.value[j] +
                            "'>" +
                            '	<input  ' +
                            checked +
                            " type='checkbox' data-value='" +
                            currentProp.possible_values.value[j] +
                            "' id='" +
                            currentProp.name +
                            '-' +
                            currentProp.possible_values.value[j] +
                            "'>" +
                            '	<span>' +
                            currentProp.possible_values.value[j] +
                            '</span>' +
                            '</label>';
                          checkBoxGroupContainer.appendChild(checkbox);
                        }

                        checkboxSelectAll.onclick = function() {
                          var checkAll = $(this)
                            .find("input[type='checkbox']")
                            .is(':checked');
                          var checkboxes = $(this.parentElement).find('input[type="checkbox"]:not(".select-all")');

                          $.each(checkboxes, function(i, el) {
                            el.checked = checkAll;
                          });
                        };

                        break;
                      case 'input':
                        YAHOO.util.Dom.addClass(controlContainer, 'input');

                        var input = document.createElement('input');
                        input.id = currentProp.name;
                        input.value = currentProp.default_value;
                        input.style.width = '30%';
                        controlContainer.appendChild(input);

                        break;
                      case 'datetime':
                        me.dateTimeInit(controlContainer, currentProp);

                        break;
                    }

                    var description = document.createElement('span');
                    YAHOO.util.Dom.addClass(description, 'description');
                    description.textContent = currentProp.description;

                    description.style.cssText =
                      'color: #999999; display: block; margin-left: 100px; text-align: justify; margin-top: 5px;';
                    controlContainer.appendChild(description);

                    var hint = document.createElement('span');
                    YAHOO.util.Dom.addClass(hint, 'hint');
                    hint.textContent = currentProp.hint;
                    hint.style.cssText = 'color: #999999; margin-left: 100px; text-align: justify; margin-top: 5px;';
                    controlContainer.appendChild(hint);
                  }
                }
              });
            }
          });

          var actionButtonsContainer = document.createElement('div');
          actionButtonsContainer.style.cssText =
            'position: absolute; bottom: 15px; right: 15px; left: 15px; display: flex; place-content: center space-between';
          YAHOO.util.Dom.addClass(actionButtonsContainer, 'action-buttons');

          const targetingMod = CStudioAuthoring.ContextualNav.TargetingMod;

          var clearBtn = document.createElement('a');
          YAHOO.util.Dom.addClass(clearBtn, 'btn btn-primary mr10');
          clearBtn.style.marginRight = 'auto';
          clearBtn.innerHTML = targetingMod.formatMessage(targetingMod.messages.defaults);
          clearBtn.onclick = function() {
            CStudioAuthoring.Service.lookupConfigurtion(
              CStudioAuthoringContext.site,
              '/targeting/targeting-config.xml',
              {
                success: function(config) {
                  var properties = Array.isArray(config.property) ? config.property : [config.property],
                    currentProp,
                    controlEl;

                  for (var j = 0; j < properties.length; j++) {
                    currentProp = properties[j];
                    controlEl = document.getElementById(currentProp.name);

                    switch (currentProp.type) {
                      case 'dropdown':
                        for (var x = 0; x < controlEl.options.length; x++) {
                          if (controlEl.options[x].value == currentProp.default_value) {
                            controlEl.options[x].selected = 'selected';
                          }
                        }

                        break;
                      case 'checkboxes':
                        var $checkboxes = $(controlEl).find("input[type='checkbox']:not('.select-all')");
                        $checkboxes.attr('checked', false);

                        var defVals = currentProp.default_value.split(','),
                          checked;

                        for (var y = 0; y < defVals.length; y++) {
                          var val = controlEl.id + '-' + defVals[y];
                          $('#' + val).prop('checked', true);
                        }

                        break;
                      case 'input':
                        controlEl.value = currentProp.default_value;
                        break;
                      case 'datetime':
                        var $controlEl = $(controlEl),
                          $dateTimePicker = $controlEl.find('.date-picker'),
                          $timeZonePicker = $controlEl.siblings('.timezone-container').find('.zone-picker');

                        if (currentProp.default_value === '') {
                          $dateTimePicker.val(currentProp.default_value);
                        } else {
                          $dateTimePicker.datetimepicker({
                            value: new Date(currentProp.default_value)
                          });
                        }

                        break;
                    }
                  }
                }
              }
            );
          };

          var applyBtn = document.createElement('a');
          YAHOO.util.Dom.addClass(applyBtn, 'btn btn-primary');
          applyBtn.innerHTML = CMgs.format(previewLangBundle, 'apply');
          applyBtn.onclick = function() {
            me.updateTargeting(reportContainerEl);
          };

          var separatorDiv = document.createElement('div');

          this.bindEvents();

          var cancelBtn = document.createElement('a');
          YAHOO.util.Dom.addClass(cancelBtn, 'btn btn-default mr10');
          cancelBtn.innerHTML = CMgs.format(previewLangBundle, 'cancel');
          cancelBtn.onclick = function() {
            me.closeDialog(reportContainerEl);
            $(document).off('keyup');
          };

          actionButtonsContainer.appendChild(clearBtn);
          separatorDiv.appendChild(cancelBtn);
          separatorDiv.appendChild(applyBtn);
          actionButtonsContainer.appendChild(separatorDiv);

          reportContainerEl.appendChild(actionButtonsContainer);
        },

        // update model from current form and save on profile
        updateTargeting: function(reportContainerEl) {
          this.updateModel();

          var serviceUri = '/api/1/profile/set?',
            value,
            key;

          for (var property in this.model) {
            if (this.model.hasOwnProperty(property)) {
              value = this.model[property];
              key = property;

              if (value || value === '') {
                // include empty strings to support empty values
                serviceUri += key + '=' + value + '&';
              }
            }
          }

          serviceUri += 'nocache=' + new Date();

          YConnect.asyncRequest('GET', CStudioAuthoring.Service.createEngineServiceUri(encodeURI(serviceUri)), {
            success: function() {
              document.body.removeChild(reportContainerEl);

              if (CStudioAuthoringContext.isPreview) {
                CStudioAuthoring.Operations.refreshPreview();
              }
            }
          });
        },

        closeDialog: function(reportContainerEl) {
          document.body.removeChild(reportContainerEl);
        },

        // model created from xml config file and currentProfile
        initModel: function(properties, callback) {
          var me = this,
            properties = properties;

          if (!properties.forEach) {
            //if only 1 item - returns item, not in array
            properties = [properties];
          }

          //properties from xml
          properties.forEach(function(item) {
            me.model[item.name] = item.default_value ? item.default_value : '';
          });

          //properties from profile
          var serviceUri = '/api/1/profile/get?time=' + new Date();
          YConnect.asyncRequest('GET', CStudioAuthoring.Service.createEngineServiceUri(serviceUri), {
            success: function(oResponse) {
              var json = oResponse.responseText,
                currentProfile = eval('(' + json + ')');

              for (var property in currentProfile) {
                if (currentProfile.hasOwnProperty(property)) {
                  me.model[property] = currentProfile[property];
                }

                for (var x = 0; x < properties.length; x++) {
                  if (properties[x].name == property) {
                    properties[x].default_value = currentProfile[property];
                  }
                }
              }

              callback.success(properties);
            }
          });
        },

        // get model from current form
        updateModel: function() {
          var me = this,
            test = $('#targeting-container .control-container'),
            key,
            value;

          $.each(test, function(index, element) {
            if ($(element).hasClass('dropdown')) {
              key = $(element)
                .find('select')
                .attr('id');
              value = $(element)
                .find('select option:selected')
                .text();
            } else if ($(element).hasClass('checkboxes')) {
              key = $(element)
                .find('.checkbox-group')
                .attr('id');
              value = [];
              var checkedElements = $(element).find(
                '.checkbox-group input[type="checkbox"]:not(".select-all"):checked'
              );

              $.each(checkedElements, function(i, el) {
                value.push($(el).attr('data-value'));
              });
            } else if ($(element).hasClass('input')) {
              key = $(element)
                .find('input')
                .attr('id');
              value = $(element)
                .find('input')
                .val();
            } else if ($(element).hasClass('datetime')) {
              key = $(element)
                .find('.date-container')
                .attr('id');

              const timezone = $('.zone-picker option:selected').val(),
                valueDate = $(element)
                  .find('.date-picker')
                  .val(),
                pickerDate =
                  valueDate === ''
                    ? ''
                    : moment.tz(
                        $(element)
                          .find('.date-picker')
                          .val(),
                        'YYYY-MM-DD HH:mm A',
                        timezone
                      );

              value = pickerDate === '' ? '' : pickerDate.toISOString();
              me.model[`${key}_tz`] = encodeURIComponent(timezone);
            }
            me.model[key] = value;
          });
        },

        dateTimeInit: function(controlContainer, currentProp) {
          const targetingMod = CStudioAuthoring.ContextualNav.TargetingMod;

          $(controlContainer).addClass('datetime');

          let $dateContainer = $('<div class="date-container clearfix" id="' + currentProp.name + '"/>').appendTo(
              controlContainer
            ),
            $timeZoneContainer = $('<div class="timezone-container clearfix"/>').appendTo(controlContainer),
            $dateTimeEl = $(
              '<input readonly class="date-picker mr10" name="' + currentProp.name + '-control" type="datetime" />'
            ).appendTo($dateContainer),
            $timeZonePicker = $(
              '<select class="zone-picker" data-dateRef="' + currentProp.name + '"></select>'
            ).appendTo($timeZoneContainer),
            $setNowLink = $(
              '<a href="#">' + targetingMod.formatMessage(targetingMod.messages.setNow) + '</a>'
            ).appendTo($dateContainer),
            $setClearLink = $(
              '<a href="#" class="ml10">' + targetingMod.formatMessage(targetingMod.words.clear) + '</a>'
            ).appendTo($dateContainer),
            timeZone = this.model[`${currentProp.name}_tz`],
            dateObj,
            dateValue = new Date(currentProp.default_value);

          $timeZonePicker.timezones();

          if (timeZone) {
            timeZone = decodeURIComponent(timeZone);
            $timeZonePicker.val(timeZone);
            dateObj = moment.tz(currentProp.default_value, timeZone);
            dateValue = new Date(moment(dateObj).format('YYYY-MM-DDTHH:mm:ss'));
          }

          $dateTimeEl.datetimepicker({
            format: 'Y/m/d h:i a',
            dateFormat: 'Y/m/d',
            formatTime: 'h:i a',
            step: 15
          });

          if (currentProp.default_value && currentProp.default_value !== '') {
            $dateTimeEl.datetimepicker({
              value: dateValue
            });
          } else {
            $dateTimeEl.val('');
          }

          $setNowLink.on('click', function(e) {
            e.preventDefault();
            $dateTimeEl.datetimepicker({
              value: new Date()
            });
          });

          $setClearLink.on('click', function(e) {
            e.preventDefault();
            $dateTimeEl.val('');
          });
        }
      }
    });
  }
};

CStudioAuthoring.Module.moduleLoaded('targeting', CStudioAuthoring.ContextualNav.TargetingMod);
