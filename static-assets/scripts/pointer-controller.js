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

/**
 * Created by veronicaestrada on 12/21/15.
 */
crafterDefine(
  'pointer-controller',
  ['crafter', 'jquery', 'jquery-ui', 'animator', 'communicator', 'noty'],
  function (crafter, $, $ui, Animator, Communicator, noty) {
    'use strict';

    var Topics = crafter.studio.preview.Topics,
      string = crafter.String;

    var DROPPABLE_SELECTION = '[data-studio-components-target]';
    var PANEL_ON_BD_CLASS = 'studio-pointer-enabled';

    var $body = $('body:first');
    var $document = $(document);
    var $window = $(window);
    var currentModel = {};

    function pointerController(config) {
      var animator = new Animator(),
        config = config || {},
        communicator = config.communicator,
        active = false,
        me = this,
        timeout;

      this.active = function (value) {
        if (arguments.length) {
          active = !!value;
          active ? $window.resize(onresize) : $window.unbind('resize', onresize);
        }
        return active;
      };

      this.cfg = function (property, value) {
        if (arguments.length > 1) config[property] = value;
        return config[property];
      };

      this.getAnimator = function ($el) {
        $el && animator.$el($el);
        return animator;
      };

      if (communicator) {
        communicator.on(Topics.DND_COMPONENTS_MODEL_LOAD, function (data) {
          currentModel = data;
        });
      }
    }

    pointerController.prototype = {
      start: enablePointer,
      stop: disablePointer,
      done: done
    };

    return pointerController;

    function disablePointer() {
      if (!this.active()) return;
      this.active(false);

      $body.removeClass(PANEL_ON_BD_CLASS);
      $body.css('cursor', 'default');
      $('#divMouse').remove();
      $(DROPPABLE_SELECTION).unbind('click');
    }

    function done() {
      this.stop();
    }

    function enablePointer(components, initialContentModel) {
      var communicator = this.cfg('communicator');

      currentModel = initialContentModel;

      const keyUpHandler = function (e) {
        if (e.keyCode == 27) {
          // esc
          me.done();
          $window.off('keyup', keyUpHandler);
        }
      };

      if (this.active()) return;
      this.active(true);

      var me = this;

      $body.addClass(PANEL_ON_BD_CLASS);
      $body.css('cursor', 'move');

      var divMouse = document.createElement('div');
      divMouse.id = 'divMouse';
      $(divMouse).addClass('studio-div-mouse');
      $(divMouse).html(components.internalName);
      $body.append(divMouse);
      $('#specificcomponents').mouseover();
      $body.mousemove(function (e) {
        $(divMouse).css('left', e.pageX + 4);
        $(divMouse).css('top', e.pageY);
      });
      try {
        $window.keyup(keyUpHandler);
      } catch (e) {
        console.warn && console.warn(e.message);
      }

      $(DROPPABLE_SELECTION).bind('mouseover', function (e) {
        e.stopPropagation();
        $(this).addClass('studio-pointer-over');
      });

      $(DROPPABLE_SELECTION).bind('mouseout', function (e) {
        e.stopPropagation();
        $(this).removeClass('studio-pointer-over');
      });

      function restrictions($dropZone, $component, isZoneEmbedded, DestContentType) {
        var valid = true;

        if (!DestContentType) {
          valid = false;
          publish.call(me, Topics.START_DIALOG, {
            messageKey: 'contentTypeNotFound',
            link: 'https://docs.craftercms.org/en/3.1/developers/in-context-editing.html',
            height: 'auto'
          });
        }

        if (isZoneEmbedded) {
          valid = false;
          publish.call(me, Topics.START_DIALOG, {
            messageKey: 'embeddedComponentsDndNotSupported',
            height: 'auto'
          });
        }

        return valid;
      }

      var cacheValidation = {};

      function validation($dropZone, $component, contentType, zone, componentType, response) {
        var childContent = componentType === 'shared-content' ? 'child-content' : null;
        var key = `${zone}-${componentType}`;

        return new Promise((resolve, reject) => {
          if (cacheValidation[key]) {
            resolve(cacheValidation[key]);
          } else {
            cacheValidation[key] = { supported: false, ds: null };
          }
          var selector;
          response.sections.forEach((section) => {
            var _selector = section.fields.find((item) => item.id === zone);
            if (_selector) selector = _selector;
          });
          var selectorDS = selector.properties.find((item) => item.name === 'itemManager');
          selectorDS.value.split(',').forEach((ds) => {
            var type = response.datasources.find((formDS) => formDS.id === ds).type;
            if (type === componentType || type === childContent)
              cacheValidation[key] = {
                supported: true,
                ds: ds
              };
            return true;
          });
          resolve(cacheValidation[key]);
        });
      }

      $(DROPPABLE_SELECTION).bind('click', function (e) {
        e.stopPropagation();
        var $dropZone = $(this),
          $component = components,
          compPath = $component.uri,
          zonePath = $dropZone
            .parents('[data-studio-component-path="' + compPath + '"]')
            .attr('data-studio-component-path'),
          compPathChild = $dropZone
            .children('[data-studio-component-path="' + compPath + '"]')
            .attr('data-studio-component-path'),
          isZoneEmbedded = $dropZone.parent().attr('data-studio-embedded-item-id') || false,
          DestContentType = $dropZone.attr('data-studio-zone-content-type') || null;

        var destContentType = $dropZone.attr('data-studio-zone-content-type') || null;
        var componentType = 'shared-content';
        var zone = $dropZone.attr('data-studio-components-target') || null;

        if (compPath != zonePath && compPathChild != compPath) {
          if (restrictions($dropZone, $component, isZoneEmbedded, DestContentType)) {
            var callback = function (response) {
              validation($dropZone, $component, destContentType, zone, componentType, response).then((response) => {
                if (response.supported) {
                  componentDropped.call(me, $dropZone, $component, response.ds);
                } else {
                  publish.call(me, Topics.START_DIALOG, {
                    messageKey: 'componentNotWelcomeWithinDropZone',
                    height: 'auto'
                  });
                }
              });
              communicator.unsubscribe(Topics.REQUEST_FORM_DEFINITION_RESPONSE, callback);
            };
            communicator.on(Topics.REQUEST_FORM_DEFINITION_RESPONSE, callback);
            publish.call(me, Topics.REQUEST_FORM_DEFINITION, { contentType: destContentType });
          }
        } else {
          me.done();
          $window.off('keyup', keyUpHandler);
          publish.call(me, Topics.START_DIALOG, {
            message: 'The component cannot be added, it is already in the drop-zone.',
            height: '248px'
          });
        }
      });

      $.notify.addStyle('studio-notify', {
        html: '<div><span data-notify-text/></div>',
        classes: {
          base: {
            'white-space': 'nowrap'
          }
        }
      });
      $.notify('Item will be attached by clicking on zone. \n Click Esc to exit event', {
        autoHideDelay: 6000,
        style: 'studio-notify'
      });

      $window.focus();
    }

    function componentDropped($dropZone, $component, datasource) {
      var compPath = $dropZone.parents('[data-studio-component-path]').attr('data-studio-component-path');
      var compTracking = $dropZone.parents('[data-studio-component-path]').attr('data-studio-tracking-number');
      var objectId = $dropZone.attr('data-studio-components-objectid');
      var dropName = $dropZone.attr('data-studio-components-target');
      var trackingZone = $dropZone.attr('data-studio-zone-tracking');
      var index = 0,
        currentTag = '',
        zone;

      var me = this,
        isNew = 'existing',
        tracking,
        path,
        type,
        name,
        zones = {};

      tracking = crafter.guid();
      path = $component.uri;
      type = $component.contentType;
      name = $component.internalName;

      $dropZone.append(
        string(
          '<div data-studio-component="%@" data-studio-component-path="%@" data-studio-tracking-number="%@">%@</div>'
        ).fmt(type, path, tracking, name)
      );

      // DOM Reorganization hasn't happened at this point,
      // need a timeout to grab out the updated DOM structure
      var conRepeat = 0;
      setTimeout(function () {
        $('[data-studio-components-target]').each(function () {
          zone = $(this).attr('data-studio-components-target');
          if (currentTag !== zone) {
            index = 0;
            currentTag = zone;
          }
          if (
            objectId == $(this).attr('data-studio-components-objectid') &&
            trackingZone == $(this).attr('data-studio-zone-tracking')
          ) {
            if (dropName == $(this).attr('data-studio-components-target')) {
              conRepeat++;
            }
            if (compTracking == $(this).parents('[data-studio-component-path]').attr('data-studio-tracking-number')) {
              var $el = $(this),
                zoneName = $el.attr('data-studio-components-target');
              zones[zoneName] = [];
              $el.find('> [data-studio-component]').each(function (i, el) {
                var $comp = $(this);
                zones[zoneName].push($comp.data('model') || tracking);
              });
            }
            if (zone.indexOf('.') > 0) {
              if (currentTag !== zone) {
                index = 0;
                currentTag = zone;
              }
              var structure1 = zone.split('.')[0],
                structure2 = zone.split('.')[1];
              currentModel[structure1][index][structure2] = zones[zone];
              zones[structure1] = currentModel[structure1];
            }
          }
          index++;
        });

        publish.call(me, Topics.COMPONENT_DROPPED, {
          path: path,
          type: type,
          isNew: isNew,
          zones: zones,
          trackingNumber: tracking,
          compPath: compPath,
          conComp: conRepeat > 1 ? true : false,
          datasource: datasource
        });
      });
    }

    function publish(topic, message, com) {
      if ((com = this.cfg('communicator'))) {
        com.publish(topic, message);
      }
    }
  }
);
