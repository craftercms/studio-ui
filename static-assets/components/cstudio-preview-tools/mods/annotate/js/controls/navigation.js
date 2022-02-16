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

DrawingBoard.Control.Navigation = DrawingBoard.Control.extend({
  name: 'navigation',

  defaults: {
    back: true,
    forward: true,
    reset: true
  },

  initialize: function() {
    var el = '';
    if (this.opts.back) el += '<button class="drawing-board-control-navigation-back">&larr;</button>';
    if (this.opts.forward) el += '<button class="drawing-board-control-navigation-forward">&rarr;</button>';
    if (this.opts.reset) el += '<button class="drawing-board-control-navigation-reset">&times;</button>';
    this.$el.append(el);

    if (this.opts.back) {
      var $back = this.$el.find('.drawing-board-control-navigation-back');
      this.board.ev.bind(
        'historyNavigation',
        $.proxy(function(pos) {
          if (pos === 1) $back.attr('disabled', 'disabled');
          else $back.removeAttr('disabled');
        }, this)
      );
      this.$el.on(
        'click',
        '.drawing-board-control-navigation-back',
        $.proxy(function(e) {
          this.board.goBackInHistory();
          e.preventDefault();
        }, this)
      );
    }

    if (this.opts.forward) {
      var $forward = this.$el.find('.drawing-board-control-navigation-forward');
      this.board.ev.bind(
        'historyNavigation',
        $.proxy(function(pos) {
          if (pos === this.board.history.values.length) $forward.attr('disabled', 'disabled');
          else $forward.removeAttr('disabled');
        }, this)
      );
      this.$el.on(
        'click',
        '.drawing-board-control-navigation-forward',
        $.proxy(function(e) {
          this.board.goForthInHistory();
          e.preventDefault();
        }, this)
      );
    }

    if (this.opts.reset) {
      this.$el.on(
        'click',
        '.drawing-board-control-navigation-reset',
        $.proxy(function(e) {
          this.board.reset({ background: true });
          e.preventDefault();
        }, this)
      );
    }
  }
});
