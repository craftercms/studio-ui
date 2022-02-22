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

DrawingBoard.Control = function(drawingBoard, opts) {
  this.board = drawingBoard;
  this.opts = $.extend({}, this.defaults, opts);

  this.$el = $(document.createElement('div')).addClass('drawing-board-control');
  if (this.name) this.$el.addClass('drawing-board-control-' + this.name);

  this.board.ev.bind('board:reset', $.proxy(this.onBoardReset, this));

  this.initialize.apply(this, arguments);
  return this;
};

DrawingBoard.Control.prototype = {
  name: '',

  defaults: {},

  initialize: function() {},

  addToBoard: function() {
    this.board.addControl(this);
  },

  onBoardReset: function(opts) {}
};

// extend directly taken from backbone.js
DrawingBoard.Control.extend = function(protoProps, staticProps) {
  var parent = this;
  var child;
  if (protoProps && protoProps.hasOwnProperty('constructor')) {
    child = protoProps.constructor;
  } else {
    child = function() {
      return parent.apply(this, arguments);
    };
  }
  $.extend(child, parent, staticProps);
  var Surrogate = function() {
    this.constructor = child;
  };
  Surrogate.prototype = parent.prototype;
  child.prototype = new Surrogate();
  if (protoProps) $.extend(child.prototype, protoProps);
  child.__super__ = parent.prototype;
  return child;
};
