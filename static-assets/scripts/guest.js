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

crafterDefine('guest', ['crafter', 'jquery', 'communicator', 'ice-overlay'], function(
  crafter,
  $,
  Communicator,
  ICEOverlay
) {
  'use strict';

  $.noConflict(true);

  if (!window.location.origin) {
    window.location.origin =
      window.location.protocol +
      '//' +
      window.location.hostname +
      (window.location.port ? ':' + window.location.port : '');
  }

  var Topics = crafter.studio.preview.Topics,
    Constants = { TIME_RESIZE: 500, TIME_SCROLL: 250 },
    communicator,
    origin,
    timeout = null,
    count = 0,
    overlay = new ICEOverlay(),
    $document = $(document),
    $window = $(window),
    dndController,
    pointerControllerVar,
    iceToolsOn = false,
    dndOn = false;

  window.studioICERepaint = iceRepaint;

  return {
    init: init,
    iceRepaint: iceRepaint,
    repaintPencils: repaintPencils,
    reportNavigation: reportNavigation
  };

  function reportNavigation(location, url) {
    communicator && communicator.publish(Topics.GUEST_SITE_URL_CHANGE, { location, url });
  }

  function init(config) {
    if (window.parent === window) {
      return (
        console &&
        console.warn &&
        console.warn(
          "[Crafter CMS] Host is not running inside of Studio as it's parent window. " +
            'ICE mechanics will be disabled. Configure your authoring Environment to point to ' +
            `'${window.origin}' if you wish to enable In Context Editing.`
        )
      );
    }

    origin = config.hostOrigin;

    communicator = new Communicator(
      {
        window: window.parent,
        origin
      },
      origin
    );

    communicator.on(Topics.START_DRAG_AND_DROP, function(message) {
      dndOn = true;
      crafterRequire(['dnd-controller'], function(DnDController) {
        typeof dndController === 'undefined' &&
          (dndController = new DnDController({
            communicator: communicator
          }));

        dndController.start(message.components, message.contentModel, message.browse);

        var translation = message.translation;
        var elements = $('[data-translation]');
        elements.each(function() {
          var translationAttr = $(this).attr('data-translation');
          if (translationAttr == 'done') {
            $(this).html(translation.done);
          }
          if (translationAttr == 'components') {
            $(this).html(translation.components);
          }
          if (translationAttr == 'addComponent') {
            $(this).html(translation.addComponent);
          }
        });
      });
    });

    communicator.on(Topics.DND_COMPONENTS_PANEL_OFF, function(message) {
      crafterRequire(['dnd-controller'], function(DnDController) {
        typeof dndController === 'undefined' &&
          (dndController = new DnDController({
            communicator: communicator
          }));

        dndController.done();
      });
    });

    communicator.on(Topics.DND_CREATE_BROWSE_COMP, function(message) {
      crafterRequire(['pointer-controller'], function(pointerController) {
        typeof pointerControllerVar === 'undefined' &&
          (pointerControllerVar = new pointerController({
            communicator: communicator
          }));

        pointerControllerVar.start(message.component, message.initialContentModel);
      });
    });

    communicator.on(Topics.REFRESH_PREVIEW, function() {
      window.location.reload();
    });

    communicator.on('RELOAD_REQUEST', function() {
      window.location.reload();
    });

    function iceToolsToggle(on) {
      iceToolsOn = Boolean(on);
      if (on && !dndOn) {
        initICERegions();
      } else {
        removeICERegions();
      }
    }

    // Enable pencils, calls an event that renders the pencils (visual, no model in between)
    communicator.on('EDIT_MODE_CHANGED', (message) => iceToolsToggle(message.editMode));
    communicator.on(Topics.ICE_TOOLS_OFF, () => iceToolsToggle(false));
    communicator.on(Topics.ICE_TOOLS_ON, () => iceToolsToggle(true));
    communicator.on('DRAG_AND_DROP_COMPONENTS_PANEL_CLOSED', () => {
      dndOn = false;
    });

    communicator.on(Topics.REPAINT_PENCILS, repaintPencils);

    communicator.on(Topics.ICE_TOOLS_REGIONS, function(message) {
      var elt = document.querySelectorAll('[data-studio-ice' + message.label + '="' + message.region + '"]')[0];
      if (!elt) {
        elt = document.querySelectorAll(
          '[data-studio-ice' + message.label + '="' + message.region.replace(/ /g, '__') + '"]'
        )[0];
      }
      if (elt) {
        elt.scrollIntoView();
        window.scrollBy(0, -150);
        window.setTimeout(function() {
          initOverlay($(elt));
          window.setTimeout(function() {
            overlay.hide();
          }, 1000);
        }, 500);
      } else {
        alert('Region ' + message.region + ' could not be found');
      }
    });

    communicator.on(Topics.INIT_ICE_REGIONS, initIceRegions_resizeIceRegions_handler);

    communicator.on(Topics.RESIZE_ICE_REGIONS, initIceRegions_resizeIceRegions_handler);

    communicator.on(Topics.CHANGE_GUEST_REQUEST, (params) => {
      const locationOrigin = window.location.origin;
      if (window.location.href.replace(locationOrigin, '') !== params.url) {
        window.location.href = `${locationOrigin}${params.url}`;
      }
    });

    // When the page has successfully loaded, notify the host window of it's readiness
    communicator.publish(Topics.GUEST_SITE_LOAD, {
      location: {
        hash: window.location.hash,
        host: window.location.host,
        hostname: window.location.hostname,
        href: window.location.href,
        origin: window.location.origin,
        pathname: window.location.pathname,
        port: window.location.port,
        protocol: window.location.protocol,
        search: window.location.search
      },
      url: window.location.href.replace(window.location.origin, '')
    });

    communicator.publish(Topics.IS_REVIEWER);

    // ICE zone highlighting on hover
    $document
      .on('mouseover', '.studio-ice-indicator', function() {
        var $i = $(this),
          $e = $(crafter.String('[data-studio-ice-target="%@"]').fmt($i.data('studioIceTrigger')));
        initOverlay($e);
      })
      .on('mouseout', '.studio-ice-indicator', function() {
        overlay.hide();
      });

    // Event on pencil click, publishes ICE_ZONE_ON, which opens the form
    $document.on('click', '.studio-ice-indicator', function(e) {
      let pencilClasses = 'fa-pencil icon-yellow';
      let spinnerClases = 'fa-spinner fa-spin icon-default';

      if ($(e.target).hasClass(spinnerClases)) return false;

      $(e.target).removeClass(pencilClasses);
      $(e.target).addClass(spinnerClases);

      setTimeout(function() {
        $(e.target).removeClass(spinnerClases);
        $(e.target).addClass(pencilClasses);
      }, 4000);

      var $i = $(this);
      var $e = $(crafter.String('[data-studio-ice-target="%@"]').fmt($i.data('studioIceTrigger')));
      var iceId = $e.data('studioIce');
      var icePath = $e.data('studioIcePath');
      var iceEmbeddedItemId = $e.data('studioEmbeddedItemId');

      var position = $e.offset(),
        props = {
          top: position.top,
          left: position.left,
          width: $e.width(),
          height: $e.height()
        };

      props.iceId = iceId;
      props.itemId = icePath;
      props.embeddedItemId = iceEmbeddedItemId;
      props.scrollTop = $window.scrollTop();
      props.scrollLeft = $window.scrollLeft();

      communicator.publish(Topics.ICE_ZONE_ON, props);
    });

    // Toggle edit mode on UI4
    $document.on('keypress', function(e) {
      if (e.key.toLowerCase() === 'e') {
        communicator.publish('EDIT_MODE_TOGGLE_HOTKEY');
      }
    });

    $(window).resize(function(e) {
      clearSetTimeout(Constants.TIME_RESIZE);
    });

    $('window, *').scroll(function(e) {
      clearSetTimeout(Constants.TIME_SCROLL);
    });

    $(window).on('beforeunload', function() {
      communicator.publish(Topics.GUEST_CHECKOUT);
    });

    loadCss(
      config.hostOrigin + crafter.join('/', config.studioContext, config.studioStaticAssets, 'styles', 'guest.css')
    );

    if (!$("link[href*='font-awesome']").length) {
      loadCss(
        config.hostOrigin +
          crafter.join(
            '/',
            config.studioContext,
            config.studioStaticAssets,
            'themes',
            'cstudioTheme',
            'css',
            'font-awesome.min.css'
          )
      );
    }

    setRegionsCookie();
  }

  function iceRepaint() {
    clearSetTimeout(Constants.TIME_RESIZE);
  }

  function initIceRegions_resizeIceRegions_handler(message) {
    if (!message) {
      iceToolsOn && !dndOn && initICERegions();
    } else {
      iceToolsOn = !!message.iceOn && !dndOn;
      if (
        // TODO: REFACTOR
        // !!(window.parent.sessionStorage.getItem('ice-on')) &&
        // window.parent.sessionStorage.getItem('components-on') != 'true'
        iceToolsOn
      ) {
        initICERegions();
      }
    }
  }

  function loadCss(url) {
    var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = url;
    document.getElementsByTagName('head')[0].appendChild(link);
  }

  function setRegionsCookie() {
    var elts = document.querySelectorAll('[data-studio-ice]'),
      regions = [];
    if (elts.length > 0) {
      for (var i = 0; i <= elts.length - 1; i++) {
        regions.push({
          id: elts[i].getAttribute('data-studio-ice'),
          formId: elts[i].getAttribute('data-studio-ice'),
          label: elts[i].getAttribute('data-studio-ice-label')
        });
      }
    }

    communicator.publish(Topics.RESET_ICE_TOOLS_CONTENT, JSON.stringify(regions));
  }

  // Rendering of a single pencil based on an element
  function renderICESection(elem) {
    const $elem = $(elem),
      position = $elem.offset(),
      iceRef = $elem.data('studioIce') + '-' + count++;

    $elem.attr('data-studio-ice-target', iceRef);

    let flag = false;
    const compElement = $("[data-studio-ice-target='" + iceRef + "']");
    // if element exists -> set flag true to avoid re-rendering
    $('.studio-ice-indicator').each(function() {
      if ($(this).data('studioIceTrigger') == iceRef) {
        flag = true;
      }
    });

    if (!flag && compElement.is(':visible')) {
      const aux = $(
        crafter
          .String('<i class="studio-ice-indicator fa fa-pencil f18 icon-yellow" data-studio-ice-trigger="%@"></i>')
          .fmt(iceRef)
      ).css({
        top: position.top,
        left: position.left
      });
      aux.appendTo('body');
    }
  }

  // Rendering of the pencils, no model involved at this moment
  function initICERegions() {
    removeICERegions();
    var elems = document.querySelectorAll('[data-studio-ice]');

    for (var i = 0; i < elems.length; ++i) {
      // Renders a single pencil based on the element's props.
      renderICESection(elems[i]);

      if (elems[i].getAttribute('data-studio-ice-label')) {
        elems[i].setAttribute(
          'data-studio-ice-label',
          elems[i].getAttribute('data-studio-ice-label').replace(/ /g, '__')
        );
      }
    }
  }

  function removeICERegions() {
    if ($('.studio-ice-indicator').length > 0) {
      $('.studio-ice-indicator').remove();
    }
  }

  function repaintPencils() {
    if (iceToolsOn && !dndOn) {
      initICERegions();
    }
  }

  function initOverlay(elt) {
    var position = elt.offset(),
      width,
      height,
      boxSizing = window.getComputedStyle(elt[0], ':before').getPropertyValue('box-sizing');

    if (boxSizing == 'border-box') {
      width = elt.outerWidth();
      height = elt.outerHeight();
    } else {
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

  function clearSetTimeout(time) {
    removeICERegions();
    clearTimeout(timeout);
    timeout = setTimeout(resizeProcess, time);
  }

  function resizeProcess() {
    // When window.top == window, communicator is not initialized
    communicator && communicator.publish(Topics.IS_REVIEWER, true);
  }
});
