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

DrawingBoard.Control.Download = DrawingBoard.Control.extend({
  name: 'download',

  initialize: function() {
    this.$el.append('<button class="drawing-board-control-download-button"></button>');
    this.$el.on(
      'click',
      '.drawing-board-control-download-button',
      $.proxy(function(e) {
        this.board.downloadImg();
        e.preventDefault();
      }, this)
    );
  }
});
