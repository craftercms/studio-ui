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
 * editor tools
 */
CStudioAuthoring.MediumPanel = CStudioAuthoring.MediumPanel || {
  channels: [],

  $container: null,

  initialized: false,

  /**
   * initialize module
   */
  initialize: function (config) {
    if (this.initialized === false) {
      this.initialized = true;
    }
  },

  render: function (containerEl, config) {
    var me = this,
      $select,
      $engine = $('#engineWindow'),
      $container = $(containerEl);

    var channels = [];
    if (config.config.channels.channel && config.config.channels.channel.length) {
      channels = config.config.channels.channel;
    } else {
      channels = config.config.channels.channel ? [config.config.channels.channel] : [];
    }

    $container
      .addClass('studio-view')
      .append(
        [
          '<div class="form-group">',
          '<label class="display-block">' + CMgs.format(previewLangBundle, 'viewPortSize') + '</label> ',
          '<input class="form-control channel-width" data-axis="x" placeholder="auto">',
          ' &times; ',
          '<input class="form-control channel-height" data-axis="y" placeholder="auto"> ',
          '<a class="flip"><i class="glyphicon glyphicon-refresh" title="Flip dimensions"></i></a>',
          '</div>',
          '<div>',
          '<label>' + CMgs.format(previewLangBundle, 'presets') + '</label> ',
          '<select class="form-control"></select>',
          '</div>'
        ].join('')
      );

    $select = $container.find('select');

    $select[0].options[0] = new Option(CMgs.format(previewLangBundle, 'custom'), 'custom', false, false);

    for (var i = 0, label; i < channels.length; i++) {
      label = CMgs.format(previewLangBundle, channels[i].title);
      $select[0].options[i + 1] = new Option(label, channels[i].value);
    }

    $select[0].options[1].selected = true;

    $select.change(function () {
      var preset = $(this).val();
      me.presetSelected(preset);
    });

    var timeout, currentValue;

    $container.find('input').keyup(function (e) {
      var $el = $(e.currentTarget),
        value = $el.val(),
        number = parseInt(value);

      currentValue = $el.hasClass('channel-height') ? $('#engineWindow').height() : $('#engineWindow').width();

      if (currentValue != value) {
        clearTimeout(timeout);
        timeout = setTimeout(function () {
          if (value === '' || value === 'auto') {
            $el.val('');
            $el.data('rollback', '');
            me.update();
          } else if (isNaN(value)) {
            if (number != $el.val()) {
              $el.val(number);
              $el.data('rollback', number);
            }
          } else {
            $el.val(number);
            $el.data('rollback', number);
            me.update();
          }
        }, 500);
      }
    });

    $container.find('a.flip').click(function () {
      var $inputs = me.$container.find('input'),
        $width = $inputs.filter('[data-axis="x"]'),
        $height = $inputs.filter('[data-axis="y"]'),
        width = $width.val(),
        height = $height.val();
      $width.val(height);
      $height.val(width);
      me.update();
    });

    this.channels = channels;
    this.$container = $container;
  },

  update: function () {
    var $body = $('body'),
      $engine = $('#engineWindow'),
      $studioPreview = $('.studio-preview'),
      $inputs = this.$container.find('input'),
      width = $inputs.filter('[data-axis="x"]').val() || 'auto',
      height = $inputs.filter('[data-axis="y"]').val() || 'auto',
      studioPreviewHeight,
      orientation,
      devicePreview = false;

    $body.removeClass('studio-device-preview-portrait studio-device-preview-landscape');

    //var location = $engine[0].src;
    var page = CStudioAuthoring.Utils.getQueryVariable(window.location.href, 'page');
    var location = CStudioAuthoringContext.previewAppBaseUri + page;

    var t;
    if (location.indexOf('?cstudio-useragent') > 0) {
      t = '?';
    } else {
      t = location.indexOf('?') == -1 ? '?' : '&';
    }

    if (location.indexOf('cstudio-useragent') == -1) {
      location += t + 'cstudio-useragent=' + CStudioAuthoringContext.channel;
    } else {
      var re = new RegExp('[\\?&]cstudio-useragent=([^&#]*)');
      location = location.replace(re, t + 'cstudio-useragent' + '=' + CStudioAuthoringContext.channel);
    }

    $engine[0].src = location;

    if (width !== 'auto') {
      width = parseInt(width);
    }

    if (height !== 'auto') {
      height = parseInt(height);
    } else {
      studioPreviewHeight = 'auto';
    }

    if (width !== 'auto' && height !== 'auto') {
      orientation = width < height ? 'portrait' : 'landscape';
      $body.addClass('studio-device-preview-' + orientation);
      devicePreview = true;

      //used box-sixing set to content-box, so border is not a part of width and height
      if (
        (orientation === 'portrait' && CStudioAuthoringContext.channel === 'ipad') ||
        CStudioAuthoringContext.channel === 'browser'
      ) {
        $engine.css('margin', '0 auto');
      } else {
        $engine.css('margin', 'auto');
      }
    }

    $engine.width(width === 'auto' || width === '' ? '' : parseInt(width));

    $engine.height(height === 'auto' || height === '' ? '' : parseInt(height));

    var topPosition = 0;

    if (devicePreview) {
      var containerHeight = $engine.parent().height(),
        engineHeight = parseInt(height) + 100; //w/border

      if (containerHeight > engineHeight) {
        topPosition = (containerHeight - engineHeight) / 2;
        topPosition = parseInt(topPosition);
      }
    }

    $engine.css('top', topPosition);
  },

  presetSelected: function (value) {
    var $window = $(window);
    switch (value) {
      case 'custom':
        this.$container
          .find('input')
          .filter('[data-axis="y"]')
          .val($window.height() - 150)
          .end()
          .filter('[data-axis="x"]')
          .val(parseInt($window.width() * 0.8))
          .select();
        break;
      default: {
        var channel;

        this.channels.forEach(function (item) {
          if (item.value === value) channel = item;
        });

        CStudioAuthoringContext.channel = value;

        this.$container
          .find('input')
          .filter('[data-axis="x"]')
          .val(channel.width)
          .end()
          .filter('[data-axis="y"]')
          .val(channel.height);
      }
    }
    this.update();
  }
};

CStudioAuthoring.Module.moduleLoaded('medium-panel', CStudioAuthoring.MediumPanel);
