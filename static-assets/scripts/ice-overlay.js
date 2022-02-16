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

crafterDefine('ice-overlay', ['crafter', 'jquery', 'animator'], function (crafter, $, Animator) {
  'use strict';

  function ICEOverlay() {
    var $overlay = $('<div class="studio-ice-overlay" style="display: none;"></div>');
    $overlay.appendTo('body');

    this.animator = new Animator($overlay);

    this.getElement = function () {
      return $overlay;
    };
  }

  ICEOverlay.prototype = {
    show: showOverlay,
    hide: hideOverlay
  };

  function showOverlay(props) {
    this.getElement().css(props);
    this.animator.fadeIn();
  }

  function hideOverlay() {
    this.animator.fadeOut();
  }

  return ICEOverlay;
});
