/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
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
define('pointer-controller', ['crafter', 'jquery', 'jquery-ui', 'animator', 'communicator', 'noty'], function (crafter, $, $ui, Animator, Communicator, Noty) {
    'use strict';

    var Topics = crafter.studio.preview.Topics,
        string = crafter.String;

    var DROPPABLE_SELECTION = '[data-studio-components-target]';
    var PANEL_ON_BD_CLASS = 'studio-pointer-enabled';

    var $body       = $('body:first');
    var $document   = $(document);
    var $window     = $(window);
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
                (active = !!value);
                (active) ? $window.resize(onresize) : $window.unbind('resize', onresize);
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
        $body.css('cursor','default');
        $('#divMouse').remove();
        $(DROPPABLE_SELECTION).unbind("click");
    }

    function done() {
        this.stop();
    }

    function enablePointer(components, initialContentModel) {

        currentModel = initialContentModel;

        if (this.active()) return;
        this.active(true);

        var me = this;

        $body.addClass(PANEL_ON_BD_CLASS);
        $body.css('cursor','move');

        var divMouse = document.createElement("div");
        divMouse.id="divMouse";
        $(divMouse).addClass('studio-div-mouse');
        $(divMouse).html(components.internalName);
        $body.append(divMouse);
        $("#specificcomponents").mouseover();
        $body.mousemove(function(e){
            $(divMouse).css('left',e.pageX + 4 );
            $(divMouse).css('top',e.pageY );
        });
        $(window.parent.document).keyup(function(e) {
            var _self = this;
            if (e.keyCode == 27){ // esc
                me.done();
                _self.css( 'cursor', 'pointer' );
            }
        });

        $(DROPPABLE_SELECTION).bind("mouseover", function(e) {
            e.stopPropagation();
            $(this).addClass('studio-pointer-over');
        });

        $(DROPPABLE_SELECTION).bind("mouseout", function(e) {
            e.stopPropagation();
            $(this).removeClass('studio-pointer-over');
        });

        $(DROPPABLE_SELECTION).bind("click", function(e) {
            e.stopPropagation();
            var $dropZone = $(this),
                $component = components,
                compPath = $component.uri,
                zonePath = $dropZone.parents('[data-studio-component-path="' + compPath + '"]').attr('data-studio-component-path'),
                compPathChild = $dropZone.children('[data-studio-component-path="' + compPath + '"]').attr('data-studio-component-path');
            if (compPath != zonePath && compPathChild != compPath ) {
                componentDropped.call(me, $dropZone, $component);
            } else {
                me.done();
                publish.call(me, Topics.START_DIALOG, {
                    message: 'The component cannot be added, it is already in the drop-zone.',
                    height: '208px'
                });
                //return;
            }
        });

        //$.notify("Please click specific zone to attach the item. \n Click Esc to finish the event", {autoHide: false, autoHideDelay: 6000, className: 'studio-notify'});
        $.notify.addStyle('studio-notify', {
            html: "<div><span data-notify-text/></div>",
            classes: {
                base: {
                    "white-space": "nowrap"
                }
            }
        });
        $.notify("Item will be attached by clicking on zone. \n Click Esc to exit event",
            {autoHideDelay: 6000, style: 'studio-notify'});
    }

    function componentDropped($dropZone, $component) {

        var compPath = $dropZone.parents('[data-studio-component-path]').attr('data-studio-component-path');
        var compTracking = $dropZone.parents('[data-studio-component-path]').attr('data-studio-tracking-number');
        var objectId = $dropZone.attr('data-studio-components-objectid');
        var dropName = $dropZone.attr('data-studio-components-target');
        var trackingZone = $dropZone.attr('data-studio-zone-tracking');
        var index = 0, currentTag = "", zone;

        var me = this,
            isNew = "existing",
            tracking, path, type, name, zones = {};

        tracking = crafter.guid();
        path = $component.uri;
        type = $component.contentType;
        name = $component.internalName;

        $dropZone.append(
            string('<div data-studio-component="%@" data-studio-component-path="%@" data-studio-tracking-number="%@">%@</div>')
                .fmt(type, path, tracking, name));

        // DOM Reorganization hasn't happened at this point,
        // need a timeout to grab out the updated DOM structure
        var conRepeat = 0;
        setTimeout(function () {

            $('[data-studio-components-target]').each(function () {
                zone = $(this).attr("data-studio-components-target");
                if(currentTag !== zone){
                    index = 0;
                    currentTag = zone;
                }
                if(objectId == $(this).attr('data-studio-components-objectid')&& trackingZone == $(this).attr('data-studio-zone-tracking')){
                    if(dropName == $(this).attr('data-studio-components-target')){
                        conRepeat++;
                    }
                    if( compTracking == $(this).parents('[data-studio-component-path]').attr('data-studio-tracking-number')) {
                        var $el = $(this),
                            zoneName = $el.attr('data-studio-components-target');
                        zones[zoneName] = [];
                        $el.find('> [data-studio-component]').each(function (i, el) {
                            var $comp = $(this);
                            zones[zoneName].push($comp.data('model') || tracking);
                        });
                    }
                    if(zone.indexOf('.') > 0){
                        if(currentTag !== zone){
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
                conComp: (conRepeat > 1) ? true : false
            });

        });
    }

    function publish(topic, message, com) {
        if (com = this.cfg('communicator')) {
            com.publish(topic, message);
        }
    }

});