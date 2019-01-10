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

define('guest', ['crafter', 'jquery', 'communicator', 'ice-overlay', 'dnd-controller', 'pointer-controller', 'cache'], function (crafter, $, Communicator, ICEOverlay, DnDController, PointerController, Cache) {
    'use strict';

    $.noConflict(true);

    if (!window.location.origin) {
        window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
    }

    var Topics = crafter.studio.preview.Topics;
    var Constants = {
        TIME_RESIZE: 500 ,
        TIME_SCROLL: 250
    }
    var communicator, origin;

    var count = 0,
        overlay = new ICEOverlay(),
        $document = $(document),
        $window = $(window),
        dndController, pointerControllerVar;

    function init(config){
        origin = config.hostOrigin; // 'http://127.0.0.1:8080';
        communicator = new Communicator({window: window.parent, origin: origin}, origin);

        // When the page has successfully loaded, notify the host window of it's readiness
        communicator.publish(Topics.GUEST_SITE_LOAD, {
            location: window.location.href,
            url: window.location.href.replace(window.location.origin, '')
        });

        function loadCss(url) {
            var link = document.createElement("link");
            link.type = "text/css";
            link.rel = "stylesheet";
            link.href = url;
            document.getElementsByTagName("head")[0].appendChild(link);
        }
        communicator.on(Topics.START_DRAG_AND_DROP, function (message) {
            require(['dnd-controller'], function (DnDController) {

                (typeof dndController === 'undefined') && (dndController = new DnDController({
                    communicator: communicator
                }));

                dndController.start(message.components, message.contentModel, message.browse);

                var translation = message.translation;
                var elements = $('[data-translation]');
                elements.each(function() {
                    if($( this ).attr( "data-translation" ) == "done")$( this ).html(translation.done);
                    if($( this ).attr( "data-translation" ) == "components")$( this ).html(translation.components);
                    if($( this ).attr( "data-translation" ) == "addComponent")$( this ).html(translation.addComponent);
                });
            });
        });

        communicator.on(Topics.DND_COMPONENTS_PANEL_OFF, function (message) {
            require(['dnd-controller'], function (DnDController) {

                (typeof dndController === 'undefined') && (dndController = new DnDController({
                    communicator: communicator
                }));

                dndController.done();
            });
        });

        communicator.on(Topics.DND_CREATE_BROWSE_COMP, function (message) {
            require(['pointer-controller'], function (pointerController) {

                (typeof pointerControllerVar === 'undefined') && (pointerControllerVar = new pointerController({
                    communicator: communicator
                }));

                pointerControllerVar.start(message.component, message.initialContentModel);

            });
        });

        communicator.on(Topics.REFRESH_PREVIEW, function (message) {
            window.location.reload();
        })

        communicator.on(Topics.ICE_TOOLS_OFF, function (message) {
            removeICERegions();
        });

        communicator.on(Topics.ICE_TOOLS_ON, function (message) {
            initICERegions();
        });

        communicator.on(Topics.ICE_TOOLS_REGIONS, function (message) {
            var elt = document.querySelectorAll('[data-studio-ice'+message.label+'=' + message.region + ']')[0];
            if(elt) {
                elt.scrollIntoView();
                window.scrollBy(0,-150);
                window.setTimeout(function() {
                    initOverlay($(elt));
                    window.setTimeout(function() {
                        overlay.hide();
                    }, 1000);
                }, 500);
            } else {
                alert("Region " + message.region + " could not be found");
            }
        });

        function setRegionsCookie() {
            window.parent.sessionStorage.setItem("ice-tools-content", '');
            var elts = document.querySelectorAll('[data-studio-ice]'),
                regions = [];
            if (elts.length > 0) {
                for (var i = 0; i <= (elts.length) - 1; i++) {
                    regions.push({id: elts[i].getAttribute('data-studio-ice'), formId: elts[i].getAttribute('data-studio-ice'), label: elts[i].getAttribute('data-studio-ice-label')});
                }
            }

            window.parent.sessionStorage.setItem("ice-tools-content", JSON.stringify(regions));

        };

        function initICETarget(elem) {
            var $elem = $(elem);
            $elem.removeData();
            var position = $elem.offset(),
                iceRef = $elem.data('studioIce') + '-' + count++,
                path = $elem.data('studioIcePath'),
                params = {
                    path: path,
                    iceRef: iceRef,
                    position: position
                };

            $elem.attr('data-studio-ice-target', iceRef);

            communicator.publish(Topics.ICE_ZONES, params);
        }

        communicator.on(Topics.ICE_TOOLS_INDICATOR, function (message) {
            var flag = false;
            var compElement = $("[data-studio-ice-target='" + message.iceRef + "']");
            $('.studio-ice-indicator').each(function( index ) {
                if( $(this).data("studioIceTrigger") == message.iceRef){
                    flag = true;
                }
            });

            if(!flag && compElement.is(':visible')){
                var aux = $(crafter.String('<i class="studio-ice-indicator fa fa-pencil f18 icon-yellow" data-studio-ice-trigger="%@"></i>').fmt(message.iceRef)).css({
                    top: message.position.top,
                    left: message.position.left
                });
                if(message.class){
                    aux.addClass(message.class);
                }
                aux.appendTo('body');
            }

        });

        function initICERegions() {
            removeICERegions();
            var elems = document.querySelectorAll('[data-studio-ice]');

            for (var i = 0; i < elems.length; ++i) {
                initICETarget(elems[i]);
                if(elems[i].getAttribute("data-studio-ice-label")){
                    elems[i].setAttribute("data-studio-ice-label", elems[i].getAttribute("data-studio-ice-label").replace(/ /g, "__"));
                }
            }
        }

        function removeICERegions(){
            if ($('.studio-ice-indicator').length > 0) {
                $('.studio-ice-indicator').remove();
            }
        }

        function initOverlay(elt) {
            var position = elt.offset(),
                width,
                height,
                boxSizing = window.getComputedStyle(elt[0], ':before').getPropertyValue('box-sizing');

            if(boxSizing == "border-box"){
                width = elt.outerWidth();
                height = elt.outerHeight();
            }else{
                width = elt.width() - 4; // border-left-width + border-right-width = 4,
                height = elt.height() - 4; // border-top-width + border-bottom-width = 4
            }

            var props = {
                top: position.top,
                left: position.left,
                width: width,
                height: height
            };

            overlay.show(props);
        }

        $document.on('mouseover', '.studio-ice-indicator', function (e) {

            var $i = $(this),
                $e = $(crafter.String('[data-studio-ice-target="%@"]').fmt($i.data('studioIceTrigger'))),
                iceId = $e.data('studio-ice-indicator');

            initOverlay($e);

        });

        $document.on('mouseout', '.studio-ice-indicator', function (e) {
            overlay.hide();
        });

        $document.on('click', '.studio-ice-indicator', function (e) {

            var $i = $(this);
            var $e = $(crafter.String('[data-studio-ice-target="%@"]').fmt($i.data('studioIceTrigger')));
            var iceId = $e.data('studioIce');
            var icePath = $e.data('studioIcePath');

            var position = $e.offset(),
                props = {
                    top: position.top,
                    left: position.left,
                    width: $e.width(),
                    height: $e.height()
                };

            props.iceId = iceId;
            props.itemId = icePath;
            props.scrollTop = $window.scrollTop();
            props.scrollLeft = $window.scrollLeft();

            communicator.publish(Topics.ICE_ZONE_ON, props);

        });

        var timeout = null;
        function clearSetTimeout(time){
            removeICERegions();
            clearTimeout(timeout);
            timeout = setTimeout(resizeProcess, time);
        }

        function resizeProcess() {
            //console.log('resizeFun');
            communicator.publish(Topics.IS_REVIEWER, true);
        }

        communicator.on(Topics.RESIZE_ICE_REGIONS, function (message) {
            if (!!(window.parent.sessionStorage.getItem('ice-on'))  && window.parent.sessionStorage.getItem('components-on') != 'true') {
                initICERegions();
            }
        });

        window.studioICERepaint = function() {
            clearSetTimeout(Constants.TIME_RESIZE);
        }

        $(window).resize(function(e) {
            clearSetTimeout(Constants.TIME_RESIZE);
        });

        $('window, *').scroll(function(e) {
            clearSetTimeout(Constants.TIME_SCROLL);
        });

       var pathGuest = crafter.join(config.studioContext, config.studioStaticAssets, 'styles', 'guest.css');
        loadCss(config.hostOrigin + '/' + pathGuest);
       var pathFontAwesome = crafter.join(config.studioContext, config.studioStaticAssets, 'themes', 'cstudioTheme', 'css', 'font-awesome.min.css');
        if (!$("link[href*='font-awesome']").length)
            loadCss(config.hostOrigin + '/' + pathFontAwesome);

        communicator.publish(Topics.IS_REVIEWER);

        communicator.on(Topics.INIT_ICE_REGIONS, function (message) {
            if (!!(window.parent.sessionStorage.getItem('ice-on')) && window.parent.sessionStorage.getItem('components-on') != 'true') {
                initICERegions();
            }
        });

        setRegionsCookie();
        if(window.parent.initRegCookie) window.parent.initRegCookie();
    }

    return {
        init: init
    };

});
